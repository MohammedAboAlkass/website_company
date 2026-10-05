<?php

namespace App\Support;

use App\Models\HeroSetting;
use App\Models\HeroSlide;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Homepage hero: defaults (= the original static hero), validation / normalisation of what the admin page
 * sends, CSS helpers used by the public Blade component, and the data the public site renders.
 */
class HeroSupport
{
    public const MAX_SLIDES = 12;
    public const BTN_STYLES = ['gold', 'glass', 'green', 'white'];
    public const BG_TYPES = ['image', 'video', 'color', 'gradient'];

    // ------------------------------------------------------------------ defaults

    public static function defaultSettings(): array
    {
        return [
            'enabled' => true,
            'height_mode' => 'full',      // full | 70vh | custom
            'height_value' => 80,         // custom height
            'height_unit' => 'vh',        // vh | px
            'autoplay' => true,
            'interval' => 6,              // seconds (slides with duration 0 use it)
            'arrows' => true,
            'dots' => true,
            'loop' => true,
            'pause_hover' => true,
            'scroll_hint' => true,
            'transition' => 'fade',       // fade | slide
            'speed' => 800,               // ms
            'theme_follow' => true,       // colours still equal to the original defaults follow «مظهر الموقع»
        ];
    }

    public static function defaultGradient(): array
    {
        return [
            'type' => 'linear',
            'angle' => 270,
            'stops' => [
                ['color' => '#DEDEDE', 'alpha' => 92, 'pos' => 0],
                ['color' => '#E8E2DC', 'alpha' => 80, 'pos' => 35],
                ['color' => '#E4E4E4', 'alpha' => 25, 'pos' => 65],
                ['color' => '#E2E2E2', 'alpha' => 0, 'pos' => 100],
            ],
        ];
    }

    /** A slide equal to the hero that was hard-coded in resources/views/site/home.blade.php. */
    public static function defaultSlide(): array
    {
        return [
            'id' => null,
            'is_visible' => true,
            'label' => 'الشريحة الرئيسية',
            'duration' => 0,
            'content' => [
                'badge' => 'توثيق حي ومباشر من غزة',
                'badge2' => 'رصد يومي من جباليا إلى رفح',
                'eyebrow' => 'المنصة الوثائقية لإغاثة قطاع غزة',
                'title' => "معاً نروي صمود غزة..\n[[ونوثق الأثر الإنساني]] لحظة بلحظة",
                'subtitle' => 'من قلب القطاع، نسجّل بالصوت والصورة وصول الغذاء والدواء والمأوى إلى العائلات النازحة. هنا تُحفظ كرامة أهل غزة وتُروى قصص صمودهم يوماً بيوم.',
                'btn1' => ['visible' => true, 'label' => 'شاهد الوثائقي الميداني من غزة', 'url' => '#gallery', 'style' => 'gold', 'icon' => 'play_arrow', 'new_tab' => false],
                'btn2' => ['visible' => true, 'label' => 'أرشيف التقارير المصورة', 'url' => '#activities', 'style' => 'glass', 'icon' => 'photo_library', 'new_tab' => false],
            ],
            'style' => [
                'v' => 'middle',
                'h' => 'right',
                'align' => 'right',
                'title_color' => '#0C7845',
                'text_color' => '#0C7845',
                'eyebrow_color' => '#0C7845',
                'accent_color' => '#FF7000',
                'title_size' => 100,
                'text_size' => 100,
            ],
            'background' => [
                'type' => 'video',
                'image' => ['url' => '/assets/site/img/hero-poster.jpg', 'id' => null],
                'video' => ['url' => '/assets/site/img/video/hero.mp4', 'poster' => '/assets/site/img/hero-poster.jpg', 'id' => null],
                'color' => '#D9D6D2',
                'gradient' => ['type' => 'linear', 'angle' => 135, 'stops' => [
                    ['color' => '#0C7845', 'alpha' => 100, 'pos' => 0],
                    ['color' => '#FF7000', 'alpha' => 100, 'pos' => 100],
                ]],
                'fit' => 'cover',
                'focus_x' => 50,
                'focus_y' => 50,
                'zoom' => 100,
                'grayscale' => 100,
                'motion' => true,
                'overlay' => [
                    'mode' => 'gradient',     // none | color | gradient  (one single layer)
                    'color' => '#DEDEDE',
                    'opacity' => 40,
                    'gradient' => self::defaultGradient(),
                ],
            ],
        ];
    }

