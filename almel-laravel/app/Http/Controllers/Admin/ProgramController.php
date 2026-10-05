<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index()
    {
        // TODO: implement
        return view('admin.programs.index');
    }

    public function create()
    {
        // TODO: implement
        return view('admin.programs.create');
    }

    public function store(Request $request)
    {
        // TODO: implement
        return redirect()->route('admin.programs.index');
    }

    public function show(string $id)
    {
        // TODO: implement
        return view('admin.programs.show', ['id' => $id]);
    }

    public function edit(string $id)
    {
        // TODO: implement
        return view('admin.programs.edit', ['id' => $id]);
    }

    public function update(Request $request, string $id)
    {
        // TODO: implement
        return redirect()->route('admin.programs.index');
    }

    public function destroy(string $id)
    {
        // TODO: implement
        return redirect()->route('admin.programs.index');
    }
}
