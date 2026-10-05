<?php

namespace App\Support;

use App\Models\ArticleCategory;
use App\Models\ConstantGroup;
use App\Models\ConstantItem;
use App\Models\GalleryAlbum;
use App\Models\MediaFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** Shared helpers of the News and Gallery admin pages (slugs, media URLs, uploads, dropdown options). */
class ContentSupport
{
    public const MAX_IMAGE_KB = 10240;

    /** Effective image upload limit in KB: 10 MB, or less when php.ini (upload_max_filesize) is lower. */
    public static function maxUploadKb(): int
    {
        $ini = trim((string) ini_get('upload_max_filesize'));
        $n = (float) $ini;
        $unit = strtolower(substr($ini, -1));
        $bytes = match ($unit) {
            'g' => $n * 1073741824,
            'm' => $n * 1048576,
            'k' => $n * 1024,
            default => $n,
        };
        if ($bytes <= 0) {
            return self::MAX_IMAGE_KB;
        }

        return (int) max(1, min(self::MAX_IMAGE_KB, floor($bytes / 1024)));
    }

    /** "10" or less (megabytes) for messages. */
    public static function maxUploadMb(): string
    {
        $mb = self::maxUploadKb() / 1024;

        return rtrim(rtrim(number_format($mb, 1, '.', ''), '0'), '.');
    }
    public const IMAGE_MIMES = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    /** Arabic-safe slug: keeps Arabic/Latin letters and digits, joins words with "-". */
    public static function slugify(?string $text, string $fallback = 'item'): string
    {
        $t = mb_strtolower(trim((string) $text));
        $t = preg_replace('/[\x{064B}-\x{065F}\x{0670}\x{0640}]/u', '', $t); // diacritics + tatweel
        $t = preg_replace('/[^\p{L}\p{N}\s_-]+/u', '', $t);
        $t = preg_replace('/[\s_-]+/u', '-', $t);
        $t = trim((string) $t, '-');
        $t = mb_substr($t, 0, 60);
        $t = trim($t, '-');

        return $t !== '' ? $t : $fallback;
    }

    /** First free slug for $modelClass (soft-deleted rows count, the DB unique key includes them). */
    public static function uniqueSlug(string $modelClass, string $slug, ?int $ignoreId = null, string $column = 'slug', int $max = 100): string
    {
        $base = mb_substr($slug, 0, $max - 6);
        $candidate = $base;
        $i = 2;
        while (true) {
            $q = $modelClass::query();
            if (in_array(\Illuminate\Database\Eloquent\SoftDeletes::class, class_uses_recursive($modelClass), true)) {
                $q->withTrashed();
            }
            $q->where($column, $candidate);
            if ($ignoreId) {
                $q->where('id', '!=', $ignoreId);
            }
            if (! $q->exists()) {
                return $candidate;
            }
            $candidate = $base.'-'.$i++;
        }
    }

    /** Root-relative public URL of a media row (demo images live in assets/site/img, uploads in storage). */
    public static function mediaUrl(?MediaFile $m): ?string
    {
        if (! $m) {
            return null;
        }
        $p = ltrim((string) $m->path, '/');
        if (preg_match('#^https?://#i', $p)) {
            return $p;
        }
        if (str_starts_with($p, 'uploads/')) {
            return '/storage/'.$p;
        }
        if (str_starts_with($p, 'img/')) {
            return '/assets/site/'.$p;
        }

        return '/storage/'.$p;
    }

