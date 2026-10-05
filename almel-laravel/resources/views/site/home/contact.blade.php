@php $__i = $home['info']; @endphp
    <!-- ================= CONTACT (details from general settings; the form stores messages in the database) ================= -->
    <section id="contact" class="bg-sand py-20 md:py-28">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="reveal mx-auto max-w-3xl text-center">
          <p class="eyebrow justify-center"><span class="material-symbols-outlined">contact_support</span>{{ \App\Support\HomeSections::t('contact', 'eyebrow') }}</p>
          <h2 class="section-title">{{ \App\Support\HomeSections::t('contact', 'title') }}</h2>
          <p class="section-lead">{{ \App\Support\HomeSections::t('contact', 'lead') }}</p>
        </div>
        <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @if($__i['phone'])<div class="info-card reveal"><span class="info-ico material-symbols-outlined">call</span><p class="info-label">{{ \App\Support\SiteTexts::t('contact.card.hotline_label') }}</p><p class="info-value" dir="ltr">{{ $__i['phone'] }}</p><p class="text-[12.5px] font-bold text-gold-deep">{{ \App\Support\SiteSettings::hotlineNote() }}</p></div>@endif
          @if($__i['email'])<div class="info-card reveal" style="--d:.06s"><span class="info-ico info-ico-gold material-symbols-outlined">mail</span><p class="info-label">{{ \App\Support\SiteTexts::t('contact.card.email_label') }}</p><p class="info-value break-all">{{ $__i['email'] }}</p><p class="text-[12.5px] text-muted">{{ \App\Support\SiteSettings::emailNote() }}</p></div>@endif
          @if($__i['address'])<div class="info-card reveal" style="--d:.12s"><span class="info-ico material-symbols-outlined">location_on</span><p class="info-label">{{ \App\Support\SiteTexts::t('contact.card.address_label') }}</p><p class="info-value">{{ $__i['address'] }}</p></div>@endif
          <div class="info-card reveal" style="--d:.18s"><span class="info-ico info-ico-gold material-symbols-outlined">schedule</span><p class="info-label">{{ \App\Support\SiteTexts::t('contact.card.hours_label') }}</p>@php $__hp = array_pad(array_map('trim', explode('•', \App\Support\SiteContent::hours(), 2)), 2, ''); @endphp<p class="info-value">{{ $__hp[0] }}</p>@if($__hp[1] !== '')<p class="text-[12.5px] text-muted">{{ $__hp[1] }}</p>@endif</div>
        </div>
        <div class="mt-6 grid gap-6 lg:grid-cols-12">
          <form id="contact-form" class="form-card reveal lg:col-span-7" method="post" action="{{ route('contact.store') }}" data-live="1">
            @csrf
            <div style="position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none" aria-hidden="true"><label>لا تملأ هذا الحقل<input type="text" name="company_site" tabindex="-1" autocomplete="off"></label></div>
            <h3 class="text-[20px] font-bold text-primary">{{ \App\Support\SiteTexts::t('contact.form.title') }}</h3>
            <p class="mt-1 text-[14px] text-on-variant">{{ \App\Support\SiteTexts::t('contact.form.sub_home') }}</p>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <label class="field">{{ \App\Support\SiteTexts::t('contact.form.name_label') }} *<input required type="text" name="name" minlength="3" maxlength="150" autocomplete="name" placeholder="{{ \App\Support\SiteTexts::t('contact.form.name_ph') }}"></label>
              <label class="field">{{ \App\Support\SiteTexts::t('contact.form.phone_label') }} *<input required class="text-left" dir="ltr" type="tel" name="phone" maxlength="30" autocomplete="tel" placeholder="{{ \App\Support\SiteTexts::t('contact.form.phone_ph') }}"></label>
              <label class="field">{{ \App\Support\SiteTexts::t('contact.form.email_label') }} *<input required type="email" name="email" maxlength="255" autocomplete="email" placeholder="{{ \App\Support\SiteTexts::t('contact.form.email_ph') }}"></label>
              <label class="field">{{ \App\Support\SiteTexts::t('contact.form.topic_label') }}
                <select name="topic">
                  <option value="inquiry">{{ \App\Support\SiteTexts::t('contact.topic.inquiry') }}</option>
                  <option value="partnership">{{ \App\Support\SiteTexts::t('contact.topic.partnership') }}</option>
                  <option value="volunteer">{{ \App\Support\SiteTexts::t('contact.topic.volunteer') }}</option>
                  <option value="media">{{ \App\Support\SiteTexts::t('contact.topic.media') }}</option>
                  <option value="other">{{ \App\Support\SiteTexts::t('contact.topic.other') }}</option>
                </select>
              </label>
            </div>
            <label class="field mt-4">{{ \App\Support\SiteTexts::t('contact.form.msg_label') }} *<textarea required rows="5" name="message" minlength="10" maxlength="5000" placeholder="{{ \App\Support\SiteTexts::t('contact.form.msg_ph') }}"></textarea></label>
            <input type="hidden" name="consent" value="1">
            <button class="btn btn-forest mt-6 h-12 px-8 text-[15px]" type="submit"><span class="material-symbols-outlined">send</span>{{ \App\Support\SiteTexts::t('contact.form.submit') }}</button>
          </form>
          <div class="flex flex-col gap-6 lg:col-span-5">
            <div class="map-card reveal">
@if (($__emb = \App\Support\SiteTexts::mapEmbed()) !== '')
              <iframe src="{{ $__emb }}" title="{{ \App\Support\SiteTexts::t('contact.map.title') }}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-popups" style="position:relative;z-index:1;display:block;width:100%;height:100%;border:0"></iframe>
@else
              <img src="{{ \App\Support\SiteTexts::mapImage() }}" alt="{{ \App\Support\SiteTexts::t('contact.map.alt') }}" loading="lazy">
              <div class="map-pin" aria-hidden="true"><span class="material-symbols-outlined fill">location_on</span></div>
@endif
              <div class="map-info"{!! $__emb !== '' ? ' style="z-index:2"' : '' !!}>
                <div>
                  <p class="text-[16px] font-bold text-primary">{{ \App\Support\SiteTexts::t('contact.map.title') }}</p>
                  <p class="text-[12.5px] text-on-variant">{{ \App\Support\SiteTexts::t('contact.map.sub') }}</p>
                </div>
                <a class="btn btn-gold h-10 shrink-0 px-4 text-[13px]" href="{{ \App\Support\SiteTexts::t('contact.map.link') }}" target="_blank" rel="noopener"><span class="material-symbols-outlined text-[18px]">directions</span>{{ \App\Support\SiteTexts::t('contact.map.btn_home') }}</a>
              </div>
            </div>
            <div class="form-card reveal !p-6">
              <h3 class="text-[18px] font-bold text-primary">{{ \App\Support\SiteTexts::t('contact.points.title') }}</h3>
              <div class="mt-4 grid grid-cols-2 gap-3 text-[14px] text-on-variant">
@foreach(\App\Support\SiteSettings::fieldPoints() as $__fp)
                <p class="field-point">{{ $__fp }}</p>
@endforeach
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
