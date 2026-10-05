@extends('layouts.site')
@php
  $__title = $a->seo_title ?: $a->title;
  $__desc = $a->seo_description ?: ($a->excerpt ?: \Illuminate\Support\Str::limit(\App\Support\ContentSupport::plainText($body), 160));
  $__img = \App\Support\SiteContent::img($a->cover, asset('assets/site/img/news-conference.jpg'));
  $__imgAbs = \Illuminate\Support\Str::startsWith($__img, 'http') ? $__img : url($__img);
@endphp
@section('title', $__title.' — جمعية الشمال للتنمية والتطوير المجتمعي')
@section('description', $__desc)
@section('page', 'article')
@section('active', 'news')
@push('css')
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('pages') }}">
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('ed-content') }}">
<link rel="canonical" href="{{ route('news.show', $a->slug) }}">
<meta property="og:type" content="article">
<meta property="og:title" content="{{ $__title }}">
<meta property="og:description" content="{{ $__desc }}">
<meta property="og:url" content="{{ route('news.show', $a->slug) }}">
<meta property="og:image" content="{{ $__imgAbs }}">
<meta name="twitter:card" content="summary_large_image">
@if($a->published_at)<meta property="article:published_time" content="{{ $a->published_at->toIso8601String() }}">@endif
@endpush
@section('content')
<main id="main">
    <!-- ================= PAGE HERO ================= -->
    <section class="page-hero article-hero" aria-labelledby="page-title">
      <div class="page-hero-media" aria-hidden="true"><img src="{{ $__img }}" alt="" data-hero-img></div>
      <div class="page-hero-shade" aria-hidden="true"></div>
      <div class="page-hero-pattern" aria-hidden="true"></div>
      <div class="hero-grain" aria-hidden="true"></div>
      <div class="page-hero-inner mx-auto max-w-page px-5 md:px-8">
        <nav class="crumbs hero-in d1" aria-label="مسار التنقل">
          <ol><li><a href="{{ route('home') }}"><span class="material-symbols-outlined" aria-hidden="true">home</span>الرئيسية</a></li><li><a href="{{ route('news.index') }}">الأخبار</a></li><li><span aria-current="page" data-crumb-current>{{ $a->title }}</span></li></ol>
        </nav>
        @if($catLabel)<p class="page-hero-kicker hero-in d2" data-hero-kicker>{{ $catLabel }}</p>@endif
        <h1 id="page-title" class="page-hero-title hero-in d3" data-hero-title>{{ $a->title }}</h1>
        <p class="article-meta hero-in d4" id="ar-meta">
          @if($a->published_at)<span><span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>{{ \App\Support\SiteContent::date($a->published_at) }}</span>@endif
          @if($a->read_minutes)<span><span class="material-symbols-outlined" aria-hidden="true">schedule</span>قراءة {{ $a->read_minutes }} دقائق</span>@endif
          @if($a->desk)<span><span class="material-symbols-outlined" aria-hidden="true">apartment</span>{{ $a->desk }}</span>@endif
        </p>
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>

    <!-- ================= ARTICLE ================= -->
    <article class="pb-20 md:pb-28" aria-labelledby="page-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        @if($a->cover)<figure class="article-cover" id="ar-cover"><img src="{{ $__img }}" alt="{{ $a->cover_alt }}"></figure>@endif
        <div class="article-grid">
          <div class="min-w-0">
            <div class="prose ed-content" id="ar-body">
              @if($a->excerpt)<p class="prose-lead">{{ $a->excerpt }}</p>@endif
              @if(! empty($a->highlights))
              <h2>أبرز ما في الخبر</h2>
              <ul>@foreach($a->highlights as $h)<li>{{ $h }}</li>@endforeach</ul>
              @endif
              {!! $body !!}
            </div>
            @if($a->tags->count())
            <p class="mt-6 flex flex-wrap gap-2">@foreach($a->tags as $t)<span class="badge-soft">#{{ $t->name }}</span>@endforeach</p>
            @endif
            <div class="share-inline">
              <span class="share-label">شارك الخبر</span>
              <div class="share" data-share>@include('partials.site.share', ['title' => $a->title])</div>
            </div>
          </div>
          <aside class="article-aside" aria-label="معلومات الخبر">
            <div class="aside-card">
              <h2 class="aside-h">عن الخبر</h2>
              <dl class="aside-dl" id="ar-facts">
                @if($catLabel)<div><dt>التصنيف</dt><dd>{{ $catLabel }}</dd></div>@endif
                @if($a->published_at)<div><dt>التاريخ</dt><dd>{{ \App\Support\SiteContent::date($a->published_at) }}</dd></div>@endif
                @if($a->reference_code)<div><dt>المرجع</dt><dd dir="ltr">{{ $a->reference_code }}</dd></div>@endif
                @if($a->desk || $a->byline)<div><dt>الجهة</dt><dd>{{ $a->desk ?: $a->byline }}</dd></div>@endif
                @if($a->read_minutes)<div><dt>مدة القراءة</dt><dd>{{ $a->read_minutes }} دقائق</dd></div>@endif
              </dl>
            </div>
            <div class="aside-card">
              <h2 class="aside-h">شارك</h2>
              <div class="share" data-share>@include('partials.site.share', ['title' => $a->title])</div>
            </div>
            <div class="aside-card aside-donate">
              <h2 class="aside-h">تعرّف على مشاريعنا</h2>
              <p>تابع مبادرات الجمعية الميدانية وآخر تحديثاتها وأثرها على العائلات في القطاع.</p>
              <a href="{{ route('projects.index') }}" class="btn btn-gold mt-4 h-12 w-full text-[14.5px]"><span class="material-symbols-outlined fill text-[20px]" aria-hidden="true">cases</span>استعرض المشاريع</a>
            </div>
          </aside>
        </div>
      </div>
    </article>

    <!-- ================= RELATED ================= -->
    @if($related->count())
    <section class="sec sec-sand" aria-labelledby="related-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="sec-head">
          <div>
            <p class="eyebrow"><span class="material-symbols-outlined">newspaper</span>أخبار ذات صلة</p>
            <h2 id="related-title" class="section-title">اقرأ أيضاً</h2>
          </div>
          <a href="{{ route('news.index') }}" class="btn btn-outline h-12 shrink-0 px-5 text-[14px]">كل الأخبار<span class="material-symbols-outlined btn-arrow text-[18px]" aria-hidden="true">west</span></a>
        </div>
        <div class="nw-grid" id="ar-related">
          @foreach($related as $r)
            @include('partials.site.news-card', ['a' => $r, 'labels' => $labels, 'reveal' => true])
          @endforeach
        </div>
      </div>
    </section>
    @endif
  </main>
@endsection
@push('scripts')
<script src="{{ asset('assets/site/js/pages.js') }}"></script>
<script src="{{ asset('assets/site/js/main.js') }}"></script>
@endpush
