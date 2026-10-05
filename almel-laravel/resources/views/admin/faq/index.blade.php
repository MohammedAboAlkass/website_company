@extends('layouts.admin')
@section('title', 'الأسئلة الشائعة')
@section('page', 'faq')
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
          <div><h1 class="page-title">الأسئلة الشائعة</h1><p class="page-sub">أدِر الأسئلة والإجابات التي تظهر للزوار في قسم «الأسئلة الشائعة».</p></div>
          <div class="page-actions">
            <button type="button" class="btn btn-primary" id="fq-add" data-perm="faq.create"><span class="material-symbols-outlined" aria-hidden="true">add</span>سؤال جديد</button>
          </div>
        </div>

        <section class="card" aria-label="ملخص"><dl class="mini-stats" id="fq-stats"></dl></section>

        <section class="card mt-24" aria-labelledby="t-fq">
          <div class="card-head bordered">
            <div><h2 class="card-title" id="t-fq">قائمة الأسئلة</h2><p class="card-sub">السؤال والإجابة وترتيب ظهورهما في الصفحة.</p></div>
            <span class="save-state" id="fq-saved" aria-live="polite"><span class="material-symbols-outlined" aria-hidden="true">cloud_done</span><span>محفوظة في قاعدة البيانات</span></span>
          </div>
          <div class="toolbar">
            <label class="input-icon"><span class="sr-only">بحث</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" id="fq-search" type="search" placeholder="ابحث في الأسئلة أو الإجابات…" autocomplete="off"></label>
            <label class="sr-only" for="fq-filter">تصفية حسب الظهور</label><select class="select sm auto" id="fq-filter" data-const="visibility" data-ph-value="all" data-ph-label="الكل"></select>
            <span class="grow"></span>
            <span class="muted" id="fq-count" aria-live="polite" style="font-size:13px"></span>
          </div>
          <div class="ct-help"><span class="material-symbols-outlined" aria-hidden="true">info</span><p>اسحب المقبض لتغيير الترتيب أو استخدم الأسهم، وبدّل المفتاح لإظهار العنصر أو إخفائه. تُحفظ التغييرات فوراً في قاعدة البيانات، ويُسجَّل كل تعديل في سجل النشاط.</p></div>
          <ol class="sortable sec-list" id="fq-list" aria-labelledby="t-fq"></ol>
        </section>

      @endsection
@section('after')
<div class="drawer" id="fq-drawer" role="dialog" aria-modal="true" hidden></div>
  
@endsection
@push('constants')
<script src="{{ asset('assets/admin/js/admin-constants.js') }}"></script>
<script>window.__DB_PAGES = { faq: 1 }; window.__PEOPLE_OPTS = {!! json_encode($opts, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-dnd.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-editor.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-people-db.js') }}"></script>
@endpush
