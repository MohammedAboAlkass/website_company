@php $__nav = \App\Support\SiteContent::nav(); @endphp
<header id="site-header" class="site-header is-top">
    <div class="navbar">
      <div class="mx-auto flex h-[76px] max-w-page items-center justify-between gap-5 px-5 md:px-8">
        <a href="#hero" class="brand flex shrink-0 items-center gap-3">
          <span class="brand-mark has-logo"><img src="{{ \App\Support\SiteSettings::logoUrl() }}" alt="شعار الجمعية" width="52" height="52"></span>
          <span class="flex flex-col">
            <span class="brand-title text-[15px] font-bold leading-tight">جمعية الشمال للتنمية والتطوير المجتمعي</span>
            <span class="brand-en" dir="ltr" lang="en">Al-Shamal Association for Community Development</span>
          </span>
        </a>

        <nav class="hidden items-center gap-1 xl:flex" aria-label="التنقل الرئيسي">
@if ($__nav)
@include('partials.site.nav-links', ['nav' => $__nav, 'home' => true, 'a' => '', 'mobile' => false])
@else
          <a class="nav-link is-active" href="#hero">الرئيسية</a>
          <a class="nav-link" href="#about">من نحن</a>
          <a class="nav-link" href="#projects">المشاريع</a>
          <a class="nav-link" href="#activities">الأنشطة</a>
          <a class="nav-link" href="#news">الأخبار</a>
          <a class="nav-link" href="#partners">الشركاء</a>
          <a class="nav-link" href="#gallery">المعرض</a>
          <a class="nav-link" href="{{ route('admin.login') }}">بوابة الإدارة</a>
          <a class="nav-link" href="#contact">تواصل معنا</a>
        @endif
</nav>

        <div class="flex items-center gap-2">
          <button id="menu-btn" class="icon-btn menu-btn xl:hidden" aria-label="{{ \App\Support\SiteTexts::t('js.menu.open') }}" aria-expanded="false" aria-controls="mobile-menu">
            <span class="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <div id="mobile-menu" class="mobile-menu xl:hidden" hidden>
    <div class="mobile-menu-backdrop" data-close></div>
    <div class="mobile-menu-panel">
      <nav class="flex flex-col gap-1" id="mobile-nav" aria-label="القائمة">
@if ($__nav)
@include('partials.site.nav-links', ['nav' => $__nav, 'home' => true, 'a' => '', 'mobile' => true])
@else
        <a href="#hero"><span class="material-symbols-outlined">home</span>الرئيسية</a>
        <a href="#about"><span class="material-symbols-outlined">account_balance</span>من نحن</a>
        <a href="#projects"><span class="material-symbols-outlined">cases</span>المشاريع والبرامج</a>
        <a href="#activities"><span class="material-symbols-outlined">verified</span>الأنشطة والأعمال</a>
        <a href="#news"><span class="material-symbols-outlined">newspaper</span>الأخبار</a>
        <a href="#partners"><span class="material-symbols-outlined">handshake</span>الشركاء</a>
        <a href="#gallery"><span class="material-symbols-outlined">perm_media</span>معرض الصور</a>
        <a href="{{ route('admin.login') }}"><span class="material-symbols-outlined">admin_panel_settings</span>بوابة الإدارة</a>
        <a href="#contact"><span class="material-symbols-outlined">contact_support</span>تواصل معنا</a>
      @endif
</nav>
      @if ($__nav && $__nav['cta'])
<a href="{{ ($__nav['cta']['url'] === '/' || str_starts_with($__nav['cta']['url'], '/#')) ? (substr($__nav['cta']['url'], 1) ?: '#hero') : $__nav['cta']['url'] }}" class="btn btn-donate mt-4 h-12 w-full text-[15px]" data-close>
<span class="material-symbols-outlined fill text-[20px]">{{ $__nav['cta']['icon'] ?: 'campaign' }}</span>
{{ $__nav['cta']['label'] }}
</a>
@elseif (! $__nav)
<a href="#appeal" class="btn btn-donate mt-4 h-12 w-full text-[15px]" data-close>
        <span class="material-symbols-outlined fill text-[20px]">volunteer_activism</span>
        ساهم في إغاثة غزة الآن
      </a>
@endif
    </div>
  </div>

  
