<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Table `constant_items` (schema: database/sql/schema.sql) - one option of a constants group */
class ConstantItem extends Model
{
    protected $table = 'constant_items';
    protected $fillable = [
        'group_id',
        'item_key',
        'label_ar',
        'is_active',
        'is_locked',
        'sort_order',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_locked' => 'boolean',
            'sort_order' => 'integer',
            'meta' => 'array',
        ];
    }

    // ---- Relationships ----

    public function group(): BelongsTo
    {
        return $this->belongsTo(ConstantGroup::class, 'group_id');
    }

    // ---- Scopes ----

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }
}
