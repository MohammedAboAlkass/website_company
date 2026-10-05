<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PageSectionController extends Controller
{
    public function store(Request $request, string $page)
    {
        // TODO: implement
        return redirect()->back();
    }

    public function update(Request $request, string $page, string $section)
    {
        // TODO: implement
        return redirect()->back();
    }

    public function destroy(string $page, string $section)
    {
        // TODO: implement
        return redirect()->back();
    }
}
