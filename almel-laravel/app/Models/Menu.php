<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Table `menus` (schema: database/sql/schema.sql) */
class Menu extends Model
{
    protected $table = 'menus';
    protected $fillable = [
        'slug',
        'name',
    ];

    // ---- Relationships ----

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'menu_id')->orderBy('sort_order');
    }

    public function rootItems(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'menu_id')->whereNull('parent_id')->orderBy('sort_order');
    }
}
