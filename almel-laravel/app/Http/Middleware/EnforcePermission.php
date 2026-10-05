<?php

namespace App\Http\Middleware;

use App\Support\Permissions;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Aliases 'perm' / 'can.perm'. Must run after 'auth' + 'admin.access'.
 *   ->middleware('perm')                         automatic: route name + HTTP method -> module.action (see App\Support\Permissions)
 *   ->middleware('perm:news.view')               exactly this permission
 *   ->middleware('perm:news.create|news.edit')   any of these ('|')
 *   ->middleware('perm:users.edit,roles.edit')   all of these (several arguments)
 * The super admin (role key `admin`) always passes. Unknown/unnamed routes in the admin area are super-admin only.
 */
class EnforcePermission
{
    public function handle(Request $request, Closure $next, string ...$perms): Response
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->guest(route('admin.login'));
        }
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if ($perms) {
            $need = ['all' => [], 'any' => []];
            foreach ($perms as $p) {
                if (str_contains($p, '|')) {
                    $need['any'] = array_merge($need['any'], explode('|', $p));
                } else {
                    $need['all'][] = $p;
                }
            }
        } else {
            $need = Permissions::required($request);
        }

        if (! empty($need['free'])) {
            return $next($request);
        }
        if (! empty($need['super'])) {
            abort(403, 'هذه الصفحة متاحة لمدير النظام فقط.');
        }
        foreach ((array) ($need['all'] ?? []) as $p) {
            if (! $user->hasPermission($p)) {
                abort(403, 'ليس لديك صلاحية تنفيذ هذا الإجراء ('.$p.').');
            }
        }
        $any = (array) ($need['any'] ?? []);
        if ($any && ! $user->hasAnyPermission($any)) {
            abort(403, 'ليس لديك صلاحية تنفيذ هذا الإجراء ('.implode(' أو ', $any).').');
        }

        return $next($request);
    }
}
