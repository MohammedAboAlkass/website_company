<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

/** Table `article_tag` (schema: database/sql/schema.sql) */
class ArticleTag extends Pivot
{
    protected $table = 'article_tag';
    public $incrementing = false;
    public $timestamps = false;
    protected $guarded = [];

    // ---- Relationships ----

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'article_id');
    }

    public function tag(): BelongsTo
    {
        return $this->belongsTo(Tag::class, 'tag_id');
    }
}
