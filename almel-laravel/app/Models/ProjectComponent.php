<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Table `project_components` (schema: database/sql/schema.sql) */
class ProjectComponent extends Model
{
    protected $table = 'project_components';
    protected $fillable = [
        'project_id',
        'icon',
        'title',
        'text',
        'sort_order',
    ];

    // ---- Relationships ----

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }
}
