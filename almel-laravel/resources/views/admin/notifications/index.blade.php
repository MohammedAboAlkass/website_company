@extends('layouts.admin')
@section('title', 'الإشعارات')
@section('page', 'notifications')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-content.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-live.css') }}">
@endpush
@section('content')
@php
  $hasFilters = $q !== '' || $type !== '' || $filter === 'unread';
  $keep = array_filter(['type' => $type, 'q' => $q]);
@endphp
        <div class="page-head">
          <div><h1 class="page-title">الإشعارات</h1><p class="page-sub">تنبيهات داخل اللوحة بحسب صلاحياتك: الرسائل، النشرة، الأخبار، المستخدمون، النسخ الاحتياطي، الصيانة والأمان. لا يُرسل أي بريد.</p></div>
          <div class="page-actions">
            @if ($counts['unread'] > 0)
              <form method="POST" action="{{ route('admin.notifications.read-all') }}">@csrf<button type="submit" class="btn btn-secondary"><span class="material-symbols-outlined" aria-hidden="true">done_all</span>تعليم الكل كمقروء</button></form>
            @endif
            <form method="POST" action="{{ route('admin.notifications.clear-read') }}" data-confirm="سيتم حذف جميع إشعاراتك المقروءة نهائياً. الإشعارات غير المقروءة لن تتأثر." data-confirm-title="حذف الإشعارات المقروءة؟" data-confirm-label="حذف المقروءة" data-tone="danger">@csrf<button type="submit" class="btn btn-ghost"><span class="material-symbols-outlined" aria-hidden="true">delete_sweep</span>حذف المقروءة</button></form>
          </div>
        </div>

        <section class="card" aria-labelledby="t-nt">
          <h2 class="sr-only" id="t-nt">قائمة الإشعارات</h2>
          <form class="toolbar" method="GET" action="{{ route('admin.notifications.index') }}" role="search">
            <div class="seg lv-seg" role="group" aria-label="التصفية">
              <a class="btn btn-sm {{ $filter === 'all' ? 'btn-primary' : 'btn-ghost' }}" href="{{ route('admin.notifications.index', $keep) }}" @if ($filter === 'all') aria-current="true" @endif>الكل<span class="lv-n">{{ $counts['all'] }}</span></a>
              <a class="btn btn-sm {{ $filter === 'unread' ? 'btn-primary' : 'btn-ghost' }}" href="{{ route('admin.notifications.index', $keep + ['f' => 'unread']) }}" @if ($filter === 'unread') aria-current="true" @endif>غير المقروءة<span class="lv-n">{{ $counts['unread'] }}</span></a>
            </div>
            <input type="hidden" name="f" value="{{ $filter === 'unread' ? 'unread' : '' }}">
            <label class="sr-only" for="n-type">النوع</label>
            <select class="select sm auto" id="n-type" name="type" onchange="this.form.submit()">
              <option value="">كل الأنواع</option>
              @foreach ($types as $k => $label)<option value="{{ $k }}" @selected($type === $k)>{{ $label }}</option>@endforeach
            </select>
            <label class="input-icon"><span class="sr-only">بحث في الإشعارات</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" name="q" type="search" value="{{ $q }}" placeholder="ابحث في الإشعارات…" autocomplete="off" maxlength="80"></label>
            <button type="submit" class="btn btn-secondary btn-sm"><span class="material-symbols-outlined" aria-hidden="true">filter_alt</span>تطبيق</button>
            @if ($hasFilters)<a class="btn btn-ghost btn-sm" href="{{ route('admin.notifications.index') }}">مسح التصفية</a>@endif
            <span class="grow"></span>
            <span class="muted" style="font-size:13px" aria-live="polite">{{ $page->total() }} نتيجة</span>
          </form>

          @if (count($items))
            <ul class="nt-list">
              @foreach ($items as $n)
                <li class="nt-item {{ $n['unread'] ? 'unread' : '' }}">
                  <span class="ico tone-{{ $n['tone'] }}" aria-hidden="true"><span class="material-symbols-outlined">{{ $n['icon'] }}</span></span>
                  <div class="nt-body">
                    <a class="nt-title" href="{{ route('admin.notifications.show', $n['id']) }}">{{ $n['title'] }}@if ($n['unread'])<span class="sr-only"> (غير مقروء)</span>@endif</a>
                    @if ($n['text'] !== '')<p>{{ $n['text'] }}</p>@endif
                    <small class="muted"><span class="pill pill-neutral">{{ $n['label'] }}</span> <time dir="ltr">{{ $n['at'] }}</time></small>
                  </div>
                  <div class="nt-actions">
                    <form method="POST" action="{{ route('admin.notifications.read', $n['id']) }}">@csrf @method('PATCH')<input type="hidden" name="read" value="{{ $n['unread'] ? '1' : '0' }}"><button type="submit" class="btn btn-ghost btn-sm">{{ $n['unread'] ? 'تعليم كمقروء' : 'إعادة كغير مقروء' }}</button></form>
                    <form method="POST" action="{{ route('admin.notifications.destroy', $n['id']) }}" data-confirm="سيتم حذف هذا الإشعار من قائمتك." data-confirm-title="حذف الإشعار؟" data-confirm-label="نعم، احذف" data-tone="danger">@csrf @method('DELETE')<button type="submit" class="btn btn-ghost btn-sm">حذف</button></form>
                  </div>
                </li>
              @endforeach
            </ul>
          @else
            <div class="lv-empty"><span class="material-symbols-outlined" aria-hidden="true">notifications_off</span><strong>{{ $hasFilters ? 'لا توجد إشعارات مطابقة' : 'لا توجد إشعارات حتى الآن' }}</strong><span>{{ $hasFilters ? 'جرّب تغيير التصفية أو البحث.' : 'ستظهر هنا التنبيهات الجديدة، مثل الرسائل الواردة والمشتركين الجدد.' }}</span></div>
          @endif

          @if ($page->hasPages())
            <div class="lv-pager">
              @if ($page->previousPageUrl())<a class="btn btn-ghost btn-sm" href="{{ $page->previousPageUrl() }}">السابق</a>@else<span></span>@endif
              <span class="muted">صفحة {{ $page->currentPage() }} من {{ $page->lastPage() }}</span>
              @if ($page->nextPageUrl())<a class="btn btn-ghost btn-sm" href="{{ $page->nextPageUrl() }}">التالي</a>@else<span></span>@endif
            </div>
          @endif
        </section>
@endsection
@push('constants')
<script>window.__DB_PAGES = Object.assign(window.__DB_PAGES || {}, { notifications: 1 });</script>
@endpush
