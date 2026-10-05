<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Table `menu_items` (schema: database/sql/schema.sql) */
class MenuItem extends Model
{
    protected $table = 'menu_items';
    protected $fillable = [
        'menu_id',
        'parent_id',
        'page_id',
        'label',
        'url',
        'type',
        'icon',
        'is_button',
        'open_in_new_tab',
        'is_visible',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_button' => 'boolean',
            'open_in_new_tab' => 'boolean',
            'is_visible' => 'boolean',
        ];
    }

    // ---- Relationships ----

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'page_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('sort_order');
    }
}
