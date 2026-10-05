<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Table `settings` (schema: database/sql/schema.sql) */
class Setting extends Model
{
    protected $table = 'settings';
    protected $fillable = [
        'key',
        'value',
        'type',
        'section',
        'label',
        'is_public',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    /** Value converted according to the `type` column. */
    public function typedValue(): mixed
    {
        return match ($this->type) {
            'int' => (int) $this->value,
            'bool' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'json' => $this->value === null ? null : json_decode($this->value, true),
            default => $this->value,
        };
    }
}
