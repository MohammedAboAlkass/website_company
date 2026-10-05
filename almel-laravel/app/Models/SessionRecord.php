<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Table `sessions` (schema: database/sql/schema.sql) */
class SessionRecord extends Model
{
    protected $table = 'sessions';
    protected $primaryKey = 'id';
    protected $keyType = 'string';

    public $incrementing = false;
    public $timestamps = false;
    protected $guarded = [];
}
