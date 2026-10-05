<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Table `contact_messages` (schema: database/sql/schema.sql) */
class ContactMessage extends Model
{
    use SoftDeletes;

    protected $table = 'contact_messages';
    protected $fillable = [
        'type',
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'consent_given',
        'is_read',
        'is_starred',
        'is_archived',
        'read_at',
        'handled_by',
        'handled_at',
        'internal_note',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'consent_given' => 'boolean',
            'is_read' => 'boolean',
            'is_starred' => 'boolean',
            'is_archived' => 'boolean',
            'read_at' => 'datetime',
            'handled_at' => 'datetime',
        ];
    }

    // ---- Relationships ----

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    /** Allowed message types (no donation type on this site). */
    public const TYPES = ['contact', 'volunteer', 'partnership', 'media', 'inquiry', 'other'];

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeInbox($query)
    {
        return $query->where('is_archived', false);
    }

    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }
}
