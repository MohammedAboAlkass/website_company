<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Table `stories` (schema: database/sql/schema.sql) */
class Story extends Model
{
    use SoftDeletes;

    protected $table = 'stories';
    protected $fillable = [
        'person_name',
        'person_role',
        'tag_label',
        'tag_icon',
        'quote',
        'image_media_id',
        'image_alt',
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

    public function image(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'image_media_id');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
