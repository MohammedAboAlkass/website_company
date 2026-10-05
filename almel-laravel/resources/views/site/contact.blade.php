@extends('layouts.site')
@php $__i = $info ?? \App\Support\SiteContent::info(); $__tel = $__i['tel']; @endphp
@section('title', 'تواصل معنا — جمعية الشمال للتنمية والتطوير المجتمعي')
@section('description', 'تواصل مع فريق جمعية الشمال للتنمية والتطوير المجتمعي: الخط الساخن، واتساب، البريد الإلكتروني، وغرفة التنسيق في القاهرة.')
@section('page', 'contact')
@section('active', 'contact')
@push('css')
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('ed-content') }}">
<link rel="stylesheet" href="{{ \App\Support\SiteTheme::css('pages') }}">
@endpush
@section('content')
<main id="main">
    <!-- ================= PAGE HERO ================= -->
    <section class="page-hero " aria-labelledby="page-title">
      <div class="page-hero-media" aria-hidden="true"><img src="{{ asset('assets/site/img/gallery-lab.jpg') }}" alt="" data-hero-img></div>
      <div class="page-hero-shade" aria-hidden="true"></div>
      <div class="page-hero-pattern" aria-hidden="true"></div>
      <div class="hero-grain" aria-hidden="true"></div>
      <div class="page-hero-inner mx-auto max-w-page px-5 md:px-8">
        <nav class="crumbs hero-in d1" aria-label="مسار التنقل">
          <ol><li><a href="{{ route('home') }}"><span class="material-symbols-outlined" aria-hidden="true">home</span>الرئيسية</a></li><li><span aria-current="page" data-crumb-current>تواصل معنا</span></li></ol>
        </nav>
        <p class="page-hero-kicker hero-in d2" data-hero-kicker>{{ \App\Support\SiteTexts::t('contact.hero.kicker') }}</p>
        <h1 id="page-title" class="page-hero-title hero-in d3" data-hero-title>{!! \App\Support\SiteTexts::gold('contact.hero.title', 'contact.hero.title_gold') !!}</h1>
        <p class="page-hero-lead hero-in d4" data-hero-lead>{{ \App\Support\SiteTexts::t('contact.hero.lead') }}</p>
        <div class="page-hero-meta hero-in d5"><span class="hero-chip"><span class="material-symbols-outlined" aria-hidden="true">call</span>{{ \App\Support\SiteTexts::t('contact.hero.chip_hotline') }} {{ \App\Support\SiteSettings::hotlineNote() }}</span><span class="hero-chip"><span class="material-symbols-outlined" aria-hidden="true">schedule</span>{{ \App\Support\SiteContent::hours() }}</span></div>
      </div>
      <span class="lux-hairline lux-hairline-bottom" aria-hidden="true"></span>
    </section>

    <!-- ================= CONTACT CARDS ================= -->
    <section class="sec sec-sand pb-0 md:pb-0" aria-labelledby="channels-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <h2 id="channels-title" class="sr-only">{{ \App\Support\SiteTexts::t('contact.channels.sr') }}</h2>
        <div class="cc-grid">
          @if($__i['phone'])<div class="cc-card reveal"><span class="info-ico material-symbols-outlined" aria-hidden="true">call</span><p class="info-label">{{ \App\Support\SiteTexts::t('contact.card.hotline_label') }}</p><p class="info-value" dir="ltr"><a href="tel:{{ $__tel }}">{{ $__i['phone'] }}</a></p><p class="text-[12.5px] font-bold text-gold-deep">{{ \App\Support\SiteSettings::hotlineNote() }}</p><span class="cc-cta" aria-hidden="true">{{ \App\Support\SiteTexts::t('contact.card.hotline_cta') }}<span class="material-symbols-outlined">arrow_back</span></span></div>@endif
          @if($__i['wa'])<div class="cc-card reveal" style="--d:.06s"><span class="info-ico info-ico-wa material-symbols-outlined" aria-hidden="true">chat</span><p class="info-label">{{ \App\Support\SiteTexts::t('contact.card.wa_label') }}</p><p class="info-value" dir="ltr"><a href="https://wa.me/{{ $__i['wa'] }}" target="_blank" rel="noopener" aria-label="راسلنا على واتساب: {{ $__i['phone'] }}">{{ $__i['phone'] }}</a></p><p class="cc-sub">{{ \App\Support\SiteTexts::t('contact.card.wa_sub') }}</p><span class="cc-cta" aria-hidden="true">{{ \App\Support\SiteTexts::t('contact.card.wa_cta') }}<span class="material-symbols-outlined">arrow_back</span></span></div>@endif
          @if($__i['email'])<div class="cc-card reveal" style="--d:.12s"><span class="info-ico info-ico-gold material-symbols-outlined" aria-hidden="true">mail</span><p class="info-label">{{ \App\Support\SiteTexts::t('contact.card.email_label') }}</p><p class="info-value break-all"><a href="mailto:{{ $__i['email'] }}">{{ $__i['email'] }}</a></p><p class="cc-sub">{{ \App\Support\SiteSettings::emailNote() }}</p><span class="cc-cta" aria-hidden="true">{{ \App\Support\SiteTexts::t('contact.card.email_cta') }}<span class="material-symbols-outlined">arrow_back</span></span></div>@endif
          @if($__i['address'])<div class="cc-card reveal" style="--d:.18s"><span class="info-ico material-symbols-outlined" aria-hidden="true">location_on</span><p class="info-label">{{ \App\Support\SiteTexts::t('contact.card.address_label') }}</p><p class="info-value"><a href="{{ \App\Support\SiteTexts::t('contact.map.link') }}" target="_blank" rel="noopener">{{ $__i['address'] }}</a></p><span class="cc-cta" aria-hidden="true">{{ \App\Support\SiteTexts::t('contact.card.address_cta') }}<span class="material-symbols-outlined">arrow_back</span></span></div>@endif
        </div>
      </div>
    </section>

    <!-- ================= FORM + MAP ================= -->
    <section class="sec sec-sand pt-6 md:pt-6" aria-labelledby="form-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="contact-grid">
          <div class="form-card reveal" id="message-form">
            <form id="contact-page-form" novalidate aria-describedby="form-title-sub" method="post" action="{{ route('contact.store') }}" data-live="1">
              @csrf
              <div style="position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none" aria-hidden="true"><label>لا تملأ هذا الحقل<input type="text" name="company_site" tabindex="-1" autocomplete="off"></label></div>
              <h2 id="form-title" class="text-[22px] font-bold text-primary">{{ \App\Support\SiteTexts::t('contact.form.title') }}</h2>
              <p id="form-title-sub" class="mt-1 text-[14px] text-on-variant">{!! \App\Support\SiteTexts::withReq('contact.form.sub_page') !!}</p>
              <div class="form-alert" id="cf-alert" role="alert" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span id="cf-alert-text"></span></div>
              <div class="cform-grid">
                <div class="field"><label for="cf-name">{{ \App\Support\SiteTexts::t('contact.form.name_label') }} <span class="req" aria-hidden="true">*</span></label><input id="cf-name" name="name" type="text" autocomplete="name" required minlength="3" placeholder="{{ \App\Support\SiteTexts::t('contact.form.name_ph') }}" aria-describedby="cf-name-err"><p class="field-error" id="cf-name-err" hidden></p></div>
                <div class="field"><label for="cf-phone">{{ \App\Support\SiteTexts::t('contact.form.phone_label') }} <span class="req" aria-hidden="true">*</span></label><input id="cf-phone" name="phone" class="text-left" dir="ltr" type="tel" autocomplete="tel" required placeholder="{{ \App\Support\SiteTexts::t('contact.form.phone_ph') }}" aria-describedby="cf-phone-hint cf-phone-err"><p class="field-hint" id="cf-phone-hint">{{ \App\Support\SiteTexts::t('contact.form.phone_hint') }}</p><p class="field-error" id="cf-phone-err" hidden></p></div>
                <div class="field"><label for="cf-email">{{ \App\Support\SiteTexts::t('contact.form.email_label') }} <span class="req" aria-hidden="true">*</span></label><input id="cf-email" name="email" type="email" autocomplete="email" dir="ltr" class="text-left" required placeholder="{{ \App\Support\SiteTexts::t('contact.form.email_ph') }}" aria-describedby="cf-email-err"><p class="field-error" id="cf-email-err" hidden></p></div>
                <div class="field"><label for="cf-topic">{{ \App\Support\SiteTexts::t('contact.form.topic_label') }}</label>
                  <select id="cf-topic" name="topic">
                    <option value="inquiry">{{ \App\Support\SiteTexts::t('contact.topic.inquiry') }}</option>
                    <option value="partnership">{{ \App\Support\SiteTexts::t('contact.topic.partnership') }}</option>
                    <option value="volunteer">{{ \App\Support\SiteTexts::t('contact.topic.volunteer') }}</option>
                    <option value="media">{{ \App\Support\SiteTexts::t('contact.topic.media') }}</option>
                    <option value="other">{{ \App\Support\SiteTexts::t('contact.topic.other') }}</option>
                  </select>
                </div>
                <div class="field span-2"><label for="cf-msg">{{ \App\Support\SiteTexts::t('contact.form.msg_label') }} <span class="req" aria-hidden="true">*</span></label><textarea id="cf-msg" name="message" rows="5" required minlength="10" placeholder="{{ \App\Support\SiteTexts::t('contact.form.msg_ph') }}" aria-describedby="cf-msg-err"></textarea><p class="field-error" id="cf-msg-err" hidden></p></div>
                <div class="field span-2"><label class="check" for="cf-consent"><input id="cf-consent" name="consent" type="checkbox" required aria-describedby="cf-consent-err"><span>{{ \App\Support\SiteTexts::t('contact.form.consent') }} <span class="req" aria-hidden="true">*</span></span></label><p class="field-error" id="cf-consent-err" hidden></p></div>
              </div>
              <div class="form-foot">
                <button class="btn btn-forest h-12 px-8 text-[15px]" type="submit"><span class="material-symbols-outlined" aria-hidden="true">send</span>{{ \App\Support\SiteTexts::t('contact.form.submit') }}</button>
                <p class="form-note"><span class="material-symbols-outlined" aria-hidden="true">lock</span>{{ \App\Support\SiteTexts::t('contact.form.note') }}</p>
              </div>
            </form>
            <div class="form-success" id="cf-success" tabindex="-1" hidden>
              <span class="form-success-ico" aria-hidden="true"><span class="material-symbols-outlined">check</span></span>
              <h3>{{ \App\Support\SiteTexts::t('contact.success.title') }}</h3>
              <p>{!! \App\Support\SiteTexts::linked('contact.success.text', 'https://wa.me/'.$__i['wa'], 'link-arrow') !!}</p>
              <button type="button" class="btn btn-outline mt-3 h-11 px-6 text-[14px]" id="cf-again"><span class="material-symbols-outlined text-[20px]" aria-hidden="true">refresh</span>{{ \App\Support\SiteTexts::t('contact.success.again') }}</button>
            </div>
          </div>

          <div class="flex flex-col gap-6">
            <div class="gz-map reveal">
