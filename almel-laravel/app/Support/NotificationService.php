<?php

namespace App\Support;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * In-panel notifications (table `notifications`, one row per recipient = per-user read state).
 * Recipients: active panel users whose role may view the event's module. The `app` channel of the
 * settings matrix (mail.matrix) switches an event off; events missing from the matrix stay enabled.
 * Never sends e-mail. Never throws (a notification must not break the request that caused it).
 */
class NotificationService
{
    /** event => [label, module (permission <module>.view), icon, tone] */
    public const EVENTS = [
        'message_new' => ['label' => 'رسالة جديدة', 'module' => 'messages', 'icon' => 'mail', 'tone' => 'info'],
        'volunteer' => ['label' => 'طلب تطوع', 'module' => 'messages', 'icon' => 'diversity_1', 'tone' => 'info'],
        'newsletter_new' => ['label' => 'مشترك جديد في النشرة', 'module' => 'messages', 'icon' => 'mark_email_read', 'tone' => 'info'],
        'news_draft' => ['label' => 'مسودة خبر جديدة', 'module' => 'news', 'icon' => 'edit_note', 'tone' => 'gold'],
        'user_new' => ['label' => 'مستخدم جديد', 'module' => 'users', 'icon' => 'person_add', 'tone' => 'neutral'],
        'backup_done' => ['label' => 'اكتمال نسخة احتياطية', 'module' => 'backup', 'icon' => 'cloud_done', 'tone' => 'info'],
        'backup_failed' => ['label' => 'فشل نسخة احتياطية', 'module' => 'backup', 'icon' => 'cloud_off', 'tone' => 'danger'],
        'maintenance_toggle' => ['label' => 'وضع الصيانة', 'module' => 'settings', 'icon' => 'construction', 'tone' => 'gold'],
        'login_failed' => ['label' => 'محاولات دخول فاشلة', 'module' => 'audit', 'icon' => 'gpp_maybe', 'tone' => 'danger'],
    ];

    public const TYPE_PREFIX = 'admin.';

    private static ?array $matrix = null;

    /** Is the in-panel (`app`) channel of this event switched on in الإعدادات ← الإشعارات? Default: yes. */
    public static function enabled(string $event): bool
    {
        if (self::$matrix === null) {
            self::$matrix = [];

            try {
                $raw = Setting::query()->where('key', 'mail.matrix')->value('value');
                $arr = is_string($raw) ? json_decode($raw, true) : null;
                self::$matrix = is_array($arr) ? $arr : [];
            } catch (\Throwable $e) {
                report($e);
            }
        }
        $row = self::$matrix[$event] ?? null;
        if (is_array($row) && array_key_exists('app', $row)) {
            return (bool) $row['app'];
        }

        return true;
    }

    /** For tests / after the settings are saved in the same request. */
    public static function forgetCache(): void
    {
        self::$matrix = null;
    }

