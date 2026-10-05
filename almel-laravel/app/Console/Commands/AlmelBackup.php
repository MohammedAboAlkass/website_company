<?php

namespace App\Console\Commands;

use App\Models\BackupRun;
use App\Support\BackupService;
use Illuminate\Console\Command;

/** php artisan almel:backup [--groups=content,settings] [--keep=10]  (schedule it from Task Scheduler / cron) */
class AlmelBackup extends Command
{
    protected $signature = 'almel:backup {--groups=content,settings : comma separated: content,settings,messages,access} {--keep=10 : scheduled backups to keep}';

    protected $description = 'Create a database backup file in storage/app/backups (kind = scheduled)';

    public function handle(): int
    {
        $groups = array_filter(array_map('trim', explode(',', (string) $this->option('groups'))));
        try {
            $run = BackupService::export($groups, 'scheduled', 'نسخة مجدولة', null);
        } catch (\Throwable $e) {
            report($e);
            \App\Support\NotificationService::backupFailed('النسخة المجدولة: '.$e->getMessage());
            $this->error('Backup failed: '.$e->getMessage());

            return self::FAILURE;
        }
        \App\Support\NotificationService::backupDone((string) $run->filename, (int) $run->rows_count);
        $this->info('Backup created: '.$run->filename.' ('.$run->rows_count.' rows)');
        $keep = max(1, (int) $this->option('keep'));
        BackupRun::query()->where('kind', 'scheduled')->orderByDesc('id')->get()->slice($keep)->each(function (BackupRun $r) {
            if ($p = BackupService::pathOf($r)) {
                @unlink($p);
            }
            $r->delete();
        });

        return self::SUCCESS;
    }
}
