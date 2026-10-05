<?php

use App\Http\Controllers\Site\PartnerController;
use Illuminate\Support\Facades\Route;

// Public «شركاؤنا» page. Included from routes/web.php BEFORE the fallback CMS route /{slug}.
Route::get('/partners', [PartnerController::class, 'index'])->name('partners');
