<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Partner;

/**
 * Public «شركاؤنا» page (/partners): the SAME partners as the home page section (table `partners`, managed in
 * الإدارة ← الشركاء): published rows, ordered by sort_order then id. Page texts come from «نصوص الموقع» (SiteTexts, keys partners.*).
 */
class PartnerController extends Controller
{
    public function index()
    {
        $partners = collect();
        try {
            $partners = Partner::query()->published()->with('logo')->orderBy('sort_order')->orderBy('id')->get();
        } catch (\Throwable $e) {
            report($e); // table missing / DB down: the page still renders (empty state)
        }

        return view('site.partners', ['partners' => $partners]);
    }
}
