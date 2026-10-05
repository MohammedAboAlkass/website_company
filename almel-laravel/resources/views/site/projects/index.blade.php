@extends('layouts.site')
@section('title', 'المشاريع والبرامج — جمعية الشمال للتنمية والتطوير المجتمعي')
@section('description', 'مبادرات الإغاثة المعتمدة داخل قطاع غزة: المخابز، المياه، الإيواء، والتنمية المجتمعية — مع نسب التمويل.')
@section('page', 'projects')
@section('active', 'projects')
@push('css')
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('pages') }}">
@endpush
@section('content')
<main id="main">
    <!-- ================= PAGE HERO ================= -->
    <section class="page-hero " aria-labelledby="page-title">
      <div class="page-hero-media" aria-hidden="true"><img src="{{ asset('assets/site/img/project-parallax.jpg') }}" alt="" data-hero-img></div>
      <div class="page-hero-shade" aria-hidden="true"></div>
      <div class="page-hero-pattern" aria-hidden="true"></div>
      <div class="hero-grain" aria-hidden="true"></div>
      <div class="page-hero-inner mx-auto max-w-page px-5 md:px-8">
        <nav class="crumbs hero-in d1" aria-label="مسار التنقل">
          <ol><li><a href="{{ route('home') }}"><span class="material-symbols-outlined" aria-hidden="true">home</span>الرئيسية</a></li><li><span aria-current="page" data-crumb-current>المشاريع</span></li></ol>
        </nav>
        <p class="page-hero-kicker hero-in d2" data-hero-kicker>{{ \App\Support\SiteTexts::t('programs.hero.kicker') }}</p>
        <h1 id="page-title" class="page-hero-title hero-in d3" data-hero-title>{!! \App\Support\SiteTexts::gold('programs.hero.title', 'programs.hero.title_gold') !!}</h1>
        <p class="page-hero-lead hero-in d4" data-hero-lead>{{ \App\Support\SiteTexts::t('programs.hero.lead') }}</p>
        <div class="page-hero-meta hero-in d5"><span class="hero-chip"><b dir="ltr">{{ $projects->count() }}</b>{{ \App\Support\SiteTexts::t('programs.hero.chip_projects') }}</span>@if($projects->where('status','urgent')->count())<span class="hero-chip"><b dir="ltr">{{ $projects->where('status','urgent')->count() }}</b>{{ \App\Support\SiteTexts::t('programs.hero.chip_urgent') }}</span>@endif @if($projects->where('status','completed')->count())<span class="hero-chip"><b dir="ltr">{{ $projects->where('status','completed')->count() }}</b>{{ \App\Support\SiteTexts::t('programs.hero.chip_done') }}</span>@endif</div>
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>

    <!-- ================= PROJECTS GRID ================= -->
    <section id="projects" class="sec sec-sand" aria-labelledby="projects-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="sec-head">
          <div class="reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">cases</span>{{ \App\Support\SiteTexts::t('programs.list.eyebrow') }}</p>
            <h2 id="projects-title" class="section-title">{{ \App\Support\SiteTexts::t('programs.list.title') }}</h2>
            <p class="section-lead">{{ \App\Support\SiteTexts::t('programs.list.lead') }}</p>
          </div>
        </div>
        <div class="toolbar reveal mt-9">
          <div id="pj-filters" class="chip-bar" role="group" aria-label="{{ \App\Support\SiteTexts::t('project.filter_label') }}">
          <button type="button" class="chip is-on" data-filter="all" aria-pressed="true"><span class="material-symbols-outlined" aria-hidden="true">auto_awesome</span>{{ \App\Support\SiteTexts::t('programs.list.all') }}<span class="chip-count">{{ $projects->count() }}</span></button>
          @foreach($chips as $c)
          <button type="button" class="chip" data-filter="{{ $c['slug'] }}" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">{{ $c['icon'] }}</span>{{ $c['label'] }}<span class="chip-count">{{ $c['count'] }}</span></button>
          @endforeach
          </div>
          <p class="result-count" id="pj-count" aria-live="polite">{!! \App\Support\SiteTexts::bold('js.count.projects', ['shown' => $projects->count(), 'total' => $projects->count()]) !!}</p>
        </div>
        <div class="pj-grid" id="pj-grid">
