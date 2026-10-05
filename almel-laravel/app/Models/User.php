<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Support\Permissions;

/** Table `users` (schema: database/sql/schema.sql) */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /** Legacy default role keys (the real list lives in the `roles` table). */
    public const ROLES = ['admin', 'editor'];
    public const STATUSES = ['active', 'invited', 'disabled'];
    // Note: `users` has no last_login_ip column (not added: no schema changes).

    protected $table = 'users';

    /** @var string[]|null permission keys of the role (cached for the lifetime of this instance / request) */
    protected ?array $permissionCache = null;
    protected ?string $permissionCacheRole = null;
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'phone',
        'job_title',
        'avatar_path',
        'last_login_at',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }

    /** Public URL of the profile photo (users.avatar_path), or null = show the initial letter. */
    public function avatarUrl(): ?string
    {
        return \App\Support\AvatarManager::url($this->avatar_path);
    }

    // ---- Relationships ----

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'user_id');
    }

    public function uploads(): HasMany
    {
        return $this->hasMany(MediaFile::class, 'uploaded_by');
    }

    public function projectUpdates(): HasMany
    {
        return $this->hasMany(ProjectUpdate::class, 'author_id');
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'author_id');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class, 'author_id')->orderBy('sort_order');
    }

    public function handledMessages(): HasMany
    {
        return $this->hasMany(ContactMessage::class, 'handled_by');
    }

    /** Super administrator: role key `admin` (always has every permission). */
    public function isSuperAdmin(): bool
    {
        return $this->role === Role::SUPER;
    }

    public function isAdmin(): bool
    {
        return $this->isSuperAdmin();
    }

    public function isEditor(): bool
    {
        return $this->role === 'editor';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function roleModel(): ?Role
    {
        return Role::query()->where('role_key', $this->role)->first();
    }

    /** The role exists and is switched on (the super role is always on). */
    public function roleIsActive(): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return Role::query()->where('role_key', $this->role)->where('is_active', true)->exists();
    }

    /** @return string[] permission keys granted by the user's role (all keys for the super admin) */
    public function permissionKeys(): array
    {
        if ($this->permissionCache !== null && $this->permissionCacheRole === $this->role) {
            return $this->permissionCache;
        }
        if ($this->isSuperAdmin()) {
            $keys = Permissions::allKeys();
        } else {
            try {
                $keys = \Illuminate\Support\Facades\DB::table('roles')
                    ->join('role_permission', 'role_permission.role_id', '=', 'roles.id')
                    ->join('permissions', 'permissions.id', '=', 'role_permission.permission_id')
                    ->where('roles.role_key', $this->role)->where('roles.is_active', 1)
                    ->pluck('permissions.perm_key')->all();
            } catch (\Throwable $e) {
                report($e);
                $keys = [];
            }
        }
        $this->permissionCacheRole = $this->role;

        return $this->permissionCache = array_values(array_unique($keys));
    }

    public function hasPermission(string $key): bool
    {
        return $this->isSuperAdmin() || in_array($key, $this->permissionKeys(), true);
    }

    /** True when at least one of the keys is granted. */
    public function hasAnyPermission(array $keys): bool
    {
        foreach ($keys as $k) {
            if ($this->hasPermission($k)) {
                return true;
            }
        }

        return false;
    }

    /** May open the control panel: active account + active role holding at least one permission. */
    public function canAccessAdmin(): bool
    {
        return $this->isActive() && $this->roleIsActive() && ($this->isSuperAdmin() || count($this->permissionKeys()) > 0);
    }

    /** @return array<string,string> role_key => Arabic name (all roles, request-cached) */
    public static function roleLabels(): array
    {
        static $cache = null;
        if ($cache === null) {
            try {
                $cache = Role::query()->ordered()->pluck('name_ar', 'role_key')->all();
            } catch (\Throwable $e) {
                $cache = [];
            }
        }

        return $cache;
    }

    public function roleLabel(): string
    {
        return self::roleLabels()[$this->role] ?? (string) $this->role;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
