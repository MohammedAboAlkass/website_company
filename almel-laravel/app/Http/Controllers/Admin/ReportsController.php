<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\AdminStats;
use App\Support\Audit;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Reports & statistics from real database counts (no donation figures). Export needs `reports.export`. */
class ReportsController extends Controller
{
    private const RANGES = ['7d', '30d', '90d', '12m', 'ytd'];

    private function range(Request $request): string
    {
        $r = \App\Support\Req::str($request, 'range', '30d');

        return in_array($r, self::RANGES, true) ? $r : '30d';
    }

    public function index(Request $request)
    {
        return view('admin.reports.index', ['r' => AdminStats::report($this->range($request)), 'ranges' => self::RANGES]);
    }

    public function export(Request $request): StreamedResponse
    {
        $r = AdminStats::report($this->range($request));
        Audit::log('reports.export', 'صدّر تقريراً (CSV): '.$r['label']);
        $t = $r['totals'];
        $file = 'report-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($r, $t) {
            $o = fopen('php://output', 'w');
            fwrite($o, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel reads Arabic
            $row = fn (array $a) => \App\Support\Csv::put($o, $a);
            $row(['التقرير', 'جمعية الشمال للتنمية والتطوير المجتمعي']);
            $row(['الفترة', $r['label']]);
            $row(['تاريخ التصدير', now()->format('Y-m-d H:i')]);
            $row([]);
            $row(['المؤشر', 'القيمة']);
            foreach ([
                'الأخبار المنشورة' => $t['articles_published'], 'مسودات الأخبار' => $t['articles_draft'], 'أخبار مجدولة' => $t['articles_scheduled'],
                'مشاهدات الأخبار' => $t['views'], 'المشاريع' => $t['projects_total'], 'المشاريع النشطة' => $t['projects_active'], 'المشاريع المكتملة' => $t['projects_completed'],
                'قصص الميدان المنشورة' => $t['stories'], 'الأنشطة المنشورة' => $t['activities'], 'الشركاء المنشورون' => $t['partners'], 'عناصر المعرض المنشورة' => $t['gallery'],
                'مستخدمو اللوحة النشطون' => $t['users'], 'الرسائل في الوارد' => $t['messages_total'], 'رسائل غير مقروءة' => $t['messages_unread'], 'مشتركو النشرة' => $t['subscribers'],
                'رسائل واردة في الفترة' => $r['msg_in'], 'أخبار نُشرت في الفترة' => $r['art_in'], 'مشتركون جدد في الفترة' => $r['sub_in'],
            ] as $k => $v) {
                $row([$k, $v]);
            }
            $row([]);
            $row(['الرسائل حسب النوع (في الفترة)', 'العدد']);
            foreach ($r['msg_types'] as $k => $v) {
                $row([AdminStats::MSG_TYPES[$k][0] ?? $k, $v]);
            }
            $row([]);
            $row(['المشاريع حسب الحالة', 'العدد']);
            foreach ($r['project_status'] as $k => $v) {
                $row([AdminStats::PROJECT_STATUS[$k] ?? $k, $v]);
            }
            $row([]);
            $row(['أكثر الأخبار مشاهدة', 'المشاهدات']);
            foreach ($r['top_articles'] as $a) {
                $row([$a->title, $a->views_count]);
            }
            $row([]);
            $row(['المحافظة', 'المستفيدون', 'نقاط التوزيع', 'وجبات', 'خيام', 'نقاط مياه']);
            foreach ($r['governorates'] as $g) {
                $row([$g['name'], $g['beneficiaries'], $g['points'], $g['meals'], $g['tents'], $g['water']]);
            }
            fclose($o);
        }, $file, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
