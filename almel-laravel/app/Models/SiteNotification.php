<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/** Table `notifications` (schema: database/sql/schema.sql) */
class SiteNotification extends Model
{
    protected $table = 'notifications';
    protected $primaryKey = 'id';
    protected $keyType = 'string';

    public $incrementing = false;
    protected $fillable = [
        'type',
        'notifiable_type',
        'notifiable_id',
        'data',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'data' => 'array',
        ];
    }

    // ---- Relationships ----

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }
}
