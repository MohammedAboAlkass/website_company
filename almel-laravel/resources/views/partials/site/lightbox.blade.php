<!-- ================= LIGHTBOX (zoom, pan, swipe, thumbnails; any link with data-lb-group opens it) ================= -->
  <link rel="stylesheet" href="{{ asset('assets/site/css/lightbox.css') }}">
  <script src="{{ asset('assets/site/js/lightbox.js') }}" defer></script>
  <div class="lbx" id="lightbox" role="dialog" aria-modal="true" aria-labelledby="lb-title" hidden>
    <div class="lbx-top">
      <p class="lbx-count" dir="ltr" aria-live="polite"><b data-lb="i">1</b> / <span data-lb="n">1</span></p>
      <div class="lbx-tools">
        <div class="lbx-zoom" role="group" aria-label="{{ \App\Support\SiteTexts::t('js.lb.zoom_in') }} / {{ \App\Support\SiteTexts::t('js.lb.zoom_out') }}">
          <button type="button" class="lbx-btn" data-lb="zin" aria-label="{{ \App\Support\SiteTexts::t('js.lb.zoom_in') }}"><span class="material-symbols-outlined" aria-hidden="true">zoom_in</span></button>
          <button type="button" class="lbx-btn lbx-pct" data-lb="zreset" dir="ltr" aria-label="{{ \App\Support\SiteTexts::t('js.lb.zoom_reset') }}">100%</button>
          <button type="button" class="lbx-btn" data-lb="zout" aria-label="{{ \App\Support\SiteTexts::t('js.lb.zoom_out') }}"><span class="material-symbols-outlined" aria-hidden="true">zoom_out</span></button>
        </div>
        <button type="button" class="lbx-btn lbx-fs" data-lb="fs" aria-pressed="false" aria-label="{{ \App\Support\SiteTexts::t('js.lb.fs_on') }}" hidden><span class="material-symbols-outlined" aria-hidden="true">fullscreen</span></button>
        <button type="button" class="lbx-btn lbx-close" data-lb="close" aria-label="{{ \App\Support\SiteTexts::t('js.lb.close') }}"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
      </div>
    </div>
    <div class="lbx-stage" data-lb="stage">
      <div class="lbx-view" data-lb="media"></div>
      <span class="lbx-spin" data-lb="spin" aria-hidden="true" hidden></span>
      <button type="button" class="lbx-btn lbx-nav lbx-prev" data-lb="prev" aria-label="{{ \App\Support\SiteTexts::t('js.lb.prev') }}"><span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>
      <button type="button" class="lbx-btn lbx-nav lbx-next" data-lb="next" aria-label="{{ \App\Support\SiteTexts::t('js.lb.next') }}"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></button>
    </div>
    <div class="lbx-foot">
      <div class="lbx-card" data-lb="card">
        <p class="lbx-kicker" data-lb="kicker"></p>
        <p class="lbx-title" id="lb-title" data-lb="title"></p>
      </div>
      <div class="lbx-thumbs" data-lb="thumbs" role="group" aria-label="{{ \App\Support\SiteTexts::t('js.lb.thumbs') }}" hidden></div>
      <p class="lbx-hint">{{ \App\Support\SiteTexts::t('js.lb.hint') }}</p>
    </div>
  </div>
