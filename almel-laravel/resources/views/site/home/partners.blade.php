@php $__pt = $home['partners']; $__logos = $__pt->filter(fn ($x) => $x->logo); @endphp
@if($__pt->count())
    <!-- ================= PARTNERS (from the database) ================= -->
    <section id="partners" class="partners-lux relative isolate overflow-hidden text-white" aria-labelledby="partners-title">
      <div class="lux-pattern" aria-hidden="true"></div>
      <div class="lux-glow" aria-hidden="true"></div>
      <span class="lux-hairline lux-hairline-top" aria-hidden="true"></span>

      <div class="relative mx-auto max-w-page px-5 pt-12 md:px-8 md:pt-16">
        <div class="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div class="reveal lg:col-span-12 text-center">
            <p class="lux-eyebrow"><span class="lux-rule" aria-hidden="true"></span><span class="material-symbols-outlined">handshake</span>{{ \App\Support\HomeSections::t('partners', 'eyebrow') }}<span class="lux-rule" aria-hidden="true"></span></p>
            <h2 id="partners-title" class="lux-title">{!! \App\Support\HomeSections::goldTitle('partners') !!}</h2>
            <div class="lux-statement">
              <span class="lux-quote" aria-hidden="true">”</span>
              <p>{{ \App\Support\HomeSections::t('partners', 'lead') }}</p>
            </div>
          </div>
        </div>
      </div>

      @if($__logos->count())
      <div class="lux-marquee reveal" aria-hidden="true">
        <div class="lux-marquee-track">
          <div class="lux-marquee-set">
            @foreach($__logos as $pt)<img src="{{ \App\Support\SiteContent::img($pt->logo) }}" alt=""><i></i>@endforeach
          </div>
          <div class="lux-marquee-set lux-marquee-dup">
            @foreach($__logos as $pt)<img src="{{ \App\Support\SiteContent::img($pt->logo) }}" alt=""><i></i>@endforeach
          </div>
        </div>
      </div>
      @endif

      <div class="relative mx-auto max-w-page px-5 pb-12 md:px-8 md:pb-16">
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" id="partners-grid">
          @foreach($__pt->take(3) as $pt)
          @php $__url = $pt->website_url ? \App\Support\SiteContent::safeUrl($pt->website_url, '') : ''; @endphp
          <article class="lux-card reveal"@if($loop->index % 3) style="--d:{{ ($loop->index % 3) * 0.06 }}s"@endif>
            <div class="lux-card-top"><div class="lux-logo">@if($pt->logo)<img src="{{ \App\Support\SiteContent::img($pt->logo) }}" alt="{{ $pt->name }}" loading="lazy">@endif</div>@if($pt->tag_label)<p class="lux-tag"><span class="material-symbols-outlined">{{ $pt->tag_icon ?: 'handshake' }}</span>{{ $pt->tag_label }}</p>@endif</div>
            <h3 class="lux-name">@if($__url)<a href="{{ $__url }}" target="_blank" rel="noopener noreferrer">{{ $pt->name }}</a>@else{{ $pt->name }}@endif</h3>
            <p class="lux-desc">{{ $pt->description }}</p>
          </article>
          @endforeach
        </div>
        <div class="more-wrap"><a class="btn btn-outline more-btn h-12 px-6 text-[15px]" href="{{ route('partners') }}"><span data-more-label>{{ \App\Support\SiteTexts::t('partners.home.button') }}</span><span class="material-symbols-outlined more-ico" aria-hidden="true">arrow_back</span></a></div>
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>
@endif
