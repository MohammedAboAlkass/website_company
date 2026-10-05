    <!-- ================= IMPACT MAP ================= -->
    <!-- governorate numbers come from the database (admin: خريطة الأثر) via window.SITE_DB.governorates (see site.home.stories) -->
    <section id="impact-map" class="impact-sec relative isolate overflow-hidden text-white" aria-labelledby="impact-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="impact-grid">
          <div class="impact-copy">
            <div class="reveal">
              <p class="eyebrow eyebrow-dark"><span class="material-symbols-outlined">map</span>{{ \App\Support\HomeSections::t('impact-map', 'eyebrow') }}</p>
              <h2 id="impact-title" class="section-title impact-title">{{ \App\Support\HomeSections::t('impact-map', 'title') }}</h2>
              <p class="section-lead impact-lead">{{ \App\Support\HomeSections::t('impact-map', 'lead') }}</p>
            </div>
            @if($home['govs']->count())
            <ul class="gov-list reveal" aria-label="محافظات قطاع غزة">
              @foreach($home['govs'] as $g)
              <li><button type="button" class="gov-btn" data-gov="{{ \App\Support\SiteContent::GOV_KEYS[$g->slug] ?? $g->slug }}" aria-pressed="false"><span class="gov-btn-num" dir="ltr" aria-hidden="true">{{ str_pad((string) $loop->iteration, 2, '0', STR_PAD_LEFT) }}</span>{{ $g->name }}</button></li>
              @endforeach
            </ul>
            @else
            <ul class="gov-list reveal" aria-label="محافظات قطاع غزة">
              <li><button type="button" class="gov-btn" data-gov="north" aria-pressed="false"><span class="gov-btn-num" dir="ltr" aria-hidden="true">01</span>شمال غزة</button></li>
              <li><button type="button" class="gov-btn" data-gov="gaza" aria-pressed="false"><span class="gov-btn-num" dir="ltr" aria-hidden="true">02</span>غزة</button></li>
              <li><button type="button" class="gov-btn" data-gov="deir" aria-pressed="false"><span class="gov-btn-num" dir="ltr" aria-hidden="true">03</span>دير البلح</button></li>
              <li><button type="button" class="gov-btn" data-gov="khan" aria-pressed="false"><span class="gov-btn-num" dir="ltr" aria-hidden="true">04</span>خان يونس</button></li>
              <li><button type="button" class="gov-btn" data-gov="rafah" aria-pressed="false"><span class="gov-btn-num" dir="ltr" aria-hidden="true">05</span>رفح</button></li>
            </ul>
            @endif
            <div class="impact-panel reveal" aria-live="polite">
              <div class="impact-panel-head">
                <div>
                  <p class="impact-panel-kicker">المحافظة المختارة</p>
                  <p class="impact-panel-name" data-map-out="name">غزة</p>
                </div>
              </div>
              <p class="impact-panel-note" data-map-out="note"></p>
              <dl class="impact-stats">
                <div class="impact-stat"><span class="material-symbols-outlined" aria-hidden="true">groups</span><dt>المستفيدون</dt><dd dir="ltr" data-map-out="beneficiaries">0</dd></div>
                <div class="impact-stat"><span class="material-symbols-outlined" aria-hidden="true">restaurant</span><dt>الوجبات</dt><dd dir="ltr" data-map-out="meals">0</dd></div>
                <div class="impact-stat"><span class="material-symbols-outlined" aria-hidden="true">camping</span><dt>الخيام</dt><dd dir="ltr" data-map-out="tents">0</dd></div>
                <div class="impact-stat"><span class="material-symbols-outlined" aria-hidden="true">water_drop</span><dt>نقاط المياه</dt><dd dir="ltr" data-map-out="water">0</dd></div>
              </dl>
            </div>
          </div>

          <div class="impact-map-wrap reveal">
            <svg class="impact-map" viewBox="{{ \App\Support\GazaStrip::VIEWBOX }}" role="group" aria-label="خريطة مبسطة لمحافظات قطاع غزة الخمس">
              <defs>
                <linearGradient id="govGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eaf5ee"/><stop offset=".55" stop-color="#9ad7b4"/><stop offset="1" stop-color="#0c7845"/></linearGradient>
                <pattern id="seaLines" width="18" height="10" patternUnits="userSpaceOnUse"><path d="M0 5 Q4.5 1 9 5 T18 5" fill="none" stroke="rgba(234,245,238,.09)" stroke-width="1"/></pattern>
                <radialGradient id="seaFade" cx=".5" cy=".5" r=".6"><stop offset=".45" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
                <mask id="seaMask"><rect x="-10" y="109" width="380" height="452" fill="url(#seaFade)"/></mask>
                <filter id="govGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              
              <path class="strip-shadow" d="{{ \App\Support\GazaStrip::outline() }}" aria-hidden="true"/>
              <g class="govs">
                <path class="gov" data-gov="north" d="{{ \App\Support\GazaStrip::path('north') }}" tabindex="0" role="button" aria-label="شمال غزة" aria-pressed="false"/>
                <path class="gov" data-gov="gaza" d="{{ \App\Support\GazaStrip::path('gaza') }}" tabindex="0" role="button" aria-label="غزة" aria-pressed="false"/>
                <path class="gov" data-gov="deir" d="{{ \App\Support\GazaStrip::path('deir') }}" tabindex="0" role="button" aria-label="دير البلح" aria-pressed="false"/>
                <path class="gov" data-gov="khan" d="{{ \App\Support\GazaStrip::path('khan') }}" tabindex="0" role="button" aria-label="خان يونس" aria-pressed="false"/>
                <path class="gov" data-gov="rafah" d="{{ \App\Support\GazaStrip::path('rafah') }}" tabindex="0" role="button" aria-label="رفح" aria-pressed="false"/>
              </g>
              <g class="gov-labels" aria-hidden="true">
                <circle class="gov-dot" data-gov-dot="north" cx="{{ \App\Support\GazaStrip::dot('north')[0] }}" cy="{{ \App\Support\GazaStrip::dot('north')[1] }}" r="3.5"/>
                <circle class="gov-dot" data-gov-dot="gaza" cx="{{ \App\Support\GazaStrip::dot('gaza')[0] }}" cy="{{ \App\Support\GazaStrip::dot('gaza')[1] }}" r="3.5"/>
                <circle class="gov-dot" data-gov-dot="deir" cx="{{ \App\Support\GazaStrip::dot('deir')[0] }}" cy="{{ \App\Support\GazaStrip::dot('deir')[1] }}" r="3.5"/>
                <circle class="gov-dot" data-gov-dot="khan" cx="{{ \App\Support\GazaStrip::dot('khan')[0] }}" cy="{{ \App\Support\GazaStrip::dot('khan')[1] }}" r="3.5"/>
                <circle class="gov-dot" data-gov-dot="rafah" cx="{{ \App\Support\GazaStrip::dot('rafah')[0] }}" cy="{{ \App\Support\GazaStrip::dot('rafah')[1] }}" r="3.5"/>
                <text class="gov-label" data-gov-label="north" x="273.1" y="225.1" text-anchor="middle">شمال غزة</text>
                <text class="gov-label" data-gov-label="gaza" x="221.9" y="277.1" text-anchor="middle">غزة</text>
                <text class="gov-label" data-gov-label="deir" x="163.2" y="340.9" text-anchor="middle">دير البلح</text>
                <text class="gov-label" data-gov-label="khan" x="120.9" y="419.0" text-anchor="middle">خان يونس</text>
                <text class="gov-label" data-gov-label="rafah" x="84.2" y="469.7" text-anchor="middle">رفح</text>
              </g>
              <text class="sea-label" x="0" y="0" transform="translate(68 353) rotate(-45)" text-anchor="middle" aria-hidden="true">البحر الأبيض المتوسط</text>
              <g class="compass" transform="translate(30 149)" aria-hidden="true">
                <circle r="20"/>
                <path d="M0 -13 L6 5 L0 1 L-6 5 Z"/>
                <text y="-26" text-anchor="middle">ش</text>
              </g>
            </svg>
            <p class="impact-map-note"><span class="material-symbols-outlined" aria-hidden="true">info</span>خريطة توضيحية مبسطة وغير دقيقة جغرافياً.</p>
          </div>
        </div>
      </div>
    </section>
