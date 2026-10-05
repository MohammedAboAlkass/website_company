<?php

namespace App\Support;

use App\Models\MediaFile;
use App\Models\Setting;

/**
 * «الرؤية والرسالة والقيم»: the three story cards shown on the home page (.ab-story) and on /about (.vmv-grid).
 * Stored as one JSON row in `settings` (key content.vision_cards, section content); when the row is missing or unreadable
 * the built-in defaults below (= the previously hard-coded texts / images / icons) are used, so the site never breaks.
 * The card ids are fixed (vision, mission, values); the editor can reorder them, hide any of them and edit their content.
 */
class VisionSupport
{
    public const KEY = 'content.vision_cards';

    public const MAX = ['tab' => 24, 'kicker' => 60, 'title' => 100, 'copy' => 400];

    /** @return array<int,array<string,mixed>> the original content (order = display order) */
    public static function defaults(): array
    {
        return [
            ['id' => 'vision', 'tab' => 'رؤيتنا', 'kicker' => 'أولوية القطاع المنكوب', 'title' => 'أن تبقى إغاثة غزة حاضرة وموثّقة',
                'copy' => 'مأوى آمن، وجبة يومية، ودواء يصل للخيمة قبل أن تضيع الكرامة في الزحام. نثبت الحضور في الشمال كما في رفح، والصورة قبل الشعار.',
                'image' => 'assets/site/img/gallery-children.jpg', 'icon' => 'visibility', 'visible' => true],
            ['id' => 'mission', 'tab' => 'رسالتنا', 'kicker' => 'ميثاق إغاثة غزة', 'title' => 'خبز ودواء وخيمة وتعليم لا ينتظر الجدران',
                'copy' => 'تدخّلات عاجلة داخل القطاع تجمع بين الإطعام والرعاية والتعليم المؤقت للأطفال النازحين في المدارس ومراكز الإيواء، من جباليا حتى جنوب القطاع.',
                'image' => 'assets/site/img/project-parallax.jpg', 'icon' => 'flag', 'visible' => true],
            ['id' => 'values', 'tab' => 'قيمنا', 'kicker' => 'ما لا نساوم عليه', 'title' => 'الكرامة والشفافية والأثر العاجل',
                'copy' => 'الكرامة أولاً في كل توزيع، والشفافية في توثيق كل سلة بالصورة، والأثر العاجل بالغذاء والدواء، والعدالة من جباليا حتى رفح.',
                'image' => 'assets/site/img/gallery-convoy.jpg', 'icon' => 'diamond', 'visible' => true],
        ];
    }

    /** Material Symbols names an editor may choose from (all exist in the bundled icon font). key => Arabic label */
    public static function icons(): array
    {
        return [
            'visibility' => 'عين (رؤية)', 'flag' => 'علم (رسالة)', 'diamond' => 'ماسة (قيم)', 'favorite' => 'قلب', 'volunteer_activism' => 'عطاء',
            'handshake' => 'مصافحة', 'diversity_3' => 'مجتمع', 'groups' => 'مجموعة', 'shield' => 'درع', 'verified' => 'موثوق',
            'balance' => 'ميزان', 'lightbulb' => 'فكرة', 'target' => 'هدف', 'school' => 'تعليم', 'public' => 'عالم',
            'health_and_safety' => 'صحة وسلامة', 'eco' => 'بيئة', 'star' => 'نجمة', 'bolt' => 'سرعة', 'workspace_premium' => 'تميّز',
        ];
    }

    public static function ids(): array
    {
        return array_column(self::defaults(), 'id');
    }

    /** Single-line plain text, trimmed (no tags / entities). */
    public static function clean($v): string
    {
        return is_scalar($v) ? ContentSupport::plainText((string) $v) : '';
    }

    /** Accepts only a bundled site image or a file that was uploaded through the media library; returns '' otherwise. */
    public static function imagePath($v): string
    {
        $p = ltrim(trim((string) (is_scalar($v) ? $v : '')), '/');
        if ($p === '' || strlen($p) > 255 || str_contains($p, '..') || preg_match('/[^A-Za-z0-9_\-.\/]/', $p)) {
            return '';
        }
        if (preg_match('#^assets/site/img/[A-Za-z0-9_\-./]+\.(jpe?g|png|webp|gif)$#i', $p)) {
            return $p;
        }
        if (preg_match('#^storage/(uploads/\d{4}/\d{2}/[A-Za-z0-9_\-]+\.(jpe?g|png|webp|gif))$#i', $p, $m)) {
            return $p;
        }

        return '';
    }

