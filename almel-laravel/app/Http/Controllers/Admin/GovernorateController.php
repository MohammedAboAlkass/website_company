<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Legacy URLs /admin/governorates*: the 5 governorates are managed on the impact-map page, so every
 * verb simply redirects there (it used to render a view without data and answer 500).
 */
class GovernorateController extends Controller
{
    public function index()
    {
        return $this->toImpact();
    }

    public function create()
    {
        return $this->toImpact();
    }

    public function store(Request $request)
    {
        return $this->toImpact();
    }

    public function show(string $id)
    {
        return $this->toImpact();
    }

    public function edit(string $id)
    {
        return $this->toImpact();
    }

    public function update(Request $request, string $id)
    {
        return $this->toImpact();
    }

    public function destroy(string $id)
    {
        return $this->toImpact();
    }

    private function toImpact()
    {
        return redirect('/admin/impact');
    }
}
