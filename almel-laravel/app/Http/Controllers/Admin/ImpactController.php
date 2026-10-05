<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Governorate;
use App\Support\Audit;
use App\Support\PeopleSupport as PS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/** Impact map: the 5 fixed governorates (table `governorates`) — numbers, note, order, visibility. Edited, never added or deleted. */
class ImpactController extends Controller
{
    private const NUMS = ['beneficiaries' => 'المستفيدون', 'meals' => 'الوجبات', 'tents' => 'الخيام', 'water_points' => 'نقاط المياه', 'distribution_points' => 'نقاط التوزيع'];

    /** GET /admin/impact/data */
    public function data(): JsonResponse
    {
        return response()->json(['data' => Governorate::orderBy('sort_order')->orderBy('id')->get()->map(fn (Governorate $g) => $this->row($g))->values()]);
    }

    /** PUT /admin/impact/{id} */
    public function update(Request $request, string $id): JsonResponse
    {
        $g = Governorate::findOrFail($id);
        $rules = [
            'name' => ['required', 'string', 'max:150'],
            'note' => ['required', 'string', 'max:2000'],
            'is_published' => ['nullable', 'boolean'],
        ];
        $messages = ['name.required' => 'اسم المحافظة مطلوب.', 'note.required' => 'الوصف المختصر مطلوب.'];
        foreach (self::NUMS as $k => $label) {
            $rules[$k] = ['required', 'integer', 'min:0', 'max:999999999'];
            $messages[$k.'.required'] = $label.': أدخل رقماً.';
            $messages[$k.'.integer'] = $label.': أدخل رقماً صحيحاً.';
            $messages[$k.'.min'] = $label.': لا يمكن أن يقل عن صفر.';
            $messages[$k.'.max'] = $label.': الرقم كبير جداً.';
        }
        $v = Validator::make($request->all(), $rules, $messages);
        $v->after(function ($v) use ($request) {
            if (PS::text($request->input('name')) === null) {
                $v->errors()->add('name', 'اسم المحافظة مطلوب.');
            }
            $n = (string) PS::text($request->input('note'));
            if ($n === '') {
                $v->errors()->add('note', 'الوصف المختصر مطلوب.');
            } elseif (mb_strlen($n) > 500) {
                $v->errors()->add('note', 'الوصف يجب ألا يتجاوز 500 حرف.');
            }
        });
        $d = $v->validate();
        $g->name = mb_substr((string) PS::text($d['name']), 0, 150);
        $g->note = mb_substr((string) PS::text($d['note']), 0, 500);
        foreach (array_keys(self::NUMS) as $k) {
            $g->$k = (int) $d[$k];
        }
        if (array_key_exists('is_published', $d)) {
            $g->is_published = (bool) $d['is_published'];
        }
        $g->save();
        Audit::log('impact.update', 'تعديل أرقام خريطة الأثر: '.$g->name, $g);

        return response()->json(['data' => $this->row($g->fresh()), 'message' => 'تم حفظ التغييرات']);
    }

    /** PATCH /admin/impact/{id}/toggle */
    public function toggle(Request $request, string $id): JsonResponse
    {
        $g = Governorate::findOrFail($id);
        $g->is_published = $request->has('visible') ? $request->boolean('visible') : ! $g->is_published;
        $g->save();
        Audit::log('impact.visibility', ($g->is_published ? 'إظهار محافظة في خريطة الأثر: ' : 'إخفاء محافظة من خريطة الأثر: ').$g->name, $g);

        return response()->json(['data' => $this->row($g->fresh()), 'message' => $g->is_published ? 'أصبحت المحافظة ظاهرة' : 'تم إخفاء المحافظة']);
    }

    /** POST /admin/impact/reorder {ids:[…]} */
    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'max:50'], 'ids.*' => ['integer']], ['ids.required' => 'قائمة الترتيب مطلوبة.']);
        PS::reorder(Governorate::class, $data['ids']);
        Audit::log('impact.reorder', 'تغيير ترتيب المحافظات في خريطة الأثر');

        return response()->json(['message' => 'تم حفظ الترتيب']);
    }

    private function row(Governorate $g): array
    {
        return [
            'id' => $g->id,
            'slug' => $g->slug,
            'name' => $g->name,
            'note' => $g->note,
            'beneficiaries' => (int) $g->beneficiaries,
            'meals' => (int) $g->meals,
            'tents' => (int) $g->tents,
            'water_points' => (int) $g->water_points,
            'distribution_points' => (int) $g->distribution_points,
            'visible' => (bool) $g->is_published,
            'sort_order' => (int) $g->sort_order,
        ];
    }
}
