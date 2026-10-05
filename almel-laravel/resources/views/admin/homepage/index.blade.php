@extends('layouts.admin')
@section('title', 'الصفحة الرئيسية')
@section('page', 'homepage')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-builder.css') }}">
@endpush
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-homepage.css') }}">
@endpush
@section('content')

        <div class="page-head">
          <div><h1 class="page-title">الصفحة الرئيسية</h1><p class="page-sub">عدّل نصوص أقسام الصفحة الرئيسية (العنوان الفرعي والعنوان والنص التمهيدي والزر)، ورتّبها بالسحب، وأظهر أو أخفِ ما تريد. تُحفظ التغييرات في قاعدة البيانات وتظهر للزوار مباشرة.</p></div>
          <div class="page-actions mb-actions">
            <span class="save-state mb-state" id="hp-state" aria-live="polite"></span>
            <button type="button" class="btn btn-secondary" id="hp-reset" data-perm="homepage.edit"><span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>استعادة الافتراضي</button>
            <button type="button" class="btn btn-primary" id="hp-save" data-perm="homepage.edit" aria-keyshortcuts="Control+S"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ التغييرات</button>
          </div>
        </div>

        <p class="hp-help" id="hp-readonly" hidden role="note"><span class="material-symbols-outlined" aria-hidden="true">lock</span><span>صلاحيتك تسمح بعرض الصفحة فقط؛ لا يمكنك تعديل الأقسام.</span></p>

        <div class="grid">
          <section class="card xl-8" aria-labelledby="t-hp">
            <div class="card-head bordered">
              <div><h2 class="card-title" id="t-hp">أقسام الصفحة</h2><p class="card-sub" id="hp-sub"></p></div>
              <button type="button" class="btn btn-ghost btn-sm" id="hp-expand" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">unfold_more</span><span>فتح الكل</span></button>
            </div>
            <div class="hp-help">
              <span class="material-symbols-outlined" aria-hidden="true">info</span>
              <p>اسحب المقبض لتغيير الترتيب، واضغط <strong>تعديل</strong> لتغيير نصوص القسم، ثم <strong>حفظ التغييرات</strong>. نصوص الواجهة الرئيسية والإعلانات ونداء الإغاثة تُدار من صفحاتها الخاصة (الترتيب والإظهار فقط من هنا).</p>
            </div>
            <p class="sr-only" id="hp-dnd-help">لتحريك قسم بلوحة المفاتيح: ركّز على مقبض السحب ثم استخدم السهمين للأعلى والأسفل.</p>
            <ol class="sortable sec-list hp-list" id="hp-list" aria-labelledby="t-hp"></ol>
          </section>
          <section class="card xl-4 hp-aside" aria-labelledby="t-hp-outline">
            <div class="card-head bordered"><div><h2 class="card-title" id="t-hp-outline">مخطط الصفحة</h2><p class="card-sub" id="hp-outline-sub"></p></div></div>
            <div class="card-body">
              <figure class="outline-fig">
                <div class="outline-frame hp-outline" id="hp-outline" aria-hidden="true"></div>
                <figcaption class="hint">معاينة مبسطة لترتيب الأقسام الظاهرة وعناوينها.</figcaption>
              </figure>
            </div>
          </section>
        </div>
        <p class="sr-only" id="hp-live" aria-live="assertive"></p>
      @endsection
@push('constants')
<script>window.__DB_PAGES = { homepage: 1 }; window.__HOMEPAGE = {!! json_encode($boot, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_PARTIAL_OUTPUT_ON_ERROR) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-builder-data.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-dbkit.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-dnd.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-homepage.js') }}"></script>
@endpush
