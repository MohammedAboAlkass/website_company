<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Table `failed_jobs` (schema: database/sql/schema.sql) */
class FailedJob extends Model
{
    protected $table = 'failed_jobs';
    public $timestamps = false;
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'failed_at' => 'datetime',
        ];
    }
}