    public static function fmtSize(int $bytes): string
    {
        if ($bytes <= 0) {
            return '—';
        }
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1).' MB';
        }

        return max(1, (int) round($bytes / 1024)).' KB';
    }

    /** Stores an uploaded image on the public disk and creates its media_files row. */
    public static function storeImage(UploadedFile $file, ?string $alt = null): MediaFile
    {
        $ext = strtolower($file->guessExtension() ?: $file->getClientOriginalExtension() ?: 'jpg');
        if ($ext === 'jpeg') {
            $ext = 'jpg';
        }
        $dir = 'uploads/'.date('Y/m');
        $name = Str::random(24).'.'.$ext;
        $size = (int) $file->getSize();
        $mime = $file->getMimeType();
        $original = mb_substr($file->getClientOriginalName(), 0, 255);
        $dims = @getimagesize($file->getRealPath()) ?: [null, null];
        // re-encode through GD: drops trailing bytes / embedded code; falls back to the original when GD cannot (animated, huge, unreadable)
        $clean = ImageSanitizer::clean($file->getRealPath(), $mime);
        if ($clean) {
            $path = Storage::disk('public')->putFileAs($dir, new \Illuminate\Http\File($clean['path']), $name);
            $size = (int) filesize($clean['path']);
            $mime = $clean['mime'];
            $dims = @getimagesize($clean['path']) ?: $dims;
            @unlink($clean['path']);
        } else {
            $path = $file->storeAs($dir, $name, 'public');
        }

        return MediaFile::create([
            'disk' => 'public',
            'path' => $path,
            'original_name' => $original,
            'mime_type' => $mime,
            'size_bytes' => $size,
            'width' => $dims[0] ?: null,
            'height' => $dims[1] ?: null,
            'title' => mb_substr(pathinfo($original, PATHINFO_FILENAME), 0, 255),
            'alt_text' => $alt ? mb_substr($alt, 0, 255) : null,
            'uploaded_by' => auth()->id(),
        ]);
    }

    /** Removes an uploaded file + its media row when no article/album/gallery item uses it any more. */
    public static function dropMediaIfUnused(?int $mediaId): void
    {
        if (! $mediaId) {
            return;
        }
        $m = MediaFile::find($mediaId);
        if (! $m || ! str_starts_with((string) $m->path, 'uploads/')) {
            return; // demo/seed images are never removed
        }
        $used = \App\Models\Article::withTrashed()->where('cover_media_id', $mediaId)->exists()
            || \App\Models\GalleryItem::withTrashed()->where('media_id', $mediaId)->exists()
            || GalleryAlbum::where('cover_media_id', $mediaId)->exists()
            || \App\Models\Partner::withTrashed()->where('logo_media_id', $mediaId)->exists()
            || \App\Models\Appeal::where('image_media_id', $mediaId)->exists();
        if ($used) {
            return;
        }
        try {
            Storage::disk($m->disk ?: 'public')->delete($m->path);
        } catch (\Throwable $e) {
            report($e);
        }
        $m->forceDelete();
    }

    /** Light HTML clean-up for the rich-text body: whitelist of tags, no event handlers / javascript: links. */
    public static function cleanHtml(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }
        $clean = HtmlSanitizer::clean($html);

        return $clean === '' ? null : $clean;
    }

    public static function plainText(?string $html): string
    {
        return trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags((string) $html), ENT_QUOTES | ENT_HTML5, 'UTF-8')));
    }

    /**
     * Dropdown options of a constants group, in constants order. Inactive items are hidden unless listed in $keepKeys.
     * When $refModel is given, rows of that table that have no constants item are appended (so nothing disappears).
     *
     * @return array<int, array{key:string,label:string}>
     */
    public static function options(string $groupKey, ?string $refModel = null, array $keepKeys = []): array
    {
        $group = ConstantGroup::where('group_key', $groupKey)->first();
        $items = $group ? ConstantItem::where('group_id', $group->id)->orderBy('sort_order')->orderBy('id')->get() : collect();
        $out = [];
        $seen = [];
        foreach ($items as $it) {
            $seen[$it->item_key] = true;
            if ($it->is_active || in_array($it->item_key, $keepKeys, true)) {
                $out[] = ['key' => $it->item_key, 'label' => $it->label_ar];
            }
        }
        if ($refModel) {
            foreach ($refModel::query()->orderBy('sort_order')->orderBy('id')->get() as $row) {
                if (! isset($seen[$row->slug])) {
                    $out[] = ['key' => $row->slug, 'label' => $row->name];
                }
            }
        }

        return $out;
    }

    public static function categoryOptions(array $keep = []): array
    {
        return self::options('news_category', ArticleCategory::class, $keep);
    }

    public static function albumOptions(array $keep = []): array
    {
        return self::options('gallery_album', GalleryAlbum::class, $keep);
    }

    public static function statusOptions(): array
    {
        $labels = ['draft' => 'مسودة', 'scheduled' => 'مجدول', 'published' => 'منشور'];
        $opts = self::options('article_status');
        $opts = array_values(array_filter($opts, fn ($o) => isset($labels[$o['key']])));
        if (! $opts) {
            foreach ($labels as $k => $l) {
                $opts[] = ['key' => $k, 'label' => $l];
            }
        }

        return $opts;
    }

    /** All status labels (even disabled ones) to print in the list. */
    public static function statusLabels(): array
    {
        $labels = ['draft' => 'مسودة', 'scheduled' => 'مجدول', 'published' => 'منشور'];
        $group = ConstantGroup::where('group_key', 'article_status')->first();
        if ($group) {
            foreach (ConstantItem::where('group_id', $group->id)->get() as $it) {
                if (isset($labels[$it->item_key])) {
                    $labels[$it->item_key] = $it->label_ar;
                }
            }
        }

        return $labels;
    }

    /** Label of a category/album slug from constants (falls back to the table name). */
    public static function labelMap(string $groupKey, string $refModel): array
    {
        $map = [];
        foreach ($refModel::query()->get() as $r) {
            $map[$r->slug] = $r->name;
        }
        $group = ConstantGroup::where('group_key', $groupKey)->first();
        if ($group) {
            foreach (ConstantItem::where('group_id', $group->id)->get() as $it) {
                $map[$it->item_key] = $it->label_ar;
            }
        }

        return $map;
    }

    /** Creates the matching constants item for a new album so it shows in Settings > constants. */
    public static function addAlbumConstant(GalleryAlbum $album): void
    {
        try {
            $group = ConstantGroup::where('group_key', 'gallery_album')->first();
            if (! $group) {
                return;
            }
            if (ConstantItem::where('group_id', $group->id)->where('item_key', $album->slug)->exists()) {
                return;
            }
            ConstantItem::create([
                'group_id' => $group->id,
                'item_key' => $album->slug,
                'label_ar' => $album->name,
                'is_active' => true,
                'is_locked' => false,
                'sort_order' => (int) ConstantItem::where('group_id', $group->id)->max('sort_order') + 1,
                'meta' => ['ref_slug' => $album->slug],
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
