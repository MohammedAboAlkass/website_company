@extends('layouts.admin')
@section('title', 'الإعدادات')
@section('page', 'settings')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-settings.css') }}">
@endpush
@section('content')
        <div class="page-head">
          <div><h1 class="page-title">الإعدادات</h1><p class="page-sub">مركز التحكم في هوية الجمعية ومظهر اللوحة وفريق العمل والأمان والنسخ الاحتياطي.</p></div>
          <div class="page-actions"><span class="save-state st-state" id="st-state" aria-live="polite"></span></div>
        </div>
        <div class="st-layout" id="st-root">
          <aside class="st-aside" aria-label="التنقل في الإعدادات">
            <div class="st-search">
              <label class="sr-only" for="st-search">ابحث في الإعدادات</label>
              <span class="material-symbols-outlined" aria-hidden="true">search</span>
              <input class="input" id="st-search" type="search" autocomplete="off" spellcheck="false" placeholder="ابحث في كل الإعدادات…" role="combobox" aria-expanded="false" aria-controls="st-results" aria-autocomplete="list" aria-describedby="st-search-hint">
              <kbd class="st-kbd" aria-hidden="true">/</kbd>
              <p class="sr-only" id="st-search-hint">اكتب للبحث ثم استخدم الأسهم واضغط Enter للانتقال إلى الإعداد.</p>
              <ul class="st-results" id="st-results" role="listbox" aria-label="نتائج البحث في الإعدادات" hidden></ul>
            </div>
            <nav class="st-nav" id="st-nav" aria-label="أقسام الإعدادات"></nav>
          </aside>
          <div class="st-main" id="st-sections"></div>
        </div>
        <div class="st-savebar" id="st-savebar" role="region" aria-label="تغييرات غير محفوظة" hidden>
          <span class="st-savebar-ico" aria-hidden="true"><span class="dirty-dot"></span></span>
          <div class="st-savebar-text"><strong>لديك تغييرات غير محفوظة</strong><span id="st-dirty-list"></span></div>
          <div class="st-savebar-actions">
            <button type="button" class="btn st-discard" id="st-discard"><span class="material-symbols-outlined" aria-hidden="true">undo</span>تجاهل</button>
            <button type="button" class="btn btn-accent" id="st-save" aria-keyshortcuts="Control+S"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ التغييرات</button>
          </div>
        </div>
        <p class="sr-only" id="st-live" aria-live="polite"></p>
      @endsection
@push('constants')
<script src="{{ asset('assets/admin/js/admin-constants.js') }}"></script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-settings.js') }}"></script>
@endpush
