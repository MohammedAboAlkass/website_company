@extends('layouts.admin')
@section('title', 'إدارة الصفحات')
@section('page', 'pages')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-builder.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-editor.css') }}">
@endpush
@section('content')

        <div class="page-head">
          <div><h1 class="page-title">إدارة الصفحات</h1><p class="page-sub">أنشئ صفحات الموقع العام وحرّر محتواها وحالة نشرها وبيانات محركات البحث، ورتّب أقسام الصفحة الرئيسية.</p></div>
          <div class="page-actions">
            <button type="button" class="btn btn-primary" id="pg-new"><span class="material-symbols-outlined" aria-hidden="true">add</span>صفحة جديدة</button>
          </div>
        </div>

        <section class="card" aria-label="ملخص الصفحات"><dl class="mini-stats" id="pg-stats"></dl></section>

        <section class="card mt-24" aria-labelledby="t-pages">
          <div class="card-head bordered">
            <div><h2 class="card-title" id="t-pages">صفحات الموقع</h2><p class="card-sub">الحالة، آخر تعديل، ومعاينة نتيجة البحث لكل صفحة.</p></div>
            <span class="save-state" id="pg-saved" aria-live="polite"><span class="material-symbols-outlined" aria-hidden="true">cloud_done</span><span>محفوظة في قاعدة البيانات</span></span>
          </div>
          <div class="tabs" role="tablist" id="pg-tabs" aria-label="حالة الصفحة" data-shared-panel="true">
            <button type="button" class="tab" role="tab" id="pgt-all" data-value="all" aria-selected="true" aria-controls="pg-panel">الكل <span class="tab-count" data-tab-count="all"></span></button>
            <button type="button" class="tab" role="tab" id="pgt-published" data-value="published" aria-selected="false" aria-controls="pg-panel" tabindex="-1">منشورة <span class="tab-count" data-tab-count="published"></span></button>
            <button type="button" class="tab" role="tab" id="pgt-draft" data-value="draft" aria-selected="false" aria-controls="pg-panel" tabindex="-1">مسودة <span class="tab-count" data-tab-count="draft"></span></button>
            <button type="button" class="tab" role="tab" id="pgt-hidden" data-value="hidden" aria-selected="false" aria-controls="pg-panel" tabindex="-1">مخفية <span class="tab-count" data-tab-count="hidden"></span></button>
          </div>
          <div class="toolbar">
            <label class="input-icon"><span class="sr-only">بحث في الصفحات</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" id="pg-search" type="search" placeholder="ابحث بالاسم أو الرابط أو الوصف…" autocomplete="off"></label>
            <label class="sr-only" for="pg-status">تصفية حسب الحالة</label><select class="select sm auto" id="pg-status" data-const="page_status" data-ph-value="all" data-ph-label="كل الحالات"></select>
            <span class="grow"></span>
            <span class="muted" id="pg-count" aria-live="polite" style="font-size:13px"></span>
          </div>
          <div id="pg-panel" role="tabpanel" aria-labelledby="pgt-all"><div id="pg-body"></div></div>
        </section>

        <div class="grid mt-24" id="sections">
          <section class="card xl-8" aria-labelledby="t-sections">
            <div class="card-head bordered">
              <div><h2 class="card-title" id="t-sections">أقسام الصفحة الرئيسية</h2><p class="card-sub" id="sec-sub">اسحب المقبض لإعادة الترتيب، أو استخدم أزرار التحريك ومفاتيح الأسهم.</p></div>
              <div class="row-actions">
                <span class="save-state" id="sec-saved" aria-live="polite"><span class="material-symbols-outlined" aria-hidden="true">cloud_done</span><span>محفوظ</span></span>
                <a class="btn btn-secondary btn-sm" href="{{ url('/admin/homepage') }}"><span class="material-symbols-outlined" aria-hidden="true">title</span>تعديل العناوين</a>
                <button type="button" class="btn btn-ghost btn-sm" id="sec-reset"><span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>استعادة الترتيب</button>
              </div>
            </div>
            <p class="sr-only" id="sec-help">لتحريك قسم بلوحة المفاتيح: ركّز على مقبض السحب ثم استخدم السهمين للأعلى والأسفل.</p>
            <ol class="sortable sec-list" id="sec-list" aria-labelledby="t-sections"></ol>
          </section>
          <section class="card xl-4" aria-labelledby="t-outline">
            <div class="card-head bordered"><div><h2 class="card-title" id="t-outline">مخطط الصفحة الرئيسية</h2><p class="card-sub" id="outline-sub"></p></div></div>
            <div class="card-body">
              <figure class="outline-fig">
                <div class="outline-frame" id="outline" aria-hidden="true"></div>
                <figcaption class="hint">معاينة تقريبية لترتيب الأقسام كما ستظهر للزائر.</figcaption>
              </figure>
            </div>
          </section>
        </div>
      @endsection
