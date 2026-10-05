<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Table `hero_settings` (single row, id = 1) */
class HeroSetting extends Model
{
    protected $table = 'hero_settings';

    public $incrementing = false;

    protected $fillable = ['id', 'config', 'updated_by'];

    protected $casts = ['config' => 'array'];
}
