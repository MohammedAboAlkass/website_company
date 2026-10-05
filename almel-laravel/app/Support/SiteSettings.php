<?php

namespace App\Support;

use App\Models\Page;
use App\Models\Setting;

/**
 * Public-site readers for the settings that the control panel (or the seed) writes but the pages did not use yet:
 * contact notes, field points, newsletter box, brand colour, logo / favicon, social links, footer menu and the SEO block.
 * Every reader falls back to the exact text / markup the site had before, so an empty setting never changes the page.
 */
class SiteSettings
{
    public const DEFAULT_ORG = 'جمعية الشمال للتنمية والتطوير المجتمعي';
    public const DEFAULT_HOTLINE_NOTE = 'متاح 24/7';
    public const DEFAULT_EMAIL_NOTE = 'الرد خلال ساعتين';
    public const DEFAULT_FIELD_POINTS = ['جباليا وبيت حانون', 'غزة المدينة والشاطئ', 'دير البلح', 'خان يونس ورفح'];
    public const DEFAULT_NEWSLETTER_TITLE = 'النشرة البريدية';
    public const DEFAULT_NEWSLETTER_TEXT = 'اشترك لتصلك تقارير الأثر من غزة والحملات الطارئة.';
    public const DEFAULT_BRAND_COLOR = '#0c7845';
    public const BRAND_MIMES = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/gif' => 'gif', 'image/webp' => 'webp', 'image/x-icon' => 'ico', 'image/vnd.microsoft.icon' => 'ico', 'image/svg+xml' => 'svg'];

    private static ?array $rows = null;

    /** All settings as key => value (one query per request). */
    public static function rows(): array
    {
        if (self::$rows !== null) {
            return self::$rows;
        }
        try {
            return self::$rows = Setting::query()->pluck('value', 'key')->all();
        } catch (\Throwable $e) {
            report($e);

            return self::$rows = [];
        }
    }

    public static function forget(): void
    {
        self::$rows = null;
    }

    public static function str(string $key, string $default = ''): string
    {
        $v = self::rows()[$key] ?? null;

        return is_string($v) && trim($v) !== '' ? trim($v) : $default;
    }

    public static function flag(string $key, bool $default): bool
    {
        $v = self::rows()[$key] ?? null;

        return $v === null || $v === '' ? $default : filter_var($v, FILTER_VALIDATE_BOOLEAN);
    }

    // ------------------------------------------------------------------ contact / footer texts

    public static function hotlineNote(): string
    {
        return mb_substr(self::str('contact.hotline_note', self::DEFAULT_HOTLINE_NOTE), 0, 80);
    }

    public static function emailNote(): string
    {
        return mb_substr(self::str('contact.email_response_note', self::DEFAULT_EMAIL_NOTE), 0, 80);
    }

    /** «نقاط الميدان داخل غزة»: items split by • (or new lines), at most 8. */
    public static function fieldPoints(): array
    {
        $raw = self::str('contact.field_points', '');
        $items = array_values(array_filter(array_map(fn ($x) => trim($x), preg_split('/[•\r\n]+/u', $raw) ?: []), fn ($x) => $x !== ''));
        $items = array_map(fn ($x) => mb_substr($x, 0, 60), array_slice($items, 0, 8));

        return $items ?: self::DEFAULT_FIELD_POINTS;
    }

    /** @return array{title: string, text: string} */
    public static function newsletter(): array
    {
        return [
            'title' => mb_substr(self::str('footer.newsletter_title', self::DEFAULT_NEWSLETTER_TITLE), 0, 80),
            'text' => mb_substr(self::str('footer.newsletter_text', self::DEFAULT_NEWSLETTER_TEXT), 0, 300),
        ];
    }

    /** #rrggbb in lower case for <meta name="theme-color">: the primary colour of «مظهر الموقع» (site.theme), else the legacy site.brand_color. */
    public static function brandColor(): string
    {
        if (($t = SiteTheme::primaryOrNull()) !== null) {
            return $t;
        }
        $v = self::str('site.brand_color', '');

        return preg_match('/^#[0-9a-fA-F]{6}$/', $v) ? strtolower($v) : self::DEFAULT_BRAND_COLOR;
    }

