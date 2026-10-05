<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Table `cache_locks` (schema: database/sql/schema.sql) */
class CacheLock extends Model
{
    protected $table = 'cache_locks';
    protected $primaryKey = 'key';
    protected $keyType = 'string';

    public $incrementing = false;
    public $timestamps = false;
    protected $guarded = [];
}
