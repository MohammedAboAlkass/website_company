<?php

namespace App\Support;

use App\Models\Setting;

/**
 * General settings <-> `settings` table.
 * Flat fields keep (or add) readable keys such as org.name / contact.email; complex blocks
 * (permission matrix, security policy, backup schedule, appearance...) are stored as one JSON row.
 */
class SettingsStore
{
    /** section => path => [key, type, row section, is_public] */
    public const MAP = [
        'general' => [
            'orgName' => ['org.name', 'string', 'org', 1],
            'tagline' => ['org.tagline', 'string', 'org', 1],
            'license' => ['org.license', 'string', 'org', 1],
            'website' => ['org.website', 'url', 'org', 1],
            'email' => ['contact.email', 'email', 'contact', 1],
            'phone' => ['contact.hotline', 'string', 'contact', 1],
            'address' => ['org.address', 'string', 'org', 1],
            'logo' => ['org.logo', 'string', 'org', 1],
            'favicon' => ['org.favicon', 'string', 'org', 1],
            'timezone' => ['site.timezone', 'string', 'general', 1],
            'language' => ['site.locale', 'string', 'general', 1],
            'dateFormat' => ['site.date_format', 'string', 'general', 1],
            'maintenance' => ['site.maintenance', 'bool', 'general', 1],
            'maintenanceMsg' => ['site.maintenance_message', 'text', 'general', 1],
            'hoursText' => ['site.hours', 'string', 'general', 1],
            'heroStat1Value' => ['site.hero_stat1_value', 'string', 'general', 1],
            'heroStat1Label' => ['site.hero_stat1_label', 'string', 'general', 1],
            'heroStat2Value' => ['site.hero_stat2_value', 'string', 'general', 1],
            'heroStat2Label' => ['site.hero_stat2_label', 'string', 'general', 1],
            'heroStat3Value' => ['site.hero_stat3_value', 'string', 'general', 1],
            'heroStat3Label' => ['site.hero_stat3_label', 'string', 'general', 1],
            'heroStat4Value' => ['site.hero_stat4_value', 'string', 'general', 1],
            'heroStat4Label' => ['site.hero_stat4_label', 'string', 'general', 1],
            'hotlineNote' => ['contact.hotline_note', 'string', 'contact', 1],
            'emailNote' => ['contact.email_response_note', 'string', 'contact', 1],
            'fieldPoints' => ['contact.field_points', 'string', 'contact', 1],
            'newsletterTitle' => ['footer.newsletter_title', 'string', 'footer', 1],
            'newsletterText' => ['footer.newsletter_text', 'text', 'footer', 1],
            'brandColor' => ['site.brand_color', 'color', 'general', 1],
        ],
        'seo' => [
            'titleTpl' => ['seo.title_template', 'string', 'seo', 1],
            'metaDesc' => ['seo.default_description', 'text', 'seo', 1],
            'index' => ['seo.index', 'bool', 'seo', 1],
            'sitemap' => ['seo.sitemap', 'bool', 'seo', 1],
            'ogImage' => ['seo.og_image', 'string', 'seo', 1],
            'social' => ['seo.social', 'json', 'seo', 1],
            'analyticsId' => ['seo.analytics_id', 'string', 'seo', 1],
            'anonymizeIp' => ['seo.anonymize_ip', 'bool', 'seo', 1],
            'cookieBanner' => ['seo.cookie_banner', 'bool', 'seo', 1],
        ],
        'notifications' => [
            'matrix' => ['mail.matrix', 'json', 'notifications', 0],
            'quiet' => ['mail.quiet', 'bool', 'notifications', 0],
            'quietFrom' => ['mail.quiet_from', 'string', 'notifications', 0],
            'quietTo' => ['mail.quiet_to', 'string', 'notifications', 0],
            'digest' => ['mail.digest_frequency', 'string', 'notifications', 0],
            'digestDay' => ['mail.digest_day', 'string', 'notifications', 0],
            'digestEmail' => ['mail.digest_email', 'email', 'notifications', 0],
        ],
    ];

    /** Sections stored as one JSON row `admin.<section>` */
    public const JSON_SECTIONS = ['appearance', 'users', 'security', 'backup'];

    /** Interface state kept as JSON rows (not real integrations) */
    public const STATE = ['integrations', 'api_keys'];

    public static function sections(): array
    {
        return array_merge(array_keys(self::MAP), self::JSON_SECTIONS, ['site_theme']);
    }

