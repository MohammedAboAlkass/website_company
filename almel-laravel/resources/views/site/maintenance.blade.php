<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>الموقع تحت الصيانة — جمعية الشمال للتنمية والتطوير المجتمعي</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#0C7845">
  <link rel="icon" type="image/png" href="{{ asset('assets/site/img/logo.png') }}">
  <link rel="stylesheet" href="{{ asset('assets/site/css/fonts.css') }}">
  <style>
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100%}
    body{font-family:'Thmanyah Sans','IBM Plex Sans Arabic','Segoe UI',Tahoma,sans-serif;background:#f6f8f6;color:#2B2B2B;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;line-height:1.8}
    .card{background:#fff;border:1px solid #e3ebe5;border-radius:20px;max-width:560px;width:100%;padding:40px 32px;text-align:center;box-shadow:0 10px 40px rgba(12,120,69,.08)}
    .logo{width:72px;height:72px;object-fit:contain;margin:0 auto 12px;display:block}
    .org{font-size:14px;color:#5b6b61;margin:0 0 20px}
    .badge{display:inline-flex;align-items:center;gap:8px;background:#e8f4ed;color:#0C7845;border-radius:999px;padding:6px 16px;font-size:14px;font-weight:700;margin-bottom:16px}
    .badge i{width:8px;height:8px;border-radius:50%;background:#FF7000;display:inline-block;animation:p 1.6s ease-in-out infinite}
    h1{font-size:26px;margin:0 0 12px;color:#0C7845}
    .msg{font-size:17px;margin:0 0 20px;white-space:pre-line}
    .eta{background:#fff7ef;border:1px solid #ffe0c4;color:#8a4300;border-radius:12px;padding:10px 14px;font-size:15px;margin:0 0 20px}
    .mail{font-size:14px;color:#5b6b61}
    .mail a{color:#0C7845;font-weight:700;text-decoration:none}
    .btn{display:inline-block;margin-top:22px;background:#0C7845;color:#fff;border:0;border-radius:12px;padding:10px 24px;font:inherit;font-weight:700;cursor:pointer;text-decoration:none}
    .btn:hover{background:#0a6538}
    @keyframes p{50%{opacity:.35}}
    @media (prefers-reduced-motion:reduce){.badge i{animation:none}}
  </style>
</head>
<body>
  <main class="card" role="main">
    <img class="logo" src="{{ asset('assets/site/img/logo.png') }}" alt="شعار الجمعية" width="72" height="72">
    <p class="org">جمعية الشمال للتنمية والتطوير المجتمعي</p>
    <span class="badge"><i aria-hidden="true"></i>صيانة مؤقتة</span>
    <h1>نعمل على تحسين الموقع</h1>
    <p class="msg">{{ $info['message'] }}</p>
    @if (! empty($info['until']))
      <p class="eta">نتوقع العودة حوالي <strong>{{ \Carbon\Carbon::parse($info['until'])->locale('ar')->translatedFormat('j F Y، H:i') }}</strong></p>
    @endif
    @if (! empty($info['email']))
      <p class="mail">للاستفسار: <a href="mailto:{{ $info['email'] }}" dir="ltr">{{ $info['email'] }}</a></p>
    @endif
    <a class="btn" href="{{ url()->current() }}">تحقق مرة أخرى</a>
  </main>
</body>
</html>
