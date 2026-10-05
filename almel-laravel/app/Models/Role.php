<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/** Table `roles`. `role_key` is stored in users.role. Role `admin` is the locked super-admin role. */
class Role extends Model
{
    public const SUPER = 'admin';

    protected $table = 'roles';

    protected $fillable = ['role_key', 'name_ar', 'description', 'is_system', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['is_system' => 'boolean', 'is_active' => 'boolean', 'sort_order' => 'integer'];
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission', 'role_id', 'permission_id');
    }

    public function isSuper(): bool
    {
        return $this->role_key === self::SUPER;
    }

    /** Non-deleted users holding this role. */
    public function usersQuery()
    {
        return User::query()->where('role', $this->role_key);
    }

    /** @return string[] permission keys */
    public function permissionKeys(): array
    {
        return $this->permissions()->pluck('perm_key')->all();
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    public function scopeOrdered($q)
    {
        return $q->orderBy('sort_order')->orderBy('id');
    }
}
