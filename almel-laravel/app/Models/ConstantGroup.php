<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Table `constant_groups` (schema: database/sql/schema.sql) - one row per editable dropdown list */
class ConstantGroup extends Model
{
    protected $table = 'constant_groups';
    protected $fillable = [
        'group_key',
        'name_ar',
        'description',
        'ref_table',
        'used_in',
        'is_locked',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'used_in' => 'array',
            'is_locked' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    // ---- Relationships ----

    public function items(): HasMany
    {
        return $this->hasMany(ConstantItem::class, 'group_id')->orderBy('sort_order');
    }

    public function activeItems(): HasMany
    {
        return $this->hasMany(ConstantItem::class, 'group_id')->where('is_active', true)->orderBy('sort_order');
    }

    // ---- Scopes ----

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    public function scopeKey($query, string $groupKey)
    {
        return $query->where('group_key', $groupKey);
    }
}
