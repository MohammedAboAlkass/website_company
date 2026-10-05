<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Table `articles` (schema: database/sql/schema.sql) */
class Article extends Model
{
    use SoftDeletes;

    protected $table = 'articles';
    protected $fillable = [
        'article_category_id',
        'author_id',
        'project_id',
        'slug',
        'title',
        'excerpt',
        'body',
        'highlights',
        'cover_media_id',
        'cover_alt',
        'byline',
        'desk',
        'reference_code',
        'badge_text',
        'read_minutes',
        'status',
        'published_at',
        'is_featured',
        'views_count',
        'seo_title',
        'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'highlights' => 'array',
            'published_at' => 'datetime',
            'is_featured' => 'boolean',
        ];
    }

    // ---- Relationships ----

    public function category(): BelongsTo
    {
        return $this->belongsTo(ArticleCategory::class, 'article_category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function cover(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'cover_media_id');
    }

    public function articleTag(): HasMany
    {
        return $this->hasMany(ArticleTag::class, 'article_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'article_tag', 'article_id', 'tag_id');
    }

    public const STATUSES = ['draft', 'scheduled', 'published'];

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
