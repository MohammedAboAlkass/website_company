@extends('layouts.site')
@section('title', 'معرض الصور — جمعية الشمال للتنمية والتطوير المجتمعي')
@section('description', 'معرض التوثيق الميداني في غزة: صور وفيديو لوصول السلال والخيام والدواء إلى مستحقيها في مخيمات النزوح.')
@section('page', 'gallery')
@section('active', 'gallery')
@push('css')
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('pages') }}">
@endpush
@section('content')
<main id="main">
    <!-- ================= PAGE HERO ================= -->
    <section class="page-hero " aria-labelledby="page-title">
      <div class="page-hero-media" aria-hidden="true"><img src="{{ asset('assets/site/img/gallery-convoy.jpg') }}" alt="" data-hero-img></div>
      <div class="page-hero-shade" aria-hidden="true"></div>
      <div class="page-hero-pattern" aria-hidden="true"></div>
      <div class="hero-grain" aria-hidden="true"></div>
      <div class="page-hero-inner mx-auto max-w-page px-5 md:px-8">
        <nav class="crumbs hero-in d1" aria-label="مسار التنقل">
          <ol><li><a href="{{ route('home') }}"><span class="material-symbols-outlined" aria-hidden="true">home</span>الرئيسية</a></li><li><span aria-current="page" data-crumb-current>معرض الصور</span></li></ol>
        </nav>
        <p class="page-hero-kicker hero-in d2" data-hero-kicker>مرئيات من قطاع غزة</p>
        <h1 id="page-title" class="page-hero-title hero-in d3" data-hero-title>معرض التوثيق الميداني <span class="text-gradient-gold">في غزة</span></h1>
        <p class="page-hero-lead hero-in d4" data-hero-lead>أرشيف حي يوثّق وصول السلال والخيام والدواء إلى مستحقيها في مخيمات النزوح بكرامة.</p>
        <div class="page-hero-meta hero-in d5"><span class="hero-chip"><span class="material-symbols-outlined" aria-hidden="true">photo_library</span><b dir="ltr">{{ $photos }}</b>صورة</span>@if($videos)<span class="hero-chip"><span class="material-symbols-outlined" aria-hidden="true">play_circle</span><b dir="ltr">{{ $videos }}</b>فيديو</span>@endif</div>
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>

    <!-- ================= GALLERY ================= -->
    <section id="gallery" class="gallery sec relative isolate" aria-labelledby="gallery-title">
      <div class="gallery-glow" aria-hidden="true"></div>
      <div class="relative mx-auto max-w-page px-5 md:px-8">
        <div class="sec-head">
          <div class="reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">perm_media</span>الأرشيف المصور</p>
            <h2 id="gallery-title" class="section-title">لقطات من الميدان</h2>
            <p class="section-lead">اضغط على أي صورة لفتح العارض، وتنقّل بالأسهم أو بالسحب على الجوال.</p>
          </div>
        </div>
        <div class="toolbar reveal mt-9">
          <div id="gl-filters" class="chip-bar" role="group" aria-label="تصنيف الصور">
          <button type="button" class="chip is-on" data-filter="all" aria-pressed="true"><span class="material-symbols-outlined" aria-hidden="true">auto_awesome</span>الكل<span class="chip-count">{{ $items->count() }}</span></button>
          @foreach($chips as $c)
          <button type="button" class="chip" data-filter="{{ $c['slug'] }}" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">{{ ['field'=>'hub','relief'=>'shopping_basket','development'=>'school','health'=>'health_and_safety'][$c['slug']] ?? 'photo_library' }}</span>{{ $c['label'] }}<span class="chip-count">{{ $c['count'] }}</span></button>
          @endforeach
          @if($videos)<button type="button" class="chip" data-filter="video" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">play_circle</span>فيديو<span class="chip-count">{{ $videos }}</span></button>@endif
          </div>
          <p class="result-count" id="gl-count" aria-live="polite">{!! \App\Support\SiteTexts::bold('js.count.gallery', ['shown' => $items->count()]) !!}</p>
        </div>
        <div class="masonry" id="gl-grid">
