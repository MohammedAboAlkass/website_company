/* =========================================================================
   BUILDER_DATA — بيانات تجريبية لصفحتي «إدارة الصفحات» و«إدارة القائمة»
   -------------------------------------------------------------------------
   • pages[]    → the real public pages of the site (titles + meta
                  descriptions copied from each HTML file). Status, authors
                  and "last edited" offsets are DEMO values. The last two
                  entries are suggested pages the footer already links to
                  (privacy / governance), included to demo drafts & hidden.
   • sections[] → the real <section id="…"> blocks of ../index.html, in the
                  order they appear there (headings copied from the page).
   • menus      → header nav + footer links exactly as they appear in the
                  public HTML. A few header sub-items (taken from real links
                  of the site: about.html#vision, project.html?id=…) are
                  added only to demo 2-level nesting.
   Everything is front-end only; edits persist to localStorage.
   ========================================================================= */
window.BUILDER_DATA = {
  site: { name: 'جمعية الشمال للتنمية والتطوير المجتمعي', domain: 'alamal-gaza.org', tagline: 'لإغاثة أهل غزة ودعم صمودهم' },

  pageStatuses: [
    { id: 'published', label: 'منشورة', tone: 'info', icon: 'public' },
    { id: 'draft',     label: 'مسودة',  tone: 'neutral', icon: 'edit_note' },
    { id: 'hidden',    label: 'مخفية',  tone: 'warn', icon: 'visibility_off' }
  ],

  pages: [
    { id: 'index', file: 'index.html', slug: '', title: 'الرئيسية', icon: 'home', kind: 'صفحة رئيسية', status: 'published', mins: 42, author: 'مدير المنصة',
      seoTitle: 'جمعية الشمال للتنمية والتطوير المجتمعي',
      meta: 'مؤسسة إنسانية تعمل على إغاثة أهل غزة: الغذاء والدواء والمأوى ورعاية الأيتام وفق معايير الحوكمة والشفافية.' },
    { id: 'about', file: 'about.html', slug: 'about', title: 'من نحن', icon: 'account_balance', kind: 'صفحة ثابتة', status: 'published', mins: 60 * 26, author: 'فريق الإعلام',
      seoTitle: 'من نحن — جمعية الشمال للتنمية والتطوير المجتمعي',
      meta: 'تعرّف على جمعية الشمال للتنمية والتطوير المجتمعي: قصتنا ومسيرتنا، رؤيتنا ورسالتنا وقيمنا، وكيف نعمل داخل القطاع.' },
    { id: 'projects', file: 'projects.html', slug: 'projects', title: 'المشاريع والبرامج', icon: 'cases', kind: 'صفحة قائمة', status: 'published', mins: 60 * 5, author: 'محرر المحتوى #2',
      seoTitle: 'المشاريع والبرامج — جمعية الشمال للتنمية والتطوير المجتمعي',
      meta: 'مبادرات الإغاثة المعتمدة داخل قطاع غزة: المخابز، كفالة الأيتام، المياه، ومراكز الإيواء — مع نسب التمويل.' },
    { id: 'project', file: 'project.html', slug: 'project', title: 'تفاصيل المشروع', icon: 'volunteer_activism', kind: 'قالب ديناميكي', status: 'published', mins: 60 * 24 * 3, author: 'مدير المنصة',
      seoTitle: 'تفاصيل المشروع — جمعية الشمال للتنمية والتطوير المجتمعي',
      meta: 'تفاصيل مبادرة إغاثة داخل قطاع غزة: نسبة التمويل، ما تغطيه مساهمتك، الصور والتحديثات.' },
    { id: 'news', file: 'news.html', slug: 'news', title: 'الأخبار', icon: 'newspaper', kind: 'صفحة قائمة', status: 'published', mins: 95, author: 'فريق الإعلام',
      seoTitle: 'الأخبار — جمعية الشمال للتنمية والتطوير المجتمعي',
      meta: 'آخر الأخبار وتقارير الشفافية من قطاع غزة: بيانات، أيتام غزة، توثيق الميدان، وأنشطة ميدانية.' },
    { id: 'article', file: 'article.html', slug: 'article', title: 'صفحة الخبر', icon: 'article', kind: 'قالب ديناميكي', status: 'published', mins: 60 * 24 * 6, author: 'محرر المحتوى #2',
      seoTitle: 'صفحة الخبر — جمعية الشمال للتنمية والتطوير المجتمعي',
      meta: 'تفاصيل الخبر من المركز الإعلامي لجمعية الشمال للتنمية والتطوير المجتمعي.' },
    { id: 'gallery', file: 'gallery.html', slug: 'gallery', title: 'معرض الصور', icon: 'perm_media', kind: 'صفحة ثابتة', status: 'published', mins: 60 * 24 * 2, author: 'منسق ميداني #3',
      seoTitle: 'معرض الصور — جمعية الشمال للتنمية والتطوير المجتمعي',
      meta: 'معرض التوثيق الميداني في غزة: صور وفيديو لوصول السلال والخيام والدواء إلى مستحقيها في مخيمات النزوح.' },
    { id: 'contact', file: 'contact.html', slug: 'contact', title: 'تواصل معنا', icon: 'contact_support', kind: 'صفحة ثابتة', status: 'published', mins: 60 * 24 * 9, author: 'مدير المنصة',
      seoTitle: 'تواصل معنا — جمعية الشمال للتنمية والتطوير المجتمعي',
      meta: 'تواصل مع فريق جمعية الشمال للتنمية والتطوير المجتمعي: الخط الساخن، واتساب، البريد الإلكتروني، وغرفة التنسيق في القاهرة.' },
    { id: 'privacy', file: 'privacy.html', slug: 'privacy', title: 'سياسة الخصوصية', icon: 'shield_lock', kind: 'صفحة مقترحة', status: 'draft', mins: 60 * 24 * 12, author: 'مدير المنصة',
      seoTitle: 'سياسة الخصوصية — جمعية الشمال للتنمية والتطوير المجتمعي',
      meta: 'كيف نجمع بيانات المتبرعين ونحميها ونستخدمها.' },
    { id: 'governance', file: 'governance.html', slug: 'governance', title: 'لوائح الحوكمة', icon: 'gavel', kind: 'صفحة مقترحة', status: 'hidden', mins: 60 * 24 * 20, author: 'فريق الإعلام',
      seoTitle: 'لوائح الحوكمة والشفافية — جمعية الشمال للتنمية والتطوير المجتمعي',
      meta: 'اللوائح الداخلية وسياسات الحوكمة والتدقيق المالي لجمعية الشمال للتنمية والتطوير المجتمعي، وآلية الإفصاح عن التقارير السنوية.' }
  ],

  sections: [
    { id: 'hero',          label: 'الواجهة الرئيسية',       note: 'صورة الغلاف والعنوان وأزرار التبرع', icon: 'wallpaper', tone: 'dark', h: 7 },
    { id: 'announcements', label: 'شريط الإعلانات',         note: 'آخر الإعلانات المتحركة', icon: 'campaign', tone: 'amber', h: 1 },
    { id: 'appeal',        label: 'نداء الإغاثة العاجل',     note: 'حملة الطوارئ ذات الأولوية', icon: 'e911_emergency', tone: 'urgent', h: 4, urgent: true },
    { id: 'about',         label: 'من نحن',                 note: 'سنوات من العمل لإغاثة أهل غزة وصون كرامتهم', icon: 'account_balance', tone: 'light', h: 5 },
    { id: 'projects',      label: 'المشاريع والمبادرات',     note: 'مبادرات الإغاثة المعتمدة داخل القطاع', icon: 'cases', tone: 'sand', h: 6 },
    { id: 'stories',       label: 'قصص من الميدان',          note: 'أصوات من خيام النزوح.. حكايات تصنعها مساهمتك', icon: 'auto_stories', tone: 'light', h: 4 },
    { id: 'pillars',       label: 'ركائز الإغاثة',           note: 'ركائز الإغاثة داخل قطاع غزة', icon: 'foundation', tone: 'dark', h: 4 },
    { id: 'activities',    label: 'الأنشطة الميدانية',       note: 'أنشطة ميدانية موثّقة داخل القطاع', icon: 'verified', tone: 'light', h: 5 },
    { id: 'impact-map',    label: 'خريطة الأثر',            note: 'أثر الإغاثة في محافظات القطاع الخمس', icon: 'map', tone: 'dark', h: 5 },
    { id: 'news',          label: 'آخر الأخبار',             note: 'آخر الأخبار وتقارير الشفافية من القطاع', icon: 'newspaper', tone: 'sand', h: 4 },
    { id: 'partners',      label: 'الشركاء',                note: 'تحالفات الخير لأهل القطاع', icon: 'handshake', tone: 'dark', h: 3 },
    { id: 'gallery',       label: 'معرض الصور',             note: 'معرض التوثيق الميداني في غزة', icon: 'perm_media', tone: 'light', h: 5 },
    { id: 'admin',         label: 'بوابة الإدارة',           note: 'بوابة إدارة عمليات إغاثة غزة', icon: 'admin_panel_settings', tone: 'light', h: 3 },
    { id: 'contact',       label: 'تواصل معنا',             note: 'نحن في خدمتك لكل استفسار عن القطاع', icon: 'contact_support', tone: 'sand', h: 4 },
    { id: 'faq',           label: 'الأسئلة الشائعة',         note: 'إجابات واضحة قبل أن تتبرع', icon: 'quiz', tone: 'light', h: 4 }
  ],

  menus: {
    header: [
      { label: 'الرئيسية', url: 'index.html', type: 'page', icon: 'home' },
      { label: 'من نحن', url: 'about.html', type: 'page', icon: 'account_balance', children: [
        { label: 'الرؤية والرسالة', url: 'about.html#vision', type: 'custom', icon: 'visibility' }
      ] },
      { label: 'المشاريع', url: 'projects.html', type: 'page', icon: 'cases', children: [
        { label: 'كفالة أيتام غزة', url: 'project.html?id=orphans', type: 'custom', icon: 'child_care' },
        { label: 'الإطعام الطارئ ومخابز غزة', url: 'project.html?id=relief', type: 'custom', icon: 'bakery_dining' }
      ] },
      { label: 'الأنشطة', url: 'index.html#activities', type: 'anchor', icon: 'verified' },
      { label: 'الأخبار', url: 'news.html', type: 'page', icon: 'newspaper' },
      { label: 'الشركاء', url: 'index.html#partners', type: 'anchor', icon: 'handshake' },
      { label: 'المعرض', url: 'gallery.html', type: 'page', icon: 'perm_media' },
      { label: 'بوابة الإدارة', url: 'admin/login.html', type: 'custom', icon: 'admin_panel_settings' },
      { label: 'تواصل معنا', url: 'contact.html', type: 'page', icon: 'contact_support' },
      { label: 'ساهم في إغاثة غزة الآن', url: 'index.html#appeal', type: 'anchor', icon: 'volunteer_activism', button: true }
    ],
    footer: [
      { label: 'روابط سريعة', url: '', type: 'custom', icon: '', children: [
        { label: 'الرؤية والرسالة', url: 'about.html#vision', type: 'custom', icon: '' },
        { label: 'كفالة أيتام غزة', url: 'project.html?id=orphans', type: 'custom', icon: '' },
        { label: 'تقارير إغاثة القطاع', url: 'index.html#activities', type: 'anchor', icon: '' },
        { label: 'المركز الإعلامي', url: 'news.html', type: 'page', icon: '' },
        { label: 'معرض الصور', url: 'gallery.html', type: 'page', icon: '' },
        { label: 'الأسئلة الشائعة', url: 'index.html#faq', type: 'anchor', icon: '' },
        { label: 'تواصل معنا', url: 'contact.html', type: 'page', icon: '' }
      ] },
      { label: 'سياسة الخصوصية', url: '#', type: 'custom', icon: '' },
      { label: 'لوائح الحوكمة', url: '#', type: 'custom', icon: '' },
      { label: 'بوابة الموظفين', url: 'admin/login.html', type: 'custom', icon: '' }
    ]
  },

  icons: ['home', 'account_balance', 'cases', 'verified', 'newspaper', 'handshake', 'perm_media', 'admin_panel_settings', 'contact_support',
    'volunteer_activism', 'child_care', 'bakery_dining', 'water_drop', 'camping', 'medical_services', 'school', 'visibility', 'quiz', 'map',
    'campaign', 'favorite', 'payments', 'mail', 'call', 'public', 'info', 'star', 'open_in_new']
};
