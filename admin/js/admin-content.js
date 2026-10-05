/* =========================================================================
   إدارة محتوى الواجهة — stories / activities / partners / faq / appeal / impact
   One shared script for the six content pages (data-page on <body>):
     stories.html · activities.html · partners.html · faq.html · appeal.html · impact.html
   • List per section: search, visibility filter, add / edit (drawer), delete (confirm + undo),
     show / hide switch, reorder (drag & drop via AdminDnD, arrows, keyboard).
   • appeal.html also has the urgent-appeal card form and the announcements bar.
   • Seed data = the real content currently in ../index.html (and js/main.js for stories / map).
   • Persistence (localStorage, instant save):
       almel-admin-stories · almel-admin-activities · almel-admin-partners · almel-admin-faq
       almel-admin-announcements · almel-admin-announcements-bar · almel-admin-appeal · almel-admin-impact
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- reference lists ---------- */
  var ANCHORS = [['#hero', 'الرئيسية'], ['#about', 'من نحن'], ['#projects', 'المشاريع'], ['#stories', 'قصص من الميدان'], ['#activities', 'الأنشطة الميدانية'], ['#appeal', 'نداء الإغاثة'], ['#impact-map', 'خريطة الأثر'], ['#news', 'الأخبار'], ['#partners', 'الشركاء'], ['#gallery', 'معرض الصور'], ['#contact', 'التواصل'], ['#faq', 'الأسئلة الشائعة']];
  var ICONS = [['shopping_basket', 'سلة غذائية'], ['diversity_3', 'فرق التطوع'], ['menu_book', 'التعليم'], ['medical_services', 'الرعاية الطبية'], ['water_drop', 'المياه'], ['camping', 'الخيام'], ['restaurant', 'الوجبات'], ['groups', 'المستفيدون'], ['group', 'مجموعة'], ['school', 'المدرسة'], ['child_care', 'الأطفال'], ['public', 'دولي'], ['nutrition', 'الأمن الغذائي'], ['emergency', 'إغاثة عاجلة'], ['shield', 'حماية'], ['handshake', 'شراكة'], ['favorite', 'عطاء'], ['local_shipping', 'قوافل'], ['volunteer_activism', 'تبرع'], ['health_and_safety', 'السلامة الصحية']];
  var IMAGES = ['img/gallery-children.jpg', 'img/project-relief.jpg', 'img/project-orphan.jpg', 'img/project-empower.jpg', 'img/project-water.jpg', 'img/project-parallax.jpg', 'img/activity-winter.jpg', 'img/activity-medical.jpg', 'img/activity-graduate.jpg', 'img/gallery-convoy.jpg'];
  var LOGOS = ['img/partners/unicef.svg', 'img/partners/unitednations.svg', 'img/partners/wfp.png', 'img/partners/who.svg', 'img/partners/crescent.svg', 'img/partners/icrc.svg'];
  var BADGES = [['forest', 'أخضر داكن'], ['gold', 'ذهبي'], ['mid', 'أخضر متوسط']];

  /* ---------- seed data (copied from ../index.html and ../js/main.js) ---------- */
  var SEED = {
    stories: [
      { name: 'أم محمد', location: 'نازحة من جباليا إلى دير البلح', tag: 'السلال الغذائية', icon: 'shopping_basket', image: 'img/gallery-children.jpg', alt: 'أطفال يبتسمون في أحد مراكز الإيواء', quote: 'وصلتنا السلة في يوم لم يكن في الخيمة ما يكفي لعشاء الأطفال. شعرت أن أحداً ما زال يتذكرنا.' },
      { name: 'أبو يوسف', location: 'متطوع توزيع — خان يونس', tag: 'فرق التطوع', icon: 'diversity_3', image: 'img/project-relief.jpg', alt: 'متطوعون يجهزون طرود المساعدات', quote: 'نبدأ قبل الفجر لتجهيز الطرود، وأجمل ما في يومنا أن نرى كل سلة تُسلَّم باليد وتوثَّق بالصورة.' },
      { name: 'سارة، 11 عاماً', location: 'مدرسة إيواء — مدينة غزة', tag: 'التعليم المؤقت', icon: 'menu_book', image: 'img/project-orphan.jpg', alt: 'كتب وأدوات مدرسية على طاولة', quote: 'صار عندنا صف في المدرسة التي نسكنها. أحب حصة القراءة، وأحلم أن أصبح معلّمة.' },
      { name: 'الممرضة ريم', location: 'نقطة طبية — رفح', tag: 'الرعاية الصحية', icon: 'medical_services', image: 'img/activity-medical.jpg', alt: 'كادر طبي في نقطة رعاية صحية', quote: 'الدواء الذي يصلنا يعني أن مريض السكري لن ينتظر أسبوعاً آخر. كل شحنة تصنع فرقاً حقيقياً.' }
    ],
    activities: [
      { badge: 'حملة دفء غزة', badgeTone: 'forest', image: 'img/activity-winter.jpg', alt: 'قافلة إغاثة شتوية', date: 'نوفمبر - ديسمبر 2024', place: 'مخيمات النزوح في رفح', title: 'توزيع 10,000 طرد شتوي وأغطية عازلة', desc: 'إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.', statIcon: 'group', stat: '45,200 مستفيد', linkLabel: 'تقرير الفيديو', link: '#gallery' },
      { badge: 'البرنامج الصحي في غزة', badgeTone: 'gold', image: 'img/activity-medical.jpg', alt: 'قافلة طبية ميدانية', date: 'أكتوبر 2024', place: 'دير البلح', title: 'تسيير 3 عيادات ميدانية وإجراء 320 تدخلاً', desc: 'عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.', statIcon: 'medical_services', stat: '8,400 كشف', linkLabel: 'تحميل التوثيق', link: '#contact' },
      { badge: 'تعليم النازحين', badgeTone: 'mid', image: 'img/activity-graduate.jpg', alt: 'تخريج دفعة تمكين مهني', date: 'سبتمبر 2024', place: 'خان يونس', title: 'افتتاح الخيمة التعليمية السادسة لأطفال غزة', desc: 'احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.', statIcon: 'school', stat: '210 طالب نازح', linkLabel: 'قصص النجاح', link: '#news' }
    ],
    partners: [
      { name: 'منظمة يونيسف', tag: 'شريك دولي', tagIcon: 'child_care', logo: 'img/partners/unicef.svg', desc: 'نتعاون مع اليونيسف لتوفير الحماية والتعليم الطارئ لأطفال غزة، ودعم برامج التغذية والمياه النظيفة.' },
      { name: 'الأمم المتحدة', tag: 'هيئة أممية', tagIcon: 'public', logo: 'img/partners/unitednations.svg', desc: 'بالتنسيق مع الأمم المتحدة نوثّق الاحتياجات الإنسانية وننسّق قوافل الإغاثة الداخلة إلى القطاع.' },
      { name: 'برنامج الغذاء العالمي', tag: 'أمن غذائي', tagIcon: 'nutrition', logo: 'img/partners/wfp.png', desc: 'نشارك برنامج الغذاء العالمي في توزيع السلال الغذائية والوجبات الجاهزة على العائلات النازحة.' },
      { name: 'منظمة الصحة العالمية', tag: 'رعاية صحية', tagIcon: 'medical_services', logo: 'img/partners/who.svg', desc: 'ندعم مع منظمة الصحة العالمية تشغيل النقاط الطبية الميدانية وتأمين الأدوية الأساسية.' },
      { name: 'الهلال الأحمر', tag: 'إغاثة عاجلة', tagIcon: 'emergency', logo: 'img/partners/crescent.svg', desc: 'نتكامل مع فرق الهلال الأحمر في الإخلاء الطبي وتوزيع الإغاثة العاجلة داخل غزة.' },
      { name: 'اللجنة الدولية للصليب الأحمر', tag: 'حماية إنسانية', tagIcon: 'shield', logo: 'img/partners/icrc.svg', desc: 'نتعاون مع اللجنة الدولية لتسهيل دخول المساعدات وحماية المدنيين وفق القانون الدولي الإنساني.' }
    ],
    faq: [
      { q: 'كيف أتأكد أن تبرعي يصل إلى غزة فعلاً؟', a: 'نعمل عبر فرق ميدانية وشركاء داخل القطاع، ونوثّق التوزيعات بالصور والتقارير الدورية التي ننشرها في المركز الإعلامي، ويمكنك طلب تقرير عن الحملة التي ساهمت فيها.' },
      { q: 'هل يمكنني إخراج زكاة مالي عبر الجمعية؟', a: 'نعم، يمكنك تحديد أن مساهمتك زكاة عند التبرع لتُصرف في مصارفها الشرعية للأسر المستحقة داخل القطاع.' },
      { q: 'هل أحصل على إيصال بتبرعي؟', a: 'يصلك إيصال بتبرعك عبر البريد الإلكتروني أو الرسائل بعد تأكيد العملية، ويمكنك طلب نسخة منه في أي وقت عبر فريق خدمة المتبرعين.' },
      { q: 'كيف تضمن الجمعية الشفافية في صرف التبرعات؟', a: 'نعتمد على توثيق كل توزيع بالصورة، ونشر تقارير دورية بالإنجاز والإنفاق، ومراجعة الحسابات من جهة تدقيق مستقلة.' },
      { q: 'هل يمكنني تخصيص تبرعي لمشروع أو محافظة بعينها؟', a: 'يمكنك اختيار المشروع (السلال الغذائية، الخيام، المياه، العيادات الميدانية) عند التواصل معنا، وسنبذل جهدنا لتوجيهه إلى المحافظة التي تحددها وفق الاحتياج والظروف الميدانية.' },
      { q: 'ما وسائل التبرع المتاحة؟', a: 'تواصل مع فريق خدمة المتبرعين عبر الهاتف أو البريد الإلكتروني أو واتساب، وسيزوّدك بوسائل التبرع المعتمدة المتاحة في بلدك.' },
      { q: 'كيف يمكنني التطوع مع الجمعية؟', a: 'أرسل لنا بياناتك ومجال خبرتك عبر نموذج التواصل، وسنتواصل معك عند توفر فرص تطوع ميدانية أو عن بُعد (تصميم، ترجمة، تنسيق حملات).' },
      { q: 'هل يمكنني دعم مشروع بشكل شهري؟', a: 'نعم، يمكنك الاشتراك في التبرع الشهري لدعم البرامج الإغاثية والإنشائية والتنموية والصحية، مع تقارير دورية عن أثر تبرعك.' }
    ],
    announcements: [
      { text: 'وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح', link: '#news' },
      { text: 'فتح باب التسجيل في برامج التمكين والتنمية المجتمعية لعام 2026', link: '#projects' },
      { text: 'حملة الشتاء: توزيع خيام وأغطية في خان يونس ورفح', link: '#activities' },
      { text: 'تشغيل نقطة مياه شرب إضافية في شمال القطاع', link: '#impact-map' },
      { text: 'تقرير الأثر الربعي متاح قريباً في المركز الإعلامي', link: '#news' }
    ],
    impact: [
      { id: 'north', name: 'شمال غزة', note: 'سلال غذائية وصهاريج مياه لمراكز الإيواء في جباليا وبيت لاهيا وبيت حانون.', beneficiaries: 38000, meals: 52000, tents: 900, water: 14 },
      { id: 'gaza', name: 'غزة', note: 'مطابخ ميدانية وتعليم مؤقت للأطفال في مدارس الإيواء بمدينة غزة.', beneficiaries: 42000, meals: 61000, tents: 1100, water: 18 },
      { id: 'deir', name: 'دير البلح', note: 'استقبال العائلات النازحة وتوزيع الخيام والأغطية في مخيمات المحافظة الوسطى.', beneficiaries: 30000, meals: 44000, tents: 1400, water: 12 },
      { id: 'khan', name: 'خان يونس', note: 'نقاط طبية متنقلة وتوزيع مياه الشرب في مناطق النزوح بخان يونس.', beneficiaries: 40000, meals: 57000, tents: 1700, water: 16 },
      { id: 'rafah', name: 'رفح', note: 'دعم الأسر النازحة بالخيام والسلال الغذائية في المناطق الجنوبية.', beneficiaries: 30000, meals: 39000, tents: 1300, water: 10 }
    ],
    appeal: {
      visible: true, flag: 'نداء إغاثة عاجل', chip: 'قوافل يومية من الشمال إلى رفح', kicker: 'حملة السلال والخيام والمياه',
      title1: 'خبز اليوم يصل للخيمة..', title2: 'وماؤك لا ينقطع عن النازحين',
      desc: 'قوافل الطحين والخيام وصهاريج المياه تتحرك داخل القطاع كل يوم. مساهمتك تتحوّل إلى وجبة ساخنة، خيمة عازلة، وصهريج شرب لعائلات نزحت من بيوتها.',
      cta1: 'ساهم في إغاثة غزة الآن', cta1Link: '#contact', cta2: 'مبادرات الإغاثة المعتمدة', cta2Link: '#projects', image: 'img/gallery-convoy.jpg'
    },
    annBar: { visible: true, label: 'آخر الإعلانات' }
  };

  /* ---------- field & section configs ---------- */
  function opts(arr, group) { var r = arr.map(function (a) { return { v: a[0], l: a[1] }; }); if (group) r.group = group; return r; }
  var F = {
    stories: [
      { k: 'name', label: 'اسم صاحب القصة', type: 'text', req: true, max: 40, half: true },
      { k: 'location', label: 'الموقع / الصفة', type: 'text', req: true, max: 70, half: true },
      { k: 'tag', label: 'وسم القصة', type: 'text', req: true, max: 30, half: true },
      { k: 'icon', label: 'أيقونة الوسم', type: 'select', options: opts(ICONS, 'icon'), half: true },
      { k: 'quote', label: 'نص الشهادة', type: 'textarea', req: true, max: 260, rows: 4 },
      { k: 'image', label: 'الصورة', type: 'image', req: true, list: IMAGES, hint: 'مسار الصورة داخل الموقع، مثل img/gallery-children.jpg' },
      { k: 'alt', label: 'النص البديل للصورة', type: 'text', opt: true, max: 125 }
    ],
    activities: [
      { k: 'title', label: 'عنوان النشاط', type: 'text', req: true, max: 90 },
      { k: 'desc', label: 'وصف مختصر', type: 'textarea', req: true, max: 200, rows: 3 },
      { k: 'badge', label: 'وسم الصورة', type: 'text', req: true, max: 40, half: true },
      { k: 'badgeTone', label: 'لون الوسم', type: 'select', options: opts(BADGES, 'badge_tone'), half: true },
      { k: 'date', label: 'التاريخ', type: 'text', req: true, max: 40, half: true },
      { k: 'place', label: 'المكان', type: 'text', req: true, max: 50, half: true },
      { k: 'stat', label: 'المؤشر (مثال: 45,200 مستفيد)', type: 'text', req: true, max: 40, half: true },
      { k: 'statIcon', label: 'أيقونة المؤشر', type: 'select', options: opts(ICONS, 'icon'), half: true },
      { k: 'linkLabel', label: 'نص الرابط', type: 'text', req: true, max: 30, half: true },
      { k: 'link', label: 'وجهة الرابط', type: 'select', options: opts(ANCHORS, 'section_anchor'), half: true },
      { k: 'image', label: 'الصورة', type: 'image', req: true, list: IMAGES, hint: 'مسار الصورة داخل الموقع، مثل img/activity-winter.jpg' },
      { k: 'alt', label: 'النص البديل للصورة', type: 'text', opt: true, max: 125 }
    ],
    partners: [
      { k: 'name', label: 'اسم الشريك', type: 'text', req: true, max: 60 },
      { k: 'tag', label: 'تصنيف الشراكة', type: 'text', req: true, max: 30, half: true },
      { k: 'tagIcon', label: 'أيقونة التصنيف', type: 'select', options: opts(ICONS, 'icon'), half: true },
      { k: 'desc', label: 'وصف الشراكة', type: 'textarea', req: true, max: 220, rows: 3 },
      { k: 'logo', label: 'الشعار', type: 'image', req: true, list: LOGOS, hint: 'مسار الشعار داخل الموقع، مثل img/partners/unicef.svg' }
    ],
    faq: [
      { k: 'q', label: 'السؤال', type: 'text', req: true, max: 120 },
      { k: 'a', label: 'الإجابة', type: 'textarea', req: true, max: 420, rows: 6 }
    ],
    announcements: [
      { k: 'text', label: 'نص الإعلان', type: 'textarea', req: true, max: 140, rows: 2 },
      { k: 'link', label: 'القسم الذي يفتحه الإعلان', type: 'select', options: opts(ANCHORS, 'section_anchor') }
    ],
    impact: [
      { k: 'name', label: 'اسم المحافظة', type: 'text', req: true, max: 40 },
      { k: 'note', label: 'وصف مختصر للجهود', type: 'textarea', req: true, max: 170, rows: 3 },
      { k: 'beneficiaries', label: 'المستفيدون', type: 'number', req: true, half: true },
      { k: 'meals', label: 'الوجبات', type: 'number', req: true, half: true },
      { k: 'tents', label: 'الخيام', type: 'number', req: true, half: true },
      { k: 'water', label: 'نقاط المياه', type: 'number', req: true, half: true }
    ],
    appeal: [
      { k: 'flag', label: 'وسم الصورة', type: 'text', req: true, max: 30, half: true },
      { k: 'chip', label: 'الشارة العلوية', type: 'text', opt: true, max: 50, half: true },
      { k: 'kicker', label: 'العنوان الفرعي', type: 'text', req: true, max: 60 },
      { k: 'title1', label: 'العنوان — السطر الأول', type: 'text', req: true, max: 60 },
      { k: 'title2', label: 'العنوان — السطر الثاني (مميّز)', type: 'text', req: true, max: 60 },
      { k: 'desc', label: 'نص النداء', type: 'textarea', req: true, max: 300, rows: 4 },
      { k: 'cta1', label: 'نص الزر الرئيسي', type: 'text', req: true, max: 40, half: true },
      { k: 'cta1Link', label: 'وجهة الزر الرئيسي', type: 'select', options: opts(ANCHORS, 'section_anchor'), half: true },
      { k: 'cta2', label: 'نص الزر الثانوي', type: 'text', req: true, max: 40, half: true },
      { k: 'cta2Link', label: 'وجهة الزر الثانوي', type: 'select', options: opts(ANCHORS, 'section_anchor'), half: true },
      { k: 'image', label: 'صورة النداء', type: 'image', req: true, list: IMAGES, hint: 'مسار الصورة داخل الموقع، مثل img/gallery-convoy.jpg' }
    ]
  };

  var fmtN = function (n) { return Number(n || 0).toLocaleString('en-US'); };
  var cut = function (s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  var sumOf = function (a, k) { return a.reduce(function (x, y) { return x + (+y[k] || 0); }, 0); };
  function imgSrc(v) { v = String(v || ''); return /^(data:|https?:|\/|\.\.\/)/.test(v) ? v : '../' + v; }
  var anchorLabel = function (h) { if (window.AdminConstants) { var al = window.AdminConstants.label('section_anchor', h); if (al) return al; } for (var i = 0; i < ANCHORS.length; i++) if (ANCHORS[i][0] === h) return ANCHORS[i][1]; return h; };

  var CFG = {
    stories: { prefix: 'st', key: 'almel-admin-stories', idp: 's', seed: SEED.stories, fields: F.stories, the: 'القصة', one: 'قصة', many: 'قصص', site: 'index.html#stories',
      title: function (i) { return i.name; }, sub: function (i) { return i.location + ' — ' + cut(i.quote, 90); }, thumb: 'image', thumbField: 'image', tag: function (i) { return { icon: i.icon, text: i.tag }; },
      stats: function (a) { var v = a.filter(function (x) { return x.visible; }).length; return [['إجمالي القصص', a.length], ['ظاهرة في الموقع', v], ['مخفية', a.length - v], ['بصور مضافة', a.filter(function (x) { return x.image; }).length]]; },
      addLabel: 'قصة جديدة', emptyText: 'أضف قصة جديدة لتظهر في شريط «قصص من الميدان».' },
    activities: { prefix: 'ac', key: 'almel-admin-activities', idp: 'a', seed: SEED.activities, fields: F.activities, the: 'النشاط', one: 'نشاط', many: 'أنشطة', site: 'index.html#activities',
      title: function (i) { return i.title; }, sub: function (i) { return i.date + ' • ' + i.place + ' — ' + i.stat; }, thumb: 'image', thumbField: 'image', tag: function (i) { return { icon: 'sell', text: i.badge }; },
      stats: function (a) { var v = a.filter(function (x) { return x.visible; }).length; return [['إجمالي الأنشطة', a.length], ['ظاهرة في الموقع', v], ['مخفية', a.length - v], ['أماكن مختلفة', uniq(a, 'place')]]; },
      addLabel: 'نشاط جديد', emptyText: 'أضف نشاطاً ميدانياً موثّقاً ليظهر في قسم «الأنشطة الميدانية».' },
    partners: { prefix: 'pt', key: 'almel-admin-partners', idp: 'p', seed: SEED.partners, fields: F.partners, the: 'الشريك', one: 'شريك', many: 'شركاء', site: 'index.html#partners',
      title: function (i) { return i.name; }, sub: function (i) { return cut(i.desc, 110); }, thumb: 'logo', thumbField: 'logo', tag: function (i) { return { icon: i.tagIcon, text: i.tag }; },
      stats: function (a) { var v = a.filter(function (x) { return x.visible; }).length; return [['إجمالي الشركاء', a.length], ['ظاهرون في الموقع', v], ['مخفيون', a.length - v], ['تصنيفات الشراكة', uniq(a, 'tag')]]; },
      addLabel: 'شريك جديد', emptyText: 'أضف شريكاً جديداً ليظهر في قسم «الشركاء».' },
    faq: { prefix: 'fq', key: 'almel-admin-faq', idp: 'q', seed: SEED.faq, fields: F.faq, the: 'السؤال', one: 'سؤال', many: 'أسئلة', site: 'index.html#faq',
      title: function (i) { return i.q; }, sub: function (i) { return cut(i.a, 120); }, thumb: 'icon', icon: 'help', tag: null,
      stats: function (a) { var v = a.filter(function (x) { return x.visible; }).length; return [['إجمالي الأسئلة', a.length], ['ظاهرة في الموقع', v], ['مخفية', a.length - v], ['متوسط طول الإجابة', a.length ? Math.round(a.reduce(function (s, x) { return s + String(x.a).length; }, 0) / a.length) + ' حرفاً' : '—']]; },
      addLabel: 'سؤال جديد', emptyText: 'أضف سؤالاً وإجابة ليظهرا في قسم «الأسئلة الشائعة».' },
    announcements: { prefix: 'an', key: 'almel-admin-announcements', idp: 'n', seed: SEED.announcements, fields: F.announcements, the: 'الإعلان', one: 'إعلان', many: 'إعلانات', site: 'index.html#announcements',
      title: function (i) { return i.text; }, sub: function (i) { return 'يفتح قسم: ' + anchorLabel(i.link); }, thumb: 'icon', icon: 'campaign', tag: null,
      stats: function (a) { var v = a.filter(function (x) { return x.visible; }).length; return [['إجمالي الإعلانات', a.length], ['ظاهرة في الشريط', v], ['مخفية', a.length - v], ['أقسام مرتبطة', uniq(a, 'link')]]; },
      addLabel: 'إعلان جديد', emptyText: 'أضف إعلاناً ليظهر في شريط «آخر الإعلانات».' },
    impact: { prefix: 'im', key: 'almel-admin-impact', idp: 'g', seed: SEED.impact, fields: F.impact, fixed: true, the: 'المحافظة', one: 'محافظة', many: 'محافظات', site: 'index.html#impact-map',
      title: function (i) { return i.name; }, sub: function (i) { return cut(i.note, 100); }, thumb: 'icon', icon: 'location_on', tag: function (i) { return { icon: 'groups', text: fmtN(i.beneficiaries) + ' مستفيد' }; },
      stats: function (a) { return [['إجمالي المستفيدين', fmtN(sumOf(a, 'beneficiaries'))], ['إجمالي الوجبات', fmtN(sumOf(a, 'meals'))], ['إجمالي الخيام', fmtN(sumOf(a, 'tents'))], ['نقاط المياه', fmtN(sumOf(a, 'water'))]]; },
      emptyText: '' }
  };
  function uniq(a, k) { var m = {}; a.forEach(function (x) { m[x[k]] = 1; }); return Object.keys(m).length; }

  /* ---------- start ---------- */
  function start() {
    var UI = window.AdminUI, DnD = window.AdminDnD, D = window.ADMIN_DATA || {};
    if (!UI || !DnD) return;
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var esc = UI.esc, icon = UI.icon, toast = UI.toast, normalize = UI.normalize;
    var ORG = (D.org && D.org.name) || 'جمعية الشمال للتنمية والتطوير المجتمعي';

    function read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } }
    function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
    function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    function flashSaved(el, text) {
      if (!el) return;
      el.innerHTML = icon('cloud_done') + '<span>' + esc(text || 'حُفظ الآن') + '</span>';
      el.classList.remove('is-pulse'); void el.offsetWidth; el.classList.add('is-pulse');
    }
    var live = document.createElement('p'); live.className = 'sr-only'; live.setAttribute('aria-live', 'assertive'); document.getElementById('main').appendChild(live);
    function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }
    function toastUndo(title, o, undo) {
      var t = toast(title, o);
      if (!undo || !t) return t;
      var b = document.createElement('button'); b.type = 'button'; b.className = 't-undo'; b.textContent = 'تراجع';
      b.addEventListener('click', function () { undo(); var c = t.querySelector('.t-close'); if (c) c.click(); });
      var body = t.querySelector('.t-body'); if (body) body.appendChild(b);
      return t;
    }

    /* ---------- form fields ---------- */
    function optionList(f, v) {
      var o = (f.options.group && window.AdminConstants) ? window.AdminConstants.pairs(f.options.group, v).map(function (p) { return { v: p[0], l: p[1] }; }) : f.options.slice();
      if (v && !o.some(function (x) { return x.v === v; })) o.push({ v: v, l: v });
      return o.map(function (x) { return '<option value="' + esc(x.v) + '"' + (x.v === v ? ' selected' : '') + '>' + esc(x.l) + '</option>'; }).join('');
    }
    function fieldHTML(f, v, pre) {
      var id = pre + '-' + f.k, val = v == null ? '' : v, len = norm(val).length;
      var counter = f.max && (f.type === 'text' || f.type === 'textarea') ? '<span class="counter" data-counter="' + id + '">' + len + ' / ' + f.max + '</span>' : '';
      var h = '<div class="field"><label class="label" for="' + id + '"><span>' + esc(f.label) + (f.req ? ' <span class="req" aria-hidden="true">*</span>' : f.opt ? ' <span class="opt">اختياري</span>' : '') + '</span>' + counter + '</label>';
      var d = ' id="' + id + '" data-k="' + f.k + '" aria-describedby="' + id + '-err"';
      if (f.type === 'textarea') h += '<textarea class="textarea" rows="' + (f.rows || 3) + '"' + d + (f.max ? ' maxlength="' + f.max + '"' : '') + ' style="min-height:0">' + esc(val) + '</textarea>';
      else if (f.type === 'select') h += '<select class="select"' + d + '>' + optionList(f, val) + '</select>';
      else if (f.type === 'number') h += '<input class="input num" type="number" min="0" step="1" inputmode="numeric" dir="ltr"' + d + ' value="' + esc(val) + '">';
      else if (f.type === 'image') h += '<div class="ct-imgfield"><input class="input" dir="ltr" list="' + id + '-dl"' + d + ' value="' + esc(val) + '" placeholder="img/example.jpg"><datalist id="' + id + '-dl">' + f.list.map(function (p) { return '<option value="' + esc(p) + '"></option>'; }).join('') + '</datalist><span class="ct-imgprev" aria-hidden="true"><img alt="" src="' + esc(val ? imgSrc(val) : '') + '"' + (val ? '' : ' hidden') + '></span></div>';
      else h += '<input class="input"' + d + (f.max ? ' maxlength="' + f.max + '"' : '') + ' value="' + esc(val) + '">';
      if (f.hint) h += '<p class="hint">' + esc(f.hint) + '</p>';
      return h + '<p class="error" id="' + id + '-err" hidden>' + icon('error') + '<span>هذا الحقل مطلوب.</span></p></div>';
    }
    function fieldsHTML(fields, vals, pre) {
      var h = '', i = 0;
      while (i < fields.length) {
        var f = fields[i];
        if (f.half && fields[i + 1] && fields[i + 1].half) { h += '<div class="field-row">' + fieldHTML(f, vals[f.k], pre) + fieldHTML(fields[i + 1], vals[fields[i + 1].k], pre) + '</div>'; i += 2; }
        else { h += fieldHTML(f, vals[f.k], pre); i++; }
      }
      return h;
    }
    function readFields(fields, root, pre) {
      var o = {};
      fields.forEach(function (f) {
        var el = $('#' + pre + '-' + f.k, root), v = el ? el.value : '';
        o[f.k] = f.type === 'number' ? (v === '' ? '' : Math.max(0, Math.round(+v))) : (f.type === 'textarea' ? String(v).replace(/\s*\n\s*/g, ' ').trim() : norm(v));
      });
      return o;
    }
    function validate(fields, root, pre) {
      var bad = [];
      fields.forEach(function (f) {
        var el = $('#' + pre + '-' + f.k, root), err = $('#' + pre + '-' + f.k + '-err', root), v = el.value, ok = true, msg = 'هذا الحقل مطلوب.';
        if (f.req && !norm(v)) ok = false;
        if (f.type === 'number' && v !== '' && !(+v >= 0)) { ok = false; msg = 'أدخل رقماً صحيحاً لا يقل عن صفر.'; }
        el.classList.toggle('is-invalid', !ok); if (ok) el.removeAttribute('aria-invalid'); else el.setAttribute('aria-invalid', 'true');
        if (err) { err.hidden = ok; $('span:last-child', err).textContent = msg; }
        if (!ok) bad.push(el);
      });
      return bad;
    }
    function wireFields(fields, root, pre, onChange) {
      fields.forEach(function (f) {
        var el = $('#' + pre + '-' + f.k, root); if (!el) return;
        el.addEventListener('input', function () {
          if (f.type === 'textarea' && /\n/.test(el.value)) el.value = el.value.replace(/\n+/g, ' ');
          var c = $('[data-counter="' + el.id + '"]', root);
          if (c) { var n = norm(el.value).length; c.textContent = n + ' / ' + f.max; c.classList.toggle('over', n >= f.max); }
          if (f.type === 'image') { var im = $('.ct-imgprev img', el.parentNode); if (im) { im.hidden = !norm(el.value); im.src = norm(el.value) ? imgSrc(norm(el.value)) : ''; } }
          if (norm(el.value)) { el.classList.remove('is-invalid'); el.removeAttribute('aria-invalid'); var er = $('#' + el.id + '-err', root); if (er) er.hidden = true; }
          if (onChange) onChange();
        });
        el.addEventListener('change', function () { if (onChange) onChange(); });
      });
    }

    /* ---------- list engine ---------- */
    function List(cfg) {
      var p = cfg.prefix, list = document.getElementById(p + '-list');
      if (!list) return null;
      var drawer = document.getElementById(p + '-drawer');
      var st = { q: '', f: 'all' }, editing = null, flashId = null, dragId = null;

      function seedItems() { return cfg.seed.map(function (o, i) { return Object.assign({ id: o.id || cfg.idp + (i + 1), visible: true }, clone(o)); }); }
      function load() {
        var saved = read(cfg.key);
        if (!Array.isArray(saved)) return seedItems();
        var out = saved.filter(function (x) { return x && typeof x === 'object'; }).map(function (x, i) {
          var o = { id: String(x.id || cfg.idp + 'x' + i), visible: x.visible !== false };
          cfg.fields.forEach(function (f) { o[f.k] = x[f.k] == null ? '' : x[f.k]; });
          return o;
        });
        if (cfg.fixed) seedItems().forEach(function (s) { if (!out.some(function (o) { return o.id === s.id; })) out.push(s); });
        return out;
      }
      var items = load();
      function save() { write(cfg.key, items); flashSaved(document.getElementById(p + '-saved'), 'حُفظت التغييرات الآن'); }
      function byId(id) { for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i]; return null; }
      function filtering() { return !!(normalize(st.q) || st.f !== 'all'); }
      function matches(it) {
        if (st.f === 'visible' && !it.visible) return false;
        if (st.f === 'hidden' && it.visible) return false;
        var q = normalize(st.q); if (!q) return true;
        return normalize(cfg.fields.map(function (f) { return it[f.k]; }).join(' ')).indexOf(q) > -1;
      }

      function thumbHTML(it) {
        if (cfg.thumb === 'image') return '<span class="ct-thumb" aria-hidden="true"><img src="' + esc(imgSrc(it[cfg.thumbField])) + '" alt="" loading="lazy"></span>';
        if (cfg.thumb === 'logo') return '<span class="ct-thumb is-logo" aria-hidden="true"><img src="' + esc(imgSrc(it[cfg.thumbField])) + '" alt="" loading="lazy"></span>';
        return '<span class="sec-ico tone-light" aria-hidden="true">' + icon(cfg.icon) + '</span>';
      }
      function rowHTML(it, filtered) {
        var pos = items.indexOf(it), n = items.length, off = filtering();
        var tg = cfg.tag ? cfg.tag(it) : null, ttl = cfg.title(it);
        return '<li data-id="' + esc(it.id) + '" data-depth="0" class="sec-row ct-row' + (it.visible ? '' : ' is-off') + (flashId === it.id ? ' is-dropped' : '') + '">' +
          '<div class="sec-item">' +
          '<button type="button" class="dnd-handle" aria-label="سحب لإعادة ترتيب ' + esc(cfg.the) + ' «' + esc(cut(ttl, 40)) + '»، الموضع ' + (pos + 1) + ' من ' + n + '"' + (off ? ' aria-disabled="true" disabled title="أزل البحث أو التصفية لإعادة الترتيب"' : '') + '>' + icon('drag_indicator') + '</button>' +
          '<span class="sec-num" aria-hidden="true">' + (pos + 1) + '</span>' + thumbHTML(it) +
          '<div class="sec-text"><strong>' + esc(cut(ttl, 90)) + '</strong><span class="sec-note">' + esc(cfg.sub(it)) + '</span></div>' +
          (tg ? '<span class="tag ct-tag">' + icon(tg.icon || 'sell') + esc(cut(tg.text, 28)) + '</span>' : '') +
          '<span class="sec-flag" aria-hidden="true">' + (it.visible ? '' : icon('visibility_off') + 'مخفي') + '</span>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-edit="' + esc(it.id) + '" aria-label="تعديل ' + esc(cfg.the) + ' «' + esc(cut(ttl, 40)) + '»">' + icon('edit') + '<span>تعديل</span></button>' +
          '<button type="button" class="switch" role="switch" data-vis="' + esc(it.id) + '" aria-checked="' + it.visible + '" aria-label="إظهار ' + esc(cfg.the) + ' «' + esc(cut(ttl, 40)) + '» في الموقع"></button>' +
          '<div class="sec-move">' +
          '<button type="button" class="icon-btn sm" data-up="' + esc(it.id) + '" aria-label="تحريك لأعلى"' + (off || pos === 0 ? ' disabled' : '') + '>' + icon('arrow_upward') + '</button>' +
          '<button type="button" class="icon-btn sm" data-down="' + esc(it.id) + '" aria-label="تحريك لأسفل"' + (off || pos === n - 1 ? ' disabled' : '') + '>' + icon('arrow_downward') + '</button>' +
          '</div>' +
          (cfg.fixed ? '' : '<button type="button" class="icon-btn sm ct-del" data-del="' + esc(it.id) + '" aria-label="حذف ' + esc(cfg.the) + ' «' + esc(cut(ttl, 40)) + '»" title="حذف">' + icon('delete') + '</button>') +
          '</div></li>';
      }
      function renderStats() {
        var el = document.getElementById(p + '-stats'); if (!el) return;
        el.innerHTML = cfg.stats(items).map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd><b>' + esc(s[1]) + '</b></dd></div>'; }).join('');
      }
      function render() {
        var shown = items.filter(matches), cnt = document.getElementById(p + '-count');
        if (cnt) cnt.textContent = shown.length + ' من ' + items.length;
        renderStats();
        if (!shown.length) {
          list.classList.remove('sec-list');
          if (!items.length) {
            list.innerHTML = '<li class="ct-empty">' + UI.emptyState('inbox', 'لا توجد عناصر بعد', cfg.fixed ? 'استعد المحتوى الافتراضي لعرض المحافظات.' : cfg.emptyText, cfg.fixed ? '' : '<button type="button" class="btn btn-primary" data-empty-add>' + icon('add') + esc(cfg.addLabel) + '</button>') + '</li>';
            var ea = $('[data-empty-add]', list); if (ea) ea.addEventListener('click', function () { openDrawer(null); });
          } else {
            list.innerHTML = '<li class="ct-empty">' + UI.emptyState('search_off', 'لا توجد نتائج مطابقة', 'غيّر كلمات البحث أو عامل التصفية.', '<button type="button" class="btn btn-secondary" data-clear>' + icon('filter_alt_off') + 'مسح البحث</button>') + '</li>';
            $('[data-clear]', list).addEventListener('click', function () { st.q = ''; st.f = 'all'; var s = document.getElementById(p + '-search'); if (s) { s.value = ''; s.focus(); } var f = document.getElementById(p + '-filter'); if (f) f.value = 'all'; render(); });
          }
          return;
        }
        list.classList.add('sec-list');
        list.innerHTML = shown.map(function (it) { return rowHTML(it); }).join('');
        flashId = null;
      }

      /* actions */
      function move(id, to, how) {
        var from = items.findIndex(function (x) { return x.id === id; });
        if (from < 0 || to < 0 || to >= items.length || to === from) return false;
        var it = items.splice(from, 1)[0]; items.splice(to, 0, it);
        flashId = id; save(); render();
        announce('نُقل «' + cut(cfg.title(it), 40) + '» إلى الموضع ' + (to + 1) + ' من ' + items.length);
        if (how === 'drag') toast('تم تغيير الترتيب', { text: 'الموضع الجديد: ' + (to + 1) + ' من ' + items.length, icon: 'reorder', duration: 2400 });
        return true;
      }
      list.addEventListener('click', function (e) {
        var ed = e.target.closest('[data-edit]');
        if (ed) { openDrawer(byId(ed.getAttribute('data-edit')), ed); return; }
        var del = e.target.closest('[data-del]');
        if (del) { removeItem(byId(del.getAttribute('data-del'))); return; }
        var b = e.target.closest('[data-up],[data-down]'); if (!b) return;
        var up = b.hasAttribute('data-up'), id = b.getAttribute(up ? 'data-up' : 'data-down');
        var from = items.findIndex(function (x) { return x.id === id; });
        if (move(id, from + (up ? -1 : 1))) {
          var nb = $('[data-' + (up ? 'up' : 'down') + '="' + id + '"]', list);
          if (nb && nb.disabled) nb = $('li[data-id="' + id + '"] .dnd-handle', list);
          if (nb) nb.focus();
        }
      });
      list.addEventListener('keydown', function (e) {
        var h = e.target.closest('.dnd-handle'); if (!h || h.disabled) return;
        var id = h.closest('li').getAttribute('data-id'), from = items.findIndex(function (x) { return x.id === id; }), to = null;
        if (e.key === 'ArrowUp') to = from - 1; else if (e.key === 'ArrowDown') to = from + 1;
        else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = items.length - 1;
        if (to === null) return;
        e.preventDefault();
        if (move(id, to)) { var nh = $('li[data-id="' + id + '"] .dnd-handle', list); if (nh) nh.focus(); }
      });
      document.addEventListener('switch', function (e) {
        var sw = e.target; if (!sw.hasAttribute || !sw.hasAttribute('data-vis') || !list.contains(sw)) return;
        var it = byId(sw.getAttribute('data-vis')); if (!it) return;
        it.visible = e.detail.on; save(); render();
        var n = $('[data-vis="' + it.id + '"]', list); if (n) n.focus();
        announce((it.visible ? 'أصبح ظاهراً: ' : 'أُخفي: ') + cut(cfg.title(it), 40));
        toast(it.visible ? 'أصبح العنصر ظاهراً' : 'تم إخفاء العنصر', { text: cut(cfg.title(it), 60), icon: it.visible ? 'visibility' : 'visibility_off', tone: 'info', duration: 2400 });
      });
      DnD.Sortable(list, {
        maxDepth: 0,
        onStart: function (r) { dragId = r.id; },
        onDrop: function (r) {
          var id = dragId; dragId = null;
          if (!r.changed) { render(); return; }
          move(id, r.index, 'drag');
          var h = $('li[data-id="' + id + '"] .dnd-handle', list); if (h) h.focus({ preventScroll: true });
        },
        onCancel: function () { dragId = null; render(); announce('أُلغي السحب'); }
      });

      function removeItem(it) {
        if (!it) return;
        UI.confirmDelete(cfg.the, '«' + cut(cfg.title(it), 70) + '» — سيُحذف نهائياً من هذا المتصفح، ويمكنك التراجع فوراً بعد الحذف.').then(function (ok) {
          if (!ok) return;
          var idx = items.indexOf(it); items = items.filter(function (x) { return x !== it; });
          save(); render();
          toastUndo('تم الحذف', { text: cut(cfg.title(it), 60), tone: 'danger' }, function () { items.splice(Math.min(idx, items.length), 0, it); flashId = it.id; save(); render(); });
        });
      }

      /* drawer */
      function openDrawer(it, trigger) {
        if (!drawer) return;
        editing = it || null;
        var vals = it || (function () { var o = {}; cfg.fields.forEach(function (f) { o[f.k] = f.type === 'select' ? ((f.options.group && window.AdminConstants && window.AdminConstants.get(f.options.group)[0]) ? window.AdminConstants.get(f.options.group)[0].key : f.options[0].v) : ''; }); return o; })();
        drawer.innerHTML = '<form id="' + p + '-form" novalidate style="display:contents">' +
          '<div class="drawer-head"><div><h2 id="' + p + '-dt">' + (it ? 'تعديل ' + esc(cfg.the) : esc(cfg.addLabel)) + '</h2><p id="' + p + '-ds">' + (it ? 'حدّث البيانات ثم احفظ التغييرات.' : 'أدخل البيانات لإضافتها إلى القائمة.') + '</p></div>' +
          '<button type="button" class="icon-btn" data-close-drawer aria-label="إغلاق">' + icon('close') + '</button></div>' +
          '<div class="drawer-body">' + fieldsHTML(cfg.fields, vals, p + 'f') + '</div>' +
          '<div class="drawer-foot"><button type="button" class="btn btn-secondary" data-close-drawer>إلغاء</button><button type="submit" class="btn btn-primary">' + icon('save') + 'حفظ</button></div></form>';
        drawer.setAttribute('aria-labelledby', p + '-dt'); drawer.setAttribute('aria-describedby', p + '-ds');
        var form = $('#' + p + '-form', drawer);
        wireFields(cfg.fields, form, p + 'f');
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var bad = validate(cfg.fields, form, p + 'f');
          if (bad.length) { bad[0].focus(); toast('يرجى تصحيح الحقول المظللة', { tone: 'danger', icon: 'error' }); return; }
          var data = readFields(cfg.fields, form, p + 'f');
          if (editing) Object.assign(editing, data);
          else { var ni = Object.assign({ id: cfg.idp + Date.now(), visible: true }, data); items.push(ni); flashId = ni.id; }
          var was = !!editing;
          UI.Drawer.close(drawer); save(); render();
          toast(was ? 'تم حفظ التغييرات' : 'تمت الإضافة', { text: cut(cfg.title(data), 60) });
        });
        UI.Drawer.open(drawer, { focus: '#' + p + 'f-' + cfg.fields[0].k, returnFocus: trigger });
      }
      var add = document.getElementById(p + '-add'); if (add) add.addEventListener('click', function () { openDrawer(null, add); });

      /* toolbar */
      var search = document.getElementById(p + '-search'), filter = document.getElementById(p + '-filter'), t;
      if (search) search.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { st.q = search.value; render(); }, 120); });
      if (filter) filter.addEventListener('change', function () { st.f = filter.value; render(); });
      var reset = document.getElementById(p + '-reset');
      if (reset) reset.addEventListener('click', function () {
        UI.modal({ title: 'استعادة المحتوى الافتراضي؟', text: 'ستعود القائمة إلى المحتوى الحالي في الموقع وتُفقد تعديلاتك على هذا القسم.', icon: 'restart_alt', tone: 'warn', confirmText: 'استعادة' }).then(function (ok) {
          if (!ok) return;
          var prev = items; items = seedItems(); save(); render();
          toastUndo('تمت استعادة الافتراضي', { icon: 'restart_alt', tone: 'info' }, function () { items = prev; save(); render(); });
        });
      });
      window.addEventListener('storage', function (e) { if (e.key === cfg.key) { items = load(); render(); } });
      render();
      return { render: render };
    }

    /* ---------- appeal card ---------- */
    function Appeal() {
      var form = document.getElementById('ap-form'); if (!form) return;
      var KEY = 'almel-admin-appeal', fields = F.appeal, pre = 'apf';
      function load() {
        var s = read(KEY), o = clone(SEED.appeal);
        if (s && typeof s === 'object') { Object.keys(o).forEach(function (k) { if (k === 'visible') o.visible = s.visible !== false; else if (typeof s[k] === 'string') o[k] = s[k]; }); }
        return o;
      }
      var data = load(), saved = JSON.stringify(data);
      form.innerHTML = fieldsHTML(fields, data, pre);
      var sw = document.getElementById('ap-visible'), stEl = document.getElementById('ap-state'), saveBtn = document.getElementById('ap-save');
      sw.setAttribute('aria-checked', String(data.visible));
      function collect() { var o = readFields(fields, form, pre); o.visible = sw.getAttribute('aria-checked') === 'true'; return o; }
      function preview() {
        var d = collect(), el = document.getElementById('ap-preview');
        el.classList.toggle('is-off', !d.visible);
        el.innerHTML = '<div class="ap-media"><img src="' + esc(imgSrc(d.image)) + '" alt=""><span class="ap-flag">' + esc(d.flag) + '</span></div>' +
          '<div class="ap-body">' + (d.chip ? '<span class="ap-chip">' + esc(d.chip) + '</span>' : '') + '<p class="ap-kicker">' + esc(d.kicker) + '</p>' +
          '<h3 class="ap-title">' + esc(d.title1) + '<br><span>' + esc(d.title2) + '</span></h3><p class="ap-desc">' + esc(d.desc) + '</p>' +
          '<div class="ap-btns"><span class="ap-btn is-main">' + esc(d.cta1) + '</span><span class="ap-btn">' + esc(d.cta2) + '</span></div></div>' +
          (d.visible ? '' : '<div class="ap-off">' + icon('visibility_off') + 'البطاقة مخفية عن الزوار</div>');
      }
      function sync() {
        var dirty = JSON.stringify(collect()) !== saved; preview();
        stEl.classList.toggle('is-dirty', dirty);
        stEl.innerHTML = dirty ? '<span class="dirty-dot" aria-hidden="true"></span><span>تغييرات غير محفوظة</span>' : icon('cloud_done') + '<span>محفوظة على هذا الجهاز</span>';
        saveBtn.classList.toggle('has-dot', dirty);
        return dirty;
      }
      wireFields(fields, form, pre, sync);
      document.addEventListener('switch', function (e) { if (e.target === sw) sync(); });
      function save() {
        var bad = validate(fields, form, pre);
        if (bad.length) { bad[0].focus(); toast('لا يمكن الحفظ بعد', { text: 'أكمل الحقول المطلوبة أولاً.', tone: 'danger', icon: 'error' }); return false; }
        var d = collect();
        if (!write(KEY, d)) { toast('تعذّر الحفظ', { text: 'مساحة التخزين في المتصفح غير متاحة.', tone: 'danger', icon: 'error' }); return false; }
        saved = JSON.stringify(d); sync(); stEl.classList.remove('is-pulse'); void stEl.offsetWidth; stEl.classList.add('is-pulse');
        toast('تم حفظ نداء الإغاثة', { text: 'حُفظت البيانات على هذا المتصفح.', icon: 'cloud_done' });
        return true;
      }
      saveBtn.addEventListener('click', save);
      form.addEventListener('submit', function (e) { e.preventDefault(); save(); });
      document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(); } });
      document.getElementById('ap-reset').addEventListener('click', function () {
        UI.modal({ title: 'استعادة بطاقة النداء الافتراضية؟', text: 'سيعود نص النداء وأزراره إلى ما هو منشور حالياً في الموقع. لن يُحفظ ذلك حتى تضغط «حفظ التغييرات».', icon: 'restart_alt', tone: 'warn', confirmText: 'استعادة' }).then(function (ok) {
          if (!ok) return;
          var d = clone(SEED.appeal);
          fields.forEach(function (f) { var el = $('#' + pre + '-' + f.k, form); el.value = d[f.k]; el.dispatchEvent(new Event('input')); });
          sw.setAttribute('aria-checked', 'true'); sync();
          toast('تمت استعادة الافتراضي', { text: 'اضغط «حفظ التغييرات» لتطبيقها.', icon: 'restart_alt', tone: 'info' });
        });
      });
      window.addEventListener('beforeunload', function (e) { if (sync()) { e.preventDefault(); e.returnValue = ''; } });
      sync();
    }

    /* ---------- announcements bar settings ---------- */
    function AnnBar() {
      var input = document.getElementById('bar-label'), sw = document.getElementById('bar-visible'), sv = document.getElementById('an-saved'); if (!input) return;
      var KEY = 'almel-admin-announcements-bar', s = read(KEY) || {}, d = clone(SEED.annBar);
      if (typeof s.label === 'string' && norm(s.label)) d.label = norm(s.label);
      if (s.visible === false) d.visible = false;
      input.value = d.label; sw.setAttribute('aria-checked', String(d.visible));
      function persist() { var v = norm(input.value) || SEED.annBar.label; write(KEY, { label: v, visible: sw.getAttribute('aria-checked') === 'true' }); flashSaved(sv, 'حُفظت التغييرات الآن'); }
      input.addEventListener('change', persist);
      input.addEventListener('input', function () { var c = document.getElementById('bar-label-count'); if (c) c.textContent = norm(input.value).length + ' / 30'; });
      document.addEventListener('switch', function (e) { if (e.target === sw) { persist(); toast(sw.getAttribute('aria-checked') === 'true' ? 'الشريط ظاهر في الموقع' : 'تم إخفاء الشريط', { icon: 'campaign', tone: 'info', duration: 2400 }); } });
    }

    var page = UI.page;
    if (page === 'appeal') { Appeal(); AnnBar(); List(CFG.announcements); }
    else if (CFG[page]) List(CFG[page]);
    var orgEl = document.getElementById('ct-org'); if (orgEl) orgEl.textContent = ORG;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
