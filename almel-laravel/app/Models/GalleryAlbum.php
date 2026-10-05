<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Table `gallery_albums` (schema: database/sql/schema.sql) */
class GalleryAlbum extends Model
{
    protected $table = 'gallery_albums';
    protected $fillable = [
        'slug',
        'name',
        'description',
        'cover_media_id',
        'is_published',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    // ---- Relationships ----

    public function cover(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'cover_media_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(GalleryItem::class, 'gallery_album_id')->orderBy('sort_order');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
