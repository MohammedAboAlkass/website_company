{{-- «الرؤية والرسالة والقيم» (home): content comes from App\Support\VisionSupport (admin: /admin/vision). Works with 1-3 cards. --}}
@php($cards = $cards ?? [])
@php($__n = count($cards))
@if ($__n)
        <div class="ab-story" data-story>
          <div class="ab-steps" role="list" aria-label="الرؤية والرسالة والقيم">
            <span class="ab-rail" aria-hidden="true"><span class="ab-rail-fill"></span></span>
@foreach ($cards as $i => $c)
            <article class="ab-step{{ $i === 0 ? ' is-active' : '' }}" role="listitem" id="ab-step-{{ $i + 1 }}" data-step="{{ $i }}">
              <figure class="ab-step-media" aria-hidden="true">
                <img src="{{ asset($c['image']) }}" alt="" loading="lazy" decoding="async">
                <span class="ab-step-num" dir="ltr">{{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}</span>
              </figure>
              <div class="ab-head">
                <span class="ab-ico material-symbols-outlined">{{ $c['icon'] }}</span>
                <span class="ab-tab">{{ $c['tab'] }}</span>
                <span class="ab-index" dir="ltr" aria-hidden="true">{{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}</span>
              </div>
@if ($c['kicker'] !== '')
              <p class="ab-kicker">{{ $c['kicker'] }}</p>
@endif
              <h3 class="ab-title">{{ $c['title'] }}</h3>
              <p class="ab-copy">{{ $c['copy'] }}</p>
            </article>
@endforeach
          </div>

          <div class="ab-stage">
            <div class="ab-frame">
@foreach ($cards as $i => $c)
              <img class="ab-img{{ $i === 0 ? ' is-active' : '' }}" src="{{ asset($c['image']) }}" alt="" loading="lazy" decoding="async">
@endforeach
              <span class="ab-shade" aria-hidden="true"></span>
              <span class="ab-corner ab-corner-a" aria-hidden="true"></span><span class="ab-corner ab-corner-b" aria-hidden="true"></span>
              <div class="ab-bignum" dir="ltr" aria-hidden="true"><span class="ab-bignum-0">0</span><span class="ab-bignum-roll"><span class="ab-bignum-track">@foreach ($cards as $i => $c)<span>{{ $i + 1 }}</span>@endforeach</span></span></div>
              <nav class="ab-tabs" aria-label="الرؤية والرسالة والقيم">
@foreach ($cards as $i => $c)
                <a class="ab-tabbtn{{ $i === 0 ? ' is-active' : '' }}" href="#ab-step-{{ $i + 1 }}" data-goto="{{ $i }}"@if ($i === 0) aria-current="step"@endif><span class="ab-tabbtn-label">{{ $c['tab'] }}</span><span class="ab-tabbtn-bar" aria-hidden="true"><span></span></span></a>
@endforeach
              </nav>
            </div>
          </div>
        </div>
@endif
