@extends('layouts.site')
@section('title', 'جمعية الشمال للتنمية والتطوير المجتمعي')
@section('description', 'مؤسسة إنسانية تعمل على إغاثة أهل غزة: برامج إغاثية وإنشائية وتنموية وصحية وفق معايير الحوكمة والشفافية.')
@section('home', '1')
@section('skip', '#hero')
@push('css')
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('hero') }}">
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('ed-content') }}">
@endpush
@section('content')
<main>
@foreach (\App\Support\HomeSections::order() as $__sid)
@if (\App\Support\HomeSections::visible($__sid) || $__sid === 'stories')
    @include('site.home.'.$__sid, ['__secHidden' => ! \App\Support\HomeSections::visible($__sid)])

@endif
@endforeach
  </main>
@endsection
@push('scripts')
<script src="{{ asset('assets/site/js/hero-slider.js') }}"></script>
<script src="{{ asset('assets/site/js/site-live.js') }}"></script>
<script src="{{ asset('assets/site/js/main.js') }}"></script>
@endpush
