@extends('layouts.site')
@section('title', 'من نحن — جمعية الشمال للتنمية والتطوير المجتمعي')
@section('description', 'تعرّف على جمعية الشمال للتنمية والتطوير المجتمعي: قصتنا ومسيرتنا، رؤيتنا ورسالتنا وقيمنا، وكيف نعمل داخل القطاع.')
@section('page', 'about')
@section('active', 'about')
@push('css')
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('pages') }}">
@endpush
@section('content')
<main id="main">
    <!-- ================= PAGE HERO ================= -->
    <section class="page-hero " aria-labelledby="page-title">
      <div class="page-hero-media" aria-hidden="true"><img src="{{ asset('assets/site/img/gallery-children.jpg') }}" alt="" data-hero-img></div>
      <div class="page-hero-shade" aria-hidden="true"></div>
      <div class="page-hero-pattern" aria-hidden="true"></div>
      <div class="hero-grain" aria-hidden="true"></div>
      <div class="page-hero-inner mx-auto max-w-page px-5 md:px-8">
        <nav class="crumbs hero-in d1" aria-label="مسار التنقل">
          <ol><li><a href="{{ route('home') }}"><span class="material-symbols-outlined" aria-hidden="true">home</span>الرئيسية</a></li><li><span aria-current="page" data-crumb-current>من نحن</span></li></ol>
        </nav>
        <p class="page-hero-kicker hero-in d2" data-hero-kicker>{{ \App\Support\SiteTexts::t('about.hero.kicker') }}</p>
        <h1 id="page-title" class="page-hero-title hero-in d3" data-hero-title>{!! \App\Support\SiteTexts::gold('about.hero.title', 'about.hero.title_gold') !!}</h1>
        <p class="page-hero-lead hero-in d4" data-hero-lead>{{ \App\Support\SiteTexts::t('about.hero.lead') }}</p>
        <div class="page-hero-meta hero-in d5"><span class="hero-chip"><span class="material-symbols-outlined" aria-hidden="true">location_on</span>{{ \App\Support\SiteTexts::t('about.coverage') }}</span><span class="hero-chip"><b dir="ltr">{{ \App\Support\SiteTexts::t('about.hero.chip2_value') }}</b>{{ \App\Support\SiteTexts::t('about.hero.chip2_label') }}</span><span class="hero-chip"><b dir="ltr">{{ \App\Support\SiteTexts::t('about.hero.chip3_value') }}</b>{{ \App\Support\SiteTexts::t('about.hero.chip3_label') }}</span></div>
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>

    <!-- ================= STORY ================= -->
    <section id="story" class="sec sec-soft" aria-labelledby="story-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="story-grid">
          <div class="story-copy reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">auto_stories</span>{{ \App\Support\SiteTexts::t('about.story.eyebrow') }}</p>
            <h2 id="story-title" class="section-title">{{ \App\Support\SiteTexts::t('about.story.title') }}</h2>
            <p class="ab-statement" data-wordfill>{{ \App\Support\SiteTexts::t('about.story.statement') }}</p>
            <p class="story-text">{{ \App\Support\SiteTexts::t('about.story.text') }}</p>
            <div class="story-facts">
              <div class="story-fact"><span class="material-symbols-outlined" aria-hidden="true">location_on</span><span><b>{{ \App\Support\SiteTexts::t('about.story.fact1_value') }}</b><span>{{ \App\Support\SiteTexts::t('about.story.fact1_label') }}</span></span></div>
              <div class="story-fact"><span class="material-symbols-outlined" aria-hidden="true">4k</span><span><b dir="ltr">{{ \App\Support\SiteTexts::t('about.story.fact2_value') }}</b><span>{{ \App\Support\SiteTexts::t('about.story.fact2_label') }}</span></span></div>
            </div>
            <div class="mt-8 flex flex-wrap gap-3">
              <a href="{{ route('projects.index') }}" class="btn btn-forest h-12 px-6 text-[15px]">{{ \App\Support\SiteTexts::t('about.story.btn1') }}<span class="material-symbols-outlined btn-arrow text-[18px]" aria-hidden="true">arrow_back</span></a>
              <a href="#timeline" class="btn btn-outline h-12 px-6 text-[15px]"><span class="material-symbols-outlined text-[20px]" aria-hidden="true">timeline</span>{{ \App\Support\SiteTexts::t('about.story.btn2') }}</a>
            </div>
          </div>
          <div class="collage reveal" style="--d:.1s" aria-hidden="true">
            <div class="collage-a"><img src="{{ asset('assets/site/img/project-relief.jpg') }}" alt="" loading="lazy"></div>
            <div class="collage-b"><img src="{{ asset('assets/site/img/gallery-water.jpg') }}" alt="" loading="lazy"></div>
            <div class="collage-badge"><span class="material-symbols-outlined">volunteer_activism</span><div><b dir="ltr">{{ \App\Support\SiteTexts::t('about.story.badge_value') }}</b><small>{{ \App\Support\SiteTexts::t('about.story.badge_label') }}</small></div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= TIMELINE ================= -->
    <section id="timeline" class="sec sec-sand" aria-labelledby="timeline-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="reveal mx-auto max-w-2xl text-center">
          <p class="eyebrow justify-center"><span class="material-symbols-outlined">timeline</span>{{ \App\Support\SiteTexts::t('about.timeline.eyebrow') }}</p>
          <h2 id="timeline-title" class="section-title">{{ \App\Support\SiteTexts::t('about.timeline.title') }}</h2>
          <p class="section-lead">{{ \App\Support\SiteTexts::t('about.timeline.lead') }}</p>
        </div>
        <ol class="tl">
