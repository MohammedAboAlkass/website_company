@props(['hero'])
@php
    use App\Support\HeroSupport as H;
    $set = $hero['settings'];
    $slides = array_values($hero['slides']);
    $n = count($slides);
    $multi = $n > 1;
    $hMode = $set['height_mode'];
    $heroH = $hMode === '70vh' ? '70svh' : ($hMode === 'custom' ? $set['height_value'].($set['height_unit'] === 'px' ? 'px' : 'svh') : '100svh');
    $heroStyle = '--hero-h:'.$heroH.';--hs-speed:'.(int) $set['speed'].'ms';
@endphp
@if ($set['enabled'])
<section id="hero" class="hero hs-root relative isolate overflow-hidden bg-primary text-white" style="{{ $heroStyle }}"
  data-hero data-slides="{{ $n }}" data-autoplay="{{ $set['autoplay'] && $multi ? 1 : 0 }}" data-interval="{{ (int) $set['interval'] * 1000 }}" data-loop="{{ $set['loop'] ? 1 : 0 }}"
  data-hover="{{ $set['pause_hover'] ? 1 : 0 }}" data-arrows="{{ $set['arrows'] && $multi ? 1 : 0 }}" data-dots="{{ $set['dots'] && $multi ? 1 : 0 }}" data-scroll="{{ $set['scroll_hint'] ? 1 : 0 }}" data-tr="{{ $set['transition'] }}"
  @if ($multi) aria-roledescription="carousel" aria-label="شرائح الصفحة الرئيسية" @endif>
  <div class="hs-bgs" aria-hidden="true">
    @foreach ($slides as $i => $s)
      @php
        $bg = $s['background'];
        $type = $bg['type'];
        $pos = $i === 0 ? 'active' : 'after';
        $bgStyle = 'background-color:'.$bg['color'].';';
        if ($type === 'gradient') {
            $bgStyle = 'background:'.H::gradientCss($bg['gradient']).';';
        } elseif ($type === 'video' && $bg['video']['poster'] !== '') {
            $bgStyle .= 'background-image:url(\''.H::href($bg['video']['poster']).'\');background-size:cover;background-position:'.$bg['focus_x'].'% '.$bg['focus_y'].'%;background-repeat:no-repeat;';
        }
        $mediaStyle = 'object-fit:'.$bg['fit'].';object-position:'.$bg['focus_x'].'% '.$bg['focus_y'].'%;--hs-z:'.number_format($bg['zoom'] / 100, 2, '.', '').';'
            .($bg['grayscale'] > 0 ? 'filter:grayscale('.number_format($bg['grayscale'] / 100, 2, '.', '').');' : '');
        $ovCss = \App\Support\SiteTheme::heroOverlay($bg['overlay']) ?? H::overlayCss($bg['overlay']);
      @endphp
      <div class="hs-bg{{ $i === 0 ? ' is-active' : '' }}{{ $bg['motion'] && in_array($type, ['image', 'video'], true) ? ' has-motion' : '' }}" data-i="{{ $i }}" data-pos="{{ $pos }}" data-d="{{ (int) $s['duration'] * 1000 }}" data-type="{{ $type }}" style="{{ $bgStyle }}">
        @if ($type === 'image' && $bg['image']['url'] !== '')
          <div class="hs-media" style="background-image:url('{{ H::href($bg['image']['url']) }}');background-repeat:no-repeat;background-size:{{ $bg['fit'] }};background-position:{{ $bg['focus_x'] }}% {{ $bg['focus_y'] }}%;--hs-z:{{ number_format($bg['zoom'] / 100, 2, '.', '') }};{{ $bg['grayscale'] > 0 ? 'filter:grayscale('.number_format($bg['grayscale'] / 100, 2, '.', '').');' : '' }}"></div>
        @elseif ($type === 'video' && $bg['video']['url'] !== '')
          <video class="hs-media hs-video" @if ($i === 0) autoplay @endif muted loop playsinline preload="{{ $i === 0 ? 'metadata' : 'none' }}" tabindex="-1"@if ($bg['video']['poster'] !== '') poster="{{ H::href($bg['video']['poster']) }}"@endif style="{{ $mediaStyle }}">
            @php
              // Lighter 640x360 file for phones: used only when "<name>-mobile.mp4" really exists next to a local .mp4.
              $__vu = (string) $bg['video']['url'];
              $__vm = null;
              if (preg_match('~^/assets/[^?#]+\.mp4$~i', $__vu)) {
                  $__cand = preg_replace('~\.mp4$~i', '-mobile.mp4', $__vu);
                  if (is_file(public_path(ltrim($__cand, '/')))) { $__vm = $__cand; }
              }
            @endphp
            @if ($__vm)<source src="{{ H::href($__vm) }}" type="video/mp4" media="(max-width: 767px)">@endif
            <source src="{{ H::href($bg['video']['url']) }}" type="{{ H::videoType($bg['video']['url']) }}">
          </video>
        @endif
        @if ($ovCss !== '')<div class="hs-ov" style="{{ $ovCss }}"></div>@endif
      </div>
    @endforeach
  </div>

  <div class="hero-inner relative z-10 mx-auto flex w-full max-w-page flex-col px-5 md:px-8">
    <div class="hs-stage">
      @foreach ($slides as $i => $s)
        @php
          $c = $s['content'];
          $st = $s['style'];
          $__tc = fn ($c) => \App\Support\SiteTheme::heroColor($c);
          $vars = '--hs-title:'.$__tc($st['title_color']).';--hs-text:'.$__tc($st['text_color']).';--hs-eyebrow:'.$__tc($st['eyebrow_color']).';--hs-accent:'.$__tc($st['accent_color']).';--hs-ts:'.number_format($st['title_size'] / 100, 2, '.', '').';--hs-xs:'.number_format($st['text_size'] / 100, 2, '.', '');
          $btns = array_values(array_filter([$c['btn1'], $c['btn2']], fn ($b) => $b['visible'] && $b['label'] !== '' && $b['url'] !== ''));
        @endphp
        <div class="hs-slide{{ $i === 0 ? ' is-active' : '' }}" data-i="{{ $i }}" data-pos="{{ $i === 0 ? 'active' : 'after' }}" data-v="{{ $st['v'] }}" data-h="{{ $st['h'] }}" style="{{ $vars }}"@if ($i !== 0) aria-hidden="true" inert @endif @if ($multi) role="group" aria-roledescription="شريحة" aria-label="{{ $i + 1 }} من {{ $n }}" @endif>
          <div class="hs-box" data-a="{{ $st['align'] }}">
            @if ($c['badge'] !== '' || $c['badge2'] !== '')
              <div class="hs-badge"><span class="hs-dot" aria-hidden="true"></span>
                @if ($c['badge'] !== '')<span class="hs-b1">{{ $c['badge'] }}</span>@endif
                @if ($c['badge'] !== '' && $c['badge2'] !== '')<span class="hs-sep" aria-hidden="true">•</span>@endif
                @if ($c['badge2'] !== '')<span class="hs-b2">{{ $c['badge2'] }}</span>@endif
              </div>
            @endif
            @if ($c['eyebrow'] !== '')<p class="hs-kicker"><span class="hs-rule" aria-hidden="true"></span>{{ $c['eyebrow'] }}</p>@endif
            @if ($c['title'] !== '')
              <{{ $i === 0 ? 'h1' : 'h2' }} class="hs-title">{!! H::titleHtml($c['title']) !!}</{{ $i === 0 ? 'h1' : 'h2' }}>
            @endif
            @if ($c['subtitle'] !== '')<p class="hs-lead">{!! nl2br(e($c['subtitle']), false) !!}</p>@endif
            @if (count($btns))
              <div class="hs-cta">
                @foreach ($btns as $b)
                  @php $gold = $b['style'] === 'gold'; @endphp
                  <a class="hs-btn hs-btn--{{ $b['style'] }}{{ $gold && $b['icon'] !== '' ? ' has-circle' : '' }}" href="{{ H::href($b['url']) }}"@if ($b['new_tab']) target="_blank" rel="noopener noreferrer"@endif>
                    @if ($b['icon'] !== '')
                      @if ($gold)<span class="hs-circle" aria-hidden="true"><span class="material-symbols-outlined fill">{{ $b['icon'] }}</span></span>
                      @else<span class="material-symbols-outlined hs-bico" aria-hidden="true">{{ $b['icon'] }}</span>@endif
                    @endif
                    {{ $b['label'] }}
                    @if ($gold)<span class="material-symbols-outlined hs-barrow" aria-hidden="true">arrow_back</span>@endif
                  </a>
                @endforeach
              </div>
            @endif
          </div>
        </div>
      @endforeach

      @if ($multi)
        <button type="button" class="hs-arrow hs-prev" aria-label="الشريحة السابقة"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></button>
        <button type="button" class="hs-arrow hs-next" aria-label="الشريحة التالية"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span></button>
        <div class="hs-ctrl">
          <div class="hs-dots">
            @foreach ($slides as $i => $s)
              <button type="button" class="hs-dot-btn{{ $i === 0 ? ' is-active' : '' }}" data-go="{{ $i }}" aria-label="الانتقال إلى الشريحة {{ $i + 1 }}" @if ($i === 0) aria-current="true" @endif></button>
            @endforeach
          </div>
          @if ($set['autoplay'])
            <button type="button" class="hs-pp" aria-label="{{ \App\Support\SiteTexts::t('js.play.pause') }}" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">pause</span></button>
          @endif
        </div>
      @endif
    </div>

    {{ $slot }}
  </div>
</section>
@endif
