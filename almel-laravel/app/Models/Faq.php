<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Table `faqs` (schema: database/sql/schema.sql) */
class Faq extends Model
{
    use SoftDeletes;

    protected $table = 'faqs';
    protected $fillable = [
        'question',
        'answer',
        'is_published',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
