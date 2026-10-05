@php
  /*
   * Shared Arabic error page (419 / 429 / 500 / 503 / 4xx / 5xx and the public 404).
   * Admin URLs (/admin/*) use the dashboard status design (admin.css + admin-status.css, same as admin/status/*);
   * public URLs use the same layout with the site brand colours (site/css/error-pages.css, no admin assets).
   * Safe by design: never prints exception messages/traces, never touches the DB, session or auth (a 500 may be a DB/session failure).
   */
  $isAdmin = request()->is('admin', 'admin/*');
  $retry   = $retry ?? true;
  $body    = ($isAdmin && ! empty($leadAdmin)) ? $leadAdmin : $lead;
  $ra      = null;
  if (isset($exception) && is_object($exception) && method_exists($exception, 'getHeaders')) {
      $h  = $exception->getHeaders();
      $ra = isset($h['Retry-After']) && is_numeric($h['Retry-After']) ? max(1, min((int) $h['Retry-After'], 86400)) : null;
  }
  $mins   = $ra === null ? 0 : (int) ceil($ra / 60);
  $raText = $ra === null ? null : ($ra < 60
      ? ($ra === 1 ? 'ثانية واحدة' : ($ra === 2 ? 'ثانيتين' : ($ra <= 10 ? $ra.' ثوانٍ' : $ra.' ثانية')))
      : ($mins === 1 ? 'دقيقة واحدة' : ($mins === 2 ? 'دقيقتين' : ($mins <= 10 ? $mins.' دقائق' : $mins.' دقيقة'))));
  $home   = $isAdmin ? url('/admin') : url('/');
  $org    = 'جمعية الشمال للتنمية والتطوير المجتمعي';
@endphp
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ $title }} ({{ $code }}) — {{ $isAdmin ? 'لوحة تحكم '.$org : $org }}</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="{{ $isAdmin ? '#f6f5f2' : '#0C7845' }}">
  <link rel="icon" type="image/png" href="{{ asset('assets/site/img/logo.png') }}">
@if ($isAdmin)
  <script>(function(){try{var d=document.documentElement,t=localStorage.getItem('almel-admin-theme');if(t==='dark')d.classList.add('dark');}catch(e){}})();</script>
@endif
  <link rel="stylesheet" href="{{ asset('assets/site/css/fonts.css') }}">
@if ($isAdmin)
  <link rel="stylesheet" href="{{ asset('assets/admin/css/admin.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/admin/css/admin-status.css') }}">
@else
  <link rel="stylesheet" href="{{ asset('assets/site/css/error-pages.css') }}">
@endif
</head>
<body class="status-page{{ $isAdmin ? '' : ' is-public' }}" data-page="status-error" data-code="{{ $code }}">
  <a class="skip-link" href="#main">تخطَّ إلى المحتوى</a>
  <header class="status-top">
    <a class="login-brand" href="{{ $home }}"><span class="brand-mark"><img src="{{ asset('assets/site/img/logo.png') }}" alt="شعار الجمعية" width="44" height="44"></span><span><strong>{{ $org }}</strong><span>{{ $isAdmin ? 'لوحة التحكم' : 'الموقع الرسمي' }}</span></span></a>
@if ($isAdmin)
    <div class="status-top-actions"><button type="button" class="icon-btn theme-toggle theme-btn" aria-pressed="false" aria-label="الوضع الداكن"><span class="material-symbols-outlined" aria-hidden="true">dark_mode</span></button></div>
@endif
  </header>
  <main class="status-main" id="main" tabindex="-1">
    <div class="status-card">
      @include('errors._art', ['art' => $art ?? 'gear'])
      <span class="status-code"><span class="material-symbols-outlined" aria-hidden="true">{{ $icon }}</span>خطأ {{ $code }}</span>
      <h1>{{ $title }}</h1>
      <p class="status-lead">{{ $body }}@if ($raText) <strong>يمكنك المحاولة مجددًا بعد نحو {{ $raText }}.</strong>@endif</p>
      <div class="status-actions">
@if (! empty($refresh))
        <button type="button" class="btn btn-primary btn-lg" id="err-back" data-home="{{ $home }}"><span class="material-symbols-outlined" aria-hidden="true">refresh</span><span>العودة إلى الصفحة وتحديثها</span></button>
@elseif ($retry)
        <a class="btn btn-primary btn-lg" href="{{ url()->current() }}" rel="nofollow"><span class="material-symbols-outlined" aria-hidden="true">refresh</span>إعادة المحاولة</a>
@else
        <a class="btn btn-primary btn-lg" href="{{ $home }}"><span class="material-symbols-outlined" aria-hidden="true">{{ $isAdmin ? 'dashboard' : 'home' }}</span>{{ $isAdmin ? 'العودة إلى لوحة التحكم' : 'الصفحة الرئيسية' }}</a>
@endif
@if ($retry || ! empty($refresh))
        <a class="btn btn-secondary btn-lg" href="{{ $home }}"><span class="material-symbols-outlined" aria-hidden="true">{{ $isAdmin ? 'dashboard' : 'home' }}</span>{{ $isAdmin ? 'العودة إلى لوحة التحكم' : 'الصفحة الرئيسية' }}</a>
@elseif ($isAdmin)
        <a class="btn btn-secondary btn-lg" href="{{ url('/') }}"><span class="material-symbols-outlined" aria-hidden="true">public</span>زيارة الموقع</a>
@else
        <a class="btn btn-secondary btn-lg" href="{{ url('/contact') }}"><span class="material-symbols-outlined" aria-hidden="true">mail</span>تواصل معنا</a>
@endif
      </div>
@unless ($isAdmin)
      <section class="status-panel" aria-labelledby="err-links-t">
        <h2 class="status-panel-title" id="err-links-t">تصفّح أقسام الموقع</h2>
        <ul class="quick-links">
          <li><a href="{{ url('/') }}"><span class="material-symbols-outlined" aria-hidden="true">home</span>الرئيسية</a></li>
          <li><a href="{{ url('/about') }}"><span class="material-symbols-outlined" aria-hidden="true">info</span>من نحن</a></li>
          <li><a href="{{ url('/projects') }}"><span class="material-symbols-outlined" aria-hidden="true">volunteer_activism</span>المشاريع</a></li>
          <li><a href="{{ url('/news') }}"><span class="material-symbols-outlined" aria-hidden="true">newspaper</span>الأخبار</a></li>
          <li><a href="{{ url('/gallery') }}"><span class="material-symbols-outlined" aria-hidden="true">photo_library</span>معرض الصور</a></li>
          <li><a href="{{ url('/contact') }}"><span class="material-symbols-outlined" aria-hidden="true">mail</span>اتصل بنا</a></li>
        </ul>
      </section>
@endunless
    </div>
  </main>
  <footer class="status-foot"><span>© {{ date('Y') }} {{ $org }}</span><a href="{{ url('/') }}">العودة إلى الموقع</a></footer>
  <div id="toasts" class="toasts" role="status" aria-live="polite"></div>
@if ($isAdmin)
  <script src="{{ asset('assets/admin/js/admin-data.js') }}"></script>
  <script src="{{ asset('assets/admin/js/admin.js') }}"></script>
  <script src="{{ asset('assets/admin/js/admin-status.js') }}"></script>
@endif
@if (! empty($refresh))
  <script>(function(){var b=document.getElementById('err-back');if(!b)return;b.addEventListener('click',function(){var r=document.referrer;try{if(r&&new URL(r).origin===location.origin){location.href=r;return;}}catch(e){}if(history.length>1){history.back();}else{location.href=b.getAttribute('data-home');}});})();</script>
@endif
</body>
</html>
