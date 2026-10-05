<?php

namespace App\Support;

use App\Models\Activity;
use App\Models\Announcement;
use App\Models\Article;
use App\Models\AuditLog;
use App\Models\ContactMessage;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\Governorate;
use App\Models\NewsletterSubscriber;
use App\Models\Partner;
use App\Models\Project;
use App\Models\Story;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/** Real database figures for the admin dashboard, the reports page and the sidebar badges (no demo data, no donations). */
class AdminStats
{
    public const PROJECT_STATUS = ['draft' => 'مسودة', 'active' => 'نشط', 'urgent' => 'عاجل', 'paused' => 'متوقف مؤقتاً', 'completed' => 'مكتمل'];
    public const PROJECT_TONE = ['draft' => 'neutral', 'active' => 'info', 'urgent' => 'danger', 'paused' => 'warn', 'completed' => 'neutral'];
    public const MSG_TYPES = [
        'contact' => ['تواصل', 'info', 'chat'],
        'inquiry' => ['استفسار', 'info', 'help'],
        'volunteer' => ['تطوع', 'warn', 'groups'],
        'partnership' => ['شراكة', 'info', 'diversity_3'],
        'media' => ['إعلام', 'neutral', 'newspaper'],
        'other' => ['أخرى', 'neutral', 'mail'],
    ];

    /** Sidebar badges (window.__ADMIN_COUNTS). */
    public static function sidebar(): array
    {
        try {
            return [
                'messages_unread' => ContactMessage::query()->where('is_read', false)->where('is_archived', false)->count(),
                'projects' => Project::query()->count(),
                'news_drafts' => Article::query()->where('status', 'draft')->count(),
            ];
        } catch (\Throwable $e) {
            return ['messages_unread' => 0, 'projects' => 0, 'news_drafts' => 0];
        }
    }

    /** Totals shown on the dashboard and on the reports page. */
    public static function totals(): array
    {
        $t = [];
        $t['articles_published'] = Article::query()->published()->count();
        $t['articles_total'] = Article::query()->count();
        $t['articles_draft'] = Article::query()->where('status', 'draft')->count();
        $t['articles_scheduled'] = Article::query()->where('status', 'scheduled')->count();
        $t['views'] = (int) Article::query()->sum('views_count');
        $t['projects_total'] = Project::query()->count();
        $t['projects_active'] = Project::query()->whereIn('status', ['active', 'urgent'])->count();
        $t['projects_urgent'] = Project::query()->where('status', 'urgent')->count();
        $t['projects_completed'] = Project::query()->where('status', 'completed')->count();
        $t['stories'] = Story::query()->where('is_published', true)->count();
        $t['stories_total'] = Story::query()->count();
        $t['activities'] = Activity::query()->where('is_published', true)->count();
        $t['activities_total'] = Activity::query()->count();
        $t['partners'] = Partner::query()->where('is_published', true)->count();
        $t['partners_total'] = Partner::query()->count();
        $t['gallery'] = GalleryItem::query()->where('is_published', true)->count();
        $t['gallery_total'] = GalleryItem::query()->count();
        $t['faqs'] = Faq::query()->where('is_published', true)->count();
        $t['announcements'] = Announcement::query()->where('is_published', true)->count();
        $t['users'] = User::query()->where('status', 'active')->count();
        $t['users_total'] = User::query()->count();
        $t['messages_total'] = ContactMessage::query()->where('is_archived', false)->count();
        $t['messages_unread'] = ContactMessage::query()->where('is_archived', false)->where('is_read', false)->count();
        $t['messages_week'] = ContactMessage::query()->where('created_at', '>=', now()->subDays(7))->count();
        $t['subscribers'] = NewsletterSubscriber::query()->where('status', 'subscribed')->count();

        return $t;
    }

    public static function governorates(): array
    {
        return Governorate::query()->where('is_published', true)->orderBy('sort_order')->orderBy('id')->get()
            ->map(fn ($g) => ['name' => (string) $g->name, 'beneficiaries' => (int) $g->beneficiaries, 'points' => (int) $g->distribution_points, 'meals' => (int) $g->meals, 'tents' => (int) $g->tents, 'water' => (int) $g->water_points])->all();
    }

    public static function activeProjects(int $limit = 5)
    {
        return Project::query()->with('cover')->whereIn('status', ['active', 'urgent'])
            ->orderByRaw("status = 'urgent' desc")->orderByDesc('updated_at')->limit($limit)->get();
    }

    public static function latestMessages(int $limit = 4)
    {
        return ContactMessage::query()->where('is_archived', false)->orderByDesc('created_at')->orderByDesc('id')->limit($limit)->get();
    }

