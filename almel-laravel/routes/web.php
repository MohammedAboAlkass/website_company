<?php

use App\Http\Controllers\Site\AboutController;
use App\Http\Controllers\Site\ArticleController;
use App\Http\Controllers\Site\BrandController;
use App\Http\Controllers\Site\ContactController;
use App\Http\Controllers\Site\GalleryController;
use App\Http\Controllers\Site\HomeController;
use App\Http\Controllers\Site\NewsletterController;
use App\Http\Controllers\Site\PageController;
use App\Http\Controllers\Site\SitemapController;
use App\Http\Controllers\Site\ProjectController;
use App\Http\Controllers\Site\ThemeController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (file_exists(public_path('index2.html'))) {
        return response()->file(public_path('index2.html'));
    }
    if (file_exists(public_path('index-navy.html'))) {
        return response()->file(public_path('index-navy.html'));
    }
    return app(\App\Http\Controllers\Site\HomeController::class)->index();
})->name('home');
Route::get('/about', [AboutController::class, 'index'])->name('about');
Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
Route::get('/projects/{slug}', [ProjectController::class, 'show'])->name('projects.show');
Route::get('/activities/{id}', [\App\Http\Controllers\Site\ActivityController::class, 'show'])->whereNumber('id')->name('activities.show');
Route::get('/news', [ArticleController::class, 'index'])->name('news.index');
Route::get('/news/{slug}', [ArticleController::class, 'show'])->name('news.show');
Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact-form')->name('contact.store');
Route::post('/newsletter', [NewsletterController::class, 'store'])->middleware('throttle:newsletter-form')->name('newsletter.store');

// Logo / favicon stored in the settings (org.logo, org.favicon) and the XML sitemap (seo.sitemap)
Route::get('/brand/logo', [BrandController::class, 'logo'])->name('brand.logo');
Route::get('/brand/favicon', [BrandController::class, 'favicon'])->name('brand.favicon');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

require __DIR__.'/site_partners.php'; // /partners («شركاؤنا»), before the fallback route

// Public stylesheets derived for the chosen «مظهر الموقع» (admin: الإعدادات ← مظهر الموقع)
Route::get('/site-theme/{name}.css', [ThemeController::class, 'css'])->where('name', 'styles|pages|hero|ed-content|tailwind')->name('site.theme.css');

// Fallback CMS page by slug (keep LAST)
Route::get('/{slug}', [PageController::class, 'show'])->where('slug', '(?!admin$)[A-Za-z0-9\-_]+')->name('page.show');
