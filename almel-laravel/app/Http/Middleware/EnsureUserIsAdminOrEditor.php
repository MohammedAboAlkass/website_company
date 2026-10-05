<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Usage: 'role' (admin or editor) or 'role:admin' (admin only).
 */
class EnsureUserIsAdminOrEditor
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $allowed = $roles ?: ['admin', 'editor'];

        if (! $user || $user->status !== 'active' || ! in_array($user->role, $allowed, true)) {
            abort(403, 'غير مصرح');
        }

        return $next($request);
    }
}