    /** A fresh slide for the "add slide" button (neutral, readable on any background). */
    public static function blankSlide(): array
    {
        $s = self::defaultSlide();
        $s['label'] = 'شريحة جديدة';
        $s['content'] = [
            'badge' => '', 'badge2' => '', 'eyebrow' => '',
            'title' => 'عنوان الشريحة',
            'subtitle' => 'اكتب وصفاً قصيراً للشريحة هنا.',
            'btn1' => ['visible' => false, 'label' => 'اعرف المزيد', 'url' => '#about', 'style' => 'gold', 'icon' => '', 'new_tab' => false],
            'btn2' => ['visible' => false, 'label' => 'تواصل معنا', 'url' => '#contact', 'style' => 'glass', 'icon' => '', 'new_tab' => false],
        ];
        $s['background']['type'] = 'gradient';
        $s['background']['grayscale'] = 0;
        $s['background']['motion'] = false;
        $s['background']['overlay']['mode'] = 'none';

        return $s;
    }

    // ------------------------------------------------------------------ primitives

    public static function hex($v, string $def): string
    {
        $v = is_string($v) ? trim($v) : '';
        if (preg_match('/^#([0-9a-fA-F]{3})$/', $v, $m)) {
            $v = '#'.$m[1][0].$m[1][0].$m[1][1].$m[1][1].$m[1][2].$m[1][2];
        }

        return preg_match('/^#[0-9a-fA-F]{6}$/', $v) ? strtoupper($v) : $def;
    }

    public static function isHex($v): bool
    {
        return is_string($v) && (bool) preg_match('/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', trim($v));
    }

    public static function num($v, float $min, float $max, float $def): float
    {
        if (! is_numeric($v)) {
            return $def;
        }

        return max($min, min($max, (float) $v));
    }

    public static function int($v, int $min, int $max, int $def): int
    {
        return (int) round(self::num($v, $min, $max, $def));
    }

