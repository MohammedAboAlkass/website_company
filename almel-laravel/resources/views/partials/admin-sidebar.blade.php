@php
  $user = auth()->user();
  $counts = \App\Support\AdminStats::sidebar();
  $orgName = \App\Models\Setting::query()->where('key', 'org.name')->value('value') ?: 'جمعية الشمال للتنمية والتطوير المجتمعي';
  $currentPage = trim($__env->yieldContent('page'));

  $navGroups = [
    [
      'group' => 'عام',
      'items' => [
        ['id' => 'index', 'href' => url('/admin'), 'icon' => 'space_dashboard', 'label' => 'نظرة عامة'],
        ['id' => 'reports', 'href' => url('/admin/reports'), 'icon' => 'monitoring', 'label' => 'التقارير والإحصائيات'],
      ]
    ],
    [
      'group' => 'المحتوى',
      'items' => [
        ['id' => 'homepage', 'href' => url('/admin/homepage'), 'icon' => 'home', 'label' => 'الصفحة الرئيسية'],
        ['id' => 'hero', 'perm' => 'homepage.view', 'href' => url('/admin/hero'), 'icon' => 'slideshow', 'label' => 'إعدادات الهيرو'],
        ['id' => 'projects', 'perm' => 'projects.view', 'href' => url('/admin/projects'), 'icon' => 'volunteer_activism', 'label' => 'إدارة المشاريع', 'count' => $counts['projects'] ?? 0, 'countLabel' => 'مشروعاً'],
        ['id' => 'news', 'perm' => 'news.view', 'href' => url('/admin/news'), 'icon' => 'newspaper', 'label' => 'الأخبار', 'count' => $counts['news_drafts'] ?? 0, 'countLabel' => 'مسودات'],
        ['id' => 'tags', 'perm' => 'tags.view', 'href' => url('/admin/tags'), 'icon' => 'sell', 'label' => 'الوسوم'],
        ['id' => 'gallery', 'perm' => 'gallery.view', 'href' => url('/admin/gallery'), 'icon' => 'photo_library', 'label' => 'معرض الصور'],
        ['id' => 'media', 'perm' => 'media.view', 'href' => url('/admin/media'), 'icon' => 'perm_media', 'label' => 'مكتبة الوسائط'],
        ['id' => 'stories', 'perm' => 'stories.view', 'href' => url('/admin/stories'), 'icon' => 'format_quote', 'label' => 'قصص الميدان'],
        ['id' => 'activities', 'perm' => 'activities.view', 'href' => url('/admin/activities'), 'icon' => 'event_available', 'label' => 'الأنشطة الميدانية'],
        ['id' => 'partners', 'perm' => 'partners.view', 'href' => url('/admin/partners'), 'icon' => 'handshake', 'label' => 'الشركاء'],
        ['id' => 'faq', 'perm' => 'faq.view', 'href' => url('/admin/faq'), 'icon' => 'help', 'label' => 'الأسئلة الشائعة'],
        ['id' => 'appeal', 'perm' => 'appeal.view', 'href' => url('/admin/appeal'), 'icon' => 'campaign', 'label' => 'نداء الإغاثة'],
        ['id' => 'announcements', 'perm' => 'announcements.view', 'href' => url('/admin/announcements'), 'icon' => 'notifications_active', 'label' => 'الإعلانات'],
        ['id' => 'impact', 'perm' => 'impact.view', 'href' => url('/admin/impact'), 'icon' => 'map', 'label' => 'خريطة الأثر'],
        ['id' => 'vision', 'perm' => 'vision.view', 'href' => url('/admin/vision'), 'icon' => 'visibility', 'label' => 'الرؤية والرسالة والقيم'],
        ['id' => 'pages', 'perm' => 'pages.view', 'href' => url('/admin/pages'), 'icon' => 'web', 'label' => 'إدارة الصفحات'],
        ['id' => 'site-texts', 'perm' => 'pages.view', 'href' => url('/admin/site-texts'), 'icon' => 'edit_note', 'label' => 'نصوص الموقع'],
        ['id' => 'menu', 'perm' => 'menu.view', 'href' => url('/admin/menu'), 'icon' => 'menu_open', 'label' => 'إدارة القائمة'],
      ]
    ],
    [
      'group' => 'التواصل',
      'items' => [
        ['id' => 'messages', 'perm' => 'messages.view', 'href' => url('/admin/messages'), 'icon' => 'inbox', 'label' => 'الرسائل والطلبات', 'count' => $counts['messages_unread'] ?? 0, 'countLabel' => 'غير مقروءة', 'accent' => true],
        ['id' => 'newsletter', 'perm' => 'messages.view', 'href' => url('/admin/newsletter'), 'icon' => 'mark_email_read', 'label' => 'المشتركون'],
      ]
    ],
    [
      'group' => 'النظام',
      'items' => [
        ['id' => 'users', 'adminOnly' => true, 'href' => url('/admin/users'), 'icon' => 'manage_accounts', 'label' => 'المستخدمون'],
        ['id' => 'roles', 'perm' => 'roles.view', 'href' => url('/admin/roles'), 'icon' => 'admin_panel_settings', 'label' => 'الأدوار والصلاحيات'],
        ['id' => 'backup', 'adminOnly' => true, 'href' => url('/admin/backup'), 'icon' => 'backup', 'label' => 'النسخ الاحتياطي'],
        ['id' => 'audit', 'perm' => 'audit.view', 'href' => url('/admin/audit-logs'), 'icon' => 'history', 'label' => 'سجل العمليات'],
        ['id' => 'settings', 'adminOnly' => true, 'href' => url('/admin/settings'), 'icon' => 'settings', 'label' => 'الإعدادات'],
      ]
    ]
  ];
