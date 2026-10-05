@extends('layouts.admin')
@section('title', 'التقارير والإحصائيات')
@section('page', 'reports')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-live.css') }}">
@endpush
@section('content')
@php
  $t = $r['totals'];
  $fmt = fn ($n) => number_format((int) $n);
  $names = ['7d' => 'آخر 7 أيام', '30d' => 'آخر 30 يوماً', '90d' => 'آخر 90 يوماً', '12m' => 'آخر 12 شهراً', 'ytd' => 'منذ بداية العام'];
  $canExport = auth()->user()->hasPermission('reports.export');
  $mx = max(1, collect($r['messages_series'])->max('value'));
  $ax = max(1, collect($r['articles_series'])->max('value'));
  $tm = max(1, array_sum($r['msg_types']));
  $ps = max(1, array_sum($r['project_status']));
  $pp = max(1, collect($r['project_programs'])->sum('c'));
  $vx = max(1, (int) $r['top_articles']->max('views_count'));
  $stats = [
    ['رسائل واردة', $r['msg_in'], 'mail'], ['أخبار نُشرت', $r['art_in'], 'newspaper'], ['مشتركون جدد في النشرة', $r['sub_in'], 'mark_email_read'], ['مشاريع أُضيفت', $r['proj_in'], 'folder_open'],
  ];
  $totalsRows = [
    ['الأخبار المنشورة', $t['articles_published']], ['مشاهدات الأخبار', $t['views']], ['المشاريع', $t['projects_total']], ['المشاريع النشطة', $t['projects_active']],
    ['قصص الميدان', $t['stories']], ['الأنشطة الميدانية', $t['activities']], ['الشركاء', $t['partners']], ['عناصر المعرض', $t['gallery']],
    ['الأسئلة الشائعة', $t['faqs']], ['الإعلانات', $t['announcements']], ['مستخدمو اللوحة', $t['users']], ['مشتركو النشرة', $t['subscribers']],
  ];
