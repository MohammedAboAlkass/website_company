<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Support\Audit;
use Illuminate\Console\Command;

/** php artisan almel:audit-purge [--days=365] [--dry-run]  - retention: removes audit_logs rows older than N days (the panel itself can never delete entries). */
class AuditPurge extends Command
{
    protected $signature = 'almel:audit-purge {--days=365 : keep entries newer than this many days (minimum 30)} {--dry-run : only count}';

    protected $description = 'Delete audit log entries older than --days (default 365, minimum 30)';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        if ($days < 30) {
            $this->error('--days must be at least 30.');

            return self::FAILURE;
        }
        $cut = now()->subDays($days);
        $q = AuditLog::query()->where('created_at', '<', $cut);
        $n = (clone $q)->count();
        if ($this->option('dry-run')) {
            $this->info($n.' entr'.($n === 1 ? 'y' : 'ies').' older than '.$cut->format('Y-m-d').' would be deleted.');

            return self::SUCCESS;
        }
        $deleted = 0;
        do {
            $batch = (clone $q)->limit(1000)->delete();
            $deleted += $batch;
        } while ($batch > 0);
        $this->info($deleted.' entr'.($deleted === 1 ? 'y' : 'ies').' deleted (older than '.$cut->format('Y-m-d').').');
        if ($deleted > 0) {
            Audit::log('audit.purge', 'حذف '.$deleted.' سجلاً أقدم من '.$days.' يوماً (أمر الصيانة)', null, ['type' => 'security', 'days' => $days, 'deleted' => $deleted], null);
        }

        return self::SUCCESS;
    }
}
