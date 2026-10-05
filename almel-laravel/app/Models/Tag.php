<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Table `tags` (schema: database/sql/schema.sql). Managed in /admin/tags; attached to news articles through `article_tag`. */
class Tag extends Model
{
    protected $table = 'tags';
    protected $fillable = [
        'slug',
        'name',
    ];

    // ---- Relationships ----

    public function articleTag(): HasMany
    {
        return $this->hasMany(ArticleTag::class, 'tag_id');
    }

    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'article_tag', 'tag_id', 'article_id');
    }
}
