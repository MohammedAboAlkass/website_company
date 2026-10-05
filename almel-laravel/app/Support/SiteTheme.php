<?php

namespace App\Support;

use App\Models\HeroSetting;

/**
 * «مظهر الموقع»: the look of the PUBLIC site (templates, custom colours, optional gradient).
 *
 * Nothing in resources/ or public/assets/site/css/ is rewritten. With the default look (template «green», gradient off)
 * every page links the original stylesheets and prints exactly the same HTML as before. For any other choice the layout links
 * a derived copy of the same stylesheet (route /site-theme/{name}.css) in which every brand colour literal is replaced by a CSS
 * variable, followed by one validated :root block that holds the chosen palette. Only validated #RRGGBB values are ever printed.
 *
 * Stored in one `settings` row: site.theme (json, public). `site.brand_color` mirrors the primary colour of the saved choice.
 */
class SiteTheme
{
    public const KEY = 'site.theme';
    public const DEFAULT_TEMPLATE = 'green';
    public const DEFAULT_PRIMARY = '#0C7845';
    public const DEFAULT_ACCENT = '#FF7000';
    public const ASSET_REV = 2;

    /** Stylesheets that can be served themed: route name => file in public/assets/site/css/ */
    public const FILES = [
        'styles' => 'styles.css',
        'pages' => 'pages.css',
        'hero' => 'hero.css',
        'ed-content' => 'ed-content.css',
        'tailwind' => 'tailwind.build.css',
    ];

    /** gradient direction key => [Arabic label, CSS direction] */
    public const DIRS = [
        'to-left' => ['نحو اليسار', 'to left'],
        'to-right' => ['نحو اليمين', 'to right'],
        'to-bottom' => ['نحو الأسفل', 'to bottom'],
        'to-top' => ['نحو الأعلى', 'to top'],
        'to-bottom-left' => ['قُطري نحو أسفل اليسار', 'to bottom left'],
        'to-bottom-right' => ['قُطري نحو أسفل اليمين', 'to bottom right'],
    ];
    public const DEFAULT_DIR = 'to-left';

    /**
     * Ready-made templates. Colours were taken from the old template stylesheets (styles-black/navy/petrol/green/blackgreen/navygreen.css).
     * styles-wine.css is a byte-identical copy of styles-black.css, so there is no separate «wine» template.
     * flat = the current look: every dark section is the primary colour itself (the original styles.css).
     */
    public const TEMPLATES = [
        'green' => ['label' => 'الأخضر (الحالي)', 'hint' => 'المظهر الحالي للموقع: أخضر موحّد.', 'flat' => true,
            'p' => '#0C7845', 'm' => '#0A5C35', 'd' => '#073D24', 'x' => '#052B19', 'accent' => '#FF7000'],
        'green-deep' => ['label' => 'أخضر عميق', 'hint' => 'نفس الأخضر مع أقسام داكنة أعمق.', 'flat' => false,
            'p' => '#0C7845', 'm' => '#0A5C35', 'd' => '#073D24', 'x' => '#052B19', 'tint' => '#EAF5EE', 'g400' => '#C9E6D5', 'gtext' => '#0A5C35',
            'canvas' => '#F6F9F5', 'line' => '#DBE6DF', 'ink' => '#16261D', 'muted' => '#4D6157', 'accent' => '#FF7000', 'donate_dark' => '#E56400'],
        'black' => ['label' => 'أسود', 'hint' => 'فحمي هادئ مع لمسة كهرمانية.', 'flat' => false,
            'p' => '#3D4247', 'm' => '#2F3337', 'd' => '#1F2225', 'x' => '#16181A', 'tint' => '#EFF0F0', 'g400' => '#D6D8D9', 'gtext' => '#2F3337',
            'canvas' => '#F7F7F7', 'line' => '#E0E0E1', 'ink' => '#1D1E1F', 'muted' => '#565758', 'accent' => '#F9B006', 'donate_dark' => '#DF9E06'],
        'navy' => ['label' => 'كحلي', 'hint' => 'كحلي رسمي مع لمسة ذهبية.', 'flat' => false,
            'p' => '#0F3B75', 'm' => '#0C2E5A', 'd' => '#081F3C', 'x' => '#06162A', 'tint' => '#EAEFF5', 'g400' => '#CAD6E5', 'gtext' => '#0C2E5A',
            'canvas' => '#F5F7F9', 'line' => '#DBE0E6', 'ink' => '#161D26', 'muted' => '#4E5661', 'accent' => '#FFAE00', 'donate_dark' => '#E59C00'],
        'petrol' => ['label' => 'بترولي', 'hint' => 'أزرق مخضرّ هادئ.', 'flat' => false,
            'p' => '#116673', 'm' => '#0E4E58', 'd' => '#0A343A', 'x' => '#072529', 'tint' => '#EBF3F4', 'g400' => '#CAE1E5', 'gtext' => '#0E4E58',
            'canvas' => '#F5F8F9', 'line' => '#DCE4E5', 'ink' => '#172325', 'muted' => '#4E5E60', 'accent' => '#FF6600', 'donate_dark' => '#E55C00'],
        'black-green' => ['label' => 'أسود وأخضر', 'hint' => 'أخضر للأزرار والتمييز وأقسام داكنة سوداء.', 'flat' => false,
            'p' => '#0C7845', 'm' => '#0A5C35', 'd' => '#141414', 'x' => '#0A0A0A', 'tint' => '#EAF5EE', 'g400' => '#C9E6D5', 'gtext' => '#0A5C35',
            'canvas' => '#F6F9F5', 'line' => '#DBE6DF', 'ink' => '#16261D', 'muted' => '#4D6157', 'accent' => '#FF7000', 'donate_dark' => '#E56400'],
        'navy-green' => ['label' => 'كحلي وأخضر', 'hint' => 'أخضر للأزرار والتمييز وأقسام داكنة كحلية.', 'flat' => false,
            'p' => '#0C7845', 'm' => '#0A5C35', 'd' => '#0A1A3A', 'x' => '#06112B', 'tint' => '#EAF5EE', 'g400' => '#C9E6D5', 'gtext' => '#0A5C35',
            'canvas' => '#F6F9F5', 'line' => '#DBE6DF', 'ink' => '#16261D', 'muted' => '#4D6157', 'accent' => '#FF7000', 'donate_dark' => '#E56400'],
    ];

