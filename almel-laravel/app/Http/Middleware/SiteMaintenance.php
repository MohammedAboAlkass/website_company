<?php

namespace App\Http\Middleware;

use App\Support\Maintenance;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Appended to the `web` group (bootstrap/app.php). While maintenance mode is active the PUBLIC site answers 503 with an Arabic page.
 * Never blocked: /admin/* (login + control panel), /up, assets, signed-in panel users, allow-listed IPs.
 * Fails open: if the settings cannot be read the site stays online.
 */
class SiteMaintenance
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('admin', 'admin/*', 'up', 'assets/*', 'storage/*', 'build/*')) {
            return $next($request);
        }
        try {
            $c = Maintenance::load();
            if (! Maintenance::isActive($c)) {
                return $next($request);
            }
            if (Maintenance::ipAllowed($request->ip(), $c['ips'])) {
                return $next($request);
            }
            $u = $request->user();
            if ($u && $u->isActive() && $u->roleIsActive() && $u->canAccessAdmin()) {
                return $next($request);
            }
        } catch (\Throwable $e) {
            report($e);

            return $next($request);
        }

        $headers = ['Retry-After' => (string) Maintenance::retryAfter($c), 'Cache-Control' => 'no-store, max-age=0'];
        $info = Maintenance::publicInfo($c);
        if ($request->expectsJson()) {
            return response()->json(['message' => $info['message'], 'maintenance' => true], 503, $headers);
        }

        return response()->view('site.maintenance', ['info' => $info], 503)->withHeaders($headers);
    }
}