@foreach (\App\Support\SiteTexts::items('about.timeline') as $__ti)
@php $__tm = []; foreach ([1, 2] as $__n) { if ($__ti['meta'.$__n] !== '') { $__tm[] = [$__ti['meta'.$__n.'_icon'], $__ti['meta'.$__n]]; } } @endphp
          <li class="tl-item reveal">
            <span class="tl-dot" aria-hidden="true"></span>
            <div class="tl-card">
              <div class="flex flex-wrap items-center gap-2"><p class="tl-date"><span class="material-symbols-outlined" aria-hidden="true">{{ $__ti['date_icon'] }}</span>{{ $__ti['date'] }}</p>@if ($__ti['badge'] !== '')@if ($__ti['id'] === 'd1')<!-- PLACEHOLDER: founding year -->@endif<span class="sample-badge">{{ $__ti['badge'] }}</span>@endif</div>
              <h3 class="tl-title">{{ $__ti['title'] }}</h3>
              <p class="tl-text">{{ $__ti['text'] }}</p>
@if ($__tm)
              <p class="tl-meta">@foreach ($__tm as $__m)<span><span class="material-symbols-outlined" aria-hidden="true">{{ $__m[0] }}</span>{{ $__m[1] }}</span>@endforeach</p>
@endif
            </div>
          </li>
@endforeach
        </ol>
      </div>
    </section>

    <!-- ================= VISION / MISSION / VALUES ================= -->
    <section id="vision" class="sec" aria-labelledby="vision-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="sec-head">
          <div class="reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">visibility</span>{{ \App\Support\SiteTexts::t('about.vision.eyebrow') }}</p>
            <h2 id="vision-title" class="section-title">{{ \App\Support\SiteTexts::t('about.vision.title') }}</h2>
          </div>
          <span class="coverage-pill reveal"><span class="ab-pulse" aria-hidden="true"></span><span class="material-symbols-outlined">location_on</span>{{ \App\Support\SiteTexts::t('about.coverage') }}</span>
        </div>
        @include('site.vision.grid', ['cards' => \App\Support\VisionSupport::visible()])
        <div class="values-grid">
@foreach (\App\Support\SiteTexts::items('about.values') as $__vi => $__v)
          <div class="value-card reveal" style="--d:{{ number_format($__vi * 0.06, 2) }}s"><span class="material-symbols-outlined" aria-hidden="true">{{ $__v['icon'] }}</span><h3 class="value-title">{{ $__v['title'] }}</h3><p class="value-text">{{ $__v['text'] }}</p></div>
@endforeach
        </div>
      </div>
    </section>

    <!-- ================= HOW WE WORK ================= -->
    <section id="how" class="pillars relative isolate overflow-hidden py-20 text-white md:py-28" aria-labelledby="how-title">
      <img class="pillars-bg" src="{{ asset('assets/site/img/project-parallax.jpg') }}" alt="" aria-hidden="true" loading="lazy">
      <div class="pillars-shade" aria-hidden="true"></div>
      <div class="relative mx-auto max-w-page px-5 md:px-8">
        <div class="reveal mx-auto max-w-2xl text-center">
          <p class="eyebrow eyebrow-dark justify-center"><span class="material-symbols-outlined">route</span>{{ \App\Support\SiteTexts::t('about.how.eyebrow') }}</p>
          <h2 id="how-title" class="section-title text-white">{{ \App\Support\SiteTexts::t('about.how.title') }}</h2>
          <p class="section-lead text-white/75">{{ \App\Support\SiteTexts::t('about.how.lead') }}</p>
        </div>
        <ol class="process">
