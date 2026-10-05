<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appeal;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use App\Support\PeopleSupport as PS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/** The urgent relief appeal card of the homepage (table `appeals`: one card, content only — no donation flow). */
class AppealController extends Controller
{
    /** GET /admin/appeals : redirect to the page (HTML) or the card (JSON; data = null when none exists yet). */
    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return redirect()->route('admin.appeal');
        }
        $a = Appeal::with('image')->orderByDesc('is_active')->orderBy('id')->first();

        return response()->json(['data' => $a ? $this->row($a) : null]);
    }

    public function show(Request $request, string $id)
    {
        if (! $request->expectsJson()) {
            return redirect()->route('admin.appeal');
        }
        $a = Appeal::with('image')->find($id);

        return $a ? response()->json(['data' => $this->row($a)]) : response()->json(['message' => 'البطاقة غير موجودة.'], 404);
    }

    public function create()
    {
        return redirect()->route('admin.appeal');
    }

    public function edit(string $id)
    {
        return redirect()->route('admin.appeal');
    }

    /** POST /admin/appeals : creates the card when the table is empty. */
    public function store(Request $request): JsonResponse
    {
        if (Appeal::exists()) {
            return response()->json(['message' => 'بطاقة النداء موجودة بالفعل، عدّلها بدلاً من إنشاء بطاقة جديدة.'], 422);
        }
        $d = $this->validated($request);
        $a = new Appeal();
        $this->fill($a, $d);
        $a->is_active = array_key_exists('is_active', $d) ? (bool) $d['is_active'] : true;
        $a->save();
        Audit::log('appeal.create', 'إنشاء بطاقة نداء الإغاثة', $a);

        return response()->json(['data' => $this->row($a->fresh('image')), 'message' => 'تم حفظ نداء الإغاثة'], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $a = Appeal::findOrFail($id);
        $d = $this->validated($request);
        $this->fill($a, $d);
        if (array_key_exists('is_active', $d)) {
            $a->is_active = (bool) $d['is_active'];
        }
        $a->save();
        Audit::log('appeal.update', 'تعديل بطاقة نداء الإغاثة'.($a->is_active ? '' : ' (مخفية)'), $a);

        return response()->json(['data' => $this->row($a->fresh('image')), 'message' => 'تم حفظ نداء الإغاثة']);
    }

    public function destroy(Request $request, string $id)
    {
        $msg = 'لا يمكن حذف بطاقة النداء. يمكنك إخفاؤها من الموقع بمفتاح «إظهار البطاقة».';

        return $request->expectsJson() ? response()->json(['message' => $msg], 422) : redirect()->route('admin.appeal')->with('error', $msg);
    }

    /** POST /admin/appeals/image (multipart file) : uploads the card image. */
    public function image(Request $request): JsonResponse
    {
        $m = PS::upload($request, 'صورة نداء');

        return response()->json(['data' => PS::media($m)], 201);
    }

    // ------------------------------------------------------------------

    private function validated(Request $request): array
    {
        $v = Validator::make($request->all(), [
            'flag_label' => ['nullable', 'string', 'max:200'],
            'chip_label' => ['nullable', 'string', 'max:200'],
            'kicker' => ['nullable', 'string', 'max:300'],
            'title_line1' => ['required', 'string', 'max:300'],
            'title_line2' => ['nullable', 'string', 'max:300'],
            'description' => ['required', 'string', 'max:60000'],
            'primary_cta_text' => ['nullable', 'string', 'max:200'],
            'primary_cta_url' => ['nullable', 'string', 'max:500'],
            'secondary_cta_text' => ['nullable', 'string', 'max:200'],
            'secondary_cta_url' => ['nullable', 'string', 'max:500'],
            'image_media_id' => ['nullable', 'integer', Rule::exists('media_files', 'id')->whereNull('deleted_at')],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
        ], [
            'title_line1.required' => 'السطر الأول من العنوان مطلوب.',
            'description.required' => 'نص النداء مطلوب.',
            'image_media_id.exists' => 'الصورة المختارة غير موجودة.',
            'image_media_id.integer' => 'الصورة المختارة غير صالحة.',
            'starts_at.date' => 'تاريخ البدء غير صالح.',
            'ends_at.date' => 'تاريخ الانتهاء غير صالح.',
        ]);
        $limits = ['flag_label' => [60, 'وسم الصورة'], 'chip_label' => [100, 'الشارة العلوية'], 'kicker' => [120, 'العنوان الفرعي'], 'title_line1' => [120, 'السطر الأول'], 'title_line2' => [120, 'السطر الثاني'], 'primary_cta_text' => [80, 'نص الزر الرئيسي'], 'secondary_cta_text' => [80, 'نص الزر الثانوي']];
        $v->after(function ($v) use ($request, $limits) {
            foreach ($limits as $k => [$max, $label]) {
                $t = (string) PS::text($request->input($k));
                if (mb_strlen($t) > $max) {
                    $v->errors()->add($k, $label.' يجب ألا يتجاوز '.$max.' حرفاً.');
                }
            }
            if (PS::text($request->input('title_line1')) === null) {
                $v->errors()->add('title_line1', 'السطر الأول من العنوان مطلوب.');
            }
            $desc = CS::plainText(CS::cleanHtml((string) $request->input('description')));
            if ($desc === '') {
                $v->errors()->add('description', 'نص النداء مطلوب.');
            } elseif (mb_strlen($desc) > 2000) {
                $v->errors()->add('description', 'نص النداء يجب ألا يتجاوز 2000 حرف.');
            }
            foreach (['primary_cta_url' => 'وجهة الزر الرئيسي', 'secondary_cta_url' => 'وجهة الزر الثانوي'] as $k => $label) {
                if (! PS::validLink($request->input($k))) {
                    $v->errors()->add($k, $label.' غير صالحة (قسم في الموقع مثل #contact أو رابط https://).');
                }
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

    private function fill(Appeal $a, array $d): void
    {
        foreach (['flag_label' => 60, 'chip_label' => 100, 'kicker' => 120, 'title_line2' => 120, 'primary_cta_text' => 80, 'secondary_cta_text' => 80] as $k => $max) {
            $t = PS::text($d[$k] ?? null);
            $a->$k = $t === null ? null : mb_substr($t, 0, $max);
        }
        $a->title_line1 = mb_substr((string) PS::text($d['title_line1']), 0, 120);
        $a->description = CS::cleanHtml($d['description']);
        $a->primary_cta_url = PS::link($d['primary_cta_url'] ?? null);
        $a->secondary_cta_url = PS::link($d['secondary_cta_url'] ?? null);
        $a->image_media_id = ! empty($d['image_media_id']) ? (int) $d['image_media_id'] : null;
        $a->starts_at = PS::parseLocal($d['starts_at'] ?? null);
        $a->ends_at = PS::parseLocal($d['ends_at'] ?? null);
    }

    private function row(Appeal $a): array
    {
        return [
            'id' => $a->id,
            'flag_label' => $a->flag_label,
            'chip_label' => $a->chip_label,
            'kicker' => $a->kicker,
            'title_line1' => $a->title_line1,
            'title_line2' => $a->title_line2,
            'description' => $a->description,
            'primary_cta_text' => $a->primary_cta_text,
            'primary_cta_url' => $a->primary_cta_url,
            'secondary_cta_text' => $a->secondary_cta_text,
            'secondary_cta_url' => $a->secondary_cta_url,
            'image' => PS::media($a->image),
            'visible' => (bool) $a->is_active,
            'starts_at' => PS::localInput($a->starts_at),
            'ends_at' => PS::localInput($a->ends_at),
        ];
    }
}
