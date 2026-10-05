@if($home['activities']->count())
    <!-- ================= ACTIVITIES (from the database) ================= -->
    <section id="activities" class="py-20 md:py-28">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div class="reveal max-w-2xl">
            <p class="eyebrow"><span class="material-symbols-outlined">verified</span>{{ \App\Support\HomeSections::t('activities', 'eyebrow') }}</p>
            <h2 class="section-title">{{ \App\Support\HomeSections::t('activities', 'title') }}</h2>
            <p class="section-lead">{{ \App\Support\HomeSections::t('activities', 'lead') }}</p>
          </div>
          <a href="#gallery" class="btn btn-outline reveal h-12 shrink-0 px-5 text-[14px]">{{ \App\Support\HomeSections::t('activities', 'button') }} <span class="material-symbols-outlined btn-arrow text-[18px]">west</span></a>
        </div>
        <div class="mt-12 grid gap-6 md:grid-cols-3" id="activities-grid" data-more="3">
          @foreach($home['activities'] as $ac)
          @php
            $__tone = \App\Support\SiteContent::tone($ac->badge_tone ?: 'forest');
            $__meta = trim(implode(' • ', array_filter([$ac->date_label ?: ($ac->activity_date ? \App\Support\SiteContent::date($ac->activity_date) : null)])));
          @endphp
          <article class="activity-card reveal"@if($loop->index % 3) style="--d:{{ ($loop->index % 3) * 0.1 }}s"@endif>
            <div class="activity-media">
              <img src="{{ \App\Support\SiteContent::img($ac->image, asset('assets/site/img/logo.png')) }}" alt="{{ $ac->image_alt ?: $ac->title }}" loading="lazy">
              @if($ac->badge_text)<span class="badge {{ $__tone }} absolute top-3 right-3">{{ $ac->badge_text }}</span>@endif
            </div>
            <div class="activity-body">
              <p class="activity-meta"><span class="material-symbols-outlined">calendar_month</span>{{ $__meta }}@if($__meta !== '' && $ac->place) • @endif @if($ac->place)<span class="font-bold text-gold-deep">{{ $ac->place }}</span>@endif</p>
              <h3 class="activity-title">{{ $ac->title }}</h3>
              <p class="activity-desc">{{ \App\Support\SiteContent::plain($ac->description) }}</p>
              <div class="activity-foot">
                @if($ac->stat_label)<span class="inline-flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px] text-gold-deep">{{ $ac->stat_icon ?: 'group' }}</span>{{ $ac->stat_label }}</span>@else<span></span>@endif
                <a class="link-arrow" href="{{ route('activities.show', $ac->id) }}" aria-label="{{ \App\Support\SiteTexts::t('activity.card.more') }}: {{ $ac->title }}">{{ \App\Support\SiteTexts::t('activity.card.more') }}<span class="material-symbols-outlined">arrow_back</span></a>
              </div>
            </div>
          </article>
          @endforeach
        </div>
      </div>
    </section>
@endif