@endphp
        <div class="page-head">
          <div><h1 class="page-title">التقارير والإحصائيات</h1><p class="page-sub">أرقام حقيقية من قاعدة البيانات للفترة: <b>{{ $r['label'] }}</b>.</p></div>
          <div class="page-actions">
            @if ($canExport)<a class="btn btn-primary" href="{{ route('admin.reports.export', ['range' => $r['range']]) }}"><span class="material-symbols-outlined" aria-hidden="true">download</span>تصدير CSV</a>@endif
          </div>
        </div>

        <section class="card" aria-label="الفترة"><div class="card-body"><div class="lv-range" role="group" aria-label="اختيار الفترة">
          @foreach ($ranges as $k)<a class="btn {{ $r['range'] === $k ? 'btn-primary' : 'btn-secondary' }} btn-sm" href="{{ route('admin.reports', ['range' => $k]) }}" @if ($r['range'] === $k) aria-current="true" @endif>{{ $names[$k] }}</a>@endforeach
        </div></div></section>

        <section class="mt-24" aria-label="ملخص الفترة"><div class="lv-kpis">
          @foreach ($stats as $s)
            <article class="card kpi"><div class="kpi-top"><h2 class="kpi-label">{{ $s[0] }}</h2><span class="kpi-ico"><span class="material-symbols-outlined" aria-hidden="true">{{ $s[2] }}</span></span></div><p class="kpi-value"><span class="ltr">{{ $fmt($s[1]) }}</span></p><div class="kpi-foot"><div><span class="muted">{{ $r['label'] }}</span></div></div></article>
          @endforeach
        </div></section>

        <div class="grid mt-24">
          <section class="card xl-6" aria-labelledby="t-m">
            <div class="card-head bordered"><div class="ch"><span class="ch-ico"><span class="material-symbols-outlined" aria-hidden="true">mail</span></span><div><h2 class="card-title" id="t-m">الرسائل الواردة</h2><p class="card-sub">{{ $r['label'] }}</p></div></div></div>
            <div class="card-body">
              <div class="lv-bars" role="img" aria-label="الرسائل الواردة خلال الفترة">@foreach ($r['messages_series'] as $s)<div class="lv-bar{{ $s['value'] ? '' : ' is-zero' }}" style="height:{{ $s['value'] ? max(4, round($s['value'] / $mx * 100)) : 2 }}%" title="{{ $s['title'] }}: {{ $s['value'] }}"></div>@endforeach</div>
              <div class="lv-bar-labels" aria-hidden="true">@foreach ($r['messages_series'] as $i => $s)<span>{{ count($r['messages_series']) <= 14 || $i % 3 === 0 ? $s['label'] : '' }}</span>@endforeach</div>
            </div>
          </section>
          <section class="card xl-6" aria-labelledby="t-a">
            <div class="card-head bordered"><div class="ch"><span class="ch-ico"><span class="material-symbols-outlined" aria-hidden="true">newspaper</span></span><div><h2 class="card-title" id="t-a">الأخبار المنشورة</h2><p class="card-sub">{{ $r['label'] }}</p></div></div></div>
            <div class="card-body">
              <div class="lv-bars" role="img" aria-label="الأخبار المنشورة خلال الفترة">@foreach ($r['articles_series'] as $s)<div class="lv-bar alt{{ $s['value'] ? '' : ' is-zero' }}" style="height:{{ $s['value'] ? max(4, round($s['value'] / $ax * 100)) : 2 }}%" title="{{ $s['title'] }}: {{ $s['value'] }}"></div>@endforeach</div>
              <div class="lv-bar-labels" aria-hidden="true">@foreach ($r['articles_series'] as $i => $s)<span>{{ count($r['articles_series']) <= 14 || $i % 3 === 0 ? $s['label'] : '' }}</span>@endforeach</div>
            </div>
          </section>

          <section class="card xl-4" aria-labelledby="t-ty">
            <div class="card-head bordered"><div><h2 class="card-title" id="t-ty">الرسائل حسب النوع</h2><p class="card-sub">{{ $r['label'] }}</p></div></div>
            <div class="card-body">
              @forelse ($r['msg_types'] as $k => $c)
                <div class="lv-row"><span>{{ \App\Support\AdminStats::MSG_TYPES[$k][0] ?? $k }}</span><span class="lv-track"><span class="lv-fill" style="display:block;width:{{ round($c / $tm * 100) }}%"></span></span><b class="ltr">{{ $c }}</b></div>
              @empty<p class="muted">لا رسائل في هذه الفترة.</p>@endforelse
            </div>
          </section>
          <section class="card xl-4" aria-labelledby="t-ps">
            <div class="card-head bordered"><div><h2 class="card-title" id="t-ps">المشاريع حسب الحالة</h2><p class="card-sub">كل المشاريع</p></div></div>
            <div class="card-body">
              @forelse ($r['project_status'] as $k => $c)
                <div class="lv-row"><span>{{ \App\Support\AdminStats::PROJECT_STATUS[$k] ?? $k }}</span><span class="lv-track"><span class="lv-fill alt" style="display:block;width:{{ round($c / $ps * 100) }}%"></span></span><b class="ltr">{{ $c }}</b></div>
              @empty<p class="muted">لا مشاريع.</p>@endforelse
            </div>
          </section>
          <section class="card xl-4" aria-labelledby="t-pp">
            <div class="card-head bordered"><div><h2 class="card-title" id="t-pp">المشاريع حسب البرنامج</h2><p class="card-sub">كل المشاريع</p></div></div>
            <div class="card-body">
              @forelse ($r['project_programs'] as $p)
                <div class="lv-row"><span>{{ $p['name'] }}</span><span class="lv-track"><span class="lv-fill" style="display:block;width:{{ round($p['c'] / $pp * 100) }}%"></span></span><b class="ltr">{{ $p['c'] }}</b></div>
              @empty<p class="muted">لا مشاريع.</p>@endforelse
            </div>
          </section>

          <section class="card xl-6" aria-labelledby="t-top">
            <div class="card-head bordered"><div><h2 class="card-title" id="t-top">أكثر الأخبار مشاهدة</h2><p class="card-sub">أعلى 8 مقالات منشورة</p></div></div>
            <div class="card-body">
              @forelse ($r['top_articles'] as $a)
                <div class="lv-row" style="grid-template-columns:minmax(120px,1.4fr) 1fr auto"><a href="{{ url('/news/'.$a->slug) }}" target="_blank" rel="noopener" style="color:inherit">{{ \Illuminate\Support\Str::limit($a->title, 48) }}</a><span class="lv-track"><span class="lv-fill alt" style="display:block;width:{{ round($a->views_count / $vx * 100) }}%"></span></span><b class="ltr">{{ $fmt($a->views_count) }}</b></div>
              @empty<p class="muted">لا مقالات منشورة.</p>@endforelse
            </div>
          </section>
          <section class="card xl-6" aria-labelledby="t-tot">
            <div class="card-head bordered"><div><h2 class="card-title" id="t-tot">الإجماليات الحالية</h2><p class="card-sub">المنشور والنشط فقط</p></div></div>
            <div class="card-body"><div class="table-wrap"><table class="table"><tbody>
              @foreach ($totalsRows as $tr)<tr><th scope="row" style="font-weight:600">{{ $tr[0] }}</th><td class="ltr">{{ $fmt($tr[1]) }}</td></tr>@endforeach
            </tbody></table></div></div>
          </section>

          <section class="card xl-12" aria-labelledby="t-g" style="grid-column:1/-1">
            <div class="card-head bordered"><div><h2 class="card-title" id="t-g">أرقام المحافظات</h2><p class="card-sub">من صفحة «خريطة الأثر»</p></div></div>
            <div class="card-body"><div class="table-wrap" tabindex="0"><table class="table">
              <thead><tr><th scope="col">المحافظة</th><th scope="col">المستفيدون</th><th scope="col">نقاط التوزيع</th><th scope="col">وجبات</th><th scope="col">خيام</th><th scope="col">نقاط مياه</th></tr></thead>
              <tbody>@forelse ($r['governorates'] as $g)<tr><th scope="row">{{ $g['name'] }}</th><td class="ltr">{{ $fmt($g['beneficiaries']) }}</td><td class="ltr">{{ $fmt($g['points']) }}</td><td class="ltr">{{ $fmt($g['meals']) }}</td><td class="ltr">{{ $fmt($g['tents']) }}</td><td class="ltr">{{ $fmt($g['water']) }}</td></tr>@empty<tr><td colspan="6" class="muted">لا توجد بيانات.</td></tr>@endforelse</tbody>
            </table></div></div>
          </section>
        </div>
      @endsection
@push('constants')
<script>window.__DB_PAGES = Object.assign(window.__DB_PAGES || {}, { reports: 1 });</script>
@endpush
