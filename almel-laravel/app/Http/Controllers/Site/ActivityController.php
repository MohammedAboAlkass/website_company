<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Support\SiteContent;

/** Public page of one field activity (the «مشاهدة المزيد» link of the home page «الأنشطة الميدانية» cards). */
class ActivityController extends Controller
{
    public function show(int $id)
    {
        $ac = Activity::query()->published()->with(['image', 'project'])->find($id);
        abort_unless($ac, 404);

        // An activity linked to a public project opens that project's own details page, unless the activity
        // carries its own extra link (video report, document...), which is only reachable from the activity page.
        $link = trim((string) $ac->link_url);
        $hasLink = $link !== '' && ! str_starts_with($link, '#');
        $project = $ac->project_id ? SiteContent::projectsQuery()->where('id', $ac->project_id)->first() : null;
        if ($project && ! $hasLink) {
            return redirect()->route('projects.show', $project->slug);
        }

        return view('site.activities.show', ['ac' => $ac, 'project' => $project, 'hasLink' => $hasLink]);
    }
}
