<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Whitelist HTML sanitizer for the rich-text editor (news body and any other long text).
 * Allowed: text formatting, headings, lists, tables, links, images / figures, responsive galleries,
 * callout boxes, buttons, <video> from our own storage and <iframe> embeds from YouTube / Vimeo only.
 * Everything else is unwrapped (unknown tags) or dropped with its content (script, style, object ...).
 */
class HtmlSanitizer
{
    /** tag => allowed extra attributes (global: class, style, dir) */
    private const TAGS = [
        'p' => [], 'br' => [], 'h2' => [], 'h3' => [], 'h4' => [],
        'strong' => [], 'b' => [], 'em' => [], 'i' => [], 'u' => [], 's' => [], 'strike' => [], 'del' => [], 'ins' => [],
        'mark' => [], 'sub' => [], 'sup' => [], 'small' => [], 'span' => [], 'div' => [], 'pre' => [], 'code' => [],
        'blockquote' => [], 'ul' => [], 'ol' => ['start'], 'li' => [], 'hr' => [],
        'a' => ['href', 'target', 'rel', 'title'],
        'img' => ['src', 'alt', 'title', 'width', 'height', 'loading'],
        'figure' => [], 'figcaption' => [],
        'table' => [], 'thead' => [], 'tbody' => [], 'tfoot' => [], 'tr' => [], 'caption' => [],
        'th' => ['colspan', 'rowspan', 'scope'], 'td' => ['colspan', 'rowspan'],
        'iframe' => ['src', 'title', 'allowfullscreen', 'loading'],
        'video' => ['src', 'controls', 'poster', 'preload', 'width', 'height'],
        'source' => ['src', 'type'],
    ];

    /** removed together with everything inside */
    private const DROP = [
        'script', 'style', 'object', 'embed', 'applet', 'link', 'meta', 'base', 'form', 'input', 'button', 'textarea',
        'select', 'option', 'noscript', 'svg', 'math', 'frame', 'frameset', 'head', 'title', 'template', 'canvas', 'audio',
    ];

    private const RENAME = ['h1' => 'h2', 'h5' => 'h4', 'h6' => 'h4'];

    private const EMBED_HOSTS = [
        'www.youtube.com' => '#^/embed/[A-Za-z0-9_-]{6,20}$#',
        'youtube.com' => '#^/embed/[A-Za-z0-9_-]{6,20}$#',
        'www.youtube-nocookie.com' => '#^/embed/[A-Za-z0-9_-]{6,20}$#',
        'youtube-nocookie.com' => '#^/embed/[A-Za-z0-9_-]{6,20}$#',
        'player.vimeo.com' => '#^/video/\d{4,14}$#',
    ];

