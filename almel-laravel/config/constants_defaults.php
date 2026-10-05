<?php

// Generated from public/assets/admin/js/admin-constants.js (default «ثوابت النظام» values).
// Used by the "reset group to defaults" action. Locked groups ('fixed') cannot add/delete items.
return [
    [
        'key' => 'project_status',
        'label' => 'حالات المشروع',
        'desc' => 'حالة المشروع في قائمة المشاريع ونموذج المشروع.',
        'pages' => [
            'المشاريع',
        ],
        'fixed' => false,
        'lock' => [],
        'items' => [
            [
                'key' => 'active',
                'label' => 'نشط',
            ],
            [
                'key' => 'urgent',
                'label' => 'عاجل',
            ],
            [
                'key' => 'paused',
                'label' => 'متوقف مؤقتاً',
            ],
            [
                'key' => 'draft',
                'label' => 'مسودة',
            ],
            [
                'key' => 'completed',
                'label' => 'مكتمل',
            ],
        ],
    ],
    [
        'key' => 'project_category',
        'label' => 'فئات المشاريع (البرامج)',
        'desc' => 'فئة المشروع في الفلاتر ونموذج المشروع.',
        'pages' => [
            'المشاريع',
        ],
        'fixed' => false,
        'lock' => [],
        'items' => [
            [
                'key' => 'relief',
                'label' => 'برامج إغاثية',
            ],
            [
                'key' => 'construction',
                'label' => 'برامج إنشائية',
            ],
            [
                'key' => 'development',
                'label' => 'برامج تنموية',
            ],
            [
                'key' => 'health',
                'label' => 'برامج صحية',
            ],
        ],
    ],
    [
        'key' => 'governorate',
        'label' => 'المحافظات',
        'desc' => 'محافظة المشروع في نموذج المشروع.',
        'pages' => [
            'المشاريع',
        ],
        'fixed' => false,
        'lock' => [],
        'items' => [
            [
                'key' => 'north',
                'label' => 'شمال غزة',
            ],
            [
                'key' => 'gaza',
                'label' => 'غزة',
            ],
            [
                'key' => 'middle',
                'label' => 'دير البلح',
            ],
            [
                'key' => 'khan',
                'label' => 'خان يونس',
            ],
            [
                'key' => 'rafah',
                'label' => 'رفح',
            ],
        ],
    ],
    [
        'key' => 'news_category',
        'label' => 'تصنيفات الأخبار',
        'desc' => 'تصنيف الخبر في فلتر الأخبار ومحرر الخبر.',
        'pages' => [
            'الأخبار',
            'تحرير خبر',
        ],
        'fixed' => false,
        'lock' => [],
        'items' => [
            [
                'key' => 'statements',
                'label' => 'بيانات وتقارير',
            ],
            [
                'key' => 'development',
                'label' => 'تنمية مجتمعية',
            ],
            [
                'key' => 'field',
                'label' => 'توثيق الميدان',
            ],
            [
                'key' => 'activities',
                'label' => 'أنشطة ميدانية',
            ],
        ],
    ],
    [
        'key' => 'article_status',
        'label' => 'حالات الخبر',
        'desc' => 'حالة النشر في محرر الخبر. مفاتيحها مرتبطة بسلوك النشر، تُعدَّل تسميتها وترتيبها فقط.',
        'pages' => [
            'تحرير خبر',
        ],
        'fixed' => true,
        'lock' => [],
        'items' => [
            [
                'key' => 'draft',
                'label' => 'مسودة',
            ],
            [
                'key' => 'published',
                'label' => 'منشور',
            ],
            [
                'key' => 'scheduled',
                'label' => 'مجدول',
            ],
        ],
    ],
    [
        'key' => 'page_status',
        'label' => 'حالات الصفحة',
        'desc' => 'حالة الصفحة العامة في إدارة الصفحات. مفاتيحها مرتبطة بسلوك النشر، تُعدَّل تسميتها وترتيبها فقط.',
        'pages' => [
            'الصفحات',
        ],
        'fixed' => true,
        'lock' => [],
        'items' => [
            [
                'key' => 'published',
                'label' => 'منشورة',
            ],
            [
                'key' => 'draft',
                'label' => 'مسودة',
            ],
            [
                'key' => 'hidden',
                'label' => 'مخفية',
                'note' => 'لا تظهر في القوائم والبحث',
            ],
        ],
    ],
    [
        'key' => 'visibility',
        'label' => 'حالة الظهور في الموقع',
        'desc' => 'فلتر الظهور في القصص والأنشطة والشركاء والأسئلة والإعلانات وخريطة الأثر.',
        'pages' => [
            'القصص',
            'الأنشطة',
            'الشركاء',
            'الأسئلة الشائعة',
            'نداء الإغاثة',
            'خريطة الأثر',
        ],
        'fixed' => true,
        'lock' => [],
        'items' => [
            [
                'key' => 'visible',
                'label' => 'ظاهر في الموقع',
            ],
            [
                'key' => 'hidden',
                'label' => 'مخفي',
            ],
        ],
    ],
    [
        'key' => 'gallery_album',
        'label' => 'ألبومات المعرض',
        'desc' => 'الألبوم في معرض الصور (نقل الصور وتفاصيل الصورة).',
        'pages' => [
            'معرض الصور',
        ],
        'fixed' => false,
        'lock' => [],
        'items' => [
            [
                'key' => 'field',
                'label' => 'توثيق الميدان',
            ],
            [
                'key' => 'relief',
                'label' => 'الإغاثة',
            ],
            [
                'key' => 'development',
                'label' => 'التعليم والتنمية',
            ],
            [
                'key' => 'health',
                'label' => 'الصحة والمياه',
            ],
        ],
    ],
    [
        'key' => 'section_anchor',
        'label' => 'أقسام الموقع (وجهات الروابط)',
        'desc' => 'وجهة الرابط في القصص والأنشطة والإعلانات ونداء الإغاثة.',
        'pages' => [
            'القصص',
            'الأنشطة',
            'نداء الإغاثة',
        ],
        'fixed' => false,
        'lock' => [],
        'items' => [
            [
                'key' => '#hero',
                'label' => 'الرئيسية',
            ],
            [
                'key' => '#about',
                'label' => 'من نحن',
            ],
            [
                'key' => '#projects',
                'label' => 'المشاريع',
            ],
            [
                'key' => '#stories',
                'label' => 'قصص من الميدان',
            ],
            [
                'key' => '#activities',
                'label' => 'الأنشطة الميدانية',
            ],
            [
                'key' => '#appeal',
                'label' => 'نداء الإغاثة',
            ],
            [
                'key' => '#impact-map',
                'label' => 'خريطة الأثر',
            ],
            [
                'key' => '#news',
                'label' => 'الأخبار',
            ],
            [
                'key' => '#partners',
                'label' => 'الشركاء',
            ],
            [
                'key' => '#gallery',
                'label' => 'معرض الصور',
            ],
            [
                'key' => '#contact',
                'label' => 'التواصل',
            ],
            [
                'key' => '#faq',
                'label' => 'الأسئلة الشائعة',
            ],
        ],
    ],
    [
        'key' => 'icon',
        'label' => 'الأيقونات',
        'desc' => 'قائمة الأيقونات في القصص والأنشطة والشركاء. المفتاح اسم أيقونة Material Symbols.',
        'pages' => [
            'القصص',
            'الأنشطة',
            'الشركاء',
        ],
        'fixed' => false,
        'lock' => [],
        'items' => [
            [
                'key' => 'shopping_basket',
                'label' => 'سلة غذائية',
            ],
            [
                'key' => 'diversity_3',
                'label' => 'فرق التطوع',
            ],
            [
                'key' => 'menu_book',
                'label' => 'التعليم',
            ],
            [
                'key' => 'medical_services',
                'label' => 'الرعاية الطبية',
            ],
            [
                'key' => 'water_drop',
                'label' => 'المياه',
            ],
            [
                'key' => 'camping',
                'label' => 'الخيام',
            ],
            [
                'key' => 'restaurant',
                'label' => 'الوجبات',
            ],
            [
                'key' => 'groups',
                'label' => 'المستفيدون',
            ],
            [
                'key' => 'group',
                'label' => 'مجموعة',
            ],
            [
                'key' => 'school',
                'label' => 'المدرسة',
            ],
            [
                'key' => 'child_care',
                'label' => 'الأطفال',
            ],
            [
                'key' => 'public',
                'label' => 'دولي',
            ],
            [
                'key' => 'nutrition',
                'label' => 'الأمن الغذائي',
            ],
            [
                'key' => 'emergency',
                'label' => 'إغاثة عاجلة',
            ],
            [
                'key' => 'shield',
                'label' => 'حماية',
            ],
            [
                'key' => 'handshake',
                'label' => 'شراكة',
            ],
            [
                'key' => 'favorite',
                'label' => 'عطاء',
            ],
            [
                'key' => 'local_shipping',
                'label' => 'قوافل',
            ],
            [
                'key' => 'health_and_safety',
                'label' => 'السلامة الصحية',
            ],
        ],
    ],
    [
        'key' => 'badge_tone',
        'label' => 'ألوان وسم الصورة',
        'desc' => 'لون الوسم في الأنشطة الميدانية.',
        'pages' => [
            'الأنشطة',
        ],
        'fixed' => true,
        'lock' => [],
        'items' => [
            [
                'key' => 'forest',
                'label' => 'أخضر داكن',
            ],
            [
                'key' => 'gold',
                'label' => 'ذهبي',
            ],
            [
                'key' => 'mid',
                'label' => 'أخضر متوسط',
            ],
        ],
    ],
    [
        'key' => 'timezone',
        'label' => 'المناطق الزمنية',
        'desc' => 'المنطقة الزمنية في الإعدادات العامة. المفتاح معرّف IANA.',
        'pages' => [
            'الإعدادات',
        ],
        'fixed' => false,
        'lock' => [],
        'items' => [
            [
                'key' => 'Asia/Gaza',
                'label' => 'غزة (GMT+3)',
            ],
            [
                'key' => 'Asia/Hebron',
                'label' => 'الخليل (GMT+3)',
            ],
            [
                'key' => 'Africa/Cairo',
                'label' => 'القاهرة (GMT+3)',
            ],
            [
                'key' => 'Asia/Amman',
                'label' => 'عمّان (GMT+3)',
            ],
            [
                'key' => 'Asia/Riyadh',
                'label' => 'الرياض (GMT+3)',
            ],
            [
                'key' => 'Europe/Istanbul',
                'label' => 'إسطنبول (GMT+3)',
            ],
            [
                'key' => 'Asia/Dubai',
                'label' => 'دبي (GMT+4)',
            ],
            [
                'key' => 'Europe/London',
                'label' => 'لندن',
            ],
            [
                'key' => 'UTC',
                'label' => 'التوقيت العالمي UTC',
            ],
        ],
    ],
    [
        'key' => 'language',
        'label' => 'لغات اللوحة',
        'desc' => 'لغة واجهة الإدارة. المفاتيح مرتبطة بالواجهة، تُعدَّل تسميتها وترتيبها فقط.',
        'pages' => [
            'الإعدادات',
        ],
        'fixed' => true,
        'lock' => [],
        'items' => [
            [
                'key' => 'ar',
                'label' => 'العربية',
            ],
            [
                'key' => 'en',
                'label' => 'English',
            ],
        ],
    ],
    [
        'key' => 'date_format',
        'label' => 'تنسيقات التاريخ',
        'desc' => 'تنسيق التاريخ في الإعدادات العامة. المفاتيح مرتبطة بدالة التنسيق، تُعدَّل تسميتها وترتيبها فقط.',
        'pages' => [
            'الإعدادات',
        ],
        'fixed' => true,
        'lock' => [],
        'items' => [
            [
                'key' => 'long',
                'label' => 'طويل',
            ],
            [
                'key' => 'short',
                'label' => 'مختصر',
            ],
            [
                'key' => 'iso',
                'label' => 'رقمي',
            ],
        ],
    ],
    [
        'key' => 'digest_frequency',
        'label' => 'تكرار الملخص والنسخ الاحتياطي',
        'desc' => 'تكرار الملخص الدوري وجدولة النسخ الاحتياطي (قائمة مشتركة).',
        'pages' => [
            'الإعدادات',
        ],
        'fixed' => true,
        'lock' => [
            'off',
        ],
        'items' => [
            [
                'key' => 'off',
                'label' => 'متوقف',
            ],
            [
                'key' => 'daily',
                'label' => 'يومي',
            ],
            [
                'key' => 'weekly',
                'label' => 'أسبوعي',
            ],
            [
                'key' => 'monthly',
                'label' => 'شهري',
            ],
        ],
    ],
    [
        'key' => 'digest_day',
        'label' => 'أيام إرسال الملخص',
        'desc' => 'يوم إرسال الملخص الأسبوعي في الإشعارات.',
        'pages' => [
            'الإعدادات',
        ],
        'fixed' => false,
        'lock' => [],
        'items' => [
            [
                'key' => 'sat',
                'label' => 'السبت',
            ],
            [
                'key' => 'sun',
                'label' => 'الأحد',
            ],
            [
                'key' => 'mon',
                'label' => 'الاثنين',
            ],
            [
                'key' => 'thu',
                'label' => 'الخميس',
            ],
        ],
    ],
    [
        'key' => 'password_expiry',
        'label' => 'مدد انتهاء كلمة المرور',
        'desc' => 'خيارات انتهاء الصلاحية في إعدادات الأمان.',
        'pages' => [
            'الإعدادات',
        ],
        'fixed' => false,
        'lock' => [
            'never',
        ],
        'items' => [
            [
                'key' => 'never',
                'label' => 'لا تنتهي',
            ],
            [
                'key' => '30',
                'label' => 'كل 30 يوماً',
            ],
            [
                'key' => '60',
                'label' => 'كل 60 يوماً',
            ],
            [
                'key' => '90',
                'label' => 'كل 90 يوماً',
            ],
            [
                'key' => '180',
                'label' => 'كل 180 يوماً',
            ],
        ],
    ],
    [
        'key' => 'session_timeout',
        'label' => 'مهل الجلسة',
        'desc' => 'خيارات مهلة الخروج التلقائي (بالدقائق) في إعدادات الأمان.',
        'pages' => [
            'الإعدادات',
        ],
        'fixed' => false,
        'lock' => [],
        'items' => [
            [
                'key' => '15',
                'label' => '15 دقيقة',
            ],
            [
                'key' => '30',
                'label' => '30 دقيقة',
            ],
            [
                'key' => '60',
                'label' => 'ساعة',
            ],
            [
                'key' => '240',
                'label' => '4 ساعات',
            ],
            [
                'key' => '480',
                'label' => '8 ساعات',
            ],
        ],
    ],
    [
        'key' => 'audit_type',
        'label' => 'أنواع أحداث السجل',
        'desc' => 'فلتر نوع الحدث في سجل النشاط. المفاتيح مرتبطة بالأحداث، تُعدَّل تسميتها وترتيبها فقط.',
        'pages' => [
            'الإعدادات',
        ],
        'fixed' => true,
        'lock' => [],
        'items' => [
            [
                'key' => 'settings',
                'label' => 'الإعدادات',
            ],
            [
                'key' => 'users',
                'label' => 'المستخدمون',
            ],
            [
                'key' => 'security',
                'label' => 'الأمان',
            ],
            [
                'key' => 'content',
                'label' => 'المحتوى',
            ],
            [
                'key' => 'integrations',
                'label' => 'التكاملات',
            ],
            [
                'key' => 'backup',
                'label' => 'النسخ',
            ],
        ],
    ],
];
