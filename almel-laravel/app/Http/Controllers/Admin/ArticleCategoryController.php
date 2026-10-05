<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ArticleCategoryController extends Controller
{
    public function index()
    {
        // TODO: implement
        return view('admin.article-categories.index');
    }

    public function create()
    {
        // TODO: implement
        return view('admin.article-categories.create');
    }

    public function store(Request $request)
    {
        // TODO: implement
        return redirect()->route('admin.article-categories.index');
    }

    public function show(string $id)
    {
        // TODO: implement
        return view('admin.article-categories.show', ['id' => $id]);
    }

    public function edit(string $id)
    {
        // TODO: implement
        return view('admin.article-categories.edit', ['id' => $id]);
    }

    public function update(Request $request, string $id)
    {
        // TODO: implement
        return redirect()->route('admin.article-categories.index');
    }

    public function destroy(string $id)
    {
        // TODO: implement
        return redirect()->route('admin.article-categories.index');
    }
}
