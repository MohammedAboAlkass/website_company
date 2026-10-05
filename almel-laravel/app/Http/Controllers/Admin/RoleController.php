<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\Audit;
use App\Support\Permissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * «الأدوار والصلاحيات»: page + JSON API (admin-roles.js). Who may call what is decided by the 'perm'
 * middleware (roles.view / create / edit / delete, assigning users also needs users.edit).
 * Rules: role `admin` is locked (all permissions, always active, cannot be edited or deleted);
 * built-in (is_system) roles cannot be deleted; a role that still has users cannot be deleted;
 * a non-super user can only grant permissions they hold themselves and cannot edit their own role.
 */
class RoleController extends Controller
{
    private const RESERVED_KEYS = ['root', 'super', 'superadmin', 'system', 'guest', 'user', 'null', 'none'];

    public function index(Request $request)
    {
        return view('admin.roles.index', ['boot' => $this->payload($request)]);
    }

    public function data(Request $request): JsonResponse
    {
        return response()->json($this->payload($request));
    }

    public function users(Request $request, Role $role): JsonResponse
    {
        return response()->json(['users' => $this->roleUsers($role)]);
    }

    public function store(Request $request): JsonResponse
    {
        $me = $request->user();
        $v = Validator::make($request->all(), [
            'name_ar' => ['required', 'string', 'min:2', 'max:100'],
            'role_key' => ['required', 'string', 'regex:/^[a-z][a-z0-9_]{1,19}$/', 'unique:roles,role_key'],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
            'copy_from' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ], $this->messages(), $this->attributes());
        $v->after(function ($v) use ($request) {
            if (in_array(strtolower((string) $request->input('role_key')), self::RESERVED_KEYS, true)) {
                $v->errors()->add('role_key', 'هذا المعرّف محجوز، اختر معرّفاً آخر.');
            }
            if (Role::query()->where('name_ar', trim((string) $request->input('name_ar')))->exists()) {
                $v->errors()->add('name_ar', 'يوجد دور بنفس الاسم.');
            }
        });
        if ($v->fails()) {
            return $this->invalid($v);
        }
        $d = $v->validated();

        $keys = $d['permissions'] ?? null;
        $source = null;
        if ($keys === null && ! empty($d['copy_from'])) {
            $source = Role::query()->find($d['copy_from']);
            $keys = $source ? $source->permissionKeys() : [];
        }
        $keys = $this->cleanKeys((array) $keys);
        if ($err = $this->escalation($me, $keys)) {
            return $this->fail($err, 403);
        }

        $role = DB::transaction(function () use ($d, $keys) {
            $role = Role::create([
                'role_key' => $d['role_key'],
                'name_ar' => trim($d['name_ar']),
                'description' => isset($d['description']) ? trim((string) $d['description']) : null,
                'is_system' => false,
                'is_active' => (bool) ($d['is_active'] ?? true),
                'sort_order' => (int) Role::query()->max('sort_order') + 1,
            ]);
            $role->permissions()->sync($this->idsFor($keys));

            return $role;
        });

        Audit::log('role.create', 'إنشاء دور: '.$role->name_ar.' ('.$role->role_key.')', $role, ['type' => 'users', 'permissions' => count($keys), 'copied_from' => $source?->role_key]);

        return response()->json(['role' => $this->roleData($role), 'message' => 'تم إنشاء الدور «'.$role->name_ar.'».'], 201);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $me = $request->user();
        if ($role->isSuper()) {
            return $this->fail('دور مدير النظام محمي: يملك كل الصلاحيات دائماً ولا يمكن تعديله أو تعطيله.', 422);
        }
        if (! $me->isSuperAdmin()) {
            if ($me->role === $role->role_key) {
                return $this->fail('لا يمكنك تعديل صلاحيات دورك أنت.', 403);
            }
            if (array_diff($role->permissionKeys(), $me->permissionKeys())) {
                return $this->fail('هذا الدور يملك صلاحيات لا تملكها أنت، فلا يمكنك تعديله.', 403);
            }
        }

        $v = Validator::make($request->all(), [
            'name_ar' => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['string'],
        ], $this->messages(), $this->attributes());
        $v->after(function ($v) use ($request, $role) {
            $n = trim((string) $request->input('name_ar', $role->name_ar));
            if (Role::query()->where('name_ar', $n)->where('id', '!=', $role->id)->exists()) {
                $v->errors()->add('name_ar', 'يوجد دور بنفس الاسم.');
            }
        });
        if ($v->fails()) {
            return $this->invalid($v);
        }
        $d = $v->validated();

        if (array_key_exists('is_active', $d) && ! $d['is_active']) {
            if ($me->role === $role->role_key) {
                return $this->fail('لا يمكنك تعطيل دور حسابك أنت.', 422);
            }
        }
        $keysNew = null;
        if (array_key_exists('permissions', $d)) {
            $keysNew = $this->cleanKeys($d['permissions']);
            if ($err = $this->escalation($me, $keysNew)) {
                return $this->fail($err, 403);
            }
        }

        $before = ['name' => $role->name_ar, 'active' => $role->is_active, 'description' => $role->description];
        $added = $removed = [];
        DB::transaction(function () use ($role, $d, $keysNew, &$added, &$removed) {
            if (isset($d['name_ar'])) {
                $role->name_ar = trim($d['name_ar']);
            }
            if (array_key_exists('description', $d)) {
                $role->description = $d['description'] !== null ? trim($d['description']) : null;
            }
            if (array_key_exists('is_active', $d)) {
                $role->is_active = (bool) $d['is_active'];
            }
            $role->save();
            if ($keysNew !== null) {
                $old = $role->permissionKeys();
                $added = array_values(array_diff($keysNew, $old));
                $removed = array_values(array_diff($old, $keysNew));
                $role->permissions()->sync($this->idsFor($keysNew));
            }
        });

        Audit::log('role.update', 'تعديل دور: '.$role->name_ar.' ('.$role->role_key.')', $role, [
            'type' => 'users', 'before' => $before, 'after' => ['name' => $role->name_ar, 'active' => $role->is_active, 'description' => $role->description],
            'added' => $added, 'removed' => $removed,
        ]);

        return response()->json(['role' => $this->roleData($role->fresh()), 'message' => 'تم حفظ الدور «'.$role->name_ar.'».']);
    }

