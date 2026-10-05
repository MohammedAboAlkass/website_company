@extends('layouts.admin')
@section('title', 'إعدادات الهيرو')
@section('page', 'hero')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/site/css/hero.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-hero.css') }}">
@endpush
@section('content')

        <div class="page-head">
          <div><h1 class="page-title">إعدادات الهيرو</h1><p class="page-sub">تحكّم كامل بالواجهة الرئيسية للموقع: الشرائح، النصوص والأزرار، الخلفية (صورة أو فيديو أو لون أو تدرّج)، التراكب، والتشغيل.</p></div>
          <div class="page-actions">
            <span class="save-state" id="hr-state" aria-live="polite"></span>
            <button type="button" class="btn btn-secondary" id="hr-revert" data-perm="homepage.edit" disabled><span class="material-symbols-outlined" aria-hidden="true">undo</span>تراجع</button>
            <button type="button" class="btn btn-primary" id="hr-save" data-perm="homepage.edit" aria-keyshortcuts="Control+S" disabled><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ التغييرات</button>
          </div>
        </div>

        <div class="hr-layout">
          <div class="hr-side">
            <section class="card" aria-labelledby="t-hr-slides">
              <div class="card-head bordered">
                <div><h2 class="card-title" id="t-hr-slides">الشرائح</h2><p class="card-sub" id="hr-count"></p></div>
                <button type="button" class="btn btn-primary btn-sm" id="hr-add" data-perm="homepage.edit"><span class="material-symbols-outlined" aria-hidden="true">add</span>شريحة جديدة</button>
              </div>
              <p class="hr-help"><span class="material-symbols-outlined" aria-hidden="true">info</span>اسحب المقبض لتغيير الترتيب أو استخدم الأسهم. المفتاح يُظهر الشريحة أو يخفيها عن الزوار.</p>
              <ol class="hr-slides" id="hr-slides" aria-labelledby="t-hr-slides"></ol>
            </section>

            <section class="card" aria-labelledby="t-hr-global">
              <div class="card-head bordered"><div><h2 class="card-title" id="t-hr-global">الإعدادات العامة</h2><p class="card-sub">تنطبق على الهيرو كله</p></div></div>
              <div class="hr-global" id="hr-global"></div>
            </section>
          </div>

          <div class="hr-main">
            <section class="card" aria-labelledby="t-hr-prev">
              <div class="card-head bordered">
                <div><h2 class="card-title" id="t-hr-prev">معاينة مباشرة</h2><p class="card-sub">تعكس تعديلاتك فوراً قبل الحفظ • <span id="hr-prev-cap"></span></p></div>
                <div class="seg" id="hr-device" role="group" aria-label="حجم المعاينة">
                  <button type="button" data-v="desktop" aria-pressed="true"><span class="material-symbols-outlined" aria-hidden="true">desktop_windows</span>حاسوب</button>
                  <button type="button" data-v="mobile" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">smartphone</span>هاتف</button>
                </div>
              </div>
              <div class="hr-prev-box" id="hr-prev-box"><div class="hr-prev" id="hr-prev"></div></div>
              <p class="hr-help"><span class="material-symbols-outlined" aria-hidden="true">info</span>المعاينة تعرض الشريحة المحددة. شريط الإحصائيات أسفل الهيرو يظهر هنا كمستطيل توضيحي فقط.</p>
            </section>

            <section class="card" aria-labelledby="t-hr-edit">
              <div class="card-head bordered"><div><h2 class="card-title" id="t-hr-edit">تعديل الشريحة</h2><p class="card-sub">اختر شريحة من القائمة لتعديل محتواها وتنسيقها وخلفيتها</p></div></div>
              <div class="hr-editor" id="hr-editor"></div>
            </section>
          </div>
        </div>

        <div class="hr-bar" id="hr-bar" role="region" aria-label="شريط الحفظ" hidden>
          <span class="hr-bar-msg"><span class="material-symbols-outlined" aria-hidden="true">edit_note</span>لديك تغييرات غير محفوظة</span>
          <span class="hr-bar-act">
            <button type="button" class="btn btn-secondary" id="hr-revert2" data-perm="homepage.edit">تراجع</button>
            <button type="button" class="btn btn-primary" id="hr-save2" data-perm="homepage.edit"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ التغييرات</button>
          </span>
        </div>

      @endsection
@push('constants')
<script>window.__DB_PAGES = { hero: 1 }; window.__HERO = {!! json_encode($boot, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_PARTIAL_OUTPUT_ON_ERROR) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-dbkit.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-hero.js') }}"></script>
@endpush
