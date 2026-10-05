<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="@yield('viewport', 'width=device-width, initial-scale=1.0')">
  <title>@yield('title')</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="@yield('theme_color', '#f6f5f2')">
  <link rel="icon" type="image/png" href="{{ asset('assets/site/img/logo.png') }}">
  @yield('head_script')
  <link rel="stylesheet" href="{{ asset('assets/site/css/fonts.css') }}">
  @stack('css')
</head>
<body @yield('body_attrs')>
  @yield('body')
  @stack('scripts')
</body>
</html>
