<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Table `backup_runs` (history of exports / restores; the dump files live in storage/app/backups). */
class BackupRun extends Model
{
    public $timestamps = false;

    protected $table = 'backup_runs';

    protected $fillable = ['kind', 'status', 'filename', 'size_bytes', 'scope', 'tables_count', 'rows_count', 'checksum', 'user_id', 'note', 'created_at'];

    protected function casts(): array
    {
        return ['scope' => 'array', 'created_at' => 'datetime', 'size_bytes' => 'integer'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
