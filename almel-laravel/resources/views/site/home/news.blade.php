@php $__n = $home['news']; $__f = $__n->first(); $__rest = $__n->slice(1, 2); $__lbl = $home['newsLabels']; @endphp
@if($__f)
    <!-- ================= NEWS (from the database) ================= -->
    <section id="news" class="bg-sand py-20 md:py-28">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div class="reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">newspaper</span>{{ \App\Support\HomeSections::t('news', 'eyebrow') }}</p>
            <h2 class="section-title">{{ \App\Support\HomeSections::t('news', 'title') }}</h2>
          </div>
          <a href="{{ route('news.index') }}" class="btn btn-outline reveal h-12 shrink-0 px-5 text-[14px]">{{ \App\Support\HomeSections::t('news', 'button') }}<span class="material-symbols-outlined btn-arrow text-[18px]">west</span></a>
        </div>
        <div class="mt-12 grid gap-6 lg:grid-cols-12">
          <article class="news-feature reveal lg:col-span-7">
            <div class="news-feature-media">
              <img src="{{ \App\Support\SiteContent::img($__f->cover, asset('assets/site/img/logo.png')) }}" alt="{{ $__f->cover_alt }}" loading="lazy">
              @if($__f->badge_text)<span class="badge badge-gold absolute top-4 right-4">{{ $__f->badge_text }}</span>@endif
            </div>
            <div class="p-6 md:p-8">
              <p class="activity-meta"><span class="material-symbols-outlined">event</span>{{ \App\Support\SiteContent::date($__f->published_at) }}@if($__f->read_minutes) • قراءة {{ $__f->read_minutes }} دقائق@endif @if($__f->desk || $__f->byline) • <span class="font-bold text-primary">{{ $__f->desk ?: $__f->byline }}</span>@endif</p>
              <h3 class="mt-3 text-[22px] font-bold leading-[1.6] text-primary md:text-[26px]">{{ $__f->title }}</h3>
              <p class="mt-3 text-[15.5px] leading-[1.9] text-on-variant">{{ $__f->excerpt }}</p>
              <div class="mt-6 flex items-center justify-between border-t border-line pt-5">
                <a class="link-arrow text-[15px]" href="{{ route('news.show', $__f->slug) }}">قراءة الخبر كاملاً<span class="material-symbols-outlined">arrow_back</span></a>
                @if($__f->reference_code)<span class="rounded-full bg-sand px-3 py-1 text-[12px] font-medium text-muted" dir="ltr">{{ $__f->reference_code }}</span>@endif
              </div>
            </div>
          </article>
          <div class="flex flex-col gap-5 lg:col-span-5">
            @foreach($__rest as $r)
            @php $__cs = $r->category?->slug ?? ''; $__cl = $__lbl[$__cs] ?? $r->category?->name; @endphp
            <article class="news-item reveal"@if(! $loop->first) style="--d:.08s"@endif>
              <div class="flex items-center justify-between text-[12.5px]"><span class="badge-soft">{{ $__cl }}</span><span class="text-muted">{{ \App\Support\SiteContent::date($r->published_at) }}</span></div>
              <h3 class="mt-3 text-[18px] font-bold leading-[1.6] text-primary">{{ $r->title }}</h3>
              <p class="mt-2 text-[14px] leading-[1.85] text-on-variant">{{ $r->excerpt }}</p>
              <div class="mt-4 flex items-center justify-between border-t border-line pt-3 text-[13px]"><span class="inline-flex items-center gap-1 font-semibold text-primary"><span class="material-symbols-outlined text-[16px] text-gold-deep">hub</span>{{ $r->desk ?: $r->byline ?: $__cl }}</span><a class="link-arrow" href="{{ route('news.show', $r->slug) }}">التفاصيل<span class="material-symbols-outlined">arrow_back</span></a></div>
            </article>
            @endforeach
            @if(\App\Support\SiteTexts::on('news.archive.show'))<div class="archive-cta reveal" style="--d:.16s">
              <span class="archive-ico material-symbols-outlined">folder_open</span>
              <div class="min-w-0 flex-1">
                <p class="text-[12.5px] font-bold text-gold-light">{{ \App\Support\SiteTexts::t('news.archive.kicker') }}</p>
                <h3 class="mt-1 text-[17px] font-bold text-white">{{ \App\Support\SiteTexts::t('news.archive.title') }}</h3>
                <p class="mt-0.5 text-[13px] text-primary-soft">{{ \App\Support\SiteTexts::t('news.archive.text') }}</p>
              </div>
              <a class="btn btn-gold h-10 shrink-0 px-4 text-[13px]" style="z-index:1" href="{{ \App\Support\SiteTexts::link('news.archive.link', route('news.index')) }}">{{ \App\Support\SiteTexts::t('news.archive.btn') }}</a>
            </div>@endif

          </div>
        </div>
      </div>
    </section>
@endif
