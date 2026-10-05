<?php

namespace App\Support;

use App\Models\MediaFile;
use App\Models\Setting;
use Illuminate\Support\HtmlString;

/**
 * «نصوص الموقع» (control panel) -> the fixed texts of the public pages that used to be hard-coded in the Blade views:
 * ركائز الإغاثة (cards), صفحة المشاريع والبرامج, صفحة «من نحن», نموذج التواصل والخريطة.
 *
 * Stored as ONE settings row `site.texts` = {"text":{key:value},"lists":{listKey:[items]}} and ONLY the differences from the
 * built-in defaults are kept (SiteTextsRegistry = the original texts), so a missing / empty row renders exactly the original HTML.
 * Same approach as HomeSections (home page, Batches 1-2). Every value is plain text and is HTML-escaped when printed.
 */
class SiteTexts
{
    public const KEY = 'site.texts';

    private static ?array $cache = null;

    // ------------------------------------------------------------------ storage

    /** @return array{text: array<string,string>, lists: array<string,array<int,array<string,mixed>>>} */
    public static function load(bool $fresh = false): array
    {
        if (self::$cache !== null && ! $fresh) {
            return self::$cache;
        }
        $stored = [];
        try {
            $raw = Setting::query()->where('key', self::KEY)->value('value');
            if (is_string($raw) && $raw !== '') {
                $j = json_decode($raw, true);
                $stored = is_array($j) ? $j : [];
            }
        } catch (\Throwable $e) {
            $stored = []; // table missing / DB down: the original pages
        }

        return self::$cache = self::normalize($stored);
    }

    public static function forget(): void
    {
        self::$cache = null;
    }

    public static function exists(): bool
    {
        try {
            return Setting::query()->where('key', self::KEY)->exists();
        } catch (\Throwable $e) {
            return false;
        }
    }

    // ------------------------------------------------------------------ normalisation (lenient: used for reading AND before saving)

    /** Clean a stored / submitted structure. Unknown keys dropped, values cleaned, defaults not stored. */
    public static function normalize(array $in): array
    {
        $text = [];
        foreach ((array) ($in['text'] ?? []) as $key => $val) {
            $f = is_string($key) ? (SiteTextsRegistry::FIELDS[$key] ?? null) : null;
            if (! $f || ! is_string($val)) {
                continue;
            }
            $v = self::cleanValue($f, $val);
            if ($v === null || ($v === '' && ! $f['optional'])) {
                continue;
            }
            if ($v !== $f['default']) {
                $text[$key] = $v;
            }
        }
        $lists = [];
        foreach ((array) ($in['lists'] ?? []) as $key => $items) {
            $spec = is_string($key) ? (SiteTextsRegistry::LISTS[$key] ?? null) : null;
            if (! $spec || ! is_array($items)) {
                continue;
            }
            $clean = self::cleanItems($key, $spec, array_values($items));
            if ($clean !== null && $clean !== self::defaultItems($key)) {
                $lists[$key] = $clean;
            }
        }

        return ['text' => $text, 'lists' => $lists];
    }

    /** One field value, cleaned by type. null = not usable (invalid). '' is returned for an empty value. */
    private static function cleanValue(array $f, string $v): ?string
    {
        switch ($f['type']) {
            case 'url':
                $v = trim($v);

                return $v === '' ? '' : (self::validUrl($v, (int) $f['max']) ? $v : null);
            case 'embed':
                return self::cleanEmbed($v, (int) $f['max']);
            case 'link':
                $v = trim($v);

                return $v === '' ? '' : (self::validLink($v, (int) $f['max']) ? $v : null);
            case 'toggle':
                $v = trim($v);

                return ($v === '0' || $v === '1') ? $v : null;
            case 'image':
                $p = VisionSupport::imagePath($v);

                return ($p !== '' && VisionSupport::imageExists($p)) ? $p : null;
            default:
                $c = HomeSections::clean($v, (int) $f['max']);

                return $c;
        }
    }

    private static function validUrl(string $v, int $max): bool
    {
        if (strlen($v) > $max || preg_match('/[\s\x00-\x1F\x7F\\\\"\'<>]/', $v)) {
            return false;
        }
        if (! preg_match('#^https?://[^/?\#]+#i', $v)) {
            return false;
        }

        return filter_var($v, FILTER_VALIDATE_URL) !== false;
    }