@if (($__emb = \App\Support\SiteTexts::mapEmbed()) !== '')
              <iframe src="{{ $__emb }}" title="{{ \App\Support\SiteTexts::t('contact.map.title') }}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-popups" style="position:absolute;top:0;left:0;width:100%;height:calc(100% - 96px);border:0"></iframe>
@else
              <span class="gz-note"><span class="material-symbols-outlined" aria-hidden="true">info</span>{{ \App\Support\SiteTexts::t('contact.map.note') }}</span>
              <svg viewBox="{{ \App\Support\GazaStrip::VIEWBOX }}" role="img" aria-label="{{ \App\Support\SiteTexts::t('contact.map.aria') }}" focusable="false">
@foreach (\App\Support\GazaStrip::KEYS as $__gk)
                <path class="gz-strip" d="{{ \App\Support\GazaStrip::path($__gk) }}"/>
@endforeach
                <text class="gz-sea" transform="translate(68 353) rotate(-45)" text-anchor="middle">{{ \App\Support\SiteTexts::t('contact.map.sea') }}</text>
                <g><circle class="gz-pin-ring" cx="{{ \App\Support\GazaStrip::dot('north')[0] }}" cy="{{ \App\Support\GazaStrip::dot('north')[1] }}" r="9"/><circle class="gz-pin" cx="{{ \App\Support\GazaStrip::dot('north')[0] }}" cy="{{ \App\Support\GazaStrip::dot('north')[1] }}" r="6"/><text class="gz-label" x="{{ round(\App\Support\GazaStrip::dot('north')[0] + 16, 1) }}" y="{{ round(\App\Support\GazaStrip::dot('north')[1] + 5, 1) }}" text-anchor="end">{{ \App\Support\SiteTexts::t('contact.map.pin1') }}</text></g><g><circle class="gz-pin-ring" cx="{{ \App\Support\GazaStrip::dot('gaza')[0] }}" cy="{{ \App\Support\GazaStrip::dot('gaza')[1] }}" r="9"/><circle class="gz-pin" cx="{{ \App\Support\GazaStrip::dot('gaza')[0] }}" cy="{{ \App\Support\GazaStrip::dot('gaza')[1] }}" r="6"/><text class="gz-label" x="{{ round(\App\Support\GazaStrip::dot('gaza')[0] + 16, 1) }}" y="{{ round(\App\Support\GazaStrip::dot('gaza')[1] + 5, 1) }}" text-anchor="end">{{ \App\Support\SiteTexts::t('contact.map.pin2') }}</text></g><g><circle class="gz-pin-ring" cx="{{ \App\Support\GazaStrip::dot('deir')[0] }}" cy="{{ \App\Support\GazaStrip::dot('deir')[1] }}" r="9"/><circle class="gz-pin" cx="{{ \App\Support\GazaStrip::dot('deir')[0] }}" cy="{{ \App\Support\GazaStrip::dot('deir')[1] }}" r="6"/><text class="gz-label" x="{{ round(\App\Support\GazaStrip::dot('deir')[0] + 16, 1) }}" y="{{ round(\App\Support\GazaStrip::dot('deir')[1] + 5, 1) }}" text-anchor="end">{{ \App\Support\SiteTexts::t('contact.map.pin3') }}</text></g><g><circle class="gz-pin-ring" cx="{{ \App\Support\GazaStrip::dot('khan')[0] }}" cy="{{ \App\Support\GazaStrip::dot('khan')[1] }}" r="9"/><circle class="gz-pin" cx="{{ \App\Support\GazaStrip::dot('khan')[0] }}" cy="{{ \App\Support\GazaStrip::dot('khan')[1] }}" r="6"/><text class="gz-label" x="{{ round(\App\Support\GazaStrip::dot('khan')[0] + 16, 1) }}" y="{{ round(\App\Support\GazaStrip::dot('khan')[1] + 5, 1) }}" text-anchor="end">{{ \App\Support\SiteTexts::t('contact.map.pin4') }}</text></g><g><circle class="gz-pin-ring" cx="{{ \App\Support\GazaStrip::dot('rafah')[0] }}" cy="{{ \App\Support\GazaStrip::dot('rafah')[1] }}" r="9"/><circle class="gz-pin" cx="{{ \App\Support\GazaStrip::dot('rafah')[0] }}" cy="{{ \App\Support\GazaStrip::dot('rafah')[1] }}" r="6"/><text class="gz-label" x="{{ round(\App\Support\GazaStrip::dot('rafah')[0] + 16, 1) }}" y="{{ round(\App\Support\GazaStrip::dot('rafah')[1] + 5, 1) }}" text-anchor="end">{{ \App\Support\SiteTexts::t('contact.map.pin5') }}</text></g>
              </svg>
