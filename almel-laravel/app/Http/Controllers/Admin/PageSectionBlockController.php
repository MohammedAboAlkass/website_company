<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PageSectionBlockController extends Controller
{
    public function store(Request $request, string $section)
    {
        // TODO: implement
        return redirect()->back();
    }

    public function update(Request $request, string $section, string $block)
    {
        // TODO: implement
        return redirect()->back();
    }

    public function destroy(string $section, string $block)
    {
        // TODO: implement
        return redirect()->back();
    }
}
