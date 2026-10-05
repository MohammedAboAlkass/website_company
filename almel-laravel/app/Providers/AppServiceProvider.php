<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Public forms: separate buckets (a burst on one form must not lock the other); the Arabic text is shown by errors/429.
        RateLimiter::for('contact-form', fn (Request $r) => Limit::perMinutes(10, 6)->by('contact-form|'.$r->ip()));
        RateLimiter::for('newsletter-form', fn (Request $r) => Limit::perMinutes(10, 5)->by('newsletter-form|'.$r->ip()));

        // Permissions as gates: @can('news.create'), $user->can('news.publish').
        // The super admin passes every check; other users need the key on their role.
        Gate::before(function ($user, string $ability) {
            if (! $user instanceof User) {
                return null;
            }
            if ($user->isSuperAdmin()) {
                return true;
            }
            if (preg_match('/^[a-z]+\.[a-z]+$/', $ability)) {
                return $user->hasPermission($ability);
            }

            return null;
        });
    }
}
