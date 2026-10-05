<?php

namespace App\Support;

use App\Models\MediaFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Shared helpers of the Partners / FAQ / Announcements+Appeal / Impact-map admin pages. */
class PeopleSupport
{
    /** Single-line plain text: tags stripped, entities decoded, whitespace collapsed ('' -> null). */
    public static function text(?string $v): ?string
    {
        $t = ContentSupport::plainText($v);

        return $t === '' ? null : $t;
    }

    /** Link of a button / announcement: #anchor, /path, https://…, mailto:, tel:. Anything else (javascript:, data:…) is rejected. */
    public static function validLink(?string $v): bool
    {
        $v = trim((string) $v);
        if ($v === '') {
            return true;
        }
        if (mb_strlen($v) > 500 || preg_match('/[\x00-\x1F\x7F\s<>"\']/u', $v)) {
            return false;
        }

        return (bool) preg_match('~^(#[\p{L}\p{N}_-]+|/[^\s]*|https?://[^\s/$.?#][^\s]*|mailto:[^\s@]+@[^\s@]+|tel:\+?[0-9\-\s]{5,20})$~u', $v);
    }

    public static function link(?string $v): ?string
    {
        $v = trim((string) $v);

        return $v === '' ? null : $v;
    }

    /** Sets sort_order = 1..n following $ids (only rows that exist; rows not listed keep their relative order after them). */
    public static function reorder(string $modelClass, array $ids): void
    {
        $ids = array_values(array_unique(array_map('intval', $ids)));
        DB::transaction(function () use ($modelClass, $ids) {
            $i = 1;
            foreach ($ids as $id) {
                $modelClass::query()->whereKey($id)->update(['sort_order' => $i++]);
            }
            $rest = $modelClass::query()->whereNotIn('id', $ids)->orderBy('sort_order')->orderBy('id')->pluck('id');
            foreach ($rest as $id) {
                $modelClass::query()->whereKey($id)->update(['sort_order' => $i++]);
            }
        });
    }

    public static function nextOrder(string $modelClass): int
    {
        return (int) $modelClass::query()->max('sort_order') + 1;
    }

    /** {id,url} of a media row (null when none). */
    public static function media(?MediaFile $m): ?array
    {
        return $m ? ['id' => $m->id, 'url' => ContentSupport::mediaUrl($m)] : null;
    }

    /** Validates + stores an uploaded image (field "file") and returns its media row. */
    public static function upload(Request $request, string $label): MediaFile
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'mimes:'.implode(',', ContentSupport::IMAGE_MIMES), 'max:'.ContentSupport::maxUploadKb()],
        ], [
            'file.required' => 'اختر صورة للرفع.',
            'file.image' => 'الملف المرفوع ليس صورة صالحة.',
            'file.mimes' => 'الصيغ المسموحة: JPG وPNG وWebP وGIF.',
            'file.max' => 'حجم الصورة يجب ألا يتجاوز '.ContentSupport::maxUploadMb().' ميغابايت.',
            'file.uploaded' => 'حجم الصورة يجب ألا يتجاوز '.ContentSupport::maxUploadMb().' ميغابايت.',
        ]);
        $m = ContentSupport::storeImage($request->file('file'));
        Audit::log('media.upload', 'رفع '.$label.': '.$m->original_name, $m);

        return $m;
    }

    /** Sortable ISO-ish value for <input type="datetime-local"> in the app timezone. */
    public static function localInput($dt): ?string
    {
        return $dt ? $dt->copy()->timezone(config('app.timezone'))->format('Y-m-d\TH:i') : null;
    }

    public static function parseLocal(?string $v)
    {
        $v = trim((string) $v);

        return $v === '' ? null : \Illuminate\Support\Carbon::parse($v, config('app.timezone'));
    }

    /** Dropdown options shared by the pages (constants groups `icon` and `section_anchor`). */
    public static function options(): array
    {
        return [
            'maxMb' => (float) ContentSupport::maxUploadMb(),
            'icons' => ContentSupport::options('icon'),
            'anchors' => ContentSupport::options('section_anchor'),
        ];
    }
}
