<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\NotificationService as NS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The signed-in user's own notifications (rows of `notifications`, notifiable = the user).
 * Routes are "free" in config/permissions.php (every panel user), data is always limited to the
 * user's own rows and to the modules their role may view (NotificationService::query).
 */
class NotificationController extends Controller
{
    /** GET /admin/notifications?f=all|unread&type=&q= */
    public function index(Request $request)
    {
        $user = $request->user();
        $filter = $request->query('f') === 'unread' ? 'unread' : 'all';
        $allowed = NS::allowedEvents($user);
        $type = \App\Support\Req::str($request, 'type', '');
        $type = in_array($type, $allowed, true) ? $type : '';
        $q = mb_substr(trim(\App\Support\Req::str($request, 'q', '')), 0, 80);

        $base = NS::query($user);
        $counts = ['all' => (clone $base)->count(), 'unread' => (clone $base)->whereNull('read_at')->count()];

        $query = clone $base;
        if ($filter === 'unread') {
            $query->whereNull('read_at');
        }
        if ($type !== '') {
            $query->where('type', NS::TYPE_PREFIX.$type);
        }
        if ($q !== '') {
            $query->where('data', 'like', '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q).'%');
        }
        $page = $query->orderByDesc('created_at')->orderByDesc('id')->paginate(15)->withQueryString();
        if ($page->total() > 0 && $page->currentPage() > $page->lastPage()) { // page beyond the end (e.g. after deleting): go to the last page
            return redirect()->route('admin.notifications.index', array_merge($request->query(), ['page' => $page->lastPage()]));
        }
        $items = collect($page->items())->map(fn ($r) => NS::present($r))->all();

        $types = [];
        foreach ($allowed as $e) {
            $types[$e] = NS::EVENTS[$e]['label'];
        }

        return view('admin.notifications.index', [
            'page' => $page, 'items' => $items, 'counts' => $counts, 'filter' => $filter,
            'type' => $type, 'q' => $q, 'types' => $types, 'quiet' => NS::quietNow(),
        ]);
    }

    /** GET /admin/notifications/feed (header bell; polled every 60 s) */
    public function feed(Request $request): JsonResponse
    {
        return response()->json(NS::feed($request->user()))->header('Cache-Control', 'no-store');
    }

    /** GET /admin/notifications/{id}: mark read, then go to the linked page */
    public function show(Request $request, string $id)
    {
        $row = NS::query($request->user())->where('id', $id)->first();
        abort_if(! $row, 404);
        if ($row->read_at === null) {
            NS::query($request->user())->where('id', $id)->update(['read_at' => now(), 'updated_at' => now()]);
        }
        $p = NS::present($row);

        return $p['url'] ? redirect($p['url']) : redirect()->route('admin.notifications.index');
    }

    /** PATCH /admin/notifications/{id}/read  (read=0 puts it back to unread) */
    public function read(Request $request, string $id)
    {
        $row = NS::query($request->user())->where('id', $id)->first();
        abort_if(! $row, 404);
        $read = $request->input('read', '1') !== '0';
        NS::query($request->user())->where('id', $id)->update(['read_at' => $read ? ($row->read_at ?: now()) : null, 'updated_at' => now()]);

        return $this->answer($request, $read ? 'تم تعليم الإشعار كمقروء.' : 'أُعيد الإشعار إلى غير المقروء.');
    }

    /** POST /admin/notifications/read-all */
    public function readAll(Request $request)
    {
        $n = NS::query($request->user())->whereNull('read_at')->update(['read_at' => now(), 'updated_at' => now()]);

        return $this->answer($request, $n ? 'تم تعليم '.$n.' إشعار كمقروء.' : 'لا توجد إشعارات غير مقروءة.');
    }

    /** POST /admin/notifications/clear-read: deletes the user's read notifications */
    public function clearRead(Request $request)
    {
        $n = NS::query($request->user())->whereNotNull('read_at')->delete();

        return $this->answer($request, $n ? 'حُذف '.$n.' إشعار مقروء.' : 'لا توجد إشعارات مقروءة لحذفها.');
    }

    /** DELETE /admin/notifications/{id} */
    public function destroy(Request $request, string $id)
    {
        $n = NS::query($request->user())->where('id', $id)->delete();
        abort_if(! $n, 404);

        return $this->answer($request, 'تم حذف الإشعار.');
    }

    private function answer(Request $request, string $msg)
    {
        if ($request->expectsJson()) {
            return response()->json(['ok' => true, 'message' => $msg, 'unread' => NS::unreadCount($request->user())]);
        }

        return back()->with('success', $msg);
    }
}
