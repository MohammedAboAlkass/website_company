<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Table `programs` (schema: database/sql/schema.sql) */
class Program extends Model
{
    protected $table = 'programs';
    protected $fillable = [
        'slug',
        'name',
        'icon',
        'description',
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
        return $this->hasMany(Project::class, 'program_id')->orderBy('sort_order');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
