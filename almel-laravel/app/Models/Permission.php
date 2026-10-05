<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/** Table `permissions` (perm_key = <module>.<action>). */
class Permission extends Model
{
    protected $table = 'permissions';

    protected $fillable = ['perm_key', 'module', 'action', 'name_ar', 'sort_order'];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permission', 'permission_id', 'role_id');
    }

    public function scopeOrdered($q)
    {
        return $q->orderBy('sort_order')->orderBy('id');
    }
}
