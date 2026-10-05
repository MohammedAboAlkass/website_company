@php $__k = $k ?? ''; @endphp
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
@if($__k === 'facebook')
<path d="M14 8h2.5V4.5H14C11.8 4.5 10.5 6 10.5 8.3V10H8v3.5h2.5V20H14v-6.5h2.6L17 10h-3V8.6c0-.4.2-.6.6-.6z"/>
@elseif($__k === 'x')
<path d="M5 4.5l14 15M19 4.5l-14 15"/>
@elseif($__k === 'instagram')
<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".6" fill="currentColor"/>
@elseif($__k === 'youtube')
<rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="M10.5 9.5v5l4-2.5z" fill="currentColor"/>
@elseif($__k === 'telegram')
<path d="M21 4L3 11l6 2 2 6 3-4 5 3z"/><path d="M9 13l12-9"/>
@elseif($__k === 'whatsapp')
<path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-.9-.4-1.8-1.3-2.2-2.2l.8-1-1-2z"/>
@else
<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.5 2.5 13.5 0 16M12 4c-2.5 2.5-2.5 13.5 0 16"/>
@endif
</svg>
