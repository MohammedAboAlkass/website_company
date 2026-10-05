<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConstantGroup;
use App\Models\ConstantItem;
use App\Models\GalleryAlbum;
use App\Models\GalleryItem;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/** Gallery albums (table `gallery_albums`). JSON API used by /admin/gallery. */
class GalleryAlbumController extends Controller
{
    private const MESSAGES = [
        'name.required' => 'اسم الألبوم مطلوب.',
        'name.min' => 'اسم الألبوم يجب أن يكون حرفين على الأقل.',
        'name.max' => 'اسم الألبوم طويل جداً (الحد 150 حرفاً).',
        'description.max' => 'الوصف يجب ألا يتجاوز 500 حرف.',
    ];

    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return redirect()->route('admin.gallery');
        }

        return response()->json(['data' => $this->albumsPayload()]);
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

    public function store(Request $request): JsonResponse
    {
        $d = Validator::make($request->all(), [
            'name' => ['required', 'string', 'min:2', 'max:150'],
            'description' => ['nullable', 'string', 'max:500'],
        ], self::MESSAGES)->validate();

        $name = trim($d['name']);
        if (GalleryAlbum::where('name', $name)->exists()) {
            return response()->json(['message' => 'يوجد ألبوم بنفس الاسم.', 'errors' => ['name' => ['يوجد ألبوم بنفس الاسم.']]], 422);
        }
        $slug = CS::uniqueSlug(GalleryAlbum::class, CS::slugify($name, 'album'), null, 'slug', 100);
        $album = GalleryAlbum::create([
            'slug' => $slug,
            'name' => $name,
            'description' => $d['description'] ?? null,
            'is_published' => true,
            'sort_order' => (int) GalleryAlbum::max('sort_order') + 1,
        ]);
        CS::addAlbumConstant($album);
        Audit::log('gallery.album.create', 'إنشاء ألبوم: '.$album->name, $album);

        return response()->json(['data' => $this->row($album, 0), 'message' => 'تم إنشاء الألبوم'], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $album = GalleryAlbum::findOrFail($id);
        $d = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:150'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_published' => ['sometimes', 'boolean'],
        ], self::MESSAGES)->validate();
        if (isset($d['name'])) {
            $album->name = trim($d['name']);
        }
        if (array_key_exists('description', $d)) {
            $album->description = $d['description'];
        }
        if (isset($d['is_published'])) {
            $album->is_published = (bool) $d['is_published'];
        }
        $album->save();
        Audit::log('gallery.album.update', 'تعديل ألبوم: '.$album->name, $album);

        return response()->json(['data' => $this->row($album, GalleryItem::where('gallery_album_id', $album->id)->count()), 'message' => 'تم حفظ الألبوم']);
    }

    /** Deleting an album keeps its photos (they become "no album"); the matching constants item is removed. */
    public function destroy(Request $request, string $id)
    {
        $album = GalleryAlbum::findOrFail($id);
        $name = $album->name;
        $group = ConstantGroup::where('group_key', 'gallery_album')->first();
        if ($group) {
            ConstantItem::where('group_id', $group->id)->where('item_key', $album->slug)->where('is_locked', false)->delete();
        }
        $album->delete();
        Audit::log('gallery.album.delete', 'حذف ألبوم: '.$name, null, ['slug' => $album->slug]);

        return $request->expectsJson() ? response()->json(['message' => 'تم حذف الألبوم']) : redirect()->route('admin.gallery');
    }

    // ------------------------------------------------------------------

    /** Albums for the chips / selects: constants order + labels, disabled ones hidden unless they still hold photos. */
    public function albumsPayload(): array
    {
        $counts = GalleryItem::query()->selectRaw('gallery_album_id, COUNT(*) c')->groupBy('gallery_album_id')->pluck('c', 'gallery_album_id');
        $albums = GalleryAlbum::orderBy('sort_order')->orderBy('id')->get()->keyBy('slug');
        $keep = [];
        foreach ($albums as $slug => $a) {
            if (($counts[$a->id] ?? 0) > 0) {
                $keep[] = $slug;
            }
        }
        $out = [];
        foreach (CS::albumOptions($keep) as $o) {
            $a = $albums[$o['key']] ?? null;
            if (! $a) {
                continue; // a constants item that has no album row yet
            }
            $out[] = ['id' => $a->id, 'slug' => $a->slug, 'label' => $o['label'], 'count' => (int) ($counts[$a->id] ?? 0), 'is_published' => (bool) $a->is_published];
        }

        return $out;
    }

    private function row(GalleryAlbum $a, int $count): array
    {
        return ['id' => $a->id, 'slug' => $a->slug, 'label' => $a->name, 'count' => $count, 'is_published' => (bool) $a->is_published];
    }
}
