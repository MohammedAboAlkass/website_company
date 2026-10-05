@extends('layouts.admin')
@section('title', 'نداء الإغاثة')
@section('page', 'appeal')
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
          <div><h1 class="page-title">نداء الإغاثة</h1><p class="page-sub">تحكّم في بطاقة نداء الإغاثة الظاهرة في الصفحة الرئيسية: نصّها وصورتها وأزرارها وفترة عرضها.</p></div>
          <div class="page-actions">
            <button type="button" class="btn btn-secondary" id="ap-reset"><span class="material-symbols-outlined" aria-hidden="true">undo</span>تراجع عن التعديلات</button>
            <button type="button" class="btn btn-primary" id="ap-save" data-perm="appeal.edit" aria-keyshortcuts="Control+S"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ التغييرات</button>
          </div>
        </div>

        <div class="grid">
          <section class="card xl-8" aria-labelledby="t-ap">
            <div class="card-head bordered">
              <div><h2 class="card-title" id="t-ap">بطاقة نداء الإغاثة العاجل</h2><p class="card-sub">النص والأزرار والصورة كما تظهر في قسم النداء.</p></div>
              <div class="ct-switch"><span id="ap-visible-l">إظهار البطاقة</span><button type="button" class="switch" role="switch" id="ap-visible" aria-checked="true" aria-labelledby="ap-visible-l"></button></div>
            </div>
            <form class="ct-form-grid" id="ap-form" novalidate></form>
            <div class="card-foot"><span class="save-state mb-state" id="ap-state" aria-live="polite"></span><span class="hint">تُحفظ البيانات في قاعدة البيانات، ويُسجَّل كل تعديل في سجل النشاط.</span></div>
          </section>
          <section class="card xl-4" aria-labelledby="t-ap-prev">
            <div class="card-head bordered"><div><h2 class="card-title" id="t-ap-prev">معاينة البطاقة</h2><p class="card-sub">تتحدّث أثناء الكتابة.</p></div></div>
            <div class="card-body"><div class="ap-card" id="ap-preview" aria-hidden="true"></div></div>
          </section>
        </div>

        

      @endsection

@push('constants')
<script src="{{ asset('assets/admin/js/admin-constants.js') }}"></script>
<script>window.__DB_PAGES = { appeal: 1 }; window.__PEOPLE_OPTS = {!! json_encode($opts, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-dnd.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-editor.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-people-db.js') }}"></script>
@endpush
