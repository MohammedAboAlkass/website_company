<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@yield('title') — لوحة تحكم جمعية الشمال للتنمية والتطوير المجتمعي</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <meta name="theme-color" content="#f6f5f2">
  <link rel="icon" type="image/png" href="{{ asset('assets/site/img/logo.png') }}">
  @php($__almelAp = \App\Support\SettingsStore::appearanceOrNull())
  @if ($__almelAp)
  <script>(function(){try{var a={!! json_encode($__almelAp, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!},def={accent:'#f28c14',scale:'md',density:'comfortable',sidebar:'navy',radius:'md'},o={},same=true;if(a.theme==='dark'||a.theme==='light')localStorage.setItem('almel-admin-theme',a.theme);Object.keys(def).forEach(function(k){o[k]=a[k]||def[k];if(o[k]!==def[k])same=false;});if(same)localStorage.removeItem('almel-admin-appearance');else localStorage.setItem('almel-admin-appearance',JSON.stringify(o));}catch(e){}})();</script>
  @endif
  <script>(function(){try{var d=document.documentElement,t=localStorage.getItem('almel-admin-theme');if(t==='dark')d.classList.add('dark');if(localStorage.getItem('almel-admin-sb')==='1')d.classList.add('sb-collapsed');}catch(e){}})();</script>
  <link rel="preload" href="{{ asset('assets/site/css/fonts/material-symbols-outlined.woff2') }}" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{{ asset('assets/site/css/fonts.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/admin/css/admin.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/admin/css/admin-notif.css') }}">
  <script type="speculationrules">
  {
    "prefetch": [
      {
        "source": "list",
        "urls": [
          "{{ url('/admin') }}",
          "{{ url('/admin/reports') }}",
          "{{ url('/admin/homepage') }}",
          "{{ url('/admin/hero') }}",
          "{{ url('/admin/projects') }}",
          "{{ url('/admin/news') }}",
          "{{ url('/admin/tags') }}",
          "{{ url('/admin/gallery') }}",
          "{{ url('/admin/media') }}",
          "{{ url('/admin/stories') }}",
          "{{ url('/admin/activities') }}",
          "{{ url('/admin/partners') }}",
          "{{ url('/admin/faq') }}",
          "{{ url('/admin/appeal') }}",
          "{{ url('/admin/announcements') }}",
          "{{ url('/admin/impact') }}",
          "{{ url('/admin/vision') }}",
          "{{ url('/admin/pages') }}",
          "{{ url('/admin/site-texts') }}",
          "{{ url('/admin/menu') }}",
          "{{ url('/admin/messages') }}",
          "{{ url('/admin/newsletter') }}",
          "{{ url('/admin/users') }}",
          "{{ url('/admin/roles') }}",
          "{{ url('/admin/backup') }}",
          "{{ url('/admin/audit-logs') }}",
          "{{ url('/admin/settings') }}"
        ],
        "eagerness": "moderate"
      }
    ]
  }
  </script>
  @stack('css')
</head>
<body data-page="@yield('page')">
  <div id="nav-loader" aria-hidden="true"></div>
  <a class="skip-link" href="#main">تخطَّ إلى المحتوى</a>
  <div class="app">
    <aside class="sidebar" id="sidebar" aria-label="القائمة الجانبية">
      @include('partials.admin-sidebar')
    </aside>
    <div class="main">
      <header class="topbar" id="topbar"></header>
      <main class="content" id="main" tabindex="-1">@yield('content')</main>
    </div>
  </div>

  @yield('after')
  <div id="toasts" class="toasts" role="status" aria-live="polite"></div>
  @auth
  <script>window.__ADMIN_USER = {!! json_encode(['name' => auth()->user()->name, 'email' => auth()->user()->email, 'role' => auth()->user()->role, 'role_label' => auth()->user()->roleLabel(), 'avatar' => auth()->user()->avatarUrl(), 'is_super' => auth()->user()->isSuperAdmin(), 'permissions' => auth()->user()->permissionKeys()], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
  <script>window.__ADMIN_NOTIF = {!! json_encode(\App\Support\NotificationService::feed(auth()->user()), JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
  @endauth
  @if (session('success') || session('error'))
  <script>window.__FLASH = {!! json_encode(['type' => session('error') ? 'error' : 'success', 'message' => session('error') ?: session('success')], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
  @endif
  <script>window.__ADMIN_COUNTS = {!! json_encode(\App\Support\AdminStats::sidebar()) !!};</script>
  <script src="{{ asset('assets/admin/js/admin-data.js') }}"></script>
  @php($__almelConst = \App\Support\ConstantsStore::groupsOrNull())
  @if ($__almelConst)
  <script>window.__ALMEL_CONSTANTS = {!! json_encode($__almelConst, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
  @endif
  @isset($settingsBoot)
  <script>window.__ALMEL_SETTINGS = {!! json_encode($settingsBoot, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_PARTIAL_OUTPUT_ON_ERROR) !!};</script>
  @endisset
  @stack('constants')
  <script src="{{ asset('assets/admin/js/admin-perm.js') }}"></script>
  <script src="{{ asset('assets/admin/js/admin.js') }}"></script>
  @stack('scripts')
  <script>(function(){var f=window.__FLASH;if(f&&window.AdminUI){window.AdminUI.toast(f.message,f.type==='error'?{tone:'danger',icon:'error'}:{});}})();</script>
</body>
</html>
