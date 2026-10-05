<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use App\Support\PeopleSupport as PS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * إدارة الصفحات (table `pages`, soft delete). HTML request -> Blade shell, JSON request -> data.
 * System pages (the ones routed by the public site itself) keep their slug and cannot be deleted.
 */
class PageController extends Controller
{
    public const SYSTEM = ['home', 'about', 'projects', 'project', 'news', 'article', 'gallery', 'contact'];

    /** slugs a CMS page may never use (fixed routes / folders of the application) */
    private const RESERVED = ['admin', 'up', 'login', 'logout', 'api', 'assets', 'storage', 'build', 'index', 'robots', 'sitemap', 'partners'];

    public const KINDS = ['home' => 'صفحة رئيسية', 'static' => 'صفحة ثابتة', 'list' => 'صفحة قائمة', 'template' => 'قالب'];

    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return view('admin.pages.index');
        }
        $rows = Page::query()->with('author:id,name')->orderBy('sort_order')->orderBy('id')->get()->map(fn (Page $p) => $this->row($p))->values();

        return response()->json(['data' => $rows, 'meta' => ['trashed' => Page::onlyTrashed()->count()]]);
    }

    public function show(Request $request, string $id)
    {
        if (! $request->expectsJson()) {
            return redirect()->route('admin.pages.index');
        }
        $p = Page::with('author:id,name')->find($id);

        return $p ? response()->json(['data' => $this->row($p, true)]) : response()->json(['message' => 'الصفحة غير موجودة.'], 404);
    }

    public function create()
    {
        return redirect()->route('admin.pages.index');
    }

    public function edit(string $id)
    {
        return redirect()->route('admin.pages.index');
    }

    public function store(Request $request): JsonResponse
    {
        $d = $this->validated($request, null);
        $p = new Page();
        $this->fill($p, $d);
        $p->kind = 'static';
        $p->author_id = auth()->id();
        $p->sort_order = PS::nextOrder(Page::class);
        $p->save();
        Audit::log('pages.create', 'إنشاء صفحة: '.mb_substr($p->title, 0, 80), $p, ['slug' => $p->slug, 'status' => $p->status]);

        return response()->json(['data' => $this->row($p->fresh('author'), true), 'message' => 'تم إنشاء الصفحة'], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $p = Page::findOrFail($id);
        $d = $this->validated($request, $p);
        $oldStatus = $p->status;
        $this->fill($p, $d);
        $p->save();
        Audit::log($oldStatus !== $p->status ? 'pages.status' : 'pages.update', ($oldStatus !== $p->status ? 'تغيير حالة صفحة إلى '.$p->status.': ' : 'تعديل صفحة: ').mb_substr($p->title, 0, 80), $p, ['slug' => $p->slug]);

        return response()->json(['data' => $this->row($p->fresh('author'), true), 'message' => 'تم حفظ الصفحة']);
    }

    /** PATCH pages/{page}/status {status} : quick publish / hide / draft */
    public function status(Request $request, string $id): JsonResponse
    {
        $p = Page::findOrFail($id);
        $v = $request->validate(['status' => ['required', 'in:published,draft,hidden']], ['status.required' => 'الحالة مطلوبة.', 'status.in' => 'حالة غير صالحة.']);
        if ($p->slug === 'home' && $v['status'] !== 'published') {
            return response()->json(['message' => 'الصفحة الرئيسية تبقى منشورة دائماً.'], 422);
        }
        $old = $p->status;
        $p->status = $v['status'];
        if ($p->status === 'published' && ! $p->published_at) {
            $p->published_at = now();
        }
        $p->save();
        Audit::log('pages.status', 'تغيير حالة صفحة ('.$old.' ← '.$p->status.'): '.mb_substr($p->title, 0, 80), $p);

        return response()->json(['data' => $this->row($p->fresh('author')), 'message' => 'تم تحديث الحالة']);
    }

    public function destroy(Request $request, string $id)
    {
        $p = Page::findOrFail($id);
        if (in_array($p->slug, self::SYSTEM, true)) {
            return response()->json(['message' => 'هذه صفحة أساسية في الموقع ولا يمكن حذفها (يمكنك إخفاؤها).'], 422);
        }
        $title = mb_substr($p->title, 0, 80);
        DB::transaction(function () use ($p) {
            $p->slug = mb_substr($p->slug, 0, 120).'~del'.$p->id; // frees the unique slug; restored by restore()
            $p->saveQuietly();
            $p->delete();
        });
        Audit::log('pages.delete', 'حذف صفحة: '.$title, $p);

        return $request->expectsJson() ? response()->json(['message' => 'تم حذف الصفحة', 'data' => ['id' => $p->id]]) : redirect()->route('admin.pages.index');
    }

    public function restore(string $id): JsonResponse
    {
        $p = Page::onlyTrashed()->findOrFail($id);
        $slug = preg_replace('/~del\d+$/', '', $p->slug);
        $base = $slug;
        $n = 2;
        while (Page::withoutTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$n++;
        }
        $p->slug = $slug;
        $p->restore();
        $p->save();
        Audit::log('pages.restore', 'استعادة صفحة محذوفة: '.mb_substr($p->title, 0, 80), $p);

        return response()->json(['data' => $this->row($p->fresh('author')), 'message' => 'أُعيدت الصفحة']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'max:500'], 'ids.*' => ['integer']], ['ids.required' => 'قائمة الترتيب مطلوبة.']);
        PS::reorder(Page::class, $data['ids']);
        Audit::log('pages.reorder', 'تغيير ترتيب الصفحات');

        return response()->json(['message' => 'تم حفظ الترتيب']);
    }

    // ------------------------------------------------------------------

    private function validated(Request $request, ?Page $page): array
    {
        $system = $page && in_array($page->slug, self::SYSTEM, true);
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:320'],
            'status' => ['nullable', 'in:published,draft,hidden'],
            'icon' => ['nullable', 'string', 'max:60', 'regex:/^[a-z0-9_]+$/'],
            'body' => ['nullable', 'string', 'max:300000'],
        ];
        if (! $system) {
            $rules['slug'] = ['required', 'string', 'max:100', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'];
        }
        $v = Validator::make($request->all(), $rules, [
            'title.required' => 'اسم الصفحة مطلوب.', 'title.max' => 'اسم الصفحة طويل (255 حرفاً كحد أقصى).',
            'slug.required' => 'الرابط مطلوب.', 'slug.regex' => 'الرابط: أحرف لاتينية صغيرة وأرقام وشرطات فقط.', 'slug.max' => 'الرابط طويل (100 حرف).',
            'meta_description.max' => 'وصف الميتا يجب ألا يتجاوز 320 حرفاً.', 'status.in' => 'حالة غير صالحة.', 'body.max' => 'محتوى الصفحة كبير جداً.',
            'icon.regex' => 'اسم الأيقونة غير صالح.',
        ]);
        $v->after(function ($v) use ($request, $page, $system) {
            if (trim((string) PS::text($request->input('title'))) === '') {
                $v->errors()->add('title', 'اسم الصفحة مطلوب.');
            }
            if ($system) {
                if ($request->filled('slug') && $request->input('slug') !== $page->slug) {
                    $v->errors()->add('slug', 'رابط الصفحات الأساسية ثابت ولا يمكن تغييره.');
                }
                if ($page->slug === 'home' && $request->filled('status') && $request->input('status') !== 'published') {
                    $v->errors()->add('status', 'الصفحة الرئيسية تبقى منشورة دائماً.');
                }

                return;
            }
            $slug = (string) $request->input('slug');
            if (in_array($slug, self::RESERVED, true) || in_array($slug, self::SYSTEM, true)) {
                $v->errors()->add('slug', 'هذا الرابط محجوز للنظام، اختر رابطاً آخر.');
            } elseif (Page::withTrashed()->where('slug', $slug)->when($page, fn ($q) => $q->where('id', '!=', $page->id))->exists()) {
                $v->errors()->add('slug', 'هذا الرابط مستخدم لصفحة أخرى.');
            }
        });

        return $v->validate();
    }

    private function fill(Page $p, array $d): void
    {
        $p->title = mb_substr((string) PS::text($d['title']), 0, 255);
        if (array_key_exists('slug', $d)) {
            $p->slug = $d['slug'];
        }
        foreach (['seo_title' => 255, 'meta_description' => 320] as $k => $max) {
            if (array_key_exists($k, $d)) {
                $t = PS::text($d[$k]);
                $p->{$k} = $t === null || $t === '' ? null : mb_substr($t, 0, $max);
            }
        }
        if (array_key_exists('icon', $d)) {
            $p->icon = $d['icon'] ?: null;
        }
        if (array_key_exists('body', $d)) {
            $clean = CS::cleanHtml((string) $d['body']);
            $p->body = CS::plainText($clean) === '' && ! preg_match('/<(img|iframe|video|hr|table)\b/i', (string) $clean) ? null : $clean;
        }
        if (! empty($d['status'])) {
            $p->status = $d['status'];
        } elseif (! $p->exists) {
            $p->status = 'draft';
        }
        if ($p->status === 'published' && ! $p->published_at) {
            $p->published_at = now();
        }
    }

    private function row(Page $p, bool $withBody = false): array
    {
        $r = [
            'id' => $p->id, 'title' => $p->title, 'slug' => $p->slug, 'kind' => $p->kind, 'kind_label' => self::KINDS[$p->kind] ?? 'صفحة',
            'icon' => $p->icon, 'seo_title' => $p->seo_title, 'meta_description' => $p->meta_description, 'status' => $p->status,
            'sort_order' => (int) $p->sort_order, 'system' => in_array($p->slug, self::SYSTEM, true), 'has_body' => trim((string) $p->body) !== '',
            'author' => $p->author?->name, 'updated_at' => $p->updated_at?->toIso8601String(), 'published_at' => $p->published_at?->toIso8601String(),
            'url' => $p->slug === 'home' ? '/' : '/'.$p->slug,
        ];
        if ($withBody) {
            $r['body'] = (string) $p->body;
        }

        return $r;
    }
}
