<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Support\ContentSupport;
use App\Support\SiteContent;
use Illuminate\Http\Request;

class AboutController extends Controller
{
    public function index()
    {
        // A published «من نحن» row in إدارة الصفحات with its own body replaces the static page; otherwise the static design stays.
        $page = SiteContent::page('about');
        SiteContent::seo($page);
        if ($page && trim((string) $page->body) !== '') {
            return view('site.page', ['page' => $page, 'html' => (string) ContentSupport::cleanHtml((string) $page->body), 'active' => 'about']);
        }

        return view('site.about');
    }
}
