@extends('layouts.site')
@section('title', 'الأخبار — جمعية الشمال للتنمية والتطوير المجتمعي')
@section('description', 'آخر الأخبار وتقارير الشفافية من قطاع غزة: بيانات، تنمية مجتمعية، توثيق الميدان، وأنشطة ميدانية.')
@section('page', 'news')
@section('active', 'news')
@push('css')
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('pages') }}">
@endpush
@section('content')
<main id="main">
    <!-- ================= PAGE HERO ================= -->
    <section class="page-hero " aria-labelledby="page-title">
      <div class="page-hero-media" aria-hidden="true"><img src="{{ asset('assets/site/img/news-conference.jpg') }}" alt="" data-hero-img></div>
      <div class="page-hero-shade" aria-hidden="true"></div>
      <div class="page-hero-pattern" aria-hidden="true"></div>
      <div class="hero-grain" aria-hidden="true"></div>
      <div class="page-hero-inner mx-auto max-w-page px-5 md:px-8">
        <nav class="crumbs hero-in d1" aria-label="مسار التنقل">
          <ol><li><a href="{{ route('home') }}"><span class="material-symbols-outlined" aria-hidden="true">home</span>الرئيسية</a></li><li><span aria-current="page" data-crumb-current>الأخبار</span></li></ol>
        </nav>
        <p class="page-hero-kicker hero-in d2" data-hero-kicker>المركز الإعلامي</p>
        <h1 id="page-title" class="page-hero-title hero-in d3" data-hero-title>آخر الأخبار وتقارير الشفافية <span class="text-gradient-gold">من القطاع</span></h1>
        <p class="page-hero-lead hero-in d4" data-hero-lead>بيانات إغاثة غزة، ومستجدات البرامج والتوثيق الميداني، والأنشطة الموثّقة داخل القطاع.</p>
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>

    <!-- ================= FEATURED ================= -->
    @if($featured)
    <section class="sec pb-0 md:pb-0" aria-labelledby="featured-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <h2 id="featured-title" class="sr-only">الخبر المميز</h2>
        <article class="nf-card reveal">
          <div class="nf-media">
            <img src="{{ \App\Support\SiteContent::img($featured->cover, asset('assets/site/img/logo.png')) }}" alt="{{ $featured->cover_alt }}" loading="lazy">
            @if($featured->badge_text)<span class="badge badge-gold">{{ $featured->badge_text }}</span>@endif
          </div>
          <div class="nf-body">
            <p class="nf-kicker"><span class="material-symbols-outlined" aria-hidden="true">star</span>الخبر المميز</p>
            <h3 class="nf-title"><a href="{{ route('news.show', $featured->slug) }}">{{ $featured->title }}</a></h3>
            <p class="activity-meta"><span class="material-symbols-outlined">event</span>{{ \App\Support\SiteContent::date($featured->published_at) }}@if($featured->read_minutes) • قراءة {{ $featured->read_minutes }} دقائق@endif @if($featured->desk || $featured->byline)• <span class="font-bold text-primary">{{ $featured->desk ?: $featured->byline }}</span>@endif</p>
            <p class="nf-text">{{ $featured->excerpt }}</p>
            <div class="nf-foot">
              <a href="{{ route('news.show', $featured->slug) }}" class="link-arrow text-[15px]">قراءة الخبر كاملاً<span class="material-symbols-outlined">arrow_back</span></a>
              @if($featured->reference_code)<span class="ref-chip" dir="ltr">{{ $featured->reference_code }}</span>@endif
            </div>
          </div>
        </article>
      </div>
    </section>
    @endif

    <!-- ================= LIST ================= -->
    <section id="news-list" class="sec" aria-labelledby="list-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="sec-head">
          <div class="reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">newspaper</span>بيانات إغاثة غزة</p>
            <h2 id="list-title" class="section-title">كل الأخبار</h2>
          </div>
          <label class="search-box reveal">
            <span class="material-symbols-outlined" aria-hidden="true">search</span>
            <input id="nw-search" type="search" placeholder="ابحث في أخبار غزة والتقارير..." aria-label="ابحث في أخبار غزة والتقارير" aria-controls="nw-grid">
          </label>
        </div>
        <div class="toolbar reveal mt-8">
          <div id="nw-filters" class="chip-bar" role="group" aria-label="تصنيف الأخبار">
          <button type="button" class="chip is-on" data-filter="all" aria-pressed="true"><span class="material-symbols-outlined" aria-hidden="true">auto_awesome</span>الكل<span class="chip-count">{{ $total }}</span></button>
          @foreach($chips as $c)
          <button type="button" class="chip" data-filter="{{ $c['slug'] }}" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">{{ ['statements'=>'campaign','development'=>'diversity_3','field'=>'hub','activities'=>'verified'][$c['slug']] ?? 'label' }}</span>{{ $c['label'] }}<span class="chip-count">{{ $c['count'] }}</span></button>
          @endforeach
          </div>
          <p class="result-count" id="nw-count" aria-live="polite">{!! \App\Support\SiteTexts::bold('js.count.news_init', ['total' => $total]) !!}</p>
        </div>
        <div class="nw-grid" id="nw-grid">
@foreach($list as $a)
          @include('partials.site.news-card', ['a' => $a, 'labels' => $labels])
@endforeach
        </div>
        <div class="empty-state mt-8" id="nw-empty" @if($total) hidden @endif><span class="material-symbols-outlined" aria-hidden="true">search_off</span><strong>لا توجد نتائج مطابقة</strong><p>جرّب كلمة بحث أخرى أو اختر تصنيف «الكل».</p></div>
        <nav class="pager" id="nw-pager" aria-label="ترقيم صفحات الأخبار"></nav>
      </div>
    </section>

    <!-- ================= MEDIA CTA ================= -->
    <section class="pb-20 md:pb-28">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="archive-cta reveal">
          <span class="archive-ico material-symbols-outlined" aria-hidden="true">campaign</span>
          <div class="min-w-0 flex-1">
            <p class="text-[12.5px] font-bold text-gold-light">للإعلاميين والشركاء</p>
            <h2 class="mt-1 text-[19px] font-bold text-white">طلب معلومات أو تقرير عن حملة بعينها</h2>
            <p class="mt-0.5 text-[13.5px] text-primary-soft">يمكنك طلب تقرير عن أي حملة أو نشاط عبر فريق التواصل.</p>
          </div>
          <a class="btn btn-gold h-11 shrink-0 px-5 text-[14px]" href="{{ route('contact') }}?topic=media#message-form">تواصل مع المكتب الإعلامي</a>
        </div>
      </div>
    </section>
  </main>
@endsection
@push('scripts')
<script src="{{ asset('assets/site/js/pages.js') }}"></script>
<script src="{{ asset('assets/site/js/main.js') }}"></script>
@endpush
