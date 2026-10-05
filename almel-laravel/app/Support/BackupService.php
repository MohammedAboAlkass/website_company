<?php

namespace App\Support;

use App\Models\BackupRun;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Database backup / restore of the CMS data as one JSON file (format "almel-backup", version 1).
 * Never exported: users (so no password hashes), sessions, audit log, cache/jobs, backup history, 2FA / API-key / secret / token settings,
 * the maintenance switch. Uploaded files (storage/media) are NOT part of the dump, only their database rows.
 */
class BackupService
{
    public const FORMAT = 'almel-backup';

    public const VERSION = 1;

    public const MAX_BYTES = 50 * 1024 * 1024;

    /** Group => label, default, sensitive, tables (parents first = insertion order). */
    public const GROUPS = [
        'content' => [
            'label' => 'المحتوى', 'hint' => 'الأخبار، المشاريع، المعرض، الصفحات، القوائم، الشركاء، الأسئلة الشائعة، الإعلانات، القصص والأنشطة',
            'default' => true, 'sensitive' => false,
            'tables' => ['article_categories', 'tags', 'media_files', 'programs', 'governorates', 'projects', 'project_facts', 'project_components', 'project_images', 'project_updates',
                'articles', 'article_tag', 'gallery_albums', 'gallery_items', 'stories', 'activities', 'partners', 'faqs', 'appeals', 'announcements',
                'pages', 'page_sections', 'page_section_blocks', 'menus', 'menu_items', 'translations'],
        ],
        'settings' => [
            'label' => 'الإعدادات وثوابت النظام', 'hint' => 'الإعدادات العامة والمظهر وثوابت النظام (بدون المفاتيح السرية ورموز التحقق ووضع الصيانة)',
            'default' => true, 'sensitive' => false,
            'tables' => ['settings', 'constant_groups', 'constant_items'],
        ],
        'messages' => [
            'label' => 'رسائل التواصل والنشرة البريدية', 'hint' => 'بيانات شخصية للزوار (أسماء وبريد وهواتف) — لا تُضمَّن إلا عند الحاجة',
            'default' => false, 'sensitive' => true,
            'tables' => ['contact_messages', 'newsletter_subscribers'],
        ],
        'access' => [
            'label' => 'الأدوار والصلاحيات', 'hint' => 'تعريف الأدوار وصلاحياتها (بدون حسابات المستخدمين وكلمات المرور)',
            'default' => false, 'sensitive' => true,
            'tables' => ['roles', 'permissions', 'role_permission'],
        ],
    ];

    /**
     * settings rows that are never exported, never replaced and never read from a file on restore.
     * One list feeds both the SQL filter and the PHP check (isProtectedSetting), so they cannot drift apart.
     */
    private const PROTECTED_EXACT = ['admin.api_keys', 'admin.integrations'];

    private const PROTECTED_PREFIX = ['admin.twofa.', 'site.maintenance'];

    private const PROTECTED_CONTAINS = ['secret', 'token', 'password', 'passwd', 'api_key', 'apikey', 'private_key', 'app_key', 'credential'];

    /** rich-text columns: HTML is run through HtmlSanitizer when it is restored from a file */
    private const RICH_COLUMNS = [
        'articles' => ['body'], 'projects' => ['description'], 'project_updates' => ['body'], 'activities' => ['description'],
        'stories' => ['quote'], 'faqs' => ['answer'], 'announcements' => ['details'], 'appeals' => ['description'], 'pages' => ['body'],
    ];

    /** @var string[] tables that can only be restored by the super admin */
    private const ACCESS_TABLES = ['roles', 'permissions', 'role_permission', 'users'];

    public static function isProtectedSetting(string $key): bool
    {
        $k = mb_strtolower($key);
        if (in_array($k, self::PROTECTED_EXACT, true)) {
            return true;
        }
        foreach (self::PROTECTED_PREFIX as $p) {
            if (str_starts_with($k, $p)) {
                return true;
            }
        }
        foreach (self::PROTECTED_CONTAINS as $c) {
            if (str_contains($k, $c)) {
                return true;
            }
        }

        return false;
    }