@endif
              <div class="map-info"{!! $__emb !== '' ? ' style="z-index:2"' : '' !!}>
                <div>
                  <p class="text-[16px] font-bold text-primary">{{ \App\Support\SiteTexts::t('contact.map.title') }}</p>
                  <p class="text-[12.5px] text-on-variant">{{ \App\Support\SiteTexts::t('contact.map.sub') }}</p>
                </div>
                <a class="btn btn-gold h-10 shrink-0 px-4 text-[13px]" href="{{ \App\Support\SiteTexts::t('contact.map.link') }}" target="_blank" rel="noopener"><span class="material-symbols-outlined text-[18px]" aria-hidden="true">directions</span>{{ \App\Support\SiteTexts::t('contact.map.btn_page') }}</a>
              </div>
            </div>
            <div class="form-card reveal !p-6">
              <h2 class="text-[18px] font-bold text-primary">{{ \App\Support\SiteTexts::t('contact.points.title') }}</h2>
              <div class="mt-4 grid grid-cols-2 gap-3 text-[14px] text-on-variant">
@foreach(\App\Support\SiteSettings::fieldPoints() as $__fp)
                <p class="field-point">{{ $__fp }}</p>
@endforeach
              </div>
              <div class="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-[13.5px]">
                <span class="inline-flex items-center gap-1.5 font-bold text-primary"><span class="material-symbols-outlined text-[18px] text-gold-deep" aria-hidden="true">schedule</span>{{ \App\Support\SiteTexts::t('contact.card.hours_label') }}</span>
                <span class="text-on-variant">{{ \App\Support\SiteContent::hours() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= FAQ EXCERPT ================= -->
    @if(isset($faqs) && $faqs->count())
    <!-- FAQ (from the database) -->
    <section id="faq" class="faq-sec" aria-labelledby="faq-title">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="faq-grid">
          <div class="faq-intro reveal">
            <p class="eyebrow"><span class="material-symbols-outlined">help</span>الأسئلة الشائعة</p>
            <h2 id="faq-title" class="section-title">إجابات واضحة على أكثر ما تسأل عنه</h2>
            <p class="section-lead">مقتطف من أكثر ما يسألنا عنه الأهالي والشركاء.</p>
          </div>
          <div class="faq-list reveal" data-faq>
            @foreach($faqs as $fq)
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
  </main>
@endsection
@push('scripts')
<script src="{{ asset('assets/site/js/site-live.js') }}"></script>
<script src="{{ asset('assets/site/js/pages.js') }}"></script>
<script src="{{ asset('assets/site/js/main.js') }}"></script>
@endpush
