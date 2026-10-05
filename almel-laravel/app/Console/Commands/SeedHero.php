<?php

namespace App\Console\Commands;

use App\Support\HeroSupport;
use Illuminate\Console\Command;

/** php artisan hero:seed [--force]  — default hero settings + one slide equal to the original homepage hero. */
class SeedHero extends Command
{
    protected $signature = 'hero:seed {--force : delete the existing slides first}';

    protected $description = 'Seed the homepage hero (settings + the original slide) when the tables are empty';

    public function handle(): int
    {
        if (! HeroSupport::tablesExist()) {
            $this->error('hero_settings / hero_slides tables are missing (run database/sql/hero.sql).');

            return self::FAILURE;
        }
        $n = HeroSupport::seed((bool) $this->option('force'));
        $this->info($n ? 'Seeded '.$n.' hero slide.' : 'Hero slides already exist (use --force to reseed).');

        return self::SUCCESS;
    }
}