    // ------------------------------------------------------------------ logo / favicon

    /** [mime, bytes] of a stored data-URI image, or null when empty / invalid. */
    public static function brandAsset(string $key): ?array
    {
        static $memo = [];
        if (array_key_exists($key, $memo)) {
            return $memo[$key];
        }
        $v = self::str($key, '');
        if ($v === '' || ! preg_match('~^data:(image/[a-z0-9.+\-]+);base64,([A-Za-z0-9+/=\s]+)$~', $v, $m) || ! isset(self::BRAND_MIMES[$m[1]])) {
            return $memo[$key] = null;
        }
        $bin = base64_decode(preg_replace('/\s+/', '', $m[2]) ?? '', true);
        if ($bin === false || $bin === '' || strlen($bin) > 600000) {
            return $memo[$key] = null;
        }
        $mime = $m[1];
        $ok = match (true) {
            $mime === 'image/svg+xml' => (bool) preg_match('/<svg[\s>]/i', $bin),
            in_array($mime, ['image/x-icon', 'image/vnd.microsoft.icon'], true) => substr($bin, 0, 4) === "\x00\x00\x01\x00",
            default => (($i = @getimagesizefromstring($bin)) !== false && ($i['mime'] ?? '') === $mime),
        };

        return $memo[$key] = $ok ? [$mime, $bin] : null;
    }

    /** Public URL of the logo / favicon: stored data-URI (served by /brand/*), a safe path or https URL, or the built-in image. */
    private static function brandUrl(string $key, string $route, string $fallback): array
    {
        $v = self::str($key, '');
        if ($v !== '' && str_starts_with($v, 'data:')) {
            $a = self::brandAsset($key);
            if ($a) {
                return [url('/brand/'.$route).'?v='.substr(md5($v), 0, 8), $a[0]];
            }

            return [$fallback, 'image/png'];
        }
        if ($v !== '' && preg_match('~^(https://|/(?![/\\\\]))[^\s"\'<>\\\\]+$~', $v)) {
            return [str_starts_with($v, '/') ? url($v) : $v, null];
        }
        if ($v !== '' && preg_match('~^assets/[A-Za-z0-9_./\-]+$~', $v)) {
            return [asset($v), null];
        }

        return [$fallback, 'image/png'];
    }

    public static function logoUrl(): string
    {
        return self::brandUrl('org.logo', 'logo', asset('assets/site/img/logo.png'))[0];
    }

    /** @return array{0: string, 1: string|null} [url, mime-type] */
    public static function favicon(): array
    {
        $r = self::brandUrl('org.favicon', 'favicon', asset('assets/site/img/logo.png'));
        if ($r[1] === null) {
            $ext = strtolower(pathinfo((string) parse_url($r[0], PHP_URL_PATH), PATHINFO_EXTENSION));
            $r[1] = ['ico' => 'image/x-icon', 'svg' => 'image/svg+xml', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'gif' => 'image/gif', 'webp' => 'image/webp'][$ext] ?? 'image/png';
        }

        return $r;
    }

    // ------------------------------------------------------------------ social links (settings seo.social)

    public const SOCIAL = [
        'facebook' => 'فيسبوك',
        'x' => 'إكس (تويتر)',
        'instagram' => 'إنستغرام',
        'youtube' => 'يوتيوب',
        'telegram' => 'تيليجرام',
        'whatsapp' => 'واتساب',
    ];

