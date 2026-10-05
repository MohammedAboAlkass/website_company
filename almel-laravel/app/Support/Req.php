<?php

namespace App\Support;

use Illuminate\Http\Request;

/** Safe scalar readers for query / input values (an array such as ?q[]=x must never reach `(string)`). */
class Req
{
    public static function str(Request $request, string $key, string $default = ''): string
    {
        $v = $request->query($key, $default);
        if (is_array($v)) {
            $arr = $v;
            $v = '';
            array_walk_recursive($arr, function ($x) use (&$v) {
                if ($v === '' && is_scalar($x)) {
                    $v = (string) $x;
                }
            });
        }

        return is_scalar($v) || $v === null ? (string) $v : $default;
    }

    public static function int(Request $request, string $key, int $default = 0): int
    {
        $v = self::str($request, $key, (string) $default);

        return preg_match('/^-?\d{1,9}$/', $v) ? (int) $v : $default;
    }
}
