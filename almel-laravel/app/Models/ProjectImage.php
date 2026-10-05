<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Table `project_images` (schema: database/sql/schema.sql) */
class ProjectImage extends Model
{
    protected $table = 'project_images';
    protected $fillable = [
        'project_id',
        'media_id',
        'caption',
        'sort_order',
    ];

    // ---- Relationships ----

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'media_id');
    }
}
