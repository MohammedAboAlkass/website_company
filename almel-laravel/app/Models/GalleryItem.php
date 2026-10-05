<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Table `gallery_items` (schema: database/sql/schema.sql) */
class GalleryItem extends Model
{
    use SoftDeletes;

    protected $table = 'gallery_items';
    protected $fillable = [
        'gallery_album_id',
        'media_id',
        'project_id',
        'governorate_id',
        'type',
        'video_url',
        'title',
        'caption',
        'alt_text',
        'taken_at',
        'is_published',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'taken_at' => 'date',
            'is_published' => 'boolean',
        ];
    }

    // ---- Relationships ----

    public function album(): BelongsTo
    {
        return $this->belongsTo(GalleryAlbum::class, 'gallery_album_id');
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'media_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(Governorate::class, 'governorate_id');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
