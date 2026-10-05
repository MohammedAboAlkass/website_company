<?php

use App\Http\Controllers\Admin\ArticleController;
use App\Http\Controllers\Admin\ContentPagesController;
use App\Http\Controllers\Admin\EditorController;
use App\Http\Controllers\Admin\GalleryItemController;
use Illuminate\Support\Facades\Route;

// News + Gallery (DB backed). Included from routes/admin.php inside the auth + admin.access group
// (admins and editors), so the URLs are /admin/... and names admin.*.

// Blade pages
Route::get('news', [ContentPagesController::class, 'news'])->name('news');
Route::get('news-edit', [ContentPagesController::class, 'newsEdit'])->name('news.edit');
Route::get('gallery', [ContentPagesController::class, 'gallery'])->name('gallery');

// Extra JSON endpoints (registered before the resource routes of articles / gallery-items)
Route::post('articles/cover', [ArticleController::class, 'cover'])->name('articles.cover');
Route::patch('articles/{article}/publish', [ArticleController::class, 'publish'])->whereNumber('article')->name('articles.publish');
Route::patch('articles/{article}/unpublish', [ArticleController::class, 'unpublish'])->whereNumber('article')->name('articles.unpublish');
Route::post('gallery-items/reorder', [GalleryItemController::class, 'reorder'])->name('gallery-items.reorder');
Route::post('gallery-items/bulk-move', [GalleryItemController::class, 'bulkMove'])->name('gallery-items.bulk-move');
Route::post('gallery-items/bulk-delete', [GalleryItemController::class, 'bulkDelete'])->name('gallery-items.bulk-delete');

// Shared rich-text editor (public/assets/admin/js/admin-editor.js): media library, image / video upload
Route::get('editor/media', [EditorController::class, 'media'])->name('editor.media');
Route::get('editor/limits', [EditorController::class, 'limits'])->name('editor.limits');
Route::post('editor/upload', [EditorController::class, 'upload'])->name('editor.upload');
Route::post('editor/video', [EditorController::class, 'video'])->name('editor.video');