    // ------------------------------------------------------------------ colour maths

    /** @return array{0:int,1:int,2:int} */
    public static function rgb(string $hex): array
    {
        $hex = ltrim($hex, '#');

        return [hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2))];
    }

    public static function toHex(array $c): string
    {
        return sprintf('#%02X%02X%02X', max(0, min(255, (int) round($c[0]))), max(0, min(255, (int) round($c[1]))), max(0, min(255, (int) round($c[2]))));
    }

    public static function isHex($v): bool
    {
        return is_string($v) && (bool) preg_match('/^#[0-9a-fA-F]{6}$/', $v);
    }

    public static function mix(string $a, string $b, float $t): string
    {
        $x = self::rgb($a);
        $y = self::rgb($b);

        return self::toHex([$x[0] + ($y[0] - $x[0]) * $t, $x[1] + ($y[1] - $x[1]) * $t, $x[2] + ($y[2] - $x[2]) * $t]);
    }

    /** @return array{0:float,1:float,2:float} h 0..360, s 0..1, l 0..1 */
    public static function hsl(string $hex): array
    {
        [$r, $g, $b] = array_map(fn ($v) => $v / 255, self::rgb($hex));
        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $l = ($max + $min) / 2;
        if ($max === $min) {
            return [0.0, 0.0, $l];
        }
        $d = $max - $min;
        $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);
        $h = match (true) {
            $max === $r => (($g - $b) / $d) + ($g < $b ? 6 : 0),
            $max === $g => (($b - $r) / $d) + 2,
            default => (($r - $g) / $d) + 4,
        };

        return [$h * 60, $s, $l];
    }

    public static function fromHsl(float $h, float $s, float $l): string
    {
        $h = fmod(fmod($h, 360) + 360, 360) / 360;
        $s = max(0, min(1, $s));
        $l = max(0, min(1, $l));
        if ($s == 0) {
            return self::toHex([$l * 255, $l * 255, $l * 255]);
        }
        $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
        $p = 2 * $l - $q;
        $f = function (float $t) use ($p, $q): float {
            $t = $t < 0 ? $t + 1 : ($t > 1 ? $t - 1 : $t);

            return match (true) {
                $t < 1 / 6 => $p + ($q - $p) * 6 * $t,
                $t < 1 / 2 => $q,
                $t < 2 / 3 => $p + ($q - $p) * (2 / 3 - $t) * 6,
                default => $p,
            };
        };

        return self::toHex([$f($h + 1 / 3) * 255, $f($h) * 255, $f($h - 1 / 3) * 255]);
    }

    public static function lum(string $hex): float
    {
        $c = array_map(function ($v) {
            $v /= 255;

            return $v <= 0.03928 ? $v / 12.92 : (($v + 0.055) / 1.055) ** 2.4;
        }, self::rgb($hex));

        return 0.2126 * $c[0] + 0.7152 * $c[1] + 0.0722 * $c[2];
    }

    public static function contrast(string $a, string $b): float
    {
        $x = self::lum($a);
        $y = self::lum($b);

        return (max($x, $y) + 0.05) / (min($x, $y) + 0.05);
    }

    /** "r,g,b" and "r g b" channel strings used for rgba(var(--x), a) and rgb(var(--x) / a). */
    private static function ch(string $hex, string $sep = ','): string
    {
        return implode($sep, self::rgb($hex));
    }

    // ------------------------------------------------------------------ palettes

    /** Second gradient colour proposed for a primary colour (a calm neighbour hue, still readable with white text). */
    public static function analog(string $primary): string
    {
        [$h, $s, $l] = self::hsl($primary);
        $c = self::fromHsl($h + 32, min(max($s, 0.35), 0.85), $l);
        for ($i = 0; $i < 12 && self::contrast($c, '#FFFFFF') < 3.4; $i++) {
            $c = self::mix($c, '#000000', 0.08);
        }

        return $c;
    }

    /**
     * Full palette (all #RRGGBB, upper case) for a primary + accent colour. When $tpl carries explicit colours (a ready-made template)
     * they win over the derived ones.
     *
     * @return array<string,string>
     */
    public static function palette(string $primary, string $accent, array $tpl = []): array
    {
        $p = strtoupper($primary);
        [$h, $s] = self::hsl($p);
        $f = max(0.15, min(1, $s / 0.6));
        $tint = $tpl['tint'] ?? self::fromHsl($h, 0.36 * $f, 0.94);
        $line = $tpl['line'] ?? self::fromHsl($h, 0.16 * $f, 0.88);
        $gtext = $tpl['gtext'] ?? null;
        if ($gtext === null) {
            $gtext = $p;
            for ($i = 0; $i < 14 && self::contrast($gtext, $tint) < 4.5; $i++) {
                $gtext = self::mix($gtext, '#000000', 0.07);
            }
        }
        $acc = strtoupper($accent);
        $pal = [
            'p' => $p,
            'm' => $tpl['m'] ?? self::mix($p, '#000000', 0.22),
            'd' => $tpl['d'] ?? self::mix($p, '#000000', 0.49),
            'x' => $tpl['x'] ?? self::mix($p, '#000000', 0.64),
            'tint' => $tint,
            'g400' => $tpl['g400'] ?? self::fromHsl($h, 0.36 * $f, 0.83),
            'gtext' => $gtext,
            'canvas' => $tpl['canvas'] ?? self::fromHsl($h, 0.25 * $f, 0.97),
            'line' => $line,
            'ink' => $tpl['ink'] ?? self::fromHsl($h, 0.25 * $f, 0.11),
            'muted' => $tpl['muted'] ?? self::fromHsl($h, 0.12 * $f, 0.34),
            'donate' => $acc,
            'donate_dark' => $tpl['donate_dark'] ?? self::mix($acc, '#000000', 0.1),
            'donate_hi' => self::mix($acc, '#FFFFFF', 0.12),
        ];
        $pal['m2'] = self::mix($p, '#000000', 0.25);
        $pal['d2'] = self::mix($p, '#000000', 0.4);
        $pal['soft'] = self::mix($p, '#FFFFFF', 0.75);
        $pal['light'] = self::mix($p, '#FFFFFF', 0.6);
        $pal['tint2'] = self::mix($tint, $line, 0.45);
        $pal['ink3'] = self::mix($pal['muted'], '#FFFFFF', 0.45);
        $pal['ink_on_donate'] = self::contrast($acc, $pal['ink']) >= self::contrast($acc, '#FFFFFF') ? $pal['ink'] : '#FFFFFF';

        return $pal;
    }

    /** The exact palette of the original stylesheets (used for the th-variables of the default look). */
    private static function defaultPalette(): array
    {
        $pal = [
            'p' => '#0C7845', 'm' => '#0A5C35', 'd' => '#073D24', 'x' => '#052B19', 'tint' => '#EAF5EE', 'g400' => '#C9E6D5', 'gtext' => '#0C7845',
            'canvas' => '#F6F9F5', 'line' => '#DBE6DF', 'ink' => '#16261D', 'muted' => '#4D6157', 'donate' => '#FF7000', 'donate_dark' => '#E56400',
            'donate_hi' => '#FF8226', 'm2' => '#095C34', 'd2' => '#0A4A2B', 'soft' => '#BCD6C6', 'light' => '#9AD7B4', 'tint2' => '#E6EFE9', 'ink3' => '#8FA398',
        ];
        $pal['ink_on_donate'] = $pal['ink'];

        return $pal;
    }

    // ------------------------------------------------------------------ settings

    public static function templates(): array
    {
        $out = [];
        foreach (self::TEMPLATES as $k => $t) {
            $pal = self::palette($t['p'], $t['accent'], $t);
            $out[] = ['key' => $k, 'label' => $t['label'], 'hint' => $t['hint'], 'flat' => $t['flat'], 'primary' => strtoupper($t['p']), 'accent' => strtoupper($t['accent']), 'palette' => $k === 'green' ? self::defaultPalette() : $pal];
        }

        return $out;
    }

    public static function defaults(): array
    {
        return [
            'template' => self::DEFAULT_TEMPLATE,
            'primary' => self::DEFAULT_PRIMARY,
            'accent' => self::DEFAULT_ACCENT,
            'gradient' => ['on' => false, 'from' => self::DEFAULT_PRIMARY, 'to' => self::analog(self::DEFAULT_PRIMARY), 'dir' => self::DEFAULT_DIR],
        ];
    }

    /** Tolerant normalisation: always returns a complete, valid choice (invalid parts fall back to the defaults). */
    public static function normalize($in): array
    {
        $d = self::defaults();
        $in = is_array($in) ? $in : [];
        $tpl = is_string($in['template'] ?? null) && ($in['template'] === 'custom' || isset(self::TEMPLATES[$in['template']])) ? $in['template'] : $d['template'];
        if ($tpl === 'custom') {
            $primary = self::isHex($in['primary'] ?? null) ? strtoupper($in['primary']) : $d['primary'];
            $accent = self::isHex($in['accent'] ?? null) ? strtoupper($in['accent']) : $d['accent'];
        } else {
            $primary = strtoupper(self::TEMPLATES[$tpl]['p']);
            $accent = strtoupper(self::TEMPLATES[$tpl]['accent']);
        }
        $g = is_array($in['gradient'] ?? null) ? $in['gradient'] : [];
        $from = self::isHex($g['from'] ?? null) ? strtoupper($g['from']) : $primary;
        $to = self::isHex($g['to'] ?? null) ? strtoupper($g['to']) : self::analog($primary);
        $dir = is_string($g['dir'] ?? null) && isset(self::DIRS[$g['dir']]) ? $g['dir'] : self::DEFAULT_DIR;

        return ['template' => $tpl, 'primary' => $primary, 'accent' => $accent, 'gradient' => ['on' => filter_var($g['on'] ?? false, FILTER_VALIDATE_BOOLEAN), 'from' => $from, 'to' => $to, 'dir' => $dir]];
    }

    /**
     * Arabic validation messages for a submitted choice (empty array = valid).
     *
     * @return array<string,string> field => message
     */
    public static function problems($in): array
    {
        $err = [];
        if (! is_array($in)) {
            return ['template' => 'بيانات مظهر الموقع غير صالحة.'];
        }
        $t = $in['template'] ?? null;
        if (! is_string($t) || ($t !== 'custom' && ! isset(self::TEMPLATES[$t]))) {
            $err['template'] = 'القالب المختار غير معروف.';
        }
        if ($t === 'custom') {
            if (! self::isHex($in['primary'] ?? null)) {
                $err['primary'] = 'اللون الأساسي يجب أن يكون بصيغة #RRGGBB (مثال: #0C7845).';
            } elseif (($c = self::contrast($in['primary'], '#FFFFFF')) < 3.0) {
                $err['primary'] = 'اللون الأساسي فاتح جداً: النص الأبيض عليه غير مقروء (التباين '.number_format($c, 1).':1 والحد الأدنى 3:1). اختر لوناً أغمق.';
            }
            if (! self::isHex($in['accent'] ?? null)) {
                $err['accent'] = 'لون التمييز يجب أن يكون بصيغة #RRGGBB (مثال: #FF7000).';
            }
        }
        $g = $in['gradient'] ?? null;
        if (! is_array($g)) {
            $err['gradient'] = 'إعدادات التدرّج غير صالحة.';
        } else {
            if (array_key_exists('on', $g) && ! is_bool($g['on']) && ! in_array($g['on'], [0, 1, '0', '1', 'true', 'false'], true)) {
                $err['gradient.on'] = 'قيمة تفعيل التدرّج غير صالحة.';
            }
            foreach (['from' => 'لون بداية التدرّج', 'to' => 'لون نهاية التدرّج'] as $k => $label) {
                if (! self::isHex($g[$k] ?? null)) {
                    $err['gradient.'.$k] = $label.' يجب أن يكون بصيغة #RRGGBB.';
                } elseif (filter_var($g['on'] ?? false, FILTER_VALIDATE_BOOLEAN) && ($c = self::contrast($g[$k], '#FFFFFF')) < 3.0) {
                    $err['gradient.'.$k] = $label.' فاتح جداً: النص الأبيض عليه غير مقروء (التباين '.number_format($c, 1).':1 والحد الأدنى 3:1).';
                }
            }
            if (! is_string($g['dir'] ?? null) || ! isset(self::DIRS[$g['dir']])) {
                $err['gradient.dir'] = 'اتجاه التدرّج غير مسموح.';
            }
        }

        return $err;
    }

    private static ?array $memo = null;
    private static ?bool $memoSaved = null;
    private static ?bool $memoFollow = null;

    public static function forget(): void
    {
        self::$memo = null;
        self::$memoSaved = null;
        self::$memoFollow = null;
    }

    /** The saved choice, normalised; defaults when nothing is saved. */
    public static function current(): array
    {
        if (self::$memo !== null) {
            return self::$memo;
        }
        $raw = SiteSettings::rows()[self::KEY] ?? null;
        $j = is_string($raw) && $raw !== '' ? json_decode($raw, true) : null;
        self::$memoSaved = is_array($j);

        return self::$memo = self::normalize($j);
    }

    /** true when a site.theme row exists. */
    public static function isSaved(): bool
    {
        self::current();

        return (bool) self::$memoSaved;
    }

    /** Default look = original stylesheets, byte-identical pages. */
    public static function isActive(): bool
    {
        $c = self::current();

        return $c['template'] !== self::DEFAULT_TEMPLATE || $c['gradient']['on'];
    }

    /** Effective palette of the saved choice. */
    public static function activePalette(): array
    {
        $c = self::current();
        if ($c['template'] === 'green') {
            return self::defaultPalette();
        }
        $tpl = $c['template'] === 'custom' ? [] : self::TEMPLATES[$c['template']];

        return self::palette($c['primary'], $c['accent'], $tpl);
    }

    /** Primary colour for <meta name="theme-color"> (lower case like before); null when nothing is saved. */
    public static function primaryOrNull(): ?string
    {
        return self::isSaved() ? strtolower(self::current()['primary']) : null;
    }

    /** Whether the homepage hero follows the site look (hero settings: theme_follow, default yes). */
    public static function heroFollows(): bool
    {
        if (self::$memoFollow !== null) {
            return self::$memoFollow;
        }
        $v = true;
        try {
            if (\App\Support\HeroSupport::tablesExist() && ($row = HeroSetting::query()->find(1))) {
                $cfg = is_array($row->config) ? $row->config : [];
                $v = \App\Support\HeroSupport::bool($cfg['theme_follow'] ?? null, true);
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return self::$memoFollow = $v;
    }

    // ------------------------------------------------------------------ printing helpers (layout / views)

    /** URL of a public stylesheet: the original file for the default look, the themed copy otherwise. */
    public static function css(string $name): string
    {
        $file = self::FILES[$name] ?? null;
        if ($file === null) {
            return '';
        }
        $plain = asset('assets/site/css/'.$file);
        if (! self::isActive() || ($name === 'hero' && ! self::heroFollows())) {
            return $plain;
        }

        return asset('site-theme/'.$name.'.css').'?v='.self::hash($name);
    }

    /** A colour literal for inline markup: unchanged for the default look, a variable otherwise. */
    public static function lit(string $hex, string $role = 'p'): string
    {
        return self::isActive() ? 'var(--th-'.$role.')' : $hex;
    }

    public static function hash(string $name): string
    {
        $f = public_path('assets/site/css/'.(self::FILES[$name] ?? ''));
        $sig = is_file($f) ? filemtime($f).'-'.filesize($f) : '0';

        return substr(md5(json_encode([self::current(), self::heroFollows(), $sig, self::ASSET_REV])), 0, 10);
    }

    // ------------------------------------------------------------------ hero (HeroSupport / hero component)

    /** Colours of the slides that still equal the original defaults follow the site look; colours changed in /admin/hero never do. */
    public static function heroColor(string $hex): string
    {
        if (! self::isActive() || ! self::heroFollows()) {
            return $hex;
        }
        $h = strtoupper($hex);

        return match ($h) {
            '#0C7845' => 'var(--th-p)',
            '#FF7000' => 'var(--th-donate)',
            default => $hex,
        };
    }

    /**
     * Overlay of a slide: when the site gradient is on, the hero follows the site and the slide still has the original default overlay,
     * the colour layer becomes ONE gradient layer made of light tints of the site gradient (the dark text stays readable). null = keep the slide's own.
     */
    public static function heroOverlay(array $overlay): ?string
    {
        $c = self::current();
        if (! $c['gradient']['on'] || ! self::heroFollows()) {
            return null;
        }
        if (($overlay['mode'] ?? '') !== 'gradient' || ! self::sameGradient((array) ($overlay['gradient'] ?? []), \App\Support\HeroSupport::defaultGradient())) {
            return null;
        }
        $g = $c['gradient'];
        $a = self::mix($g['from'], '#FFFFFF', 0.8);
        $b = self::mix($g['to'], '#FFFFFF', 0.8);
        $mid = self::mix($a, $b, 0.5);
        $stops = [[$a, 92, 0], [$mid, 80, 35], [$b, 25, 65], [$b, 0, 100]];
        $parts = array_map(fn ($s) => \App\Support\HeroSupport::rgba($s[0], $s[1]).' '.$s[2].'%', $stops);

        return 'background:linear-gradient('.\App\Support\HeroSupport::int(self::angle($g['dir']), 0, 360, 270).'deg, '.implode(', ', $parts).')';
    }

    private static function angle(string $dir): int
    {
        return ['to-top' => 0, 'to-right' => 90, 'to-bottom' => 180, 'to-left' => 270, 'to-bottom-right' => 135, 'to-bottom-left' => 225][$dir] ?? 270;
    }

    private static function sameGradient(array $a, array $b): bool
    {
        $norm = fn (array $g) => json_encode([$g['type'] ?? '', (int) ($g['angle'] ?? 0), array_map(fn ($s) => [strtoupper((string) ($s['color'] ?? '')), (int) ($s['alpha'] ?? 0), (float) ($s['pos'] ?? 0)], array_values((array) ($g['stops'] ?? [])))]);

        return $norm($a) === $norm($b);
    }

    // ------------------------------------------------------------------ the derived stylesheets

    private const HEX_MAP = [
        '#0c7845' => 'var(--th-p)', '#0a5c35' => 'var(--th-m)', '#095c34' => 'var(--th-m2)', '#073d24' => 'var(--th-d)', '#0a4a2b' => 'var(--th-d2)',
        '#052b19' => 'var(--th-x)', '#9ad7b4' => 'var(--th-light)', '#c9e6d5' => 'var(--th-g400)', '#bcd6c6' => 'var(--th-soft)',
        '#eaf5ee' => 'var(--th-tint)', '#e6efe9' => 'var(--th-tint2)', '#e1eee6' => 'var(--th-tint2)', '#8fa398' => 'var(--th-ink3)',
        '#dbe6df' => 'var(--th-line)', '#f6f9f5' => 'var(--th-canvas)', '#16261d' => 'var(--th-ink)', '#4d6157' => 'var(--th-muted)',
        '#ff7000' => 'var(--th-donate)', '#e56400' => 'var(--th-donate-dark)', '#ff8226' => 'var(--th-donate-hi)', '#ff8524' => 'var(--th-donate-hi)',
    ];

    /** "r,g,b" => variable that holds those channels (comma form) */
    private const RGB_MAP = [
        '12,120,69' => '--th-p-rgb', '9,80,46' => '--th-m4-rgb', '7,61,36' => '--th-d-rgb', '5,43,25' => '--th-x-rgb', '154,215,180' => '--th-light-rgb',
        '234,245,238' => '--th-tint-rgb', '22,38,29' => '--th-ink-rgb', '255,112,0' => '--th-donate-rgb',
    ];

    /** "r g b" => variable (space form, Tailwind utilities) */
    private const SP_MAP = [
        '12 120 69' => '--th-p-sp', '77 97 87' => '--th-muted-sp', '219 230 223' => '--th-line-sp', '246 249 245' => '--th-canvas-sp',
        '234 245 238' => '--th-tint-sp', '22 38 29' => '--th-ink-sp', '188 214 198' => '--th-soft-sp',
    ];

    /** Dark-fill variables used for `background: var(--forest-…)` when the gradient is on => [gradient var, darkness level]. */
    private const FILL = ['forest-700' => '700', 'forest-500' => '500', 'forest-900' => '900', 'forest-950' => '950', 'gold-500' => '700', 'gold-600' => '700', 'th-p' => '700'];

    /** @return list<string> "--name:value" declarations of a palette (+ the gradient fills when $grad is given) */
    private static function vars(array $pal, bool $flat, ?array $grad): array
    {
        $v = [];
        $add = function (string $n, string $val) use (&$v) { $v[] = $n.':'.$val; };
        $add('--th-p', $pal['p']);
        $add('--th-p-rgb', self::ch($pal['p']));
        $add('--th-p-sp', self::ch($pal['p'], ' '));
        $add('--th-m', $pal['m']);
        $add('--th-m2', $pal['m2']);
        $add('--th-m4-rgb', self::ch(self::mix($pal['p'], '#000000', 0.25)));
        $add('--th-d', $pal['d']);
        $add('--th-d-rgb', self::ch($pal['d']));
        $add('--th-d2', $pal['d2']);
        $add('--th-x', $pal['x']);
        $add('--th-x-rgb', self::ch($pal['x']));
        $add('--th-light', $pal['light']);
        $add('--th-light-rgb', self::ch($pal['light']));
        $add('--th-soft', $pal['soft']);
        $add('--th-soft-sp', self::ch($pal['soft'], ' '));
        $add('--th-tint', $pal['tint']);
        $add('--th-tint-rgb', self::ch($pal['tint']));
        $add('--th-tint-sp', self::ch($pal['tint'], ' '));
        $add('--th-tint2', $pal['tint2']);
        $add('--th-ink3', $pal['ink3']);
        $add('--th-ink', $pal['ink']);
        $add('--th-ink-rgb', self::ch($pal['ink']));
        $add('--th-ink-sp', self::ch($pal['ink'], ' '));
        $add('--th-line', $pal['line']);
        $add('--th-line-sp', self::ch($pal['line'], ' '));
        $add('--th-canvas', $pal['canvas']);
        $add('--th-canvas-sp', self::ch($pal['canvas'], ' '));
        $add('--th-muted', $pal['muted']);
        $add('--th-muted-sp', self::ch($pal['muted'], ' '));
        $add('--th-g400', $pal['g400']);
        $add('--th-donate', $pal['donate']);
        $add('--th-donate-rgb', self::ch($pal['donate']));
        $add('--th-donate-dark', $pal['donate_dark']);
        $add('--th-donate-hi', $pal['donate_hi']);
        $add('--th-donate-ink', $pal['ink_on_donate']);
        // the original :root maps every dark role to the primary colour; deeper templates restore the depth
        $add('--forest-950', $flat ? $pal['p'] : $pal['x']);
        $add('--forest-900', $flat ? $pal['p'] : $pal['d']);
        $add('--forest-500', $flat ? $pal['p'] : $pal['m']);
        $add('--gold-text', $flat ? $pal['p'] : $pal['gtext']);
        if ($grad !== null) {
            $dir = self::DIRS[$grad['dir']][1];
            $lv = fn (float $k) => 'linear-gradient('.$dir.','.self::mix($grad['from'], '#000000', $k).','.self::mix($grad['to'], '#000000', $k).')';
            $g700 = $lv(0.0);
            $add('--th-g700', $g700);
            $add('--th-g500', $flat ? $g700 : $lv(0.22));
            $add('--th-g900', $flat ? $g700 : $lv(0.49));
            $add('--th-g950', $flat ? $g700 : $lv(0.64));
        }

        return $v;
    }

    /** The palette (+ gradient) of the saved choice as one :root block. */
    public static function rootBlock(): string
    {
        $c = self::current();

        return ':root{'.implode(';', self::vars(self::activePalette(), $c['template'] === 'green', $c['gradient']['on'] ? $c['gradient'] : null)).'}';
    }

    /** Restores the original colours (and plain fills) inside #hero when the hero does not follow the site look. */
    private static function heroReset(bool $gradient): string
    {
        $d = self::defaultPalette();
        $g = $gradient ? ['dir' => self::DEFAULT_DIR, 'from' => $d['p'], 'to' => $d['p']] : null;
        $v = self::vars($d, true, $g);
        if ($g !== null) { // plain colours instead of gradients
            $v = array_map(fn ($x) => preg_match('~^--th-g\d+:~', $x) ? preg_replace('~:.*$~', ':'.$d['p'], $x) : $x, $v);
        }

        return '#hero{'.implode(';', $v).'}';
    }

    /** Colour literals -> variables, relative url() -> absolute path, comments removed; plus the gradient fills when the gradient is on. */
    public static function transform(string $css, bool $gradient, string $cssDirUrl): string
    {
        $css = (string) preg_replace('~/\*.*?\*/~s', '', $css);
        // relative url(...) stays valid when the file is served from another path
        $css = (string) preg_replace_callback('~url\(\s*([\'"]?)(?!data:|https?:|//|/|#)([^\'")]+)\1\s*\)~i', function ($m) use ($cssDirUrl) {
            $parts = [];
            foreach (explode('/', rtrim($cssDirUrl, '/').'/'.$m[2]) as $seg) {
                if ($seg === '..') {
                    array_pop($parts);
                } elseif ($seg !== '.') {
                    $parts[] = $seg;
                }
            }

            return 'url('.$m[1].implode('/', $parts).$m[1].')';
        }, $css);
        // hex colours
        $css = (string) preg_replace_callback('~#[0-9a-fA-F]{6}\b~', fn ($m) => self::HEX_MAP[strtolower($m[0])] ?? $m[0], $css);
        // rgb()/rgba() with comma channels
        $css = (string) preg_replace_callback('~rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([^)]+?)\s*)?\)~', function ($m) {
            $var = self::RGB_MAP[$m[1].','.$m[2].','.$m[3]] ?? null;
            if ($var === null) {
                return $m[0];
            }

            return isset($m[4]) && $m[4] !== '' ? 'rgba(var('.$var.'),'.$m[4].')' : 'rgb(var('.$var.'))';
        }, $css);
        // Tailwind: rgb(12 120 69/var(--tw-…,1))
        $css = (string) preg_replace_callback('~rgb\((\d{1,3}) (\d{1,3}) (\d{1,3})\/(var\(--tw-[a-z-]+,[0-9.]+\))\)~', function ($m) {
            $var = self::SP_MAP[$m[1].' '.$m[2].' '.$m[3]] ?? null;

            return $var === null ? $m[0] : 'rgb(var('.$var.')/'.$m[4].')';
        }, $css);
        if ($gradient) {
            $css = (string) preg_replace_callback('~(?<![\w-])background\s*:\s*var\(--(forest-(?:950|900|700|500)|gold-(?:500|600)|th-p)\)(\s*!important)?\s*(?=[;}])~', function ($m) {
                return 'background:var(--th-g'.self::FILL[$m[1]].')'.($m[2] ?? '');
            }, $css);
        }

        return trim($css);
    }

    /**
     * Header text colour for the top-of-page bar of a themed look: the primary colour, darkened step by step until it reaches 5:1
     * on the light bar (rgba(251,250,248,.95) over the darkest hero = #EEEDEC), so the menu is readable on every template / custom colour.
     */
    public static function headerInk(): string
    {
        $c = strtoupper(self::activePalette()['p']);
        for ($i = 0; $i < 24 && self::contrast($c, '#EEEDEC') < 5.0; $i++) {
            $c = strtoupper(self::mix($c, '#000000', 0.07));
        }

        return $c;
    }

    /**
     * The original top bar is a 55 % beige film over the hero with the primary colour as text: on the dark inner-page heroes (and on
     * every deeper template) that is grey-on-green. Themed pages get the same near-opaque light bar the scrolled header already uses
     * and a readable (darkened primary) text colour. Colours only: no effects. The default look (original CSS) is never changed.
     */
    private static function headerFix(): string
    {
        $k = self::headerInk();
        $rgb = self::ch(self::activePalette()['p']);

        return '.site-header.is-top .navbar{background:rgba(251,250,248,.95)}'
            .'.site-header.is-top .brand-title,.site-header.is-top .brand-sub,.site-header.is-top .brand-en,.site-header.is-top .nav-link,.site-header.is-top .icon-btn{color:'.$k.'}'
            .'.site-header.is-top .icon-btn{background:rgba('.$rgb.',.08);border-color:rgba('.$rgb.',.22)}'
            .'.site-header.is-top .nav-link:hover,.site-header.is-top .icon-btn:hover{background:rgba('.$rgb.',.12)}';
    }

    /** Extra rules that only the gradient needs (Tailwind utilities). */
    private const GRADIENT_EXTRAS = '.bg-primary{background-image:var(--th-g700)}';

    /** Body of /site-theme/{name}.css, or null for an unknown name. */
    public static function render(string $name): ?string
    {
        $file = self::FILES[$name] ?? null;
        $path = $file ? public_path('assets/site/css/'.$file) : null;
        if (! $path || ! is_file($path)) {
            return null;
        }
        $c = self::current();
        $css = self::transform((string) file_get_contents($path), $c['gradient']['on'], '/'.ltrim((string) parse_url(asset('assets/site/css'), PHP_URL_PATH), '/')); // path only: never echo the request host into a cacheable file
        // colour baked into two decorative SVG data-URIs (cannot use var())
        $css = str_ireplace('%239ad7b4', '%23'.strtolower(ltrim(self::activePalette()['light'], '#')), $css);
        if ($name === 'styles') {
            $css .= "\n".self::rootBlock()."\n.btn-donate{color:var(--th-donate-ink)}\n".self::headerFix();
            if (! self::heroFollows()) {
                $css .= "\n".self::heroReset($c['gradient']['on']);
            }
        }
        if ($c['gradient']['on'] && in_array($name, ['styles', 'tailwind'], true)) {
            $css .= "\n".self::GRADIENT_EXTRAS;
        }

        return $css;
    }

    /** Static data for the settings page (templates with palettes, directions, defaults). */
    public static function registry(): array
    {
        return [
            'templates' => self::templates(),
            'defaults' => self::defaults(),
            'dirs' => array_map(fn ($k, $v) => ['key' => $k, 'label' => $v[0], 'css' => $v[1]], array_keys(self::DIRS), array_values(self::DIRS)),
            'default_palette' => self::defaultPalette(),
        ];
    }

    /** Short Arabic description of a choice (audit log). */
    public static function describe(array $c): string
    {
        $name = $c['template'] === 'custom' ? 'ألوان مخصصة ('.$c['primary'].' / '.$c['accent'].')' : 'قالب «'.self::TEMPLATES[$c['template']]['label'].'»';

        return $name.($c['gradient']['on'] ? ' مع تدرّج لوني' : '');
    }

    // ------------------------------------------------------------------ admin API

    /** Stores a validated choice (site.theme) and mirrors its primary colour in site.brand_color. @return array the normalised choice */
    public static function save(array $data): array
    {
        $n = self::normalize($data);
        SettingsStore::put(self::KEY, $n, 'json', 'general', 1, 'site_theme');
        SettingsStore::put('site.brand_color', $n['primary'], 'color', 'general', 1, 'brandColor');
        SiteSettings::forget();
        self::forget();

        return $n;
    }

    /** What the settings page shows: the saved choice (or the defaults). */
    public static function forAdmin(): array
    {
        SiteSettings::forget();
        self::forget();

        return self::current();
    }
}
