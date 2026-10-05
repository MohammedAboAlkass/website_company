<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Table `password_reset_tokens` (schema: database/sql/schema.sql) */
class PasswordResetToken extends Model
{
    protected $table = 'password_reset_tokens';
    protected $primaryKey = 'email';
    protected $keyType = 'string';

    public $incrementing = false;
    public $timestamps = false;
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }
}
