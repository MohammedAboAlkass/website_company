<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Table `pages` (schema: database/sql/schema.sql) */
class Page extends Model
{
    use SoftDeletes;

    protected $table = 'pages';
    protected $fillable = [
        'author_id',
        'slug',
        'title',
        'kind',
        'template',
        'icon',
        'seo_title',
        'meta_description',
        'og_media_id',
        'body',
        'status',
        'sort_order',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    // ---- Relationships ----

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function ogImage(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'og_media_id');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(PageSection::class, 'page_id')->orderBy('sort_order');
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'page_id')->orderBy('sort_order');
    }

    public const STATUSES = ['published', 'draft', 'hidden'];

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
