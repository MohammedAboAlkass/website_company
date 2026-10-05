@extends('layouts.site')
@php
  $__t = fn (string $k) => \App\Support\SiteTexts::t($k);
  $__desc = \App\Support\SiteContent::plain($ac->description);
  $__meta = $ac->date_label ?: ($ac->activity_date ? \App\Support\SiteContent::date($ac->activity_date) : '');
  $__img = \App\Support\SiteContent::img($ac->image, asset('assets/site/img/logo.png'));
  $__imgAbs = \Illuminate\Support\Str::startsWith($__img, 'http') ? $__img : url($__img);
  $__tone = \App\Support\SiteContent::tone($ac->badge_tone ?: 'forest');
  $__url = route('activities.show', $ac->id);
  $__wa = \App\Support\SiteContent::info();
  $__ext = $hasLink ? \App\Support\SiteContent::safeUrl($ac->link_url, '') : '';
@endphp
@section('title', $ac->title.' — جمعية الشمال للتنمية والتطوير المجتمعي')
@section('description', \Illuminate\Support\Str::limit($__desc, 160))
@section('page', 'activity')
@section('active', 'home')
@push('css')
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('pages') }}">
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('ed-content') }}">
<link rel="canonical" href="{{ $__url }}">
<meta property="og:type" content="website">
<meta property="og:title" content="{{ $ac->title }}">
<meta property="og:description" content="{{ \Illuminate\Support\Str::limit($__desc, 160) }}">
<meta property="og:url" content="{{ $__url }}">
<meta property="og:image" content="{{ $__imgAbs }}">
<meta name="twitter:card" content="summary_large_image">
<style>
.pd-facts.act-facts { grid-template-columns: minmax(0, 1fr); }
.act-facts .pd-fact { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; padding: 12px 16px; }
.act-facts .pd-fact dt { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.act-facts .pd-fact .material-symbols-outlined { display: inline-block; margin-bottom: 0; }
.act-facts .pd-fact dd { flex: 1 1 8rem; min-width: 0; margin: 0; text-align: start; overflow-wrap: anywhere; }
.act-facts .pd-fact.is-long dd { flex-basis: 100%; }
</style>
@endpush
@section('content')
<main id="main">
    <!-- ================= PAGE HERO ================= -->
    <section class="page-hero " aria-labelledby="page-title">
      <div class="page-hero-media" aria-hidden="true"><img src="{{ $__img }}" alt="" data-hero-img></div>
      <div class="page-hero-shade" aria-hidden="true"></div>
      <div class="page-hero-pattern" aria-hidden="true"></div>
      <div class="hero-grain" aria-hidden="true"></div>
      <div class="page-hero-inner mx-auto max-w-page px-5 md:px-8">
        <nav class="crumbs hero-in d1" aria-label="{{ $__t('project.detail.crumb_label') }}">
          <ol><li><a href="{{ route('home') }}"><span class="material-symbols-outlined" aria-hidden="true">home</span>{{ $__t('project.detail.crumb_home') }}</a></li><li><a href="{{ route('home') }}#activities">{{ $__t('activity.detail.crumb') }}</a></li><li><span aria-current="page" data-crumb-current>{{ $ac->title }}</span></li></ol>
        </nav>
        <p class="page-hero-kicker hero-in d2" data-hero-kicker>{{ $__t('activity.detail.kicker') }}</p>
        <h1 id="page-title" class="page-hero-title hero-in d3" data-hero-title>{{ $ac->title }}</h1>
        <div class="page-hero-meta hero-in d5"><span class="contents">
          @if($__meta !== '')<span class="hero-chip"><span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>{{ $__meta }}</span>@endif
          @if($ac->place)<span class="hero-chip"><span class="material-symbols-outlined" aria-hidden="true">location_on</span>{{ $ac->place }}</span>@endif
        </span></div>
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>

    <!-- ================= ACTIVITY DETAIL ================= -->
    <section class="sec pt-12 md:pt-16" aria-label="{{ $__t('activity.detail.section_aria') }}">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="pd-grid">
          <figure class="pd-cover">
            <img src="{{ $__img }}" alt="{{ $ac->image_alt ?: $ac->title }}">
            @if($ac->badge_text)<span class="badge {{ $__tone }}">{{ $ac->badge_text }}</span>@endif
            @if($ac->place)<figcaption><span class="material-symbols-outlined" aria-hidden="true">location_on</span>{{ $ac->place }}</figcaption>@endif
          </figure>

          <aside class="pd-aside" aria-labelledby="donate-title">
            <div class="donate-box">
              <div class="donate-top">
                <h2 id="donate-title" class="donate-title">{{ $__t('activity.detail.box_title') }}</h2>
              </div>
              <dl class="pd-facts act-facts">
                @if($__meta !== '')<div class="pd-fact{{ mb_strlen($__meta) > 22 ? ' is-long' : '' }}"><dt><span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>{{ $__t('activity.detail.fact_date') }}</dt><dd>{{ $__meta }}</dd></div>@endif
                @if($ac->place)<div class="pd-fact{{ mb_strlen($ac->place) > 22 ? ' is-long' : '' }}"><dt><span class="material-symbols-outlined" aria-hidden="true">location_on</span>{{ $__t('activity.detail.fact_place') }}</dt><dd>{{ $ac->place }}</dd></div>@endif
                @if($ac->stat_label)<div class="pd-fact{{ mb_strlen($ac->stat_label) > 22 ? ' is-long' : '' }}"><dt><span class="material-symbols-outlined" aria-hidden="true">{{ $ac->stat_icon ?: 'group' }}</span>{{ $__t('activity.detail.fact_stat') }}</dt><dd>{{ $ac->stat_label }}</dd></div>@endif
              </dl>
              <div class="donate-actions">
                @if($project)<a class="btn btn-forest h-12 w-full text-[14.5px]" href="{{ route('projects.show', $project->slug) }}">{{ $__t('activity.detail.cta_project') }}<span class="material-symbols-outlined btn-arrow text-[18px]" aria-hidden="true">arrow_back</span></a>@endif
                @if($__ext !== '')<a class="btn btn-outline h-12 w-full text-[14.5px]" href="{{ $__ext }}"@if(preg_match('#^https?://#i', $__ext)) target="_blank" rel="noopener"@endif>{{ $ac->link_label ?: $__t('activity.detail.cta_link') }}</a>@endif
                <a class="btn btn-gold h-14 w-full text-[16px]" href="{{ route('contact') }}?topic=inquiry#message-form"><span class="material-symbols-outlined fill text-[20px]" aria-hidden="true">support_agent</span><span>{{ $__t('activity.detail.cta_inquire') }}</span></a>
                @if($__wa['wa'])<a class="btn btn-outline h-12 w-full text-[14.5px]" href="https://wa.me/{{ $__wa['wa'] }}" target="_blank" rel="noopener"><span class="material-symbols-outlined text-[20px]" aria-hidden="true">chat</span>{{ $__t('project.detail.cta_wa') }}</a>@endif
              </div>
            </div>
          </aside>

          <div class="pd-body">
            @if(trim($__desc) !== '')
            <div class="pd-block">
              <h2 class="pd-h">{{ $__t('activity.detail.h_about') }}</h2>
              <div class="ed-content pd-text">{!! \App\Support\SiteContent::rich($ac->description) !!}</div>
            </div>
            @endif
            <div class="share-inline">
              <span class="share-label">{{ $__t('activity.detail.share') }}</span>
              <div class="share" data-share>@include('partials.site.share', ['title' => $ac->title])</div>
            </div>
            <p class="mt-8"><a class="link-arrow text-[15px]" href="{{ route('home') }}#activities">{{ $__t('activity.detail.back') }}<span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></a></p>
          </div>
        </div>
      </div>
    </section>
  </main>
@endsection
@push('scripts')
<script src="{{ asset('assets/site/js/pages.js') }}"></script>
<script src="{{ asset('assets/site/js/main.js') }}"></script>
@endpush
