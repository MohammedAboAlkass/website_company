@extends('layouts.auth')
@section('title', 'الصفحة غير موجودة (404) — لوحة تحكم جمعية الشمال للتنمية والتطوير المجتمعي')
@section('viewport', 'width=device-width, initial-scale=1.0')
@section('theme_color', '#f6f5f2')
@section('body_attrs') class="status-page" data-page="status-404"@endsection
@section('head_script')
<script>(function(){try{var d=document.documentElement,t=localStorage.getItem('almel-admin-theme');if(t==='dark')d.classList.add('dark');}catch(e){}})();</script>
@endsection
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-status.css') }}">
@endpush
@section('body')
  <header class="status-top">
    <a class="login-brand" href="{{ url('/admin') }}"><span class="brand-mark"><img src="{{ asset('assets/site/img/logo.png') }}" alt="شعار الجمعية" width="44" height="44"></span><span><strong>جمعية الشمال للتنمية والتطوير المجتمعي</strong><span>لوحة التحكم</span></span></a>
    <div class="status-top-actions"><button type="button" class="icon-btn theme-toggle theme-btn" aria-pressed="false" aria-label="الوضع الداكن"><span class="material-symbols-outlined" aria-hidden="true">dark_mode</span></button></div>
  </header>
  <main class="status-main" id="main">
    <div class="status-card">
    <svg class="status-art" viewBox="0 0 400 240" aria-hidden="true" focusable="false">
      <ellipse class="ill-soft" cx="200" cy="214" rx="170" ry="14"/>
      <circle class="ill-soft" cx="200" cy="118" r="98"/>
      <path class="ill-dash" d="M34 176 C 90 120, 120 210, 170 150 S 260 90, 300 150 S 360 170, 372 120"/>
      <g class="ill-float">
        <text x="200" y="160" text-anchor="middle" class="ill-ink" font-family="IBM Plex Sans Arabic, sans-serif" font-size="128" font-weight="700" direction="ltr" letter-spacing="4">4<tspan fill="transparent">0</tspan>4</text>
        <circle class="ill-amber-soft" cx="200" cy="116" r="44"/>
        <circle class="ill-card ill-stroke-card" cx="200" cy="116" r="32"/>
        <g class="ill-spin-rev"><path class="ill-amber" d="M200 90 l8 26 -8 26 -8 -26z"/><circle class="ill-ink" cx="200" cy="116" r="4.5"/></g>
      </g>
      <circle class="ill-amber-2 ill-pulse" cx="62" cy="62" r="6"/><circle class="ill-ink-2" cx="344" cy="54" r="4"/><circle class="ill-amber" cx="352" cy="196" r="5"/>
      <path class="ill-line" d="M318 92 l10 0 M323 87 l0 10"/><path class="ill-line" d="M70 196 l10 0 M75 191 l0 10"/>
    </svg>
      <span class="status-code"><span class="material-symbols-outlined" aria-hidden="true">explore_off</span>خطأ 404</span>
      <h1>لم نجد هذه الصفحة</h1>
      <p class="status-lead">ربما نُقلت الصفحة أو تغيّر رابطها، أو أن العنوان كُتب بشكل غير صحيح<span id="nf-path"></span>. جرّب البحث أو اختر أحد الأقسام أدناه.</p>
      <div class="status-actions">
        <a class="btn btn-primary btn-lg" href="{{ url('/admin') }}"><span class="material-symbols-outlined" aria-hidden="true">dashboard</span>العودة إلى لوحة التحكم</a>
        <a class="btn btn-secondary btn-lg" href="{{ url('/') }}"><span class="material-symbols-outlined" aria-hidden="true">public</span>زيارة الموقع</a>
      </div>
      <section class="status-panel" aria-labelledby="nf-links-t">
        <h2 class="status-panel-title" id="nf-links-t">إلى أين تريد الذهاب؟</h2>
        <form class="status-search" id="nf-form" role="search">
          <label class="sr-only" for="nf-q">ابحث عن صفحة في لوحة التحكم</label>
          <span class="material-symbols-outlined" aria-hidden="true">search</span>
          <input class="input" id="nf-q" type="search" placeholder="ابحث: المشاريع، الرسائل، الإعدادات…" autocomplete="off" aria-describedby="nf-count">
        </form>
        <ul class="quick-links" id="nf-links"><li data-kw="نظرة عامة لوحة رئيسية dashboard"><a href="{{ url('/admin') }}"><span class="material-symbols-outlined" aria-hidden="true">dashboard</span>نظرة عامة</a></li><li data-kw="المشاريع مشاريع projects"><a href="{{ url('/admin/projects') }}"><span class="material-symbols-outlined" aria-hidden="true">volunteer_activism</span>المشاريع</a></li><li data-kw="الأخبار اخبار news"><a href="{{ url('/admin/news') }}"><span class="material-symbols-outlined" aria-hidden="true">newspaper</span>الأخبار</a></li><li data-kw="معرض الصور صور gallery"><a href="{{ url('/admin/gallery') }}"><span class="material-symbols-outlined" aria-hidden="true">photo_library</span>معرض الصور</a></li><li data-kw="الرسائل رسائل طلبات messages"><a href="{{ url('/admin/messages') }}"><span class="material-symbols-outlined" aria-hidden="true">mail</span>الرسائل</a></li><li data-kw="التقارير تقارير احصائيات reports"><a href="{{ url('/admin/reports') }}"><span class="material-symbols-outlined" aria-hidden="true">monitoring</span>التقارير</a></li><li data-kw="الصفحات صفحات pages"><a href="{{ url('/admin/pages') }}"><span class="material-symbols-outlined" aria-hidden="true">web</span>الصفحات</a></li><li data-kw="الإعدادات اعدادات settings"><a href="{{ url('/admin/settings') }}"><span class="material-symbols-outlined" aria-hidden="true">settings</span>الإعدادات</a></li></ul>
        <p class="quick-empty" id="nf-empty" hidden>لا توجد صفحة بهذا الاسم. جرّب كلمة أخرى.</p>
        <p class="sr-only" id="nf-count" aria-live="polite"></p>
      </section>
    </div>
  </main>
  <footer class="status-foot"><span>© 2026 جمعية الشمال للتنمية والتطوير المجتمعي · قالب تجريبي</span><a href="{{ url('/') }}">العودة إلى الموقع</a></footer>
  <div id="toasts" class="toasts" role="status" aria-live="polite"></div>
@endsection
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-data.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-status.js') }}"></script>
@endpush
