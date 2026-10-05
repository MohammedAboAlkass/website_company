@extends('layouts.admin')
@section('title', 'نظرة عامة')
@section('page', 'index')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-live.css') }}">
@endpush
@section('content')
@php
  $fmt = fn ($n) => number_format((int) $n);
  $kpis = [
    ['الأخبار المنشورة', $t['articles_published'], 'newspaper', $t['articles_draft'].' مسودة · '.$t['articles_scheduled'].' مجدولة', 'admin.news'],
    ['المشاريع', $t['projects_total'], 'folder_open', $t['projects_active'].' نشطة · '.$t['projects_completed'].' مكتملة', 'admin.projects.index'],
    ['قصص الميدان', $t['stories'], 'format_quote', 'من أصل '.$t['stories_total'], 'admin.stories.index'],
    ['الأنشطة الميدانية', $t['activities'], 'event_available', 'من أصل '.$t['activities_total'], 'admin.activities.index'],
    ['الشركاء', $t['partners'], 'handshake', 'من أصل '.$t['partners_total'], 'admin.partners.index'],
    ['الرسائل غير المقروءة', $t['messages_unread'], 'inbox', 'من أصل '.$t['messages_total'].' · '.$t['messages_week'].' هذا الأسبوع', 'admin.messages.index'],
    ['صور وفيديوهات المعرض', $t['gallery'], 'photo_library', 'من أصل '.$t['gallery_total'], 'admin.gallery'],
    ['مستخدمو اللوحة النشطون', $t['users'], 'manage_accounts', 'من أصل '.$t['users_total'], 'admin.users.index'],
    ['مشاهدات الأخبار', $t['views'], 'visibility', 'مجموع كل المقالات', 'admin.reports'],
  ];
  $perm = fn ($k) => auth()->user()->hasPermission($k);
  $max = max(1, collect($series)->max('value'));
  $maxB = max(1, collect($govs)->max('beneficiaries'));
