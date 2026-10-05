<?php

namespace App\Models;

use App\Support\MediaManager;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Table `media_files` (schema: database/sql/schema.sql). Library UI: /admin/media (title = display name, alt_text, caption). */
class MediaFile extends Model
{
    use SoftDeletes;

    protected $table = 'media_files';
    protected $fillable = [
        'disk',
        'path',
        'original_name',
        'mime_type',
        'size_bytes',
        'width',
        'height',
        'title',
        'alt_text',
        'caption',
        'uploaded_by',
    ];

    // ---- Relationships ----

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function url(): string
    {
        return \Illuminate\Support\Facades\Storage::disk($this->disk)->url($this->path);
    }

    /** image | video | pdf | document | other */
    public function kind(): string
    {
        return MediaManager::kindOf($this->mime_type);
    }

    public function isImage(): bool
    {
        return $this->kind() === 'image';
    }
}
