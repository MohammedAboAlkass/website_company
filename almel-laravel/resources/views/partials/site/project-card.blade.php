@php
  $__slug = $p->program?->slug ?? 'other';
  $__img = \App\Support\SiteContent::img($p->cover, asset('assets/site/img/logo.png'));
  $__urgent = $p->status === 'urgent';
  $__tone = \App\Support\SiteContent::tone($p->badge_tone ?: ($__urgent ? 'urgent' : 'forest'));
  $__badge = $p->badge_text ?: ($__urgent ? \App\Support\SiteTexts::t('project.badge_default') : null);
  $__pct = $p->progress_percent !== null ? max(0, min(100, (int) $p->progress_percent)) : null;
@endphp
<article class="project-card reveal" data-cat="{{ $__slug }}"@if(! empty($delay)) style="--d:{{ $delay }}s"@endif>
  <div class="project-media">
    <img src="{{ $__img }}" alt="{{ $p->cover_alt ?: $p->title }}" loading="lazy">
    @if($__badge)<span class="badge {{ $__tone }} absolute top-3 right-3">@if($__urgent || $p->badge_tone === 'urgent')<span class="live-dot live-dot-white"></span>@elseif($p->badge_icon)<span class="material-symbols-outlined">{{ $p->badge_icon }}</span>@endif{{ $__badge }}</span>@endif
    @if($p->location_text)<span class="loc-chip"><span class="material-symbols-outlined">location_on</span>{{ $p->location_text }}</span>@endif
  </div>
  <div class="project-body">
    <h3 class="project-title"><a href="{{ route('projects.show', $p->slug) }}">{{ $p->title }}</a></h3>
    <p class="project-desc">{{ $p->summary }}</p>
    @if($p->facts->count())
    <dl class="project-facts">
      @foreach($p->facts->take(2) as $f)<div><dt>{{ $f->label }}:</dt><dd {!! $f->is_accent ? 'class="text-gold-deep"' : '' !!}>{{ $f->value }}</dd></div>@endforeach
    </dl>
    @endif
    @if($__pct !== null)
    <div class="progress" role="progressbar" aria-valuenow="{{ $__pct }}" aria-valuemin="0" aria-valuemax="100" aria-label="{{ \App\Support\SiteTexts::t('project.progress') }}: {{ $p->title }}">
      <div class="progress-track"><div class="bar-fill gold" style="--w:{{ $__pct }}%"></div></div>
      <span class="progress-val" dir="ltr">{{ $__pct }}%</span>
    </div>
    @endif
    <div class="project-actions">
      <a href="{{ route('projects.show', $p->slug) }}" class="btn btn-forest h-11 flex-1 text-[14px]" aria-label="{{ \App\Support\SiteTexts::t('project.card.details') }}: {{ $p->title }}">{{ \App\Support\SiteTexts::t('project.card.details') }}<span class="material-symbols-outlined btn-arrow text-[18px]" aria-hidden="true">arrow_back</span></a>
      <a href="{{ route('gallery') }}" class="icon-square" aria-label="{{ \App\Support\SiteTexts::t('project.card.gallery_aria') }}"><span class="material-symbols-outlined text-[20px]">photo_camera</span></a>
    </div>
  </div>
</article>
