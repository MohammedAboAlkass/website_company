<?php

namespace App\Console\Commands;

use App\Support\SettingsStore;
use Illuminate\Console\Command;

class SyncSettings extends Command
{
    protected $signature = 'almel:sync-settings';

    protected $description = 'Insert the default General Settings keys into `settings` when missing (never overwrites existing values)';

    public function handle(): int
    {
        $n = SettingsStore::syncDefaults();
        $this->info("Inserted {$n} missing setting row(s); existing values were not touched.");

        return self::SUCCESS;
    }
}