    /** True when the image can really be served: bundled file exists, or the upload is registered in media_files. */
    public static function imageExists(string $p): bool
    {
        if (str_starts_with($p, 'assets/site/img/')) {
            return is_file(public_path($p));
        }
        try {
            return MediaFile::query()->where('path', substr($p, strlen('storage/')))->exists();
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Cards for the editor / the site: stored values merged over the defaults (per card id), in stored order.
     *
     * @return array{cards:array<int,array<string,mixed>>,from_db:bool}
     */
    public static function loadAll(): array
    {
        $defaults = [];
        foreach (self::defaults() as $d) {
            $defaults[$d['id']] = $d;
        }
        $stored = null;
        try {
            $raw = Setting::query()->where('key', self::KEY)->value('value');
            if (is_string($raw) && $raw !== '') {
                $j = json_decode($raw, true);
                $stored = is_array($j) ? ($j['cards'] ?? null) : null;
            }
        } catch (\Throwable $e) {
            $stored = null; // table missing / DB down: fall back to the defaults
        }
        if (! is_array($stored)) {
            return ['cards' => array_values($defaults), 'from_db' => false];
        }
        $out = [];
        foreach ($stored as $c) {
            $id = is_array($c) ? ($c['id'] ?? null) : null;
            if (! is_string($id) || ! isset($defaults[$id]) || isset($out[$id])) {
                continue;
            }
            $d = $defaults[$id];
            $img = self::imagePath($c['image'] ?? '');
            $icon = (string) ($c['icon'] ?? '');
            $tab = self::clean($c['tab'] ?? '');
            $title = self::clean($c['title'] ?? '');
            $copy = self::clean($c['copy'] ?? '');
            $out[$id] = [
                'id' => $id,
                'tab' => $tab !== '' ? $tab : $d['tab'],
                'kicker' => array_key_exists('kicker', $c) ? self::clean($c['kicker']) : $d['kicker'],
                'title' => $title !== '' ? $title : $d['title'],
                'copy' => $copy !== '' ? $copy : $d['copy'],
                'image' => ($img !== '' && self::imageExists($img)) ? $img : $d['image'],
                'icon' => isset(self::icons()[$icon]) ? $icon : $d['icon'],
                'visible' => array_key_exists('visible', $c) ? (bool) $c['visible'] : true,
            ];
        }
        foreach ($defaults as $id => $d) { // a card missing from the stored list comes back (visible, at the end)
            if (! isset($out[$id])) {
                $out[$id] = $d;
            }
        }

        return ['cards' => array_values($out), 'from_db' => true];
    }

    /** Visible cards only (display order), what the public pages render. */
    public static function visible(): array
    {
        return array_values(array_filter(self::loadAll()['cards'], fn ($c) => $c['visible']));
    }

    /** @return array<string,string> field path => Arabic message ("cards.0.title") */
    public static function validate(array $payload): array
    {
        $err = [];
        $cards = $payload['cards'] ?? null;
        if (! is_array($cards) || array_values($cards) !== $cards) {
            return ['cards' => 'بيانات البطاقات غير صالحة.'];
        }
        $want = self::ids();
        $seen = [];
        foreach ($cards as $c) {
            $seen[] = is_array($c) ? (string) ($c['id'] ?? '') : '';
        }
        if (count($seen) !== count($want) || array_diff($want, $seen) || array_diff($seen, $want)) {
            return ['cards' => 'يجب أن تحتوي القائمة على البطاقات الثلاث (الرؤية والرسالة والقيم) مرة واحدة لكل منها.'];
        }
        $labels = ['tab' => 'عنوان التبويب', 'kicker' => 'العنوان الفرعي', 'title' => 'العنوان', 'copy' => 'النص'];
        foreach ($cards as $i => $c) {
            $p = 'cards.'.$i.'.';
            foreach ($labels as $f => $label) {
                $raw = $c[$f] ?? '';
                if (! is_scalar($raw) && $raw !== null) {
                    $err[$p.$f] = $label.' غير صالح.';
                    continue;
                }
                $t = self::clean($raw);
                if ($f !== 'kicker' && $t === '') {
                    $err[$p.$f] = $label.' مطلوب.';
                } elseif (mb_strlen($t) > self::MAX[$f]) {
                    $err[$p.$f] = $label.' طويل جداً (الحد '.self::MAX[$f].' حرفاً).';
                }
            }
            $img = self::imagePath($c['image'] ?? '');
            if ($img === '' || ! self::imageExists($img)) {
                $err[$p.'image'] = 'اختر صورة صالحة للبطاقة (ارفع صورة أو استعد الصورة الافتراضية).';
            }
            if (! isset(self::icons()[(string) ($c['icon'] ?? '')])) {
                $err[$p.'icon'] = 'اختر أيقونة من القائمة.';
            }
            if (isset($c['visible']) && ! is_bool($c['visible']) && ! in_array($c['visible'], [0, 1, '0', '1'], true)) {
                $err[$p.'visible'] = 'قيمة الإظهار غير صالحة.';
            }
        }

        return $err;
    }

    /** Stores the (already validated) payload; returns the normalised cards as the editor / site will see them. */
    public static function save(array $payload, ?int $userId = null): array
    {
        $defaults = [];
        foreach (self::defaults() as $d) {
            $defaults[$d['id']] = $d;
        }
        $cards = [];
        foreach ($payload['cards'] as $c) {
            $cards[] = [
                'id' => (string) $c['id'],
                'tab' => self::clean($c['tab']),
                'kicker' => self::clean($c['kicker'] ?? ''),
                'title' => self::clean($c['title']),
                'copy' => self::clean($c['copy']),
                'image' => self::imagePath($c['image']),
                'icon' => (string) $c['icon'],
                'visible' => filter_var($c['visible'] ?? true, FILTER_VALIDATE_BOOLEAN),
            ];
        }
        $row = Setting::query()->where('key', self::KEY)->first() ?: new Setting(['key' => self::KEY]);
        $row->fill([
            'value' => json_encode(['cards' => $cards], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'type' => 'json',
            'section' => 'content',
            'label' => 'بطاقات الرؤية والرسالة والقيم (الصفحة الرئيسية وصفحة من نحن)',
            'is_public' => true,
            'sort_order' => $row->exists ? (int) $row->sort_order : 0,
        ])->save();

        return self::loadAll()['cards'];
    }
}
