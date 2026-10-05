<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Alias 'admin.access'. Must run after 'auth'.
 *  - signed out when the account is disabled/deleted or when its role is switched off
 *  - 403 when the role holds no permission at all (cannot use the control panel)
 *  - legacy: 'admin.access:admin' = super admin only (role key `admin`)
 * What each page/endpoint needs is decided by the 'perm' middleware (App\Http\Middleware\EnforcePermission).
 */
class AdminAccess
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->guest(route('admin.login'));
        }

        if (! $user->isActive()) {
            return $this->signOut($request, 'هذا الحساب غير مفعّل. تواصل مع مدير النظام.');
        }
        if (! $user->roleIsActive()) {
            return $this->signOut($request, 'تم تعطيل دور هذا الحساب. تواصل مع مدير النظام.');
        }

        if ($roles) {
            if (! in_array($user->role, $roles, true)) {
                abort(403, 'هذه الصفحة متاحة لمدير النظام فقط.');
            }
        } elseif (! $user->canAccessAdmin()) {
            abort(403, 'ليس لدور حسابك أي صلاحية على لوحة التحكم.');
        }

        return $next($request);
    }

    private function signOut(Request $request, string $message): Response
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json(['message' => $message], 401);
        }

        return redirect()->route('admin.login')->withErrors(['email' => $message]);
    }
}
