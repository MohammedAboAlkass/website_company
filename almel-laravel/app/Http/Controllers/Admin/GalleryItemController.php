<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryAlbum;
use App\Models\GalleryItem;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/** Gallery photos / videos (table `gallery_items` + `media_files`). JSON API used by /admin/gallery. */
class GalleryItemController extends Controller
{
    private static function messages(): array
    {
        return [
            'title.required' => 'عنوان الصورة مطلوب.',
            'title.max' => 'العنوان طويل جداً (الحد 255 حرفاً).',
            'alt_text.max' => 'النص البديل يجب ألا يتجاوز 255 حرفاً.',
            'caption.max' => 'التعليق يجب ألا يتجاوز 500 حرف.',
            'album.exists' => 'الألبوم المختار غير موجود.',
            'video_url.url' => 'رابط الفيديو غير صالح.',
            'video_url.max' => 'رابط الفيديو طويل جداً.',
            'taken_at.date' => 'تاريخ التصوير غير صالح.',
            'project_id.exists' => 'المشروع المختار غير موجود.',
            'governorate_id.exists' => 'المحافظة المختارة غير موجودة.',
            'ids.required' => 'حدّد صورة واحدة على الأقل.',
            'ids.array' => 'قائمة الصور غير صالحة.',
            'ids.*.integer' => 'قائمة الصور غير صالحة.',
            'files.required' => 'اختر صورة للرفع.',
            'files.*.image' => 'الملف المرفوع ليس صورة صالحة.',
            'files.*.mimes' => 'الصيغ المسموحة: JPG وPNG وWebP وGIF.',
            'files.*.max' => 'حجم الصورة يجب ألا يتجاوز '.CS::maxUploadMb().' ميغابايت.',
            'files.*.uploaded' => 'حجم الصورة يجب ألا يتجاوز '.CS::maxUploadMb().' ميغابايت.',
        ];
    }

