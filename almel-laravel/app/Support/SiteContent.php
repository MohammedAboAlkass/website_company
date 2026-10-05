<?php

namespace App\Support;

use App\Models\Announcement;
use App\Models\Appeal;
use App\Models\Article;
use App\Models\MediaFile;
use App\Models\Project;
use App\Models\Page;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

/**
 * Read helpers for the PUBLIC site (everything comes from the database written by the control panel).
 * No caching on purpose: a change in the panel is visible on the next page load.
 */
class SiteContent
{
    public const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    /** Root-relative URL of a media row (null when missing). */
    public static function img(?MediaFile $m, ?string $fallback = null): ?string
    {
        $u = ContentSupport::mediaUrl($m);

        return $u ?: $fallback;
    }

    /** "15 ديسمبر 2024" */
    public static function date($d): string
    {
        if (! $d) {
            return '';
        }
        $c = $d instanceof Carbon ? $d : Carbon::parse($d);

        return $c->day.' '.self::MONTHS[$c->month - 1].' '.$c->year;
    }

    /** Public general settings with defaults (config/settings_defaults.php) as fallback. */
    public static function info(): array
    {
        static $info = null;
        if ($info !== null) {
            return $info;
        }
        $d = (array) config('settings_defaults.general', []);
        $rows = [];
        try {
            $rows = Setting::query()->whereIn('key', ['org.name', 'org.tagline', 'org.license', 'org.address', 'contact.email', 'contact.hotline', 'contact.whatsapp', 'org.website'])->pluck('value', 'key')->all();
        } catch (\Throwable $e) {
            report($e);
        }
        $pick = fn (string $key, string $def) => isset($rows[$key]) && trim((string) $rows[$key]) !== '' ? trim((string) $rows[$key]) : $def;
        $phone = $pick('contact.hotline', (string) ($d['phone'] ?? ''));

        return $info = [
            'name' => $pick('org.name', (string) ($d['orgName'] ?? 'جمعية الشمال للتنمية والتطوير المجتمعي')),
            'tagline' => $pick('org.tagline', (string) ($d['tagline'] ?? '')),
            'license' => $pick('org.license', (string) ($d['license'] ?? '')),
            'address' => $pick('org.address', (string) ($d['address'] ?? '')),
            'email' => $pick('contact.email', (string) ($d['email'] ?? '')),
            'phone' => $phone,
            // international digits for wa.me (972592945557) and the tel: form (+972592945557)
            'wa' => self::intlDigits($pick('contact.whatsapp', '')) ?: self::intlDigits($phone),
            'tel' => ($__t = self::intlDigits($phone)) !== '' ? '+'.$__t : '',
            'website' => $pick('org.website', (string) ($d['website'] ?? '')),
        ];
    }

    /**
     * Digits-only international form of a phone number. A local number with a leading 0 gets the country code
     * (default 972 — Palestine): 0592945557 → 972592945557; +972 59 294 5557 and 00972… are normalised the same way.
     */
    public static function intlDigits(string $raw, string $cc = '972'): string
    {
        $d = preg_replace('/\D+/', '', $raw) ?? '';
        if ($d === '') {
            return '';
        }
        if (str_starts_with($d, '00')) {
            return substr($d, 2);
        }
        if (str_starts_with($d, '0')) {
            return $cc.substr($d, 1);
        }

        return $d;
    }

    // ------------------------------------------------------------------ articles / projects

    public static function articlesQuery()
    {
        return Article::query()->published()->with(['category', 'cover']);
    }

    public static function projectsQuery()
    {
        return Project::query()->visible()
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->with(['program', 'governorate', 'cover', 'facts']);
    }

    /** Badge classes for a project / activity tone. */
    public static function tone(?string $tone): string
    {
        return match ($tone) {
            'urgent' => 'badge-urgent',
            'gold' => 'badge-gold',
            'light' => 'badge-light',
            'mid' => 'badge-mid',
            'wine' => 'badge-wine',
            default => 'badge-forest',
        };
    }

