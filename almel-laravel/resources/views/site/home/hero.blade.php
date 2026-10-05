    <!-- ================= HERO ================= -->
    <x-site.hero :hero="$hero">
        <div class="hero-bottom hero-in d6">
          <div class="hero-stats">
            @foreach (\App\Support\SiteContent::heroStats() as $__hs)
            <div class="hero-stat">
              <span class="hero-stat-ico material-symbols-outlined">{{ $__hs['icon'] }}</span>
              <div>
                <p class="hero-stat-num" dir="ltr"@foreach ($__hs['attrs'] as $__k => $__v) {{ $__k }}="{{ $__v }}"@endforeach>{{ $__hs['value'] }}</p>
                <p class="hero-stat-label">{{ $__hs['label'] }}</p>
              </div>
            </div>
            @endforeach
          </div>
          <div class="hero-foot flex flex-wrap items-center justify-between gap-3">
            <a href="#about" class="scroll-hint inline-flex items-center gap-2 text-[13px] font-medium text-white/75 hover:text-white">
              <span class="scroll-mouse" aria-hidden="true"><span></span></span>
              استكشف العمل في غزة
            </a>
            <button id="sound-btn" class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[12.5px] font-medium backdrop-blur-md transition hover:bg-white/20" type="button" aria-pressed="false">
              <span class="material-symbols-outlined text-[18px] text-gold-light">volume_off</span>
              <span>صوت من شوارع غزة</span>
              <span id="eq" class="eq is-off" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
            </button>
          </div>
        </div>
    </x-site.hero>
