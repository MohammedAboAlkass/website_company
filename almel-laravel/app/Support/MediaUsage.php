<?php

namespace App\Support;

use App\Models\MediaFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/** Knows which tables point at `media_files`, so an uploaded image is only deleted when nothing uses it any more. */
class MediaUsage
{
    /** table => column (all foreign keys to media_files.id in database/sql/schema.sql) */
    private const REFS = [
        'projects' => 'cover_media_id',
        'project_images' => 'media_id',
        'articles' => 'cover_media_id',
        'gallery_albums' => 'cover_media_id',
        'gallery_items' => 'media_id',
        'stories' => 'image_media_id',
        'activities' => 'image_media_id',
        'partners' => 'logo_media_id',
        'appeals' => 'image_media_id',
        'pages' => 'og_media_id',
        'page_sections' => 'media_id',
        'page_section_blocks' => 'media_id',
    ];

    public static function isUsed(int $mediaId): bool
    {
        foreach (self::REFS as $table => $col) {
            try {
                if (DB::table($table)->where($col, $mediaId)->exists()) {
                    return true;
                }
            } catch (\Throwable $e) {
                // table/column missing in this install: ignore
            }
        }

        return false;
    }

    /** Deletes the file + row of an uploaded image (uploads/…) when no record uses it. Demo/seed images (img/…) are never removed. */
    public static function dropIfUnused(?int $mediaId): void
    {
        if (! $mediaId) {
            return;
        }
        $m = MediaFile::find($mediaId);
        if (! $m || ! str_starts_with((string) $m->path, 'uploads/') || self::isUsed($mediaId)) {
            return;
        }
        try {
            Storage::disk($m->disk ?: 'public')->delete($m->path);
        } catch (\Throwable $e) {
            report($e);
        }
        $m->forceDelete();
    }
}
