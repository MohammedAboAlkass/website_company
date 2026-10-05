<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Table `activities` (schema: database/sql/schema.sql) */
class Activity extends Model
{
    use SoftDeletes;

    protected $table = 'activities';
    protected $fillable = [
        'governorate_id',
        'project_id',
        'title',
        'description',
        'badge_text',
        'badge_tone',
        'image_media_id',
        'image_alt',
        'date_label',
        'activity_date',
        'place',
        'stat_label',
        'stat_icon',
        'link_label',
        'link_url',
        'is_published',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'activity_date' => 'date',
            'is_published' => 'boolean',
        ];
    }

    // ---- Relationships ----

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(Governorate::class, 'governorate_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'image_media_id');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
