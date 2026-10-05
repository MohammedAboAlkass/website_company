<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\AdminStats;
use App\Support\SiteContent;

/** نظرة عامة: real counts from the database (no demo data). */
class DashboardController extends Controller
{
    private const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    public function index()
    {
        $now = now();

        return view('admin.dashboard', [
            'greeting' => ($now->hour < 12 ? 'صباح الخير' : 'مساء الخير').'، '.auth()->user()->name,
            'today' => self::DAYS[$now->dayOfWeek].' '.SiteContent::date($now),
            't' => AdminStats::totals(),
            'govs' => AdminStats::governorates(),
            'projects' => AdminStats::activeProjects(5),
            'messages' => AdminStats::latestMessages(4),
            'articles' => AdminStats::latestArticles(5),
            'feed' => AdminStats::feed(8),
            'series' => AdminStats::series(\App\Models\ContactMessage::class, 'created_at', now()->subDays(29)->startOfDay()),
        ]);
    }
}
