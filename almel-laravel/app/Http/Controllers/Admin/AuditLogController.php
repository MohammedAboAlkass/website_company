<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Support\Audit;
use App\Support\Csv;
use App\Support\Req;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * سجل العمليات (/admin/audit-logs): READ-ONLY view of `audit_logs` (written by App\Support\Audit from the other controllers).
 * No create / edit / delete routes exist. Permissions: audit.view (list + details), audit.export (CSV).
 */
class AuditLogController extends Controller
{
    private const PER_PAGE = 25;
    private const EXPORT_MAX = 50000;

    /** field => Arabic label for the change table (unknown fields are shown with their raw name) */
    private const FIELDS = [
        'name' => 'الاسم', 'title' => 'العنوان', 'slug' => 'الرابط المختصر', 'status' => 'الحالة', 'email' => 'البريد الإلكتروني', 'role' => 'الدور',
        'excerpt' => 'الملخص', 'body' => 'المحتوى', 'description' => 'الوصف', 'is_published' => 'منشور', 'is_visible' => 'ظاهر', 'is_featured' => 'مميّز',
        'published_at' => 'تاريخ النشر', 'sort_order' => 'الترتيب', 'alt_text' => 'النص البديل', 'caption' => 'التعليق', 'name_ar' => 'الاسم',
        'seo_title' => 'عنوان محركات البحث', 'seo_description' => 'وصف محركات البحث', 'article_category_id' => 'التصنيف', 'cover_media_id' => 'صورة الغلاف',
        'byline' => 'الكاتب', 'url' => 'الرابط', 'label' => 'العنوان', 'question' => 'السؤال', 'answer' => 'الجواب', 'person_name' => 'الاسم',
        'before' => 'قبل', 'after' => 'بعد',
    ];

    private const SUBJECTS = [
        'Article' => 'خبر', 'Project' => 'مشروع', 'Activity' => 'نشاط', 'Story' => 'قصة', 'GalleryAlbum' => 'ألبوم', 'GalleryItem' => 'صورة معرض',
        'Partner' => 'شريك', 'Faq' => 'سؤال شائع', 'Page' => 'صفحة', 'Menu' => 'قائمة', 'User' => 'مستخدم', 'Role' => 'دور', 'MediaFile' => 'ملف وسائط',
        'Tag' => 'وسم', 'ContactMessage' => 'رسالة', 'NewsletterSubscriber' => 'مشترك', 'BackupRun' => 'نسخة احتياطية', 'Announcement' => 'إعلان',
        'Appeal' => 'نداء', 'Governorate' => 'محافظة', 'ConstantGroup' => 'مجموعة ثوابت',
    ];

    public function index(Request $request)
    {
        [$query, $f] = $this->filtered($request);
        $logs = $query->with('user:id,name,email')->orderByDesc('id')->paginate(self::PER_PAGE)->withQueryString();

        $weekAgo = now()->subDays(7);
        $actions = AuditLog::query()->select('action')->distinct()->orderBy('action')->pluck('action')->all();
        $userIds = AuditLog::query()->whereNotNull('user_id')->distinct()->pluck('user_id');

        return view('admin.audit-logs.index', [
            'logs' => $logs,
            'rows' => $logs->getCollection()->map(fn (AuditLog $l) => $this->summary($l))->values()->all(),
            'f' => $f,
            'modules' => AuditLog::MODULES,
            'actions' => array_map(fn ($a) => ['key' => $a, 'label' => AuditLog::verb($a)[0].' — '.$a], $actions),
            'users' => User::query()->whereIn('id', $userIds)->orderBy('name')->get(['id', 'name', 'email']),
            'stats' => [
                'total' => AuditLog::query()->count(),
                'today' => AuditLog::query()->where('created_at', '>=', now()->startOfDay())->count(),
                'failed' => AuditLog::query()->where('action', 'auth.login_failed')->where('created_at', '>=', $weekAgo)->count(),
                'actors' => AuditLog::query()->whereNotNull('user_id')->where('created_at', '>=', $weekAgo)->distinct()->count('user_id'),
            ],
            'canExport' => $request->user()->hasPermission('audit.export'),
            'open' => Req::int($request, 'open', 0),
        ]);
    }