    /**
     * Safe link for an editable button: a relative path (/news), an #anchor, an http(s) URL, mailto: or tel:.
     * Anything else (javascript:, data:, vbscript:, //host, spaces, quotes, backslashes ...) is rejected.
     */
    public static function validLink(string $v, int $max = 300): bool
    {
        if ($v === '' || strlen($v) > $max || preg_match('/[\s\x00-\x1F\x7F\\\\"\'<>`]/', $v)) {
            return false;
        }
        if ($v[0] === '#') {
            return true;
        }
        if ($v[0] === '/') {
            return ! str_starts_with($v, '//');
        }
        if (preg_match('#^https?://#i', $v)) {
            return self::validUrl($v, $max);
        }
        if (preg_match('/^mailto:[^\s@?#]+@[^\s@?#]+(\?\S*)?$/i', $v)) {
            return true;
        }

        return (bool) preg_match('/^tel:\+?[0-9][0-9().\-]{2,29}$/i', $v);
    }

    /**
     * Embedded map: accepts the pasted iframe code or the bare URL; only Google Maps / OpenStreetMap embed URLs over https.
     * Returns '' for an empty value, null when invalid.
     */
    private static function cleanEmbed(string $v, int $max): ?string
    {
        $v = trim($v);
        if ($v === '') {
            return '';
        }
        if (stripos($v, '<iframe') !== false) {
            if (! preg_match('/\bsrc\s*=\s*(["\'])(.*?)\1/is', $v, $m)) {
                return null;
            }
            $v = trim(html_entity_decode($m[2], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        }
        if (! self::validUrl($v, $max)) {
            return null;
        }
        $p = parse_url($v);
        $host = strtolower((string) ($p['host'] ?? ''));
        $path = (string) ($p['path'] ?? '');
        if (strtolower((string) ($p['scheme'] ?? '')) !== 'https' || isset($p['user']) || isset($p['port'])) {
            return null;
        }
        $ok = ($host === 'www.google.com' && str_starts_with($path, '/maps/embed'))
            || ($host === 'www.openstreetmap.org' && $path === '/export/embed.html');

        return $ok ? $v : null;
    }

    private static function validIcon(mixed $v): bool
    {
        return is_string($v) && isset(SiteTextsIcons::ALL[$v]);
    }

    public static function defaultItems(string $key): array
    {
        return array_map(fn ($it) => self::shapeItem($key, $it), SiteTextsRegistry::LISTS[$key]['items'] ?? []);
    }

    /** Keep only the editable fields (+ id, visible) in a fixed order. */
    private static function shapeItem(string $key, array $it): array
    {
        $out = ['id' => (string) $it['id'], 'visible' => (bool) ($it['visible'] ?? true)];
        foreach (SiteTextsRegistry::LISTS[$key]['fields'] as $f) {
            $out[$f['k']] = (string) ($it[$f['k']] ?? '');
        }

        return $out;
    }

    /** @return array<int,array<string,mixed>>|null null = unusable (the default list is used) */
    private static function cleanItems(string $key, array $spec, array $items): ?array
    {
        if (count($items) > $spec['max']) {
            return null;
        }
        if (! $items) {
            return ($spec['min'] > 0 || ! $spec['add']) ? null : [];
        }
        $defaults = [];
        foreach ($spec['items'] as $d) {
            $defaults[$d['id']] = $d;
        }
        $out = [];
        $seen = [];
        foreach ($items as $it) {
            if (! is_array($it)) {
                return null;
            }
            $id = isset($it['id']) && is_string($it['id']) ? $it['id'] : '';
            if (! preg_match('/^[A-Za-z0-9_-]{1,24}$/', $id) || isset($seen[$id])) {
                return null;
            }
            if (! $spec['add'] && ! isset($defaults[$id])) {
                return null;
            }
            $seen[$id] = true;
            $row = ['id' => $id, 'visible' => ! array_key_exists('visible', $it) || filter_var($it['visible'], FILTER_VALIDATE_BOOLEAN)];
            foreach ($spec['fields'] as $f) {
                $raw = $it[$f['k']] ?? '';
                if (! is_string($raw)) {
                    return null;
                }
                if ($f['type'] === 'icon') {
                    if (! self::validIcon($raw)) {
                        return null;
                    }
                    $row[$f['k']] = $raw;
                    continue;
                }
                $v = HomeSections::clean($raw, (int) $f['max']);
                if ($v === '' && ! $f['optional']) {
                    return null;
                }
                $row[$f['k']] = $v;
            }
            $out[] = $row;
        }
        if (! $spec['add'] && count($out) !== count($defaults)) {
            return null;
        }
        if ($spec['min'] > 0 && count(array_filter($out, fn ($r) => $r['visible'])) < $spec['min']) {
            return null;
        }

        return $out;
    }

    // ------------------------------------------------------------------ validation for PUT /admin/site-texts (strict, Arabic messages)

    /** @return array<string,array<int,string>> */
    public static function validate(array $in): array
    {
        $err = [];
        if (isset($in['text'])) {
            if (! is_array($in['text'])) {
                $err['text'][] = 'بيانات النصوص غير صالحة.';
            } else {
                foreach ($in['text'] as $key => $val) {
                    $f = is_string($key) ? (SiteTextsRegistry::FIELDS[$key] ?? null) : null;
                    if (! $f) {
                        $err["text.$key"][] = 'حقل غير معروف.';
                        continue;
                    }
                    if (! is_string($val)) {
                        $err["text.$key"][] = 'القيمة يجب أن تكون نصاً.';
                        continue;
                    }
                    $m = self::fieldError($f, $val);
                    if ($m) {
                        $err["text.$key"][] = $m;
                    }
                }
            }
        }
        if (isset($in['lists'])) {
            if (! is_array($in['lists'])) {
                $err['lists'][] = 'بيانات القوائم غير صالحة.';
            } else {
                foreach ($in['lists'] as $key => $items) {
                    $spec = is_string($key) ? (SiteTextsRegistry::LISTS[$key] ?? null) : null;
                    if (! $spec) {
                        $err["lists.$key"][] = 'قائمة غير معروفة.';
                        continue;
                    }
                    foreach (self::listErrors($key, $spec, $items) as $k => $m) {
                        $err[$k][] = $m;
                    }
                }
            }
        }

        return $err;
    }

    private static function fieldError(array $f, string $val): ?string
    {
        $label = '«'.$f['label'].'»';
        switch ($f['type']) {
            case 'url':
                $v = trim($val);
                if ($v === '') {
                    return $f['optional'] ? null : "حقل $label مطلوب.";
                }

                return self::validUrl($v, (int) $f['max']) ? null : "حقل $label يجب أن يكون رابطاً صالحاً يبدأ بـ https:// (حتى {$f['max']} حرفاً).";
            case 'link':
                $v = trim($val);
                if ($v === '') {
                    return $f['optional'] ? null : "حقل $label مطلوب.";
                }

                return self::validLink($v, (int) $f['max']) ? null : "حقل $label يجب أن يكون مساراً داخلياً يبدأ بـ / (مثل /news) أو رابطاً يبدأ بـ https:// أو http:// أو # أو mailto: أو tel: (حتى {$f['max']} حرفاً، بدون مسافات).";
            case 'toggle':
                return in_array(trim($val), ['0', '1'], true) ? null : "قيمة $label غير صالحة.";
            case 'embed':
                if (trim($val) === '') {
                    return null;
                }

                return self::cleanEmbed($val, (int) $f['max']) === null ? 'رابط الخريطة المضمّنة غير صالح: يجب أن يكون رابط تضمين من خرائط Google (https://www.google.com/maps/embed…) أو من OpenStreetMap (https://www.openstreetmap.org/export/embed.html…).' : null;
            case 'image':
                $p = VisionSupport::imagePath($val);

                return ($p !== '' && VisionSupport::imageExists($p)) ? null : "اختر صورة صالحة في حقل $label (ارفع صورة أو استعد الصورة الافتراضية).";
            default:
                $plain = HomeSections::clean($val, 100000);
                if ($plain === '') {
                    return $f['optional'] ? null : "حقل $label مطلوب.";
                }
                if (mb_strlen($plain) > $f['max']) {
                    return "حقل $label يجب ألا يتجاوز {$f['max']} حرفاً.";
                }

                return null;
        }
    }

    /** @return array<string,string> */
    private static function listErrors(string $key, array $spec, mixed $items): array
    {
        $err = [];
        $name = $spec['label'];
        if (! is_array($items) || ! array_is_list($items)) {
            return ["lists.$key" => "قائمة «{$name}» غير صالحة."];
        }
        if (count($items) > $spec['max']) {
            $err["lists.$key"] = "قائمة «{$name}» يجب ألا تتجاوز {$spec['max']} عناصر.";
        }
        $defaults = array_column($spec['items'], null, 'id');
        $seen = [];
        $visible = 0;
        foreach ($items as $i => $it) {
            $p = "lists.$key.$i";
            if (! is_array($it)) {
                $err[$p] = 'بيانات العنصر غير صالحة.';
                continue;
            }
            $id = isset($it['id']) && is_string($it['id']) ? $it['id'] : '';
            if (! preg_match('/^[A-Za-z0-9_-]{1,24}$/', $id) || isset($seen[$id])) {
                $err["$p.id"] = 'معرّف العنصر غير صالح أو مكرر.';
            } elseif (! $spec['add'] && ! isset($defaults[$id])) {
                $err["$p.id"] = 'عنصر غير معروف.';
            }
            $seen[$id] = true;
            if (array_key_exists('visible', $it) && ! is_bool($it['visible'])) {
                $err["$p.visible"] = 'قيمة الإظهار غير صالحة.';
            } elseif (! array_key_exists('visible', $it) || $it['visible']) {
                $visible++;
            }
            foreach ($spec['fields'] as $f) {
                $raw = $it[$f['k']] ?? '';
                $label = '«'.$f['label'].'»';
                if (! is_string($raw)) {
                    $err["$p.{$f['k']}"] = "حقل $label يجب أن يكون نصاً.";
                } elseif ($f['type'] === 'icon') {
                    if (! self::validIcon($raw)) {
                        $err["$p.{$f['k']}"] = 'اختر أيقونة من القائمة.';
                    }
                } else {
                    $plain = HomeSections::clean($raw, 100000);
                    if ($plain === '' && ! $f['optional']) {
                        $err["$p.{$f['k']}"] = "حقل $label مطلوب.";
                    } elseif (mb_strlen($plain) > $f['max']) {
                        $err["$p.{$f['k']}"] = "حقل $label يجب ألا يتجاوز {$f['max']} حرفاً.";
                    }
                }
            }
        }
        if (! $spec['add'] && ! $err && count($items) !== count($defaults)) {
            $err["lists.$key"] = "قائمة «{$name}» لا تقبل إضافة عناصر أو حذفها.";
        }
        if (! isset($err["lists.$key"]) && $spec['min'] > 0 && $visible < $spec['min']) {
            $err["lists.$key"] = "يجب أن يبقى عنصر واحد ظاهر على الأقل في «{$name}».";
        }

        return $err;
    }

    // ------------------------------------------------------------------ write

    /** Persist (validated input) and return the normalised store. */
    public static function save(array $in): array
    {
        $clean = self::normalize($in);

        return self::persist($clean);
    }

    private static function persist(array $clean): array
    {
        if (! $clean['text'] && ! $clean['lists']) {
            Setting::query()->where('key', self::KEY)->delete(); // nothing differs from the originals: no row
            self::$cache = null;

            return self::load(true);
        }
        $row = Setting::query()->where('key', self::KEY)->first() ?: new Setting(['key' => self::KEY]);
        $row->fill([
            'value' => json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'type' => 'json',
            'section' => 'content',
            'label' => 'نصوص الموقع الثابتة (ركائز الإغاثة، المشاريع والبرامج، من نحن، نموذج التواصل والخريطة)',
            'is_public' => true,
            'sort_order' => $row->exists ? (int) $row->sort_order : 0,
        ])->save();
        self::$cache = null;

        return self::load(true);
    }

    /** Back to the original texts: one tab (`pillars|programs|about|contact`) or everything (null). */
    public static function reset(?string $scope = null): array
    {
        if ($scope === null || $scope === 'all') {
            Setting::query()->where('key', self::KEY)->delete();
            self::$cache = null;

            return self::load(true);
        }
        [$keys, $lists] = self::keysOf($scope);
        $cur = self::load(true);
        foreach ($keys as $k) {
            unset($cur['text'][$k]);
        }
        foreach ($lists as $k) {
            unset($cur['lists'][$k]);
        }

        return self::persist($cur);
    }

    /** @return array{0: string[], 1: string[]} field keys and list keys of a tab */
    public static function keysOf(string $scope): array
    {
        $keys = [];
        $lists = [];
        foreach (SiteTextsRegistry::SECTIONS as $s) {
            if ($s['id'] !== $scope) {
                continue;
            }
            foreach ($s['blocks'] as $b) {
                if ($b['kind'] === 'list') {
                    $lists[] = $b['list'];
                } else {
                    array_push($keys, ...$b['keys']);
                }
            }
        }

        return [$keys, $lists];
    }

    public static function sectionIds(): array
    {
        return array_column(SiteTextsRegistry::SECTIONS, 'id');
    }

    // ------------------------------------------------------------------ public helpers (used by the Blade views / controllers)

    /** Text of a field: the saved override, else the original text. */
    public static function t(string $key): string
    {
        $o = self::load()['text'][$key] ?? null;

        return $o !== null ? $o : (string) (SiteTextsRegistry::FIELDS[$key]['default'] ?? '');
    }

    /** Editable button link: the saved value when it is a safe link (relative path, #anchor, http(s), mailto, tel), else $fallback. */
    public static function link(string $key, string $fallback): string
    {
        $v = trim(self::t($key));

        return ($v !== '' && self::validLink($v, (int) (SiteTextsRegistry::FIELDS[$key]['max'] ?? 300))) ? $v : $fallback;
    }

    /** On / off switch (type `toggle`): everything except an explicit "0" is on. */
    public static function on(string $key): bool
    {
        return self::t($key) !== '0';
    }

    /** Text with {name} placeholders replaced by the given values in bold (<b>). Escaped; safe with {!! !!}. */
    public static function bold(string $key, array $vars): HtmlString
    {
        $t = e(self::t($key));
        foreach ($vars as $k => $v) {
            $t = str_replace('{'.$k.'}', '<b>'.e((string) $v).'</b>', $t);
        }

        return new HtmlString($t);
    }

    /** Keys the browser scripts read (window.SITE_T): every `js.*` text + the shared form messages. */
    public static function jsKeys(): array
    {
        static $keys = null;
        if ($keys === null) {
            $keys = array_values(array_filter(array_keys(SiteTextsRegistry::FIELDS), fn ($k) => str_starts_with($k, 'js.')));
            array_push($keys, 'contact.msg.success', 'news.msg.email_required', 'news.msg.ok');
        }

        return $keys;
    }

    /** Only the EDITED browser texts (empty = nothing is printed and the scripts use their built-in texts). */
    public static function jsConfig(): array
    {
        $saved = self::load()['text'];
        $out = [];
        foreach (self::jsKeys() as $k) {
            if (isset($saved[$k]) && $saved[$k] !== '') {
                $out[$k] = $saved[$k];
            }
        }

        return $out;
    }

    /** Headline in two parts: "title <span gold>gold</span>" ($sep = 'br' puts a line break between them). Escaped; safe with {!! !!}. */
    public static function gold(string $titleKey, string $goldKey, string $sep = ' '): HtmlString
    {
        $g = self::t($goldKey);
        $html = e(self::t($titleKey));
        if ($g !== '') {
            $html .= ($sep === 'br' ? '<br>' : ' ').'<span class="text-gradient-gold">'.e($g).'</span>';
        }

        return new HtmlString($html);
    }

    /** Text with the required-field marker: every "*" becomes <span class="req">*</span>. Escaped; safe with {!! !!}. */
    public static function withReq(string $key): HtmlString
    {
        return new HtmlString(str_replace('*', '<span class="req" aria-hidden="true">*</span>', e(self::t($key))));
    }

    /** Text whose first {…} part becomes a link (new tab). Escaped; safe with {!! !!}. */
    public static function linked(string $key, string $href, string $class = ''): HtmlString
    {
        $t = self::t($key);
        if (preg_match('/\{([^{}]+)\}/u', $t, $m, PREG_OFFSET_CAPTURE)) {
            $before = substr($t, 0, $m[0][1]);
            $after = substr($t, $m[0][1] + strlen($m[0][0]));
            $a = '<a'.($class !== '' ? ' class="'.e($class).'"' : '').' href="'.e($href).'" target="_blank" rel="noopener">'.e($m[1][0]).'</a>';

            return new HtmlString(e(str_replace(['{', '}'], '', $before)).$a.e(str_replace(['{', '}'], '', $after)));
        }

        return new HtmlString(e(str_replace(['{', '}'], '', $t)));
    }

    /** Visible items of a list in display order (saved list, else the original items). Fixed extras (logo file) come from the originals. */
    public static function items(string $list): array
    {
        $spec = SiteTextsRegistry::LISTS[$list] ?? null;
        if (! $spec) {
            return [];
        }
        $stored = self::load()['lists'][$list] ?? null;
        $items = $stored ?? self::defaultItems($list);
        $items = array_values(array_filter($items, fn ($i) => $i['visible']));
        if (! $items && $spec['min'] > 0) {
            $items = array_values(array_filter(self::defaultItems($list), fn ($i) => $i['visible']));
        }
        if ($spec['fixed']) {
            $defaults = array_column($spec['items'], null, 'id');
            foreach ($items as &$it) {
                foreach ($spec['fixed'] as $f) {
                    $it[$f] = (string) ($defaults[$it['id']][$f] ?? '');
                }
            }
            unset($it);
        }

        return $items;
    }

    /** data-* attributes that make the public counter animate a number such as 180K+ / 98.4% / +2,500 / 12,000 ('' = shown as plain text). */
    public static function countAttrs(string $v): string
    {
        if (! preg_match('/^(\+?)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(K\+|%|\+)?$/', trim($v), $m)) {
            return '';
        }
        $count = str_replace(',', '', $m[2]).(($m[3] ?? '') !== '' ? '.'.$m[3] : '');
        $a = ' data-count="'.$count.'"';
        if ($m[1] !== '') {
            $a .= ' data-prefix="+"';
        }
        if (str_contains($m[2], ',')) {
            $a .= ' data-sep="true"';
        }
        if (($m[3] ?? '') !== '') {
            $a .= ' data-decimals="'.strlen($m[3]).'"';
        }
        if (($m[4] ?? '') !== '') {
            $a .= ' data-suffix="'.$m[4].'"';
        }

        return $a;
    }

    /** Map picture of the home «التواصل» section (public URL). */
    public static function mapImage(): string
    {
        $p = self::t('contact.map.image');
        $def = (string) SiteTextsRegistry::FIELDS['contact.map.image']['default'];
        if ($p !== $def && (VisionSupport::imagePath($p) === '' || ! VisionSupport::imageExists($p))) {
            $p = $def;
        }

        return asset($p);
    }

    /** Embedded-map URL ('' = none). Re-validated on every read; when used, the CSP frame-src of this response allows that origin only. */
    public static function mapEmbed(): string
    {
        $v = self::t('contact.map.embed');
        if ($v === '' || self::cleanEmbed($v, 600) !== $v) {
            return '';
        }
        $p = parse_url($v);
        try {
            $req = request();
            $frames = (array) $req->attributes->get('csp_frames', []);
            $frames[] = 'https://'.$p['host'];
            $req->attributes->set('csp_frames', array_values(array_unique($frames)));
        } catch (\Throwable $e) {
            // no request (console): nothing to do
        }

        return $v;
    }

    // ------------------------------------------------------------------ control panel payload

    public static function payload(?bool $saved = null): array
    {
        $cur = self::load();
        $text = [];
        foreach (SiteTextsRegistry::FIELDS as $k => $f) {
            $text[$k] = $cur['text'][$k] ?? $f['default'];
        }
        $lists = [];
        $listDefaults = [];
        foreach (SiteTextsRegistry::LISTS as $k => $spec) {
            $listDefaults[$k] = self::defaultItems($k);
            $lists[$k] = $cur['lists'][$k] ?? $listDefaults[$k];
        }
        $edited = [];
        foreach (self::sectionIds() as $sid) {
            [$keys, $ls] = self::keysOf($sid);
            $edited[$sid] = count(array_intersect_key($cur['text'], array_flip($keys))) + count(array_intersect_key($cur['lists'], array_flip($ls)));
        }

        return [
            'sections' => SiteTextsRegistry::SECTIONS,
            'fields' => SiteTextsRegistry::FIELDS,
            'listSpecs' => array_map(function ($s) {
                unset($s['items']);

                return $s;
            }, SiteTextsRegistry::LISTS),
            'listDefaults' => $listDefaults,
            'text' => $text,
            'lists' => $lists,
            'icons' => SiteTextsIcons::ALL,
            'edited' => $edited,
            'saved' => $saved ?? self::exists(),
            'image_max_mb' => (float) ContentSupport::maxUploadMb(),
            'site_url' => url('/'),
        ];
    }
}
