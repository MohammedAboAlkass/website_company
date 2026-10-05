<?php

use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\AppealController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\ImpactController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\Admin\PeoplePagesController;
use Illuminate\Support\Facades\Route;

// Partners, FAQ, Announcements + Appeal, Impact map (DB backed). Included from routes/admin.php inside the
// auth + admin.access + perm group, BEFORE the generic Route::resource lines (those keep serving index/store/update/destroy
// for partners / faqs / appeals / announcements through the controllers above). URLs /admin/..., names admin.*.
// Permissions: route-name prefix -> module in config/permissions.php (partners, faq/faqs, appeal/appeals/announcements, impact).

// Blade pages (the partners page is PartnerController@index = admin.partners.index)
Route::get('faq', [PeoplePagesController::class, 'faq'])->name('faq');
Route::get('appeal', [PeoplePagesController::class, 'appeal'])->name('appeal');
Route::get('impact', [PeoplePagesController::class, 'impact'])->name('impact');

// Partners
Route::post('partners/reorder', [PartnerController::class, 'reorder'])->name('partners.reorder');
Route::post('partners/logo', [PartnerController::class, 'logo'])->name('partners.logo');
Route::patch('partners/{partner}/toggle', [PartnerController::class, 'toggle'])->whereNumber('partner')->name('partners.toggle');

// FAQ
Route::post('faqs/reorder', [FaqController::class, 'reorder'])->name('faqs.reorder');
Route::patch('faqs/{faq}/toggle', [FaqController::class, 'toggle'])->whereNumber('faq')->name('faqs.toggle');

// Announcements bar + appeal card
Route::put('announcements/bar', [AnnouncementController::class, 'saveBar'])->name('announcements.bar');
Route::post('announcements/reorder', [AnnouncementController::class, 'reorder'])->name('announcements.reorder');
Route::patch('announcements/{announcement}/toggle', [AnnouncementController::class, 'toggle'])->whereNumber('announcement')->name('announcements.toggle');
Route::post('appeals/image', [AppealController::class, 'image'])->name('appeals.image');

// Impact map (5 fixed governorates: edit / hide / reorder only)
Route::get('impact/data', [ImpactController::class, 'data'])->name('impact.data');
Route::post('impact/reorder', [ImpactController::class, 'reorder'])->name('impact.reorder');
Route::put('impact/{governorate}', [ImpactController::class, 'update'])->whereNumber('governorate')->name('impact.update');
Route::patch('impact/{governorate}/toggle', [ImpactController::class, 'toggle'])->whereNumber('governorate')->name('impact.toggle');
