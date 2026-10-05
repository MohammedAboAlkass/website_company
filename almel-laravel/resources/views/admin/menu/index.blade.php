@extends('layouts.admin')
@section('title', 'إدارة القائمة')
@section('page', 'menu')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-builder.css') }}">
@endpush
@section('content')

        <div class="page-head">
          <div><h1 class="page-title">إدارة القائمة</h1><p class="page-sub">رتّب روابط رأس الموقع وتذييله بالسحب والإفلات، وشاهد النتيجة مباشرة قبل الحفظ.</p></div>
          <div class="page-actions mb-actions">
            <span class="save-state mb-state" id="mb-state" aria-live="polite"></span>
            <button type="button" class="btn btn-ghost" id="mb-undo" aria-keyshortcuts="Control+Z"><span class="material-symbols-outlined" aria-hidden="true">undo</span>تراجع</button>
            <button type="button" class="btn btn-secondary" id="mb-reset"><span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>تجاهل التغييرات</button>
            <button type="button" class="btn btn-primary" id="mb-save" aria-keyshortcuts="Control+S"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ القائمة</button>
          </div>
        </div>

        <div class="tabs mb-tabs card" role="tablist" id="mb-tabs" aria-label="القوائم" data-shared-panel="true">
          <button type="button" class="tab" role="tab" id="mbt-header" data-value="header" aria-selected="true" aria-controls="mb-panel"><span class="material-symbols-outlined" aria-hidden="true">top_panel_open</span>القائمة الرئيسية <span class="tab-count" data-count="header"></span><span class="tab-dirty" data-dirty="header" hidden><span class="sr-only">تغييرات غير محفوظة</span></span></button>
          <button type="button" class="tab" role="tab" id="mbt-footer" data-value="footer" aria-selected="false" aria-controls="mb-panel" tabindex="-1"><span class="material-symbols-outlined" aria-hidden="true">bottom_panel_open</span>قائمة التذييل <span class="tab-count" data-count="footer"></span><span class="tab-dirty" data-dirty="footer" hidden><span class="sr-only">تغييرات غير محفوظة</span></span></button>
        </div>

        <div id="mb-panel" role="tabpanel" aria-labelledby="mbt-header">
          <section class="card mt-24 preview-card" aria-labelledby="t-preview">
            <div class="card-head">
              <div><h2 class="card-title" id="t-preview"><span class="live-dot" aria-hidden="true"></span>معاينة حية</h2><p class="card-sub" id="pv-sub">تتحدّث فوراً مع كل سحب أو تعديل — بتنسيق الموقع العام.</p></div>
              <div class="row-actions">
                <div class="seg" id="pv-state" role="group" aria-label="حالة الرأس"><button type="button" data-value="top" aria-pressed="true">فوق الغلاف</button><button type="button" data-value="scrolled" aria-pressed="false">بعد التمرير</button></div>
                <div class="seg icons" id="pv-device" role="group" aria-label="جهاز المعاينة"><button type="button" data-value="desktop" aria-pressed="true" aria-label="حاسوب" title="حاسوب"><span class="material-symbols-outlined" aria-hidden="true">desktop_windows</span></button><button type="button" data-value="mobile" aria-pressed="false" aria-label="جوال" title="جوال"><span class="material-symbols-outlined" aria-hidden="true">smartphone</span></button></div>
              </div>
            </div>
            <div class="card-body">
              <figure class="pv-fig">
                <div class="pv-stage" id="pv-stage" aria-hidden="true"></div>
                <figcaption class="sr-only" id="pv-caption" aria-live="polite"></figcaption>
              </figure>
            </div>
          </section>

          <div class="grid mt-24 mb-grid">
            <section class="card xl-8 mb-builder" aria-labelledby="t-items">
              <div class="card-head bordered">
                <div><h2 class="card-title" id="t-items">عناصر القائمة</h2><p class="card-sub" id="mb-sub"></p></div>
                <div class="row-actions">
                  <button type="button" class="btn btn-secondary btn-sm" id="mb-add-jump"><span class="material-symbols-outlined" aria-hidden="true">add</span>إضافة عنصر</button>
                </div>
              </div>
              <div class="mb-hint" id="mb-help"><span class="material-symbols-outlined" aria-hidden="true">drag_pan</span><p><strong>اسحب المقبض</strong> لإعادة الترتيب، واسحب <strong>يساراً</strong> لجعل العنصر فرعياً أو <strong>يميناً</strong> لإرجاعه. بلوحة المفاتيح: ركّز على المقبض واستخدم الأسهم.</p></div>
              <ol class="sortable mb-list" id="mb-list" aria-labelledby="t-items" aria-describedby="mb-help"></ol>
              <div id="mb-empty"></div>
            </section>

            <section class="card xl-4 mb-add" id="add" aria-labelledby="t-add">
              <div class="card-head bordered"><div><h2 class="card-title" id="t-add">إضافة عنصر</h2><p class="card-sub">من الصفحات الموجودة أو رابط مخصص أو قسم في الرئيسية.</p></div></div>
              <div class="tabs add-tabs" role="tablist" id="add-tabs" aria-label="مصدر العنصر">
                <button type="button" class="tab" role="tab" id="addt-pages" aria-selected="true" aria-controls="addp-pages"><span class="material-symbols-outlined" aria-hidden="true">web</span>الصفحات</button>
                <button type="button" class="tab" role="tab" id="addt-custom" aria-selected="false" aria-controls="addp-custom" tabindex="-1"><span class="material-symbols-outlined" aria-hidden="true">link</span>رابط مخصص</button>
                <button type="button" class="tab" role="tab" id="addt-anchor" aria-selected="false" aria-controls="addp-anchor" tabindex="-1"><span class="material-symbols-outlined" aria-hidden="true">tag</span>قسم</button>
              </div>
              <div role="tabpanel" id="addp-pages" aria-labelledby="addt-pages" class="add-panel">
                <fieldset class="pick-list"><legend class="sr-only">اختر الصفحات</legend><div id="pick-pages"></div></fieldset>
                <div class="add-foot"><button type="button" class="btn btn-ghost btn-sm" id="pick-pages-all">تحديد الكل</button><button type="button" class="btn btn-primary btn-sm" id="add-pages"><span class="material-symbols-outlined" aria-hidden="true">add</span>إضافة المحدد</button></div>
              </div>
              <div role="tabpanel" id="addp-custom" aria-labelledby="addt-custom" class="add-panel" hidden>
                <form id="custom-form" novalidate class="add-form">
                  <div class="field"><label class="label" for="cl-label"><span>النص <span class="req" aria-hidden="true">*</span></span></label><input class="input" id="cl-label" maxlength="40" required aria-describedby="cl-label-err" placeholder="مثال: تبرّع الآن"><p class="error" id="cl-label-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
                  <div class="field"><label class="label" for="cl-url"><span>الرابط <span class="req" aria-hidden="true">*</span></span></label><span class="input-icon"><span class="material-symbols-outlined" aria-hidden="true">link</span><input class="input" id="cl-url" dir="ltr" required aria-describedby="cl-url-hint cl-url-err" placeholder="https://… أو page.html"></span><p class="hint" id="cl-url-hint">رابط خارجي، أو صفحة داخلية، أو mailto: / tel:</p><p class="error" id="cl-url-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
                  <label class="check-label"><input type="checkbox" class="checkbox" id="cl-tab">فتح في تبويب جديد</label>
                  <div class="add-foot"><span></span><button type="submit" class="btn btn-primary btn-sm"><span class="material-symbols-outlined" aria-hidden="true">add</span>إضافة الرابط</button></div>
                </form>
              </div>
              <div role="tabpanel" id="addp-anchor" aria-labelledby="addt-anchor" class="add-panel" hidden>
                <fieldset class="pick-list"><legend class="sr-only">اختر أقسام الصفحة الرئيسية</legend><div id="pick-anchors"></div></fieldset>
                <div class="add-foot"><a class="btn btn-ghost btn-sm" href="{{ url('/admin/pages') }}#sections"><span class="material-symbols-outlined" aria-hidden="true">reorder</span>ترتيب الأقسام</a><button type="button" class="btn btn-primary btn-sm" id="add-anchors"><span class="material-symbols-outlined" aria-hidden="true">add</span>إضافة المحدد</button></div>
              </div>
            </section>
          </div>
        </div>
        <p class="sr-only" id="mb-live" aria-live="assertive"></p>
      @endsection
@push('scripts')
<script>window.__MENU_BOOT = {!! json_encode($boot, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
<script src="{{ asset('assets/admin/js/admin-dbkit.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-builder-data.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-dnd.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-menu.js') }}"></script>
@endpush
