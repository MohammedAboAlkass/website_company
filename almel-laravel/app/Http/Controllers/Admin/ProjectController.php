<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Governorate;
use App\Models\MediaFile;
use App\Models\Program;
use App\Models\Project;
use App\Models\ProjectComponent;
use App\Models\ProjectFact;
use App\Models\ProjectImage;
use App\Models\ProjectUpdate;
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

/**
 * Projects (tables projects, project_facts, project_components, project_images, project_updates).
 * HTML request -> Blade shell; JSON request -> data. Money fields of the schema (funding_*) are not used.
 */
class ProjectController extends Controller
{
    private const PER_PAGE = 8;

    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return view('admin.projects.index', ['opts' => $this->opts()]);
        }

        $status = \App\Support\Req::str($request, 'status', '');
        $program = trim(\App\Support\Req::str($request, 'program', ''));
        $q = trim(\App\Support\Req::str($request, 'q', ''));
        $per = max(1, min(50, (int) $request->query('per', self::PER_PAGE)));

        $query = Project::query()->with(['program:id,slug,name', 'governorate:id,name', 'cover']);
        if ($status !== '' && in_array($status, Project::STATUSES, true)) {
            $query->where('status', $status);
        }
        if ($program !== '') {
            $query->whereHas('program', fn ($p) => $p->where('slug', $program));
        }
        if ($q !== '') {
            $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q).'%';
            $query->where(fn ($w) => $w->where('title', 'like', $like)->orWhere('location_text', 'like', $like)->orWhere('summary', 'like', $like)->orWhere('slug', 'like', $like));
        }
        $query->orderBy('sort_order')->orderByDesc('id');
        $page = $query->paginate($per);
        $labels = FO::statusLabels();
        $progLabels = CS::labelMap('project_category', Program::class);
        $govLabels = FO::governorateLabels();
        $counts = Project::query()->selectRaw('status, COUNT(*) c')->groupBy('status')->pluck('c', 'status');

        return response()->json([
            'data' => $page->getCollection()->map(fn (Project $p) => $this->listRow($p, $labels, $progLabels, $govLabels))->values(),
            'meta' => ['total' => $page->total(), 'page' => $page->currentPage(), 'per' => $page->perPage(), 'pages' => $page->lastPage()],
            'counts' => [
                'all' => (int) $counts->sum(),
                'active' => (int) (($counts['active'] ?? 0) + ($counts['urgent'] ?? 0)),
                'urgent' => (int) ($counts['urgent'] ?? 0),
                'draft' => (int) ($counts['draft'] ?? 0),
                'paused' => (int) ($counts['paused'] ?? 0),
                'completed' => (int) ($counts['completed'] ?? 0),
            ],
        ]);
    }

    public function create()
    {
        return redirect()->route('admin.projects.index');
    }

    public function edit(string $id)
    {
        return redirect()->route('admin.projects.index');
    }

    public function show(Request $request, string $id)
    {
        $p = Project::with(['program', 'cover', 'facts', 'components', 'images.media'])->find($id);
        if (! $request->expectsJson()) {
            return redirect()->route('admin.projects.index');
        }
        if (! $p) {
            return response()->json(['message' => 'المشروع غير موجود.'], 404);
        }

        return response()->json(['data' => $this->detail($p)]);
    }

    public function store(Request $request): JsonResponse
    {
        $d = $this->validated($request, null);
        if ($deny = $this->publishDenied($request, null, $d['status'])) {
            return $deny;
        }
        $project = DB::transaction(function () use ($d) {
            $p = new Project();
            $this->fill($p, $d, true);
            $p->show_funding = false; // no funding bar: this admin page does not use the money fields
            $p->sort_order = (int) Project::withTrashed()->max('sort_order') + 1;
            $p->save();
            $this->syncChildren($p, $d);

            return $p;
        });
        Audit::log('project.create', 'إضافة مشروع: '.$project->title, $project, ['status' => $project->status]);

        return response()->json(['data' => $this->detail($this->fresh($project)), 'message' => 'تمت إضافة المشروع'], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $project = Project::findOrFail($id);
        $d = $this->validated($request, $project);
        if ($deny = $this->publishDenied($request, $project, $d['status'])) {
            return $deny;
        }
        $oldCover = $project->cover_media_id;
        DB::transaction(function () use ($project, $d) {
            $this->fill($project, $d, false);
            $project->save();
            $this->syncChildren($project, $d);
        });
        if ($oldCover && $oldCover !== $project->cover_media_id) {
            MediaUsage::dropIfUnused($oldCover);
        }
        Audit::log('project.update', 'تعديل مشروع: '.$project->title, $project, ['status' => $project->status]);

        return response()->json(['data' => $this->detail($this->fresh($project)), 'message' => 'تم حفظ التغييرات']);
    }

    /** DELETE /admin/projects/{id}: soft delete (children stay for a restore). */
    public function destroy(Request $request, string $id)
    {
        $project = Project::findOrFail($id);
        $title = $project->title;
        $project->delete();
        Audit::log('project.delete', 'حذف مشروع: '.$title, $project);

        return $request->expectsJson() ? response()->json(['message' => 'تم حذف المشروع']) : redirect()->route('admin.projects.index');
    }

    /** POST /admin/projects/bulk-delete {ids:[]} */
    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $this->ids($request);
        $n = 0;
        foreach (Project::whereIn('id', $ids)->get() as $p) {
            $p->delete();
            $n++;
        }
        Audit::log('project.bulk-delete', 'حذف '.$n.' من المشاريع', null, ['ids' => $ids]);

        return response()->json(['message' => 'تم حذف '.$n.' من المشاريع', 'count' => $n]);
    }

    /** POST /admin/projects/bulk-status {ids:[], status} */
    public function bulkStatus(Request $request): JsonResponse
    {
        $ids = $this->ids($request);
        $status = (string) $request->input('status');
        if (! in_array($status, Project::STATUSES, true)) {
            return response()->json(['message' => 'حالة المشروع غير صالحة.', 'errors' => ['status' => ['حالة المشروع غير صالحة.']]], 422);
        }
        if ($status !== 'draft' && ! $request->user()->hasPermission('projects.publish')) {
            return $this->noPublish();
        }
        $n = 0;
        foreach (Project::whereIn('id', $ids)->get() as $p) {
            if ($p->status === $status) {
                continue;
            }
            $this->applyStatus($p, $status);
            $p->save();
            $n++;
        }
        Audit::log('project.bulk-status', 'تغيير حالة '.$n.' من المشاريع إلى '.(FO::statusLabels()[$status] ?? $status), null, ['ids' => $ids, 'status' => $status]);

        return response()->json(['message' => 'تم تحديث '.$n.' من المشاريع', 'count' => $n]);
    }

    /** POST /admin/projects/cover: image upload for the cover and the project gallery. */
    public function cover(Request $request): JsonResponse
    {
        return response()->json(['data' => FO::uploadImage($request, 'صورة مشروع')], 201);
    }

    // ------------------------------------------------------------------

    private function opts(): array
    {
        return [
            'programs' => FO::programs(),
            'statuses' => FO::statuses(),
            'statusLabels' => FO::statusLabels(),
            'governorates' => FO::governorates(),
            'icons' => FO::icons(),
            'tones' => FO::tones(),
            'maxMb' => (float) CS::maxUploadMb(),
        ];
    }

    private function ids(Request $request): array
    {
        $ids = array_values(array_unique(array_filter(array_map('intval', (array) $request->input('ids', [])))));
        abort_if(! $ids || count($ids) > 200, 422, 'اختر مشروعاً واحداً على الأقل.');

        return $ids;
    }

    private function noPublish(): JsonResponse
    {
        return response()->json(['message' => 'ليست لديك صلاحية نشر المشاريع (تفعيلها وإخراجها من المسودة).'], 403);
    }

    /** Moving a project out of "draft" makes it public, which needs the publish permission. */
    private function publishDenied(Request $request, ?Project $p, string $newStatus): ?JsonResponse
    {
        $becomesPublic = $newStatus !== 'draft' && (! $p || $p->status === 'draft');
        if ($becomesPublic && ! $request->user()->hasPermission('projects.publish')) {
            return $this->noPublish();
        }

        return null;
    }

    private function applyStatus(Project $p, string $status): void
    {
        $p->status = $status;
        if ($status !== 'draft' && ! $p->published_at) {
            $p->published_at = now();
        }
    }

    private function validated(Request $request, ?Project $project): array
    {
        $rules = [
            'title' => ['required', 'string', 'min:5', 'max:255'],
            'program' => ['required', 'string', Rule::exists('programs', 'slug')],
            'governorate_id' => ['nullable', 'integer', Rule::exists('governorates', 'id')],
            'location_text' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(Project::STATUSES)],
            'is_featured' => ['nullable', 'boolean'],
            'summary' => ['nullable', 'string', 'max:2000'],
            'description' => ['nullable', 'string', 'max:300000'],
            'cover_media_id' => ['nullable', 'integer', Rule::exists('media_files', 'id')],
            'cover_alt' => ['nullable', 'string', 'max:255'],
            'badge_text' => ['nullable', 'string', 'max:60'],
            'badge_tone' => ['nullable', 'string', Rule::in(FO::TONES)],
            'badge_icon' => ['nullable', 'string', 'max:60'],
            'beneficiaries_count' => ['nullable', 'integer', 'min:0', 'max:4294967295'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'facts' => ['nullable', 'array', 'max:12'],
            'facts.*.label' => ['required', 'string', 'max:100'],
            'facts.*.value' => ['required', 'string', 'max:150'],
            'facts.*.is_accent' => ['nullable', 'boolean'],
            'components' => ['nullable', 'array', 'max:12'],
            'components.*.title' => ['required', 'string', 'max:150'],
            'components.*.icon' => ['nullable', 'string', 'max:60'],
            'components.*.text' => ['nullable', 'string', 'max:500'],
            'images' => ['nullable', 'array', 'max:40'],
            'images.*.media_id' => ['required', 'integer', Rule::exists('media_files', 'id')],
            'images.*.caption' => ['nullable', 'string', 'max:255'],
            'updates' => ['nullable', 'array', 'max:50'],
            'updates.*.id' => ['nullable', 'integer'],
            'updates.*.title' => ['required', 'string', 'max:255'],
            'updates.*.body' => ['nullable', 'string', 'max:20000'],
            'updates.*.is_published' => ['nullable', 'boolean'],
            'updates.*.published_at' => ['nullable', 'date'],
        ];
        $m = [
            'title.required' => 'عنوان المشروع مطلوب.',
            'title.min' => 'العنوان يجب أن يكون 5 أحرف على الأقل.',
            'title.max' => 'العنوان طويل جداً (الحد 255 حرفاً).',
            'program.required' => 'اختر فئة المشروع.',
            'program.exists' => 'فئة المشروع غير موجودة.',
            'governorate_id.exists' => 'المحافظة غير موجودة.',
            'location_text.max' => 'الموقع التفصيلي يجب ألا يتجاوز 255 حرفاً.',
            'status.required' => 'اختر حالة المشروع.',
            'status.in' => 'حالة المشروع غير صالحة.',
            'summary.max' => 'الملخص طويل جداً.',
            'description.max' => 'الوصف طويل جداً.',
            'cover_media_id.exists' => 'صورة الغلاف غير موجودة.',
            'cover_alt.max' => 'النص البديل يجب ألا يتجاوز 255 حرفاً.',
            'badge_text.max' => 'نص الشارة يجب ألا يتجاوز 60 حرفاً.',
            'badge_tone.in' => 'لون الشارة غير صالح.',
            'beneficiaries_count.integer' => 'عدد المستفيدين يجب أن يكون رقماً صحيحاً.',
            'beneficiaries_count.min' => 'عدد المستفيدين لا يمكن أن يكون سالباً.',
            'beneficiaries_count.max' => 'عدد المستفيدين كبير جداً.',
            'start_date.date' => 'تاريخ البداية غير صالح.',
            'end_date.date' => 'تاريخ النهاية غير صالح.',
            'end_date.after_or_equal' => 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية.',
            'seo_title.max' => 'عنوان محركات البحث طويل جداً.',
            'seo_description.max' => 'الوصف التعريفي يجب ألا يتجاوز 320 حرفاً.',
            'facts.max' => 'الحد الأقصى 12 حقيقة سريعة.',
            'facts.*.label.required' => 'عنوان الحقيقة السريعة مطلوب.',
            'facts.*.label.max' => 'عنوان الحقيقة السريعة طويل (الحد 100 حرف).',
            'facts.*.value.required' => 'قيمة الحقيقة السريعة مطلوبة.',
            'facts.*.value.max' => 'قيمة الحقيقة السريعة طويلة (الحد 150 حرفاً).',
            'components.max' => 'الحد الأقصى 12 مكوّناً.',
            'components.*.title.required' => 'عنوان المكوّن مطلوب.',
            'components.*.title.max' => 'عنوان المكوّن طويل (الحد 150 حرفاً).',
            'components.*.text.max' => 'نص المكوّن يجب ألا يتجاوز 500 حرف.',
            'images.max' => 'الحد الأقصى 40 صورة في معرض المشروع.',
            'images.*.media_id.exists' => 'إحدى صور المعرض غير موجودة.',
            'images.*.caption.max' => 'تعليق الصورة يجب ألا يتجاوز 255 حرفاً.',
            'updates.max' => 'الحد الأقصى 50 تحديثاً.',
            'updates.*.title.required' => 'عنوان التحديث مطلوب.',
            'updates.*.title.max' => 'عنوان التحديث طويل (الحد 255 حرفاً).',
            'updates.*.body.max' => 'نص التحديث طويل جداً.',
            'updates.*.published_at.date' => 'تاريخ التحديث غير صالح.',
        ];
        $v = Validator::make($request->all(), $rules, $m);
        $v->after(function ($v) use ($request) {
            if (FO::plainLength($request->input('summary')) > 500) {
                $v->errors()->add('summary', 'الملخص يجب ألا يتجاوز 500 حرف.');
            }
            if (FO::plainLength($request->input('description')) > 20000) {
                $v->errors()->add('description', 'الوصف طويل جداً (الحد 20000 حرف).');
            }
            $ids = [];
            foreach ((array) $request->input('images', []) as $i => $img) {
                $mid = (int) ($img['media_id'] ?? 0);
                if ($mid && isset($ids[$mid])) {
                    $v->errors()->add('images.'.$i.'.media_id', 'الصورة نفسها مضافة أكثر من مرة في المعرض.');
                }
                $ids[$mid] = true;
            }
        });

        return $v->validate();
    }

    private function fill(Project $p, array $d, bool $creating): void
    {
        $p->title = trim($d['title']);
        $p->program_id = Program::where('slug', $d['program'])->value('id');
        $p->governorate_id = $d['governorate_id'] ?? null;
        foreach (['location_text', 'cover_alt', 'badge_text', 'badge_icon', 'seo_title', 'seo_description'] as $f) {
            if (array_key_exists($f, $d)) {
                $p->$f = ($d[$f] !== null && trim((string) $d[$f]) !== '') ? trim((string) $d[$f]) : null;
            }
        }
        if (array_key_exists('badge_tone', $d)) {
            $p->badge_tone = $d['badge_tone'] ?: null;
        }
        $p->is_featured = (bool) ($d['is_featured'] ?? false);
        if (array_key_exists('cover_media_id', $d)) {
            $p->cover_media_id = $d['cover_media_id'] ?: null;
        }
        if (array_key_exists('beneficiaries_count', $d)) {
            $p->beneficiaries_count = $d['beneficiaries_count'] === null || $d['beneficiaries_count'] === '' ? null : (int) $d['beneficiaries_count'];
        }
        $p->start_date = ! empty($d['start_date']) ? Carbon::parse($d['start_date'])->toDateString() : null;
        $p->end_date = ! empty($d['end_date']) ? Carbon::parse($d['end_date'])->toDateString() : null;
        if (array_key_exists('description', $d)) {
            $p->description = FO::storeRich($d['description']);
        }
        if (array_key_exists('summary', $d)) {
            $s = trim((string) $d['summary']);
            $p->summary = $s !== '' ? mb_substr(FO::looksHtml($s) ? CS::plainText($s) : $s, 0, 500) : null;
        }
        if (! $p->summary && $p->description) {
            $plain = CS::plainText($p->description);
            $p->summary = $plain !== '' ? mb_substr($plain, 0, 220) : null;
        }
        if ($creating || ! $p->slug) {
            $p->slug = CS::uniqueSlug(Project::class, CS::slugify($p->title, 'project'), $p->id, 'slug', 150);
        }
        $this->applyStatus($p, $d['status']);
    }

    private function syncChildren(Project $p, array $d): void
    {
        if (array_key_exists('facts', $d)) {
            $p->facts()->delete();
            foreach (array_values($d['facts'] ?? []) as $i => $f) {
                ProjectFact::create(['project_id' => $p->id, 'label' => trim($f['label']), 'value' => trim($f['value']), 'is_accent' => (bool) ($f['is_accent'] ?? false), 'sort_order' => $i + 1]);
            }
        }
        if (array_key_exists('components', $d)) {
            $p->components()->delete();
            foreach (array_values($d['components'] ?? []) as $i => $c) {
                $text = isset($c['text']) ? trim((string) $c['text']) : '';
                ProjectComponent::create(['project_id' => $p->id, 'icon' => ($c['icon'] ?? null) ?: null, 'title' => trim($c['title']), 'text' => $text !== '' ? $text : null, 'sort_order' => $i + 1]);
            }
        }
        if (array_key_exists('images', $d)) {
            $before = $p->images()->pluck('media_id')->all();
            $p->images()->delete();
            $keep = [];
            foreach (array_values($d['images'] ?? []) as $i => $img) {
                $cap = isset($img['caption']) ? trim((string) $img['caption']) : '';
                ProjectImage::create(['project_id' => $p->id, 'media_id' => (int) $img['media_id'], 'caption' => $cap !== '' ? $cap : null, 'sort_order' => $i + 1]);
                $keep[] = (int) $img['media_id'];
            }
            foreach (array_diff($before, $keep) as $gone) {
                MediaUsage::dropIfUnused((int) $gone);
            }
        }
        if (array_key_exists('updates', $d)) {
            $seen = [];
            foreach ($d['updates'] ?? [] as $u) {
                $at = ! empty($u['published_at']) ? Carbon::parse($u['published_at'])->timezone(config('app.timezone')) : null;
                $body = FO::storeRich($u['body'] ?? null);
                $row = ! empty($u['id']) ? ProjectUpdate::where('project_id', $p->id)->find($u['id']) : null;
                $vals = ['title' => trim($u['title']), 'body' => $body, 'is_published' => (bool) ($u['is_published'] ?? true), 'published_at' => $at ?: ($row?->published_at ?? now())];
                if ($row) {
                    $row->fill($vals)->save();
                } else {
                    $row = ProjectUpdate::create($vals + ['project_id' => $p->id, 'author_id' => auth()->id()]);
                }
                $seen[] = $row->id;
            }
            ProjectUpdate::where('project_id', $p->id)->whereNotIn('id', $seen ?: [0])->get()->each->delete(); // soft delete
        }
    }

    private function fresh(Project $p): Project
    {
        return $p->fresh(['program', 'cover', 'facts', 'components', 'images.media']);
    }

    private function listRow(Project $p, array $labels, array $progLabels, array $govLabels): array
    {
        $ps = $p->program?->slug;

        return [
            'id' => $p->id,
            'slug' => $p->slug,
            'title' => $p->title,
            'program' => $ps,
            'program_label' => $progLabels[$ps] ?? $p->program?->name,
            'governorate_id' => $p->governorate_id,
            'governorate' => $govLabels[$p->governorate_id] ?? null,
            'location' => $p->location_text ?: ($govLabels[$p->governorate_id] ?? ''),
            'status' => $p->status,
            'status_label' => $labels[$p->status] ?? $p->status,
            'is_featured' => (bool) $p->is_featured,
            'beneficiaries' => $p->beneficiaries_count,
            'image' => CS::mediaUrl($p->cover) ?: '/assets/site/img/logo.png',
            'updated' => optional($p->updated_at)->toIso8601String(),
        ];
    }

    private function detail(Project $p): array
    {
        return [
            'id' => $p->id,
            'slug' => $p->slug,
            'title' => $p->title,
            'program' => $p->program?->slug,
            'governorate_id' => $p->governorate_id,
            'location_text' => $p->location_text,
            'status' => $p->status,
            'is_featured' => (bool) $p->is_featured,
            'summary' => $p->summary,
            'description' => $p->description,
            'cover' => $p->cover ? ['id' => $p->cover->id, 'url' => CS::mediaUrl($p->cover)] : null,
            'cover_alt' => $p->cover_alt,
            'badge_text' => $p->badge_text,
            'badge_tone' => $p->badge_tone,
            'badge_icon' => $p->badge_icon,
            'beneficiaries_count' => $p->beneficiaries_count,
            'start_date' => $p->start_date?->toDateString(),
            'end_date' => $p->end_date?->toDateString(),
            'seo_title' => $p->seo_title,
            'seo_description' => $p->seo_description,
            'facts' => $p->facts->map(fn ($f) => ['label' => $f->label, 'value' => $f->value, 'is_accent' => (bool) $f->is_accent])->values(),
            'components' => $p->components->map(fn ($c) => ['icon' => $c->icon, 'title' => $c->title, 'text' => $c->text])->values(),
            'images' => $p->images->map(fn ($i) => ['media_id' => $i->media_id, 'url' => CS::mediaUrl($i->media), 'caption' => $i->caption])->values(),
            'updates' => ProjectUpdate::where('project_id', $p->id)->orderByDesc('published_at')->orderByDesc('id')->get()
                ->map(fn ($u) => ['id' => $u->id, 'title' => $u->title, 'body' => $u->body, 'is_published' => (bool) $u->is_published, 'published_at' => $u->published_at?->format('Y-m-d')])->values(),
            'updated' => $p->updated_at?->toIso8601String(),
        ];
    }
}
