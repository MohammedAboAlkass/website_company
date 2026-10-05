@extends('layouts.admin')
@section('title', 'خريطة الأثر')
@section('page', 'impact')
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
          <div><h1 class="page-title">خريطة الأثر</h1><p class="page-sub">عدّل أرقام الأثر والوصف لكل محافظة من محافظات القطاع الخمس في قسم «خريطة الأثر».</p></div>
        </div>

        <section class="card" aria-label="ملخص الأثر"><dl class="mini-stats" id="im-stats"></dl></section>

        <section class="card mt-24" aria-labelledby="t-im">
          <div class="card-head bordered">
            <div><h2 class="card-title" id="t-im">محافظات القطاع الخمس</h2><p class="card-sub">المستفيدون والوجبات والخيام ونقاط المياه لكل محافظة.</p></div>
            <span class="save-state" id="im-saved" aria-live="polite"><span class="material-symbols-outlined" aria-hidden="true">cloud_done</span><span>محفوظة في قاعدة البيانات</span></span>
          </div>
          <div class="toolbar">
            <label class="input-icon"><span class="sr-only">بحث</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" id="im-search" type="search" placeholder="ابحث باسم المحافظة أو وصفها…" autocomplete="off"></label>
            <label class="sr-only" for="im-filter">تصفية حسب الظهور</label><select class="select sm auto" id="im-filter" data-const="visibility" data-ph-value="all" data-ph-label="الكل"></select>
            <span class="grow"></span>
            <span class="muted" id="im-count" aria-live="polite" style="font-size:13px"></span>
          </div>
          <div class="ct-help"><span class="material-symbols-outlined" aria-hidden="true">info</span><p>المحافظات الخمس ثابتة على الخريطة؛ يمكنك تعديل أرقامها ووصفها وترتيبها في القائمة وإخفاء أي محافظة من قائمة الموقع. تُحفظ التغييرات فوراً في قاعدة البيانات.</p></div>
          <ol class="sortable sec-list" id="im-list" aria-labelledby="t-im"></ol>
        </section>

      @endsection
@section('after')
<div class="drawer" id="im-drawer" role="dialog" aria-modal="true" hidden></div>
  
@endsection
@push('constants')
<script src="{{ asset('assets/admin/js/admin-constants.js') }}"></script>
<script>window.__DB_PAGES = { impact: 1 }; window.__PEOPLE_OPTS = {!! json_encode($opts, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-dnd.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-editor.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-people-db.js') }}"></script>
@endpush