    public static function programIcon(?string $slug): string
    {
        return match ($slug) {
            'relief' => 'crisis_alert',
            'construction' => 'construction',
            'development' => 'trending_up',
            'health' => 'medical_services',
            default => 'folder_special',
        };
    }

    /** Only http(s), mailto, tel, root-relative and #anchors are allowed in links coming from the panel. */
    public static function safeUrl(?string $u, string $fallback = '#'): string
    {
        $u = trim((string) $u);
        if ($u === '') {
            return $fallback;
        }
        if (preg_match('/[\\\\\x00-\x1F\x7F]/', $u)) {
            return $fallback; // backslashes ("/\evil.com" is read as "//evil.com" by browsers) and control characters
        }
        if (preg_match('#^(https?://|mailto:|tel:|/(?![/\\\\])|\#)#i', $u)) {
            return $u;
        }

        return $fallback;
    }

    /** Plain text of a field that may hold rich HTML (for cards, meta lines, JSON). */
    public static function plain(?string $v): string
    {
        return ContentSupport::plainText((string) $v);
    }

    /** Safe HTML of a rich field: sanitised HTML, or escaped text with line breaks when it was saved as plain text. */
    public static function rich(?string $v): string
    {
        $v = (string) $v;
        if (trim($v) === '') {
            return '';
        }
        if (preg_match('/<\/?[a-z][^>]*>/i', $v)) {
            return HtmlSanitizer::clean($v);
        }

        return nl2br(e($v));
    }

    // ------------------------------------------------------------------ announcement bar / appeal

    /** ['label' => ..., 'items' => Collection] — empty when the bar is switched off. */
    public static function announcements(): array
    {
        $label = Setting::query()->where('key', 'announcement_bar.label')->value('value');
        $vis = Setting::query()->where('key', 'announcement_bar.visible')->value('value');
        $visible = $vis === null ? true : filter_var($vis, FILTER_VALIDATE_BOOLEAN);
        $items = $visible ? Announcement::query()->active()->orderBy('sort_order')->orderByDesc('id')->get() : collect();

        return ['label' => $label !== null && trim($label) !== '' ? $label : 'آخر الإعلانات', 'items' => $items];
    }

    public static function appeal(): ?Appeal
    {
        return Appeal::query()->active()->with('image')->orderByDesc('id')->first();
    }

    /** JS keys used by the static impact SVG. */
    public const GOV_KEYS = ['north-gaza' => 'north', 'gaza' => 'gaza', 'deir-al-balah' => 'deir', 'khan-younis' => 'khan', 'rafah' => 'rafah'];

    // ------------------------------------------------------------------ navigation / site cards (settings)

