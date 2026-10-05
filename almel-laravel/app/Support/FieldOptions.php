<?php

namespace App\Support;

use App\Models\ConstantGroup;
use App\Models\ConstantItem;
use App\Models\Governorate;
use App\Models\Program;
use App\Models\Project;
use App\Support\ContentSupport as CS;

/** Dropdown options + small helpers shared by the Projects, Stories and Field-activities admin pages. */
class FieldOptions
{
    public const TONES = ['urgent', 'forest', 'light', 'mid', 'gold'];

    /** Programs = project categories (constants group project_category, keys = programs.slug). */
    public static function programs(array $keep = []): array
    {
        return CS::options('project_category', Program::class, $keep);
    }

    public static function statuses(): array
    {
        $labels = self::statusLabels();
        $opts = [];
        foreach (CS::options('project_status') as $o) {
            if (isset($labels[$o['key']])) {
                $opts[] = $o;
            }
        }
        if (! $opts) {
            foreach ($labels as $k => $l) {
                $opts[] = ['key' => $k, 'label' => $l];
            }
        }

        return $opts;
    }

    public static function statusLabels(): array
    {
        $labels = ['draft' => 'مسودة', 'active' => 'نشط', 'urgent' => 'عاجل', 'paused' => 'متوقف مؤقتاً', 'completed' => 'مكتمل'];
        $g = ConstantGroup::where('group_key', 'project_status')->first();
        if ($g) {
            foreach (ConstantItem::where('group_id', $g->id)->get() as $it) {
                if (isset($labels[$it->item_key])) {
                    $labels[$it->item_key] = $it->label_ar;
                }
            }
        }

        return $labels;
    }

    /** Governorates as [id, label] in constants order (constants item meta.ref_slug -> governorates.slug), then any row without an item. */
    public static function governorates(array $keepIds = []): array
    {
        $rows = Governorate::orderBy('sort_order')->orderBy('id')->get()->keyBy('slug');
        $out = [];
        $seen = [];
        $g = ConstantGroup::where('group_key', 'governorate')->first();
        if ($g) {
            foreach (ConstantItem::where('group_id', $g->id)->orderBy('sort_order')->orderBy('id')->get() as $it) {
                $slug = (string) (($it->meta['ref_slug'] ?? null) ?: $it->item_key);
                $row = $rows[$slug] ?? null;
                if (! $row) {
                    continue;
                }
                $seen[$row->id] = true;
                if ($it->is_active || in_array($row->id, $keepIds, true)) {
                    $out[] = ['id' => $row->id, 'label' => $it->label_ar ?: $row->name];
                }
            }
        }
        foreach ($rows as $row) {
            if (! isset($seen[$row->id])) {
                $out[] = ['id' => $row->id, 'label' => $row->name];
            }
        }

        return $out;
    }

    public static function governorateLabels(): array
    {
        $m = [];
        foreach (self::governorates(Governorate::pluck('id')->all()) as $o) {
            $m[$o['id']] = $o['label'];
        }

        return $m;
    }

    /** Material Symbols icons from the `icon` constants group. */
    public static function icons(array $keep = []): array
    {
        return CS::options('icon', null, $keep);
    }

    public static function tones(): array
    {
        $labels = ['urgent' => 'أحمر عاجل', 'forest' => 'أخضر داكن', 'light' => 'فاتح', 'mid' => 'أخضر متوسط', 'gold' => 'ذهبي'];
        $out = [];
        $keys = array_map(fn ($o) => $o['key'], CS::options('badge_tone'));
        foreach (self::TONES as $t) {
            if (! $keys || in_array($t, $keys, true) || $t === 'urgent' || $t === 'light') {
                $out[] = ['key' => $t, 'label' => $labels[$t]];
            }
        }

        return $out;
    }

    /** Published projects for the "related project" dropdown. */
    public static function projectChoices(): array
    {
        return Project::orderBy('title')->get(['id', 'title'])->map(fn ($p) => ['id' => $p->id, 'label' => $p->title])->all();
    }

    /** True when the text contains HTML tags (the shared editor stores plain text unless the text is formatted). */
    public static function looksHtml(?string $v): bool
    {
        return (bool) preg_match('/<\/?[a-z][a-z0-9]*(\s[^>]*)?>/i', (string) $v);
    }

    /** Plain text stays plain; formatted text is sanitized by the HTML whitelist. Returns null when empty. */
    public static function storeRich(?string $v): ?string
    {
        $v = trim(str_replace("\r\n", "\n", (string) $v));
        if ($v === '') {
            return null;
        }
        if (self::looksHtml($v)) {
            $c = CS::cleanHtml($v);

            return $c !== null && trim(CS::plainText($c)) !== '' ? $c : null;
        }

        return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $v);
    }

    public static function plainLength(?string $v): int
    {
        return mb_strlen(self::looksHtml($v) ? CS::plainText($v) : trim(preg_replace('/\s+/u', ' ', (string) $v)));
    }

    /** Image upload used by the cover / image fields (same rules as the news cover). */
    public static function uploadImage(\Illuminate\Http\Request $request, string $label): array
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'mimes:'.implode(',', CS::IMAGE_MIMES), 'max:'.CS::maxUploadKb()],
        ], [
            'file.required' => 'اختر صورة للرفع.',
            'file.image' => 'الملف المرفوع ليس صورة صالحة.',
            'file.mimes' => 'الصيغ المسموحة: JPG وPNG وWebP وGIF.',
            'file.max' => 'حجم الصورة يجب ألا يتجاوز '.CS::maxUploadMb().' ميغابايت.',
            'file.uploaded' => 'حجم الصورة يجب ألا يتجاوز '.CS::maxUploadMb().' ميغابايت.',
        ]);
        $m = CS::storeImage($request->file('file'));
        Audit::log('media.upload', 'رفع '.$label.': '.$m->original_name, $m);

        return ['id' => $m->id, 'url' => CS::mediaUrl($m), 'name' => $m->original_name];
    }
}