    public function destroy(Request $request, Role $role): JsonResponse
    {
        if ($role->isSuper() || $role->is_system) {
            return $this->fail('الأدوار الأساسية في النظام لا يمكن حذفها.', 422);
        }
        $n = $role->usersQuery()->count();
        if ($n > 0) {
            return $this->fail('لا يمكن حذف دور مرتبط بـ '.$n.' مستخدم. انقل المستخدمين إلى دور آخر أولاً.', 422);
        }
        if (User::withTrashed()->where('role', $role->role_key)->exists()) {
            return $this->fail('هذا الدور مرتبط بحسابات محذوفة، لا يمكن حذفه.', 422);
        }
        $name = $role->name_ar;
        $key = $role->role_key;
        $role->delete(); // role_permission rows cascade
        Audit::log('role.delete', 'حذف دور: '.$name.' ('.$key.')', null, ['type' => 'users', 'role_key' => $key]);

        return response()->json(['message' => 'تم حذف الدور «'.$name.'».', 'deleted' => $role->id]);
    }

    /** Move users into this role (the role page «المستخدمون» tab). */
    public function assign(Request $request, Role $role): JsonResponse
    {
        $me = $request->user();
        $v = Validator::make($request->all(), ['user_ids' => ['required', 'array', 'min:1'], 'user_ids.*' => ['integer']], $this->messages(), ['user_ids' => 'المستخدمون']);
        if ($v->fails()) {
            return $this->invalid($v);
        }
        if (! $role->is_active) {
            return $this->fail('لا يمكن تعيين مستخدمين إلى دور معطّل.', 422);
        }
        if (! $me->isSuperAdmin()) {
            if ($role->isSuper()) {
                return $this->fail('تعيين دور مدير النظام متاح لمدير النظام فقط.', 403);
            }
            if (array_diff($role->permissionKeys(), $me->permissionKeys())) {
                return $this->fail('هذا الدور يملك صلاحيات لا تملكها أنت، فلا يمكنك تعيينه.', 403);
            }
        }

        $moved = 0;
        $errors = [];
        foreach (User::query()->whereIn('id', $v->validated()['user_ids'])->get() as $u) {
            if ($u->role === $role->role_key) {
                continue;
            }
            if ($u->id === $me->id) {
                $errors[] = 'لا يمكنك تغيير دورك بنفسك.';
                continue;
            }
            if (! $me->isSuperAdmin() && ($u->isSuperAdmin() || array_diff($u->permissionKeys(), $me->permissionKeys()))) {
                $errors[] = 'لا يمكنك تعديل «'.$u->name.'» لأن دوره أعلى من دورك.';
                continue;
            }
            if ($u->role === Role::SUPER && $u->status === 'active'
                && User::where('role', Role::SUPER)->where('status', 'active')->where('id', '!=', $u->id)->doesntExist()) {
                $errors[] = 'لا يمكن نقل «'.$u->name.'»: يجب أن يبقى مدير واحد مفعّل على الأقل.';
                continue;
            }
            $from = $u->role;
            $u->role = $role->role_key;
            $u->save();
            $moved++;
            Audit::log('role.assign', 'تعيين دور «'.$role->name_ar.'» للمستخدم '.$u->email, $u, ['type' => 'users', 'from' => $from, 'to' => $role->role_key]);
        }

        if ($moved === 0 && $errors) {
            return $this->fail(implode(' ', array_unique($errors)), 422);
        }

        return response()->json([
            'message' => $moved.' مستخدم نُقل إلى «'.$role->name_ar.'».'.($errors ? ' '.implode(' ', array_unique($errors)) : ''),
            'moved' => $moved,
            'warnings' => array_values(array_unique($errors)),
            'roles' => $this->payload($request)['roles'],
            'users' => $this->payload($request)['users'],
        ]);
    }