    private static function protectedSettingsSql(): string
    {
        $esc = fn (string $v) => str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $v);
        $parts = ["`key` IN ('".implode("','", self::PROTECTED_EXACT)."')"];
        foreach (self::PROTECTED_PREFIX as $p) {
            $parts[] = "`key` LIKE '".$esc($p)."%'";
        }
        foreach (self::PROTECTED_CONTAINS as $c) {
            $parts[] = "`key` LIKE '%".$esc($c)."%'";
        }

        return implode(' OR ', $parts);
    }

    /** HMAC key derived from APP_KEY (never stored in the backup file) */
    private static function signingKey(): string
    {
        $k = (string) config('app.key');
        if (str_starts_with($k, 'base64:')) {
            $k = (string) base64_decode(substr($k, 7), true);
        }
        if ($k === '') {
            throw new \RuntimeException('APP_KEY غير مضبوط، لا يمكن توقيع النسخة الاحتياطية.');
        }

        return hash_hmac('sha256', 'almel-backup-signature-v1', $k, true);
    }

    /** HMAC-SHA256 over everything that decides what a restore does (metadata + the content checksum) */
    public static function sign(array $doc): string
    {
        $signed = [
            'format' => $doc['format'] ?? null, 'version' => $doc['version'] ?? null, 'created_at' => $doc['created_at'] ?? null,
            'database' => $doc['database'] ?? null, 'groups' => $doc['groups'] ?? null, 'counts' => $doc['counts'] ?? null, 'checksum' => $doc['checksum'] ?? null,
        ];

        return hash_hmac('sha256', self::enc($signed), self::signingKey());
    }

    public static function dir(): string
    {
        $d = storage_path('app/backups');
        if (! is_dir($d)) {
            @mkdir($d, 0775, true);
        }

        return $d;
    }

    public static function tmpDir(): string
    {
        $d = self::dir().DIRECTORY_SEPARATOR.'tmp';
        if (! is_dir($d)) {
            @mkdir($d, 0775, true);
        }

        return $d;
    }

    public static function groupKeys(): array
    {
        return array_keys(self::GROUPS);
    }

    /** @return string[] tables of the given groups that exist in the database */
    public static function tablesOf(array $groups): array
    {
        $out = [];
        foreach ($groups as $g) {
            foreach (self::GROUPS[$g]['tables'] ?? [] as $t) {
                if (Schema::hasTable($t)) {
                    $out[] = $t;
                }
            }
        }

        return $out;
    }

    public static function groupOfTable(string $table): ?string
    {
        foreach (self::GROUPS as $k => $g) {
            if (in_array($table, $g['tables'], true)) {
                return $k;
            }
        }

        return null;
    }

    private static function query(string $table)
    {
        $q = DB::table($table);
        if ($table === 'settings') {
            $q->whereRaw('NOT ('.self::protectedSettingsSql().')');
        }

        return $q;
    }

    public static function liveCounts(array $groups): array
    {
        $out = [];
        foreach (self::tablesOf($groups) as $t) {
            $out[$t] = (int) self::query($t)->count();
        }

        return $out;
    }

    /** Build the payload array (not yet encoded). */
    public static function build(array $groups): array
    {
        $tables = [];
        $counts = [];
        foreach (self::tablesOf($groups) as $t) {
            $cols = Schema::getColumnListing($t);
            $q = self::query($t);
            if (in_array('id', $cols, true)) {
                $q->orderBy('id');
            }
            $rows = [];
            foreach ($q->get() as $r) {
                $a = (array) $r;
                $rows[] = array_map(fn ($c) => $a[$c] ?? null, $cols);
            }
            $tables[$t] = ['columns' => $cols, 'rows' => $rows];
            $counts[$t] = count($rows);
        }

        return ['tables' => $tables, 'counts' => $counts];
    }

    private static function enc(mixed $v): string
    {
        $s = json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE | JSON_PRESERVE_ZERO_FRACTION);
        if ($s === false) {
            throw new \RuntimeException('تعذّر ترميز البيانات: '.json_last_error_msg());
        }

        return $s;
    }

    public static function checksum(array $tables): string
    {
        return hash('sha256', self::enc($tables));
    }

    /** Create a backup file + history row. @return BackupRun */
    public static function export(array $groups, string $kind = 'export', ?string $note = null, ?int $userId = null): BackupRun
    {
        $groups = array_values(array_intersect(self::groupKeys(), $groups));
        if (! $groups) {
            throw new \InvalidArgumentException('اختر مجموعة واحدة على الأقل.');
        }
        $b = self::build($groups);
        $sum = self::checksum($b['tables']);
        $doc = [
            'format' => self::FORMAT, 'version' => self::VERSION,
            'created_at' => now()->toIso8601String(), 'app' => config('app.name'), 'database' => DB::getDatabaseName(),
            'groups' => $groups, 'counts' => $b['counts'], 'checksum' => $sum,
        ];
        $doc['signature'] = self::sign($doc);
        $doc['signature_alg'] = 'HMAC-SHA256';
        $doc['tables'] = $b['tables'];
        $json = self::enc($doc);
        $name = 'almel-backup-'.now()->format('Ymd-His').'-'.Str::lower(Str::random(4)).'.json';
        if (file_put_contents(self::dir().DIRECTORY_SEPARATOR.$name, $json, LOCK_EX) === false) {
            throw new \RuntimeException('تعذّر كتابة ملف النسخة في مجلد التخزين.');
        }

        return BackupRun::create([
            'kind' => $kind, 'status' => 'ok', 'filename' => $name, 'size_bytes' => strlen($json), 'scope' => $groups,
            'tables_count' => count($b['tables']), 'rows_count' => array_sum($b['counts']), 'checksum' => $sum,
            'user_id' => $userId ?? auth()->id(), 'note' => $note ? mb_substr($note, 0, 500) : null, 'created_at' => now(),
        ]);
    }

    /**
     * Parse + validate an uploaded dump.
     * @return array{doc:?array,errors:string[],warnings:string[],tables:array}
     */
    public static function inspect(string $json, bool $canAccess = false): array
    {
        $errors = [];
        $warnings = [];
        $report = [];
        if (strlen($json) > self::MAX_BYTES) {
            return ['doc' => null, 'errors' => ['حجم الملف أكبر من الحد المسموح (50 ميغابايت).'], 'warnings' => [], 'tables' => []];
        }
        if (str_starts_with($json, "\xEF\xBB\xBF")) {
            $json = substr($json, 3);
        }
        $doc = json_decode($json, true);
        if (! is_array($doc)) {
            return ['doc' => null, 'errors' => ['الملف ليس بصيغة JSON صالحة.'], 'warnings' => [], 'tables' => []];
        }
        if (($doc['format'] ?? null) !== self::FORMAT) {
            return ['doc' => null, 'errors' => ['هذا الملف ليس نسخة احتياطية من هذا النظام.'], 'warnings' => [], 'tables' => []];
        }
        if ((int) ($doc['version'] ?? 0) !== self::VERSION) {
            return ['doc' => null, 'errors' => ['إصدار النسخة غير مدعوم ('.(int) ($doc['version'] ?? 0).').'], 'warnings' => [], 'tables' => []];
        }
        $tables = $doc['tables'] ?? null;
        if (! is_array($tables) || ! $tables) {
            return ['doc' => null, 'errors' => ['النسخة لا تحتوي على جداول.'], 'warnings' => [], 'tables' => []];
        }
        if (! isset($doc['checksum']) || ! hash_equals((string) $doc['checksum'], self::checksum($tables))) {
            $errors[] = 'بصمة الملف (checksum) غير مطابقة: الملف تالف أو جرى تعديله.';
        }
        // The signature proves the file was produced by THIS installation (APP_KEY); unsigned / foreign / edited files are refused.
        if (empty($doc['signature']) || ! is_string($doc['signature'])) {
            $errors[] = 'الملف غير موقَّع: لا يمكن استعادته. استعادة النسخ مسموحة فقط للملفات التي أنشأها هذا النظام نفسه (نسخ قديمة بلا توقيع يجب إعادة تصديرها).';
        } else {
            try {
                $okSig = hash_equals(self::sign($doc), $doc['signature']);
            } catch (\Throwable $e) {
                $okSig = false;
            }
            if (! $okSig) {
                $errors[] = 'توقيع الملف غير صالح: الملف جرى تعديله أو أُنشئ على نظام آخر، ولا يمكن استعادته.';
            }
        }
        foreach ($tables as $t => $data) {
            $g = self::groupOfTable((string) $t);
            if ($g === null) {
                $errors[] = in_array($t, self::ACCESS_TABLES, true)
                    ? 'الجدول «'.$t.'» لا يُستعاد من النسخ الاحتياطية.'
                    : 'الجدول «'.$t.'» غير مسموح باستعادته.';
                continue;
            }
            if ($g === 'access' && ! $canAccess) {
                $errors[] = 'استعادة الأدوار والصلاحيات («'.$t.'») متاحة للمدير العام فقط.';
                continue;
            }
            if (! Schema::hasTable($t)) {
                $errors[] = 'الجدول «'.$t.'» غير موجود في قاعدة البيانات الحالية.';
                continue;
            }
            $cols = $data['columns'] ?? null;
            $rows = $data['rows'] ?? null;
            if (! is_array($cols) || ! is_array($rows) || ! $cols) {
                $errors[] = 'بنية الجدول «'.$t.'» غير صحيحة.';
                continue;
            }
            $live = Schema::getColumnListing($t);
            $unknown = array_values(array_diff($cols, $live));
            if ($unknown) {
                $errors[] = 'الجدول «'.$t.'» يحتوي أعمدة غير موجودة حالياً: '.implode(', ', array_slice($unknown, 0, 4)).'.';
                continue;
            }
            $missing = [];
            foreach (DB::select('SHOW COLUMNS FROM `'.str_replace('`', '', $t).'`') as $c) {
                if (! in_array($c->Field, $cols, true) && $c->Null === 'NO' && $c->Default === null && ! str_contains((string) $c->Extra, 'auto_increment') && ! str_contains((string) $c->Extra, 'GENERATED')) {
                    $missing[] = $c->Field;
                }
            }
            if ($missing) {
                $errors[] = 'الجدول «'.$t.'» ينقصه أعمدة مطلوبة: '.implode(', ', array_slice($missing, 0, 4)).'.';
                continue;
            }
            $n = count($cols);
            foreach ($rows as $i => $r) {
                if (! is_array($r) || count($r) !== $n) {
                    $errors[] = 'الصف '.($i + 1).' في الجدول «'.$t.'» لا يطابق الأعمدة.';
                    break;
                }
            }
            $incoming = count($rows);
            if ($t === 'settings') {
                $ci = array_search('key', $cols, true);
                if ($ci !== false) {
                    $skipped = count(array_filter($rows, fn ($r) => is_array($r) && self::isProtectedSetting((string) ($r[$ci] ?? ''))));
                    if ($skipped > 0) {
                        $warnings[] = 'تم تجاهل '.$skipped.' من الإعدادات الحساسة (مفاتيح سرية / رموز / كلمات مرور / وضع الصيانة) الموجودة في الملف ولن تُستعاد.';
                        $incoming -= $skipped;
                    }
                }
            }
            $report[] = ['table' => $t, 'group' => $g, 'incoming' => $incoming, 'current' => (int) self::query($t)->count()];
        }
        $present = array_values(array_unique(array_map(fn ($r) => $r['group'], $report)));
        if (in_array('access', $present, true)) {
            $warnings[] = 'ستُستبدل تعريفات الأدوار والصلاحيات: تأكد أن حسابك سيبقى مديراً بعد الاستعادة.';
        }
        if (in_array('messages', $present, true)) {
            $warnings[] = 'الملف يحتوي بيانات شخصية للزوار (رسائل التواصل / النشرة).';
        }
        if (! empty($doc['database']) && $doc['database'] !== DB::getDatabaseName()) {
            $warnings[] = 'النسخة مأخوذة من قاعدة بيانات مختلفة («'.$doc['database'].'»).';
        }
        $doc['groups'] = $present;

        return ['doc' => $doc, 'errors' => $errors, 'warnings' => $warnings, 'tables' => $report];
    }

    /** user ids referenced by foreign keys: table => [column,...] */
    private static function userColumns(): array
    {
        $rows = DB::select("SELECT TABLE_NAME t, COLUMN_NAME c FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME = 'users'");
        $out = [];
        foreach ($rows as $r) {
            $out[$r->t][] = $r->c;
        }

        return $out;
    }

    /**
     * Replace the selected groups with the content of the (already inspected) document, in ONE transaction.
     * @return array<string,int> table => rows inserted
     */
    public static function restore(array $doc, array $groups, bool $canAccess = false): array
    {
        $groups = array_values(array_intersect($groups, $doc['groups'] ?? []));
        if (! $canAccess) {
            $groups = array_values(array_diff($groups, ['access'])); // roles / permissions: super admin only
        }
        if (! $groups) {
            throw new \InvalidArgumentException('اختر مجموعة واحدة على الأقل من الملف.');
        }
        $order = self::tablesOf($groups);
        $order = array_values(array_filter($order, fn ($t) => isset($doc['tables'][$t])));
        $userIds = array_flip(DB::table('users')->pluck('id')->all());
        $userCols = self::userColumns();
        $done = [];

        DB::beginTransaction();
        try {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            foreach (array_reverse($order) as $t) {
                self::query($t)->delete();
            }
            foreach ($order as $t) {
                $cols = $doc['tables'][$t]['columns'];
                $rows = $doc['tables'][$t]['rows'];
                $uc = array_keys(array_filter($cols, fn ($c) => in_array($c, $userCols[$t] ?? [], true)));
                $rich = array_values(array_intersect(self::RICH_COLUMNS[$t] ?? [], $cols));
                $buf = [];
                $expected = 0;
                foreach ($rows as $r) {
                    $row = array_combine($cols, $r);
                    if ($t === 'settings') {
                        if (self::isProtectedSetting((string) ($row['key'] ?? ''))) {
                            continue; // secrets / tokens / maintenance switch are never taken from a file
                        }
                        unset($row['id']); // ids of preserved (never exported) rows must not collide
                    }
                    $expected++;
                    foreach ($rich as $c) {
                        if (is_string($row[$c]) && preg_match('/<[a-z!\/]/i', $row[$c])) {
                            $row[$c] = HtmlSanitizer::clean($row[$c]);
                        }
                    }
                    foreach ($uc as $i) {
                        $c = $cols[$i];
                        if ($row[$c] !== null && ! isset($userIds[(int) $row[$c]])) {
                            $row[$c] = null;
                        }
                    }
                    foreach ($row as $k => $v) {
                        if (is_array($v)) {
                            $row[$k] = json_encode($v, JSON_UNESCAPED_UNICODE);
                        }
                    }
                    $buf[] = $row;
                    if (count($buf) >= 200) {
                        DB::table($t)->insert($buf);
                        $buf = [];
                    }
                }
                if ($buf) {
                    DB::table($t)->insert($buf);
                }
                $now = (int) self::query($t)->count();
                if ($now !== $expected) {
                    throw new \RuntimeException('عدد صفوف «'.$t.'» بعد الاستعادة ('.$now.') لا يطابق الملف ('.$expected.').');
                }
                $done[$t] = $now;
            }
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            try {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            } catch (\Throwable $e2) {
                // ignore
            }
            throw $e;
        }

        return $done;
    }

    public static function pathOf(BackupRun $r): ?string
    {
        if (! $r->filename || $r->filename !== basename($r->filename)) {
            return null;
        }
        $p = self::dir().DIRECTORY_SEPARATOR.$r->filename;

        return is_file($p) ? $p : null;
    }

    public static function purgeTmp(): void
    {
        foreach (glob(self::tmpDir().DIRECTORY_SEPARATOR.'*.json') ?: [] as $f) {
            if (filemtime($f) < time() - 3600) {
                @unlink($f);
            }
        }
    }
}
