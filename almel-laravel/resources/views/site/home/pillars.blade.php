    <!-- ================= PILLARS ================= -->
    <section id="pillars" class="pillars relative isolate overflow-hidden py-20 text-white md:py-28">
      <img class="pillars-bg" src="{{ asset('assets/site/img/project-parallax.jpg') }}" alt="" aria-hidden="true" loading="lazy">
      <div class="pillars-shade" aria-hidden="true"></div>
      <div class="relative mx-auto max-w-page px-5 md:px-8">
        <div class="reveal mx-auto max-w-2xl text-center">
          <h2 class="section-title text-white">{{ \App\Support\HomeSections::t('pillars', 'title') }}</h2>
          <p class="section-lead text-white/70">{{ \App\Support\HomeSections::t('pillars', 'lead') }}</p>
        </div>
        <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
@foreach (\App\Support\SiteTexts::items('pillars.cards') as $__pi => $__pc)
          <article class="pillar-card reveal"{!! $__pi ? ' style="--d:'.ltrim(number_format($__pi * 0.08, 2), '0').'s"' : '' !!}>
            <div class="pillar-head">
              <span class="pillar-icon material-symbols-outlined">{{ $__pc['icon'] }}</span>
              <span class="pillar-num" dir="ltr" aria-hidden="true">{{ sprintf('%02d', $__pi + 1) }}</span>
            </div>
            <h3 class="pillar-title">{{ $__pc['title'] }}</h3>
            <p class="pillar-desc">{{ $__pc['desc'] }}</p>
          </article>
@endforeach
        </div>
      </div>
    </section>