@foreach (\App\Support\SiteTexts::items('about.steps') as $__si => $__s)
          <li class="process-step reveal" style="--d:{{ number_format($__si * 0.07, 2) }}s">
            <span class="process-num" dir="ltr">{{ sprintf('%02d', $__si + 1) }}</span>
            <span class="process-ico material-symbols-outlined" aria-hidden="true">{{ $__s['icon'] }}</span>
            <h3 class="process-title">{{ $__s['title'] }}</h3>
            <p class="process-text">{{ $__s['text'] }}</p>
          </li>
@endforeach
        </ol>
      </div>
    </section>

    <!-- ================= NUMBERS ================= -->
    <section id="numbers" class="sec sec-soft" aria-labelledby="numbers-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="sec-head">
          <div class="reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">monitoring</span>{{ \App\Support\SiteTexts::t('about.numbers.eyebrow') }}</p>
            <h2 id="numbers-title" class="section-title">{{ \App\Support\SiteTexts::t('about.numbers.title') }}</h2>
            <p class="section-lead">{{ \App\Support\SiteTexts::t('about.numbers.lead') }}</p>
          </div>
          <a href="{{ route('news.index') }}" class="btn btn-outline reveal h-12 shrink-0 px-5 text-[14px]">{{ \App\Support\SiteTexts::t('about.numbers.btn') }}<span class="material-symbols-outlined btn-arrow text-[18px]" aria-hidden="true">west</span></a>
        </div>
        <div class="num-grid">
@foreach (\App\Support\SiteTexts::items('about.tiles') as $__ni => $__n)
          <div class="num-tile reveal"{!! $__ni ? ' style="--d:'.ltrim(number_format($__ni * 0.06, 2), '0').'s"' : '' !!}><span class="material-symbols-outlined" aria-hidden="true">{{ $__n['icon'] }}</span><p class="num-val" dir="ltr"{!! \App\Support\SiteTexts::countAttrs($__n['value']) !!}>{{ $__n['value'] }}</p><p class="num-label">{{ $__n['label'] }}</p></div>
@endforeach
        </div>
        <div class="num-row reveal">
@foreach (\App\Support\SiteTexts::items('about.minis') as $__m)
          <p class="num-mini"><span class="material-symbols-outlined" aria-hidden="true">{{ $__m['icon'] }}</span><span><b dir="ltr">{{ $__m['value'] }}</b> {{ $__m['text'] }}</span></p>
@endforeach
        </div>
      </div>
    </section>

    <!-- ================= TEAM / BOARD ================= -->
    <!-- PLACEHOLDER: replace names, roles, photos and bios with the real board and team -->
    <section id="team" class="sec sec-sand" aria-labelledby="team-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="sec-head">
          <div class="reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">groups</span>{{ \App\Support\SiteTexts::t('about.team.eyebrow') }}</p>
            <h2 id="team-title" class="section-title">{{ \App\Support\SiteTexts::t('about.team.title') }}</h2>
            <p class="section-lead">{{ \App\Support\SiteTexts::t('about.team.lead') }}@if (\App\Support\SiteTexts::t('about.team.badge') !== '') <span class="sample-badge">{{ \App\Support\SiteTexts::t('about.team.badge') }}</span>@endif</p>
          </div>
        </div>
@if (\App\Support\SiteTexts::items('about.board'))
        <p class="team-group reveal">{{ \App\Support\SiteTexts::t('about.team.board_label') }}</p>
        <div class="team-grid">
@foreach (\App\Support\SiteTexts::items('about.board') as $__mi => $__mb)
          <article class="team-card reveal" style="--d:{{ number_format($__mi * 0.06, 2) }}s">
            <span class="team-avatar" aria-hidden="true"><span class="material-symbols-outlined">person</span></span>
            <div><h3 class="team-name">{{ $__mb['name'] }}</h3><p class="team-role">{{ $__mb['role'] }}</p><p class="team-bio">{{ $__mb['bio'] }}</p></div>
          </article>
@endforeach
        </div>
@endif
@if (\App\Support\SiteTexts::items('about.exec'))
        <p class="team-group reveal">{{ \App\Support\SiteTexts::t('about.team.exec_label') }}</p>
        <div class="team-grid">
