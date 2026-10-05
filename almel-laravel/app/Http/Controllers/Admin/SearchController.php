<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Quick search (Ctrl+K command palette): GET /admin/search?q=  -> {data:[{group,icon,label,hint,url}]}
 * Every group is searched only when the signed-in user holds <module>.view. Soft-deleted rows are never returned,
 * users are searched by name / e-mail / job title only (no password or token columns are ever selected).
 */
class SearchController extends Controller
{
    private const PER_GROUP = 5;

    public function index(Request $request): JsonResponse
    {
        $q = trim(preg_replace('/\s+/u', ' ', \App\Support\Req::str($request, 'q', '')));
        if (mb_strlen($q) < 2) {
            return response()->json(['data' => [], 'q' => $q]);
        }
        $q = mb_substr($q, 0, 60);
        $like = '%'.addcslashes($q, '\\%_').'%';
        $u = $request->user();
        $can = fn (string $k) => $u->isSuperAdmin() || $u->hasPermission($k);
        $out = [];
        $add = function (string $group, string $icon, string $perm, string $table, array $cols, callable $map, ?callable $extra = null) use (&$out, $like, $can) {
            if (! $can($perm)) {
                return;
            }
            try {
                $qb = DB::table($table);
                if (\Illuminate\Support\Facades\Schema::hasColumn($table, 'deleted_at')) {
                    $qb->whereNull('deleted_at');
                }
                if ($extra) {
                    $extra($qb);
                }
                $qb->where(function ($w) use ($cols, $like) {
                    foreach ($cols as $c) {
                        $w->orWhere($c, 'like', $like);
                    }
                });
                foreach ($qb->orderByDesc('id')->limit(self::PER_GROUP)->get() as $row) {
                    [$label, $hint, $url] = $map($row);
                    $out[] = ['group' => $group, 'icon' => $icon, 'label' => mb_substr((string) $label, 0, 120), 'hint' => mb_substr((string) $hint, 0, 60), 'url' => $url];
                }
            } catch (\Throwable $e) {
                report($e);
            }
        };
        $enc = fn ($s) => rawurlencode(mb_substr((string) $s, 0, 60));
        $status = ['published' => 'منشور', 'draft' => 'مسودة', 'scheduled' => 'مجدول', 'hidden' => 'مخفي', 'archived' => 'مؤرشف'];

        $add('الأخبار', 'article', 'news.view', 'articles', ['title', 'slug', 'excerpt'], fn ($r) => [$r->title, $status[$r->status] ?? $r->status, '/admin/news-edit?id='.$r->id]);
        $add('المشاريع', 'volunteer_activism', 'projects.view', 'projects', ['title', 'summary', 'slug'], fn ($r) => [$r->title, $r->location_text ?: ($status[$r->status] ?? $r->status), '/admin/projects?q='.$enc($r->title)]);
        $add('الأنشطة الميدانية', 'event_available', 'activities.view', 'activities', ['title', 'description', 'place'], fn ($r) => [$r->title, $r->place, '/admin/activities?q='.$enc($r->title)]);
        $add('قصص الميدان', 'format_quote', 'stories.view', 'stories', ['person_name', 'quote', 'person_role'], fn ($r) => [$r->person_name, $r->person_role, '/admin/stories?q='.$enc($r->person_name)]);
        $add('الشركاء', 'handshake', 'partners.view', 'partners', ['name', 'description'], fn ($r) => [$r->name, $r->tag_label, '/admin/partners?q='.$enc($r->name)]);
        $add('الأسئلة الشائعة', 'help', 'faq.view', 'faqs', ['question'], fn ($r) => [$r->question, '', '/admin/faq?q='.$enc($r->question)]);
        $add('المعرض', 'photo_library', 'gallery.view', 'gallery_items', ['title', 'caption'], fn ($r) => [$r->title ?: $r->caption, 'صورة', '/admin/gallery?q='.$enc($r->title ?: $r->caption)]);
        $add('المعرض', 'photo_album', 'gallery.view', 'gallery_albums', ['name', 'description'], fn ($r) => [$r->name, 'ألبوم', '/admin/gallery?q='.$enc($r->name)]);
        $add('الصفحات', 'web', 'pages.view', 'pages', ['title', 'slug', 'seo_title'], fn ($r) => [$r->title, '/'.($r->slug === 'home' ? '' : $r->slug), '/admin/pages?q='.$enc($r->title)]);
        $add('المستخدمون', 'manage_accounts', 'users.view', 'users', ['name', 'email', 'job_title'], fn ($r) => [$r->name, $r->email, '/admin/users?q='.$enc($r->name)]);

        return response()->json(['data' => array_slice($out, 0, 40), 'q' => $q]);
    }
}
