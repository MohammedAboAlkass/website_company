<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Table `page_sections` (schema: database/sql/schema.sql) */
class PageSection extends Model
{
    protected $table = 'page_sections';
    protected $fillable = [
        'page_id',
        'section_key',
        'type',
        'label',
        'eyebrow',
        'title',
        'subtitle',
        'body',
        'media_id',
        'settings',
        'is_visible',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'is_visible' => 'boolean',
        ];
    }

    // ---- Relationships ----

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'page_id');
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'media_id');
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(PageSectionBlock::class, 'page_section_id')->orderBy('sort_order');
    }
}
