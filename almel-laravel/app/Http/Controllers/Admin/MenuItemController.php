<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function store(Request $request, string $menu)
    {
        // TODO: implement
        return redirect()->back();
    }

    public function update(Request $request, string $menu, string $item)
    {
        // TODO: implement
        return redirect()->back();
    }

    public function destroy(string $menu, string $item)
    {
        // TODO: implement
        return redirect()->back();
    }
}
