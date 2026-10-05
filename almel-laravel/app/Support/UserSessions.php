<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/** Sign-out of a user's sessions (table `sessions`, SESSION_DRIVER=database), used after a password change. */
class UserSessions
{
    /** Deletes the user's session rows, except $exceptSessionId (the browser that just changed the password). @return int rows removed */
    public static function revokeOthers(int $userId, ?string $exceptSessionId = null): int
    {
        try {
            $q = DB::table('sessions')->where('user_id', $userId);
            if ($exceptSessionId) {
                $q->where('id', '!=', $exceptSessionId);
            }

            return (int) $q->delete();
        } catch (\Throwable $e) {
            report($e);

            return 0;
        }
    }
}