@foreach (\App\Support\SiteTexts::items('about.exec') as $__mi => $__mb)
          <article class="team-card reveal" style="--d:{{ number_format($__mi * 0.06, 2) }}s">
            <span class="team-avatar" aria-hidden="true"><span class="material-symbols-outlined">person</span></span>
            <div><h3 class="team-name">{{ $__mb['name'] }}</h3><p class="team-role">{{ $__mb['role'] }}</p><p class="team-bio">{{ $__mb['bio'] }}</p></div>
          </article>
@endforeach
        </div>
@endif
      </div>
    </section>

    <!-- ================= PARTNERS ================= -->
    <section id="partners" class="partners-lux relative isolate overflow-hidden text-white" aria-labelledby="partners-title">
      <div class="lux-pattern" aria-hidden="true"></div>
      <div class="lux-glow" aria-hidden="true"></div>
      <span class="lux-hairline lux-hairline-top" aria-hidden="true"></span>
      <div class="relative mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
        <div class="grid items-end gap-8 lg:grid-cols-12">
          <div class="reveal lg:col-span-7">
            <p class="lux-eyebrow"><span class="lux-rule" aria-hidden="true"></span><span class="material-symbols-outlined">handshake</span>{{ \App\Support\SiteTexts::t('about.partners.eyebrow') }}<span class="lux-rule" aria-hidden="true"></span></p>
            <h2 id="partners-title" class="lux-title">{!! \App\Support\SiteTexts::gold('about.partners.title', 'about.partners.title_gold') !!}</h2>
          </div>
          <div class="lux-statement reveal lg:col-span-5">
            <p>{{ \App\Support\SiteTexts::t('about.partners.statement') }}</p>
          </div>
        </div>
        <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
@foreach (\App\Support\SiteTexts::items('about.partners') as $__pi => $__p)
          <article class="lux-card reveal" style="--d:{{ number_format(($__pi % 3) * 0.06, 2) }}s">
            <div class="lux-card-top"><div class="lux-logo"><img src="{{ asset('assets/site/img/partners/'.$__p['img']) }}" alt="{{ $__p['name'] }}" loading="lazy"></div><p class="lux-tag"><span class="material-symbols-outlined">{{ $__p['tag_icon'] }}</span>{{ $__p['tag'] }}</p></div>
            <h3 class="lux-name">{{ $__p['name'] }}</h3>
            <p class="lux-desc">{{ $__p['desc'] }}</p>
          </article>
@endforeach
        </div>
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>
    <div class="pt-20 md:pt-28" aria-hidden="true"></div>

    <!-- ================= DONATE CTA ================= -->
    <section class="pb-20 md:pb-28" aria-labelledby="cta-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="cta-card reveal">
          <div class="cta-body">
            <span class="cta-pill"><span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>{{ \App\Support\SiteTexts::t('about.cta.pill') }}</span>
            <p class="mt-6 text-[15px] font-bold text-gold-light">{{ \App\Support\SiteTexts::t('about.cta.label') }}</p>
            <h2 id="cta-title" class="cta-title">{!! \App\Support\SiteTexts::gold('about.cta.title', 'about.cta.title_gold', 'br') !!}</h2>
            <p class="cta-text">{{ \App\Support\SiteTexts::t('about.cta.text') }}</p>
            <div class="cta-actions">
              <a href="{{ route('contact') }}#message-form" class="btn btn-donate h-14 ps-2 pe-6 text-[16px]">
                <span class="grid h-10 w-10 place-items-center rounded-full bg-primary text-gold-light"><span class="material-symbols-outlined fill text-[20px]" aria-hidden="true">volunteer_activism</span></span>
                {{ \App\Support\SiteTexts::t('about.cta.btn') }}
                <span class="material-symbols-outlined btn-arrow text-[20px]" aria-hidden="true">arrow_back</span>
              </a>
              <a href="https://wa.me/{{ \App\Support\SiteContent::info()['wa'] }}" target="_blank" rel="noopener" class="btn btn-glass h-14 px-6 text-[16px]"><span class="material-symbols-outlined text-gold-light" aria-hidden="true">chat</span>{{ \App\Support\SiteTexts::t('about.cta.btn_wa') }}</a>
            </div>
          </div>
          <div class="cta-media" aria-hidden="true"><img src="{{ asset('assets/site/img/gallery-convoy.jpg') }}" alt="" loading="lazy"></div>
        </div>
      </div>
    </section>
  </main>
@endsection
@push('scripts')
<script src="{{ asset('assets/site/js/pages.js') }}"></script>
<script src="{{ asset('assets/site/js/main.js') }}"></script>
@endpush