    /** GET /admin/audit-logs/{id}: details as JSON for the drawer (a plain browser visit opens the list with the drawer on that entry). */
    public function show(Request $request, string $id)
    {
        $log = AuditLog::query()->with('user:id,name,email')->findOrFail($id);
        if (! $request->expectsJson() && ! $request->ajax()) {
            return redirect()->route('admin.audit-logs.index', ['open' => $log->id]);
        }

        return response()->json(['data' => $this->detail($log)]);
    }

    public function export(Request $request): StreamedResponse
    {
        [$query] = $this->filtered($request);
        $query = $query->with('user:id,name,email');
        Audit::log('audit.export', 'صدّر سجل العمليات (CSV)', null, ['type' => 'security']);

        return response()->streamDownload(function () use ($query) {
            $o = fopen('php://output', 'w');
            fwrite($o, "\xEF\xBB\xBF");
            Csv::put($o, ['التاريخ', 'المستخدم', 'البريد الإلكتروني', 'العملية', 'مفتاح العملية', 'القسم', 'الوصف', 'نوع السجل', 'رقم السجل', 'اسم السجل', 'عنوان IP', 'المتصفح', 'التغييرات']);
            $n = 0;
            $query->chunkById(500, function ($rows) use ($o, &$n) {
                foreach ($rows as $l) {
                    $d = $this->detail($l);
                    Csv::put($o, [
                        $l->created_at?->format('Y-m-d H:i:s'), $l->user?->name ?? '', $l->user?->email ?? '', $d['action_label'], $l->action, $d['module_label'],
                        $l->description, $d['subject_type'] ?? '', $l->subject_id, $l->subject_label ?? '', $l->ip_address, $l->user_agent,
                        $d['changes'] ? json_encode($d['changes'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : '',
                    ]);
                    if (++$n >= self::EXPORT_MAX) {
                        return false;
                    }
                }
            });
            fclose($o);
        }, 'audit-log-'.now()->format('Y-m-d-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    // ------------------------------------------------------------------

    /** @return array{0:\Illuminate\Database\Eloquent\Builder,1:array<string,string>} */
    private function filtered(Request $request): array
    {
        $q = mb_substr(trim(Req::str($request, 'q', '')), 0, 80);
        $user = Req::str($request, 'user', '');
        $user = ($user === 'system' || preg_match('/^\d{1,10}$/', $user)) ? $user : '';
        $action = mb_substr(Req::str($request, 'action', ''), 0, 50);
        $action = preg_match('/^[a-z0-9_.\-]+$/i', $action) ? $action : '';
        $module = Req::str($request, 'module', '');
        $module = ($module === 'other' || isset(AuditLog::MODULES[$module])) ? $module : '';
        $from = $this->date(Req::str($request, 'from', ''));
        $to = $this->date(Req::str($request, 'to', ''));

        $query = AuditLog::query();
        if ($q !== '') {
            $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q).'%';
            $query->where(fn ($w) => $w->where('description', 'like', $like)->orWhere('subject_label', 'like', $like)
                ->orWhere('action', 'like', $like)->orWhere('ip_address', 'like', $like));
        }
        if ($user === 'system') {
            $query->whereNull('user_id');
        } elseif ($user !== '') {
            $query->where('user_id', (int) $user);
        }
        if ($action !== '') {
            $query->where('action', $action);
        }
        if ($module !== '') {
            $this->moduleFilter($query, $module);
        }
        if ($from) {
            $query->where('created_at', '>=', $from.' 00:00:00');
        }
        if ($to) {
            $query->where('created_at', '<=', $to.' 23:59:59');
        }

        return [$query, ['q' => $q, 'user' => $user, 'action' => $action, 'module' => $module, 'from' => $from ?? '', 'to' => $to ?? '']];
    }

    private function moduleFilter($query, string $module): void
    {
        if ($module === 'other') {
            $all = array_merge(...array_map(fn ($m) => $m[2], array_values(AuditLog::MODULES)));
            foreach ($all as $p) {
                $query->where('action', 'not like', $p.'.%')->where('action', '!=', $p);
            }

            return;
        }
        $prefixes = AuditLog::MODULES[$module][2];
        $query->where(function ($w) use ($prefixes) {
            foreach ($prefixes as $p) {
                $w->orWhere('action', 'like', $p.'.%')->orWhere('action', $p);
            }
        });
    }

    private function date(string $v): ?string
    {
        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) {
            return null;
        }
        try {
            $d = Carbon::createFromFormat('Y-m-d', $v);

            return ($d && $d->format('Y-m-d') === $v) ? $v : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function summary(AuditLog $l): array
    {
        [$label, $tone] = AuditLog::verb($l->action);
        $mod = AuditLog::moduleOf($l->action);
        $props = (array) $l->properties;

        return [
            'id' => $l->id,
            'time' => $l->created_at?->format('Y-m-d H:i:s'),
            'user' => $l->user?->name,
            'email' => $l->user?->email ?? (isset($props['email']) && is_string($props['email']) ? $props['email'] : null),
            'action' => $l->action,
            'label' => $label,
            'tone' => $tone,
            'module' => AuditLog::MODULES[$mod][0] ?? 'أخرى',
            'icon' => AuditLog::MODULES[$mod][1] ?? 'history',
            'description' => (string) $l->description,
            'subject' => $l->subject_label,
            'ip' => $l->ip_address,
            'has_changes' => ! empty($props['changes']) || (isset($props['before'], $props['after'])),
        ];
    }

    private function detail(AuditLog $l): array
    {
        $s = $this->summary($l);
        $props = Audit::redact((array) $l->properties);
        $changes = [];
        if (isset($props['changes']) && is_array($props['changes'])) {
            foreach ($props['changes'] as $field => $c) {
                $changes[] = ['field' => (string) $field, 'label' => self::FIELDS[$field] ?? (string) $field,
                    'old' => $this->fmt(is_array($c) ? ($c['old'] ?? null) : null), 'new' => $this->fmt(is_array($c) ? ($c['new'] ?? null) : $c)];
            }
        } elseif (isset($props['before'], $props['after']) && is_array($props['before']) && is_array($props['after'])) {
            foreach (array_unique(array_merge(array_keys($props['before']), array_keys($props['after']))) as $field) {
                $o = $props['before'][$field] ?? null;
                $n = $props['after'][$field] ?? null;
                if ($o !== $n) {
                    $changes[] = ['field' => (string) $field, 'label' => self::FIELDS[$field] ?? (string) $field, 'old' => $this->fmt($o), 'new' => $this->fmt($n)];
                }
            }
        }
        $context = [];
        foreach ($props as $k => $v) {
            if (in_array($k, ['changes', 'before', 'after', 'type'], true)) {
                continue;
            }
            $context[] = ['key' => (string) $k, 'value' => $this->fmt($v)];
        }
        $type = $l->subject_type ? class_basename($l->subject_type) : null;

        return $s + [
            'action_label' => $s['label'],
            'module_label' => $s['module'],
            'subject_type' => $type ? (self::SUBJECTS[$type] ?? $type) : null,
            'subject_id' => $l->subject_id,
            'subject_label' => $l->subject_label,
            'user_agent' => $l->user_agent,
            'changes' => $changes,
            'context' => $context,
        ];
    }

    private function fmt(mixed $v): string
    {
        if ($v === null) {
            return '—';
        }
        if (is_bool($v)) {
            return $v ? 'نعم' : 'لا';
        }
        if (is_array($v)) {
            $v = json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        $v = (string) $v;

        return mb_strlen($v) > 600 ? mb_substr($v, 0, 600).'…' : $v;
    }
}