    public static function str($v, int $max): string
    {
        if (! is_scalar($v)) {
            return '';
        }
        $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string) $v) ?? '';
        $v = str_replace("\r\n", "\n", $v);

        return mb_substr(trim($v), 0, $max);
    }

    public static function line($v, int $max): string
    {
        return trim((string) preg_replace('/\s*\n\s*/u', ' ', self::str($v, $max)));
    }

    public static function bool($v, bool $def = false): bool
    {
        if (is_bool($v)) {
            return $v;
        }
        if ($v === null) {
            return $def;
        }

        return filter_var($v, FILTER_VALIDATE_BOOLEAN);
    }

    public static function enum($v, array $allowed, string $def): string
    {
        return is_string($v) && in_array($v, $allowed, true) ? $v : $def;
    }

    /** Accepts https://…, /path, #anchor, mailto:, tel: and bare relative paths; '' when not acceptable. */
    public static function url($v): string
    {
        $v = trim((string) (is_scalar($v) ? $v : ''));
        if ($v === '' || preg_match('/[\s<>"\'\\\\]/u', $v) || strlen($v) > 500) {
            return '';
        }
        if (preg_match('#^(https?://[^\s]+|mailto:[^\s]+|tel:[+0-9\-\s()]+)$#i', $v) || preg_match('#^/(?!/)[^\s]*$#', $v) || preg_match('/^#[^\s]*$/', $v)) {
            return $v;
        }
        if (! str_contains($v, ':') && ! str_starts_with($v, '//') && preg_match('#^[A-Za-z0-9_\-./?=&%\#]+$#', $v)) {
            return '/'.ltrim($v, '/');
        }

        return '';
    }

    /** href / src to print: root-relative paths become absolute URLs of this site. */
    public static function href(string $u): string
    {
        if ($u !== '' && $u[0] === '/' && ! str_starts_with($u, '//')) {
            return url($u);
        }

        return $u;
    }

    // ------------------------------------------------------------------ CSS helpers

    public static function rgba(string $hex, $alphaPct): string
    {
        $hex = self::hex($hex, '#000000');
        $r = hexdec(substr($hex, 1, 2));
        $g = hexdec(substr($hex, 3, 2));
        $b = hexdec(substr($hex, 5, 2));
        $a = rtrim(rtrim(number_format(max(0, min(100, (float) $alphaPct)) / 100, 2, '.', ''), '0'), '.');

        return 'rgba('.$r.','.$g.','.$b.','.($a === '' ? '0' : $a).')';
    }

    public static function gradientCss(array $g): string
    {
        $stops = array_values((array) ($g['stops'] ?? []));
        usort($stops, fn ($a, $b) => ($a['pos'] ?? 0) <=> ($b['pos'] ?? 0));
        $parts = [];
        foreach ($stops as $s) {
            $parts[] = self::rgba((string) ($s['color'] ?? '#000000'), $s['alpha'] ?? 100).' '.rtrim(rtrim(number_format((float) ($s['pos'] ?? 0), 1, '.', ''), '0'), '.').'%';
        }
        if (count($parts) < 2) {
            $parts = ['rgba(12,120,69,1) 0%', 'rgba(255,112,0,1) 100%'];
        }
        if (($g['type'] ?? 'linear') === 'radial') {
            return 'radial-gradient(ellipse at 50% 50%, '.implode(', ', $parts).')';
        }

        return 'linear-gradient('.(int) ($g['angle'] ?? 180).'deg, '.implode(', ', $parts).')';
    }

    public static function overlayCss(array $ov): string
    {
        $mode = $ov['mode'] ?? 'none';
        if ($mode === 'color') {
            return 'background:'.self::rgba((string) ($ov['color'] ?? '#000000'), $ov['opacity'] ?? 40);
        }
        if ($mode === 'gradient') {
            return 'background:'.self::gradientCss((array) ($ov['gradient'] ?? self::defaultGradient()));
        }

        return '';
    }

    /** Title text -> safe HTML: line breaks and [[highlight]]. */
    public static function titleHtml(string $t): string
    {
        $h = e($t);
        $h = (string) preg_replace('/\[\[(.+?)\]\]/su', '<span class="hs-accent">$1</span>', $h);

        return nl2br($h, false);
    }

    public static function videoType(string $url): string
    {
        $p = strtolower((string) parse_url($url, PHP_URL_PATH));

        return str_ends_with($p, '.webm') ? 'video/webm' : (str_ends_with($p, '.ogv') || str_ends_with($p, '.ogg') ? 'video/ogg' : 'video/mp4');
    }

    // ------------------------------------------------------------------ normalisation

    private static function normGradient($g, array $def): array
    {
        $g = is_array($g) ? $g : [];
        $stops = [];
        foreach (array_slice(array_values((array) ($g['stops'] ?? [])), 0, 4) as $s) {
            if (! is_array($s)) {
                continue;
            }
            $stops[] = [
                'color' => self::hex($s['color'] ?? null, '#000000'),
                'alpha' => self::int($s['alpha'] ?? 100, 0, 100, 100),
                'pos' => round(self::num($s['pos'] ?? 0, 0, 100, 0), 1),
            ];
        }
        if (count($stops) < 2) {
            $stops = $def['stops'];
        }
        usort($stops, fn ($a, $b) => $a['pos'] <=> $b['pos']);

        return [
            'type' => self::enum($g['type'] ?? null, ['linear', 'radial'], $def['type']),
            'angle' => self::int($g['angle'] ?? $def['angle'], 0, 360, (int) $def['angle']),
            'stops' => $stops,
        ];
    }

    private static function normButton($b, array $def): array
    {
        $b = is_array($b) ? $b : [];
        $icon = strtolower(self::line($b['icon'] ?? '', 40));
        $icon = preg_match('/^[a-z0-9_]{1,40}$/', $icon) ? $icon : '';

        return [
            'visible' => self::bool($b['visible'] ?? null, $def['visible']),
            'label' => self::line($b['label'] ?? $def['label'], 60),
            'url' => self::url($b['url'] ?? '') ?: ($def['url'] ?? ''),
            'style' => self::enum($b['style'] ?? null, self::BTN_STYLES, $def['style']),
            'icon' => $icon,
            'new_tab' => self::bool($b['new_tab'] ?? null, false),
        ];
    }

    /** Tolerant normalisation (fills missing keys with defaults, clamps numbers). Used on read and after validation on save. */
    public static function normSlide($in, ?array $base = null): array
    {
        $d = $base ?? self::defaultSlide();
        $in = is_array($in) ? $in : [];
        $c = (array) ($in['content'] ?? []);
        $st = (array) ($in['style'] ?? []);
        $bg = (array) ($in['background'] ?? []);
        $ov = (array) ($bg['overlay'] ?? []);

        return [
            'id' => isset($in['id']) && is_numeric($in['id']) ? (int) $in['id'] : null,
            'is_visible' => self::bool($in['is_visible'] ?? null, true),
            'label' => self::line($in['label'] ?? '', 150),
            'duration' => self::int($in['duration'] ?? 0, 0, 120, 0),
            'content' => [
                'badge' => self::line($c['badge'] ?? '', 120),
                'badge2' => self::line($c['badge2'] ?? '', 120),
                'eyebrow' => self::line($c['eyebrow'] ?? '', 120),
                'title' => self::str($c['title'] ?? '', 300),
                'subtitle' => self::str($c['subtitle'] ?? '', 800),
                'btn1' => self::normButton($c['btn1'] ?? [], $d['content']['btn1']),
                'btn2' => self::normButton($c['btn2'] ?? [], $d['content']['btn2']),
            ],
            'style' => [
                'v' => self::enum($st['v'] ?? null, ['top', 'middle', 'bottom'], 'middle'),
                'h' => self::enum($st['h'] ?? null, ['right', 'center', 'left'], 'right'),
                'align' => self::enum($st['align'] ?? null, ['right', 'center', 'left'], 'right'),
                'title_color' => self::hex($st['title_color'] ?? null, $d['style']['title_color']),
                'text_color' => self::hex($st['text_color'] ?? null, $d['style']['text_color']),
                'eyebrow_color' => self::hex($st['eyebrow_color'] ?? null, $d['style']['eyebrow_color']),
                'accent_color' => self::hex($st['accent_color'] ?? null, $d['style']['accent_color']),
                'title_size' => self::int($st['title_size'] ?? 100, 50, 200, 100),
                'text_size' => self::int($st['text_size'] ?? 100, 50, 200, 100),
            ],
            'background' => [
                'type' => self::enum($bg['type'] ?? null, self::BG_TYPES, 'image'),
                'image' => ['url' => self::url($bg['image']['url'] ?? ''), 'id' => isset($bg['image']['id']) && is_numeric($bg['image']['id']) ? (int) $bg['image']['id'] : null],
                'video' => [
                    'url' => self::url($bg['video']['url'] ?? ''),
                    'poster' => self::url($bg['video']['poster'] ?? ''),
                    'id' => isset($bg['video']['id']) && is_numeric($bg['video']['id']) ? (int) $bg['video']['id'] : null,
                ],
                'color' => self::hex($bg['color'] ?? null, $d['background']['color']),
                'gradient' => self::normGradient($bg['gradient'] ?? null, $d['background']['gradient']),
                'fit' => self::enum($bg['fit'] ?? null, ['cover', 'contain'], 'cover'),
                'focus_x' => self::int($bg['focus_x'] ?? 50, 0, 100, 50),
                'focus_y' => self::int($bg['focus_y'] ?? 50, 0, 100, 50),
                'zoom' => self::int($bg['zoom'] ?? 100, 100, 250, 100),
                'grayscale' => self::int($bg['grayscale'] ?? 0, 0, 100, 0),
                'motion' => self::bool($bg['motion'] ?? null, false),
                'overlay' => [
                    'mode' => self::enum($ov['mode'] ?? null, ['none', 'color', 'gradient'], 'none'),
                    'color' => self::hex($ov['color'] ?? null, '#000000'),
                    'opacity' => self::int($ov['opacity'] ?? 40, 0, 100, 40),
                    'gradient' => self::normGradient($ov['gradient'] ?? null, self::defaultGradient()),
                ],
            ],
        ];
    }

    public static function normSettings($in): array
    {
        $d = self::defaultSettings();
        $in = is_array($in) ? $in : [];
        $unit = self::enum($in['height_unit'] ?? null, ['vh', 'px'], 'vh');

        return [
            'enabled' => self::bool($in['enabled'] ?? null, $d['enabled']),
            'height_mode' => self::enum($in['height_mode'] ?? null, ['full', '70vh', 'custom'], 'full'),
            'height_value' => self::int($in['height_value'] ?? $d['height_value'], $unit === 'px' ? 320 : 30, $unit === 'px' ? 1600 : 100, $unit === 'px' ? 640 : 80),
            'height_unit' => $unit,
            'autoplay' => self::bool($in['autoplay'] ?? null, $d['autoplay']),
            'interval' => self::int($in['interval'] ?? $d['interval'], 2, 60, 6),
            'arrows' => self::bool($in['arrows'] ?? null, $d['arrows']),
            'dots' => self::bool($in['dots'] ?? null, $d['dots']),
            'loop' => self::bool($in['loop'] ?? null, $d['loop']),
            'pause_hover' => self::bool($in['pause_hover'] ?? null, $d['pause_hover']),
            'scroll_hint' => self::bool($in['scroll_hint'] ?? null, $d['scroll_hint']),
            'transition' => self::enum($in['transition'] ?? null, ['fade', 'slide'], 'fade'),
            'speed' => self::int($in['speed'] ?? $d['speed'], 200, 3000, 800),
            'theme_follow' => self::bool($in['theme_follow'] ?? null, $d['theme_follow']),
        ];
    }

    // ------------------------------------------------------------------ validation (admin save)

    /** @return array<string,string> errors keyed like "slides.0.content.btn1.url" (empty = valid) */
    public static function validate(array $payload): array
    {
        $err = [];
        $slides = $payload['slides'] ?? null;
        if (! is_array($slides) || count($slides) < 1) {
            return ['slides' => 'يجب أن تبقى شريحة واحدة على الأقل (يمكنك إخفاؤها بدل حذفها).'];
        }
        if (count($slides) > self::MAX_SLIDES) {
            return ['slides' => 'الحد الأقصى '.self::MAX_SLIDES.' شريحة.'];
        }
        $set = $payload['settings'] ?? [];
        if (! is_array($set)) {
            $err['settings'] = 'إعدادات الهيرو غير صالحة.';
        } else {
            foreach (['interval' => [2, 60, 'مدة التبديل'], 'speed' => [200, 3000, 'سرعة الانتقال']] as $k => [$min, $max, $name]) {
                if (isset($set[$k]) && (! is_numeric($set[$k]) || $set[$k] < $min || $set[$k] > $max)) {
                    $err['settings.'.$k] = $name.' يجب أن تكون بين '.$min.' و'.$max.'.';
                }
            }
            if (($set['height_mode'] ?? '') === 'custom') {
                $px = ($set['height_unit'] ?? 'vh') === 'px';
                $v = $set['height_value'] ?? null;
                if (! is_numeric($v) || $v < ($px ? 320 : 30) || $v > ($px ? 1600 : 100)) {
                    $err['settings.height_value'] = $px ? 'الارتفاع المخصص بين 320 و1600 بكسل.' : 'الارتفاع المخصص بين 30 و100 من ارتفاع الشاشة.';
                }
            }
        }
        foreach (array_values($slides) as $i => $s) {
            $p = 'slides.'.$i.'.';
            $n = $i + 1;
            if (! is_array($s)) {
                $err[$p.'label'] = 'بيانات الشريحة '.$n.' غير صالحة.';
                continue;
            }
            $c = (array) ($s['content'] ?? []);
            $st = (array) ($s['style'] ?? []);
            $bg = (array) ($s['background'] ?? []);
            foreach ([['label', $s['label'] ?? '', 150, 'اسم الشريحة'], ['content.title', $c['title'] ?? '', 300, 'العنوان'], ['content.subtitle', $c['subtitle'] ?? '', 800, 'الوصف'],
                ['content.badge', $c['badge'] ?? '', 120, 'الشارة'], ['content.badge2', $c['badge2'] ?? '', 120, 'نص الشارة الثاني'], ['content.eyebrow', $c['eyebrow'] ?? '', 120, 'العنوان الصغير']] as [$k, $v, $max, $name]) {
                if (is_string($v) && mb_strlen($v) > $max) {
                    $err[$p.$k] = $name.' أطول من '.$max.' حرفاً (الشريحة '.$n.').';
                }
            }
            foreach (['btn1' => 'الزر الأول', 'btn2' => 'الزر الثاني'] as $bk => $bn) {
                $b = (array) ($c[$bk] ?? []);
                if (self::bool($b['visible'] ?? false)) {
                    if (trim((string) ($b['label'] ?? '')) === '') {
                        $err[$p.'content.'.$bk.'.label'] = 'اكتب نص '.$bn.' أو أخفِه (الشريحة '.$n.').';
                    } elseif (mb_strlen((string) $b['label']) > 60) {
                        $err[$p.'content.'.$bk.'.label'] = 'نص '.$bn.' أطول من 60 حرفاً (الشريحة '.$n.').';
                    }
                    if (self::url($b['url'] ?? '') === '') {
                        $err[$p.'content.'.$bk.'.url'] = 'رابط '.$bn.' غير صالح. استخدم رابطاً كاملاً أو مساراً يبدأ بـ / أو #قسم (الشريحة '.$n.').';
                    }
                }
            }
            foreach (['title_color', 'text_color', 'eyebrow_color', 'accent_color'] as $ck) {
                if (isset($st[$ck]) && ! self::isHex($st[$ck])) {
                    $err[$p.'style.'.$ck] = 'لون غير صالح (الشريحة '.$n.').';
                }
            }
            $type = $bg['type'] ?? 'image';
            if (! in_array($type, self::BG_TYPES, true)) {
                $err[$p.'background.type'] = 'نوع الخلفية غير صالح (الشريحة '.$n.').';
            } elseif ($type === 'image' && self::url($bg['image']['url'] ?? '') === '') {
                $err[$p.'background.image.url'] = 'اختر صورة الخلفية للشريحة '.$n.' أو غيّر نوع الخلفية.';
            } elseif ($type === 'video') {
                if (self::url($bg['video']['url'] ?? '') === '') {
                    $err[$p.'background.video.url'] = 'أدخل رابط الفيديو أو ارفعه للشريحة '.$n.'.';
                }
                if (trim((string) ($bg['video']['poster'] ?? '')) !== '' && self::url($bg['video']['poster']) === '') {
                    $err[$p.'background.video.poster'] = 'رابط صورة الغلاف غير صالح (الشريحة '.$n.').';
                }
            }
            if (isset($bg['color']) && ! self::isHex($bg['color'])) {
                $err[$p.'background.color'] = 'لون الخلفية غير صالح (الشريحة '.$n.').';
            }
            $grads = ['background.gradient' => $bg['gradient'] ?? null, 'background.overlay.gradient' => $bg['overlay']['gradient'] ?? null];
            foreach ($grads as $gk => $g) {
                if ($g === null) {
                    continue;
                }
                $cnt = is_array($g) ? count((array) ($g['stops'] ?? [])) : 0;
                if ($cnt < 2 || $cnt > 4) {
                    $err[$p.$gk] = 'التدرّج يحتاج من نقطتين إلى 4 نقاط لونية (الشريحة '.$n.').';
                } else {
                    foreach ($g['stops'] as $stop) {
                        if (! is_array($stop) || ! self::isHex($stop['color'] ?? null)) {
                            $err[$p.$gk] = 'لون غير صالح في التدرّج (الشريحة '.$n.').';
                            break;
                        }
                    }
                }
            }
        }

        return $err;
    }

    // ------------------------------------------------------------------ storage

    public static function tablesExist(): bool
    {
        try {
            return Schema::hasTable('hero_slides') && Schema::hasTable('hero_settings');
        } catch (\Throwable $e) {
            return false;
        }
    }

    public static function slideFromRow(HeroSlide $r): array
    {
        $s = self::normSlide([
            'id' => $r->id, 'is_visible' => (bool) $r->is_visible, 'label' => $r->label, 'duration' => $r->duration_seconds,
            'content' => $r->content, 'style' => $r->style, 'background' => $r->background,
        ]);
        $s['id'] = (int) $r->id;

        return $s;
    }

    public static function loadSettings(): array
    {
        try {
            if (self::tablesExist() && ($row = HeroSetting::query()->find(1))) {
                return self::normSettings($row->config);
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return self::defaultSettings();
    }

    /** @return array{settings:array,slides:array,from_db:bool} all slides (admin) — defaults when the table is empty */
    public static function loadAll(): array
    {
        $settings = self::loadSettings();
        try {
            if (self::tablesExist()) {
                $rows = HeroSlide::query()->orderBy('sort_order')->orderBy('id')->get();
                if ($rows->count()) {
                    return ['settings' => $settings, 'slides' => $rows->map(fn ($r) => self::slideFromRow($r))->values()->all(), 'from_db' => true];
                }
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return ['settings' => $settings, 'slides' => [self::defaultSlide()], 'from_db' => false];
    }

    /** What the public hero renders: only visible slides; defaults when nothing was ever saved. */
    public static function forSite(): array
    {
        $all = self::loadAll();

        return [
            'settings' => $all['settings'],
            'slides' => array_values(array_filter($all['slides'], fn ($s) => $s['is_visible'])),
        ];
    }

    /** Replaces settings + slides in one transaction. @return array fresh loadAll() */
    public static function save(array $payload, ?int $userId): array
    {
        $settings = self::normSettings($payload['settings'] ?? []);
        $incoming = array_values((array) $payload['slides']);
        DB::transaction(function () use ($settings, $incoming, $userId) {
            HeroSetting::query()->updateOrCreate(['id' => 1], ['config' => $settings, 'updated_by' => $userId]);
            $existing = HeroSlide::query()->pluck('id')->all();
            $keep = [];
            foreach ($incoming as $i => $raw) {
                $s = self::normSlide($raw);
                $label = $s['label'] !== '' ? $s['label'] : 'شريحة '.($i + 1);
                $data = [
                    'sort_order' => $i,
                    'is_visible' => $s['is_visible'],
                    'label' => $label,
                    'duration_seconds' => $s['duration'],
                    'bg_type' => $s['background']['type'],
                    'content' => $s['content'],
                    'style' => $s['style'],
                    'background' => $s['background'],
                    'updated_by' => $userId,
                ];
                if ($s['id'] && in_array($s['id'], $existing, true) && ! in_array($s['id'], $keep, true)) {
                    HeroSlide::query()->whereKey($s['id'])->first()?->update($data);
                    $keep[] = $s['id'];
                } else {
                    $keep[] = HeroSlide::query()->create($data + ['created_by' => $userId])->id;
                }
            }
            HeroSlide::query()->whereNotIn('id', $keep)->delete();
        });

        return self::loadAll();
    }

    /** Inserts the default settings + the slide equal to the original hero when the tables are empty. */
    public static function seed(bool $force = false): int
    {
        if (! self::tablesExist()) {
            return 0;
        }
        if (! $force && HeroSlide::query()->exists()) {
            return 0;
        }
        if ($force) {
            HeroSlide::query()->delete();
        }
        HeroSetting::query()->updateOrCreate(['id' => 1], ['config' => self::defaultSettings()]);
        $s = self::defaultSlide();
        HeroSlide::query()->create([
            'sort_order' => 0, 'is_visible' => true, 'label' => $s['label'], 'duration_seconds' => 0, 'bg_type' => $s['background']['type'],
            'content' => $s['content'], 'style' => $s['style'], 'background' => $s['background'],
        ]);

        return 1;
    }
}
