<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Table `governorates` (schema: database/sql/schema.sql) */
class Governorate extends Model
{
    protected $table = 'governorates';
    protected $fillable = [
        'slug',
        'name',
        'note',
        'beneficiaries',
        'meals',
        'tents',
        'water_points',
        'distribution_points',
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

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'governorate_id')->orderBy('sort_order');
    }

    public function galleryItems(): HasMany
    {
        return $this->hasMany(GalleryItem::class, 'governorate_id')->orderBy('sort_order');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'governorate_id')->orderBy('sort_order');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
