<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Table `job_batches` (schema: database/sql/schema.sql) */
class JobBatch extends Model
{
    protected $table = 'job_batches';
    protected $primaryKey = 'id';
    protected $keyType = 'string';

    public $incrementing = false;
    public $timestamps = false;
    protected $guarded = [];
}