    public static function latestArticles(int $limit = 5)
    {
        return Article::query()->orderByDesc('updated_at')->limit($limit)->get(['id', 'title', 'slug', 'status', 'published_at', 'views_count', 'updated_at']);
    }

    public static function feed(int $limit = 8): array
    {
        return AuditLog::query()->with('user:id,name')->orderByDesc('id')->limit($limit)->get()
            ->map(fn ($a) => ['text' => (string) $a->description, 'by' => $a->user?->name ?: 'النظام', 'at' => $a->created_at])->all();
    }

    /** Label + count buckets for a column of a table over [from, now]. Daily buckets up to 31 days, monthly otherwise. */
    public static function series(string $model, string $col, Carbon $from, ?callable $scope = null): array
    {
        $to = now();
        $daily = $from->diffInDays($to) <= 31;
        $fmt = $daily ? '%Y-%m-%d' : '%Y-%m';
        $q = $model::query()->where($col, '>=', $from)->where($col, '<=', $to);
        if ($scope) {
            $q = $scope($q);
        }
        $rows = $q->selectRaw("DATE_FORMAT($col, '$fmt') as k, COUNT(*) as c")->groupBy('k')->pluck('c', 'k')->all();
        $out = [];
        $cur = $daily ? $from->copy()->startOfDay() : $from->copy()->startOfMonth();
        $end = $daily ? $to->copy()->startOfDay() : $to->copy()->startOfMonth();
        while ($cur <= $end) {
            $k = $daily ? $cur->format('Y-m-d') : $cur->format('Y-m');
            $label = $daily ? (string) $cur->day : SiteContent::MONTHS[$cur->month - 1];
            $title = $daily ? $cur->day.' '.SiteContent::MONTHS[$cur->month - 1] : SiteContent::MONTHS[$cur->month - 1].' '.$cur->year;
            $out[] = ['label' => $label, 'title' => $title, 'value' => (int) ($rows[$k] ?? 0)];
            $daily ? $cur->addDay() : $cur->addMonth();
        }

        return $out;
    }

    public static function rangeFrom(string $range): Carbon
    {
        return match ($range) {
            '7d' => now()->subDays(6)->startOfDay(),
            '90d' => now()->subDays(89)->startOfDay(),
            '12m' => now()->subMonths(11)->startOfMonth(),
            'ytd' => now()->startOfYear(),
            default => now()->subDays(29)->startOfDay(),
        };
    }

    public static function rangeLabel(string $range): string
    {
        return ['7d' => 'آخر 7 أيام', '30d' => 'آخر 30 يوماً', '90d' => 'آخر 90 يوماً', '12m' => 'آخر 12 شهراً', 'ytd' => 'منذ بداية العام'][$range] ?? 'آخر 30 يوماً';
    }

    /** Everything the reports page / CSV needs for one period. */
    public static function report(string $range): array
    {
        $from = self::rangeFrom($range);
        $r = ['range' => $range, 'label' => self::rangeLabel($range), 'from' => $from, 'totals' => self::totals()];
        $r['msg_in'] = ContactMessage::query()->where('created_at', '>=', $from)->count();
        $r['art_in'] = Article::query()->published()->where('published_at', '>=', $from)->count();
        $r['sub_in'] = NewsletterSubscriber::query()->where('created_at', '>=', $from)->count();
        $r['proj_in'] = Project::query()->where('created_at', '>=', $from)->count();
        $r['messages_series'] = self::series(ContactMessage::class, 'created_at', $from);
        $r['articles_series'] = self::series(Article::class, 'published_at', $from, fn ($q) => $q->published());
        $r['msg_types'] = ContactMessage::query()->where('created_at', '>=', $from)->selectRaw('type, COUNT(*) as c')->groupBy('type')->pluck('c', 'type')->all();
        $r['top_articles'] = Article::query()->published()->orderByDesc('views_count')->orderByDesc('id')->limit(8)->get(['id', 'title', 'slug', 'views_count', 'published_at']);
        $r['project_status'] = Project::query()->selectRaw('status, COUNT(*) as c')->groupBy('status')->pluck('c', 'status')->all();
        $r['project_programs'] = DB::table('projects')->leftJoin('programs', 'programs.id', '=', 'projects.program_id')->whereNull('projects.deleted_at')
            ->selectRaw('COALESCE(programs.name, ?) as pname, COUNT(*) as c', ['بدون برنامج'])->groupBy('pname')->orderByDesc('c')->get()->map(fn ($x) => ['name' => $x->pname, 'c' => (int) $x->c])->all();
        $r['governorates'] = self::governorates();

        return $r;
    }
}
