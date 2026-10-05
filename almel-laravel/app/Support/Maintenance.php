<?php

namespace App\Support;

use App\Models\Setting;
use Carbon\Carbon;

/**
 * Maintenance mode of the PUBLIC site. Stored in the `settings` table:
 *   site.maintenance (bool), site.maintenance_message (text)   <- same keys the general settings tab already saves
 *   site.maintenance_ips (text, one IP / CIDR per line), site.maintenance_from / site.maintenance_until ('Y-m-d H:i', app timezone)
 * Active = enabled AND (no start or now >= start) AND (no end or now < end), so an end time switches the mode off by itself.
 */
class Maintenance
{
    public const KEYS = [
        'enabled' => ['site.maintenance', 'bool', 1],
        'message' => ['site.maintenance_message', 'text', 1],
        'ips' => ['site.maintenance_ips', 'text', 0],
        'from' => ['site.maintenance_from', 'string', 0],
        'until' => ['site.maintenance_until', 'string', 0],
    ];

    public const DEFAULT_MESSAGE = 'نجري تحديثات لتحسين تجربتك، وسنعود خلال وقت قصير. شكراً لصبركم.';

    /** @return array{enabled:bool,message:string,ips:string[],from:?string,until:?string} */
    public static function load(): array
    {
        $rows = Setting::query()->whereIn('key', array_column(self::KEYS, 0))->pluck('value', 'key');
        $get = fn (string $f) => $rows[self::KEYS[$f][0]] ?? null;
        $msg = trim((string) $get('message'));

        return [
            'enabled' => filter_var($get('enabled'), FILTER_VALIDATE_BOOLEAN),
            'message' => $msg !== '' ? $msg : self::DEFAULT_MESSAGE,
            'ips' => self::parseIps((string) $get('ips')),
            'from' => self::normDate($get('from')),
            'until' => self::normDate($get('until')),
        ];
    }

    public static function normDate(mixed $v): ?string
    {
        $v = trim((string) $v);
        if ($v === '') {
            return null;
        }
        try {
            return Carbon::parse(str_replace('T', ' ', $v), config('app.timezone'))->format('Y-m-d H:i');
        } catch (\Throwable $e) {
            return null;
        }
    }

    private static function at(?string $v): ?Carbon
    {
        return $v ? Carbon::createFromFormat('Y-m-d H:i', $v, config('app.timezone')) : null;
    }

    /** off | scheduled (enabled, window not started) | active | expired (enabled, window over) */
    public static function status(array $c, ?Carbon $now = null): string
    {
        if (empty($c['enabled'])) {
            return 'off';
        }
        $now = $now ?: Carbon::now(config('app.timezone'));
        $from = self::at($c['from'] ?? null);
        $until = self::at($c['until'] ?? null);
        if ($from && $now->lt($from)) {
            return 'scheduled';
        }
        if ($until && $now->gte($until)) {
            return 'expired';
        }

        return 'active';
    }

    public static function isActive(array $c, ?Carbon $now = null): bool
    {
        return self::status($c, $now) === 'active';
    }

    /** Seconds until the planned end (for Retry-After); 3600 when unknown. */
    public static function retryAfter(array $c): int
    {
        $until = self::at($c['until'] ?? null);
        if ($until) {
            $s = Carbon::now(config('app.timezone'))->diffInSeconds($until, false);

            return (int) max(60, min(86400, $s));
        }

        return 3600;
    }

    /** @return string[] */
    public static function parseIps(string $text): array
    {
        $out = [];
        foreach (preg_split('/[\s,;]+/u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [] as $p) {
            if (self::validIp($p)) {
                $out[] = $p;
            }
        }

        return array_values(array_unique($out));
    }

    public static function validIp(string $s): bool
    {
        if (str_contains($s, '/')) {
            [$ip, $bits] = explode('/', $s, 2);
            $max = filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? 128 : 32;

            return filter_var($ip, FILTER_VALIDATE_IP) !== false && ctype_digit($bits) && (int) $bits <= $max;
        }

        return filter_var($s, FILTER_VALIDATE_IP) !== false;
    }

    public static function ipAllowed(?string $ip, array $list): bool
    {
        if (! $ip || ! $list) {
            return false;
        }
        $bin = @inet_pton($ip);
        if ($bin === false) {
            return false;
        }
        foreach ($list as $entry) {
            $bits = null;
            if (str_contains($entry, '/')) {
                [$entry, $bits] = explode('/', $entry, 2);
                $bits = (int) $bits;
            }
            $eb = @inet_pton($entry);
            if ($eb === false || strlen($eb) !== strlen($bin)) {
                continue;
            }
            if ($bits === null) {
                if ($eb === $bin) {
                    return true;
                }
                continue;
            }
            $bytes = intdiv($bits, 8);
            $rem = $bits % 8;
            if ($bytes && substr($bin, 0, $bytes) !== substr($eb, 0, $bytes)) {
                continue;
            }
            if ($rem) {
                $mask = (0xFF << (8 - $rem)) & 0xFF;
                if ((ord($bin[$bytes]) & $mask) !== (ord($eb[$bytes]) & $mask)) {
                    continue;
                }
            }

            return true;
        }

        return false;
    }

    public static function save(array $d): void
    {
        $label = ['enabled' => 'Maintenance mode', 'message' => 'Maintenance message', 'ips' => 'Maintenance allowed IPs', 'from' => 'Maintenance starts', 'until' => 'Maintenance ends'];
        foreach (self::KEYS as $f => [$key, $type, $public]) {
            if (! array_key_exists($f, $d)) {
                continue;
            }
            $val = $f === 'ips' ? implode("\n", (array) $d[$f]) : $d[$f];
            SettingsStore::put($key, $val, $type, 'general', $public, $label[$f]);
        }
    }

    /** What the admin maintenance page / the public page may show. */
    public static function publicInfo(array $c): array
    {
        $email = Setting::query()->where('key', 'contact.email')->value('value');

        return [
            'message' => $c['message'],
            'until' => $c['until'] ? self::at($c['until'])->toIso8601String() : null,
            'email' => $email ?: null,
        ];
    }
}