    private static function cast(Setting $row): mixed
    {
        $v = $row->value;

        return match ($row->type) {
            'bool' => filter_var($v, FILTER_VALIDATE_BOOLEAN),
            'int' => (int) $v,
            'json' => $v === null || $v === '' ? null : json_decode($v, true),
            default => $v ?? '',
        };
    }

    private static function encode(mixed $v, string $type): ?string
    {
        return match ($type) {
            'bool' => $v ? '1' : '0',
            'json' => json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            default => $v === null ? '' : (string) $v,
        };
    }

    /** All settings of the app shaped like the JS state: ['general' => [...], 'seo' => [...], ...] (only saved fields). */
    public static function all(): array
    {
        $rows = Setting::query()->get()->keyBy('key');
        $out = [];
        foreach (self::MAP as $sec => $fields) {
            $out[$sec] = [];
            foreach ($fields as $path => [$key]) {
                if ($rows->has($key)) {
                    $val = self::cast($rows[$key]);
                    if ($val !== null) {
                        $out[$sec][$path] = $val;
                    }
                }
            }
        }
        foreach (self::JSON_SECTIONS as $sec) {
            $row = $rows->get('admin.'.$sec);
            $val = $row ? self::cast($row) : null;
            if (is_array($val)) {
                $out[$sec] = $val;
            }
        }
        foreach (self::STATE as $sec) {
            $row = $rows->get('admin.'.$sec);
            $val = $row ? self::cast($row) : null;
            if ($val !== null) {
                $out[$sec] = $val;
            }
        }
        $out['site_theme'] = SiteTheme::forAdmin();
        $row = $rows->get('admin.twofa.u'.(int) auth()->id());
        if ($row && is_array($t = self::cast($row))) {
            $out['twofa'] = $t;
        }

        return $out;
    }

    /** Saved appearance (DB) for the layout; null when nothing saved or on any error. */
    public static function appearanceOrNull(): ?array
    {
        try {
            $row = Setting::query()->where('key', 'admin.appearance')->first();
            $v = $row ? self::cast($row) : null;

            return is_array($v) && $v ? $v : null;
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    public static function put(string $key, mixed $value, string $type, string $section, int $public, ?string $label = null): void
    {
        $row = Setting::query()->where('key', $key)->first();
        if ($row) {
            $row->value = self::encode($value, $type);
            $row->type = $type;
            $row->save();

            return;
        }
        $max = (int) Setting::query()->where('section', $section)->max('sort_order');
        Setting::query()->create([
            'key' => $key,
            'value' => self::encode($value, $type),
            'type' => $type,
            'section' => $section,
            'label' => $label,
            'is_public' => (bool) $public,
            'sort_order' => $max + 1,
        ]);
    }

    /** Save a validated section. */
    public static function save(string $section, array $data): void
    {
        if (isset(self::MAP[$section])) {
            foreach (self::MAP[$section] as $path => [$key, $type, $rowSection, $public]) {
                if (array_key_exists($path, $data)) {
                    self::put($key, $data[$path], $type, $rowSection, $public, $path);
                }
            }

            return;
        }
        if (in_array($section, self::JSON_SECTIONS, true) || in_array($section, self::STATE, true)) {
            self::put('admin.'.$section, $data, 'json', 'admin', 0, $section);

            return;
        }
        if ($section === 'twofa') {
            self::put('admin.twofa.u'.(int) auth()->id(), $data, 'json', 'admin', 0, 'twofa');
        }
    }

    /**
     * INSERT-IF-NOT-EXISTS of the default keys. Returns number of rows inserted.
     * Appearance is left out on purpose (a stored default theme would override "follow the system").
     */
    public static function syncDefaults(): int
    {
        $defaults = config('settings_defaults', []);
        $n = 0;
        foreach (self::MAP as $sec => $fields) {
            foreach ($fields as $path => [$key, $type, $rowSection, $public]) {
                if (! array_key_exists($path, $defaults[$sec] ?? []) || Setting::query()->where('key', $key)->exists()) {
                    continue;
                }
                self::put($key, $defaults[$sec][$path], $type, $rowSection, $public, $path);
                $n++;
            }
        }
        foreach (['users', 'security', 'backup'] as $sec) {
            if (isset($defaults[$sec]) && ! Setting::query()->where('key', 'admin.'.$sec)->exists()) {
                self::put('admin.'.$sec, $defaults[$sec], 'json', 'admin', 0, $sec);
                $n++;
            }
        }

        return $n;
    }
}
