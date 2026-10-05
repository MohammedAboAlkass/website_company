<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Support\ContentSupport as CS;
use App\Support\HtmlSanitizer;
use App\Support\SiteContent;
use Illuminate\Support\Facades\DB;

/** Public news pages (published articles whose publish time has passed; drafts / scheduled / deleted never show). */
class ArticleController extends Controller
{
    public function index()
    {
        SiteContent::seo(SiteContent::page('news')); // CMS row: hidden/draft = 404, SEO title/description
        $all = SiteContent::articlesQuery()->orderByDesc('published_at')->orderByDesc('id')->limit(300)->get();
        $featured = $all->firstWhere('is_featured', true) ?: $all->first();
        // the featured article has its own block; the list holds the others
        $list = $all->count() > 1 ? $all->where('id', '!=', $featured?->id)->values() : $all->values();
        $labels = CS::labelMap('news_category', ArticleCategory::class);
        $cats = [];
        foreach ($list as $a) {
            $s = $a->category?->slug ?? 'other';
            $cats[$s] = ($cats[$s] ?? 0) + 1;
        }
        $order = ArticleCategory::query()->orderBy('sort_order')->orderBy('id')->pluck('slug')->all();
        $chips = [];
        foreach ($order as $s) {
            if (isset($cats[$s])) {
                $chips[] = ['slug' => $s, 'label' => $labels[$s] ?? $s, 'count' => $cats[$s]];
            }
        }
        if (isset($cats['other'])) {
            $chips[] = ['slug' => 'other', 'label' => 'أخرى', 'count' => $cats['other']];
        }

        return view('site.news.index', [
            'featured' => $all->count() ? $featured : null,
            'list' => $list,
            'chips' => $chips,
            'labels' => $labels,
            'total' => $list->count(),
        ]);
    }

    public function show(string $slug)
    {
        $a = SiteContent::articlesQuery()->with('tags')->where('slug', $slug)->first();
        abort_unless($a, 404);
        DB::table('articles')->where('id', $a->id)->update(['views_count' => DB::raw('views_count + 1')]);

        $labels = CS::labelMap('news_category', ArticleCategory::class);
        $related = SiteContent::articlesQuery()->where('id', '!=', $a->id)
            ->orderByRaw('article_category_id = ? desc', [$a->article_category_id ?? 0])
            ->orderByDesc('published_at')->limit(3)->get();

        return view('site.news.show', [
            'a' => $a,
            'body' => HtmlSanitizer::clean((string) $a->body),
            'catLabel' => $labels[$a->category?->slug ?? ''] ?? $a->category?->name,
            'labels' => $labels,
            'related' => $related,
        ]);
    }
}
