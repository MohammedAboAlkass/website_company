<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use App\Support\FieldOptions as FO;
use App\Support\MediaUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/** «قصص الميدان» (table `stories`). HTML request -> Blade shell, JSON request -> data. */
class StoryController extends Controller
{
    private const QUOTE_MAX = 700;

    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return view('admin.stories.index', ['opts' => ['icons' => FO::icons(), 'maxMb' => (float) CS::maxUploadMb(), 'quoteMax' => self::QUOTE_MAX]]);
        }
        $rows = Story::with('image')->orderBy('sort_order')->orderBy('id')->limit(500)->get();

        return response()->json(['data' => $rows->map(fn (Story $s) => $this->row($s))->values()]);
    }

    public function create()
    {
        return redirect()->route('admin.stories.index');
    }

    public function edit(string $id)
    {
        return redirect()->route('admin.stories.index');
    }

    public function show(Request $request, string $id)
    {
        $s = Story::with('image')->find($id);
        if (! $request->expectsJson()) {
            return redirect()->route('admin.stories.index');
        }

        return $s ? response()->json(['data' => $this->row($s)]) : response()->json(['message' => 'القصة غير موجودة.'], 404);
    }

    public function store(Request $request): JsonResponse
    {
        $d = $this->validated($request);
        $s = new Story();
        $this->fill($s, $d);
        $s->is_published = (bool) ($d['is_published'] ?? true);
        $s->sort_order = (int) Story::withTrashed()->max('sort_order') + 1;
        $s->save();
        Audit::log('story.create', 'إضافة قصة: '.$s->person_name, $s);

        return response()->json(['data' => $this->row($s->fresh('image')), 'message' => 'تمت إضافة القصة'], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $s = Story::findOrFail($id);
        $d = $this->validated($request);
        $old = $s->image_media_id;
        $this->fill($s, $d);
        if (array_key_exists('is_published', $d)) {
            $s->is_published = (bool) $d['is_published'];
        }
        $s->save();
        if ($old && $old !== $s->image_media_id) {
            MediaUsage::dropIfUnused($old);
        }
        Audit::log('story.update', 'تعديل قصة: '.$s->person_name, $s);

        return response()->json(['data' => $this->row($s->fresh('image')), 'message' => 'تم حفظ التغييرات']);
    }

    /** DELETE: soft delete. */
    public function destroy(Request $request, string $id)
    {
        $s = Story::findOrFail($id);
        $name = $s->person_name;
        $s->delete();
        Audit::log('story.delete', 'حذف قصة: '.$name, $s);

        return $request->expectsJson() ? response()->json(['message' => 'تم حذف القصة']) : redirect()->route('admin.stories.index');
    }

    /** PATCH /admin/stories/{id}/publish {is_published} : show / hide on the site. */
    public function publish(Request $request, string $id): JsonResponse
    {
        $s = Story::findOrFail($id);
        $s->is_published = $request->boolean('is_published');
        $s->save();
        Audit::log($s->is_published ? 'story.publish' : 'story.unpublish', ($s->is_published ? 'إظهار قصة: ' : 'إخفاء قصة: ').$s->person_name, $s);

        return response()->json(['data' => $this->row($s->fresh('image')), 'message' => $s->is_published ? 'أصبحت القصة ظاهرة' : 'تم إخفاء القصة']);
    }

    /** POST /admin/stories/reorder {ids:[...]} (ids in the new order). */
    public function reorder(Request $request): JsonResponse
    {
        $ids = array_values(array_unique(array_filter(array_map('intval', (array) $request->input('ids', [])))));
        if (! $ids) {
            return response()->json(['message' => 'لا توجد عناصر لإعادة ترتيبها.'], 422);
        }
        DB::transaction(function () use ($ids) {
            foreach ($ids as $i => $id) {
                Story::where('id', $id)->update(['sort_order' => $i + 1]);
            }
        });
        Audit::log('story.reorder', 'إعادة ترتيب قصص الميدان', null, ['ids' => $ids]);

        return response()->json(['message' => 'تم حفظ الترتيب']);
    }

    /** POST /admin/stories/cover: story photo upload. */
    public function cover(Request $request): JsonResponse
    {
        return response()->json(['data' => FO::uploadImage($request, 'صورة قصة')], 201);
    }

    // ------------------------------------------------------------------

    private function validated(Request $request): array
    {
        $v = Validator::make($request->all(), [
            'person_name' => ['required', 'string', 'min:2', 'max:100'],
            'person_role' => ['nullable', 'string', 'max:150'],
            'tag_label' => ['nullable', 'string', 'max:60'],
            'tag_icon' => ['nullable', 'string', 'max:60'],
            'quote' => ['required', 'string', 'max:100000'],
            'image_media_id' => ['nullable', 'integer', Rule::exists('media_files', 'id')],
            'image_alt' => ['nullable', 'string', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
        ], [
            'person_name.required' => 'اسم صاحب القصة مطلوب.',
            'person_name.min' => 'الاسم يجب أن يكون حرفين على الأقل.',
            'person_name.max' => 'الاسم طويل جداً (الحد 100 حرف).',
            'person_role.max' => 'سطر الموقع/الصفة يجب ألا يتجاوز 150 حرفاً.',
            'tag_label.max' => 'نص الوسم يجب ألا يتجاوز 60 حرفاً.',
            'quote.required' => 'نص الشهادة مطلوب.',
            'image_media_id.exists' => 'الصورة المختارة غير موجودة.',
            'image_alt.max' => 'النص البديل يجب ألا يتجاوز 255 حرفاً.',
        ]);
        $v->after(function ($v) use ($request) {
            $n = FO::plainLength($request->input('quote'));
            if ($n < 1) {
                $v->errors()->add('quote', 'نص الشهادة مطلوب.');
            } elseif ($n > self::QUOTE_MAX) {
                $v->errors()->add('quote', 'نص الشهادة يجب ألا يتجاوز '.self::QUOTE_MAX.' حرف.');
            }
        });

        return $v->validate();
    }

    private function fill(Story $s, array $d): void
    {
        $s->person_name = trim($d['person_name']);
        foreach (['person_role', 'tag_label', 'tag_icon', 'image_alt'] as $f) {
            if (array_key_exists($f, $d)) {
                $s->$f = ($d[$f] !== null && trim((string) $d[$f]) !== '') ? trim((string) $d[$f]) : null;
            }
        }
        $s->quote = FO::storeRich($d['quote']) ?? trim((string) $d['quote']);
        if (array_key_exists('image_media_id', $d)) {
            $s->image_media_id = $d['image_media_id'] ?: null;
        }
    }

    private function row(Story $s): array
    {
        return [
            'id' => $s->id,
            'person_name' => $s->person_name,
            'person_role' => $s->person_role,
            'tag_label' => $s->tag_label,
            'tag_icon' => $s->tag_icon,
            'quote' => $s->quote,
            'image' => $s->image ? ['id' => $s->image->id, 'url' => CS::mediaUrl($s->image)] : null,
            'image_alt' => $s->image_alt,
            'is_published' => (bool) $s->is_published,
            'sort_order' => (int) $s->sort_order,
        ];
    }
}
