<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Global middleware: a forged Host header (used for poisoned links / password-reset URLs) gets 400.
 * Allowed: localhost, 127.0.0.1, [::1], *.localhost, the host of APP_URL (with / without "www."),
 * hosts listed in APP_TRUSTED_HOSTS (comma separated, "*.example.org" allowed), and - only while APP_ENV=local -
 * private LAN IPv4 addresses (phone testing on the same Wi-Fi).
 * (Laravel's own TrustHosts is skipped when APP_ENV=local, so it cannot be used here.)
 */
class EnsureTrustedHost
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $host = strtolower($request->getHost());
        } catch (\Throwable $e) {
            return $this->deny();
        }
        if (! $this->allowed($host)) {
            return $this->deny();
        }

        return $next($request);
    }

    private function allowed(string $host): bool
    {
        if ($host === '') {
            return false;
        }
        if (in_array($host, ['localhost', '127.0.0.1', '[::1]'], true) || str_ends_with($host, '.localhost')) {
            return true;
        }
        $appHost = strtolower((string) parse_url((string) config('app.url'), PHP_URL_HOST));
        if ($appHost !== '') {
            $bare = preg_replace('/^www\./', '', $appHost);
            if ($host === $appHost || $host === $bare || $host === 'www.'.$bare) {
                return true;
            }
        }
        foreach (array_filter(array_map('trim', explode(',', strtolower((string) env('APP_TRUSTED_HOSTS', ''))))) as $p) {
            if ($p === $host || (str_starts_with($p, '*.') && str_ends_with($host, substr($p, 1)))) {
                return true;
            }
        }
        if (app()->environment('local') && preg_match('/^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/', $host)) {
            return true;
        }

        return false;
    }

    private function deny(): Response
    {
        return response('طلب غير صالح: عنوان الموقع (Host) غير موثوق.', 400, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
