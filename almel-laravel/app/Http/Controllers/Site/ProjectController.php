<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Support\ContentSupport as CS;
use App\Support\HtmlSanitizer;
use App\Support\SiteContent;

/** Public project pages (every project that is not a draft, ordered as set in the panel). */
class ProjectController extends Controller
{
    public function index()
    {
        SiteContent::seo(SiteContent::page('projects')); // CMS row: hidden/draft = 404, SEO title/description
        $projects = SiteContent::projectsQuery()->orderBy('sort_order')->orderBy('id')->get();
        $labels = CS::labelMap('project_category', Program::class);
        $counts = [];
        foreach ($projects as $p) {
            $s = $p->program?->slug ?? 'other';
            $counts[$s] = ($counts[$s] ?? 0) + 1;
        }
        $chips = [];
        foreach (Program::query()->orderBy('sort_order')->orderBy('id')->get() as $pr) {
            if (isset($counts[$pr->slug])) {
                $chips[] = ['slug' => $pr->slug, 'label' => $labels[$pr->slug] ?? $pr->name, 'count' => $counts[$pr->slug], 'icon' => SiteContent::programIcon($pr->slug)];
            }
        }
        if (isset($counts['other'])) {
            $chips[] = ['slug' => 'other', 'label' => \App\Support\SiteTexts::t('project.chip_other'), 'count' => $counts['other'], 'icon' => 'folder_special'];
        }

        return view('site.projects.index', ['projects' => $projects, 'chips' => $chips, 'labels' => $labels]);
    }

    public function show(string $slug)
    {
        $p = SiteContent::projectsQuery()->with(['components', 'images.media'])->where('slug', $slug)->first();
        abort_unless($p, 404);

        $labels = CS::labelMap('project_category', Program::class);
        $updates = $p->updates()->published()->orderByDesc('published_at')->orderByDesc('id')->limit(30)->get();
        $related = SiteContent::projectsQuery()->where('id', '!=', $p->id)
            ->orderByRaw('program_id = ? desc', [$p->program_id ?? 0])->orderBy('sort_order')->limit(3)->get();

        return view('site.projects.show', [
            'p' => $p,
            'desc' => HtmlSanitizer::clean((string) $p->description),
            'progLabel' => $labels[$p->program?->slug ?? ''] ?? $p->program?->name,
            'updates' => $updates,
            'related' => $related,
            'labels' => $labels,
        ]);
    }
}