@endphp
        <div class="page-head">
          <div>
            <p class="greet-date"><span class="material-symbols-outlined" aria-hidden="true">calendar_today</span><span id="greet-date">{{ $today }}</span></p>
            <h1 class="page-title" id="greet-title">{{ $greeting }}</h1>
            <p class="page-sub">ملخص حقيقي لمحتوى الموقع والرسائل من قاعدة البيانات.</p>
          </div>
          <div class="page-actions">
            @if ($perm('reports.view'))<a class="btn btn-secondary" href="{{ route('admin.reports') }}"><span class="material-symbols-outlined" aria-hidden="true">bar_chart</span>التقارير</a>@endif
            @if ($perm('projects.create'))<a class="btn btn-primary" href="{{ url('/admin/projects') }}#new"><span class="material-symbols-outlined" aria-hidden="true">add</span>مشروع جديد</a>@endif
          </div>
        </div>

        <section aria-label="المؤشرات الرئيسية"><div class="lv-kpis" id="kpis">
          @foreach ($kpis as $k)
            <article class="card kpi"><div class="kpi-top"><h2 class="kpi-label">{{ $k[0] }}</h2><span class="kpi-ico"><span class="material-symbols-outlined" aria-hidden="true">{{ $k[2] }}</span></span></div>
              <p class="kpi-value"><span class="ltr">{{ $fmt($k[1]) }}</span></p>
              <div class="kpi-foot"><div><span class="muted">{{ $k[3] }}</span></div></div></article>
          @endforeach
        </div></section>

        <div class="grid mt-24">
          <section class="card xl-8" aria-labelledby="t-msgs">
            <div class="card-head bordered"><div class="ch"><span class="ch-ico"><span class="material-symbols-outlined" aria-hidden="true">mail</span></span><div><h2 class="card-title" id="t-msgs">الرسائل الواردة</h2><p class="card-sub">آخر 30 يوماً — عدد الرسائل في كل يوم</p></div></div><span class="pill pill-neutral no-dot">{{ collect($series)->sum('value') }} رسالة</span></div>
            <div class="card-body">
              <div class="lv-bars" role="img" aria-label="مخطط الرسائل الواردة خلال آخر 30 يوماً">
                @foreach ($series as $s)<div class="lv-bar{{ $s['value'] ? '' : ' is-zero' }}" style="height:{{ $s['value'] ? max(4, round($s['value'] / $max * 100)) : 2 }}%" title="{{ $s['title'] }}: {{ $s['value'] }}"></div>@endforeach
              </div>
              <div class="lv-bar-labels" aria-hidden="true">@foreach ($series as $i => $s)<span>{{ $i % 5 === 0 ? $s['label'] : '' }}</span>@endforeach</div>
            </div>
          </section>

          <section class="card xl-4" aria-labelledby="t-gov">
            <div class="card-head bordered"><div class="ch"><span class="ch-ico"><span class="material-symbols-outlined" aria-hidden="true">map</span></span><div><h2 class="card-title" id="t-gov">المستفيدون حسب المحافظات</h2><p class="card-sub">من صفحة «خريطة الأثر»</p></div></div></div>
            <div class="card-body">
              @forelse ($govs as $g)
                <div class="lv-row"><span>{{ $g['name'] }}</span><span class="lv-track"><span class="lv-fill" style="display:block;width:{{ round($g['beneficiaries'] / $maxB * 100) }}%"></span></span><b class="ltr">{{ $fmt($g['beneficiaries']) }}</b></div>
              @empty
                <p class="muted">لا توجد محافظات منشورة.</p>
              @endforelse
            </div>
          </section>

          <section class="card xl-7" aria-labelledby="t-proj">
            <div class="card-head bordered">
              <div class="ch"><span class="ch-ico"><span class="material-symbols-outlined" aria-hidden="true">folder_open</span></span><div><h2 class="card-title" id="t-proj">المشاريع النشطة</h2><p class="card-sub">المشاريع الجارية وحالة كل منها</p></div></div>
              <a class="link" href="{{ url('/admin/projects') }}">كل المشاريع<span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></a>
            </div>
            <div class="card-body"><ul class="proj-list" id="proj-active">
              @forelse ($projects as $p)
                @php $img = \App\Support\ContentSupport::mediaUrl($p->cover); @endphp
                <li class="pl-item">@if ($img)<img src="{{ $img }}" alt="" loading="lazy">@endif<div class="pl-main"><p class="pl-title">{{ $p->title }}</p><p class="pl-sub">{{ $p->location_text }} @if ($p->progress_percent !== null)· إنجاز {{ (int) $p->progress_percent }}%@endif</p></div><div class="pl-end"><span class="pill pill-{{ \App\Support\AdminStats::PROJECT_TONE[$p->status] ?? 'neutral' }}">{{ \App\Support\AdminStats::PROJECT_STATUS[$p->status] ?? $p->status }}</span><small>حُدِّث {{ $p->updated_at?->format('Y-m-d') }}</small></div></li>
              @empty
                <li class="muted">لا توجد مشاريع نشطة حالياً.</li>
              @endforelse
            </ul></div>
          </section>

          <section class="card xl-5" aria-labelledby="t-feed">
            <div class="card-head bordered"><div class="ch"><span class="ch-ico"><span class="material-symbols-outlined" aria-hidden="true">history</span></span><div><h2 class="card-title" id="t-feed">آخر النشاطات</h2><p class="card-sub">من سجل النشاط في اللوحة</p></div></div></div>
            <div class="card-body">
              <ul class="timeline">
                @forelse ($feed as $f)
                  <li class="tl-item"><span class="li-ico"><span class="material-symbols-outlined" aria-hidden="true">edit_note</span></span><div><p>{{ $f['text'] }}</p><span>{{ $f['by'] }} · <span dir="ltr">{{ $f['at']?->format('Y-m-d H:i') }}</span></span></div></li>
                @empty
                  <li class="muted">لا توجد نشاطات مسجّلة بعد.</li>
                @endforelse
              </ul>
            </div>
          </section>

          <section class="card xl-8" aria-labelledby="t-msg">
            <div class="card-head bordered">
              <div class="ch"><span class="ch-ico"><span class="material-symbols-outlined" aria-hidden="true">inbox</span></span><div><h2 class="card-title" id="t-msg">أحدث الرسائل</h2><p class="card-sub">طلبات التواصل والتطوع والشراكات الواردة</p></div></div>
              <a class="link" href="{{ url('/admin/messages') }}">صندوق الرسائل<span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></a>
            </div>
            <div class="card-body" style="padding-top:8px"><ul id="latest-messages">
              @forelse ($messages as $m)
                @php $mt = \App\Support\AdminStats::MSG_TYPES[$m->type] ?? \App\Support\AdminStats::MSG_TYPES['other']; @endphp
                <li><a class="msg-mini" href="{{ route('admin.messages.index', ['id' => $m->id]) }}"><span class="avatar navy" aria-hidden="true"><span class="material-symbols-outlined">{{ $mt[2] }}</span></span><div class="li-main"><div class="top"><strong>@if (! $m->is_read)<span class="udot" aria-hidden="true"></span><span class="sr-only">غير مقروءة: </span>@endif{{ $m->name }}</strong><time dir="ltr">{{ $m->created_at?->format('Y-m-d H:i') }}</time></div><p>{{ $m->subject ?: \Illuminate\Support\Str::limit(preg_replace('/\s+/u', ' ', (string) $m->message), 70) }}</p></div><span class="pill pill-{{ $mt[1] }} no-dot">{{ $mt[0] }}</span></a></li>
              @empty
                <li class="muted" style="padding:14px 0">لا توجد رسائل واردة بعد.</li>
              @endforelse
            </ul></div>
          </section>

          <section class="card xl-4" aria-labelledby="t-quick">
            <div class="card-head bordered"><div class="ch"><span class="ch-ico"><span class="material-symbols-outlined" aria-hidden="true">bolt</span></span><div><h2 class="card-title" id="t-quick">إجراءات سريعة</h2><p class="card-sub">أكثر المهام استخداماً</p></div></div></div>
            <div class="card-body">
              <div class="quick">
                <a href="{{ url('/admin/projects') }}#new"><span class="q-ico"><span class="material-symbols-outlined" aria-hidden="true">add_circle</span></span><span><strong>مشروع جديد</strong><span class="s">إضافة حملة أو برنامج</span></span></a>
                <a href="{{ url('/admin/news-edit') }}"><span class="q-ico"><span class="material-symbols-outlined" aria-hidden="true">edit_square</span></span><span><strong>كتابة خبر</strong><span class="s">نشر أو جدولة</span></span></a>
                <a href="{{ url('/admin/gallery') }}#upload"><span class="q-ico"><span class="material-symbols-outlined" aria-hidden="true">add_photo_alternate</span></span><span><strong>رفع صور</strong><span class="s">إلى معرض الميدان</span></span></a>
                <a href="{{ url('/admin/reports') }}"><span class="q-ico"><span class="material-symbols-outlined" aria-hidden="true">download</span></span><span><strong>التقارير</strong><span class="s">أرقام وتصدير CSV</span></span></a>
              </div>
            </div>
          </section>

          <section class="card xl-12" aria-labelledby="t-art" style="grid-column:1/-1">
            <div class="card-head bordered"><div class="ch"><span class="ch-ico"><span class="material-symbols-outlined" aria-hidden="true">newspaper</span></span><div><h2 class="card-title" id="t-art">آخر الأخبار المعدَّلة</h2><p class="card-sub">آخر 5 مقالات حسب وقت التعديل</p></div></div></div>
            <div class="card-body"><ul class="lv-list">
              @forelse ($articles as $a)
                <li><a href="{{ url('/admin/news-edit?id='.$a->id) }}">{{ $a->title }}</a><span class="lv-note"><span class="pill pill-{{ $a->status === 'published' ? 'info' : 'neutral' }} no-dot">{{ ['published' => 'منشور', 'draft' => 'مسودة', 'scheduled' => 'مجدول'][$a->status] ?? $a->status }}</span> · <span class="ltr">{{ number_format((int) $a->views_count) }}</span> مشاهدة</span></li>
              @empty
                <li class="muted">لا توجد مقالات.</li>
              @endforelse
            </ul></div>
          </section>
        </div>
      @endsection
@push('constants')
<script>window.__DB_PAGES = Object.assign(window.__DB_PAGES || {}, { index: 1 });</script>
@endpush
