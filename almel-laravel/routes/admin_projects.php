<?php

use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\StoryController;
use Illuminate\Support\Facades\Route;

// Projects, field activities and stories (DB backed). Included from routes/admin.php inside the
// auth + admin.access + perm group: URLs /admin/..., names admin.*. The resource routes themselves
// (projects, activities, stories: index/show/store/update/destroy) are declared in routes/admin.php.
// Permission names: <module>.<action> is derived from the route name (see config/permissions.php + App\Support\Permissions):
// cover -> create|edit, bulk-status/reorder/toggle -> edit, bulk-delete -> delete, publish -> publish.

Route::post('projects/cover', [ProjectController::class, 'cover'])->name('projects.cover');
Route::post('projects/bulk-status', [ProjectController::class, 'bulkStatus'])->name('projects.bulk-status');
Route::post('projects/bulk-delete', [ProjectController::class, 'bulkDelete'])->name('projects.bulk-delete');

Route::post('activities/cover', [ActivityController::class, 'cover'])->name('activities.cover');
Route::post('activities/reorder', [ActivityController::class, 'reorder'])->name('activities.reorder');
Route::patch('activities/{activity}/toggle', [ActivityController::class, 'toggle'])->whereNumber('activity')->name('activities.toggle');

Route::post('stories/cover', [StoryController::class, 'cover'])->name('stories.cover');
Route::post('stories/reorder', [StoryController::class, 'reorder'])->name('stories.reorder');
Route::patch('stories/{story}/publish', [StoryController::class, 'publish'])->whereNumber('story')->name('stories.publish');
