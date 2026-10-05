<?php

use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\AppealController;
use App\Http\Controllers\Admin\ArticleController;
use App\Http\Controllers\Admin\ArticleCategoryController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\GalleryAlbumController;
use App\Http\Controllers\Admin\GalleryItemController;
use App\Http\Controllers\Admin\GovernorateController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\MenuItemController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\NewsletterController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PageSectionController;
use App\Http\Controllers\Admin\PageSectionBlockController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\ProgramController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\StoryController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

// Loaded from bootstrap/app.php: prefix /admin, name prefix admin.
// Public screens: login / forgot password (design only) / status pages
Route::group([], function () {
    // Design-only auth/status screens (static views)
    Route::view('login-1', 'admin.auth.login-1')->name('login.v1');
    Route::view('login-3', 'admin.auth.login-3')->name('login.v3');
    Route::view('login-classic', 'admin.auth.login-classic')->name('login.classic');
    Route::view('forgot-password', 'admin.auth.forgot-password')->name('password.forgot');
    Route::view('403', 'admin.status.403')->name('status.403');
    Route::view('404', 'admin.status.404')->name('status.404');
    Route::view('maintenance', 'admin.status.maintenance')->name('status.maintenance');
    Route::get('login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('login', [LoginController::class, 'login'])->name('login.submit');
    Route::post('logout', [LoginController::class, 'logout'])->name('logout');
});

// Everything below needs a signed-in, active account whose role may use the panel.
// 'perm' (no arguments) enforces the permission of every route automatically:
// route name -> module (config/permissions.php) + HTTP method -> view/create/edit/delete/publish (App\Support\Permissions).
Route::middleware(['auth', 'admin.access', 'perm'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Design-only pages (static views; the dashboard JS renders everything client-side)
    Route::get('reports', [ReportsController::class, 'index'])->name('reports');
    Route::get('reports/export', [ReportsController::class, 'export'])->name('reports.export');
    // «الصفحة الرئيسية» (database backed): routes/admin_homepage.php (route names homepage.* -> `homepage` module)
    require base_path('routes/admin_homepage.php');
    // «نصوص الموقع» (ركائز الإغاثة، المشاريع والبرامج، من نحن، نموذج التواصل والخريطة): routes/admin_site_texts.php (route names site-texts.* -> `pages` module)
    require base_path('routes/admin_site_texts.php');
    // Backup, maintenance mode, quick search, pages + menus (DB backed): routes/admin_system.php (before the generic resources)
    require base_path('routes/admin_system.php');
    // News + Gallery: DB-backed pages and JSON endpoints (routes/admin_content.php)
    require base_path('routes/admin_content.php');

    // Partners, FAQ, Announcements/Appeal, Impact map: DB-backed pages and JSON endpoints (routes/admin_people.php), before the generic resources below
    require base_path('routes/admin_people.php');
    // Projects, field activities, stories: DB-backed JSON endpoints (routes/admin_projects.php); the resource routes below serve the pages
    require base_path('routes/admin_projects.php');
    // Hero settings (slides + public hero): routes/admin_hero.php (route names hero.* -> `homepage` module)
    require base_path('routes/admin_hero.php');
    // «الرؤية والرسالة والقيم» cards (home + about): routes/admin_vision.php (route names vision.* -> `vision` module)
    require base_path('routes/admin_vision.php');

    // Legacy static-style URLs: /admin/projects.html -> /admin/projects
    Route::get('{page}.html', fn (string $page) => redirect($page === 'index' ? '/admin' : '/admin/'.($page === 'login-2' ? 'login' : ($page === 'login' ? 'login-classic' : $page))))
        ->where('page', '[a-z0-9\-]+')->name('legacy-html');

    Route::resource('projects', ProjectController::class);
    Route::resource('programs', ProgramController::class);
    Route::resource('governorates', GovernorateController::class);
    Route::resource('articles', ArticleController::class);
    Route::resource('article-categories', ArticleCategoryController::class);
    // الوسوم (module tags): CRUD + merge
    Route::get('tags', [TagController::class, 'index'])->name('tags.index');
    Route::post('tags', [TagController::class, 'store'])->name('tags.store');
    Route::post('tags/{tag}/merge', [TagController::class, 'merge'])->whereNumber('tag')->name('tags.merge');
    Route::put('tags/{tag}', [TagController::class, 'update'])->whereNumber('tag')->name('tags.update');
    Route::delete('tags/{tag}', [TagController::class, 'destroy'])->whereNumber('tag')->name('tags.destroy');
    Route::resource('gallery-albums', GalleryAlbumController::class);
    Route::resource('gallery-items', GalleryItemController::class);
    Route::resource('stories', StoryController::class);
    Route::resource('activities', ActivityController::class);
    Route::resource('partners', PartnerController::class);
    Route::resource('faqs', FaqController::class);
    Route::resource('appeals', AppealController::class);
    Route::resource('announcements', AnnouncementController::class);
    Route::resource('pages', PageController::class);
    Route::resource('menus', MenuController::class);
    // مكتبة الوسائط (module media): the page, upload, usage check, edit, delete, bulk delete (no separate create/show pages)
    Route::get('media', [MediaController::class, 'index'])->name('media.index');
    Route::post('media', [MediaController::class, 'store'])->name('media.store');
    Route::post('media/bulk-delete', [MediaController::class, 'bulkDelete'])->name('media.bulk-delete');
    Route::get('media/{media}/usage', [MediaController::class, 'usage'])->whereNumber('media')->name('media.usage');
    Route::put('media/{media}', [MediaController::class, 'update'])->whereNumber('media')->name('media.update');
    Route::delete('media/{media}', [MediaController::class, 'destroy'])->whereNumber('media')->name('media.destroy');
    // سجل العمليات: read-only (list, details, CSV export). There is deliberately no update / delete route.
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('audit-logs/export', [AuditLogController::class, 'export'])->name('audit-logs.export');
    Route::get('audit-logs/{id}', [AuditLogController::class, 'show'])->whereNumber('id')->name('audit-logs.show');
    // notifications of the signed-in user (config/permissions.php free_routes: own data only, filtered by module permission in the service)
    Route::get('notifications/feed', [NotificationController::class, 'feed'])->name('notifications.feed');
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::post('notifications/clear-read', [NotificationController::class, 'clearRead'])->name('notifications.clear-read');
    Route::patch('notifications/{id}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::resource('notifications', NotificationController::class)->only(['index', 'show', 'destroy']);

    // pages -> sections -> blocks
    Route::post('pages/{page}/sections', [PageSectionController::class, 'store'])->name('pages.sections.store');
    Route::put('pages/{page}/sections/{section}', [PageSectionController::class, 'update'])->name('pages.sections.update');
    Route::delete('pages/{page}/sections/{section}', [PageSectionController::class, 'destroy'])->name('pages.sections.destroy');
    Route::post('sections/{section}/blocks', [PageSectionBlockController::class, 'store'])->name('sections.blocks.store');
    Route::put('sections/{section}/blocks/{block}', [PageSectionBlockController::class, 'update'])->name('sections.blocks.update');
    Route::delete('sections/{section}/blocks/{block}', [PageSectionBlockController::class, 'destroy'])->name('sections.blocks.destroy');

    // menus -> items
    Route::post('menus/{menu}/items', [MenuItemController::class, 'store'])->name('menus.items.store');
    Route::put('menus/{menu}/items/{item}', [MenuItemController::class, 'update'])->name('menus.items.update');
    Route::delete('menus/{menu}/items/{item}', [MenuItemController::class, 'destroy'])->name('menus.items.destroy');

    // contact messages
    Route::get('messages', [MessageController::class, 'index'])->name('messages.index');
    Route::post('messages/read-all', [MessageController::class, 'readAll'])->name('messages.read-all');
    Route::get('messages/{message}', [MessageController::class, 'show'])->name('messages.show');
    Route::patch('messages/{message}/read', [MessageController::class, 'markRead'])->name('messages.read');
    Route::patch('messages/{message}/archive', [MessageController::class, 'archive'])->name('messages.archive');
    Route::patch('messages/{message}/star', [MessageController::class, 'star'])->name('messages.star');
    Route::patch('messages/{message}/handle', [MessageController::class, 'handle'])->name('messages.handle');
    Route::delete('messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');

    // newsletter subscribers (permissions: same module as the messages)
    Route::get('newsletter', [NewsletterController::class, 'index'])->name('newsletter.index');
    Route::get('newsletter/export', [NewsletterController::class, 'export'])->name('newsletter.export');
    Route::patch('newsletter/{subscriber}/toggle', [NewsletterController::class, 'toggle'])->name('newsletter.toggle');
    Route::delete('newsletter/{subscriber}', [NewsletterController::class, 'destroy'])->name('newsletter.destroy');

    // own account (any signed-in admin/editor)
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('profile/password', [ProfileController::class, 'password'])->name('profile.password');
    Route::post('profile/avatar', [ProfileController::class, 'avatar'])->middleware('throttle:20,1')->name('profile.avatar');
    Route::delete('profile/avatar', [ProfileController::class, 'avatarDestroy'])->middleware('throttle:20,1')->name('profile.avatar.destroy');

    // Settings, constants, users: permissions come from the 'perm' middleware above
    // General settings + «ثوابت النظام» (JSON API used by admin-settings.js / admin-constants.js)
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::get('settings/data', [SettingsController::class, 'data'])->name('settings.data');
    Route::delete('settings/sessions', [SettingsController::class, 'revokeOtherSessions'])->name('settings.sessions.revoke-others');
    Route::delete('settings/sessions/{id}', [SettingsController::class, 'revokeSession'])->name('settings.sessions.revoke');
    Route::post('settings/constants/{group}/items', [SettingsController::class, 'constantAdd'])->name('settings.constants.add');
    Route::put('settings/constants/{group}/item', [SettingsController::class, 'constantUpdate'])->name('settings.constants.update');
    Route::delete('settings/constants/{group}/item', [SettingsController::class, 'constantDelete'])->name('settings.constants.delete');
    Route::put('settings/constants/{group}/order', [SettingsController::class, 'constantReorder'])->name('settings.constants.order');
    Route::post('settings/constants/{group}/reset', [SettingsController::class, 'constantReset'])->name('settings.constants.reset');
    Route::put('settings/{group}', [SettingsController::class, 'update'])->where('group', '[a-z_]+')->name('settings.update');
    Route::patch('users/{user}/toggle', [UserController::class, 'toggle'])->name('users.toggle');
    Route::put('users/{user}/password', [UserController::class, 'password'])->name('users.password');
    Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);
    // Roles & permissions (page + JSON API used by admin-roles.js)
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('roles/data', [RoleController::class, 'data'])->name('roles.data');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
    Route::put('roles/{role}', [RoleController::class, 'update'])->whereNumber('role')->name('roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->whereNumber('role')->name('roles.destroy');
    Route::get('roles/{role}/users', [RoleController::class, 'users'])->whereNumber('role')->name('roles.users');
    Route::post('roles/{role}/users', [RoleController::class, 'assign'])->whereNumber('role')->name('roles.assign');
});