@section('after')
<div class="drawer" id="page-drawer" role="dialog" aria-modal="true" aria-labelledby="pd-title" aria-describedby="pd-sub" hidden>
    <form id="page-form" novalidate style="display:contents">
      <div class="drawer-head">
        <div><h2 id="pd-title">تحرير الصفحة</h2><p id="pd-sub">العنوان والرابط ووصف محركات البحث.</p></div>
        <button type="button" class="icon-btn" data-close-drawer aria-label="إغلاق"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
      </div>
      <div class="drawer-body">
        <div class="field">
          <label class="label" for="pf-name"><span>اسم الصفحة <span class="req" aria-hidden="true">*</span></span></label>
          <input class="input" id="pf-name" maxlength="60" required aria-describedby="pf-name-hint pf-name-err" placeholder="مثال: من نحن">
          <p class="hint" id="pf-name-hint">يظهر في لوحة التحكم وعند اختيار الصفحة في منشئ القائمة.</p>
          <p class="error" id="pf-name-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
        </div>
        <div class="field">
          <label class="label" for="pf-seo"><span>عنوان الصفحة في المتصفح <span class="req" aria-hidden="true">*</span></span><span class="counter" id="pf-seo-count">0 / 60</span></label>
          <input class="input" id="pf-seo" maxlength="90" required aria-describedby="pf-seo-err" placeholder="عنوان يظهر في نتائج البحث">
          <p class="error" id="pf-seo-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
        </div>
        <div class="field">
          <label class="label" for="pf-slug"><span>الرابط (Slug)</span></label>
          <div class="slug-input"><span class="slug-prefix" aria-hidden="true">shamal-society.org/</span><input class="input" id="pf-slug" dir="ltr" maxlength="60" autocomplete="off" spellcheck="false" aria-describedby="pf-slug-hint pf-slug-err" placeholder="about-us"></div>
          <p class="hint" id="pf-slug-hint">أحرف لاتينية صغيرة وأرقام وشرطات فقط.</p>
          <p class="error" id="pf-slug-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
        </div>
        <div class="field">
          <label class="label" for="pf-meta"><span>وصف الميتا (Meta description)</span><span class="counter" id="pf-meta-count">0 / 160</span></label>
          <textarea class="textarea" id="pf-meta" rows="3" maxlength="320" placeholder="ملخص جذاب من 70 إلى 160 حرفاً يظهر تحت العنوان في نتائج البحث…"></textarea>
        </div>
        <div class="field" id="pf-body-field">
          <label class="label" for="pf-body"><span>محتوى الصفحة</span></label>
          <textarea class="textarea" id="pf-body" rows="8" aria-describedby="pf-body-hint"></textarea>
          <p class="hint" id="pf-body-hint">يظهر هذا المحتوى للزوار عندما تكون الصفحة منشورة.</p>
        </div>
        <div class="field">
          <label class="label" for="pf-status">الحالة</label>
          <select class="select" id="pf-status" data-const="page_status" data-notes></select>
        </div>
        <div class="field">
          <div class="row-between"><span class="label" id="serp-label">معاينة نتيجة Google</span>
            <div class="seg" id="serp-seg" role="group" aria-label="جهاز المعاينة"><button type="button" data-value="desktop" aria-pressed="true"><span class="material-symbols-outlined" aria-hidden="true">desktop_windows</span>حاسوب</button><button type="button" data-value="mobile" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">smartphone</span>جوال</button></div>
          </div>
          <div class="serp" id="serp" role="group" aria-labelledby="serp-label" aria-live="polite">
            <div class="serp-site"><span class="serp-fav" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-2.8 3.6-7 6.2-7 10.2A7 7 0 0 0 12 21a7 7 0 0 0 7-7.8C19 9.2 14.8 6.6 12 3Z"/></svg></span><span class="serp-meta"><span class="serp-name">جمعية الشمال للتنمية والتطوير المجتمعي</span><span class="serp-url" id="serp-url" dir="ltr"></span></span><span class="serp-dots" aria-hidden="true"><span class="material-symbols-outlined" aria-hidden="true">more_vert</span></span></div>
            <p class="serp-title" id="serp-title"></p>
            <p class="serp-desc" id="serp-desc"></p>
          </div>
          <ul class="seo-checks" id="seo-checks" aria-label="فحص محركات البحث"></ul>
        </div>
      </div>
      <div class="drawer-foot">
        <button type="button" class="btn btn-secondary" data-close-drawer>إلغاء</button>
        <button type="submit" class="btn btn-primary"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ الصفحة</button>
      </div>
    </form>
  </div>

  
@endsection
@push('constants')
<script src="{{ asset('assets/admin/js/admin-constants.js') }}"></script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-builder-data.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-dnd.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-editor.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-dbkit.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-pages.js') }}"></script>
@endpush