    /** Main menu from «إدارة القائمة» (menus.slug = header): ['items' => top-level non-button items (with children), 'cta' => first button item|null]; null = keep the static nav. */
    public static function nav(): ?array
    {
        static $nav = false;
        if ($nav !== false) {
            return $nav;
        }
        $nav = null;
        try {
            $tree = MenuSupport::publicTree('header');
            if (! $tree) {
                return null;
            }
            $items = [];
            $cta = null;
            $clean = function (array $it): array {
                $it['url'] = self::safeUrl($it['url'] ?? '', '#');
                $it['label'] = trim((string) ($it['label'] ?? ''));
                $it['icon'] = preg_match('/^[a-z0-9_]{1,40}$/', (string) ($it['icon'] ?? '')) ? $it['icon'] : '';

                return $it;
            };
            foreach ($tree as $it) {
                $it = $clean($it);
                if ($it['label'] === '') {
                    continue;
                }
                if (! empty($it['button'])) {
                    $cta ??= $it;
                    continue;
                }
                $kids = [];
                foreach (($it['children'] ?? []) as $c) {
                    $c = $clean($c);
                    if ($c['label'] !== '' && empty($c['button'])) {
                        $kids[] = $c;
                    }
                }
                $it['children'] = $kids;
                $items[] = $it;
            }

            return $nav = $items ? ['items' => $items, 'cta' => $cta] : null;
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    public const HERO_STAT_DEFAULTS = [
        ['icon' => 'volunteer_activism', 'value' => '180K+', 'label' => 'مستفيد في غزة'],
        ['icon' => 'verified', 'value' => '5', 'label' => 'محافظات القطاع'],
        ['icon' => '4k', 'value' => '+2,500', 'label' => 'مقطع موثّق من غزة'],
        ['icon' => 'shield', 'value' => '98.4%', 'label' => 'نسبة الشفافية والتدقيق'],
    ];

    public const HOURS_DEFAULT = 'الأحد - الخميس • 8:00 ص - 4:00 م';

    private static function siteRows(): array
    {
        static $rows = null;
        if ($rows !== null) {
            return $rows;
        }
        try {
            return $rows = Setting::query()->where('key', 'like', 'site.%')->pluck('value', 'key')->all();
        } catch (\Throwable $e) {
            report($e);

            return $rows = [];
        }
    }

    /** Opening-hours line (settings site.hours, editable in الإعدادات العامة). */
    public static function hours(): string
    {
        $v = trim((string) (self::siteRows()['site.hours'] ?? ''));

        return $v !== '' ? $v : self::HOURS_DEFAULT;
    }

    /** The four hero stat cards: icon, display value, label + the data-* attributes of the count-up animation. */
    public static function heroStats(): array
    {
        $rows = self::siteRows();
        $out = [];
        foreach (self::HERO_STAT_DEFAULTS as $i => $d) {
            $n = $i + 1;
            $val = trim((string) ($rows["site.hero_stat{$n}_value"] ?? ''));
            $label = trim((string) ($rows["site.hero_stat{$n}_label"] ?? ''));
            $val = $val !== '' ? $val : $d['value'];
            $label = $label !== '' ? $label : $d['label'];
            $attrs = [];
            if (preg_match('/^(\D*?)(\d[\d.,]*)(.*)$/u', $val, $m)) {
                $num = str_replace(',', '', $m[2]);
                if (is_numeric($num)) {
                    $attrs['data-count'] = $num;
                    if ($m[1] !== '') {
                        $attrs['data-prefix'] = $m[1];
                    }
                    if (trim($m[3]) !== '') {
                        $attrs['data-suffix'] = $m[3];
                    }
                    if (str_contains($m[2], ',')) {
                        $attrs['data-sep'] = 'true';
                    }
                    if (str_contains($num, '.')) {
                        $attrs['data-decimals'] = (string) strlen(substr($num, strpos($num, '.') + 1));
                    }
                }
            }
            $out[] = ['icon' => $d['icon'], 'value' => $val, 'label' => $label, 'attrs' => $attrs];
        }

        return $out;
    }

    // ------------------------------------------------------------------ CMS pages («إدارة الصفحات») for the built-in site pages

    /** The DB row of a built-in page (about, projects, news, gallery, contact). Not published (draft / hidden) = 404; no row = null (static page stays). */
    public static function page(string $slug): ?Page
    {
        try {
            $p = Page::query()->where('slug', $slug)->first();
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
        if ($p && $p->status !== 'published') {
            abort(404);
        }

        return $p;
    }

    /** SEO of a published CMS row without any gating (home page). */
    public static function seoFor(string $slug): void
    {
        try {
            self::seo(Page::query()->where('slug', $slug)->where('status', 'published')->first());
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /** Which of the given CMS page slugs are published (footer links to /privacy, /governance). */
    public static function publishedPages(array $slugs): array
    {
        try {
            return Page::query()->whereIn('slug', $slugs)->where('status', 'published')->pluck('slug')->all();
        } catch (\Throwable $e) {
            report($e);

            return [];
        }
    }

    /** Page SEO from the CMS row (title + description) for layouts/site.blade.php. */
    public static function seo(?Page $p): void
    {
        if (! $p) {
            return;
        }
        $t = trim((string) $p->seo_title);
        $d = trim((string) $p->meta_description);
        view()->share('seo', array_filter(['title' => $t, 'description' => $d]));
    }

    public static function tableOk(string $table): bool
    {
        try {
            return Schema::hasTable($table);
        } catch (\Throwable $e) {
            return false;
        }
    }
}
