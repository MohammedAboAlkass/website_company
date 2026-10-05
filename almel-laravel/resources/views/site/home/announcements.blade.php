@php $__items = $home['ann']['items']; @endphp
@if($__items->count())
    <!-- ================= ANNOUNCEMENTS TICKER (from the database: control panel > الإعلانات) ================= -->
    <section id="announcements" class="ticker" aria-label="{{ $home['ann']['label'] }}">
      <div class="ticker-inner">
        <div class="ticker-label">
          <span class="live-dot" aria-hidden="true"></span>
          <span class="ticker-label-stack"><span class="ticker-label-text">{{ $home['ann']['label'] }}</span></span>
        </div>
        <div class="ticker-viewport" tabindex="0" aria-label="شريط الإعلانات، يتوقف عند المرور أو التركيز">
          <div class="ticker-track">
            <ul class="ticker-list">
              @foreach($__items as $an)
              <li><a href="{{ \App\Support\SiteContent::safeUrl($an->link_url, '#news') }}">{{ $an->text }}</a></li>
              @endforeach
            </ul>
          </div>
        </div>
        <button class="ticker-toggle" type="button" aria-pressed="false" aria-label="{{ \App\Support\SiteTexts::t('js.ticker.pause') }}">
          <span class="material-symbols-outlined" aria-hidden="true">pause</span>
        </button>
      </div>
    </section>
@endif