    /** @return array<int, array{key: string, label: string, url: string}> only the accounts that are set and look like real http(s) addresses */
    public static function socials(): array
    {
        $raw = self::rows()['seo.social'] ?? null;
        $j = is_string($raw) ? json_decode($raw, true) : null;
        if (! is_array($j)) {
            return [];
        }
        $out = [];
        foreach (self::SOCIAL as $k => $label) {
            $v = trim((string) ($j[$k] ?? ''));
            if ($v === '' || mb_strlen($v) > 200 || preg_match('/[\s"\'<>\\\\\x00-\x1F]/u', $v)) {
                continue;
            }
            if (! preg_match('~^https?://~i', $v)) {
                if (str_contains($v, '://') || preg_match('~^[a-z]+:~i', $v)) {
                    continue; // javascript:, data:, mailto: ... are never linked
                }
                $v = 'https://'.ltrim($v, '/');
            }
            $host = (string) parse_url($v, PHP_URL_HOST);
            if (! preg_match('/^[a-z0-9]([a-z0-9\-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]*[a-z0-9])?)+$/i', $host)) {
                continue;
            }
            $out[] = ['key' => $k, 'label' => $label, 'url' => $v];
        }

        return $out;
    }

    // ------------------------------------------------------------------ footer menu (menus.slug = footer)

