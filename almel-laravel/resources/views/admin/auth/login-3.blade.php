@extends('layouts.auth')
@section('title', 'تسجيل الدخول — جمعية الشمال للتنمية والتطوير المجتمعي - بوابة الإدارة')
@section('viewport', 'width=device-width, initial-scale=1.0, viewport-fit=cover')
@section('theme_color', '#f7f3ec')
@section('body_attrs') class="lv3"@endsection
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/login-variants.css') }}">
@endpush
@section('body')
  <a class="skip-link" href="#l-email">انتقل إلى نموذج الدخول</a>
  <div class="lv3-pattern lv-fade" aria-hidden="true"><svg aria-hidden="true" focusable="false"><defs><pattern id="lv3-geo" width="96" height="96" patternUnits="userSpaceOnUse"><g fill="none" stroke="currentColor" stroke-width=".8">
          <path d="M28 28h40v40H28z M48 19.7 76.3 48 48 76.3 19.7 48z"/>
          
          <path d="M48 0v19.7 M48 76.3V96 M0 48h19.7 M76.3 48H96"/>
          <path d="M-20 -20h40v40h-40z M0 -28.3 28.3 0 0 28.3 -28.3 0z M76 -20h40v40H76z M96 -28.3 124.3 0 96 28.3 67.7 0z M-20 76h40v40h-40z M0 67.7 28.3 96 0 124.3 -28.3 96z M76 76h40v40H76z M96 67.7 124.3 96 96 124.3 67.7 96z"/>
          </g></pattern></defs><rect width="100%" height="100%" fill="url(#lv3-geo)"/></svg></div>
  <div class="lv-page">
    <main class="lv3-card lv-in" style="--d:0" id="main">
      <div class="lv3-logo">
        <a class="lv-brand lv3-brand-link" href="{{ url('/') }}" aria-label="جمعية الشمال للتنمية والتطوير المجتمعي - بوابة الإدارة، الصفحة الرئيسية للموقع"><span class="lv-mark"><img src="{{ asset('assets/site/img/logo.png') }}" alt="شعار الجمعية" width="44" height="44"></span><span class="lv-brand-text"><strong>جمعية الشمال للتنمية والتطوير المجتمعي</strong><span class="lv-sep"> - </span><span>بوابة الإدارة</span></span></a>
      </div>
      <div class="lv3-divider" aria-hidden="true"></div>
      <h1 class="lv-title lv-in" style="--d:1">تسجيل الدخول</h1>
      <p class="lv-lead lv-in" style="--d:2">أهلاً بعودتك، أدخل بياناتك للمتابعة.</p>
      <form class="lv-form" id="login-form" novalidate>
            <div class="lv-field lv-in" style="--d:2">
              <label class="lv-label" for="l-email">البريد الإلكتروني</label>
              <div class="lv-control">
                <span class="material-symbols-outlined lv-ico" aria-hidden="true">mail</span>
                <input class="lv-input" id="l-email" name="email" type="email" dir="ltr" autocomplete="username" inputmode="email" spellcheck="false" placeholder="name@shamal-society.org" aria-describedby="l-email-err" required>
              </div>
              <p class="lv-error" id="l-email-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
            </div>
            <div class="lv-field lv-in" style="--d:3">
              <label class="lv-label" for="l-pass">كلمة المرور</label>
              <div class="lv-control">
                <span class="material-symbols-outlined lv-ico" aria-hidden="true">lock</span>
                <input class="lv-input has-toggle" id="l-pass" name="password" type="password" dir="ltr" autocomplete="current-password" aria-describedby="l-pass-err" required>
                <button type="button" class="lv-toggle" id="pw-toggle" aria-pressed="false" aria-label="إظهار كلمة المرور" aria-controls="l-pass"><span class="material-symbols-outlined" aria-hidden="true">visibility</span></button>
              </div>
              <p class="lv-error" id="l-pass-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
            </div>
            <div class="lv-row lv-in" style="--d:4">
              <label class="lv-check"><input type="checkbox" id="l-remember" name="remember">تذكّرني</label>
              <a href="{{ url('/admin/forgot-password') }}" class="lv-link" id="forgot">نسيت كلمة المرور؟</a>
            </div>
            <button type="submit" class="lv-btn lv-in" style="--d:5" id="l-submit"><span>تسجيل الدخول</span><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></button>
          </form>
    </main>
    <footer class="lv3-footer">
      <div class="lv3-below lv-in" style="--d:6">
        <a class="lv-back" href="{{ url('/') }}"><span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span><span class="txt">العودة إلى الموقع</span></a>
        <p class="lv-demo" role="note"><span class="material-symbols-outlined" aria-hidden="true">info</span><span><b>قالب تجريبي</b> · أي بريد صالح وكلمة مرور من 4 أحرف</span></p>
      </div>
      <p class="lv3-foot lv-in" style="--d:7">© 2026 جمعية الشمال للتنمية والتطوير المجتمعي · غزة، فلسطين</p>
    </footer>
  </div>

  <div id="lv-toasts" class="lv-toasts" role="status" aria-live="polite"></div>
@endsection
@push('scripts')
<script src="{{ asset('assets/admin/js/login-variants.js') }}"></script>
@endpush