    // ------------------------------------------------------------------ helpers

    private function payload(Request $request): array
    {
        $me = $request->user();
        $roles = Role::query()->ordered()->get();
        $counts = User::query()->selectRaw('role, COUNT(*) c')->groupBy('role')->pluck('c', 'role');
        $perms = DB::table('role_permission')->join('permissions', 'permissions.id', '=', 'role_permission.permission_id')
            ->select('role_permission.role_id', 'permissions.perm_key')->get()->groupBy('role_id');

        return [
            'roles' => $roles->map(fn (Role $r) => $this->shape($r, (int) ($counts[$r->role_key] ?? 0), $perms->get($r->id, collect())->pluck('perm_key')->all()))->values()->all(),
            'catalog' => Permissions::groups(),
            'actions' => Permissions::actions(),
            'permNames' => Permission::query()->pluck('name_ar', 'perm_key')->all(),
            'users' => $me->hasPermission('users.view')
                ? User::query()->orderBy('id')->get(['id', 'name', 'email', 'role', 'status', 'last_login_at'])->map(fn ($u) => [
                    'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role, 'status' => $u->status,
                    'last' => $u->last_login_at ? $u->last_login_at->format('Y-m-d H:i') : null, 'me' => $u->id === $me->id,
                ])->all()
                : null,
            'me' => [
                'id' => $me->id, 'role' => $me->role, 'super' => $me->isSuperAdmin(),
                'can' => [
                    'create' => $me->hasPermission('roles.create'), 'edit' => $me->hasPermission('roles.edit'),
                    'delete' => $me->hasPermission('roles.delete'), 'assign' => $me->hasPermission('roles.edit') && $me->hasPermission('users.edit'),
                    'users' => $me->hasPermission('users.view'),
                ],
                'perms' => $me->permissionKeys(),
            ],
            'urls' => ['base' => route('admin.roles.index'), 'users' => route('admin.users.index')],
        ];
    }

    private function roleData(Role $role): array
    {
        return $this->shape($role, $role->usersQuery()->count(), $role->permissionKeys());
    }

    private function shape(Role $r, int $users, array $keys): array
    {
        return [
            'id' => $r->id, 'key' => $r->role_key, 'name' => $r->name_ar, 'description' => (string) $r->description,
            'system' => (bool) $r->is_system, 'active' => (bool) $r->is_active, 'locked' => $r->isSuper(),
            'users' => $users, 'permissions' => array_values($keys),
            'created' => $r->created_at ? $r->created_at->format('Y-m-d') : null,
            'updated' => $r->updated_at ? $r->updated_at->format('Y-m-d H:i') : null,
        ];
    }

    private function roleUsers(Role $role): array
    {
        return $role->usersQuery()->orderBy('id')->get(['id', 'name', 'email', 'status', 'last_login_at'])->map(fn ($u) => [
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'status' => $u->status,
            'last' => $u->last_login_at ? $u->last_login_at->format('Y-m-d H:i') : null,
        ])->all();
    }

    /** Keep only keys that exist in the catalog. */
    private function cleanKeys(array $keys): array
    {
        return array_values(array_intersect(array_unique($keys), Permissions::allKeys()));
    }

    /** @return int[] */
    private function idsFor(array $keys): array
    {
        return Permission::query()->whereIn('perm_key', $keys)->pluck('id')->all();
    }

    /** A non-super user cannot grant permissions they do not hold. */
    private function escalation(User $me, array $keys): ?string
    {
        if ($me->isSuperAdmin()) {
            return null;
        }
        $extra = array_diff($keys, $me->permissionKeys());

        return $extra ? 'لا يمكنك منح صلاحيات لا تملكها أنت ('.implode('، ', array_slice($extra, 0, 5)).').' : null;
    }

    private function fail(string $message, int $status): JsonResponse
    {
        return response()->json(['message' => $message], $status);
    }

    private function invalid($validator): JsonResponse
    {
        return response()->json(['message' => $validator->errors()->first(), 'errors' => $validator->errors()], 422);
    }

    private function messages(): array
    {
        return [
            'required' => 'حقل :attribute مطلوب.',
            'min' => 'حقل :attribute قصير جداً.',
            'max' => 'حقل :attribute يجب ألا يزيد عن :max حرفاً.',
            'unique' => 'هذا المعرّف مستخدم لدور آخر.',
            'regex' => 'المعرّف: حروف إنجليزية صغيرة وأرقام وشرطة سفلية فقط، يبدأ بحرف (2 إلى 20).',
        ];
    }

    private function attributes(): array
    {
        return ['name_ar' => 'اسم الدور', 'role_key' => 'المعرّف', 'description' => 'الوصف'];
    }
}
