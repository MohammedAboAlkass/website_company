<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Support\SiteContent;
use App\Models\GalleryAlbum;
use App\Models\GalleryItem;
use App\Support\ContentSupport as CS;

/** Public gallery: published items of published albums (images with a media file, or videos with a URL). */
class GalleryController extends Controller
{
    public function index()
    {
        SiteContent::seo(SiteContent::page('gallery')); // CMS row: hidden/draft = 404, SEO title/description
        $albums = GalleryAlbum::query()->published()->orderBy('sort_order')->orderBy('id')->get()->keyBy('id');
        $labels = CS::labelMap('gallery_album', GalleryAlbum::class);
        $items = GalleryItem::query()->published()->where(fn ($q) => $q->whereIn('gallery_album_id', $albums->keys())->orWhereNull('gallery_album_id'))
            ->with(['media', 'governorate'])->orderBy('sort_order')->orderByDesc('id')->limit(500)->get()
            ->filter(fn ($i) => $i->type === 'video' ? (bool) $i->video_url : (bool) $i->media)
            ->values();
        $counts = $items->groupBy('gallery_album_id')->map->count();
        $chips = [];
        foreach ($albums as $al) {
            if (($counts[$al->id] ?? 0) > 0) {
                $chips[] = ['slug' => $al->slug, 'label' => $labels[$al->slug] ?? $al->name, 'count' => $counts[$al->id]];
            }
        }

        return view('site.gallery', [
            'items' => $items,
            'albums' => $albums,
            'chips' => $chips,
            'photos' => $items->where('type', '!=', 'video')->count(),
            'videos' => $items->where('type', 'video')->count(),
        ]);
    }
}
