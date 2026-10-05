<?php

use App\Http\Controllers\Admin\BackupController;
use App\Http\Controllers\Admin\MaintenanceController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\SearchController;
use Illuminate\Support\Facades\Route;

// Backup, maintenance mode, quick search, pages and menus (DB backed). Included from routes/admin.php inside the
// auth + admin.access + perm group, BEFORE the generic Route::resource lines. URLs /admin/..., names admin.*.
// Permissions come from the route-name prefix (config/permissions.php route_modules + App\Support\Permissions):
//   backup.* -> backup.view (GET page/data) | backup.manage (everything else, incl. download)
//   maintenance.* -> settings.view / settings.edit      search -> free (results are filtered per permission)
//   pages.* -> pages module      menu / menus.* -> menu module

// النسخ الاحتياطي
Route::get('backup', [BackupController::class, 'index'])->name('backup.index');
Route::get('backup/data', [BackupController::class, 'data'])->name('backup.data');
Route::post('backup/export', [BackupController::class, 'export'])->name('backup.export');
Route::get('backup/download/{run}', [BackupController::class, 'download'])->whereNumber('run')->name('backup.download');
Route::post('backup/inspect', [BackupController::class, 'inspect'])->name('backup.inspect');
Route::post('backup/restore', [BackupController::class, 'restore'])->name('backup.restore');
Route::delete('backup/{run}', [BackupController::class, 'destroy'])->whereNumber('run')->name('backup.destroy');

// الصيانة (the page itself is the static status view admin.status.maintenance at /admin/maintenance)
Route::get('maintenance/state', [MaintenanceController::class, 'show'])->name('maintenance.state');
Route::put('maintenance', [MaintenanceController::class, 'update'])->name('maintenance.update');

// البحث السريع
Route::get('search', [SearchController::class, 'index'])->name('search');

// إدارة الصفحات (extra routes before the resource: pages/{page})
Route::post('pages/reorder', [PageController::class, 'reorder'])->name('pages.reorder');
Route::patch('pages/{page}/status', [PageController::class, 'status'])->whereNumber('page')->name('pages.status');
Route::post('pages/{page}/restore', [PageController::class, 'restore'])->whereNumber('page')->name('pages.restore');

// إدارة القائمة (replaces Route::view('menu')); menus.index / menus.update (PUT menus/{header|footer}) come from the resource
Route::get('menu', [MenuController::class, 'page'])->name('menu');
