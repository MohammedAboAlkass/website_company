<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\ContentSupport;

/** Public CMS pages created from «إدارة الصفحات» (published, non-system pages only). */
class PageController extends Controller
{
    public function show(string $slug)
    {
        $page = Page::query()->published()->where('slug', $slug)->first();
        abort_unless($page && ! in_array($page->slug, \App\Http\Controllers\Admin\PageController::SYSTEM, true), 404);

        return view('site.page', [
            'page' => $page,
            'html' => (string) ContentSupport::cleanHtml((string) $page->body),
        ]);
    }
}
