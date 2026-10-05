<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Table `partners` (schema: database/sql/schema.sql) */
class Partner extends Model
{
    use SoftDeletes;

    protected $table = 'partners';
    protected $fillable = [
        'name',
        'tag_label',
        'tag_icon',
        'description',
        'logo_media_id',
        'website_url',
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

    public function logo(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'logo_media_id');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
