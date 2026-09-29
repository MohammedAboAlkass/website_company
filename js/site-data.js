/* =========================================================
   PAGES_DATA — content for project.html and article.html
   Generated from the same source as projects.html / news.html.
   Real text is copied from index.html. PLACEHOLDER fields:
     • projects[].goal / raised  → sample amounts (index.html only
       publishes the % progress). Shown with an "أرقام تجريبية" badge.
     • projects[] with sample:true → framing/progress are sample.
     • news[] with sample:true → headline reused from the sample
       ticker; excerpt/date are placeholders.
     • article bodies and project updates are generated as clearly
       marked placeholder text in js/pages.js.
   ========================================================= */
window.PAGES_DATA = {
 "projects": [
  {
   "id": "relief",
   "cat": "relief",
   "catLabel": "إغاثة وطوارئ",
   "catIcon": "crisis_alert",
   "title": "برنامج الإطعام الطارئ ومخابز غزة",
   "image": "img/project-relief.jpg",
   "alt": "توزيع مساعدات غذائية في شمال غزة",
   "badge": {
    "cls": "badge-urgent",
    "icon": null,
    "text": "أولوية قصوى",
    "live": true
   },
   "loc": "شمال غزة — جباليا",
   "desc": "تأمين الطحين والوقود لتشغيل 4 مخابز خيرية وتوزيع وجبات ساخنة يومية على 12,000 نازح في جباليا وبيت حانون.",
   "facts": [
    {
     "dt": "النطاق",
     "dd": "4 مخابز مركزية",
     "accent": false
    },
    {
     "dt": "المستفيدون",
     "dd": "12,000 يومياً",
     "accent": true
    }
   ],
   "progress": 86,
   "bar": "gold",
   "sample": false,
   "goal": 120000,
   "raised": 103200,
   "covers": [
    {
     "icon": "bakery_dining",
     "title": "الطحين للمخابز",
     "text": "تأمين الطحين لتشغيل 4 مخابز خيرية مركزية."
    },
    {
     "icon": "local_gas_station",
     "title": "وقود التشغيل",
     "text": "الوقود اللازم لاستمرار عمل المخابز يومياً."
    },
    {
     "icon": "restaurant",
     "title": "وجبات ساخنة",
     "text": "وجبات يومية للنازحين في جباليا وبيت حانون."
    }
   ],
   "gallery": [
    {
     "src": "img/project-relief.jpg",
     "caption": "توزيع مساعدات غذائية في شمال غزة"
    },
    {
     "src": "img/project-parallax.jpg",
     "caption": "انتظار الوجبات الساخنة في مراكز الإيواء"
    },
    {
     "src": "img/gallery-lab.jpg",
     "caption": "نظرة داخل نقطة توزيع السلال في غزة المدينة"
    },
    {
     "src": "img/gallery-convoy.jpg",
     "caption": "قافلة الإغاثة الكبرى — توزيع السلال في جباليا"
    }
   ]
  },
  {
   "id": "orphans",
   "cat": "orphan",
   "catLabel": "كفالة الأيتام",
   "catIcon": "child_care",
   "title": "رعاية أيتام غزة والتعليم المؤقت",
   "image": "img/project-orphan.jpg",
   "alt": "طفل يتيم نازح في مدرسة إيواء بغزة",
   "badge": {
    "cls": "badge-forest",
    "icon": "school",
    "text": "مشروع مستدام",
    "live": false
   },
   "loc": "مخيم الشاطئ",
   "desc": "كفالة متكاملة للطعام والكساء والتعلّم في خيم مدرسية داخل مراكز الإيواء، مع متابعة نفسية للأطفال فاقدي ذويهم.",
   "facts": [
    {
     "dt": "الأيتام المكفولون",
     "dd": "500 يتيم",
     "accent": true
    },
    {
     "dt": "المراكز",
     "dd": "6 مجمعات تعليمية",
     "accent": false
    }
   ],
   "progress": 72,
   "bar": "forest",
   "sample": false,
   "goal": 90000,
   "raised": 64800,
   "covers": [
    {
     "icon": "restaurant",
     "title": "الطعام والكساء",
     "text": "كفالة الاحتياجات اليومية للطفل من غذاء وكساء."
    },
    {
     "icon": "school",
     "title": "التعلّم في الخيم",
     "text": "حلقات تعلّم في خيم مدرسية داخل مراكز الإيواء."
    },
    {
     "icon": "psychology",
     "title": "المتابعة النفسية",
     "text": "دعم نفسي للأطفال فاقدي ذويهم."
    }
   ],
   "gallery": [
    {
     "src": "img/project-orphan.jpg",
     "caption": "رعاية أيتام غزة والتعليم المؤقت"
    },
    {
     "src": "img/gallery-children.jpg",
     "caption": "ابتسامة أطفال غزة بعد استلام الحقائب المدرسية"
    },
    {
     "src": "img/gallery-campus.jpg",
     "caption": "أثر كفالة أيتام غزة داخل خيم التعلّم"
    }
   ]
  },
  {
   "id": "water",
   "cat": "water",
   "catLabel": "مياه وإصحاح",
   "catIcon": "water_drop",
   "title": "صهاريج مياه الشرب لمخيمات النزوح",
   "image": "img/project-water.jpg",
   "alt": "توزيع مياه صالحة للشرب في خان يونس",
   "badge": {
    "cls": "badge-light",
    "icon": "water_drop",
    "text": "سقيا الماء",
    "live": false
   },
   "loc": "خان يونس ودير البلح",
   "desc": "تشغيل محطات تحلية متنقلة وصهاريج يومية لثماني نقاط إيواء في خان يونس ودير البلح بعد تضرر الشبكات.",
   "facts": [
    {
     "dt": "نقاط الإيواء",
     "dd": "8 مواقع",
     "accent": true
    },
    {
     "dt": "المستفيدون",
     "dd": "14,000 نسمة",
     "accent": false
    }
   ],
   "progress": 64,
   "bar": "gold",
   "sample": false,
   "goal": 60000,
   "raised": 38400,
   "covers": [
    {
     "icon": "water_drop",
     "title": "محطات تحلية متنقلة",
     "text": "تشغيل محطات تحلية متنقلة بعد تضرر الشبكات."
    },
    {
     "icon": "local_shipping",
     "title": "صهاريج يومية",
     "text": "صهاريج شرب يومية لنقاط الإيواء."
    },
    {
     "icon": "location_on",
     "title": "8 نقاط إيواء",
     "text": "في خان يونس ودير البلح."
    }
   ],
   "gallery": [
    {
     "src": "img/project-water.jpg",
     "caption": "صهاريج مياه الشرب لمخيمات النزوح"
    },
    {
     "src": "img/gallery-water.jpg",
     "caption": "افتتاح نقطة تحلية تسقي 1,200 عائلة نازحة"
    }
   ]
  },
  {
   "id": "shelter",
   "cat": "shelter",
   "catLabel": "إيواء ونزوح",
   "catIcon": "night_shelter",
   "title": "خيام ومستلزمات الإيواء في رفح",
   "image": "img/project-empower.jpg",
   "alt": "توزيع خيام ومستلزمات إيواء في رفح",
   "badge": {
    "cls": "badge-mid",
    "icon": "night_shelter",
    "text": "مأوى عاجل",
    "live": false
   },
   "loc": "رفح",
   "desc": "توزيع خيام عازلة وأغطية وفرش لعائلات نزحت من غزة المدينة والشمال نحو رفح ومحيطها.",
   "facts": [
    {
     "dt": "الخيام",
     "dd": "1,200 خيمة",
     "accent": true
    },
    {
     "dt": "الأسر المأواة",
     "dd": "1,200 أسرة نازحة",
     "accent": false
    }
   ],
   "progress": 58,
   "bar": "forest",
   "sample": false,
   "goal": 150000,
   "raised": 87000,
   "covers": [
    {
     "icon": "camping",
     "title": "خيام عازلة",
     "text": "خيام عازلة للعائلات النازحة."
    },
    {
     "icon": "bed",
     "title": "أغطية وفرش",
     "text": "أغطية وفرش لكل خيمة."
    },
    {
     "icon": "family_restroom",
     "title": "1,200 أسرة",
     "text": "نزحت من غزة المدينة والشمال نحو رفح."
    }
   ],
   "gallery": [
    {
     "src": "img/project-empower.jpg",
     "caption": "خيام ومستلزمات الإيواء في رفح"
    },
    {
     "src": "img/gallery-winter.jpg",
     "caption": "توثيق جوي لتوزيع الأغطية والطرود الشتوية"
    },
    {
     "src": "img/footer-hardship.jpg",
     "caption": "مشهد من الدمار في قطاع غزة"
    }
   ]
  },
  {
   "id": "clinics",
   "cat": "health",
   "catLabel": "الصحة",
   "catIcon": "medical_services",
   "title": "العيادات الميدانية والأدوية المزمنة",
   "image": "img/activity-medical.jpg",
   "alt": "قافلة طبية ميدانية",
   "badge": {
    "cls": "badge-gold",
    "icon": "medical_services",
    "text": "البرنامج الصحي في غزة",
    "live": false
   },
   "loc": "دير البلح",
   "desc": "عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.",
   "facts": [
    {
     "dt": "العيادات",
     "dd": "3 عيادات ميدانية",
     "accent": true
    },
    {
     "dt": "الكشوفات",
     "dd": "8,400 كشف",
     "accent": false
    }
   ],
   "progress": 45,
   "bar": "gold",
   "sample": true,
   "goal": 50000,
   "raised": 22500,
   "covers": [
    {
     "icon": "healing",
     "title": "الجروح والأطفال والتوليد",
     "text": "عيادات خيام لرعاية الحالات الأكثر إلحاحاً."
    },
    {
     "icon": "medication",
     "title": "أدوية مزمنة",
     "text": "صرف الأدوية المزمنة للمرضى في الخيام."
    },
    {
     "icon": "ambulance",
     "title": "تحويلات عاجلة",
     "text": "تحويلات عاجلة داخل وسط القطاع."
    }
   ],
   "gallery": [
    {
     "src": "img/activity-medical.jpg",
     "caption": "تسيير 3 عيادات ميدانية وإجراء 320 تدخلاً"
    },
    {
     "src": "img/gallery-clinic.jpg",
     "caption": "العيادة الميدانية تجري 150 فحصاً في الخيام"
    }
   ]
  },
  {
   "id": "winter",
   "cat": "shelter",
   "catLabel": "إيواء ونزوح",
   "catIcon": "night_shelter",
   "title": "حملة دفء غزة الشتوية",
   "image": "img/activity-winter.jpg",
   "alt": "قافلة إغاثة شتوية",
   "badge": {
    "cls": "badge-forest",
    "icon": "ac_unit",
    "text": "حملة دفء غزة",
    "live": false
   },
   "loc": "مخيمات النزوح في رفح",
   "desc": "إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.",
   "facts": [
    {
     "dt": "الطرود",
     "dd": "10,000 طرد شتوي",
     "accent": true
    },
    {
     "dt": "المستفيدون",
     "dd": "45,200 مستفيد",
     "accent": false
    }
   ],
   "progress": 38,
   "bar": "forest",
   "sample": true,
   "goal": 80000,
   "raised": 30400,
   "covers": [
    {
     "icon": "inventory_2",
     "title": "طرود شتوية",
     "text": "حزم دفء للعائلات في الخيام."
    },
    {
     "icon": "bed",
     "title": "أغطية عازلة",
     "text": "أغطية عازلة تحمي من برد الخيام."
    },
    {
     "icon": "groups",
     "title": "45,200 مستفيد",
     "text": "في مخيمات النزوح جنوب القطاع."
    }
   ],
   "gallery": [
    {
     "src": "img/activity-winter.jpg",
     "caption": "توزيع 10,000 طرد شتوي وأغطية عازلة"
    },
    {
     "src": "img/gallery-winter.jpg",
     "caption": "توثيق جوي لتوزيع الأغطية والطرود الشتوية"
    }
   ]
  }
 ],
 "news": [
  {
   "id": "report-88",
   "cat": "statements",
   "badge": "بيان من غزة",
   "date": "15 ديسمبر 2024",
   "read": "قراءة 4 دقائق",
   "desk": "مكتب توثيق القطاع",
   "ref": "PR-2024-88",
   "title": "نشر تقرير الإغاثة الدوري لغزة وتوسيع مخابز الطوارئ في الجنوب",
   "excerpt": "أعلن الفريق الميداني إقفال دورة التوزيع بنسبة توثيق 98.4%، مع تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح.",
   "image": "img/news-conference.jpg",
   "alt": "إحاطة إعلامية عن إغاثة غزة",
   "sample": false,
   "highlights": [
    "نسبة توثيق دورة التوزيع: 98.4%",
    "تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح"
   ],
   "catLabel": "بيانات وتقارير"
  },
  {
   "id": "orphans-500",
   "cat": "orphans",
   "badge": "أيتام غزة",
   "date": "10 ديسمبر 2024",
   "read": "",
   "desk": "",
   "ref": "",
   "title": "فتح باب كفالة 500 يتيم نازح من شمال غزة وجباليا",
   "excerpt": "تغطي الكفالة الوجبة اليومية والكساء والحقيبة التعليمية داخل خيم الإيواء طوال العام الدراسي المؤقت.",
   "image": "img/gallery-children.jpg",
   "alt": "أطفال يبتسمون في أحد مراكز الإيواء",
   "sample": false,
   "highlights": [
    "500 يتيم نازح من شمال غزة وجباليا",
    "تشمل الكفالة الوجبة اليومية والكساء والحقيبة التعليمية",
    "آخر موعد: 30 يناير 2025"
   ],
   "catLabel": "أيتام غزة"
  },
  {
   "id": "tracking-map",
   "cat": "field",
   "badge": "توثيق الميدان",
   "date": "28 نوفمبر 2024",
   "read": "",
   "desk": "غرفة عمليات غزة",
   "ref": "",
   "title": "إطلاق خريطة تتبع السلال داخل قطاع غزة",
   "excerpt": "منظومة تتيح للمتبرع متابعة وصول كل سلة غذائية إلى العائلة النازحة وتوثيقها بالصورة من الخيمة.",
   "image": "img/gallery-lab.jpg",
   "alt": "شاشة حاسوب لمتابعة التوزيع",
   "sample": false,
   "highlights": [
    "متابعة وصول كل سلة غذائية إلى العائلة النازحة",
    "توثيق التسليم بالصورة من الخيمة"
   ],
   "catLabel": "توثيق الميدان"
  },
  {
   "id": "winter-campaign",
   "cat": "activities",
   "badge": "حملة دفء غزة",
   "date": "نوفمبر - ديسمبر 2024",
   "read": "",
   "desk": "",
   "ref": "",
   "title": "توزيع 10,000 طرد شتوي وأغطية عازلة",
   "excerpt": "إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.",
   "image": "img/activity-winter.jpg",
   "alt": "قافلة إغاثة شتوية",
   "sample": false,
   "highlights": [
    "10,000 طرد شتوي وأغطية عازلة",
    "45,200 مستفيد",
    "مخيمات النزوح في رفح"
   ],
   "catLabel": "أنشطة ميدانية"
  },
  {
   "id": "field-clinics",
   "cat": "activities",
   "badge": "البرنامج الصحي في غزة",
   "date": "أكتوبر 2024",
   "read": "",
   "desk": "",
   "ref": "",
   "title": "تسيير 3 عيادات ميدانية وإجراء 320 تدخلاً",
   "excerpt": "عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.",
   "image": "img/activity-medical.jpg",
   "alt": "قافلة طبية ميدانية",
   "sample": false,
   "highlights": [
    "3 عيادات ميدانية",
    "320 تدخلاً",
    "8,400 كشف",
    "دير البلح"
   ],
   "catLabel": "أنشطة ميدانية"
  },
  {
   "id": "learning-tent",
   "cat": "orphans",
   "badge": "تعليم النازحين",
   "date": "سبتمبر 2024",
   "read": "",
   "desk": "",
   "ref": "",
   "title": "افتتاح الخيمة التعليمية السادسة لأيتام غزة",
   "excerpt": "احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.",
   "image": "img/activity-graduate.jpg",
   "alt": "تخريج دفعة تمكين مهني",
   "sample": false,
   "highlights": [
    "الخيمة التعليمية السادسة",
    "210 طالب نازح",
    "خان يونس"
   ],
   "catLabel": "أيتام غزة"
  },
  {
   "id": "flour-convoy",
   "cat": "field",
   "badge": "توثيق الميدان",
   "date": "تاريخ تجريبي",
   "read": "",
   "desk": "",
   "ref": "",
   "title": "وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح",
   "excerpt": "نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.",
   "image": "img/gallery-convoy.jpg",
   "alt": "قافلة إغاثة",
   "sample": true,
   "highlights": [],
   "catLabel": "توثيق الميدان"
  },
  {
   "id": "water-point",
   "cat": "activities",
   "badge": "أنشطة ميدانية",
   "date": "تاريخ تجريبي",
   "read": "",
   "desk": "",
   "ref": "",
   "title": "تشغيل نقطة مياه شرب إضافية في شمال القطاع",
   "excerpt": "نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.",
   "image": "img/gallery-water.jpg",
   "alt": "مياه شرب",
   "sample": true,
   "highlights": [],
   "catLabel": "أنشطة ميدانية"
  },
  {
   "id": "quarterly-report",
   "cat": "statements",
   "badge": "بيانات وتقارير",
   "date": "تاريخ تجريبي",
   "read": "",
   "desk": "",
   "ref": "",
   "title": "تقرير الأثر الربعي متاح قريباً في المركز الإعلامي",
   "excerpt": "نص تجريبي: يُستبدل بملخص التقرير عند نشره من المكتب الإعلامي.",
   "image": "img/project-parallax.jpg",
   "alt": "انتظار الوجبات في مراكز الإيواء",
   "sample": true,
   "highlights": [],
   "catLabel": "بيانات وتقارير"
  }
 ]
};
