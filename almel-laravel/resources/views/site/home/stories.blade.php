@php
  $__stories = $home['stories']->map(fn ($s) => [
      'name' => $s->person_name,
      'location' => (string) $s->person_role,
      'tag' => (string) $s->tag_label,
      'icon' => $s->tag_icon ?: 'favorite',
      'image' => \App\Support\SiteContent::img($s->image, asset('assets/site/img/logo.png')),
      'alt' => (string) $s->image_alt,
      'quote' => \App\Support\SiteContent::plain($s->quote),
  ])->values();
  $__govJs = $home['govJs'];
@endphp
<script>window.SITE_DB = {!! json_encode(['stories' => $__stories, 'governorates' => (object) $__govJs, 'defaultGovernorate' => $home['govDefault']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
@if($__stories->count() && ! ($__secHidden ?? false))
    <!-- ================= STORIES FROM THE FIELD (from the database; the carousel is drawn by js/main.js from window.SITE_DB) ================= -->
    <section id="stories" class="stories-sec" aria-labelledby="stories-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="stories-head">
          <div class="reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">format_quote</span>{{ \App\Support\HomeSections::t('stories', 'eyebrow') }}</p>
            <h2 id="stories-title" class="section-title">{{ \App\Support\HomeSections::t('stories', 'title') }}</h2>
            <p class="section-lead">{{ \App\Support\HomeSections::t('stories', 'lead') }}</p>
          </div>
          <div class="stories-nav reveal">
            <button class="snav-btn" type="button" data-dir="prev" aria-label="القصة السابقة" aria-controls="stories-track"><span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>
            <button class="snav-btn" type="button" data-dir="next" aria-label="القصة التالية" aria-controls="stories-track"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></button>
          </div>
        </div>

        <div class="stories-carousel reveal" role="region" aria-roledescription="carousel" aria-label="قصص من الميدان" tabindex="0">
          <div id="stories-track" class="stories-track" aria-live="polite"></div>
          <div class="stories-foot">
            <div class="stories-dots" role="group" aria-label="اختيار القصة"></div>
            <div class="stories-meta">
              <span class="stories-count" dir="ltr" aria-hidden="true"><b data-story-i>01</b> / <span data-story-n>{{ str_pad((string) $__stories->count(), 2, '0', STR_PAD_LEFT) }}</span></span>
              <button class="stories-play" type="button" aria-pressed="false" aria-label="{{ \App\Support\SiteTexts::t('js.play.pause') }}"><span class="material-symbols-outlined" aria-hidden="true">pause</span></button>
            </div>
          </div>
        </div>
      </div>
    </section>
@endif
