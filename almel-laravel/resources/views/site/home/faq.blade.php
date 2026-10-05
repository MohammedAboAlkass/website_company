@if($home['faqs']->count())
    <!-- ================= FAQ (from the database) ================= -->
    <section id="faq" class="faq-sec" aria-labelledby="faq-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="faq-grid">
          <div class="faq-intro reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">help</span>{{ \App\Support\HomeSections::t('faq', 'eyebrow') }}</p>
            <h2 id="faq-title" class="section-title">{{ \App\Support\HomeSections::t('faq', 'title') }}</h2>
            <p class="section-lead">{{ \App\Support\HomeSections::t('faq', 'lead') }}</p>
            <div class="faq-cta">
              <span class="faq-cta-ico material-symbols-outlined" aria-hidden="true">support_agent</span>
              <div>
                <p class="faq-cta-title">لم تجد إجابتك؟</p>
                <p class="faq-cta-text">فريق الجمعية جاهز للرد على استفسارك.</p>
              </div>
              <a href="#contact" class="btn btn-forest faq-cta-btn">{{ \App\Support\HomeSections::t('faq', 'button') }}</a>
            </div>
          </div>

          <div class="faq-list reveal" data-faq data-more="4" id="faq-list">
            @foreach($home['faqs'] as $fq)
            <div class="faq-item{{ $loop->first ? ' is-open' : '' }}">
              <h3 class="faq-q"><button type="button" id="faq-b{{ $loop->iteration }}" aria-expanded="{{ $loop->first ? 'true' : 'false' }}" aria-controls="faq-p{{ $loop->iteration }}"><span class="faq-num" dir="ltr" aria-hidden="true">{{ str_pad((string) $loop->iteration, 2, '0', STR_PAD_LEFT) }}</span><span class="faq-q-text">{{ $fq->question }}</span><span class="faq-ico" aria-hidden="true"></span></button></h3>
              <div class="faq-panel" id="faq-p{{ $loop->iteration }}" role="region" aria-labelledby="faq-b{{ $loop->iteration }}"><div class="faq-panel-in ed-content"><div class="faq-ans">{!! \App\Support\SiteContent::rich($fq->answer) !!}</div></div></div>
            </div>
            @endforeach
          </div>
        </div>
      </div>
    </section>
@endif