@foreach($items as $it)
@php
  $__isVideo = $it->type === 'video';
  $__album = $albums[$it->gallery_album_id] ?? null;
  $__url = $__isVideo ? \App\Support\SiteContent::safeUrl($it->video_url, '') : \App\Support\SiteContent::img($it->media);
  $__thumb = \App\Support\SiteContent::img($it->media, asset('assets/site/img/hero-poster.jpg'));
  $__file = $__isVideo && preg_match('#\.(mp4|webm|ogg)(\?.*)?$#i', (string) $__url);
  $__ttl = $it->title ?: ($it->caption ?: '');
  $__kick = trim(implode(' • ', array_filter([$it->governorate?->name, $it->taken_at ? \App\Support\SiteContent::date($it->taken_at) : null])));
  if ($__kick === '') { $__kick = $__isVideo ? 'فيديو ميداني' : ($__album?->name ?? ''); }
  $__ar = ($it->media && $it->media->width && $it->media->height) ? max(0.75, min(1.6, $it->media->width / $it->media->height)) : 1.333;
  $__ar = rtrim(rtrim(number_format($__ar, 3, '.', ''), '0'), '.').' / 1';
  $__lb = ! $__isVideo || $__file;
@endphp
          <a class="m-item reveal" href="{{ $__url }}" data-gcat="{{ $__album?->slug }}" data-gtype="{{ $__isVideo ? 'video' : 'photo' }}"@if($__lb) data-lb-group="gallery"@endif @if($__isVideo && $__file) data-lb-type="video" data-lb-poster="{{ $__thumb }}"@endif @if(! $__lb) target="_blank" rel="noopener"@endif data-lb-kicker="{{ $__kick }}" data-lb-title="{{ $__ttl }}" style="--ar:{{ $__ar }}" aria-label="{{ $__isVideo ? 'تشغيل الفيديو' : 'عرض الصورة' }}: {{ $__ttl }}">
            <img src="{{ $__thumb }}" alt="{{ $it->alt_text ?: $__ttl }}" loading="lazy">
            @if($__isVideo)<span class="badge badge-gold"><span class="material-symbols-outlined" aria-hidden="true">play_circle</span>فيديو</span>
            <span class="play-btn" aria-hidden="true"><span class="material-symbols-outlined fill">play_arrow</span></span>
            @else<span class="m-zoom" aria-hidden="true"><span class="material-symbols-outlined">zoom_in</span></span>@endif
            <span class="m-cap"><span class="m-kicker">{{ $__kick }}</span><span class="m-title">{{ $__ttl }}</span></span>
          </a>
@endforeach
        </div>
        <div class="empty-state mt-8" id="gl-empty" @if($items->count()) hidden @endif><span class="material-symbols-outlined" aria-hidden="true">image_not_supported</span><strong>لا توجد مواد في هذا التصنيف</strong></div>
      </div>
    </section>
<div class="pt-20 md:pt-28" aria-hidden="true"></div>
    <!-- ================= CONTACT CTA ================= -->
    <section class="pb-20 md:pb-28" aria-labelledby="cta-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="cta-card reveal">
          <div class="cta-body">
            <span class="cta-pill"><span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>قوافل يومية من الشمال إلى رفح</span>
            <p class="mt-6 text-[15px] font-bold text-gold-light">مرئيات من قطاع غزة</p>
            <h2 id="cta-title" class="cta-title">كل صورة هنا..<br><span class="text-gradient-gold">وراءها عمل ميداني</span></h2>
            <p class="cta-text">أرشيف حي يوثّق وصول السلال والخيام والدواء إلى مستحقيها. تعرّف على مشاريعنا أو تواصل معنا.</p>
            <div class="cta-actions">
              <a href="{{ route('projects.index') }}" class="btn btn-donate h-14 ps-2 pe-6 text-[16px]">
                <span class="grid h-10 w-10 place-items-center rounded-full bg-primary text-gold-light"><span class="material-symbols-outlined fill text-[20px]" aria-hidden="true">cases</span></span>
                استعرض المشاريع
                <span class="material-symbols-outlined btn-arrow text-[20px]" aria-hidden="true">arrow_back</span>
              </a>
              @php $__wa = \App\Support\SiteContent::info()['wa']; @endphp
              @if($__wa)<a href="https://wa.me/{{ $__wa }}" target="_blank" rel="noopener" class="btn btn-glass h-14 px-6 text-[16px]"><span class="material-symbols-outlined text-gold-light" aria-hidden="true">chat</span>تواصل عبر واتساب</a>@endif
            </div>
          </div>
          <div class="cta-media" aria-hidden="true"><img src="{{ asset('assets/site/img/gallery-children.jpg') }}" alt="" loading="lazy"></div>
        </div>
      </div>
    </section>
  </main>
@include('partials.site.lightbox')
@endsection
@push('scripts')
<script src="{{ asset('assets/site/js/pages.js') }}"></script>
<script src="{{ asset('assets/site/js/main.js') }}"></script>
@endpush
