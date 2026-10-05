<?php

namespace App\Support;

/**
 * One sanitizer for every CSV export (reports, newsletter, ...): a text cell that starts with = + - @ TAB or CR
 * is prefixed with a single quote so Excel / Sheets never evaluate it as a formula (CSV injection).
 * Numbers (int / float) are written as they are.
 */
class Csv
{
    public static function cell(mixed $v): mixed
    {
        if ($v === null) {
            return '';
        }
        if (is_bool($v)) {
            return $v ? '1' : '0';
        }
        if (is_int($v) || is_float($v)) {
            return $v;
        }
        $s = (string) $v;
        if ($s !== '' && preg_match('/^[=+\-@\t\r]/', $s)) {
            return "'".$s;
        }

        return $s;
    }

    public static function row(array $cells): array
    {
        return array_map([self::class, 'cell'], array_values($cells));
    }

    /** fputcsv() with every cell sanitized. @param resource $handle */
    public static function put($handle, array $cells): int|false
    {
        return fputcsv($handle, self::row($cells));
    }
}
