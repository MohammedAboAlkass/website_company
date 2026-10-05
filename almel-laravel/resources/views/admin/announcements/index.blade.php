@extends('layouts.admin')
@section('title', 'الإعلانات')
@section('page', 'announcements')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-builder.css') }}">
@endpush
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-content.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-editor.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-people.css') }}">
@endpush
@section('content')

        <div class="page-head">
          <div><h1 class="page-title">الإعلانات</h1><p class="page-sub">أدِر عناصر شريط «آخر الإعلانات» وعنوان الشريط وتفاصيل كل إعلان وموعد ظهوره.</p></div>
        </div>

<section class="card" aria-labelledby="t-an">
          <div class="card-head bordered">
            <div><h2 class="card-title" id="t-an">شريط الإعلانات</h2><p class="card-sub">الإعلانات المتحركة أعلى الموقع، ولكل إعلان قسم يفتحه عند الضغط.</p></div>
            <div class="row-actions">
              <span class="save-state" id="an-saved" aria-live="polite"><span class="material-symbols-outlined" aria-hidden="true">cloud_done</span><span>محفوظ في قاعدة البيانات</span></span>
              <button type="button" class="btn btn-primary btn-sm" id="an-add" data-perm="announcements.create"><span class="material-symbols-outlined" aria-hidden="true">add</span>إعلان جديد</button>
            </div>
          </div>
          <div class="ct-barset">
            <div class="field"><label class="label" for="bar-label"><span>عنوان الشريط</span><span class="counter" id="bar-label-count">0 / 30</span></label><input class="input" id="bar-label" maxlength="30"></div>
            <div class="ct-switch"><span id="bar-visible-l">إظهار الشريط في الموقع</span><button type="button" class="switch" role="switch" id="bar-visible" aria-checked="true" aria-labelledby="bar-visible-l"></button></div>
          </div>
          <dl class="mini-stats" id="an-stats"></dl>
          <div class="toolbar">
            <label class="input-icon"><span class="sr-only">بحث في الإعلانات</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" id="an-search" type="search" placeholder="ابحث في نص الإعلان…" autocomplete="off"></label>
            <label class="sr-only" for="an-filter">تصفية حسب الظهور</label><select class="select sm auto" id="an-filter" data-const="visibility" data-ph-value="all" data-ph-label="الكل"></select>
            <span class="grow"></span>
            <span class="muted" id="an-count" aria-live="polite" style="font-size:13px"></span>
          </div>
          <div class="ct-help"><span class="material-symbols-outlined" aria-hidden="true">info</span><p>اسحب المقبض لتغيير ترتيب الإعلانات في الشريط، وبدّل المفتاح لإظهار الإعلان أو إخفائه.</p></div>
          <ol class="sortable sec-list" id="an-list" aria-labelledby="t-an"></ol>
        </section>

      @endsection
@section('after')
<div class="drawer" id="an-drawer" role="dialog" aria-modal="true" hidden></div>
  
@endsection
@push('constants')
<script src="{{ asset('assets/admin/js/admin-constants.js') }}"></script>
<script>window.__DB_PAGES = { announcements: 1 }; window.__PEOPLE_OPTS = {!! json_encode($opts, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-dnd.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-editor.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-people-db.js') }}"></script>
@endpush
