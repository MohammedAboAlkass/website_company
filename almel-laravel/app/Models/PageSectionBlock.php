<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Table `page_section_blocks` (schema: database/sql/schema.sql) */
class PageSectionBlock extends Model
{
    protected $table = 'page_section_blocks';
    protected $fillable = [
        'page_section_id',
        'type',
        'icon',
        'title',
        'text',
        'value',
        'media_id',
        'url',
        'data',
        'is_visible',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'is_visible' => 'boolean',
        ];
    }

    // ---- Relationships ----

    public function section(): BelongsTo
    {
        return $this->belongsTo(PageSection::class, 'page_section_id');
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'media_id');
    }
}
