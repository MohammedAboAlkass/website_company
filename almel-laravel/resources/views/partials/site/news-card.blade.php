@php
  $__cs = $a->category?->slug ?? 'other';
  $__cl = $labels[$__cs] ?? ($a->category?->name ?? 'أخرى');
  $__img = \App\Support\SiteContent::img($a->cover, asset('assets/site/img/logo.png'));
@endphp
<article class="n-card{{ ! empty($reveal) ? ' reveal' : '' }}" data-cat="{{ $__cs }}" data-search="{{ $a->title }} {{ $a->excerpt }} {{ $__cl }}">
  <div class="n-card-media"><img src="{{ $__img }}" alt="{{ $a->cover_alt }}" loading="lazy"></div>
  <div class="n-card-body">
    <div class="n-card-meta"><span class="badge-soft">{{ $__cl }}</span><time datetime="{{ optional($a->published_at)->toDateString() }}"><span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>{{ \App\Support\SiteContent::date($a->published_at) }}</time></div>
    <h3 class="n-card-title"><a href="{{ route('news.show', $a->slug) }}">{{ $a->title }}</a></h3>
    <p class="n-card-excerpt">{{ $a->excerpt }}</p>
    <div class="n-card-foot"><span><span class="link-arrow">اقرأ الخبر<span class="material-symbols-outlined">arrow_back</span></span></span></div>
  </div>
</article>
