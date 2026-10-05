@extends('layouts.site')
@php
  $__title = $p->seo_title ?: $p->title;
  $__desc = $p->seo_description ?: ($p->summary ?: \Illuminate\Support\Str::limit(\App\Support\ContentSupport::plainText($desc), 160));
  $__img = \App\Support\SiteContent::img($p->cover, asset('assets/site/img/project-relief.jpg'));
  $__imgAbs = \Illuminate\Support\Str::startsWith($__img, 'http') ? $__img : url($__img);
  $__urgent = $p->status === 'urgent';
  $__pct = $p->progress_percent !== null ? max(0, min(100, (int) $p->progress_percent)) : null;
  $__statusLbl = ['active' => \App\Support\SiteTexts::t('project.status.active'), 'urgent' => \App\Support\SiteTexts::t('project.status.urgent'), 'paused' => \App\Support\SiteTexts::t('project.status.paused'), 'completed' => \App\Support\SiteTexts::t('project.status.completed')][$p->status] ?? null;
  $__tone = \App\Support\SiteContent::tone($p->badge_tone ?: ($__urgent ? 'urgent' : 'forest'));
  $__badge = $p->badge_text ?: ($__urgent ? \App\Support\SiteTexts::t('project.badge_default') : null);
  $__pIcon = \App\Support\SiteContent::programIcon($p->program?->slug);
  $__wa = \App\Support\SiteContent::info();
