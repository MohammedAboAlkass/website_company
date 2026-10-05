<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use App\Support\FieldOptions as FO;
use App\Support\MediaUsage;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/** «الأنشطة الميدانية» (table `activities`). HTML request -> Blade shell, JSON request -> data. */
class ActivityController extends Controller
{
    /** the column is VARCHAR(500): the stored text (HTML included) must fit */
    private const DESC_MAX = 500;

    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return view('admin.activities.index', ['opts' => [
                'icons' => FO::icons(),
                'tones' => array_values(array_filter(FO::tones(), fn ($t) => in_array($t['key'], ['forest', 'gold', 'mid'], true))),
                'governorates' => FO::governorates(),
                'projects' => FO::projectChoices(),
                'maxMb' => (float) CS::maxUploadMb(),
                'descMax' => self::DESC_MAX,
            ]]);
        }
        $rows = Activity::with(['image', 'governorate:id,name', 'project:id,title'])->orderBy('sort_order')->orderBy('id')->limit(500)->get();

        return response()->json(['data' => $rows->map(fn (Activity $a) => $this->row($a))->values()]);
    }

    public function create()
    {
        return redirect()->route('admin.activities.index');
    }

    public function edit(string $id)
    {
        return redirect()->route('admin.activities.index');
    }

    public function show(Request $request, string $id)
    {
        $a = Activity::with('image')->find($id);
        if (! $request->expectsJson()) {
            return redirect()->route('admin.activities.index');
        }

        return $a ? response()->json(['data' => $this->row($a)]) : response()->json(['message' => 'النشاط غير موجود.'], 404);
    }

    public function store(Request $request): JsonResponse
    {
        $d = $this->validated($request);
        $a = new Activity();
        $this->fill($a, $d);
        $a->is_published = (bool) ($d['is_published'] ?? true);
        $a->sort_order = (int) Activity::withTrashed()->max('sort_order') + 1;
        $a->save();
        Audit::log('activity.create', 'إضافة نشاط ميداني: '.$a->title, $a);

        return response()->json(['data' => $this->row($a->fresh(['image', 'governorate', 'project'])), 'message' => 'تمت إضافة النشاط'], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $a = Activity::findOrFail($id);
        $d = $this->validated($request);
        $old = $a->image_media_id;
        $this->fill($a, $d);
        if (array_key_exists('is_published', $d)) {
            $a->is_published = (bool) $d['is_published'];
        }
        $a->save();
        if ($old && $old !== $a->image_media_id) {
            MediaUsage::dropIfUnused($old);
        }
        Audit::log('activity.update', 'تعديل نشاط ميداني: '.$a->title, $a);

        return response()->json(['data' => $this->row($a->fresh(['image', 'governorate', 'project'])), 'message' => 'تم حفظ التغييرات']);
    }

    public function destroy(Request $request, string $id)
    {
        $a = Activity::findOrFail($id);
        $t = $a->title;
        $a->delete();
        Audit::log('activity.delete', 'حذف نشاط ميداني: '.$t, $a);

        return $request->expectsJson() ? response()->json(['message' => 'تم حذف النشاط']) : redirect()->route('admin.activities.index');
    }

    /** PATCH /admin/activities/{id}/toggle {is_published} */
    public function toggle(Request $request, string $id): JsonResponse
    {
        $a = Activity::findOrFail($id);
        $a->is_published = $request->boolean('is_published');
        $a->save();
        Audit::log($a->is_published ? 'activity.show' : 'activity.hide', ($a->is_published ? 'إظهار نشاط: ' : 'إخفاء نشاط: ').$a->title, $a);

        return response()->json(['data' => $this->row($a->fresh(['image', 'governorate', 'project'])), 'message' => $a->is_published ? 'أصبح النشاط ظاهراً' : 'تم إخفاء النشاط']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $ids = array_values(array_unique(array_filter(array_map('intval', (array) $request->input('ids', [])))));
        if (! $ids) {
            return response()->json(['message' => 'لا توجد عناصر لإعادة ترتيبها.'], 422);
        }
        DB::transaction(function () use ($ids) {
            foreach ($ids as $i => $id) {
                Activity::where('id', $id)->update(['sort_order' => $i + 1]);
            }
        });
        Audit::log('activity.reorder', 'إعادة ترتيب الأنشطة الميدانية', null, ['ids' => $ids]);

        return response()->json(['message' => 'تم حفظ الترتيب']);
    }

    public function cover(Request $request): JsonResponse
    {
        return response()->json(['data' => FO::uploadImage($request, 'صورة نشاط')], 201);
    }

    // ------------------------------------------------------------------

    private function validated(Request $request): array
    {
        $v = Validator::make($request->all(), [
            'title' => ['required', 'string', 'min:5', 'max:255'],
            'description' => ['nullable', 'string', 'max:20000'],
            'governorate_id' => ['nullable', 'integer', Rule::exists('governorates', 'id')],
            'project_id' => ['nullable', 'integer', Rule::exists('projects', 'id')->whereNull('deleted_at')],
            'badge_text' => ['nullable', 'string', 'max:60'],
            'badge_tone' => ['nullable', 'string', Rule::in(['forest', 'gold', 'mid'])],
            'image_media_id' => ['nullable', 'integer', Rule::exists('media_files', 'id')],
            'image_alt' => ['nullable', 'string', 'max:255'],
            'date_label' => ['nullable', 'string', 'max:60'],
            'activity_date' => ['nullable', 'date'],
            'place' => ['nullable', 'string', 'max:100'],
            'stat_label' => ['nullable', 'string', 'max:60'],
            'stat_icon' => ['nullable', 'string', 'max:60'],
            'link_label' => ['nullable', 'string', 'max:60'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'is_published' => ['nullable', 'boolean'],
        ], [
            'title.required' => 'عنوان النشاط مطلوب.',
            'title.min' => 'العنوان يجب أن يكون 5 أحرف على الأقل.',
            'title.max' => 'العنوان طويل جداً (الحد 255 حرفاً).',
            'governorate_id.exists' => 'المحافظة غير موجودة.',
            'project_id.exists' => 'المشروع المختار غير موجود.',
            'badge_text.max' => 'نص الشارة يجب ألا يتجاوز 60 حرفاً.',
            'badge_tone.in' => 'لون الشارة غير صالح.',
            'image_media_id.exists' => 'الصورة المختارة غير موجودة.',
            'image_alt.max' => 'النص البديل يجب ألا يتجاوز 255 حرفاً.',
            'date_label.max' => 'نص التاريخ يجب ألا يتجاوز 60 حرفاً.',
            'activity_date.date' => 'تاريخ النشاط غير صالح.',
            'place.max' => 'المكان يجب ألا يتجاوز 100 حرف.',
            'stat_label.max' => 'نص الإحصائية يجب ألا يتجاوز 60 حرفاً.',
            'link_label.max' => 'نص الرابط يجب ألا يتجاوز 60 حرفاً.',
            'link_url.max' => 'الرابط طويل جداً.',
        ]);
        $v->after(function ($v) use ($request) {
            $link = trim((string) $request->input('link_url'));
            if ($link !== '' && ! preg_match('#^(https?://|mailto:|tel:|/|\#)#i', $link)) {
                $v->errors()->add('link_url', 'الرابط يجب أن يبدأ بـ https:// أو / أو #.');
            }
            $desc = FO::storeRich($request->input('description'));
            if ($desc !== null && mb_strlen($desc) > self::DESC_MAX) {
                $v->errors()->add('description', FO::looksHtml($desc)
                    ? 'الوصف بعد التنسيق يتجاوز '.self::DESC_MAX.' حرفاً مخزّنة. اختصر النص أو بسّط التنسيق.'
                    : 'الوصف يجب ألا يتجاوز '.self::DESC_MAX.' حرف.');
            }
        });

        return $v->validate();
    }

    private function fill(Activity $a, array $d): void
    {
        $a->title = trim($d['title']);
        $a->description = FO::storeRich($d['description'] ?? null);
        $a->governorate_id = $d['governorate_id'] ?? null;
        $a->project_id = $d['project_id'] ?? null;
        foreach (['badge_text', 'image_alt', 'date_label', 'place', 'stat_label', 'stat_icon', 'link_label', 'link_url'] as $f) {
            if (array_key_exists($f, $d)) {
                $a->$f = ($d[$f] !== null && trim((string) $d[$f]) !== '') ? trim((string) $d[$f]) : null;
            }
        }
        $a->badge_tone = ($d['badge_tone'] ?? null) ?: null;
        if (array_key_exists('image_media_id', $d)) {
            $a->image_media_id = $d['image_media_id'] ?: null;
        }
        $a->activity_date = ! empty($d['activity_date']) ? Carbon::parse($d['activity_date'])->toDateString() : null;
    }

    private function row(Activity $a): array
    {
        return [
            'id' => $a->id,
            'title' => $a->title,
            'description' => $a->description,
            'governorate_id' => $a->governorate_id,
            'governorate' => $a->governorate?->name,
            'project_id' => $a->project_id,
            'project' => $a->project?->title,
            'badge_text' => $a->badge_text,
            'badge_tone' => $a->badge_tone,
            'image' => $a->image ? ['id' => $a->image->id, 'url' => CS::mediaUrl($a->image)] : null,
            'image_alt' => $a->image_alt,
            'date_label' => $a->date_label,
            'activity_date' => $a->activity_date?->toDateString(),
            'place' => $a->place,
            'stat_label' => $a->stat_label,
            'stat_icon' => $a->stat_icon,
            'link_label' => $a->link_label,
            'link_url' => $a->link_url,
            'is_published' => (bool) $a->is_published,
            'sort_order' => (int) $a->sort_order,
        ];
    }
}
