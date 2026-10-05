<?php

use App\Http\Controllers\Admin\SiteTextsController;
use Illuminate\Support\Facades\Route;

// «نصوص الموقع» (ركائز الإغاثة، المشاريع والبرامج، من نحن، نموذج التواصل والخريطة) - included from routes/admin.php
// inside the auth + admin.access + perm group. Route names site-texts.* map to the `pages` module (config/permissions.php):
// GET = pages.view, PUT save / reset = pages.edit, POST image = pages.create or pages.edit.
Route::get('site-texts', [SiteTextsController::class, 'index'])->name('site-texts');
Route::get('site-texts/data', [SiteTextsController::class, 'data'])->name('site-texts.data');
Route::put('site-texts', [SiteTextsController::class, 'save'])->name('site-texts.save');
Route::put('site-texts/reset', [SiteTextsController::class, 'reset'])->name('site-texts.reset');
Route::post('site-texts/image', [SiteTextsController::class, 'image'])->name('site-texts.image');
