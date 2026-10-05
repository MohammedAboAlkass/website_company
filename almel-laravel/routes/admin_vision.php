<?php

use App\Http\Controllers\Admin\VisionController;
use Illuminate\Support\Facades\Route;

// «الرؤية والرسالة والقيم» - included from routes/admin.php inside the auth + admin.access + perm group.
// Route names vision.* map to the `vision` module (config/permissions.php): GET = vision.view, PUT / POST image = vision.edit.
Route::get('vision', [VisionController::class, 'index'])->name('vision');
Route::get('vision/data', [VisionController::class, 'data'])->name('vision.data');
Route::put('vision', [VisionController::class, 'save'])->name('vision.save');
Route::post('vision/image', [VisionController::class, 'image'])->name('vision.image');
