<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Table `hero_slides` (database/sql/hero.sql) */
class HeroSlide extends Model
{
    protected $table = 'hero_slides';

    protected $fillable = ['sort_order', 'is_visible', 'label', 'duration_seconds', 'bg_type', 'content', 'style', 'background', 'created_by', 'updated_by'];

    protected $casts = [
        'is_visible' => 'boolean',
        'sort_order' => 'integer',
        'duration_seconds' => 'integer',
        'content' => 'array',
        'style' => 'array',
        'background' => 'array',
    ];
}
