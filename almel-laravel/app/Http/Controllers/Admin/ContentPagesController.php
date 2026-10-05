<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Support\ContentSupport as CS;

/** Blade shells of the News list, News editor and Gallery pages (data comes from the JSON controllers). */
class ContentPagesController extends Controller
{
    public function news()
    {
        return view('admin.news.index', [
            'opts' => [
                'categories' => CS::categoryOptions(),
                'statuses' => CS::statusOptions(),
                'statusLabels' => CS::statusLabels(),
            ],
        ]);
    }

    public function newsEdit()
    {
        $current = null;
        $id = \App\Support\Req::str(request(), 'id');
        $keepCat = [];
        if ($id !== '' && ctype_digit($id)) {
            $a = Article::with('category:id,slug')->find($id);
            $current = $a?->category?->slug;
            $keepCat = $current ? [$current] : [];
        }

        return view('admin.news.edit', [
            'opts' => [
                'categories' => CS::categoryOptions($keepCat),
                'statuses' => CS::statusOptions(),
                'user' => auth()->user()->name,
                'maxMb' => (float) CS::maxUploadMb(),
            ],
        ]);
    }

    public function gallery()
    {
        return view('admin.gallery.index', ['opts' => ['maxMb' => (float) CS::maxUploadMb()]]);
    }
}
