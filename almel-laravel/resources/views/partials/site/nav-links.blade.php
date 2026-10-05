@php
  // $nav = SiteContent::nav() (menu «القائمة الرئيسية» from the database), $home = rendering inside the one-page home header, $a = active page key, $mobile = mobile panel
  $__href = function (string $u) use ($home) {
    if ($u === '' || $u === '#') return '#';
    if ($home) {
      if ($u === '/') return '#hero';
      if (str_starts_with($u, '/#')) return substr($u, 1);
    }
    return $u;
  };
  $__active = function (string $u) use ($home, $a) {
    if ($home) return $u === '/' || $u === '#hero';
    $p = trim((string) parse_url($u, PHP_URL_PATH), '/');
    return $p !== '' && ! str_contains($u, '#') && $p === ($a ?? '');
  };
@endphp
@foreach ($nav['items'] as $it)
  @php $href = $__href($it['url']); $on = $__active($it['url']); @endphp
  @if ($mobile)
    <a href="{{ $href }}"@if($on) aria-current="page"@endif @if($it['newTab']) target="_blank" rel="noopener"@endif>@if($it['icon'])<span class="material-symbols-outlined">{{ $it['icon'] }}</span>@endif{{ $it['label'] }}</a>
    @foreach (($it['children'] ?? []) as $ch)
      <a href="{{ $__href($ch['url']) }}" style="padding-inline-start:2.25rem;font-size:.92em" @if($ch['newTab']) target="_blank" rel="noopener"@endif>{{ $ch['label'] }}</a>
    @endforeach
  @else
    <a class="nav-link{{ $on ? ' is-active' : '' }}" href="{{ $href }}"@if($on && ! $home) aria-current="page"@endif @if($it['newTab']) target="_blank" rel="noopener"@endif>{{ $it['label'] }}</a>
  @endif
@endforeach
