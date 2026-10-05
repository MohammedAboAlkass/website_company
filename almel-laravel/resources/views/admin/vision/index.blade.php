@extends('layouts.admin')
@section('title', 'الرؤية والرسالة والقيم')
@section('page', 'vision')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-vision.css') }}">
@endpush
@section('content')

        <div class="page-head">
          <div><h1 class="page-title">الرؤية والرسالة والقيم</h1><p class="page-sub">حرّر البطاقات الثلاث (رؤيتنا • رسالتنا • قيمنا) التي تظهر في الصفحة الرئيسية وفي صفحة «من نحن»: النصوص والصورة والأيقونة والترتيب، مع إمكانية إخفاء أي بطاقة.</p></div>
          <div class="page-actions">
            <span class="save-state" id="vs-state" aria-live="polite"></span>
            <button type="button" class="btn btn-secondary" id="vs-reset" data-perm="vision.edit"><span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>استعادة الافتراضي</button>
            <button type="button" class="btn btn-secondary" id="vs-revert" data-perm="vision.edit" disabled><span class="material-symbols-outlined" aria-hidden="true">undo</span>تراجع</button>
            <button type="button" class="btn btn-primary" id="vs-save" data-perm="vision.edit" aria-keyshortcuts="Control+S" disabled><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ التغييرات</button>
          </div>
        </div>

        <p class="vs-note" id="vs-note" hidden></p>
        <div class="vs-list" id="vs-list" aria-live="polite"></div>

        <div class="vs-bar" id="vs-bar" role="region" aria-label="شريط الحفظ" hidden>
          <span class="vs-bar-msg"><span class="material-symbols-outlined" aria-hidden="true">edit_note</span>لديك تغييرات غير محفوظة</span>
          <span class="vs-bar-act">
            <button type="button" class="btn btn-secondary" id="vs-revert2" data-perm="vision.edit">تراجع</button>
            <button type="button" class="btn btn-primary" id="vs-save2" data-perm="vision.edit"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ التغييرات</button>
          </span>
        </div>

      @endsection
@push('constants')
<script>window.__DB_PAGES = { vision: 1 }; window.__VISION = {!! json_encode($boot, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_PARTIAL_OUTPUT_ON_ERROR) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-dbkit.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-vision.js') }}"></script>
@endpush
