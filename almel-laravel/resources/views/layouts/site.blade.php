<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
@php
  $__isHome = $__env->hasSection('home');
  $__seoTitle = \App\Support\SiteSettings::title((string) ($seo['title'] ?? ''), $__env->yieldContent('title'), $__isHome);
  $__seoDesc = \App\Support\SiteSettings::description((string) ($seo['description'] ?? ''), $__env->yieldContent('description'), $__isHome);
  $__fav = \App\Support\SiteSettings::favicon();
  $__ogImg = \App\Support\SiteSettings::ogImage();
  $__pg = (int) request()->query('page', 1);
  $__canon = url()->current().($__pg > 1 ? '?page='.$__pg : '');
  $__ga = \App\Support\SiteSettings::analyticsId();
  $__pushed = (string) $__env->yieldPushContent('css');
@endphp
  <title>{{ $__seoTitle }}</title>
  <meta name="description" content="{{ $__seoDesc }}">
  <meta name="theme-color" content="{{ \App\Support\SiteSettings::brandColor() }}">
  <link rel="icon" type="{{ $__fav[1] }}" href="{{ $__fav[0] }}">
@unless (\App\Support\SiteSettings::indexable())
  <meta name="robots" content="noindex, nofollow">
@endunless
@php $__has = fn (string $needle) => str_contains($__pushed, $needle); @endphp
@unless ($__has('rel="canonical"'))
  <link rel="canonical" href="{{ $__canon }}">
@endunless
@unless ($__has('property="og:type"'))
  <meta property="og:type" content="website">
@endunless
  <meta property="og:site_name" content="{{ \App\Support\SiteContent::info()['name'] }}">
  <meta property="og:locale" content="ar_AR">
@unless ($__has('property="og:title"'))
  <meta property="og:title" content="{{ $__seoTitle }}">
@endunless
@unless ($__has('property="og:description"'))
  <meta property="og:description" content="{{ $__seoDesc }}">
@endunless
@unless ($__has('property="og:url"'))
  <meta property="og:url" content="{{ $__canon }}">
@endunless
@if ($__ogImg && ! $__has('property="og:image"'))
  <meta property="og:image" content="{{ $__ogImg }}">
@endif
@unless ($__has('name="twitter:card"'))
  <meta name="twitter:card" content="{{ $__ogImg ? 'summary_large_image' : 'summary' }}">
@endunless
  <meta name="twitter:title" content="{{ $__seoTitle }}">
  <meta name="twitter:description" content="{{ $__seoDesc }}">
@if ($__ogImg && ! $__has('name="twitter:image"') && ! $__has('property="og:image"'))
  <meta name="twitter:image" content="{{ $__ogImg }}">
@endif
@if ($__isHome)
  <script type="application/ld+json">{!! json_encode(\App\Support\SiteSettings::organizationLd(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
@endif
  <script>document.documentElement.classList.add('js');</script>
  <link rel="stylesheet" href="{{ asset('assets/site/css/fonts.css') }}">
  <link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('styles') }}">
  @stack('css')
  {{-- Prebuilt Tailwind (replaces the 398 KB runtime tailwind.js + config.js, both kept in /assets/site/js for rollback) --}}
  <link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('tailwind') }}">
</head>
<body class="bg-canvas text-on-surface antialiased"@hasSection('page') data-page="@yield('page')"@endif>
  <a href="@yield('skip', '#main')" class="skip-link">تخطّ إلى المحتوى</a>

  @hasSection('home')
  @include('partials.site.header-home')
  @else
  @include('partials.site.header', ['a' => trim($__env->yieldContent('active'))])
  @endif

  @yield('content')

  @hasSection('home')
  @include('partials.site.footer-home')
  @else
  @include('partials.site.footer')
  @endif

@if (($__st = \App\Support\SiteTexts::jsConfig()) !== [])
  <script>window.SITE_T = {!! json_encode($__st, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
@endif
@if ($__ga)
@php request()->attributes->set('csp_analytics', true); @endphp
  <script>window.ALMEL_GA = {!! json_encode(['id' => $__ga, 'anonymize' => \App\Support\SiteSettings::flag('seo.anonymize_ip', true), 'banner' => \App\Support\SiteSettings::flag('seo.cookie_banner', true)], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
  <script src="{{ asset('assets/site/js/analytics.js') }}"></script>
@endif
  @stack('scripts')
</body>
</html>
