@php $__g = $home['gallery']; $__sizes = ['g-xl', 'g-tall', '', '', 'g-wide', '', '']; @endphp
@if($__g->count())
    <!-- ================= GALLERY (from the database) ================= -->
    <section id="gallery" class="gallery relative isolate overflow-hidden py-20 md:py-28">
      <div class="gallery-glow" aria-hidden="true"></div>
      <div class="relative mx-auto max-w-page px-5 md:px-8">
        <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div class="reveal max-w-2xl">
            <p class="eyebrow"><span class="material-symbols-outlined">perm_media</span>{{ \App\Support\HomeSections::t('gallery', 'eyebrow') }}</p>
            <h2 class="section-title">{{ \App\Support\HomeSections::t('gallery', 'title') }}</h2>
            <p class="section-lead">{{ \App\Support\HomeSections::t('gallery', 'lead') }}</p>
          </div>
          <div class="reveal inline-flex shrink-0 items-center gap-4 rounded-2xl border border-line bg-white px-5 py-3 text-[13px] font-bold text-primary shadow-card">
            <span class="inline-flex items-center gap-1.5"><span class="material-symbols-outlined text-[20px] text-gold-deep">photo_library</span>{{ number_format($home['galleryPhotos']) }} صورة</span>
            @if($home['galleryVideos'])<span class="h-5 w-px bg-line" aria-hidden="true"></span>
            <span class="inline-flex items-center gap-1.5"><span class="material-symbols-outlined text-[20px] text-gold-deep">play_circle</span>{{ number_format($home['galleryVideos']) }} فيديو</span>@endif
          </div>
        </div>

        @if($home['galleryVideos'])
        <div class="reveal mt-9 flex flex-wrap items-center gap-3">
          <span class="text-[13px] font-bold text-on-variant">النوع:</span>
          <div id="gallery-filters" class="chip-bar" role="group" aria-label="نوع الوسائط">
            <button type="button" class="chip is-on" data-gfilter="all" aria-pressed="true"><span class="material-symbols-outlined">auto_awesome</span>الكل<span class="chip-count">{{ $__g->count() }}</span></button>
            <button type="button" class="chip" data-gfilter="photo" aria-pressed="false"><span class="material-symbols-outlined">photo_library</span>صور<span class="chip-count">{{ $__g->where('type', '!=', 'video')->count() }}</span></button>
            <button type="button" class="chip" data-gfilter="video" aria-pressed="false"><span class="material-symbols-outlined">play_circle</span>فيديو<span class="chip-count">{{ $__g->where('type', 'video')->count() }}</span></button>
          </div>
        </div>
        @endif

        <div class="gallery-grid mt-8" id="gallery-grid" data-more="4">
          @foreach($__g as $it)
          @php
            $__isV = $it->type === 'video';
            $__sz = $__sizes[$loop->index % count($__sizes)];
            $__ttl = $it->title ?: ($it->caption ?: '');
            $__kick = trim(implode(' • ', array_filter([$it->governorate?->name, $it->taken_at ? \App\Support\SiteContent::date($it->taken_at) : null])));
            $__vurl = $__isV ? \App\Support\SiteContent::safeUrl($it->video_url, '') : '';
            $__vfile = $__isV && preg_match('#\.(mp4|webm|ogg)(\?.*)?$#i', (string) $__vurl);
            $__lb = ! $__isV || $__vfile;      // photos and direct video files open in the lightbox; other videos keep linking to the gallery page
            $__href = $__lb ? ($__isV ? $__vurl : \App\Support\SiteContent::img($it->media, asset('assets/site/img/hero-poster.jpg'))) : route('gallery');
          @endphp
          <article class="media-card {{ $__sz }} reveal" data-gtype="{{ $__isV ? 'video' : 'photo' }}"@if($loop->index % 4) style="--d:{{ ($loop->index % 4) * 0.06 }}s"@endif>
            <a href="{{ $__href }}" class="absolute inset-0 z-10" aria-label="{{ $__ttl }}"@if($__lb) data-lb-group="home-gallery"@if($__isV) data-lb-type="video" data-lb-poster="{{ \App\Support\SiteContent::img($it->media, asset('assets/site/img/hero-poster.jpg')) }}"@endif data-lb-kicker="{{ $__kick }}" data-lb-title="{{ $__ttl }}"@endif></a>
            <img src="{{ \App\Support\SiteContent::img($it->media, asset('assets/site/img/hero-poster.jpg')) }}" alt="{{ $it->alt_text ?: $__ttl }}" loading="lazy">
            @if($__isV)<span class="badge badge-gold absolute top-4 right-4"><span class="material-symbols-outlined">play_circle</span>فيديو</span>
            <span class="play-btn" aria-hidden="true"><span class="material-symbols-outlined fill">play_arrow</span></span>@endif
            <div class="media-copy">
              @if($__kick !== '')<p class="media-kicker">{{ $__kick }}</p>@endif
              <h3 class="media-title text-[{{ in_array($__sz, ['g-xl', 'g-wide']) ? '20' : '15' }}px]">{{ $__ttl }}</h3>
            </div>
          </article>
          @endforeach
        </div>

        <div class="mt-12 flex justify-center">
          <a href="{{ route('gallery') }}" class="btn btn-gold h-14 ps-2 pe-6 text-[16px]" data-more-btn="#gallery-grid">
            <span class="grid h-10 w-10 place-items-center rounded-full bg-primary text-gold-light">
              <span class="material-symbols-outlined fill text-[22px]">play_arrow</span>
            </span>
            <span data-more-label>{{ \App\Support\HomeSections::t('gallery', 'button') }}</span>
            <span class="material-symbols-outlined btn-arrow text-[20px]">arrow_back</span>
          </a>
        </div>
      </div>
    </section>
@include('partials.site.lightbox')
@endif
