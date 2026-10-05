@extends('layouts.admin')
@section('title', 'قصص الميدان')
@section('page', 'stories')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-builder.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-content.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-editor.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-fielddb.css') }}">
@endpush
@section('content')

        <div class="page-head">
          <div><h1 class="page-title">قصص الميدان</h1><p class="page-sub">أدِر شهادات العائلات والمتطوعين التي تظهر في قسم «قصص من الميدان» بالصفحة الرئيسية.</p></div>
          <div class="page-actions">
            <button type="button" class="btn btn-primary" id="fd-add" data-perm="stories.create"><span class="material-symbols-outlined" aria-hidden="true">add</span>قصة جديدة</button>
          </div>
        </div>

        <section class="card" aria-label="ملخص"><dl class="mini-stats" id="fd-stats"></dl></section>

        <section class="card mt-24" aria-labelledby="t-fd">
          <div class="card-head bordered">
            <div><h2 class="card-title" id="t-fd">قائمة القصص</h2><p class="card-sub">الاسم والموقع ونص الشهادة والصورة لكل قصة.</p></div>
            <span class="save-state" id="fd-saved" aria-live="polite"><span class="material-symbols-outlined" aria-hidden="true">cloud_done</span><span>محفوظة في قاعدة البيانات</span></span>
          </div>
          <div class="toolbar">
            <label class="input-icon"><span class="sr-only">بحث</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" id="fd-search" type="search" placeholder="ابحث بالاسم أو الموقع أو نص القصة…" autocomplete="off"></label>
            <label class="sr-only" for="fd-filter">تصفية حسب الظهور</label><select class="select sm auto" id="fd-filter"><option value="all">الكل</option><option value="visible">ظاهرة</option><option value="hidden">مخفية</option></select>
            <span class="grow"></span>
            <span class="muted" id="fd-count" aria-live="polite" style="font-size:13px"></span>
          </div>
          <div class="ct-help"><span class="material-symbols-outlined" aria-hidden="true">info</span><p>اسحب المقبض لتغيير الترتيب أو استخدم الأسهم، وبدّل المفتاح لإظهار العنصر أو إخفائه. تُحفظ التغييرات فوراً في قاعدة البيانات.</p></div>
          <ol class="sortable sec-list" id="fd-list" aria-labelledby="t-fd"></ol>
        </section>

      @endsection
@section('after')
<div class="drawer" id="fd-drawer" role="dialog" aria-modal="true" hidden></div>

@endsection
@push('constants')
<script>window.__DB_PAGES = { stories: 1 }; window.__FLD_OPTS = {!! json_encode($opts, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-dnd.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-editor.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-dbkit.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-fielddb.js') }}"></script>
@endpush