@endphp
@section('title', $__title.' — جمعية الشمال للتنمية والتطوير المجتمعي')
@section('description', $__desc)
@section('page', 'project')
@section('active', 'projects')
@push('css')
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('pages') }}">
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('ed-content') }}">
<link rel="canonical" href="{{ route('projects.show', $p->slug) }}">
<meta property="og:type" content="website">
<meta property="og:title" content="{{ $__title }}">
<meta property="og:description" content="{{ $__desc }}">
<meta property="og:url" content="{{ route('projects.show', $p->slug) }}">
<meta property="og:image" content="{{ $__imgAbs }}">
<meta name="twitter:card" content="summary_large_image">
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
        <nav class="crumbs hero-in d1" aria-label="{{ \App\Support\SiteTexts::t('project.detail.crumb_label') }}">
          <ol><li><a href="{{ route('home') }}"><span class="material-symbols-outlined" aria-hidden="true">home</span>{{ \App\Support\SiteTexts::t('project.detail.crumb_home') }}</a></li><li><a href="{{ route('projects.index') }}">{{ \App\Support\SiteTexts::t('project.detail.crumb_projects') }}</a></li><li><span aria-current="page" data-crumb-current>{{ $p->title }}</span></li></ol>
        </nav>
        <p class="page-hero-kicker hero-in d2" data-hero-kicker>{{ \App\Support\SiteTexts::t('project.detail.kicker') }}</p>
        <h1 id="page-title" class="page-hero-title hero-in d3" data-hero-title>{{ $p->title }}</h1>
        @if($p->summary)<p class="page-hero-lead hero-in d4" data-hero-lead>{{ $p->summary }}</p>@endif
        <div class="page-hero-meta hero-in d5"><span id="pd-hero-chips" class="contents">
          @if($__urgent)<span class="hero-chip hero-chip-urgent"><span class="live-dot live-dot-white" aria-hidden="true"></span>{{ $__badge ?: \App\Support\SiteTexts::t('project.badge_default') }}</span>@endif
          @if($progLabel)<span class="hero-chip"><span class="material-symbols-outlined" aria-hidden="true">{{ $__pIcon }}</span>{{ $progLabel }}</span>@endif
          @if($p->location_text)<span class="hero-chip"><span class="material-symbols-outlined" aria-hidden="true">location_on</span>{{ $p->location_text }}</span>@endif
          @if($__pct !== null)<span class="hero-chip"><b dir="ltr">{{ $__pct }}%</b>{{ \App\Support\SiteTexts::t('project.progress') }}</span>@endif
          @if($__statusLbl && ! $__urgent)<span class="hero-chip">{{ $__statusLbl }}</span>@endif
        </span></div>
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>

    <!-- ================= PROJECT DETAIL ================= -->
    <section class="sec pt-12 md:pt-16" aria-label="{{ \App\Support\SiteTexts::t('project.detail.section_aria') }}">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="pd-grid" id="pd-root">
          <figure class="pd-cover" id="pd-cover">
            <img src="{{ $__img }}" alt="{{ $p->cover_alt ?: $p->title }}">
            @if($__badge)<span class="badge {{ $__tone }}">@if($__urgent || $p->badge_tone === 'urgent')<span class="live-dot live-dot-white"></span>@elseif($p->badge_icon)<span class="material-symbols-outlined" aria-hidden="true">{{ $p->badge_icon }}</span>@endif{{ $__badge }}</span>@endif
            @if($p->location_text)<figcaption><span class="material-symbols-outlined" aria-hidden="true">location_on</span>{{ $p->location_text }}</figcaption>@endif
          </figure>

          <aside class="pd-aside" aria-labelledby="donate-title">
            <div class="donate-box">
              <div class="donate-top">
                <h2 id="donate-title" class="donate-title">{{ \App\Support\SiteTexts::t('project.detail.status_title') }}</h2>
                @if($__statusLbl)<span class="badge-soft">{{ $__statusLbl }}</span>@endif
              </div>
              @if($__pct !== null)
              <div class="donate-pct"><b dir="ltr">{{ $__pct }}%</b><span>{{ \App\Support\SiteTexts::t('project.progress') }}</span></div>
              <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{ $__pct }}" aria-label="{{ \App\Support\SiteTexts::t('project.progress') }}: {{ $p->title }}">
                <div class="progress-track"><div class="bar-fill gold is-in" style="--w:{{ $__pct }}%"></div></div>
              </div>
              @endif
              @if($p->beneficiaries_count)
              <dl class="donate-figs">
                <div><dt>{{ \App\Support\SiteTexts::t('project.detail.beneficiaries') }}</dt><dd dir="ltr">{{ number_format($p->beneficiaries_count) }}</dd></div>
                @if($p->governorate)<div><dt>{{ \App\Support\SiteTexts::t('project.detail.governorate') }}</dt><dd>{{ $p->governorate->name }}</dd></div>@endif
              </dl>
              @endif
              <div class="donate-actions">
                <a class="btn btn-gold h-14 w-full text-[16px]" href="{{ route('contact') }}?topic=inquiry#message-form"><span class="material-symbols-outlined fill text-[20px]" aria-hidden="true">support_agent</span><span>{{ \App\Support\SiteTexts::t('project.detail.cta_inquire') }}</span></a>
                @if($__wa['wa'])<a class="btn btn-outline h-12 w-full text-[14.5px]" href="https://wa.me/{{ $__wa['wa'] }}" target="_blank" rel="noopener"><span class="material-symbols-outlined text-[20px]" aria-hidden="true">chat</span>{{ \App\Support\SiteTexts::t('project.detail.cta_wa') }}</a>@endif
              </div>
              <ul class="donate-trust">
                <li><span class="material-symbols-outlined" aria-hidden="true">photo_camera</span>{{ \App\Support\SiteTexts::t('project.detail.trust') }}</li>
              </ul>
            </div>
            @if($__wa['phone'])
            <div class="donate-help">
              <span class="material-symbols-outlined" aria-hidden="true">support_agent</span>
              <p>{{ \App\Support\SiteTexts::t('project.detail.help') }} <a href="tel:{{ $__wa['tel'] }}" dir="ltr">{{ $__wa['phone'] }}</a></p>
            </div>
            @endif
          </aside>

          <div class="pd-body">
            <dl class="pd-facts" id="pd-facts">
              @foreach($p->facts as $f)<div class="pd-fact"><dt><span class="material-symbols-outlined" aria-hidden="true">{{ $loop->first ? 'inventory_2' : 'groups' }}</span>{{ $f->label }}</dt><dd>{{ $f->value }}</dd></div>@endforeach
              @if($p->location_text)<div class="pd-fact"><dt><span class="material-symbols-outlined" aria-hidden="true">location_on</span>{{ \App\Support\SiteTexts::t('project.detail.fact_location') }}</dt><dd>{{ $p->location_text }}</dd></div>@endif
              @if($progLabel)<div class="pd-fact"><dt><span class="material-symbols-outlined" aria-hidden="true">{{ $__pIcon }}</span>{{ \App\Support\SiteTexts::t('project.detail.fact_category') }}</dt><dd>{{ $progLabel }}</dd></div>@endif
            </dl>

            <div class="pd-block">
              <h2 class="pd-h">{{ \App\Support\SiteTexts::t('project.detail.h_about') }}</h2>
              @if($p->summary)<p class="pd-text pd-text-lead" data-pd="desc">{{ $p->summary }}</p>@endif
              @if(trim($desc) !== '')<div class="ed-content pd-text">{!! $desc !!}</div>@endif
            </div>

            @if($p->components->count())
            <div class="pd-block">
              <h2 class="pd-h">{{ \App\Support\SiteTexts::t('project.detail.h_covers') }}</h2>
              <div class="covers" id="pd-covers">
                @foreach($p->components as $c)<div class="cover-item"><span class="material-symbols-outlined" aria-hidden="true">{{ $c->icon ?: 'check_circle' }}</span><h3>{{ $c->title }}</h3><p>{{ $c->text }}</p></div>@endforeach
              </div>
            </div>
            @endif

            @php $__imgs = $p->images->filter(fn ($i) => $i->media); @endphp
            @if($__imgs->count())
            <div class="pd-block">
              <h2 class="pd-h">{{ \App\Support\SiteTexts::t('project.detail.h_field') }}</h2>
              <div class="pd-gallery" id="pd-gallery" data-n="{{ $__imgs->count() }}">
                @foreach($__imgs as $im)
                  @php $__u = \App\Support\SiteContent::img($im->media); $__cap = $im->caption ?: $p->title; @endphp
                  <a class="pd-thumb" href="{{ $__u }}" data-lb-group="project" data-lb-kicker="{{ $p->title }}" data-lb-title="{{ $__cap }}" aria-label="{{ \App\Support\SiteTexts::t('project.detail.lb_view') }}: {{ $__cap }}"><img src="{{ $__u }}" alt="{{ $__cap }}" loading="lazy"></a>
                @endforeach
              </div>
            </div>
            @endif

            @if($updates->count())
            <div class="pd-block">
              <h2 class="pd-h">{{ \App\Support\SiteTexts::t('project.detail.h_updates') }}</h2>
              <ol class="updates" id="pd-updates">
                @foreach($updates as $u)
                <li class="update"><span class="update-dot" aria-hidden="true"></span><div class="update-card"><time datetime="{{ optional($u->published_at)->toDateString() }}">{{ \App\Support\SiteContent::date($u->published_at) }}</time><h3>{{ $u->title }}</h3><p>{!! nl2br(e($u->body)) !!}</p></div></li>
                @endforeach
              </ol>
            </div>
            @endif

            <div class="share-inline">
              <span class="share-label">{{ \App\Support\SiteTexts::t('project.detail.share') }}</span>
              <div class="share" data-share>@include('partials.site.share', ['title' => $p->title])</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= RELATED ================= -->
    @if($related->count())
    <section class="sec sec-sand" aria-labelledby="related-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="sec-head">
          <div>
            <p class="eyebrow"><span class="material-symbols-outlined">cases</span>{{ \App\Support\SiteTexts::t('project.related.eyebrow') }}</p>
            <h2 id="related-title" class="section-title">{{ \App\Support\SiteTexts::t('project.related.title') }}</h2>
          </div>
          <a href="{{ route('projects.index') }}" class="btn btn-outline h-12 shrink-0 px-5 text-[14px]">{{ \App\Support\SiteTexts::t('project.related.all') }}<span class="material-symbols-outlined btn-arrow text-[18px]" aria-hidden="true">west</span></a>
        </div>
        <div class="pj-grid" id="pd-related">
          @foreach($related as $r)@include('partials.site.project-card', ['p' => $r])@endforeach
        </div>
      </div>
    </section>
    @endif
  </main>
@include('partials.site.lightbox')
@endsection
@push('scripts')
<script src="{{ asset('assets/site/js/pages.js') }}"></script>
<script src="{{ asset('assets/site/js/main.js') }}"></script>
@endpush
