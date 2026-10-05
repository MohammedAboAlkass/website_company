/* =========================================================================
   ADMIN_DATA — بيانات تجريبية (DEMO / PLACEHOLDER DATA)
   -------------------------------------------------------------------------
   كل ما في هذا الملف بيانات وهمية لأغراض عرض قالب لوحة التحكم فقط.
   Everything in this file is placeholder data for the static admin
   template. Replace it with responses from a real backend / API.

   • Project and news titles are reused from ../../js/site-data.js;
     every figure (goals, amounts, counts, views, percentages) is demo.
   • Donor / sender names are deliberately generic ("متبرع #1024",
     "زائر #2031") — no real personal data.
   • Time values are expressed as offsets (minutes / days ago) so the
     template always looks "fresh"; admin.js turns them into labels.
   ========================================================================= */
window.ADMIN_DATA = {
  org: {
    name: 'جمعية الشمال للتنمية والتطوير المجتمعي',
    tagline: 'لإغاثة أهل غزة ودعم صمودهم',
    email: 'info@shamal-society.org',
    phone: '+20 100 774 9292',
    address: 'مكتب إغاثة غزة — القاهرة (تنسيق دخول المساعدات)',
    license: 'HRSD-77492',
    website: 'https://shamal-society.org'
  },

  user: { name: 'مدير المنصة', role: 'مسؤول النظام', email: 'admin@shamal-society.org', initials: 'م' },

  categories: [
    { id: 'relief',  label: 'برامج إغاثية', icon: 'crisis_alert' },
    { id: 'construction', label: 'برامج إنشائية', icon: 'construction' },
    { id: 'development',  label: 'برامج تنموية', icon: 'trending_up' },
    { id: 'health',  label: 'برامج صحية', icon: 'medical_services' }
  ],

  projectStatuses: [
    { id: 'active',    label: 'نشط',          tone: 'info' },
    { id: 'urgent',    label: 'عاجل',          tone: 'danger' },
    { id: 'paused',    label: 'متوقف مؤقتاً',   tone: 'warn' },
    { id: 'draft',     label: 'مسودة',         tone: 'neutral' },
    { id: 'completed', label: 'مكتمل',         tone: 'solid' }
  ],

  governorates: [
    { id: 'north',   name: 'شمال غزة',  beneficiaries: 18400, donations: 142300, projects: 5, points: 11 },
    { id: 'gaza',    name: 'غزة',       beneficiaries: 22650, donations: 168900, projects: 7, points: 14 },
    { id: 'middle',  name: 'دير البلح', beneficiaries: 15200, donations: 98600,  projects: 4, points: 9 },
    { id: 'khan',    name: 'خان يونس',  beneficiaries: 19800, donations: 121400, projects: 6, points: 12 },
    { id: 'rafah',   name: 'رفح',       beneficiaries: 12900, donations: 86200,  projects: 4, points: 8 }
  ],

  projects: [
    { id: 'relief',  title: 'برنامج الإطعام الطارئ ومخابز غزة', cat: 'relief', gov: 'north', location: 'شمال غزة — جباليا', goal: 120000, raised: 103200, status: 'urgent', image: '../img/project-relief.jpg', updated: 0, donors: 1284, desc: 'تأمين الطحين والوقود لتشغيل 4 مخابز خيرية وتوزيع وجبات ساخنة يومية على النازحين.' },
    { id: 'development', title: 'برنامج التمكين والتنمية المجتمعية', cat: 'development', gov: 'gaza', location: 'مخيم الشاطئ', goal: 90000, raised: 64800, status: 'active', image: '../img/project-orphan.jpg', updated: 1, donors: 842, desc: 'كفالة متكاملة للطعام والكساء والتعلّم في خيم مدرسية داخل مراكز الإيواء.' },
    { id: 'water',   title: 'صهاريج مياه الشرب لمخيمات النزوح', cat: 'health', gov: 'khan', location: 'خان يونس ودير البلح', goal: 60000, raised: 38400, status: 'active', image: '../img/project-water.jpg', updated: 2, donors: 611, desc: 'تشغيل محطات تحلية متنقلة وصهاريج يومية لنقاط الإيواء.' },
    { id: 'shelter', title: 'خيام ومستلزمات الإيواء في رفح', cat: 'construction', gov: 'rafah', location: 'رفح', goal: 150000, raised: 87000, status: 'active', image: '../img/project-empower.jpg', updated: 3, donors: 903, desc: 'توفير خيام عائلية ومستلزمات إيواء أساسية للأسر النازحة.' },
    { id: 'clinics', title: 'العيادات الميدانية والأدوية المزمنة', cat: 'health', gov: 'middle', location: 'دير البلح', goal: 50000, raised: 22500, status: 'paused', image: '../img/activity-medical.jpg', updated: 5, donors: 377, desc: 'عيادات خيام للجروح والأطفال والتوليد وصرف أدوية مزمنة.' },
    { id: 'winter',  title: 'حملة دفء غزة الشتوية', cat: 'construction', gov: 'rafah', location: 'مخيمات النزوح في رفح', goal: 80000, raised: 30400, status: 'draft', image: '../img/activity-winter.jpg', updated: 6, donors: 214, desc: 'حزم دفء وأغطية عازلة لحماية النازحين من برد الخيام.' },
    { id: 'learning', title: 'الخيمة التعليمية السادسة لأطفال غزة', cat: 'development', gov: 'gaza', location: 'غزة — حي الرمال', goal: 30000, raised: 30000, status: 'completed', image: '../img/activity-graduate.jpg', updated: 9, donors: 468, desc: 'حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.' },
    { id: 'convoy',  title: 'قوافل الطحين لمراكز الإيواء', cat: 'relief', gov: 'middle', location: 'دير البلح', goal: 70000, raised: 51800, status: 'active', image: '../img/gallery-convoy.jpg', updated: 4, donors: 590, desc: 'نقل الطحين والسلال الغذائية إلى مراكز الإيواء في الوسطى.' },
    { id: 'waterpt', title: 'نقطة مياه شرب إضافية في الشمال', cat: 'health', gov: 'north', location: 'بيت لاهيا', goal: 25000, raised: 9800, status: 'active', image: '../img/gallery-water.jpg', updated: 7, donors: 163, desc: 'تشغيل نقطة تعبئة مياه شرب إضافية في شمال القطاع.' },
    { id: 'kits',    title: 'الحقيبة المدرسية للأطفال النازحين', cat: 'development', gov: 'khan', location: 'خان يونس', goal: 40000, raised: 40000, status: 'completed', image: '../img/gallery-children.jpg', updated: 14, donors: 520, desc: 'حقائب وقرطاسية للأطفال في خيم التعلّم.' },
    { id: 'meds',    title: 'أدوية الأمراض المزمنة لكبار السن', cat: 'health', gov: 'khan', location: 'خان يونس — المواصي', goal: 45000, raised: 12600, status: 'urgent', image: '../img/gallery-clinic.jpg', updated: 1, donors: 198, desc: 'صرف شهري لأدوية الضغط والسكري للمرضى النازحين.' },
    { id: 'blankets', title: 'أغطية عازلة لمراكز الإيواء', cat: 'construction', gov: 'north', location: 'جباليا', goal: 35000, raised: 6300, status: 'draft', image: '../img/gallery-winter.jpg', updated: 11, donors: 74, desc: 'أغطية وفرشات عازلة للأسر في مراكز الإيواء.' }
  ],

  /* KPI cards: spark = last 12 points, oldest first. */
  kpis: [
    { id: 'beneficiaries', label: 'مستفيدون هذا الشهر', value: 88950, format: 'number', delta: -3.2, icon: 'diversity_3', spark: [72, 79, 84, 90, 93, 95, 97, 94, 96, 93, 92, 89] },
    { id: 'projects', label: 'مشاريع نشطة', value: 8, format: 'number', delta: 2, deltaUnit: 'مشروع', icon: 'folder_open', spark: [4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 6, 8] }
  ],

  /* Donations over time (USD). Oldest first. */
  donationsSeries: {
    '7d':  { current: [5200, 6100, 5800, 7400, 6900, 8200, 7600], previous: [4800, 5200, 5600, 5900, 6100, 6400, 6000] },
    '30d': { current: [4200, 4800, 5100, 4700, 5600, 6100, 5800, 6300, 5900, 6600, 7100, 6800, 6400, 7200, 7800, 7400, 6900, 7600, 8100, 7700, 8300, 8800, 8200, 7900, 8600, 9100, 8700, 9300, 9800, 9400],
             previous: [3900, 4100, 4400, 4300, 4700, 4900, 5200, 5000, 5300, 5500, 5400, 5800, 6000, 5700, 6100, 6300, 6200, 6500, 6400, 6700, 6900, 6600, 7000, 7200, 7100, 7300, 7500, 7400, 7700, 7600] },
    '12m': { current: [96000, 104000, 99000, 118000, 126000, 121000, 139000, 152000, 147000, 163000, 171000, 184250],
             previous: [72000, 78000, 81000, 86000, 84000, 93000, 98000, 101000, 99000, 108000, 114000, 119000] }
  },

  donationsByCategory: [
    { id: 'relief', label: 'برامج إغاثية', value: 38 },
    { id: 'construction', label: 'برامج إنشائية', value: 13 },
    { id: 'development', label: 'برامج تنموية', value: 30 },
    { id: 'health', label: 'برامج صحية', value: 19 }
  ],

  /* Monthly donations by channel (last 6 months, oldest first). */
  channels: [
    { id: 'online', label: 'تبرع إلكتروني', values: [62000, 71000, 78000, 84000, 92000, 101000] },
    { id: 'bank', label: 'تحويل بنكي', values: [41000, 44000, 47000, 52000, 55000, 58250] },
    { id: 'field', label: 'حملات ميدانية', values: [18000, 24000, 22000, 27000, 24000, 25000] }
  ],

  recentDonations: [
    { donor: 'متبرع #1024', amount: 500,  project: 'relief',  method: 'بطاقة', mins: 4 },
    { donor: 'متبرع #1023', amount: 120,  project: 'development', method: 'تحويل', mins: 18 },
    { donor: 'متبرع #1022', amount: 2500, project: 'shelter', method: 'تحويل', mins: 42 },
    { donor: 'متبرع #1021', amount: 75,   project: 'water',   method: 'بطاقة', mins: 65 },
    { donor: 'متبرع #1020', amount: 300,  project: 'meds',    method: 'محفظة', mins: 110 },
    { donor: 'متبرع #1019', amount: 1000, project: 'relief',  method: 'بطاقة', mins: 185 }
  ],

  activity: [
    { icon: 'edit_note', text: 'حُدِّثت نسبة إنجاز «برنامج الإطعام الطارئ»', by: 'منسق ميداني #3', mins: 12 },
    { icon: 'newspaper', text: 'نُشر خبر «إطلاق خريطة تتبع السلال»', by: 'محرر المحتوى #2', mins: 55 },
    { icon: 'photo_library', text: 'أُضيفت 6 صور إلى ألبوم «توثيق الميدان»', by: 'محرر المحتوى #2', mins: 140 },
    { icon: 'person_add', text: 'انضم مستخدم جديد بصلاحية «مراجع»', by: 'مدير المنصة', mins: 320 },
    { icon: 'task_alt', text: 'اكتمل تنفيذ «الخيمة التعليمية السادسة»', by: 'النظام', mins: 1440 }
  ],

  messages: [
    { id: 'm1', from: 'زائر #2031', email: 'visitor2031@example.com', type: 'donation', subject: 'استفسار عن إيصال تبرع شهر أيلول', body: 'السلام عليكم،\nقمت بتحويل تبرع لبرنامج الإطعام الطارئ ولم يصلني الإيصال الإلكتروني حتى الآن. هل يمكن إعادة إرساله إلى بريدي؟\nشكراً لجهودكم.', mins: 9, read: false, starred: true, archived: false },
    { id: 'm2', from: 'متطوع #0417', email: 'volunteer0417@example.com', type: 'volunteer', subject: 'طلب تطوع في فريق التوثيق', body: 'أرغب في الانضمام إلى فريق التوثيق الإعلامي، لدي خبرة في التصوير والمونتاج ويمكنني المساهمة عن بعد.\nما الخطوات المطلوبة؟', mins: 37, read: false, starred: false, archived: false },
    { id: 'm3', from: 'جهة شريكة #12', email: 'partner12@example.org', type: 'contact', subject: 'تنسيق قافلة مشتركة إلى دير البلح', body: 'نود التنسيق معكم بشأن قافلة مشتركة للطحين خلال الأسبوع القادم. نرجو تحديد موعد لاجتماع قصير مع فريق العمليات.', mins: 95, read: false, starred: true, archived: false },
    { id: 'm4', from: 'زائر #2029', email: 'visitor2029@example.com', type: 'donation', subject: 'هل يمكن تخصيص التبرع لبرنامج التنمية المجتمعية؟', body: 'أرغب في دعم برنامج التنمية المجتمعية بشكل شهري، هل يمكن ربط التبرع باسم طفل محدد ومتابعة أخباره؟', mins: 180, read: true, starred: false, archived: false },
    { id: 'm5', from: 'متطوع #0415', email: 'volunteer0415@example.com', type: 'volunteer', subject: 'متاح للتطوع في نقاط التوزيع', body: 'أقيم في خان يونس ومتاح للتطوع في نقاط التوزيع صباحاً. أرجو التواصل معي.', mins: 260, read: false, starred: false, archived: false },
    { id: 'm6', from: 'زائر #2026', email: 'visitor2026@example.com', type: 'contact', subject: 'اقتراح لتحسين صفحة المشاريع', body: 'أقترح إضافة خريطة صغيرة لكل مشروع توضح مكان التنفيذ، سيكون ذلك مفيداً للمتبرعين.', mins: 1300, read: true, starred: false, archived: false },
    { id: 'm7', from: 'زائر #2024', email: 'visitor2024@example.com', type: 'donation', subject: 'طريقة التبرع عبر التحويل البنكي', body: 'ما هي بيانات الحساب البنكي المعتمدة للتبرع؟ وهل يمكن الحصول على خطاب رسمي بالتبرع لجهة العمل؟', mins: 1500, read: true, starred: true, archived: false },
    { id: 'm8', from: 'متطوع #0409', email: 'volunteer0409@example.com', type: 'volunteer', subject: 'ترجمة التقارير إلى الإنجليزية', body: 'يمكنني المساعدة في ترجمة تقارير الأثر الدورية إلى اللغة الإنجليزية بشكل تطوعي.', mins: 2900, read: true, starred: false, archived: false },
    { id: 'm9', from: 'جهة شريكة #07', email: 'partner07@example.org', type: 'contact', subject: 'طلب تقرير الشفافية الربعي', body: 'نرجو تزويدنا بنسخة من تقرير الشفافية الربعي الأخير لإدراجه في ملف الشراكة.', mins: 4400, read: true, starred: false, archived: false },
    { id: 'm10', from: 'زائر #2019', email: 'visitor2019@example.com', type: 'donation', subject: 'تبرع عيني بملابس شتوية', body: 'لدينا كمية من الملابس الشتوية الجديدة للأطفال، كيف يمكن إيصالها إليكم؟', mins: 7300, read: true, starred: false, archived: true },
    { id: 'm11', from: 'زائر #2015', email: 'visitor2015@example.com', type: 'contact', subject: 'شكر وتقدير لفريق العمل', body: 'شكراً لكم على الشفافية في عرض صور التوزيع، هذا يعزز الثقة كثيراً.', mins: 10100, read: true, starred: false, archived: false }
  ],

  news: [
    { id: 'report-88', title: 'نشر تقرير الإغاثة الدوري لغزة وتوسيع مخابز الطوارئ في الجنوب', cat: 'statements', status: 'published', date: '2026-09-24', views: 4820, image: '../img/news-conference.jpg', author: 'فريق الإعلام', tags: ['تقارير', 'مخابز'] },
    { id: 'development-500', title: 'إطلاق برنامج التمكين المجتمعي لـ 500 مستفيد من شمال غزة وجباليا', cat: 'development', status: 'published', date: '2026-09-19', views: 3910, image: '../img/gallery-children.jpg', author: 'فريق الإعلام', tags: ['تنمية', 'كفالة'] },
    { id: 'tracking-map', title: 'إطلاق خريطة تتبع السلال داخل قطاع غزة', cat: 'field', status: 'published', date: '2026-09-12', views: 2750, image: '../img/gallery-lab.jpg', author: 'محرر المحتوى #2', tags: ['شفافية'] },
    { id: 'winter-campaign', title: 'توزيع 10,000 طرد شتوي وأغطية عازلة', cat: 'activities', status: 'scheduled', date: '2026-10-05', views: 0, image: '../img/activity-winter.jpg', author: 'محرر المحتوى #2', tags: ['شتاء', 'إيواء'] },
    { id: 'field-clinics', title: 'تسيير 3 عيادات ميدانية وإجراء 320 تدخلاً', cat: 'activities', status: 'published', date: '2026-09-03', views: 1980, image: '../img/activity-medical.jpg', author: 'فريق الإعلام', tags: ['صحة'] },
    { id: 'learning-tent', title: 'افتتاح الخيمة التعليمية السادسة لأطفال غزة', cat: 'development', status: 'published', date: '2026-08-27', views: 2210, image: '../img/activity-graduate.jpg', author: 'فريق الإعلام', tags: ['تعليم', 'تنمية'] },
    { id: 'flour-convoy', title: 'وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح', cat: 'field', status: 'draft', date: '2026-09-27', views: 0, image: '../img/gallery-convoy.jpg', author: 'منسق ميداني #3', tags: ['قوافل'] },
    { id: 'water-point', title: 'تشغيل نقطة مياه شرب إضافية في شمال القطاع', cat: 'activities', status: 'draft', date: '2026-09-26', views: 0, image: '../img/gallery-water.jpg', author: 'محرر المحتوى #2', tags: ['مياه'] },
    { id: 'quarterly-report', title: 'تقرير الأثر الربعي متاح قريباً في المركز الإعلامي', cat: 'statements', status: 'scheduled', date: '2026-10-12', views: 0, image: '../img/project-parallax.jpg', author: 'فريق الإعلام', tags: ['تقارير'] }
  ],

  newsCategories: [
    { id: 'statements', label: 'بيانات وتقارير' },
    { id: 'development', label: 'تنمية مجتمعية' },
    { id: 'field', label: 'توثيق الميدان' },
    { id: 'activities', label: 'أنشطة ميدانية' }
  ],

  albums: [
    { id: 'field', label: 'توثيق الميدان' },
    { id: 'relief', label: 'الإغاثة' },
    { id: 'development', label: 'التعليم والتنمية' },
    { id: 'health', label: 'الصحة والمياه' }
  ],

  gallery: [
    { id: 'g1', src: '../img/gallery-convoy.jpg', title: 'قافلة الإغاثة الكبرى', alt: 'شاحنات قافلة الإغاثة تصل إلى جباليا', album: 'relief', size: '412 KB', dims: '1600×1067' },
    { id: 'g2', src: '../img/gallery-children.jpg', title: 'أطفال غزة والحقائب المدرسية', alt: 'أطفال يبتسمون بعد استلام الحقائب المدرسية', album: 'development', size: '388 KB', dims: '1600×1067' },
    { id: 'g3', src: '../img/gallery-clinic.jpg', title: 'العيادة الميدانية', alt: 'طاقم طبي داخل عيادة خيمة ميدانية', album: 'health', size: '356 KB', dims: '1600×1067' },
    { id: 'g4', src: '../img/gallery-water.jpg', title: 'نقطة مياه الشرب', alt: 'نازحون يملؤون عبوات المياه من صهريج', album: 'health', size: '401 KB', dims: '1600×1067' },
    { id: 'g5', src: '../img/gallery-lab.jpg', title: 'نقطة توزيع السلال', alt: 'فريق يجهز السلال الغذائية في نقطة توزيع', album: 'field', size: '372 KB', dims: '1600×1067' },
    { id: 'g6', src: '../img/gallery-winter.jpg', title: 'حزم الدفء الشتوية', alt: 'توزيع أغطية شتوية على الأسر النازحة', album: 'relief', size: '395 KB', dims: '1600×1067' },
    { id: 'g7', src: '../img/gallery-campus.jpg', title: 'خيم التعلّم', alt: 'أطفال في حلقة تعلّم داخل خيمة مدرسية', album: 'development', size: '344 KB', dims: '1600×1067' },
    { id: 'g8', src: '../img/project-relief.jpg', title: 'توزيع المساعدات الغذائية', alt: 'توزيع مساعدات غذائية في شمال غزة', album: 'field', size: '420 KB', dims: '1600×1067' },
    { id: 'g9', src: '../img/activity-medical.jpg', title: 'فريق العيادات', alt: 'فريق طبي يقدم الرعاية للأطفال', album: 'health', size: '367 KB', dims: '1600×1067' },
    { id: 'g10', src: '../img/project-water.jpg', title: 'صهاريج خان يونس', alt: 'توزيع مياه صالحة للشرب في خان يونس', album: 'health', size: '398 KB', dims: '1600×1067' },
    { id: 'g11', src: '../img/activity-graduate.jpg', title: 'الخيمة التعليمية السادسة', alt: 'أطفال في افتتاح الخيمة التعليمية', album: 'development', size: '351 KB', dims: '1600×1067' },
    { id: 'g12', src: '../img/project-parallax.jpg', title: 'مراكز الإيواء', alt: 'انتظار الوجبات الساخنة في مراكز الإيواء', album: 'field', size: '433 KB', dims: '1600×1067' }
  ],

  notifications: [
    { icon: 'handshake', tone: 'gold', title: 'طلب تطوع جديد', text: 'متطوع #0417 — فريق التوثيق', mins: 37, unread: true },
    { icon: 'mail', tone: 'info', title: '3 رسائل جديدة', text: 'طلبا تطوع ورسالة تواصل', mins: 95, unread: true },
    { icon: 'warning', tone: 'danger', title: 'مشروع عاجل تحت 30%', text: '«أدوية الأمراض المزمنة لكبار السن»', mins: 240, unread: true },
    { icon: 'schedule', tone: 'neutral', title: 'خبر مجدول للنشر', text: '«توزيع 10,000 طرد شتوي» — 5 أكتوبر', mins: 1440, unread: false }
  ],

  users: [
    { name: 'مدير المنصة', email: 'admin@shamal-society.org', role: 'admin', status: 'active', last: 0 },
    { name: 'محرر المحتوى #2', email: 'editor2@shamal-society.org', role: 'editor', status: 'active', last: 55 },
    { name: 'منسق ميداني #3', email: 'field3@shamal-society.org', role: 'field', status: 'active', last: 12 },
    { name: 'مراجع مالي #4', email: 'finance4@shamal-society.org', role: 'finance', status: 'active', last: 1440 },
    { name: 'مراجع #5', email: 'reviewer5@shamal-society.org', role: 'viewer', status: 'invited', last: null },
    { name: 'محرر المحتوى #6', email: 'editor6@shamal-society.org', role: 'editor', status: 'disabled', last: 20160 }
  ],

  roles: [
    { id: 'admin', label: 'مدير النظام', tone: 'solid' },
    { id: 'editor', label: 'محرر محتوى', tone: 'info' },
    { id: 'field', label: 'منسق ميداني', tone: 'warn' },
    { id: 'finance', label: 'مراجع مالي', tone: 'info' },
    { id: 'viewer', label: 'مشاهد', tone: 'neutral' }
  ]
};
