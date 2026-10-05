@extends('layouts.admin')
@section('title', 'نصوص الموقع')
@section('page', 'site-texts')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-site-texts.css') }}">
@endpush
@section('content')

        <div class="page-head">
          <div><h1 class="page-title">نصوص الموقع</h1><p class="page-sub">عدّل النصوص الثابتة لصفحات الموقع: ركائز الإغاثة، المشاريع والبرامج، «من نحن»، ونموذج التواصل والخريطة. تُحفظ التغييرات في قاعدة البيانات وتظهر للزوار مباشرة، وما لم تعدّله يبقى كما هو.</p></div>
          <div class="page-actions st-actions">
            <span class="save-state" id="st-state" aria-live="polite"></span>
            <button type="button" class="btn btn-secondary" id="st-reset-all" data-perm="pages.edit"><span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>استعادة كل الافتراضي</button>
            <button type="button" class="btn btn-primary" id="st-save" data-perm="pages.edit" aria-keyshortcuts="Control+S"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ التغييرات</button>
          </div>
        </div>

        <p class="st-note" id="st-readonly" hidden role="note"><span class="material-symbols-outlined" aria-hidden="true">lock</span><span>صلاحيتك تسمح بعرض النصوص فقط؛ لا يمكنك تعديلها.</span></p>

        <section class="card st-shell" aria-labelledby="st-title-h">
          <h2 class="sr-only" id="st-title-h">أقسام نصوص الموقع</h2>
          <div class="tabs st-tabs" role="tablist" aria-label="أقسام نصوص الموقع" id="st-tabs"></div>
          <div class="st-panel" id="st-panel" role="tabpanel" tabindex="-1"></div>
        </section>

        <div class="st-bar" id="st-bar" hidden role="region" aria-label="حفظ التغييرات">
          <span class="st-bar-msg"><span class="dirty-dot" aria-hidden="true"></span><span id="st-bar-text">تغييرات غير محفوظة</span></span>
          <span class="st-bar-btns">
            <button type="button" class="btn btn-secondary btn-sm" id="st-revert">تراجع عن التغييرات</button>
            <button type="button" class="btn btn-primary btn-sm" id="st-save2"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ التغييرات</button>
          </span>
        </div>
        <p class="sr-only" id="st-live" aria-live="assertive"></p>
      @endsection
@push('constants')
<script>window.__DB_PAGES = { 'site-texts': 1 }; window.__SITE_TEXTS = {!! json_encode($boot, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_PARTIAL_OUTPUT_ON_ERROR) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-dbkit.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-site-texts.js') }}"></script>
@endpush
