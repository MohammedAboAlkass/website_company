<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ArticleCategory;
use App\Models\Faq;
use App\Models\GalleryAlbum;
use App\Models\GalleryItem;
use App\Models\Governorate;
use App\Models\Partner;
use App\Models\Program;
use App\Models\Story;
use App\Support\ContentSupport as CS;
use App\Support\SiteContent;

class HomeController extends Controller
{
    public function index()
    {
        SiteContent::seoFor('home');
        // The hero (slides + settings) comes from the database (admin: /admin/hero); the other sections are read below.
        return view('site.home', [
            'hero' => \App\Support\HeroSupport::forSite(),
            'home' => $this->sections(),
        ]);
    }

    /** Everything else on the home page comes from the database too (published / visible rows only, panel order). */
    private function sections(): array
    {
        $projectsAll = SiteContent::projectsQuery()->orderBy('sort_order')->orderBy('id')->get();
        $projects = $projectsAll->take(8)->values();
        $plabels = CS::labelMap('project_category', Program::class);
        $counts = [];
        foreach ($projects as $p) {
            $s = $p->program?->slug ?? 'other';
            $counts[$s] = ($counts[$s] ?? 0) + 1;
        }
        $chips = [];
        foreach (Program::query()->orderBy('sort_order')->orderBy('id')->get() as $pr) {
            if (isset($counts[$pr->slug])) {
                $chips[] = ['slug' => $pr->slug, 'label' => $plabels[$pr->slug] ?? $pr->name, 'count' => $counts[$pr->slug], 'icon' => SiteContent::programIcon($pr->slug)];
            }
        }
        if (isset($counts['other'])) {
            $chips[] = ['slug' => 'other', 'label' => \App\Support\SiteTexts::t('project.chip_other'), 'count' => $counts['other'], 'icon' => 'folder_special'];
        }

        $govs = Governorate::query()->published()->orderBy('sort_order')->orderBy('id')->get();
        $govJs = [];
        foreach ($govs as $g) {
            $govJs[SiteContent::GOV_KEYS[$g->slug] ?? $g->slug] = [
                'name' => $g->name, 'note' => (string) $g->note,
                'beneficiaries' => (int) $g->beneficiaries, 'meals' => (int) $g->meals, 'tents' => (int) $g->tents, 'water' => (int) $g->water_points,
            ];
        }

        $albums = GalleryAlbum::query()->published()->pluck('id');
        $galleryAll = GalleryItem::query()->published()->where(fn ($q) => $q->whereIn('gallery_album_id', $albums)->orWhereNull('gallery_album_id'))->with(['media', 'governorate'])
            ->orderBy('sort_order')->orderByDesc('id')->limit(300)->get()
            ->filter(fn ($i) => $i->type === 'video' ? (bool) $i->video_url : (bool) $i->media)->values();

        return [
            'ann' => SiteContent::announcements(),
            'projects' => $projects,
            'projectsTotal' => $projectsAll->count(),
            'projectChips' => $chips,
            'stories' => Story::query()->published()->with('image')->orderBy('sort_order')->orderBy('id')->get(),
            'activities' => Activity::query()->published()->with('image')->orderBy('sort_order')->orderBy('id')->limit(12)->get(),
            'appeal' => SiteContent::appeal(),
            'govs' => $govs,
            'govJs' => $govJs,
            'govDefault' => isset($govJs['gaza']) ? 'gaza' : (array_key_first($govJs) ?: null),
            'news' => SiteContent::articlesQuery()->orderByDesc('is_featured')->orderByDesc('published_at')->orderByDesc('id')->limit(3)->get(),
            'newsLabels' => CS::labelMap('news_category', ArticleCategory::class),
            'partners' => Partner::query()->published()->with('logo')->orderBy('sort_order')->orderBy('id')->get(),
            'gallery' => $galleryAll->take(12)->values(),
            'galleryPhotos' => $galleryAll->where('type', '!=', 'video')->count(),
            'galleryVideos' => $galleryAll->where('type', 'video')->count(),
            'faqs' => Faq::query()->published()->orderBy('sort_order')->orderBy('id')->get(),
            'info' => SiteContent::info(),
        ];
    }
}
