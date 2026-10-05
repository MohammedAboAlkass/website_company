<?php

use App\Http\Controllers\Admin\HeroController;
use Illuminate\Support\Facades\Route;

// «إعدادات الهيرو» - included from routes/admin.php inside the auth + admin.access + perm group.
// Route names hero.* map to the `homepage` module (config/permissions.php): GET = homepage.view, PUT = homepage.edit.
Route::get('hero', [HeroController::class, 'index'])->name('hero');
Route::get('hero/data', [HeroController::class, 'data'])->name('hero.data');
Route::put('hero', [HeroController::class, 'save'])->name('hero.save');
