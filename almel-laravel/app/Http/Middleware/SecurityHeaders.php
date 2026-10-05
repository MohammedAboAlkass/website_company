<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Global middleware (bootstrap/app.php): security headers on EVERY response (public site, admin, JSON, errors).
 * The CSP is deliberately permissive for what the site really uses (inline scripts / styles, self-hosted assets,
 * data: / blob: images, YouTube / Vimeo embeds in editor content) and strict where it costs nothing
 * (frame-ancestors, object-src, base-uri, form-action). HSTS is sent only on HTTPS requests.
 * Headers already set by a controller are never overwritten.
 */
class SecurityHeaders
{
    public const CSP = "default-src 'self'; "
        ."script-src 'self' 'unsafe-inline'; "
        ."style-src 'self' 'unsafe-inline'; "
        ."img-src 'self' data: blob: https:; "
        ."media-src 'self' data: blob:; "
        ."font-src 'self' data:; "
        ."connect-src 'self'; "
        ."frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com; "
        ."frame-ancestors 'self'; "
        ."object-src 'none'; "
        ."base-uri 'self'; "
        ."form-action 'self'";

    public function handle(Request $request, Closure $next): Response
    {
        // Secure session cookie automatically on HTTPS requests (SESSION_SECURE_COOKIE in .env still wins when it is set).
        if (config('session.secure') === null && $request->isSecure()) {
            config(['session.secure' => true]);
        }

        $response = $next($request);

        if (function_exists('header_remove')) {
            @header_remove('X-Powered-By');
        }
        $h = $response->headers;
        $h->remove('X-Powered-By');
        $set = function (string $name, string $value) use ($h): void {
            if (! $h->has($name)) {
                $h->set($name, $value);
            }
        };
        $set('X-Frame-Options', 'SAMEORIGIN');
        $set('X-Content-Type-Options', 'nosniff');
        $set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
        if (! $request->is('up')) { // Laravel's built-in health page loads a CDN stylesheet / script of its own
            $csp = self::CSP;
            if ($request->attributes->get('csp_analytics')) { // Google Analytics is on (settings seo.analytics_id): allow its script + beacons only then
                $csp = str_replace(["script-src 'self' 'unsafe-inline'", "connect-src 'self'"], ["script-src 'self' 'unsafe-inline' https://www.googletagmanager.com", "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com"], $csp);
            }
            $frames = $request->attributes->get('csp_frames'); // an embedded map (settings site.texts) was rendered: allow that one origin as a frame
            if (is_array($frames) && $frames) {
                $csp = str_replace("frame-src 'self'", "frame-src 'self' ".implode(' ', array_filter($frames, fn ($f) => is_string($f) && preg_match('#^https://[a-z0-9.-]+$#i', $f))), $csp);
            }
            $set('Content-Security-Policy', $csp);
        }
        if ($request->isSecure()) {
            $set('Strict-Transport-Security', 'max-age=31536000');
        }

        return $response;
    }
}