    /**
     * The footer from «إدارة القائمة» (menu "footer"): top-level items with children = link columns, top-level items without
     * children = the small links of the bottom bar. null = the menu is missing / empty (the static footer stays).
     *
     * @return array{columns: array<int, array{title: string, links: array}>, bottom: array}|null
     */
    public static function footerMenu(bool $home = false): ?array
    {
        try {
            $tree = MenuSupport::publicTree('footer');
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
        if (! $tree) {
            return null;
        }
        $pages = null;
        $columns = [];
        $bottom = [];
        $link = function (array $it) use ($home, &$pages): ?array {
            $label = trim((string) ($it['label'] ?? ''));
            if ($label === '') {
                return null;
            }
            $raw = trim((string) ($it['url'] ?? ''));
            if ($raw === '' || $raw === '#') {
                $pages ??= self::publishedPageTitles();
                $slug = array_search($label, $pages, true);
                $href = $slug !== false ? url('/'.$slug) : '#';
                if ($slug === false && $raw === '') {
                    return null;
                }
            } else {
                $href = self::footerHref($raw, $home);
            }

            return ['label' => $label, 'href' => $href, 'newTab' => ! empty($it['newTab'])];
        };
        foreach ($tree as $it) {
            $kids = [];
            foreach (($it['children'] ?? []) as $c) {
                if ($l = $link($c)) {
                    $kids[] = $l;
                }
            }
            if ($kids) {
                $columns[] = ['title' => trim((string) ($it['label'] ?? '')), 'links' => $kids];
            } elseif ($l = $link($it)) {
                $bottom[] = $l;
            }
        }
        if (! $columns && ! $bottom) {
            return null;
        }

        return ['columns' => $columns, 'bottom' => $bottom];
    }

    /** slug => title of the published CMS pages. */
    private static function publishedPageTitles(): array
    {
        try {
            return Page::query()->where('status', 'published')->pluck('title', 'slug')->map(fn ($t) => trim((string) $t))->all();
        } catch (\Throwable $e) {
            report($e);

            return [];
        }
    }

    /** Menu URL (root-relative "/about#vision", "#x", https://…) -> the href printed in the footer. */
    public static function footerHref(string $u, bool $home): string
    {
        $u = SiteContent::safeUrl($u, '#');
        if ($u === '#' || preg_match('~^(https?:|mailto:|tel:)~i', $u)) {
            return $u;
        }
        if ($u[0] === '#') {
            return $u;
        }
        $path = (string) parse_url($u, PHP_URL_PATH);
        $frag = (string) parse_url($u, PHP_URL_FRAGMENT);
        $query = (string) parse_url($u, PHP_URL_QUERY);
        $full = url($path === '' ? '/' : $path).($query !== '' ? '?'.$query : '').($frag !== '' ? '#'.$frag : '');
        if (! $home) {
            return $full;
        }
        // one-page home footer: links to sections that are on this page become anchors
        if ($path === '/' || $path === '') {
            return $frag !== '' ? '#'.$frag : '#hero';
        }
        $exact = ['/about' => 'about', '/projects' => 'projects', '/news' => 'news', '/gallery' => 'gallery', '/contact' => 'contact'];
        $sec = $exact[rtrim($path, '/')] ?? (str_starts_with($path, '/projects/') ? 'projects' : null);
        if ($sec !== null && $query === '' && HomeSections::visible($sec)) {
            return '#'.$sec;
        }

        return $full;
    }

    // ------------------------------------------------------------------ SEO (settings seo.*)

    /** Page title: CMS title as written; otherwise the view's own title re-wrapped by seo.title_template / seo.title_suffix. */
    public static function title(string $cms, string $yielded, bool $isHome): string
    {
        $cms = trim($cms);
        if ($cms !== '') {
            return $cms;
        }
        $org = self::str('org.name', self::DEFAULT_ORG);
        $yielded = trim($yielded);
        if ($isHome || $yielded === '') {
            return self::str('seo.default_title', $yielded !== '' ? $yielded : $org);
        }
        // views end their title with the legacy suffix; strip it and apply the configured template
        $base = preg_replace('/(\s*—\s*'.preg_quote(self::DEFAULT_ORG, '/').')+\s*$/u', '', $yielded) ?? $yielded;
        $base = $base !== '' ? $base : $yielded;
        $tpl = self::str('seo.title_template', '');
        if ($tpl !== '' && str_contains($tpl, '%s')) {
            return trim(str_replace('%s', $base, $tpl));
        }
        $suffix = self::str('seo.title_suffix', '');
        if ($suffix !== '') {
            return $base.' '.$suffix;
        }

        return $yielded;
    }

    /** Page description: CMS text; the home page then prefers seo.default_description over the view's built-in text; then the view's own; then the settings fallbacks. */
    public static function description(string $cms, string $yielded, bool $isHome = false): string
    {
        $default = self::str('seo.default_description', '');
        $chain = $isHome ? [$cms, $default, $yielded] : [$cms, $yielded, $default];
        foreach (array_merge($chain, [self::str('org.tagline', '')]) as $d) {
            $d = trim((string) $d);
            if ($d !== '') {
                return $d;
            }
        }

        return self::str('org.name', self::DEFAULT_ORG);
    }

    public static function indexable(): bool
    {
        return self::flag('seo.index', true);
    }

    public static function sitemapOn(): bool
    {
        return self::flag('seo.sitemap', true) && self::indexable();
    }

    /** Absolute URL of the share image (seo.og_image): root-relative path, assets/… or https URL; null when empty / unsafe. */
    public static function ogImage(): ?string
    {
        $v = self::str('seo.og_image', '');
        if ($v === '') {
            return null;
        }
        if (preg_match('~^https://[^\s"\'<>\\\\]+$~', $v)) {
            return $v;
        }
        if (preg_match('~^/?[A-Za-z0-9_./%\-\p{Arabic}]+$~u', $v) && ! str_contains($v, '..')) {
            return url('/'.ltrim($v, '/'));
        }

        return null;
    }

    /** Google Analytics 4 measurement id (G-XXXXXXXX) or null. */
    public static function analyticsId(): ?string
    {
        $v = strtoupper(self::str('seo.analytics_id', ''));

        return preg_match('/^G-[A-Z0-9]{6,12}$/', $v) ? $v : null;
    }

    /** schema.org Organization (JSON-LD) built from the organisation settings. */
    public static function organizationLd(): array
    {
        $info = SiteContent::info();
        $ld = ['@context' => 'https://schema.org', '@type' => 'NGO', 'name' => $info['name'], 'url' => url('/'), 'logo' => self::logoUrl()];
        if ($info['tagline'] !== '') {
            $ld['slogan'] = $info['tagline'];
        }
        if ($info['email'] !== '') {
            $ld['email'] = $info['email'];
        }
        if ($info['tel'] !== '') {
            $ld['telephone'] = $info['tel'];
        }
        if ($info['address'] !== '') {
            $ld['address'] = $info['address'];
        }
        $same = array_column(self::socials(), 'url');
        if ($same) {
            $ld['sameAs'] = array_values($same);
        }

        return $ld;
    }
}