    /** GET /admin/gallery-items : every photo + album list (JSON). */
    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return redirect()->route('admin.gallery');
        }
        $q = GalleryItem::query()->with(['media', 'album:id,slug,name']);
        if ($album = trim(\App\Support\Req::str($request, 'album', ''))) {
            if ($album === 'none') {
                $q->whereNull('gallery_album_id');
            } elseif ($album !== 'all') {
                $q->whereHas('album', fn ($a) => $a->where('slug', $album));
            }
        }
        if ($s = trim(\App\Support\Req::str($request, 'q', ''))) {
            $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $s).'%';
            $q->where(fn ($w) => $w->where('title', 'like', $like)->orWhere('alt_text', 'like', $like)->orWhere('caption', 'like', $like));
        }
        $items = $q->orderBy('sort_order')->orderByDesc('id')->limit(1000)->get();

        return response()->json([
            'data' => $items->map(fn ($g) => $this->row($g))->values(),
            'albums' => app(GalleryAlbumController::class)->albumsPayload(),
            'total' => GalleryItem::count(),
        ]);
    }

    public function create()
    {
        return redirect()->route('admin.gallery');
    }

    public function show(string $id)
    {
        return redirect()->route('admin.gallery');
    }

    public function edit(string $id)
    {
        return redirect()->route('admin.gallery');
    }

    /** POST /admin/gallery-items (multipart): one or more images (field files[]) into an album. */
    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'files' => ['required', 'array', 'min:1', 'max:20'],
            'files.*' => ['file', 'image', 'mimes:'.implode(',', CS::IMAGE_MIMES), 'max:'.CS::maxUploadKb()],
            'album' => ['nullable', 'string', Rule::exists('gallery_albums', 'slug')],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ], self::messages());
        $d = $v->validate();

        $albumId = ! empty($d['album']) ? GalleryAlbum::where('slug', $d['album'])->value('id') : null;
        $created = [];
        DB::transaction(function () use ($request, $albumId, &$created) {
            foreach ($request->file('files') as $file) {
                $m = CS::storeImage($file);
                $item = GalleryItem::create([
                    'gallery_album_id' => $albumId,
                    'media_id' => $m->id,
                    'type' => 'image',
                    'title' => mb_substr($m->title ?: 'صورة', 0, 255),
                    'alt_text' => null,
                    'is_published' => true,
                    'sort_order' => 0, // new photos show first (ties are ordered by newest id)
                ]);
                $created[] = $item->load(['media', 'album:id,slug,name']);
            }
        });
        foreach ($created as $c) {
            Audit::log('gallery.item.create', 'رفع صورة إلى المعرض: '.$c->title, $c);
        }

        return response()->json([
            'data' => collect($created)->map(fn ($g) => $this->row($g, true))->values(),
            'message' => count($created) === 1 ? 'تمت إضافة صورة واحدة' : 'تمت إضافة '.count($created).' صور',
        ], 201);
    }

    /** PUT/PATCH /admin/gallery-items/{id} : title, alt text, caption, album, publish flag, video url... */
    public function update(Request $request, string $id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);
        $d = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:500'],
            'album' => ['nullable', 'string', Rule::exists('gallery_albums', 'slug')],
            'is_published' => ['sometimes', 'boolean'],
            'type' => ['sometimes', Rule::in(['image', 'video'])],
            'video_url' => ['nullable', 'url', 'max:500'],
            'taken_at' => ['nullable', 'date'],
            'project_id' => ['nullable', 'integer', Rule::exists('projects', 'id')],
            'governorate_id' => ['nullable', 'integer', Rule::exists('governorates', 'id')],
        ], self::messages())->validate();

        foreach (['title', 'alt_text', 'caption', 'type', 'video_url', 'taken_at', 'project_id', 'governorate_id'] as $f) {
            if (array_key_exists($f, $d)) {
                $val = is_string($d[$f]) ? trim($d[$f]) : $d[$f];
                $item->$f = ($val === '' ? null : $val);
            }
        }
        if (array_key_exists('album', $d)) {
            $item->gallery_album_id = $d['album'] ? GalleryAlbum::where('slug', $d['album'])->value('id') : null;
        }
        if (isset($d['is_published'])) {
            $item->is_published = (bool) $d['is_published'];
        }
        $item->save();
        Audit::log('gallery.item.update', 'تعديل صورة في المعرض: '.$item->title, $item);

        return response()->json(['data' => $this->row($item->fresh(['media', 'album:id,slug,name'])), 'message' => 'تم حفظ بيانات الصورة']);
    }

    /** DELETE /admin/gallery-items/{id} : soft delete (+ removes the uploaded file when nothing else uses it). */
    public function destroy(Request $request, string $id)
    {
        $item = GalleryItem::findOrFail($id);
        $title = $item->title;
        $item->delete();
        Audit::log('gallery.item.delete', 'حذف صورة من المعرض: '.$title, $item);
        // soft-deleted rows still reference the media (restore possible), so the file is kept.

        return $request->expectsJson() ? response()->json(['message' => 'تم حذف الصورة']) : redirect()->route('admin.gallery');
    }

    /** POST /admin/gallery-items/reorder {ids:[...]} : the given order becomes sort_order 1..n. */
    public function reorder(Request $request): JsonResponse
    {
        $d = Validator::make($request->all(), ['ids' => ['required', 'array', 'min:1', 'max:1000'], 'ids.*' => ['integer']], self::messages())->validate();
        $ids = array_values(array_unique(array_map('intval', $d['ids'])));
        DB::transaction(function () use ($ids) {
            foreach ($ids as $i => $id) {
                GalleryItem::where('id', $id)->update(['sort_order' => $i + 1]);
            }
        });
        Audit::log('gallery.item.reorder', 'إعادة ترتيب صور المعرض ('.count($ids).')', null, ['ids' => $ids]);

        return response()->json(['message' => 'تم حفظ الترتيب']);
    }

    /** POST /admin/gallery-items/bulk-move {ids:[...], album:"slug"|null} */
    public function bulkMove(Request $request): JsonResponse
    {
        $d = Validator::make($request->all(), [
            'ids' => ['required', 'array', 'min:1', 'max:500'],
            'ids.*' => ['integer'],
            'album' => ['nullable', 'string', Rule::exists('gallery_albums', 'slug')],
        ], self::messages())->validate();
        $albumId = ! empty($d['album']) ? GalleryAlbum::where('slug', $d['album'])->value('id') : null;
        $n = GalleryItem::whereIn('id', $d['ids'])->update(['gallery_album_id' => $albumId]);
        Audit::log('gallery.item.move', 'نقل '.$n.' صور إلى ألبوم', null, ['ids' => $d['ids'], 'album' => $d['album'] ?? null]);

        return response()->json(['message' => 'تم نقل الصور', 'count' => $n]);
    }

    /** POST /admin/gallery-items/bulk-delete {ids:[...]} */
    public function bulkDelete(Request $request): JsonResponse
    {
        $d = Validator::make($request->all(), ['ids' => ['required', 'array', 'min:1', 'max:500'], 'ids.*' => ['integer']], self::messages())->validate();
        $n = 0;
        foreach (GalleryItem::whereIn('id', $d['ids'])->get() as $item) {
            $item->delete();
            $n++;
        }
        Audit::log('gallery.item.delete', 'حذف '.$n.' صور من المعرض', null, ['ids' => $d['ids']]);

        return response()->json(['message' => 'تم حذف الصور', 'count' => $n]);
    }

    // ------------------------------------------------------------------

    private function row(GalleryItem $g, bool $isNew = false): array
    {
        $m = $g->media;
        $dims = ($m && $m->width && $m->height) ? $m->width.'×'.$m->height : '—';

        return [
            'id' => $g->id,
            'src' => CS::mediaUrl($m),
            'title' => $g->title ?? '',
            'alt' => $g->alt_text ?? '',
            'caption' => $g->caption ?? '',
            'album' => $g->album?->slug ?? '',
            'type' => $g->type,
            'video_url' => $g->video_url,
            'size' => CS::fmtSize((int) ($m->size_bytes ?? 0)),
            'dims' => $dims,
            'is_published' => (bool) $g->is_published,
            'sort_order' => (int) $g->sort_order,
            'isNew' => $isNew,
        ];
    }
}
