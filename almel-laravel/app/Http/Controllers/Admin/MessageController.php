<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Support\AdminStats;
use App\Support\Audit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/** Inbox of the public contact form (table contact_messages). Server rendered; permissions come from the `perm` middleware (module messages). */
class MessageController extends Controller
{
    private const BOXES = ['all', 'unread', 'starred', 'pending', 'handled', 'archived'];

    public function index(Request $request)
    {
        $box = in_array($request->query('box'), self::BOXES, true) ? $request->query('box') : 'all';
        $type = array_key_exists(\App\Support\Req::str($request, 'type'), AdminStats::MSG_TYPES) ? \App\Support\Req::str($request, 'type') : '';
        $q = trim(\App\Support\Req::str($request, 'q', ''));
        $q = mb_substr($q, 0, 80);

        // opening a message marks it as read (only for people who may edit messages)
        $active = null;
        $id = \App\Support\Req::str($request, 'id');
        if ($id !== '' && ctype_digit($id)) {
            $active = ContactMessage::query()->with('handler:id,name')->find($id);
            if ($active && ! $active->is_read && $request->user()->hasPermission('messages.edit')) {
                $active->forceFill(['is_read' => true, 'read_at' => now()])->save();
            }
        }

        $query = ContactMessage::query()->where('is_archived', $box === 'archived');
        if ($box === 'unread') {
            $query->where('is_read', false);
        } elseif ($box === 'starred') {
            $query->where('is_starred', true);
        } elseif ($box === 'pending') {
            $query->whereNull('handled_at');
        } elseif ($box === 'handled') {
            $query->whereNotNull('handled_at');
        }
        if ($type !== '') {
            $query->where('type', $type);
        }
        if ($q !== '') {
            $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q).'%';
            $query->where(fn ($w) => $w->where('name', 'like', $like)->orWhere('email', 'like', $like)->orWhere('subject', 'like', $like)->orWhere('message', 'like', $like)->orWhere('phone', 'like', $like));
        }
        $messages = $query->orderByDesc('created_at')->orderByDesc('id')->paginate(15)->withQueryString();

        $inbox = ContactMessage::query()->where('is_archived', false);
        $counts = [
            'all' => (clone $inbox)->count(),
            'unread' => (clone $inbox)->where('is_read', false)->count(),
            'starred' => (clone $inbox)->where('is_starred', true)->count(),
            'pending' => (clone $inbox)->whereNull('handled_at')->count(),
            'handled' => (clone $inbox)->whereNotNull('handled_at')->count(),
            'archived' => ContactMessage::query()->where('is_archived', true)->count(),
        ];
        $typeCounts = (clone $inbox)->selectRaw('type, COUNT(*) as c')->groupBy('type')->pluck('c', 'type')->all();

        return view('admin.messages.index', compact('messages', 'active', 'box', 'type', 'q', 'counts', 'typeCounts'));
    }

    public function show(ContactMessage $message): RedirectResponse
    {
        return redirect()->route('admin.messages.index', ['id' => $message->id]);
    }

    public function markRead(Request $request, ContactMessage $message): RedirectResponse
    {
        $read = $request->has('read') ? $request->boolean('read') : true;
        $message->forceFill(['is_read' => $read, 'read_at' => $read ? ($message->read_at ?: now()) : null])->save();

        return $this->back($request, $read ? 'تم تعليم الرسالة كمقروءة.' : 'تم تعليم الرسالة كغير مقروءة.', $read);
    }

    public function star(Request $request, ContactMessage $message): RedirectResponse
    {
        $message->forceFill(['is_starred' => ! $message->is_starred])->save();

        return $this->back($request, $message->is_starred ? 'أُضيفت الرسالة إلى المميزة.' : 'أُزيلت الرسالة من المميزة.', true);
    }

    public function archive(Request $request, ContactMessage $message): RedirectResponse
    {
        $message->forceFill(['is_archived' => ! $message->is_archived, 'is_read' => true, 'read_at' => $message->read_at ?: now()])->save();

        return $this->back($request, $message->is_archived ? 'تمت أرشفة الرسالة.' : 'أُعيدت الرسالة إلى الوارد.', false);
    }

    /** "تم الرد / تمت المتابعة" status + internal note (the site never sends e-mail; reply from your own mail client). */
    public function handle(Request $request, ContactMessage $message): RedirectResponse
    {
        $data = $request->validate([
            'handled' => ['nullable', 'boolean'],
            'internal_note' => ['nullable', 'string', 'max:2000'],
        ], ['internal_note.max' => 'الملاحظة يجب ألا تتجاوز 2000 حرف.']);
        $handled = $request->has('handled') ? $request->boolean('handled') : true;
        $message->forceFill([
            'internal_note' => isset($data['internal_note']) && trim($data['internal_note']) !== '' ? trim($data['internal_note']) : null,
            'handled_at' => $handled ? ($message->handled_at ?: now()) : null,
            'handled_by' => $handled ? ($message->handled_by ?: $request->user()->id) : null,
            'is_read' => true,
            'read_at' => $message->read_at ?: now(),
        ])->save();
        Audit::log('messages.handle', ($handled ? 'علّم رسالة كمُتابَعة: ' : 'أعاد رسالة إلى قيد المتابعة: ').mb_substr((string) $message->name, 0, 60), $message);

        return $this->back($request, $handled ? 'تم حفظ حالة المتابعة والملاحظة.' : 'أُعيدت الرسالة إلى قيد المتابعة.', true);
    }

    public function readAll(): RedirectResponse
    {
        $n = ContactMessage::query()->where('is_archived', false)->where('is_read', false)->update(['is_read' => true, 'read_at' => now()]);

        return redirect()->back()->with('success', $n ? "تم تعليم {$n} رسالة كمقروءة." : 'لا توجد رسائل غير مقروءة.');
    }

    public function destroy(Request $request, ContactMessage $message): RedirectResponse
    {
        $name = mb_substr((string) $message->name, 0, 60);
        $message->delete(); // soft delete
        Audit::log('messages.delete', 'حذف رسالة من: '.$name, $message);

        return redirect()->route('admin.messages.index', array_filter($request->only(['box', 'type', 'q'])))->with('success', 'تم حذف الرسالة.');
    }

    private function back(Request $request, string $msg, bool $keepOpen): RedirectResponse
    {
        $params = array_filter($request->only(['box', 'type', 'q']));
        if ($keepOpen && $request->route('message')) {
            $params['id'] = $request->route('message')->id;
        }

        return redirect()->route('admin.messages.index', $params)->with('success', $msg);
    }
}
