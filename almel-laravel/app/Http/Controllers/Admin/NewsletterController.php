<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use App\Support\Audit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Newsletter sign-ups of the public footer form (table newsletter_subscribers). Module: messages (route_modules newsletter => messages). */
class NewsletterController extends Controller
{
    private function filtered(Request $request)
    {
        $q = mb_substr(trim(\App\Support\Req::str($request, 'q', '')), 0, 80);
        $status = in_array($request->query('status'), ['subscribed', 'unsubscribed'], true) ? $request->query('status') : '';
        $query = NewsletterSubscriber::query();
        if ($q !== '') {
            $query->where('email', 'like', '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q).'%');
        }
        if ($status !== '') {
            $query->where('status', $status);
        }

        return [$query->orderByDesc('created_at')->orderByDesc('id'), $q, $status];
    }

    public function index(Request $request)
    {
        [$query, $q, $status] = $this->filtered($request);

        return view('admin.newsletter.index', [
            'subs' => $query->paginate(20)->withQueryString(),
            'q' => $q,
            'status' => $status,
            'stats' => [
                'total' => NewsletterSubscriber::query()->count(),
                'active' => NewsletterSubscriber::query()->where('status', 'subscribed')->count(),
                'left' => NewsletterSubscriber::query()->where('status', 'unsubscribed')->count(),
                'week' => NewsletterSubscriber::query()->where('created_at', '>=', now()->subDays(7))->count(),
            ],
        ]);
    }

    public function toggle(NewsletterSubscriber $subscriber): RedirectResponse
    {
        if ($subscriber->status === 'subscribed') {
            $subscriber->forceFill(['status' => 'unsubscribed', 'unsubscribed_at' => now()])->save();
            $msg = 'تم إيقاف الاشتراك.';
        } else {
            $subscriber->forceFill(['status' => 'subscribed', 'subscribed_at' => now(), 'unsubscribed_at' => null])->save();
            $msg = 'تمت إعادة تفعيل الاشتراك.';
        }
        Audit::log('newsletter.toggle', $msg.' '.$subscriber->email, $subscriber);

        return redirect()->back()->with('success', $msg);
    }

    public function destroy(NewsletterSubscriber $subscriber): RedirectResponse
    {
        $email = $subscriber->email;
        $subscriber->delete();
        Audit::log('newsletter.delete', 'حذف مشترك من النشرة: '.$email);

        return redirect()->back()->with('success', 'تم حذف المشترك.');
    }

    public function export(Request $request): StreamedResponse
    {
        [$query] = $this->filtered($request);
        Audit::log('newsletter.export', 'صدّر قائمة مشتركي النشرة (CSV)');

        return response()->streamDownload(function () use ($query) {
            $o = fopen('php://output', 'w');
            fwrite($o, "\xEF\xBB\xBF");
            \App\Support\Csv::put($o, ['البريد الإلكتروني', 'الحالة', 'تاريخ الاشتراك']);
            $query->chunk(500, function ($rows) use ($o) {
                foreach ($rows as $s) {
                    \App\Support\Csv::put($o, [$s->email, $s->status === 'subscribed' ? 'مشترك' : 'ملغى', $s->subscribed_at?->format('Y-m-d H:i') ?: $s->created_at?->format('Y-m-d H:i')]);
                }
            });
            fclose($o);
        }, 'newsletter-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