    public static function clean(?string $html): string
    {
        $html = (string) $html;
        if (trim($html) === '') {
            return '';
        }
        $html = str_replace("\0", '', $html);
        $prev = libxml_use_internal_errors(true);
        $doc = new DOMDocument('1.0', 'UTF-8');
        $doc->loadHTML('<?xml encoding="UTF-8"><div id="__ed_root">'.$html.'</div>', LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($prev);

        $root = $doc->getElementById('__ed_root');
        if (! $root) {
            $root = $doc->getElementsByTagName('div')->item(0);
        }
        if (! $root) {
            return trim(strip_tags($html));
        }
        self::walk($root);
        $out = '';
        foreach (iterator_to_array($root->childNodes) as $child) {
            $out .= $doc->saveHTML($child);
        }
        $out = trim($out);

        return $out;
    }

    private static function walk(DOMNode $parent): void
    {
        foreach (iterator_to_array($parent->childNodes) as $node) {
            if ($node->nodeType === XML_COMMENT_NODE || $node->nodeType === XML_PI_NODE || $node->nodeType === XML_CDATA_SECTION_NODE) {
                $parent->removeChild($node);

                continue;
            }
            if (! ($node instanceof DOMElement)) {
                continue;
            }
            $tag = strtolower($node->tagName);
            if (str_contains($tag, ':')) {
                $tag = 'x-'.$tag; // Word's <o:p> and friends are unwrapped below
            }
            if (in_array($tag, self::DROP, true)) {
                $parent->removeChild($node);

                continue;
            }
            if (isset(self::RENAME[$tag])) {
                $node = self::rename($node, self::RENAME[$tag]);
                $tag = strtolower($node->tagName);
            }
            if (! array_key_exists($tag, self::TAGS)) {
                self::walk($node);
                while ($node->firstChild) {
                    $parent->insertBefore($node->firstChild, $node);
                }
                $parent->removeChild($node);

                continue;
            }
            self::attributes($node, $tag);
            if (! self::validTag($node, $tag)) {
                $parent->removeChild($node);

                continue;
            }
            self::walk($node);
            if ($tag === 'a' && ! $node->hasAttribute('href')) {
                while ($node->firstChild) {
                    $parent->insertBefore($node->firstChild, $node);
                }
                $parent->removeChild($node); // a link whose URL was not allowed keeps its text only

                continue;
            }
            if ($tag === 'video' && ! $node->hasAttribute('src') && $node->getElementsByTagName('source')->length === 0) {
                $parent->removeChild($node);

                continue;
            }
            if ($tag === 'p' && ! $node->hasChildNodes() && ! $node->hasAttributes()) {
                $parent->removeChild($node); // <p></p> left behind by the editor
            }
        }
    }

    private static function rename(DOMElement $el, string $to): DOMElement
    {
        $new = $el->ownerDocument->createElement($to);
        while ($el->firstChild) {
            $new->appendChild($el->firstChild);
        }
        $el->parentNode->replaceChild($new, $el);

        return $new;
    }

    private static function attributes(DOMElement $el, string $tag): void
    {
        $allowed = array_merge(['class', 'style', 'dir'], self::TAGS[$tag]);
        foreach (iterator_to_array($el->attributes) as $attr) {
            $name = strtolower($attr->nodeName);
            $val = (string) $attr->nodeValue;
            if (! in_array($name, $allowed, true)) {
                $el->removeAttribute($attr->nodeName);

                continue;
            }
            $clean = match ($name) {
                'class' => self::classes($val),
                'style' => self::style($val),
                'dir' => in_array(strtolower($val), ['rtl', 'ltr', 'auto'], true) ? strtolower($val) : '',
                'href' => self::url($val, true),
                'src', 'poster' => self::url($val, false),
                'target' => $val === '_blank' ? '_blank' : '',
                'width', 'height', 'colspan', 'rowspan', 'start' => preg_match('/^\d{1,4}$/', trim($val)) ? trim($val) : '',
                'loading' => in_array($val, ['lazy', 'eager'], true) ? $val : '',
                'preload' => in_array($val, ['none', 'metadata', 'auto'], true) ? $val : '',
                'scope' => in_array($val, ['row', 'col'], true) ? $val : '',
                'type' => in_array($val, ['video/mp4', 'video/webm', 'video/ogg'], true) ? $val : '',
                'controls', 'allowfullscreen' => $name,
                'rel' => '',
                default => mb_substr(trim(strip_tags($val)), 0, 500), // alt, title
            };
            if ($clean === '' || $clean === null) {
                $el->removeAttribute($attr->nodeName);
            } elseif ($clean !== $val) {
                $el->setAttribute($attr->nodeName, $clean);
            }
        }
        if ($tag === 'a' && $el->getAttribute('target') === '_blank') {
            $el->setAttribute('rel', 'noopener noreferrer');
        }
        if ($tag === 'img' && ! $el->hasAttribute('loading')) {
            $el->setAttribute('loading', 'lazy');
        }
        if ($tag === 'iframe') {
            $el->setAttribute('loading', 'lazy');
            $el->setAttribute('allow', 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen');
            $el->setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        }
    }

    /** Extra checks that make a whole element invalid (the element is then dropped). */
    private static function validTag(DOMElement $el, string $tag): bool
    {
        if ($tag === 'iframe') {
            $src = $el->getAttribute('src');
            $p = parse_url($src);
            if (! $p || ($p['scheme'] ?? '') !== 'https' || empty($p['host']) || isset($p['user']) || isset($p['port'])) {
                return false;
            }
            $host = strtolower($p['host']);
            if (! isset(self::EMBED_HOSTS[$host]) || ! preg_match(self::EMBED_HOSTS[$host], $p['path'] ?? '')) {
                return false;
            }
            // only the known harmless query keys survive
            $el->setAttribute('src', 'https://'.$host.$p['path'].(self::embedQuery($p['query'] ?? '')));
        }
        if ($tag === 'img' && $el->getAttribute('src') === '') {
            return false;
        }
        if ($tag === 'video' || $tag === 'source') {
            // a video needs a source; <source> likewise
            if ($tag === 'source' && $el->getAttribute('src') === '') {
                return false;
            }
        }

        return true;
    }

    private static function embedQuery(string $query): string
    {
        if ($query === '') {
            return '';
        }
        parse_str($query, $q);
        $keep = [];
        foreach (['start', 'rel', 'controls', 'autoplay', 'mute', 'loop'] as $k) {
            if (isset($q[$k]) && is_scalar($q[$k]) && preg_match('/^\d{1,6}$/', (string) $q[$k])) {
                $keep[$k] = (string) $q[$k];
            }
        }

        return $keep ? '?'.http_build_query($keep) : '';
    }

    private static function classes(string $v): string
    {
        $out = [];
        foreach (preg_split('/\s+/', trim($v)) ?: [] as $c) {
            if (preg_match('/^ed-[a-z0-9_-]{1,40}$/', $c)) {
                $out[] = $c;
            }
        }

        return implode(' ', array_unique($out));
    }

    private static function style(string $v): string
    {
        $out = [];
        foreach (explode(';', $v) as $decl) {
            if (! str_contains($decl, ':')) {
                continue;
            }
            [$prop, $val] = array_map('trim', explode(':', $decl, 2));
            $prop = strtolower($prop);
            $val = trim(preg_replace('/\s*!important\s*$/i', '', $val));
            $lv = strtolower($val);
            if ($val === '' || preg_match('/(url\s*\(|expression|javascript|@import|[<>\\\\])/i', $val)) {
                continue;
            }
            $color = '/^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*(,\s*[\d.]+\s*){2,3}\)|[a-z]{3,20}|transparent)$/i';
            $length = '/^\d{1,3}(\.\d{1,2})?(px|em|rem|%)$/';
            $ok = match ($prop) {
                'color', 'background-color' => (bool) preg_match($color, $val),
                'font-size' => in_array($lv, ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xxx-large', 'smaller', 'larger'], true) || (bool) preg_match($length, $lv),
                'text-align' => in_array($lv, ['left', 'right', 'center', 'justify', 'start', 'end'], true),
                'direction' => in_array($lv, ['rtl', 'ltr'], true),
                'padding-inline-start', 'margin-inline-start', 'padding-right', 'padding-left', 'margin-right', 'margin-left' => (bool) preg_match($length, $lv),
                'width' => (bool) preg_match('/^\d{1,3}(\.\d{1,2})?(%|px)$/', $lv),
                'font-weight' => (bool) preg_match('/^(normal|bold|[1-9]00)$/', $lv),
                'font-style' => in_array($lv, ['normal', 'italic'], true),
                'text-decoration', 'text-decoration-line' => in_array($lv, ['none', 'underline', 'line-through', 'underline line-through', 'line-through underline'], true),
                default => false,
            };
            if ($ok) {
                $out[$prop] = $val;
            }
        }
        $s = '';
        foreach ($out as $p => $v) {
            $s .= $p.': '.$v.'; ';
        }

        return trim($s);
    }

    private static function url(string $v, bool $link): string
    {
        $v = trim(preg_replace('/[\x00-\x1F\x7F\s]+/u', '', $v) ?? '');
        if ($v === '' || strlen($v) > 2000) {
            return '';
        }
        if ($link) {
            if (preg_match('#^(https?://|mailto:|tel:|/(?!/)|\#)#i', $v)) {
                return $v;
            }

            return '';
        }

        return preg_match('#^(https?://|/(?!/))#i', $v) ? $v : '';
    }
}
