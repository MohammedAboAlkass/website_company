<?php

use App\Http\Controllers\Admin\HomepageController;
use Illuminate\Support\Facades\Route;

// «الصفحة الرئيسية» - included from routes/admin.php inside the auth + admin.access + perm group.
// Route names homepage.* map to the `homepage` module (config/permissions.php): GET = homepage.view, PUT / DELETE = homepage.edit.
Route::get('homepage', [HomepageController::class, 'index'])->name('homepage');
Route::get('homepage/data', [HomepageController::class, 'data'])->name('homepage.data');
Route::put('homepage', [HomepageController::class, 'save'])->name('homepage.save');
Route::delete('homepage', [HomepageController::class, 'reset'])->name('homepage.reset');