@foreach($projects as $p)
          @include('partials.site.project-card', ['p' => $p, 'delay' => ($loop->index % 4) * 0.08])
@endforeach
        </div>
        <div class="empty-state mt-8" id="pj-empty" @if($projects->count()) hidden @endif><span class="material-symbols-outlined" aria-hidden="true">search_off</span><strong>{{ \App\Support\SiteTexts::t('programs.list.empty_title') }}</strong><p>{{ \App\Support\SiteTexts::t('programs.list.empty_text') }}</p></div>

        <div class="trust-strip">
          <div class="feature-tile reveal"><span class="feature-ico material-symbols-outlined" aria-hidden="true">photo_camera</span><div><p class="feature-title">{{ \App\Support\SiteTexts::t('programs.trust.t1_title') }}</p><p class="feature-desc">{{ \App\Support\SiteTexts::t('programs.trust.t1_desc') }}</p></div></div>
          <div class="feature-tile reveal" style="--d:.06s"><span class="feature-ico material-symbols-outlined" aria-hidden="true">shield</span><div><p class="feature-title">{{ \App\Support\SiteTexts::t('programs.trust.t2_title') }}</p><p class="feature-desc">{{ \App\Support\SiteTexts::t('programs.trust.t2_desc') }}</p></div></div>
          <div class="feature-tile reveal" style="--d:.12s"><span class="feature-ico material-symbols-outlined" aria-hidden="true">volunteer_activism</span><div><p class="feature-title">{{ \App\Support\SiteTexts::t('programs.trust.t3_title') }}</p><p class="feature-desc"><a class="link-arrow" href="{{ route('contact') }}">{{ \App\Support\SiteTexts::t('programs.trust.t3_link') }}<span class="material-symbols-outlined">arrow_back</span></a></p></div></div>
        </div>
      </div>
    </section>
<div class="pt-20 md:pt-28" aria-hidden="true"></div>
    <!-- ================= CONTACT CTA ================= -->
    <section class="pb-20 md:pb-28" aria-labelledby="cta-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="cta-card reveal">
          <div class="cta-body">
            <span class="cta-pill"><span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>{{ \App\Support\SiteTexts::t('programs.cta.pill') }}</span>
            <p class="mt-6 text-[15px] font-bold text-gold-light">{{ \App\Support\SiteTexts::t('programs.cta.label') }}</p>
            <h2 id="cta-title" class="cta-title">{!! \App\Support\SiteTexts::gold('programs.cta.title', 'programs.cta.title_gold', 'br') !!}</h2>
            <p class="cta-text">{{ \App\Support\SiteTexts::t('programs.cta.text') }}</p>
            <div class="cta-actions">
              <a href="{{ route('contact') }}#message-form" class="btn btn-donate h-14 ps-2 pe-6 text-[16px]">
                <span class="grid h-10 w-10 place-items-center rounded-full bg-primary text-gold-light"><span class="material-symbols-outlined fill text-[20px]" aria-hidden="true">support_agent</span></span>
                {{ \App\Support\SiteTexts::t('programs.cta.btn') }}
                <span class="material-symbols-outlined btn-arrow text-[20px]" aria-hidden="true">arrow_back</span>
              </a>
              @php $__wa = \App\Support\SiteContent::info()['wa']; @endphp
              @if($__wa)<a href="https://wa.me/{{ $__wa }}" target="_blank" rel="noopener" class="btn btn-glass h-14 px-6 text-[16px]"><span class="material-symbols-outlined text-gold-light" aria-hidden="true">chat</span>{{ \App\Support\SiteTexts::t('programs.cta.btn_wa') }}</a>@endif
            </div>
          </div>
          <div class="cta-media" aria-hidden="true"><img src="{{ asset('assets/site/img/project-relief.jpg') }}" alt="" loading="lazy"></div>
        </div>
      </div>
    </section>
  </main>
@endsection
@push('scripts')
<script src="{{ asset('assets/site/js/pages.js') }}"></script>
<script src="{{ asset('assets/site/js/main.js') }}"></script>
@endpush
