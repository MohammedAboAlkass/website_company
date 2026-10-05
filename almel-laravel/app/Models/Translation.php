<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/** Table `translations` (schema: database/sql/schema.sql) */
class Translation extends Model
{
    protected $table = 'translations';
    protected $fillable = [
        'translatable_type',
        'translatable_id',
        'locale',
        'field',
        'value',
    ];

    // ---- Relationships ----

    public function translatable(): MorphTo
    {
        return $this->morphTo();
    }
}
