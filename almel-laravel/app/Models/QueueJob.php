<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Table `jobs` (schema: database/sql/schema.sql) */
class QueueJob extends Model
{
    protected $table = 'jobs';
    public $timestamps = false;
    protected $guarded = [];
}
