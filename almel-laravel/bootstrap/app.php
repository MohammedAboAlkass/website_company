<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Illuminate\Support\Facades\Route::middleware('web')->prefix('admin')->name('admin.')->group(base_path('routes/admin.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserIsAdminOrEditor::class,
            'admin' => \App\Http\Middleware\EnsureUserIsAdminOrEditor::class,
            'admin.access' => \App\Http\Middleware\AdminAccess::class,
            'perm' => \App\Http\Middleware\EnforcePermission::class,
            'can.perm' => \App\Http\Middleware\EnforcePermission::class,
        ]);
        // Public site answers 503 while maintenance mode is on (admin area, assets and signed-in panel users are exempt)
        $middleware->web(append: [\App\Http\Middleware\SiteMaintenance::class]);
        // Security: trusted Host, query normalisation and security headers on every response (SecurityHeaders is the outermost)
        $middleware->prepend([
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\EnsureTrustedHost::class,
            \App\Http\Middleware\ScalarQuery::class,
        ]);
        // Guests are sent to the control-panel login (the only protected area is /admin/*)
        $middleware->redirectGuestsTo(fn () => route('admin.login'));
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
