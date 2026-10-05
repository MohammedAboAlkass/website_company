<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Support\Audit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * System users. Access is decided by the 'perm' middleware (users.view / create / edit / delete).
 * Roles come from the `roles` table; only the super admin may hand out the `admin` role or any role
 * holding permissions the acting user does not have.
 */
class UserController extends Controller
{
    private const PER_PAGE = 15;

    public function index(Request $request)
    {
        $me = $request->user();
        $q = trim(\App\Support\Req::str($request, 'q', ''));
        $role = \App\Support\Req::str($request, 'role', '');
        $status = \App\Support\Req::str($request, 'status', '');

        $query = User::query()
            ->when($q !== '', function ($w) use ($q) {
                $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q).'%';
                $w->where(fn ($x) => $x->where('name', 'like', $like)->orWhere('email', 'like', $like));
            })
            ->when($role !== '', fn ($w) => $w->where('role', $role))
            ->when(in_array($status, User::STATUSES, true), fn ($w) => $w->where('status', $status))
            ->orderBy('id');

        $users = $query->paginate(self::PER_PAGE)->withQueryString();

        $stats = [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'admins' => User::where('role', 'admin')->where('status', 'active')->count(),
            'disabled' => User::where('status', 'disabled')->count(),
        ];

        $allRoles = Role::query()->ordered()->get();

        return view('admin.users.index', [
            'users' => $users,
            'stats' => $stats,
            'roles' => $this->roleOptions($me),
            'roleDescs' => $allRoles->pluck('description', 'role_key')->all(),
            'filterRoles' => $allRoles->pluck('name_ar', 'role_key')->all(),
            'roleLabels' => $allRoles->pluck('name_ar', 'role_key')->all(),
            'roleOff' => $allRoles->where('is_active', false)->pluck('role_key')->all(),
            'canManage' => fn (User $u) => $this->canManage($me, $u),
            'filters' => ['q' => $q, 'role' => $role, 'status' => $status],
            'me' => $me,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $me = $request->user();
        $data = $this->validateOrBack($request, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:filter', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in(array_keys($this->roleOptions($me)))],
            'password' => ['required', 'confirmed', $this->passwordRule()],
        ], ['mode' => 'create']);
        if ($data instanceof RedirectResponse) {
            return $data;
        }

        $user = new User();
        $user->name = trim($data['name']);
        $user->email = mb_strtolower(trim($data['email']));
        $user->role = $data['role'];
        $user->status = $request->boolean('active') ? 'active' : 'disabled';
        $user->password = $data['password'];
        $user->save();

        Audit::log('user.create', 'إضافة مستخدم: '.$user->email, $user, ['type' => 'users', 'role' => $user->role, 'status' => $user->status]);
        \App\Support\NotificationService::userCreated($user, $request->user()->id);

        return redirect()->route('admin.users.index')->with('success', 'تمت إضافة المستخدم «'.$user->name.'».');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $me = $request->user();
        if (! $this->canManage($me, $user)) {
            return $this->denyManage();
        }
        $allowed = array_keys($this->roleOptions($me));
        $allowed[] = $user->role; // an unchanged (even disabled) role stays valid
        $data = $this->validateOrBack($request, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:filter', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in(array_unique($allowed))],
        ], ['mode' => 'edit', 'id' => $user->id]);
        if ($data instanceof RedirectResponse) {
            return $data;
        }

        $newStatus = $request->boolean('active') ? 'active' : ($user->status === 'invited' ? 'invited' : 'disabled');
        $newRole = $data['role'];

        if ($me->id === $user->id) {
            if ($newRole !== $user->role) {
                return $this->failBack('لا يمكنك تغيير دورك بنفسك.', ['mode' => 'edit', 'id' => $user->id]);
            }
            if ($newStatus !== 'active') {
                return $this->failBack('لا يمكنك تعطيل حسابك بنفسك.', ['mode' => 'edit', 'id' => $user->id]);
            }
        }
        if ($this->wouldLoseLastAdmin($user, $newRole, $newStatus)) {
            return $this->failBack('لا يمكن تنفيذ ذلك: يجب أن يبقى مدير واحد مفعّل على الأقل.', ['mode' => 'edit', 'id' => $user->id]);
        }

        $before = $user->only(['name', 'email', 'role', 'status']);
        $user->name = trim($data['name']);
        $user->email = mb_strtolower(trim($data['email']));
        $user->role = $newRole;
        $user->status = $newStatus;
        $user->save();

        Audit::log('user.update', 'تعديل مستخدم: '.$user->email, $user, ['type' => 'users', 'before' => $before, 'after' => $user->only(['name', 'email', 'role', 'status'])]);

