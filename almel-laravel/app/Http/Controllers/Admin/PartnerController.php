<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Models\Partner;
use App\Support\Audit;
use App\Support\PeopleSupport as PS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/** Partners (table `partners`, soft delete). JSON API used by /admin/partners (admin-people-db.js). */
class PartnerController extends Controller
{
    /** GET /admin/partners : the page (HTML) or the list (JSON). */
    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return view('admin.partners.index', ['opts' => PS::options()]);
        }
        $rows = Partner::with('logo')->orderBy('sort_order')->orderBy('id')->get()->map(fn (Partner $p) => $this->row($p))->values();

        return response()->json(['data' => $rows]);
    }

    public function show(Request $request, string $id)
    {
        if (! $request->expectsJson()) {
            return redirect()->route('admin.partners.index');
        }
        $p = Partner::with('logo')->find($id);

        return $p ? response()->json(['data' => $this->row($p)]) : response()->json(['message' => 'الشريك غير موجود.'], 404);
    }

    public function create()
    {
        return redirect()->route('admin.partners.index');
    }

    public function edit(string $id)
    {
        return redirect()->route('admin.partners.index');
    }

    public function store(Request $request): JsonResponse
    {
        $d = $this->validated($request);
        $p = new Partner();
        $this->fill($p, $d);
        $p->sort_order = PS::nextOrder(Partner::class);
        $p->is_published = array_key_exists('is_published', $d) ? (bool) $d['is_published'] : true;
        $p->save();
        Audit::log('partner.create', 'إضافة شريك: '.$p->name, $p);

        return response()->json(['data' => $this->row($p->fresh('logo')), 'message' => 'تمت إضافة الشريك'], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $p = Partner::findOrFail($id);
        $d = $this->validated($request);
        $this->fill($p, $d);
        if (array_key_exists('is_published', $d)) {
            $p->is_published = (bool) $d['is_published'];
        }
        $p->save();
        Audit::log('partner.update', 'تعديل شريك: '.$p->name, $p);

        return response()->json(['data' => $this->row($p->fresh('logo')), 'message' => 'تم حفظ التغييرات']);
    }

    /** DELETE /admin/partners/{id} : soft delete. */
    public function destroy(Request $request, string $id)
    {
        $p = Partner::findOrFail($id);
        $name = $p->name;
        $p->delete();
        Audit::log('partner.delete', 'حذف شريك: '.$name, $p);

        return $request->expectsJson() ? response()->json(['message' => 'تم حذف الشريك']) : redirect()->route('admin.partners.index');
    }

    /** PATCH /admin/partners/{id}/toggle {visible?} : show / hide on the website. */
    public function toggle(Request $request, string $id): JsonResponse
    {
        $p = Partner::findOrFail($id);
        $p->is_published = $request->has('visible') ? $request->boolean('visible') : ! $p->is_published;
        $p->save();
        Audit::log('partner.visibility', ($p->is_published ? 'إظهار شريك: ' : 'إخفاء شريك: ').$p->name, $p);

        return response()->json(['data' => $this->row($p->fresh('logo')), 'message' => $p->is_published ? 'أصبح الشريك ظاهراً' : 'تم إخفاء الشريك']);
    }

    /** POST /admin/partners/reorder {ids:[…]} */
    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'max:500'], 'ids.*' => ['integer']], ['ids.required' => 'قائمة الترتيب مطلوبة.']);
        PS::reorder(Partner::class, $data['ids']);
        Audit::log('partner.reorder', 'تغيير ترتيب الشركاء');

        return response()->json(['message' => 'تم حفظ الترتيب']);
    }

    /** POST /admin/partners/logo (multipart file) : uploads a logo image. */
    public function logo(Request $request): JsonResponse
    {
        $m = PS::upload($request, 'شعار شريك');

        return response()->json(['data' => PS::media($m)], 201);
    }

    // ------------------------------------------------------------------

    private function validated(Request $request): array
    {
        $v = Validator::make($request->all(), [
            'name' => ['required', 'string', 'min:2', 'max:150'],
            'tag_label' => ['nullable', 'string', 'max:60'],
            'tag_icon' => ['nullable', 'string', 'max:60', 'regex:/^[a-z0-9_]+$/'],
            'description' => ['required', 'string', 'max:2000'],
            'website_url' => ['nullable', 'string', 'max:500'],
            'logo_media_id' => ['nullable', 'integer', Rule::exists('media_files', 'id')->whereNull('deleted_at')],
            'is_published' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'اسم الشريك مطلوب.',
            'name.min' => 'اسم الشريك قصير جداً.',
            'name.max' => 'اسم الشريك طويل جداً (الحد 150 حرفاً).',
            'tag_label.max' => 'تصنيف الشراكة يجب ألا يتجاوز 60 حرفاً.',
            'tag_icon.regex' => 'اسم الأيقونة غير صالح.',
            'description.required' => 'وصف الشراكة مطلوب.',
            'description.max' => 'الوصف طويل جداً.',
            'logo_media_id.exists' => 'الشعار المختار غير موجود.',
            'logo_media_id.integer' => 'الشعار المختار غير صالح.',
        ]);
        $v->after(function ($v) use ($request) {
            if (! PS::validLink($request->input('website_url'))) {
                $v->errors()->add('website_url', 'رابط الموقع غير صالح (يبدأ بـ https:// مثلاً).');
            }
            if (PS::text($request->input('name')) === null) {
                $v->errors()->add('name', 'اسم الشريك مطلوب.');
            }
            $desc = (string) PS::text($request->input('description'));
            if ($desc === '') {
                $v->errors()->add('description', 'وصف الشراكة مطلوب.');
            } elseif (mb_strlen($desc) > 500) {
                $v->errors()->add('description', 'الوصف يجب ألا يتجاوز 500 حرف.');
            }
        });

        return $v->validate();
    }

    private function fill(Partner $p, array $d): void
    {
        $p->name = mb_substr((string) PS::text($d['name']), 0, 150);
        $p->tag_label = PS::text($d['tag_label'] ?? null);
        $p->tag_icon = ($d['tag_icon'] ?? '') !== '' ? $d['tag_icon'] : null;
        $p->description = mb_substr((string) PS::text($d['description']), 0, 500);
        $p->website_url = PS::link($d['website_url'] ?? null);
        $p->logo_media_id = ! empty($d['logo_media_id']) ? (int) $d['logo_media_id'] : null;
    }

    private function row(Partner $p): array
    {
        return [
            'id' => $p->id,
            'name' => $p->name,
            'tag_label' => $p->tag_label,
            'tag_icon' => $p->tag_icon,
            'description' => $p->description,
            'website_url' => $p->website_url,
            'logo' => PS::media($p->logo),
            'visible' => (bool) $p->is_published,
            'sort_order' => (int) $p->sort_order,
        ];
    }
}
