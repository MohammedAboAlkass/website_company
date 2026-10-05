@extends('layouts.admin')
@section('title', 'الأدوار والصلاحيات')
@section('page', 'roles')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-roles.css') }}">
@endpush
@section('content')
        <div class="page-head">
          <div><h1 class="page-title">الأدوار والصلاحيات</h1><p class="page-sub">تحكّم بما يستطيع كل دور رؤيته وفعله في لوحة التحكم. تُطبَّق الصلاحيات على الخادم وفي القوائم والأزرار معاً.</p></div>
          <div class="page-actions">
            <a class="btn btn-secondary" href="{{ route('admin.users.index') }}" data-perm="users.view"><span class="material-symbols-outlined" aria-hidden="true">manage_accounts</span>المستخدمون</a>
            <button type="button" class="btn btn-primary" id="rl-new" data-perm="roles.create"><span class="material-symbols-outlined" aria-hidden="true">add_moderator</span>دور جديد</button>
          </div>
        </div>

        <div class="rl" id="rl">
          <aside class="card rl-list" aria-label="قائمة الأدوار">
            <div class="rl-list-head">
              <label class="input-icon"><span class="sr-only">بحث في الأدوار</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" id="rl-q" type="search" placeholder="ابحث في الأدوار…" autocomplete="off"></label>
              <p class="rl-list-count" id="rl-count" aria-live="polite"></p>
            </div>
            <ul class="rl-items" id="rl-items" role="listbox" aria-label="الأدوار">
              <li class="rl-skel" aria-hidden="true"><span></span><span></span></li>
              <li class="rl-skel" aria-hidden="true"><span></span><span></span></li>
              <li class="rl-skel" aria-hidden="true"><span></span><span></span></li>
            </ul>
          </aside>
          <section class="card rl-detail" id="rl-detail" aria-live="polite">
            <div class="rl-loading"><span class="material-symbols-outlined" aria-hidden="true">progress_activity</span><p>جارٍ تحميل الأدوار…</p></div>
          </section>
        </div>
        <noscript><p class="muted">تحتاج هذه الصفحة إلى تفعيل جافاسكربت.</p></noscript>
@endsection
@push('scripts')
<script>window.__ROLES_BOOT = {!! json_encode($boot, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_PARTIAL_OUTPUT_ON_ERROR) !!};</script>
<script src="{{ asset('assets/admin/js/admin-roles.js') }}"></script>
@endpush
