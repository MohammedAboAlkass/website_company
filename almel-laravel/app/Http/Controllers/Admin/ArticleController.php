<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\MediaFile;
use App\Models\Tag;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * News articles (table `articles`). JSON API used by /admin/news and /admin/news-edit.
 * Admins and editors may use it (route group admin.access).
 */
class ArticleController extends Controller
{
    private const PER_PAGE = 6;

    /** GET /admin/articles : paged list (JSON). Browsers asking for HTML are sent to the news page. */
    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return redirect()->route('admin.news');
        }

        // Scheduled articles whose time has come go live automatically.
        Article::where('status', 'scheduled')->whereNotNull('published_at')->where('published_at', '<=', now())->update(['status' => 'published']);

        $status = \App\Support\Req::str($request, 'status', 'all');
        $q = trim(\App\Support\Req::str($request, 'q', ''));
        $cat = trim(\App\Support\Req::str($request, 'category', ''));
        $per = max(1, min(50, (int) $request->query('per', self::PER_PAGE)));

        $query = Article::query()->with(['category:id,slug,name', 'author:id,name', 'cover', 'tags:id,name']);
        if (in_array($status, Article::STATUSES, true)) {
            $query->where('status', $status);
        }
        if ($cat !== '') {
            $query->whereHas('category', fn ($c) => $c->where('slug', $cat));
        }
        if ($q !== '') {
            $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q).'%';
            $query->where(function ($w) use ($like) {
                $w->where('title', 'like', $like)
                    ->orWhere('excerpt', 'like', $like)
                    ->orWhere('slug', 'like', $like)
                    ->orWhereHas('tags', fn ($t) => $t->where('name', 'like', $like));
            });
        }
        $query->orderByRaw('COALESCE(published_at, created_at) DESC')->orderByDesc('id');

        $page = $query->paginate($per);
        $labels = CS::statusLabels();
        $catLabels = CS::labelMap('news_category', ArticleCategory::class);

        $counts = Article::query()->selectRaw('status, COUNT(*) c')->groupBy('status')->pluck('c', 'status');

        return response()->json([
            'data' => $page->getCollection()->map(fn (Article $a) => $this->listRow($a, $labels, $catLabels))->values(),
            'meta' => ['total' => $page->total(), 'page' => $page->currentPage(), 'per' => $page->perPage(), 'pages' => $page->lastPage()],
            'counts' => [
                'all' => (int) $counts->sum(),
                'published' => (int) ($counts['published'] ?? 0),
                'draft' => (int) ($counts['draft'] ?? 0),
                'scheduled' => (int) ($counts['scheduled'] ?? 0),
            ],
        ]);
    }

    /** GET /admin/articles/{id} : one article with everything the editor needs. */
    public function show(Request $request, string $id)
    {
        $a = Article::with(['category:id,slug,name', 'author:id,name', 'cover', 'tags:id,name'])->find($id);
        if (! $a) {
            return $request->expectsJson() ? response()->json(['message' => 'الخبر غير موجود.'], 404) : redirect()->route('admin.news');
        }
        if (! $request->expectsJson()) {
            return redirect()->route('admin.news.edit', ['id' => $a->id]);
        }

        return response()->json(['data' => $this->detail($a)]);
    }

    public function create()
    {
        return redirect()->route('admin.news.edit');
    }

    public function edit(string $id)
    {
        return redirect()->route('admin.news.edit', ['id' => $id]);
    }

    /** POST /admin/articles */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request, null);
        $article = DB::transaction(function () use ($data, $request) {
            $article = new Article();
            $this->fill($article, $data, true);
            $article->author_id = $request->user()->id;
            if (! $article->byline) {
                $article->byline = $request->user()->name;
            }
            $article->save();
            $this->syncTags($article, $data['tags'] ?? []);

            return $article;
        });
        Audit::log('article.create', 'إضافة خبر: '.$article->title, $article, ['status' => $article->status]);
        if ($article->status === 'draft') {
            \App\Support\NotificationService::newsDraft($article, $request->user()->id);
        }

        return response()->json(['data' => $this->detail($article->fresh(['category', 'author', 'cover', 'tags'])), 'message' => 'تم حفظ الخبر'], 201);
    }

    /** PUT/PATCH /admin/articles/{id} */
    public function update(Request $request, string $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $data = $this->validated($request, $article);
        DB::transaction(function () use ($article, $data) {
            $this->fill($article, $data, false);
            $article->save();
            if (array_key_exists('tags', $data)) {
                $this->syncTags($article, $data['tags'] ?? []);
            }
        });
        Audit::log('article.update', 'تعديل خبر: '.$article->title, $article, ['status' => $article->status]);

        return response()->json(['data' => $this->detail($article->fresh(['category', 'author', 'cover', 'tags'])), 'message' => 'تم حفظ التغييرات']);
    }

    /** DELETE /admin/articles/{id} : soft delete. */
    public function destroy(Request $request, string $id)
    {
        $article = Article::findOrFail($id);
        $title = $article->title;
        $article->delete();
        Audit::log('article.delete', 'حذف خبر: '.$title, $article);

        return $request->expectsJson() ? response()->json(['message' => 'تم حذف الخبر']) : redirect()->route('admin.news');
    }

    /** PATCH /admin/articles/{id}/publish : publish now (or keep an already past publish date). */
    public function publish(string $id): JsonResponse
    {
        $a = Article::findOrFail($id);
        $a->status = 'published';
        if (! $a->published_at || $a->published_at->isFuture()) {
            $a->published_at = now();
        }
        $a->save();
        Audit::log('article.publish', 'نشر خبر: '.$a->title, $a);

        return response()->json(['data' => $this->detail($a->fresh(['category', 'author', 'cover', 'tags'])), 'message' => 'تم نشر الخبر']);
    }

    /** PATCH /admin/articles/{id}/unpublish : back to draft. */
    public function unpublish(string $id): JsonResponse
    {
        $a = Article::findOrFail($id);
        $a->status = 'draft';
        $a->save();
        Audit::log('article.unpublish', 'إرجاع خبر إلى المسودات: '.$a->title, $a);

        return response()->json(['data' => $this->detail($a->fresh(['category', 'author', 'cover', 'tags'])), 'message' => 'أُعيد الخبر إلى المسودات']);
    }

    /** POST /admin/articles/cover : uploads a cover image, returns the media id + url. */
    public function cover(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'mimes:'.implode(',', CS::IMAGE_MIMES), 'max:'.CS::maxUploadKb()],
        ], [
            'file.required' => 'اختر صورة للرفع.',
            'file.image' => 'الملف المرفوع ليس صورة صالحة.',
            'file.mimes' => 'الصيغ المسموحة: JPG وPNG وWebP وGIF.',
            'file.max' => 'حجم الصورة يجب ألا يتجاوز '.CS::maxUploadMb().' ميغابايت.',
            'file.uploaded' => 'حجم الصورة يجب ألا يتجاوز '.CS::maxUploadMb().' ميغابايت.',
        ]);
        $m = CS::storeImage($request->file('file'));
        Audit::log('media.upload', 'رفع صورة غلاف: '.$m->original_name, $m);

        return response()->json(['data' => ['id' => $m->id, 'url' => CS::mediaUrl($m)]], 201);
    }

    // ------------------------------------------------------------------

    private function validated(Request $request, ?Article $article): array
    {
        $rules = [
            'title' => ['required', 'string', 'min:8', 'max:255'],
            'slug' => ['nullable', 'string', 'max:191'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string', 'max:500000'],
            'category' => ['required', 'string', Rule::exists('article_categories', 'slug')],
            'status' => ['required', Rule::in(Article::STATUSES)],
            'published_at' => ['nullable', 'date'],
            'tags' => ['nullable', 'array', 'max:15'],
            'tags.*' => ['string', 'max:100'],
            'cover_media_id' => ['nullable', 'integer', Rule::exists('media_files', 'id')],
            'cover_alt' => ['nullable', 'string', 'max:255'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'byline' => ['nullable', 'string', 'max:150'],
            'is_featured' => ['nullable', 'boolean'],
            'highlights' => ['nullable', 'array', 'max:12'],
            'highlights.*' => ['string', 'max:255'],
        ];
        $messages = [
            'title.required' => 'عنوان الخبر مطلوب.',
            'title.min' => 'العنوان يجب أن يكون 8 أحرف على الأقل.',
            'title.max' => 'العنوان طويل جداً (الحد 255 حرفاً).',
            'slug.max' => 'الرابط المختصر طويل جداً.',
            'excerpt.max' => 'الملخص يجب ألا يتجاوز 500 حرف.',
            'category.required' => 'اختر تصنيف الخبر.',
            'category.exists' => 'التصنيف المختار غير موجود.',
            'status.required' => 'اختر حالة الخبر.',
            'status.in' => 'حالة الخبر غير صالحة.',
            'published_at.date' => 'تاريخ النشر غير صالح.',
            'tags.max' => 'الحد الأقصى 15 وسماً.',
            'tags.*.max' => 'الوسم طويل جداً (الحد 100 حرف).',
            'cover_media_id.exists' => 'صورة الغلاف غير موجودة.',
            'seo_title.max' => 'عنوان محركات البحث طويل جداً.',
            'seo_description.max' => 'الوصف التعريفي يجب ألا يتجاوز 320 حرفاً.',
        ];
        $validator = Validator::make($request->all(), $rules, $messages);
        $validator->after(function ($v) use ($request) {
            if ($request->input('status') === 'scheduled') {
                $d = $request->input('published_at');
                if (! $d) {
                    $v->errors()->add('published_at', 'حدّد تاريخ ووقت النشر للجدولة.');
                } else {
                    try {
                        if (Carbon::parse($d)->isPast()) {
                            $v->errors()->add('published_at', 'موعد الجدولة يجب أن يكون في المستقبل.');
                        }
                    } catch (\Throwable $e) {
                        // reported by the "date" rule
                    }
                }
            }
        });
        $data = $validator->validate();

        return $data;
    }

    private function fill(Article $a, array $d, bool $creating): void
    {
        $a->title = trim($d['title']);
        $cat = ArticleCategory::where('slug', $d['category'])->first();
        $a->article_category_id = $cat->id;

        $slugIn = isset($d['slug']) ? trim((string) $d['slug']) : '';
        if ($slugIn !== '') {
            $slug = CS::slugify($slugIn, '');
            $slug = $slug !== '' ? $slug : CS::slugify($a->title, 'news');
            $slug = CS::uniqueSlug(Article::class, $slug, $a->id, 'slug', 191);
        } elseif ($creating || ! $a->slug) {
            $slug = CS::uniqueSlug(Article::class, CS::slugify($a->title, 'news'), $a->id, 'slug', 191);
        } else {
            $slug = $a->slug;
        }
        $a->slug = $slug;

        if (array_key_exists('body', $d)) {
            $a->body = CS::cleanHtml($d['body']);
        }
        $plain = CS::plainText($a->body);
        if (array_key_exists('excerpt', $d) && trim((string) $d['excerpt']) !== '') {
            $a->excerpt = mb_substr(trim($d['excerpt']), 0, 500);
        } elseif (! $a->excerpt && $plain !== '') {
            $a->excerpt = mb_substr($plain, 0, 220);
        }
        if ($plain !== '') {
            $words = count(preg_split('/\s+/u', $plain, -1, PREG_SPLIT_NO_EMPTY));
            $a->read_minutes = min(255, max(1, (int) round($words / 180)));
        }
        foreach (['cover_alt', 'seo_title', 'seo_description', 'byline'] as $f) {
            if (array_key_exists($f, $d)) {
                $a->$f = ($d[$f] !== null && trim((string) $d[$f]) !== '') ? trim($d[$f]) : null;
            }
        }
        if (array_key_exists('cover_media_id', $d)) {
            $a->cover_media_id = $d['cover_media_id'] ?: null;
        }
        if (array_key_exists('is_featured', $d)) {
            $a->is_featured = (bool) $d['is_featured'];
        }
        if (array_key_exists('highlights', $d)) {
            $h = array_values(array_filter(array_map('trim', $d['highlights'] ?? []), fn ($x) => $x !== ''));
            $a->highlights = $h ?: null;
        }

        // status + publish date
        $a->status = $d['status'];
        $at = ! empty($d['published_at']) ? Carbon::parse($d['published_at'])->timezone(config('app.timezone')) : null;
        if ($a->status === 'published') {
            $a->published_at = ($at && $at->isPast()) ? $at : ($a->published_at && $a->published_at->isPast() && ! $at ? $a->published_at : now());
        } elseif ($a->status === 'scheduled') {
            $a->published_at = $at;
        } elseif ($at) {
            $a->published_at = $at; // draft keeps the date typed in the editor
        }
    }

    private function syncTags(Article $a, array $names): void
    {
        $ids = [];
        foreach ($names as $name) {
            $name = trim(ltrim(trim((string) $name), '#'));
            if ($name === '') {
                continue;
            }
            $slug = CS::slugify($name, 'tag');
            // an existing tag is matched by slug or by (renamed) name, so the tags page and the news editor never create duplicates
            $tag = Tag::where('slug', $slug)->orWhere('name', mb_substr($name, 0, 100))->first() ?: Tag::create(['slug' => CS::uniqueSlug(Tag::class, $slug, null, 'slug', 100), 'name' => mb_substr($name, 0, 100)]);
            $ids[$tag->id] = true;
        }
        $a->tags()->sync(array_keys($ids));
    }

    private function listRow(Article $a, array $labels, array $catLabels): array
    {
        $cs = $a->category?->slug;

        return [
            'id' => $a->id,
            'slug' => $a->slug,
            'title' => $a->title,
            'category' => $cs,
            'category_label' => $catLabels[$cs] ?? $a->category?->name,
            'status' => $a->status,
            'status_label' => $labels[$a->status] ?? $a->status,
            'author' => $a->byline ?: ($a->author?->name ?? '—'),
            'date' => optional($a->published_at ?? $a->created_at)->toIso8601String(),
            'views' => (int) $a->views_count,
            'image' => CS::mediaUrl($a->cover) ?: '/assets/site/img/logo.png',
            'tags' => $a->tags->pluck('name')->values(),
        ];
    }

    private function detail(Article $a): array
    {
        return [
            'id' => $a->id,
            'slug' => $a->slug,
            'title' => $a->title,
            'excerpt' => $a->excerpt,
            'body' => $a->body,
            'category' => $a->category?->slug,
            'status' => $a->status,
            'published_at' => $a->published_at?->toIso8601String(),
            'tags' => $a->tags->pluck('name')->values(),
            'cover' => $a->cover ? ['id' => $a->cover->id, 'url' => CS::mediaUrl($a->cover)] : null,
            'cover_alt' => $a->cover_alt,
            'seo_title' => $a->seo_title,
            'seo_description' => $a->seo_description,
            'byline' => $a->byline,
            'author' => $a->byline ?: ($a->author?->name ?? null),
            'is_featured' => (bool) $a->is_featured,
            'highlights' => $a->highlights ?: [],
            'views' => (int) $a->views_count,
        ];
    }
}
