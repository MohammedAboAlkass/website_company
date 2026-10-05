{{-- «الرؤية والرسالة والقيم» (/about): same source as the home story (App\Support\VisionSupport). --}}
@php($cards = $cards ?? [])
@if (count($cards))
        <div class="vmv-grid">
@foreach ($cards as $i => $c)
          <article class="vmv-card reveal" style="--d:{{ number_format($i * 0.08, 2, '.', '') }}s">
            <figure class="vmv-media m-0" aria-hidden="true"><img src="{{ asset($c['image']) }}" alt="" loading="lazy"><span class="ab-step-num" dir="ltr">{{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}</span></figure>
            <div class="vmv-body">
              <div class="ab-head"><span class="ab-ico material-symbols-outlined" aria-hidden="true">{{ $c['icon'] }}</span><span class="ab-tab">{{ $c['tab'] }}</span></div>
@if ($c['kicker'] !== '')
              <p class="ab-kicker">{{ $c['kicker'] }}</p>
@endif
              <h3 class="ab-title">{{ $c['title'] }}</h3>
              <p class="ab-copy">{{ $c['copy'] }}</p>
            </div>
          </article>
@endforeach
        </div>
@endif