@endphp

<div class="sb-head">
  <a class="sb-brand" href="{{ url('/admin') }}" data-tip="{{ $orgName }}">
    <span class="brand-mark"><img src="{{ asset('assets/site/img/logo.png') }}" alt="شعار الجمعية" width="44" height="44"></span>
    <span class="sb-brand-text"><strong>{{ $orgName }}</strong><small>لوحة التحكم</small></span>
  </a>
  <button type="button" class="sb-collapse" id="sb-collapse" aria-controls="sidebar" aria-expanded="true" aria-label="طي القائمة الجانبية" data-tip="توسيع القائمة">
    <span class="material-symbols-outlined" aria-hidden="true">right_panel_close</span>
  </button>
  <button type="button" class="sb-close" id="sb-close" aria-label="إغلاق القائمة">
    <span class="material-symbols-outlined" aria-hidden="true">close</span>
  </button>
</div>

<nav class="sb-nav" aria-label="التنقل في لوحة التحكم">
  @foreach ($navGroups as $gi => $g)
    @php
      $visibleItems = array_filter($g['items'], function ($it) use ($user) {
        if (!empty($it['adminOnly']) && !$user?->isSuperAdmin()) return false;
        if (!empty($it['perm']) && !$user?->hasPermission($it['perm'])) return false;
        return true;
      });
    @endphp
    @if (count($visibleItems) > 0)
      <div class="sb-group">
        <p class="sb-group-label" id="sbg-{{ $gi }}">{{ $g['group'] }}</p>
        <ul aria-labelledby="sbg-{{ $gi }}">
          @foreach ($visibleItems as $it)
            @php
              $isActive = ($currentPage === $it['id']) || (isset($it['parent']) && $currentPage === $it['parent']);
              $count = $it['count'] ?? 0;
            @endphp
            <li>
              <a class="sb-link" href="{{ $it['href'] }}" data-tip="{{ $it['label'] }}" @if($isActive) aria-current="page" @endif>
                <span class="material-symbols-outlined" aria-hidden="true">{{ $it['icon'] }}</span>
                <span class="sb-label">{{ $it['label'] }}</span>
                @if ($count > 0)
                  <span class="sb-count {{ !empty($it['accent']) ? 'is-accent' : '' }}" data-count="{{ $it['id'] }}" aria-hidden="true">{{ $count }}</span>
                  <span class="sr-only" data-count-sr="{{ $it['id'] }}">، {{ $count }} {{ $it['countLabel'] ?? '' }}</span>
                @endif
              </a>
            </li>
          @endforeach
        </ul>
      </div>
    @endif
  @endforeach
</nav>

<div class="sb-foot">
  <div class="sb-user">
    <span class="avatar" aria-hidden="true" data-me-avatar data-ini="{{ mb_substr($user?->name ?? 'م', 0, 1) }}">
      @if ($user?->avatarUrl())
        <img src="{{ $user->avatarUrl() }}" alt="">
      @else
        {{ mb_substr($user?->name ?? 'م', 0, 1) }}
      @endif
    </span>
    <div class="sb-user-meta">
      <strong>{{ $user?->name ?? $user?->email }}</strong>
      <span>{{ $user?->roleLabel() ?? $user?->role }}</span>
    </div>
    <button type="button" class="sb-user-btn" data-logout aria-label="تسجيل الخروج" data-tip="تسجيل الخروج">
      <span class="material-symbols-outlined flip-rtl" aria-hidden="true">logout</span>
    </button>
  </div>
</div>
