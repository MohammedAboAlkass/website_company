@extends('layouts.auth')
@section('title', 'تسجيل الدخول — لوحة تحكم جمعية الشمال للتنمية والتطوير المجتمعي')
@section('viewport', 'width=device-width, initial-scale=1.0')
@section('theme_color', '#f6f5f2')
@section('body_attrs') data-page="login"@endsection
@section('head_script')
<script>(function(){try{var d=document.documentElement,t=localStorage.getItem('almel-admin-theme');if(t==='dark')d.classList.add('dark');if(localStorage.getItem('almel-admin-sb')==='1')d.classList.add('sb-collapsed');}catch(e){}})();</script>
@endsection
@section('body')
  <div class="login">
    <main class="login-form-side" id="main">
      <div class="login-top">
        <a class="login-brand" href="{{ url('/') }}"><span class="brand-mark"><img src="{{ asset('assets/site/img/logo.png') }}" alt="شعار الجمعية" width="44" height="44"></span><span><strong>جمعية الشمال للتنمية والتطوير المجتمعي</strong><span>لوحة التحكم</span></span></a>
        <button type="button" class="icon-btn theme-toggle theme-btn" aria-pressed="false" aria-label="الوضع الداكن"><span class="material-symbols-outlined" aria-hidden="true">dark_mode</span></button>
      </div>
      <div class="login-form-wrap">
        
        <h1 class="mt-16">مرحباً بعودتك</h1>
        <p class="lead">سجّل الدخول لإدارة المشاريع والأخبار والأنشطة.</p>
        <form id="login-form" novalidate>
          <div class="field">
            <label class="label" for="l-email">البريد الإلكتروني</label>
            <span class="input-icon"><span class="material-symbols-outlined" aria-hidden="true">mail</span><input class="input" id="l-email" type="email" dir="ltr" autocomplete="username" inputmode="email" placeholder="name@shamal-society.org" aria-describedby="l-email-err" required style="text-align:right;height:48px"></span>
            <p class="error" id="l-email-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
          </div>
          <div class="field">
            <label class="label" for="l-pass">كلمة المرور</label>
            <span class="input-icon"><span class="material-symbols-outlined" aria-hidden="true">lock</span><input class="input" id="l-pass" type="password" autocomplete="current-password" aria-describedby="l-pass-err l-pass-hint" required style="height:48px;padding-inline-end:48px"><span class="input-end"><button type="button" class="pw-toggle" id="pw-toggle" aria-pressed="false" aria-label="إظهار كلمة المرور" aria-controls="l-pass"><span class="material-symbols-outlined" aria-hidden="true">visibility</span></button></span></span>
            <p class="hint" id="l-pass-hint">4 أحرف على الأقل</p>
            <p class="error" id="l-pass-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
          </div>
          <div class="login-row">
            <label class="check-label"><input type="checkbox" class="checkbox" id="l-remember">تذكّرني على هذا الجهاز</label>
            <a href="{{ url('/admin/forgot-password') }}" id="forgot" class="link" style="font-size:13px">نسيت كلمة المرور؟</a>
          </div>
          <button type="submit" class="btn btn-primary btn-lg btn-block" id="l-submit"><span class="material-symbols-outlined flip-rtl" aria-hidden="true">login</span><span class="btn-text">تسجيل الدخول</span></button>
        </form>
        <div class="login-note" role="note"><span class="material-symbols-outlined" aria-hidden="true">info</span><p><strong>قالب ثابت للعرض:</strong> لا يوجد خادم أو قاعدة بيانات. أي بريد إلكتروني صالح مع كلمة مرور من 4 أحرف أو أكثر ينقلك إلى لوحة التحكم.</p></div>
      </div>
      <div class="login-foot"><span>© 2026 جمعية الشمال للتنمية والتطوير المجتمعي</span><a href="{{ url('/') }}">العودة إلى الموقع</a></div>
    </main>
    <aside class="login-media" aria-label="لمحة عن المنصة">
      <img src="{{ asset('assets/site/img/gallery-convoy.jpg') }}" alt="">
      <div class="lm-top"><span class="lm-badge"><span class="dot" aria-hidden="true"></span>غرفة عمليات غزة</span><span class="lm-badge">أرقام تجريبية</span></div>
      <h2>كل مشروع يُتابَع.. <span>وكل أثر يُوثَّق</span></h2>
      <p>منصة واحدة لإدارة مشاريع الإغاثة في محافظات القطاع الخمس، من التخطيط حتى توثيق وصول المساعدة إلى العائلات.</p>
      <ul class="stat-chips">
        <li class="stat-chip"><span class="sc-ico"><span class="material-symbols-outlined" aria-hidden="true">diversity_3</span></span><div><b class="ltr">5</b><span>محافظات يغطيها العمل الميداني</span></div></li>
        <li class="stat-chip"><span class="sc-ico"><span class="material-symbols-outlined" aria-hidden="true">volunteer_activism</span></span><div><b>12</b><span>مشروعاً قيد الإدارة</span></div></li>
        <li class="stat-chip"><span class="sc-ico"><span class="material-symbols-outlined" aria-hidden="true">diversity_3</span></span><div><b>88,950</b><span>مستفيداً هذا الشهر</span></div></li>
      </ul>
    </aside>
  </div>
  <div id="toasts" class="toasts" role="status" aria-live="polite"></div>
@endsection
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-data.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin.js') }}"></script>
@endpush
