<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Global middleware: list / filter pages read these query parameters as plain strings. A crafted "?q[]=x" makes
 * `(string) $array` fail (500), so any of them that arrives as an array is reduced to its first scalar value.
 */
class ScalarQuery
{
    private const KEYS = ['q', 'search', 'status', 'type', 'role', 'category', 'album', 'program', 'per', 'page', 'box', 'f', 'id', 'range', 'sort', 'dir', 'order', 'from', 'to', 'kind', 'tag', 'lang'];

    public function handle(Request $request, Closure $next): Response
    {
        $all = $request->query->all(); // all() never throws for array values (get() does)
        foreach (self::KEYS as $k) {
            $v = $all[$k] ?? null;
            if (is_array($v)) {
                $first = '';
                array_walk_recursive($v, function ($x) use (&$first) {
                    if ($first === '' && is_scalar($x)) {
                        $first = (string) $x;
                    }
                });
                $request->query->set($k, $first);
            }
        }

        return $next($request);
    }
}
