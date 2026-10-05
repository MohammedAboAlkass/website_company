@extends('layouts.auth')
@section('title', 'تحت الصيانة — لوحة تحكم جمعية الشمال للتنمية والتطوير المجتمعي')
@section('viewport', 'width=device-width, initial-scale=1.0')
@section('theme_color', '#f6f5f2')
@section('body_attrs') class="status-page" data-page="status-maintenance"@endsection
@section('head_script')
<meta name="csrf-token" content="{{ csrf_token() }}">
<script>(function(){try{var d=document.documentElement,t=localStorage.getItem('almel-admin-theme');if(t==='dark')d.classList.add('dark');}catch(e){}})();</script>
@endsection
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-status.css') }}">
@endpush
@php
  $__m = \App\Support\Maintenance::load();
  $__mInfo = \App\Support\Maintenance::publicInfo($__m);
  $__mStatus = \App\Support\Maintenance::status($__m);
  $__u = auth()->user();
  $__canManage = $__u && $__u->isActive() && $__u->hasPermission('settings.edit');
@endphp
@section('body')
  <header class="status-top">
    <a class="login-brand" href="{{ url('/admin') }}"><span class="brand-mark"><img src="{{ asset('assets/site/img/logo.png') }}" alt="شعار الجمعية" width="44" height="44"></span><span><strong>جمعية الشمال للتنمية والتطوير المجتمعي</strong><span>لوحة التحكم</span></span></a>
    <div class="status-top-actions"><button type="button" class="icon-btn theme-toggle theme-btn" aria-pressed="false" aria-label="الوضع الداكن"><span class="material-symbols-outlined" aria-hidden="true">dark_mode</span></button></div>
  </header>
  <main class="status-main" id="main">
    <div class="status-card">
    <svg class="status-art" viewBox="0 0 400 240" aria-hidden="true" focusable="false">
      <ellipse class="ill-soft" cx="200" cy="218" rx="160" ry="12"/>
      <rect class="ill-card ill-stroke-card" x="92" y="44" width="216" height="150" rx="16"/>
      <rect class="ill-soft-2" x="92" y="44" width="216" height="28" rx="16"/><rect class="ill-soft-2" x="92" y="60" width="216" height="12"/>
      <circle class="ill-amber" cx="112" cy="58" r="4.5"/><circle class="ill-ink-2" cx="126" cy="58" r="4.5" opacity=".5"/><circle class="ill-ink-2" cx="140" cy="58" r="4.5" opacity=".3"/>
      <rect class="ill-soft" x="112" y="168" width="176" height="8" rx="4"/><rect class="ill-amber ill-pulse" x="112" y="168" width="112" height="8" rx="4"/>
      <g class="ill-spin"><path class="ill-ink" d="M190 86 h20 l3 12 a38 38 0 0 1 10 6 l12 -4 10 17 -9 9 a38 38 0 0 1 0 12 l9 9 -10 17 -12 -4 a38 38 0 0 1 -10 6 l-3 12 h-20 l-3 -12 a38 38 0 0 1 -10 -6 l-12 4 -10 -17 9 -9 a38 38 0 0 1 0 -12 l-9 -9 10 -17 12 4 a38 38 0 0 1 10 -6z" transform="translate(40 6.4) scale(.8)"/></g>
      <circle class="ill-card" cx="200" cy="112" r="11"/>
      <g class="ill-spin-rev"><path class="ill-amber" d="M262 104 h12 l2 7 a22 22 0 0 1 6 3.5 l7 -2.3 6 10 -5.5 5 a22 22 0 0 1 0 7 l5.5 5 -6 10 -7 -2.3 a22 22 0 0 1 -6 3.5 l-2 7 h-12 l-2 -7 a22 22 0 0 1 -6 -3.5 l-7 2.3 -6 -10 5.5 -5 a22 22 0 0 1 0 -7 l-5.5 -5 6 -10 7 2.3 a22 22 0 0 1 6 -3.5z" transform="translate(-6 -18)"/></g>
      <circle class="ill-card" cx="262" cy="108" r="8"/>
      <circle class="ill-amber-2 ill-pulse" cx="60" cy="80" r="6"/><circle class="ill-ink-2" cx="344" cy="64" r="4"/><path class="ill-line" d="M334 180 l12 0 M340 174 l0 12"/>
    </svg>
      <span class="status-code"><span class="material-symbols-outlined" aria-hidden="true">construction</span>صيانة مجدولة</span>
      <h1>نعمل على تحسين المنصة</h1>
      <p class="status-lead" id="maint-msg">{{ $__m['message'] }}</p>
      <section class="status-panel" id="maint-panel" aria-labelledby="cd-t"@if (! $__mInfo['until']) hidden @endif>
        <h2 class="status-panel-title" id="cd-t">الوقت المتوقع للعودة (تقديري)</h2>
        <div class="countdown" id="countdown" role="timer" aria-describedby="cd-eta">
          <div class="cd-unit"><b id="cd-h">02</b><span>ساعات</span></div><span class="cd-sep" aria-hidden="true">:</span>
          <div class="cd-unit"><b id="cd-m">00</b><span>دقائق</span></div><span class="cd-sep" aria-hidden="true">:</span>
          <div class="cd-unit"><b id="cd-s">00</b><span>ثوانٍ</span></div>
        </div>
        <div class="maint-progress" aria-hidden="true"><span id="cd-bar"></span></div>
        <div class="maint-meta">
          <span><span class="material-symbols-outlined" aria-hidden="true">schedule</span>نعود حوالي <strong id="cd-eta">—</strong></span>
          <span><span class="material-symbols-outlined" aria-hidden="true">mail</span>للاستفسار: <a id="maint-mail" href="mailto:{{ $__mInfo['email'] ?: 'info@shamal-society.org' }}" dir="ltr">{{ $__mInfo['email'] ?: 'info@shamal-society.org' }}</a></span>
        </div>
        <p class="sr-only" id="cd-live" aria-live="polite"></p>
      </section>
      <div class="status-actions">
        <button type="button" class="btn btn-secondary" id="maint-retry"><span class="material-symbols-outlined" aria-hidden="true">refresh</span>تحقق مرة أخرى</button>
        <a class="btn btn-ghost" href="{{ url('/admin') }}"><span class="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>دخول المسؤولين</a>
      </div>

      @if ($__canManage)
      <section class="status-panel maint-admin" id="maint-admin" aria-labelledby="ma-t" style="margin-top:28px">
        <h2 class="status-panel-title" id="ma-t">التحكم بوضع الصيانة للموقع العام</h2>
        <p class="hint" id="ma-state" style="margin:0 0 14px"></p>
        <form id="ma-form" novalidate>
          <label class="check-label" style="margin-bottom:14px"><input type="checkbox" class="checkbox" id="ma-enabled"> تفعيل وضع الصيانة (يعرض للزوار صفحة 503، ويبقى الدخول متاحاً للمسؤولين)</label>
          <div class="field"><label class="label" for="ma-message">رسالة الزوار</label><textarea class="textarea" id="ma-message" rows="3" maxlength="1000"></textarea><p class="error" id="ma-message-err" hidden></p></div>
          <div class="field"><label class="label" for="ma-ips">عناوين IP المسموح لها بتصفح الموقع أثناء الصيانة</label><textarea class="textarea" id="ma-ips" dir="ltr" rows="2" placeholder="203.0.113.5&#10;198.51.100.0/24"></textarea><p class="hint">عنوان أو نطاق (CIDR) في كل سطر. عنوانك الحالي: <code dir="ltr" id="ma-myip"></code> <button type="button" class="btn btn-ghost btn-sm" id="ma-addip">إضافته</button></p><p class="error" id="ma-ips-err" hidden></p></div>
          <div class="field-row">
            <div class="field"><label class="label" for="ma-from">يبدأ في (اختياري)</label><input class="input" type="datetime-local" id="ma-from" dir="ltr"><p class="error" id="ma-from-err" hidden></p></div>
            <div class="field"><label class="label" for="ma-until">ينتهي في (اختياري)</label><input class="input" type="datetime-local" id="ma-until" dir="ltr"><p class="error" id="ma-until-err" hidden></p></div>
          </div>
          <p class="hint">عند تحديد وقت انتهاء يعود الموقع تلقائياً بعد هذا الوقت حتى لو بقي التفعيل مفعّلاً.</p>
          <div class="status-actions"><button type="submit" class="btn btn-primary" id="ma-save"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ</button></div>
        </form>
      </section>
      @endif
    </div>
  </main>
  <footer class="status-foot"><span>© 2026 جمعية الشمال للتنمية والتطوير المجتمعي · قالب تجريبي</span><a href="{{ url('/') }}">العودة إلى الموقع</a></footer>
  <div id="toasts" class="toasts" role="status" aria-live="polite"></div>
@endsection
@push('scripts')
<script>window.__MAINT = {!! json_encode(['status' => $__mStatus, 'message' => $__m['message'], 'until' => $__mInfo['until'], 'email' => $__mInfo['email'], 'canManage' => (bool) $__canManage], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
<script src="{{ asset('assets/admin/js/admin-data.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-dbkit.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-status.js') }}"></script>
@endpush
