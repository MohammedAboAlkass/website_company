<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\SiteContent;
use App\Support\SiteSettings;

/** /sitemap.xml (settings seo.sitemap + seo.index). robots.txt stays the static file in /public. */
class SitemapController extends Controller
{
    public function index()
    {
        if (! SiteSettings::sitemapOn()) {
            abort(404);
        }
        $urls = [];
        $add = function (string $path, $mod = null, string $freq = 'weekly', string $prio = '0.6') use (&$urls) {
            $urls[$path] = ['loc' => url($path), 'mod' => $mod ? $mod->toAtomString() : null, 'freq' => $freq, 'prio' => $prio];
        };
        $pages = [];
        try {
            $pages = Page::query()->get()->keyBy('slug');
        } catch (\Throwable $e) {
            report($e);
        }
        $built = ['about' => '/about', 'projects' => '/projects', 'news' => '/news', 'gallery' => '/gallery', 'partners' => '/partners', 'contact' => '/contact'];
        $add('/', $pages['home']->updated_at ?? null, 'daily', '1.0');
        foreach ($built as $slug => $path) {
            if (isset($pages[$slug]) && $pages[$slug]->status !== 'published') {
                continue;
            }
            $add($path, $pages[$slug]->updated_at ?? null, 'weekly', $slug === 'news' ? '0.8' : '0.7');
        }
        foreach ($pages as $slug => $p) {
            if ($p->status !== 'published' || $slug === 'home' || isset($built[$slug]) || in_array($slug, ['project', 'article'], true)) {
                continue;
            }
            $add('/'.rawurlencode($slug), $p->updated_at, 'monthly', '0.4');
        }
        try {
            foreach (SiteContent::projectsQuery()->get(['id', 'slug', 'updated_at']) as $pr) {
                $add('/projects/'.rawurlencode($pr->slug), $pr->updated_at, 'monthly', '0.6');
            }
            foreach (SiteContent::articlesQuery()->get(['id', 'slug', 'updated_at', 'published_at']) as $a) {
                $add('/news/'.rawurlencode($a->slug), $a->updated_at ?? $a->published_at, 'monthly', '0.6');
            }
        } catch (\Throwable $e) {
            report($e);
        }
        $x = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($urls as $u) {
            $x .= '  <url><loc>'.htmlspecialchars($u['loc'], ENT_XML1 | ENT_QUOTES, 'UTF-8').'</loc>'
                .($u['mod'] ? '<lastmod>'.$u['mod'].'</lastmod>' : '')
                .'<changefreq>'.$u['freq'].'</changefreq><priority>'.$u['prio'].'</priority></url>'."\n";
        }
        $x .= '</urlset>'."\n";

        return response($x, 200, ['Content-Type' => 'application/xml; charset=UTF-8', 'Cache-Control' => 'public, max-age=300']);
    }
}
