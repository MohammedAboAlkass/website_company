@php $__ap = $home['appeal']; @endphp
@if($__ap)
    <!-- ================= RELIEF APPEAL (from the database: control panel > نداء الإغاثة) ================= -->
    <section id="appeal" class="relative z-10 bg-canvas py-16 md:py-20" aria-labelledby="appeal-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="appeal-card reveal">
          <div class="appeal-media">
            <img src="{{ \App\Support\SiteContent::img($__ap->image, asset('assets/site/img/gallery-convoy.jpg')) }}" alt="" loading="lazy">
            <div class="appeal-media-shade"></div>
            @if($__ap->flag_label)<span class="appeal-flag"><span class="live-dot live-dot-white"></span>{{ $__ap->flag_label }}</span>@endif
          </div>
          <div class="appeal-body">
            @if($__ap->chip_label)
            <div class="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/[.07] px-4 py-1.5">
              <span class="material-symbols-outlined text-[18px] text-gold-light">local_shipping</span>
              <span class="text-[12.5px] font-medium text-white/85">{{ $__ap->chip_label }}</span>
            </div>
            @endif
            @if($__ap->kicker)<p class="mt-6 text-[15px] font-bold text-gold-light">{{ $__ap->kicker }}</p>@endif
            <h2 id="appeal-title" class="mt-3 text-[28px] font-bold leading-[1.45] text-white md:text-[40px]">
              {{ $__ap->title_line1 }}@if($__ap->title_line2)<br>
              <span class="text-gradient-gold">{{ $__ap->title_line2 }}</span>@endif
            </h2>
            @if($__ap->description)<p class="mt-5 max-w-xl text-[16px] leading-[1.95] text-white/75">{{ \App\Support\SiteContent::plain($__ap->description) }}</p>@endif
            <div class="mt-8 flex flex-wrap items-center gap-3">
              @if($__ap->primary_cta_text)
              <a href="{{ \App\Support\SiteContent::safeUrl($__ap->primary_cta_url, '#contact') }}" class="btn btn-urgent h-14 ps-2 pe-6 text-[16px]">
                <span class="grid h-10 w-10 place-items-center rounded-full bg-white text-urgent">
                  <span class="material-symbols-outlined fill text-[20px]">volunteer_activism</span>
                </span>
                {{ $__ap->primary_cta_text }}
                <span class="material-symbols-outlined btn-arrow text-[20px]">arrow_back</span>
              </a>
              @endif
              @if($__ap->secondary_cta_text)
              <a href="{{ \App\Support\SiteContent::safeUrl($__ap->secondary_cta_url, '#projects') }}" class="btn btn-glass h-14 px-6 text-[16px]">
                <span class="material-symbols-outlined text-gold-light">cases</span>
                {{ $__ap->secondary_cta_text }}
              </a>
              @endif
            </div>
          </div>
        </div>
      </div>
    </section>
@endif
