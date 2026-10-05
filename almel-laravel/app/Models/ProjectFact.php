<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Table `project_facts` (schema: database/sql/schema.sql) */
class ProjectFact extends Model
{
    protected $table = 'project_facts';
    protected $fillable = [
        'project_id',
        'label',
        'value',
        'is_accent',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_accent' => 'boolean',
        ];
    }

    // ---- Relationships ----

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }
}
