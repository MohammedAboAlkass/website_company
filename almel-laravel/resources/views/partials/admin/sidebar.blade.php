<aside class="sidebar" id="sidebar">
  <nav>
    <a href="{{ route('admin.dashboard') }}">لوحة التحكم</a>
    <a href="{{ route('admin.projects.index') }}">المشاريع</a>
    <a href="{{ route('admin.articles.index') }}">الأخبار</a>
    <a href="{{ route('admin.messages.index') }}">الرسائل</a>
    <a href="{{ route('admin.pages.index') }}">الصفحات</a>
    <a href="{{ route('admin.media.index') }}">الوسائط</a>
    @if(auth()->user()->isAdmin())
      <a href="{{ route('admin.settings.index') }}">الإعدادات</a>
      <a href="{{ route('admin.users.index') }}">المستخدمون</a>
    @endif
  </nav>
</aside>