        return redirect()->back()->with('success', 'تم حفظ تعديلات «'.$user->name.'».');
    }

    public function toggle(Request $request, User $user): RedirectResponse
    {
        $me = $request->user();
        if (! $this->canManage($me, $user)) {
            return $this->denyManage();
        }
        $enable = $user->status !== 'active';

        if (! $enable) {
            if ($me->id === $user->id) {
                return redirect()->back()->with('error', 'لا يمكنك تعطيل حسابك بنفسك.');
            }
            if ($this->wouldLoseLastAdmin($user, $user->role, 'disabled')) {
                return redirect()->back()->with('error', 'لا يمكن تعطيل آخر مدير مفعّل.');
            }
        }

        $user->status = $enable ? 'active' : 'disabled';
        $user->save();

        Audit::log($enable ? 'user.enable' : 'user.disable', ($enable ? 'تفعيل' : 'تعطيل').' مستخدم: '.$user->email, $user, ['type' => 'users']);

        return redirect()->back()->with('success', $enable ? 'تم تفعيل الحساب.' : 'تم تعطيل الحساب.');
    }

    public function password(Request $request, User $user): RedirectResponse
    {
        if (! $this->canManage($request->user(), $user)) {
            return $this->denyManage();
        }
        $data = $this->validateOrBack($request, [
            'password' => ['required', 'confirmed', $this->passwordRule()],
        ], ['mode' => 'password', 'id' => $user->id]);
        if ($data instanceof RedirectResponse) {
            return $data;
        }

        $user->password = $data['password'];
        $user->setRememberToken(\Illuminate\Support\Str::random(60)); // invalidates "remember me" cookies
        $user->save();
        // all sessions of that user end (when an admin resets his OWN password the current browser is kept)
        $out = \App\Support\UserSessions::revokeOthers((int) $user->id, (int) $request->user()->id === (int) $user->id ? $request->session()->getId() : null);

        Audit::log('user.password_reset', 'إعادة تعيين كلمة مرور: '.$user->email, $user, ['type' => 'users', 'sessions_closed' => $out]);

        return redirect()->back()->with('success', 'تم تعيين كلمة مرور جديدة للمستخدم «'.$user->name.'»'.($out > 0 ? ' وأُنهيت جلساته المفتوحة.' : '.'));
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if (! $this->canManage($request->user(), $user)) {
            return $this->denyManage();
        }
        if ($request->user()->id === $user->id) {
            return redirect()->back()->with('error', 'لا يمكنك حذف حسابك بنفسك.');
        }
        if ($this->wouldLoseLastAdmin($user, null, 'deleted')) {
            return redirect()->back()->with('error', 'لا يمكن حذف آخر مدير مفعّل.');
        }

        $email = $user->email;
        $name = $user->name;
        $user->delete(); // soft delete (deleted_at)

        Audit::log('user.delete', 'حذف مستخدم: '.$email, $user, ['type' => 'users']);

        return redirect()->route('admin.users.index')->with('success', 'تم حذف المستخدم «'.$name.'».');
    }

    // ---------------------------------------------------------------

    /**
     * Roles the acting user may hand out: active roles; non-super users only roles whose permissions
     * are a subset of their own and never the super role.
     *
     * @return array<string,string> role_key => Arabic name
     */
    private function roleOptions(User $actor): array
    {
        $out = [];
        $mine = $actor->permissionKeys();
        foreach (Role::query()->active()->ordered()->get() as $r) {
            if (! $actor->isSuperAdmin()) {
                if ($r->isSuper()) {
                    continue;
                }
                if (array_diff($r->permissionKeys(), $mine)) {
                    continue;
                }
            }
            $out[$r->role_key] = $r->name_ar;
        }

        return $out;
    }

    /** A non-super user may not touch the super admin or users whose role is above their own. */
    private function canManage(User $actor, User $target): bool
    {
        if ($actor->isSuperAdmin() || $actor->id === $target->id) {
            return true;
        }
        if ($target->isSuperAdmin()) {
            return false;
        }

        return ! array_diff($target->permissionKeys(), $actor->permissionKeys());
    }

    private function denyManage(): RedirectResponse
    {
        return redirect()->back()->with('error', 'لا يمكنك تعديل هذا المستخدم لأن دوره أعلى من دورك.');
    }

    private function passwordRule(): Password
    {
        return Password::min(8)->letters()->numbers();
    }

    /** True when the change would leave no active admin among the non-deleted users. */
    private function wouldLoseLastAdmin(User $user, ?string $newRole, string $newStatus): bool
    {
        $isActiveAdminNow = $user->role === 'admin' && $user->status === 'active';
        $staysActiveAdmin = $newRole === 'admin' && $newStatus === 'active';
        if (! $isActiveAdminNow || $staysActiveAdmin) {
            return false;
        }

        return User::where('role', 'admin')->where('status', 'active')->where('id', '!=', $user->id)->doesntExist();
    }

    /** @return array|RedirectResponse validated data, or a redirect back that re-opens the drawer */
    private function validateOrBack(Request $request, array $rules, array $formState)
    {
        $validator = Validator::make($request->all(), $rules, $this->messages(), $this->attributes());
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput($request->except(['password', 'password_confirmation']))
                ->with('user_form', $formState);
        }

        return $validator->validated();
    }

    private function failBack(string $message, array $formState): RedirectResponse
    {
        return redirect()->back()
            ->withErrors(['form' => $message])
            ->withInput(request()->except(['password', 'password_confirmation']))
            ->with('user_form', $formState);
    }

    private function messages(): array
    {
        return [
            'required' => 'حقل :attribute مطلوب.',
            'email' => 'صيغة البريد الإلكتروني غير صحيحة.',
            'max' => 'حقل :attribute يجب ألا يزيد عن :max حرفاً.',
            'unique' => 'هذا البريد الإلكتروني مسجّل مسبقاً (قد يعود لحساب محذوف).',
            'in' => 'القيمة المختارة في حقل :attribute غير صالحة أو لا يمكنك تعيينها.',
            'confirmed' => 'تأكيد كلمة المرور غير مطابق.',
            'password.min' => 'كلمة المرور يجب ألا تقل عن :min أحرف.',
            'password.letters' => 'كلمة المرور يجب أن تحتوي على حرف واحد على الأقل.',
            'password.numbers' => 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل.',
        ];
    }

    private function attributes(): array
    {
        return ['name' => 'الاسم', 'email' => 'البريد الإلكتروني', 'role' => 'الدور', 'password' => 'كلمة المرور'];
    }
}
