@extends('layouts.site')
{{-- block form + {!! !!}: the layout escapes title/description once when it prints them (the inline @section form would escape twice) --}}
@section('title'){!! \App\Support\SiteTexts::t('partners.seo.title') !!}@endsection
@section('description'){!! \App\Support\SiteTexts::t('partners.seo.description') !!}@endsection
@section('page', 'partners')
@section('active', 'partners')
@push('css')
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('pages') }}">
@endpush
@section('content')
@php $__wa = \App\Support\SiteContent::info()['wa']; @endphp
<main id="main">
    <!-- ================= PAGE HERO ================= -->
    <section class="page-hero " aria-labelledby="page-title">
      <div class="page-hero-media" aria-hidden="true"><img src="{{ asset('assets/site/img/gallery-campus.jpg') }}" alt="" data-hero-img></div>
      <div class="page-hero-shade" aria-hidden="true"></div>
      <div class="page-hero-pattern" aria-hidden="true"></div>
      <div class="hero-grain" aria-hidden="true"></div>
      <div class="page-hero-inner mx-auto max-w-page px-5 md:px-8">
        <nav class="crumbs hero-in d1" aria-label="مسار التنقل">
          <ol><li><a href="{{ route('home') }}"><span class="material-symbols-outlined" aria-hidden="true">home</span>الرئيسية</a></li><li><span aria-current="page" data-crumb-current>{{ \App\Support\SiteTexts::t('partners.hero.title') }}</span></li></ol>
        </nav>
        <p class="page-hero-kicker hero-in d2" data-hero-kicker>{{ \App\Support\SiteTexts::t('partners.hero.kicker') }}</p>
        <h1 id="page-title" class="page-hero-title hero-in d3" data-hero-title>{!! \App\Support\SiteTexts::gold('partners.hero.title', 'partners.hero.title_gold') !!}</h1>
        <p class="page-hero-lead hero-in d4" data-hero-lead>{{ \App\Support\SiteTexts::t('partners.hero.lead') }}</p>
@if($partners->count())
        <div class="page-hero-meta hero-in d5"><span class="hero-chip"><span class="material-symbols-outlined" aria-hidden="true">handshake</span><b dir="ltr">{{ $partners->count() }}</b>{{ \App\Support\SiteTexts::t('partners.hero.chip_label') }}</span></div>
@endif
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>

    <!-- ================= PARTNERS (same data as the home page section: table `partners`) ================= -->
    <section id="partners" class="partners-lux relative isolate overflow-hidden text-white" aria-labelledby="partners-title">
      <div class="lux-pattern" aria-hidden="true"></div>
      <div class="lux-glow" aria-hidden="true"></div>
      <span class="lux-hairline lux-hairline-top" aria-hidden="true"></span>
      <div class="relative mx-auto max-w-page px-5 py-16 md:px-8 md:py-24">
        <div class="reveal text-center">
          <p class="lux-eyebrow"><span class="lux-rule" aria-hidden="true"></span><span class="material-symbols-outlined">handshake</span>{{ \App\Support\SiteTexts::t('partners.intro.eyebrow') }}<span class="lux-rule" aria-hidden="true"></span></p>
          <h2 id="partners-title" class="lux-title">{!! \App\Support\SiteTexts::gold('partners.intro.title', 'partners.intro.title_gold') !!}</h2>
          <div class="lux-statement">
            <p>{{ \App\Support\SiteTexts::t('partners.intro.text') }}</p>
          </div>
        </div>
@if($partners->count())
        <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" id="partners-grid" style="overflow-wrap:anywhere">
@foreach($partners as $pt)
@php $__url = $pt->website_url ? \App\Support\SiteContent::safeUrl($pt->website_url, '') : ''; @endphp
          <article class="lux-card reveal"@if($loop->index % 3) style="--d:{{ ($loop->index % 3) * 0.06 }}s"@endif>
            <div class="lux-card-top"><div class="lux-logo">@if($pt->logo)<img src="{{ \App\Support\SiteContent::img($pt->logo) }}" alt="{{ $pt->name }}" loading="lazy">@endif</div>@if($pt->tag_label)<p class="lux-tag"><span class="material-symbols-outlined">{{ $pt->tag_icon ?: 'handshake' }}</span>{{ $pt->tag_label }}</p>@endif</div>
            <h3 class="lux-name">@if($__url)<a href="{{ $__url }}" target="_blank" rel="noopener noreferrer">{{ $pt->name }}</a>@else{{ $pt->name }}@endif</h3>
            <p class="lux-desc">{{ $pt->description }}</p>
          </article>
@endforeach
        </div>
@else
        <div class="mt-12 text-center">
          <h3 class="lux-name">{{ \App\Support\SiteTexts::t('partners.empty.title') }}</h3>
          <p class="lux-desc">{{ \App\Support\SiteTexts::t('partners.empty.text') }}</p>
        </div>
@endif
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>
    <div class="pt-20 md:pt-28" aria-hidden="true"></div>

    <!-- ================= CONTACT CTA ================= -->
    <section class="pb-20 md:pb-28" aria-labelledby="cta-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="cta-card reveal">
          <div class="cta-body">
            <span class="cta-pill"><span class="material-symbols-outlined" aria-hidden="true">handshake</span>{{ \App\Support\SiteTexts::t('partners.cta.pill') }}</span>
            <p class="mt-6 text-[15px] font-bold text-gold-light">{{ \App\Support\SiteTexts::t('partners.cta.label') }}</p>
            <h2 id="cta-title" class="cta-title">{!! \App\Support\SiteTexts::gold('partners.cta.title', 'partners.cta.title_gold', 'br') !!}</h2>
            <p class="cta-text">{{ \App\Support\SiteTexts::t('partners.cta.text') }}</p>
            <div class="cta-actions">
              <a href="{{ route('contact') }}#message-form" class="btn btn-donate h-14 ps-2 pe-6 text-[16px]">
                <span class="grid h-10 w-10 place-items-center rounded-full bg-primary text-gold-light"><span class="material-symbols-outlined fill text-[20px]" aria-hidden="true">mail</span></span>
                {{ \App\Support\SiteTexts::t('partners.cta.btn') }}
                <span class="material-symbols-outlined btn-arrow text-[20px]" aria-hidden="true">arrow_back</span>
              </a>
              @if($__wa)<a href="https://wa.me/{{ $__wa }}" target="_blank" rel="noopener" class="btn btn-glass h-14 px-6 text-[16px]"><span class="material-symbols-outlined text-gold-light" aria-hidden="true">chat</span>{{ \App\Support\SiteTexts::t('partners.cta.btn_wa') }}</a>@endif
            </div>
          </div>
          <div class="cta-media" aria-hidden="true"><img src="{{ asset('assets/site/img/gallery-convoy.jpg') }}" alt="" loading="lazy"></div>
        </div>
      </div>
    </section>
  </main>
@endsection
@push('scripts')
<script src="{{ asset('assets/site/js/main.js') }}"></script>
@endpush
