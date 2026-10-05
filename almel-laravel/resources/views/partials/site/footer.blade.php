@php $__fi = \App\Support\SiteContent::info(); $__pp = \App\Support\SiteContent::publishedPages(['privacy', 'governance']); $__fm = \App\Support\SiteSettings::footerMenu(false); $__soc = \App\Support\SiteSettings::socials(); $__nl = \App\Support\SiteSettings::newsletter(); @endphp
<footer class="site-footer relative isolate overflow-hidden text-white">
    <img class="footer-bg" src="{{ asset('assets/site/img/footer-hardship.jpg') }}" alt="" aria-hidden="true" loading="lazy">
    <div class="footer-shade" aria-hidden="true"></div>
    <div class="relative mx-auto grid max-w-page gap-10 px-5 pb-12 pt-20 md:grid-cols-2 md:px-8 lg:grid-cols-12">
      <div class="lg:col-span-4">
        <div class="flex items-center gap-3">
          <span class="brand-mark has-logo"><img src="{{ \App\Support\SiteSettings::logoUrl() }}" alt="شعار الجمعية" width="52" height="52"></span>
          <p class="text-[20px] font-bold">جمعية الشمال للتنمية والتطوير المجتمعي</p>
        </div>
        <p class="mt-5 max-w-sm text-[15px] leading-[1.9] text-primary-soft">مؤسسة إنسانية تعنى بإغاثة أهل غزة: برامج إغاثية وإنشائية وتنموية وصحية وفق أعلى معايير التوثيق.</p>
        @if($__fi['license'])<p class="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12.5px] text-primary-soft"><span class="material-symbols-outlined text-[16px] text-gold-light">verified</span>ترخيص رقم: {{ $__fi['license'] }}</p>@endif
@if($__soc)
        <div class="footer-social" role="list" aria-label="حسابات الجمعية على مواقع التواصل">
@foreach($__soc as $__s)
          <a role="listitem" href="{{ $__s['url'] }}" target="_blank" rel="noopener noreferrer" aria-label="{{ $__s['label'] }}" title="{{ $__s['label'] }}">{!! preg_replace('/\s*\n\s*/', '', view('partials.site.social-icon', ['k' => $__s['key']])->render()) !!}</a>
@endforeach
        </div>
@endif
      </div>
@if($__fm && $__fm['columns'])
      <div class="lg:col-span-2">
@foreach($__fm['columns'] as $__col)
        <h3 class="footer-h{{ $loop->first ? '' : ' mt-8' }}">{{ $__col['title'] }}</h3>
        <ul class="footer-links">
@foreach($__col['links'] as $__l)
          <li><a href="{{ $__l['href'] }}"@if($__l['newTab']) target="_blank" rel="noopener"@endif>{{ $__l['label'] }}</a></li>
@endforeach
        </ul>
@endforeach
      </div>
@else
      <div class="lg:col-span-2">
        <h3 class="footer-h">روابط سريعة</h3>
        <ul class="footer-links">
          <li><a href="{{ route('about') }}#vision">الرؤية والرسالة</a></li>
          <li><a href="{{ route('projects.show', 'development') }}">التنمية المجتمعية</a></li>
          <li><a href="{{ route('home') }}#activities">تقارير إغاثة القطاع</a></li>
          <li><a href="{{ route('news.index') }}">المركز الإعلامي</a></li>
          <li><a href="{{ route('gallery') }}">معرض الصور</a></li>
          <li><a href="{{ route('home') }}#faq">الأسئلة الشائعة</a></li>
          <li><a href="{{ route('contact') }}">تواصل معنا</a></li>
        </ul>
      </div>
@endif
      <div class="lg:col-span-3">
        <h3 class="footer-h">التواصل</h3>
        <p class="text-[15px] leading-[2] text-primary-soft">@if($__fi['address']){{ $__fi['address'] }}<br>@endif @if($__fi['phone'])<span dir="ltr">{{ $__fi['phone'] }}</span><br>@endif @if($__fi['email']){{ $__fi['email'] }}@endif</p>
      </div>
      <div class="lg:col-span-3">
        <h3 class="footer-h">{{ $__nl['title'] }}</h3>
        <p class="text-[14px] leading-[1.8] text-primary-soft">{{ $__nl['text'] }}</p>
        <form id="news-form" class="newsletter mt-4" method="post" action="{{ route('newsletter.store') }}" data-live="1" novalidate>
          @csrf
          <div style="position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none" aria-hidden="true"><label>لا تملأ هذا الحقل<input type="text" name="company_site" tabindex="-1" autocomplete="off"></label></div>
          <input type="email" name="email" required maxlength="255" placeholder="أدخل بريدك الإلكتروني" aria-label="أدخل بريدك الإلكتروني" autocomplete="email">
          <button class="btn btn-gold h-11 px-4 text-[13px]" type="submit">تأكيد الاشتراك</button>
        </form>
        @if (session('newsletter'))<p class="mt-2 text-[13px] text-gold-light" role="status">{{ session('newsletter') }}</p>@endif
      </div>
    </div>
    <div class="relative border-t border-white/10">
      <div class="mx-auto flex max-w-page flex-col items-center justify-between gap-3 px-5 pb-24 pt-6 text-[13px] text-primary-soft md:flex-row md:px-8 md:pb-6 md:pe-60">
        <p>جميع الحقوق محفوظة © 2026 جمعية الشمال للتنمية والتطوير المجتمعي</p>
@if($__fm && $__fm['bottom'])
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-2">@foreach($__fm['bottom'] as $__l)<a class="hover:text-white" href="{{ $__l['href'] }}"@if($__l['newTab']) target="_blank" rel="noopener"@endif>{{ $__l['label'] }}</a>@endforeach</div>
@else
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-2"><a class="hover:text-white" href="{{ in_array('privacy', $__pp) ? url('/privacy') : '#' }}">سياسة الخصوصية</a><a class="hover:text-white" href="{{ in_array('governance', $__pp) ? url('/governance') : '#' }}">لوائح الحوكمة</a><a class="hover:text-white" href="{{ route('admin.login') }}">بوابة الموظفين</a></div>
@endif
      </div>
    </div>
  </footer>

  <a class="fab" href="https://wa.me/{{ $__fi['wa'] }}" target="_blank" rel="noopener" aria-label="خدمة إغاثة غزة الفورية">
    <span class="material-symbols-outlined">support_agent</span>
    <span class="hidden sm:inline">خدمة إغاثة غزة الفورية</span>
  </a>

  <div id="toast" class="toast" role="status" aria-live="polite">تم استلام رسالتك بنجاح</div>
@pushOnce('scripts')
<script src="{{ asset('assets/site/js/site-live.js') }}"></script>
@endPushOnce
