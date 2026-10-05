<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Table `cache` (schema: database/sql/schema.sql) */
class CacheEntry extends Model
{
    protected $table = 'cache';
    protected $primaryKey = 'key';
    protected $keyType = 'string';

    public $incrementing = false;
    public $timestamps = false;
    protected $guarded = [];
}
