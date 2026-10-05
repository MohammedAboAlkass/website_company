    <!-- ================= ZAKAT CALCULATOR ================= -->

    <!-- ================= ABOUT ================= -->
@php($__visionCards = \App\Support\VisionSupport::visible())
    <section id="about" class="about-story relative" aria-labelledby="about-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="ab-intro">
          <div class="ab-intro-head reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">account_balance</span>{{ \App\Support\HomeSections::t('about', 'eyebrow') }}</p>
            <h2 id="about-title" class="section-title">{{ \App\Support\HomeSections::t('about', 'title') }}</h2>
            <span class="coverage-pill"><span class="ab-pulse" aria-hidden="true"></span><span class="material-symbols-outlined">location_on</span>{{ \App\Support\SiteTexts::t('about.coverage') }}</span>
@if (count($__visionCards))
            <p class="mt-5"><a class="link-arrow text-[15px]" href="#ab-step-1">{{ \App\Support\HomeSections::t('about', 'button') }}<span class="material-symbols-outlined">arrow_back</span></a></p>
@endif
          </div>
          <p class="ab-statement reveal" data-wordfill>{{ \App\Support\HomeSections::t('about', 'lead') }}</p>
        </div>

        @include('site.vision.story', ['cards' => $__visionCards])
      </div>
    </section>
