<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Setting;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use App\Support\PeopleSupport as PS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/** Items of the announcements bar (table `announcements`, soft delete) + the bar switch / label (settings announcement_bar.*). */
class AnnouncementController extends Controller
{
    /** GET /admin/announcements : the Blade page (HTML) or list + bar settings (JSON). */
    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return view('admin.announcements.index', ['opts' => PS::options()]);
        }

        return response()->json([
            'data' => Announcement::orderBy('sort_order')->orderBy('id')->get()->map(fn (Announcement $a) => $this->row($a))->values(),
            'bar' => $this->bar(),
        ]);
    }

    public function show(Request $request, string $id)
    {
        if (! $request->expectsJson()) {
            return redirect()->route('admin.announcements.index');
        }
        $a = Announcement::find($id);

        return $a ? response()->json(['data' => $this->row($a)]) : response()->json(['message' => 'الإعلان غير موجود.'], 404);
    }

    public function create()
    {
        return redirect()->route('admin.announcements.index');
    }

    public function edit(string $id)
    {
        return redirect()->route('admin.announcements.index');
    }

    public function store(Request $request): JsonResponse
    {
        $d = $this->validated($request);
        $a = new Announcement();
        $this->fill($a, $d);
        $a->sort_order = PS::nextOrder(Announcement::class);
        $a->is_published = array_key_exists('is_published', $d) ? (bool) $d['is_published'] : true;
        $a->save();
        Audit::log('announcement.create', 'إضافة إعلان: '.mb_substr($a->text, 0, 80), $a);

        return response()->json(['data' => $this->row($a->fresh()), 'message' => 'تمت إضافة الإعلان'], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $a = Announcement::findOrFail($id);
        $d = $this->validated($request);
        $this->fill($a, $d);
        if (array_key_exists('is_published', $d)) {
            $a->is_published = (bool) $d['is_published'];
        }
        $a->save();
        Audit::log('announcement.update', 'تعديل إعلان: '.mb_substr($a->text, 0, 80), $a);

        return response()->json(['data' => $this->row($a->fresh()), 'message' => 'تم حفظ التغييرات']);
    }

    public function destroy(Request $request, string $id)
    {
        $a = Announcement::findOrFail($id);
        $t = mb_substr($a->text, 0, 80);
        $a->delete();
        Audit::log('announcement.delete', 'حذف إعلان: '.$t, $a);

        return $request->expectsJson() ? response()->json(['message' => 'تم حذف الإعلان']) : redirect()->route('admin.announcements.index');
    }

    public function toggle(Request $request, string $id): JsonResponse
    {
        $a = Announcement::findOrFail($id);
        $a->is_published = $request->has('visible') ? $request->boolean('visible') : ! $a->is_published;
        $a->save();
        Audit::log('announcement.visibility', ($a->is_published ? 'إظهار إعلان: ' : 'إخفاء إعلان: ').mb_substr($a->text, 0, 80), $a);

        return response()->json(['data' => $this->row($a->fresh()), 'message' => $a->is_published ? 'أصبح الإعلان ظاهراً' : 'تم إخفاء الإعلان']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'max:500'], 'ids.*' => ['integer']], ['ids.required' => 'قائمة الترتيب مطلوبة.']);
        PS::reorder(Announcement::class, $data['ids']);
        Audit::log('announcement.reorder', 'تغيير ترتيب الإعلانات');

        return response()->json(['message' => 'تم حفظ الترتيب']);
    }

    /** PUT /admin/announcements/bar {label, visible} : bar title + on/off. */
    public function saveBar(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'label' => ['required', 'string', 'max:200'],
            'visible' => ['required', 'boolean'],
        ], ['label.required' => 'عنوان الشريط مطلوب.', 'visible.required' => 'حدّد إن كان الشريط ظاهراً.']);
        $v->after(function ($v) use ($request) {
            $l = (string) PS::text($request->input('label'));
            if ($l === '') {
                $v->errors()->add('label', 'عنوان الشريط مطلوب.');
            } elseif (mb_strlen($l) > 30) {
                $v->errors()->add('label', 'عنوان الشريط يجب ألا يتجاوز 30 حرفاً.');
            }
        });
        $d = $v->validate();
        $this->put('announcement_bar.label', (string) PS::text($d['label']), 'string', 'Bar label');
        $this->put('announcement_bar.visible', $d['visible'] ? '1' : '0', 'bool', 'Show announcements bar');
        Audit::log('announcement.bar', 'تعديل شريط الإعلانات: '.($d['visible'] ? 'ظاهر' : 'مخفي'));

        return response()->json(['bar' => $this->bar(), 'message' => 'تم حفظ إعدادات الشريط']);
    }

    // ------------------------------------------------------------------

    private function put(string $key, string $value, string $type, string $label): void
    {
        $s = Setting::where('key', $key)->first() ?: new Setting(['key' => $key, 'type' => $type, 'section' => 'announcement_bar', 'label' => $label, 'is_public' => true, 'sort_order' => 0]);
        $s->value = $value;
        $s->save();
    }

    private function bar(): array
    {
        $label = Setting::where('key', 'announcement_bar.label')->value('value');
        $vis = Setting::where('key', 'announcement_bar.visible')->value('value');

        return ['label' => $label !== null && trim($label) !== '' ? $label : 'آخر الإعلانات', 'visible' => $vis === null ? true : filter_var($vis, FILTER_VALIDATE_BOOLEAN)];
    }

    private function validated(Request $request): array
    {
        $v = Validator::make($request->all(), [
            'text' => ['required', 'string', 'max:2000'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'details' => ['nullable', 'string', 'max:60000'],
            'is_published' => ['nullable', 'boolean'],
        ], [
            'text.required' => 'نص الإعلان مطلوب.',
            'starts_at.date' => 'تاريخ البدء غير صالح.',
            'ends_at.date' => 'تاريخ الانتهاء غير صالح.',
        ]);
        $v->after(function ($v) use ($request) {
            $t = (string) PS::text($request->input('text'));
            if ($t === '') {
                $v->errors()->add('text', 'نص الإعلان مطلوب.');
            } elseif (mb_strlen($t) > 255) {
                $v->errors()->add('text', 'نص الإعلان يجب ألا يتجاوز 255 حرفاً.');
            }
            if (mb_strlen(CS::plainText(CS::cleanHtml((string) $request->input('details')))) > 5000) {
                $v->errors()->add('details', 'تفاصيل الإعلان يجب ألا تتجاوز 5000 حرف.');
            }
            if (! PS::validLink($request->input('link_url'))) {
                $v->errors()->add('link_url', 'الرابط غير صالح (قسم في الموقع مثل #news أو رابط https://).');
            }
            if (! $v->errors()->has('starts_at') && ! $v->errors()->has('ends_at')) {
                $s = PS::parseLocal($request->input('starts_at'));
                $e = PS::parseLocal($request->input('ends_at'));
                if ($s && $e && $e->lessThanOrEqualTo($s)) {
                    $v->errors()->add('ends_at', 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.');
                }
            }
        });

        return $v->validate();
    }

    private function fill(Announcement $a, array $d): void
    {
        $a->text = mb_substr((string) PS::text($d['text']), 0, 255);
        $a->link_url = PS::link($d['link_url'] ?? null);
        $det = CS::cleanHtml((string) ($d['details'] ?? ''));
        $a->details = CS::plainText($det) === '' ? null : $det;
        $a->starts_at = PS::parseLocal($d['starts_at'] ?? null);
        $a->ends_at = PS::parseLocal($d['ends_at'] ?? null);
    }

    private function row(Announcement $a): array
    {
        return [
            'id' => $a->id,
            'text' => $a->text,
            'link_url' => $a->link_url,
            'details' => (string) $a->details,
            'starts_at' => PS::localInput($a->starts_at),
            'ends_at' => PS::localInput($a->ends_at),
            'visible' => (bool) $a->is_published,
            'sort_order' => (int) $a->sort_order,
        ];
    }
}
