<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Table `article_categories` (schema: database/sql/schema.sql) */
class ArticleCategory extends Model
{
    protected $table = 'article_categories';
    protected $fillable = [
        'slug',
        'name',
        'sort_order',
    ];

    // ---- Relationships ----

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'article_category_id');
    }
}
