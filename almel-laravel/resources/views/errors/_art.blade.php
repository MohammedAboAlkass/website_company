{{-- Illustrations for the error pages (same vocabulary as admin/status/*: ill-* classes). Pure SVG, no external assets. --}}
@switch($art ?? 'gear')
@case('clock')
<svg class="status-art" viewBox="0 0 400 240" aria-hidden="true" focusable="false">
  <ellipse class="ill-soft" cx="200" cy="218" rx="150" ry="12"/>
  <circle class="ill-line" cx="200" cy="116" r="104" stroke-dasharray="3 9"/>
  <circle class="ill-soft" cx="200" cy="116" r="88"/>
  <g class="ill-float">
    <circle class="ill-card ill-stroke-card" cx="200" cy="116" r="68"/>
    <circle class="ill-amber-soft" cx="200" cy="116" r="56"/>
    <path class="ill-line" d="M200 56v9 M200 167v9 M140 116h9 M251 116h9"/>
    <g class="ill-spin" style="transform-box:view-box;transform-origin:200px 116px"><path class="ill-ink" d="M196.5 118 V76 a3.5 3.5 0 0 1 7 0 V118z"/></g>
    <g class="ill-spin-rev" style="transform-box:view-box;transform-origin:200px 116px"><path class="ill-ink-2" d="M200 112.5 h30 a3.5 3.5 0 0 1 0 7 h-30z"/></g>
    <circle class="ill-amber" cx="200" cy="116" r="7"/>
  </g>
  <circle class="ill-amber-2 ill-pulse" cx="74" cy="68" r="6"/><circle class="ill-ink-2" cx="330" cy="52" r="4"/><circle class="ill-amber" cx="336" cy="188" r="5"/>
  <path class="ill-line" d="M64 176 l10 0 M69 171 l0 10"/>
</svg>
@break
@case('gauge')
<svg class="status-art" viewBox="0 0 400 240" aria-hidden="true" focusable="false">
  <ellipse class="ill-soft" cx="200" cy="218" rx="150" ry="12"/>
  <circle class="ill-soft" cx="200" cy="116" r="90"/>
  <g class="ill-float">
    <circle class="ill-card ill-stroke-card" cx="200" cy="116" r="68"/>
    <path class="ill-dash" d="M152 158 a68 68 0 1 1 96 0"/>
    <path class="ill-line" d="M200 58v8 M148 80l6 6 M252 80l-6 6 M134 116h8 M258 116h8"/>
    <g class="ill-pulse"><path class="ill-amber" d="M200 116 L238 82 L208 124z"/></g>
    <circle class="ill-ink" cx="200" cy="116" r="10"/><circle class="ill-card" cx="200" cy="116" r="4"/>
    <rect class="ill-soft" x="170" y="146" width="60" height="8" rx="4"/><rect class="ill-amber" x="170" y="146" width="44" height="8" rx="4"/>
  </g>
  <circle class="ill-amber-2 ill-pulse" cx="70" cy="72" r="6"/><circle class="ill-ink-2" cx="334" cy="56" r="4"/><circle class="ill-amber" cx="340" cy="184" r="5"/>
  <path class="ill-line" d="M62 180 l10 0 M67 175 l0 10"/>
</svg>
@break
@case('server')
<svg class="status-art" viewBox="0 0 400 240" aria-hidden="true" focusable="false">
  <ellipse class="ill-soft" cx="200" cy="218" rx="160" ry="12"/>
  <circle class="ill-soft" cx="200" cy="120" r="96"/>
  <g class="ill-float">
    <rect class="ill-card ill-stroke-card" x="104" y="48" width="176" height="46" rx="12"/>
    <rect class="ill-card ill-stroke-card" x="104" y="102" width="176" height="46" rx="12"/>
    <rect class="ill-card ill-stroke-card" x="104" y="156" width="176" height="46" rx="12"/>
    <circle class="ill-ink-2" cx="128" cy="71" r="5"/><rect class="ill-soft" x="144" y="66" width="96" height="10" rx="5"/>
    <circle class="ill-amber" cx="128" cy="125" r="5"/><rect class="ill-amber-soft" x="144" y="120" width="96" height="10" rx="5"/>
    <circle class="ill-ink-2" cx="128" cy="179" r="5" opacity=".5"/><rect class="ill-soft" x="144" y="174" width="96" height="10" rx="5"/>
    <path class="ill-amber" stroke-linejoin="round" stroke="var(--ill-amber)" stroke-width="6" d="M290 70 L322 124 H258 Z"/>
    <rect class="ill-card" x="287.8" y="90" width="4.4" height="17" rx="2.2"/><circle class="ill-card" cx="290" cy="114" r="2.8"/>
  </g>
  <circle class="ill-amber-2 ill-pulse" cx="62" cy="76" r="6"/><circle class="ill-ink-2" cx="346" cy="50" r="4"/><circle class="ill-amber" cx="344" cy="192" r="5"/>
  <path class="ill-line" d="M56 176 l10 0 M61 171 l0 10"/>
</svg>
@break
@case('explore')
<svg class="status-art" viewBox="0 0 400 240" aria-hidden="true" focusable="false">
  <ellipse class="ill-soft" cx="200" cy="214" rx="170" ry="14"/>
  <circle class="ill-soft" cx="200" cy="118" r="98"/>
  <path class="ill-dash" d="M34 176 C 90 120, 120 210, 170 150 S 260 90, 300 150 S 360 170, 372 120"/>
  <g class="ill-float">
    <text x="200" y="160" text-anchor="middle" class="ill-ink" font-family="IBM Plex Sans Arabic, sans-serif" font-size="128" font-weight="700" direction="ltr" letter-spacing="4">4<tspan fill="transparent">0</tspan>4</text>
    <circle class="ill-amber-soft" cx="200" cy="116" r="44"/>
    <circle class="ill-card ill-stroke-card" cx="200" cy="116" r="32"/>
    <g class="ill-spin-rev"><path class="ill-amber" d="M200 90 l8 26 -8 26 -8 -26z"/><circle class="ill-ink" cx="200" cy="116" r="4.5"/></g>
  </g>
  <circle class="ill-amber-2 ill-pulse" cx="62" cy="62" r="6"/><circle class="ill-ink-2" cx="344" cy="54" r="4"/><circle class="ill-amber" cx="352" cy="196" r="5"/>
  <path class="ill-line" d="M318 92 l10 0 M323 87 l0 10"/><path class="ill-line" d="M70 196 l10 0 M75 191 l0 10"/>
</svg>
@break
@default
<svg class="status-art" viewBox="0 0 400 240" aria-hidden="true" focusable="false">
  <ellipse class="ill-soft" cx="200" cy="218" rx="160" ry="12"/>
  <rect class="ill-card ill-stroke-card" x="92" y="44" width="216" height="150" rx="16"/>
  <rect class="ill-soft-2" x="92" y="44" width="216" height="28" rx="16"/><rect class="ill-soft-2" x="92" y="60" width="216" height="12"/>
  <circle class="ill-amber" cx="112" cy="58" r="4.5"/><circle class="ill-ink-2" cx="126" cy="58" r="4.5" opacity=".5"/><circle class="ill-ink-2" cx="140" cy="58" r="4.5" opacity=".3"/>
  <rect class="ill-soft" x="112" y="168" width="176" height="8" rx="4"/><rect class="ill-amber ill-pulse" x="112" y="168" width="112" height="8" rx="4"/>
  <g class="ill-spin"><path class="ill-ink" d="M190 86 h20 l3 12 a38 38 0 0 1 10 6 l12 -4 10 17 -9 9 a38 38 0 0 1 0 12 l9 9 -10 17 -12 -4 a38 38 0 0 1 -10 6 l-3 12 h-20 l-3 -12 a38 38 0 0 1 -10 -6 l-12 4 -10 -17 9 -9 a38 38 0 0 1 0 -12 l-9 -9 10 -17 12 4 a38 38 0 0 1 10 -6z" transform="translate(40 6.4) scale(.8)"/></g>
  <circle class="ill-card" cx="200" cy="112" r="11"/>
  <g class="ill-spin-rev"><path class="ill-amber" d="M262 104 h12 l2 7 a22 22 0 0 1 6 3.5 l7 -2.3 6 10 -5.5 5 a22 22 0 0 1 0 7 l5.5 5 -6 10 -7 -2.3 a22 22 0 0 1 -6 3.5 l-2 7 h-12 l-2 -7 a22 22 0 0 1 -6 -3.5 l-7 2.3 -6 -10 5.5 -5 a22 22 0 0 1 0 -7 l-5.5 -5 6 -10 7 2.3 a22 22 0 0 1 6 -3.5z" transform="translate(-6 -18)"/></g>
  <circle class="ill-card" cx="262" cy="108" r="8"/>
  <circle class="ill-amber-2 ill-pulse" cx="60" cy="80" r="6"/><circle class="ill-ink-2" cx="344" cy="64" r="4"/><path class="ill-line" d="M334 180 l12 0 M340 174 l0 12"/>
</svg>
@endswitch
