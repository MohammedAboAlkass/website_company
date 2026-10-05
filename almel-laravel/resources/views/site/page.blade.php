@extends('layouts.site')
@section('title', ($page->seo_title ?: $page->title).' — جمعية الشمال للتنمية والتطوير المجتمعي')
@section('description', $page->meta_description ?: $page->title)
@section('active', $active ?? '')
@section('content')
<main id="main" class="mx-auto max-w-page px-5 py-16 md:px-8">
  <article class="cms-page" style="max-width:860px;margin-inline:auto">
    <h1 class="cms-title" style="font-size:2rem;font-weight:800;color:{{ \App\Support\SiteTheme::lit('#0C7845') }};margin-bottom:1.5rem;line-height:1.4">{{ $page->title }}</h1>
    <div class="cms-body" style="line-height:2;color:#2B2B2B;font-size:1.05rem">{!! $html !!}</div>
  </article>
</main>
<style>
  .cms-body h2{font-size:1.5rem;font-weight:700;margin:1.8rem 0 .8rem;color:{{ \App\Support\SiteTheme::lit('#0C7845') }}}
  .cms-body h3{font-size:1.25rem;font-weight:700;margin:1.4rem 0 .6rem}
  .cms-body p{margin:0 0 1rem}
  .cms-body ul,.cms-body ol{margin:0 0 1rem;padding-inline-start:1.5rem}
  .cms-body ul{list-style:disc}.cms-body ol{list-style:decimal}
  .cms-body a{color:{{ \App\Support\SiteTheme::lit('#0C7845') }};text-decoration:underline}
  .cms-body img,.cms-body video{max-width:100%;height:auto;border-radius:12px}
  .cms-body table{border-collapse:collapse;width:100%;margin:1rem 0}
  .cms-body td,.cms-body th{border:1px solid #e3e3e3;padding:.5rem .75rem}
  .cms-body blockquote{border-inline-start:4px solid #FF7000;padding:.25rem 1rem;margin:1rem 0;color:#555}
</style>
@endsection
