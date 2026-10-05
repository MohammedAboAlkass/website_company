<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        // Static design only (no data / no DB).
        return view('admin.settings.index');
    }

    public function update(Request $request)
    {
        // Static design only (no data / no DB).
        return redirect()->back();
    }
}