    /**
     * Creates the notification for every eligible user. Returns the number of rows created.
     *
     * @param  int|null  $exceptUserId  the user who caused the event (not told about their own action)
     */
    public static function notify(string $event, string $title, string $body = '', ?string $url = null, ?int $exceptUserId = null, array $meta = []): int
    {
        try {
            $def = self::EVENTS[$event] ?? null;
            if (! $def || ! self::enabled($event)) {
                return 0;
            }
            $now = now();
            $data = json_encode([
                'event' => $event,
                'title' => mb_substr($title, 0, 160),
                'body' => mb_substr($body, 0, 300),
                'icon' => $def['icon'],
                'tone' => $def['tone'],
                'module' => $def['module'],
                'url' => $url,
                'meta' => $meta ?: null,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $rows = [];
            foreach (User::query()->active()->get() as $u) {
                if ($exceptUserId !== null && (int) $u->id === $exceptUserId) {
                    continue;
                }
                if (! $u->canAccessAdmin() || ! $u->hasPermission($def['module'].'.view')) {
                    continue;
                }
                $rows[] = [
                    'id' => (string) Str::orderedUuid(),
                    'type' => self::TYPE_PREFIX.$event,
                    'notifiable_type' => User::class,
                    'notifiable_id' => $u->id,
                    'data' => $data,
                    'read_at' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            if ($rows) {
                DB::table('notifications')->insert($rows);
            }
            if (random_int(1, 40) === 1) { // light housekeeping: read ones older than 90 days
                DB::table('notifications')->where('type', 'like', self::TYPE_PREFIX.'%')->whereNotNull('read_at')->where('created_at', '<', $now->copy()->subDays(90))->delete();
            }

            return count($rows);
        } catch (\Throwable $e) {
            report($e);

            return 0;
        }
    }

    // ---- event helpers (one place for the wording) -------------------------------------------------

    public static function messageReceived($m): void
    {
        $volunteer = ($m->type ?? '') === 'volunteer';
        $what = $volunteer ? 'طلب تطوع جديد' : 'رسالة جديدة';
        $body = trim((string) ($m->subject ?: $m->message));
        self::notify($volunteer ? 'volunteer' : 'message_new', $what.' من '.$m->name, mb_substr($body, 0, 140), route('admin.messages.index', ['id' => $m->id], false));
    }

    public static function newsletterJoined(string $email): void
    {
        self::notify('newsletter_new', 'مشترك جديد في النشرة البريدية', $email, route('admin.newsletter.index', [], false));
    }

    public static function newsDraft($article, ?int $actor): void
    {
        self::notify('news_draft', 'مسودة خبر جديدة', (string) $article->title, '/admin/news', $actor);
    }

    public static function userCreated($user, ?int $actor): void
    {
        self::notify('user_new', 'تمت إضافة مستخدم جديد', $user->name.' — '.$user->email, '/admin/users', $actor);
    }

    public static function backupDone(string $file, int $rows, ?int $actor = null): void
    {
        self::notify('backup_done', 'اكتملت نسخة احتياطية', $file.' ('.$rows.' صفاً)', '/admin/backup', $actor);
    }

    public static function backupFailed(string $why, ?int $actor = null): void
    {
        self::notify('backup_failed', 'فشلت عملية النسخ الاحتياطي', mb_substr($why, 0, 200), '/admin/backup', $actor);
    }

    public static function maintenanceToggled(bool $enabled, ?int $actor): void
    {
        self::notify('maintenance_toggle', $enabled ? 'تم تفعيل وضع الصيانة' : 'تم إيقاف وضع الصيانة', $enabled ? 'الموقع العام يعرض صفحة الصيانة للزوار.' : 'عاد الموقع العام للعمل.', '/admin/maintenance', $actor);
    }

    public static function loginFailed(string $email, int $attempts, ?string $ip): void
    {
        self::notify('login_failed', 'محاولات دخول فاشلة متكررة', $attempts.' محاولات للحساب '.$email.($ip ? ' من العنوان '.$ip : ''), '/admin/audit-logs');
    }

    // ---- reading ----------------------------------------------------------------------------------

    /** event keys whose module the user may view */
    public static function allowedEvents(User $u): array
    {
        $out = [];
        foreach (self::EVENTS as $k => $d) {
            if ($u->hasPermission($d['module'].'.view')) {
                $out[] = $k;
            }
        }

        return $out;
    }

    /** the user's own notifications, limited to the modules they may still view */
    public static function query(User $u)
    {
        return DB::table('notifications')
            ->where('notifiable_type', User::class)->where('notifiable_id', $u->id)
            ->whereIn('type', array_map(fn ($e) => self::TYPE_PREFIX.$e, self::allowedEvents($u)));
    }

    public static function unreadCount(User $u): int
    {
        return (int) self::query($u)->whereNull('read_at')->count();
    }

    /** row => array for the JSON feed / list page */
    public static function present(object $r): array
    {
        $d = json_decode((string) $r->data, true) ?: [];
        $event = Str::after((string) $r->type, self::TYPE_PREFIX);
        $def = self::EVENTS[$event] ?? ['label' => 'إشعار', 'icon' => 'notifications', 'tone' => 'neutral'];
        $created = $r->created_at ? \Illuminate\Support\Carbon::parse($r->created_at) : now();
        $url = $d['url'] ?? null;

        return [
            'id' => $r->id,
            'event' => $event,
            'label' => $def['label'],
            'title' => (string) ($d['title'] ?? $def['label']),
            'text' => (string) ($d['body'] ?? ''),
            'icon' => (string) ($d['icon'] ?? $def['icon']),
            'tone' => (string) ($d['tone'] ?? $def['tone']),
            'unread' => $r->read_at === null,
            'mins' => (int) abs($created->diffInMinutes(now())),
            'at' => $created->format('Y-m-d H:i'),
            'url' => is_string($url) && str_starts_with($url, '/') && ! str_starts_with($url, '//') ? $url : null,
            'open' => route('admin.notifications.show', $r->id, false),
        ];
    }

    /** quiet hours (settings: mail.quiet / quiet_from / quiet_to, zone site.timezone): only mutes the bell highlight */
    public static function quietNow(): bool
    {
        try {
            $s = Setting::query()->whereIn('key', ['mail.quiet', 'mail.quiet_from', 'mail.quiet_to', 'site.timezone'])->pluck('value', 'key');
            if (! filter_var($s['mail.quiet'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
                return false;
            }
            $tz = (string) ($s['site.timezone'] ?? '') ?: config('app.timezone');
            try {
                $now = now($tz);
            } catch (\Throwable $e) {
                $now = now();
            }
            $mins = fn (?string $hm, int $def) => preg_match('/^(\d{1,2}):(\d{2})$/', (string) $hm, $m) ? ((int) $m[1]) * 60 + (int) $m[2] : $def;
            $from = $mins($s['mail.quiet_from'] ?? null, 22 * 60);
            $to = $mins($s['mail.quiet_to'] ?? null, 7 * 60);
            $cur = $now->hour * 60 + $now->minute;
            if ($from === $to) {
                return false;
            }

            return $from < $to ? ($cur >= $from && $cur < $to) : ($cur >= $from || $cur < $to);
        } catch (\Throwable $e) {
            report($e);

            return false;
        }
    }

    /** JSON for the header bell */
    public static function feed(User $u, int $limit = 8): array
    {
        try {
            $items = self::query($u)->orderByDesc('created_at')->orderByDesc('id')->limit($limit)->get()->map(fn ($r) => self::present($r))->all();

            return ['unread' => self::unreadCount($u), 'items' => $items, 'quiet' => self::quietNow(), 'total_url' => '/admin/notifications'];
        } catch (\Throwable $e) {
            report($e);

            return ['unread' => 0, 'items' => [], 'quiet' => false, 'total_url' => '/admin/notifications'];
        }
    }
}
