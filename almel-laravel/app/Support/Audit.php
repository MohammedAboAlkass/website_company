<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Writes a row to `audit_logs`; never throws (auditing must not break the request).
 *
 * Every call site passes: an action key (module.verb), a readable Arabic description, the affected model (optional)
 * and extra context. Besides that this class
 *  - records WHAT changed when the subject is a model that was just saved / created / deleted: properties.changes = { field: {old, new} },
 *  - stores a readable label of the subject (survives deletion),
 *  - redacts anything that looks like a password / token / secret, at every depth (never written, never shown).
 */
class Audit
{
    public const REDACTED = '[مخفي]';

    /** Field names whose value must never be stored. */
    private const SENSITIVE = '/pass(word|wd|code)|(^|[_.\-])pass($|[_.\-])|pwd|secret|token|api[_\-]?key|authorization|cookie|csrf|remember|otp|two[_\-]?fa|recovery|private[_\-]?key|credential/i';

    /** Fields never listed in a change set. */
    private const SKIP = ['id', 'created_at', 'updated_at', 'remember_token', 'password'];

    public static function log(string $action, string $description, ?Model $subject = null, array $properties = [], ?int $userId = null): void
    {
        try {
            $request = request();
            $props = self::redact($properties);
            if ($subject && ! isset($props['changes']) && ! str_starts_with($action, 'auth.')) {
                $changes = self::changesOf($subject);
                if ($changes) {
                    $props['changes'] = $changes;
                }
            }
            $row = [
                'user_id' => $userId ?? Auth::id(),
                'action' => mb_substr($action, 0, 50),
                'subject_type' => $subject ? get_class($subject) : null,
                'subject_id' => $subject?->getKey(),
                'description' => mb_substr($description, 0, 500),
                'properties' => $props ?: null,
                'ip_address' => $request?->ip(),
                'user_agent' => $request ? mb_substr((string) $request->userAgent(), 0, 255) : null,
            ];
            $label = self::labelOf($subject);
            try {
                AuditLog::create($row + ['subject_label' => $label]);
            } catch (\Throwable $e) {
                // e.g. the subject_label column is not migrated yet, or a value that cannot be encoded: keep the entry anyway
                AuditLog::create($row);
            }
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /** Recursively replaces the values of sensitive keys and scrubs invalid UTF-8. Safe to call on anything stored or shown. */
    public static function redact(mixed $data, int $depth = 0): mixed
    {
        if (is_array($data)) {
            if ($depth > 6) {
                return self::REDACTED;
            }
            $out = [];
            foreach ($data as $k => $v) {
                $out[$k] = (is_string($k) && preg_match(self::SENSITIVE, $k)) ? self::REDACTED : self::redact($v, $depth + 1);
            }

            return $out;
        }
        if (is_string($data)) {
            return function_exists('mb_scrub') ? mb_scrub($data, 'UTF-8') : $data;
        }
        if (is_scalar($data) || $data === null) {
            return $data;
        }
        if ($data instanceof \DateTimeInterface) {
            return $data->format('Y-m-d H:i:s');
        }
        if ($data instanceof \JsonSerializable || $data instanceof \Stringable) {
            return self::redact(is_object($data) && $data instanceof \JsonSerializable ? $data->jsonSerialize() : (string) $data, $depth + 1);
        }

        return null;
    }

    /** { field: {old, new} } of the save / create / delete that just happened to $m (empty when nothing is known). */
    public static function changesOf(Model $m): array
    {
        try {
            $hidden = $m->getHidden();
            $out = [];
            if ($m->wasRecentlyCreated) {
                foreach ($m->getAttributes() as $k => $v) {
                    if (! self::tracked($k, $hidden) || $v === null || $v === '') {
                        continue;
                    }
                    $out[$k] = ['old' => null, 'new' => self::value($k, $v)];
                }
            } elseif ($m->wasChanged()) {
                $prev = method_exists($m, 'getPrevious') ? $m->getPrevious() : [];
                foreach ($m->getChanges() as $k => $v) {
                    if (! self::tracked($k, $hidden)) {
                        continue;
                    }
                    $out[$k] = ['old' => array_key_exists($k, $prev) ? self::value($k, $prev[$k]) : null, 'new' => self::value($k, $v)];
                }
            } elseif (! $m->exists) { // deleted
                foreach ($m->getAttributes() as $k => $v) {
                    if (! self::tracked($k, $hidden) || $v === null || $v === '') {
                        continue;
                    }
                    $out[$k] = ['old' => self::value($k, $v), 'new' => null];
                }
            }

            return array_slice($out, 0, 30, true);
        } catch (\Throwable $e) {
            return [];
        }
    }

    private static function tracked(string $key, array $hidden): bool
    {
        return ! in_array($key, self::SKIP, true) && ! in_array($key, $hidden, true);
    }

    private static function value(string $key, mixed $v): mixed
    {
        if (preg_match(self::SENSITIVE, $key)) {
            return self::REDACTED;
        }
        if ($v instanceof \DateTimeInterface) {
            return $v->format('Y-m-d H:i:s');
        }
        if (is_array($v) || is_object($v)) {
            $v = json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '';
        }
        if (is_string($v)) {
            $v = self::redactText(function_exists('mb_scrub') ? mb_scrub($v, 'UTF-8') : $v);
            $len = mb_strlen($v);
            if ($len > 300) {
                return mb_substr($v, 0, 120).'… ('.$len.' حرف)';
            }
        }

        return $v;
    }

    /** JSON strings stored in a column can hold sensitive keys too: {"api_key":"x"} */
    private static function redactText(string $s): string
    {
        if ($s !== '' && ($s[0] === '{' || $s[0] === '[')) {
            $d = json_decode($s, true);
            if (is_array($d)) {
                return json_encode(self::redact($d), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: $s;
            }
        }

        return $s;
    }

    /** A readable name for the affected record. */
    public static function labelOf(?Model $m): ?string
    {
        if (! $m) {
            return null;
        }
        foreach (['title', 'name', 'person_name', 'label', 'name_ar', 'question', 'email', 'original_name', 'slug', 'role_key'] as $f) {
            $v = $m->getAttribute($f);
            if (is_string($v) && trim($v) !== '') {
                return mb_substr(trim(preg_replace('/\s+/u', ' ', $v)), 0, 255);
            }
        }

        return null;
    }
}
