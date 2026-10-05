@extends('layouts.admin')
@section('title', 'المشتركون')
@section('page', 'newsletter')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-content.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-live.css') }}">
@endpush
@section('content')
@php
  $me = auth()->user();
  $canEdit = $me->hasPermission('messages.edit');
  $canDelete = $me->hasPermission('messages.delete');
  $hasFilters = $q !== '' || $status !== '';
@endphp
        <div class="page-head">
          <div><h1 class="page-title">المشتركون</h1><p class="page-sub">البريد الإلكتروني للزوار الذين اشتركوا من تذييل الموقع. لا يرسل الموقع أي بريد تلقائياً.</p></div>
          @if ($canEdit)<div class="page-actions"><a class="btn btn-secondary" href="{{ route('admin.newsletter.export', array_filter(['q' => $q, 'status' => $status])) }}"><span class="material-symbols-outlined" aria-hidden="true">download</span>تصدير CSV</a></div>@endif
        </div>

        <section class="card" aria-label="ملخص المشتركين"><dl class="mini-stats">
          <div><dt>إجمالي المسجّلين</dt><dd><b>{{ $stats['total'] }}</b></dd></div>
          <div><dt>مشتركون فعّالون</dt><dd><b>{{ $stats['active'] }}</b></dd></div>
          <div><dt>ألغوا الاشتراك</dt><dd><b>{{ $stats['left'] }}</b></dd></div>
          <div><dt>جدد هذا الأسبوع</dt><dd><b>{{ $stats['week'] }}</b></dd></div>
        </dl></section>

        <section class="card mt-24" aria-labelledby="t-nl">
          <h2 class="sr-only" id="t-nl">قائمة المشتركين</h2>
          <form class="toolbar" method="GET" action="{{ route('admin.newsletter.index') }}" role="search">
            <label class="input-icon"><span class="sr-only">بحث بالبريد</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" name="q" type="search" value="{{ $q }}" placeholder="ابحث بالبريد الإلكتروني…" autocomplete="off" maxlength="80"></label>
            <label class="sr-only" for="f-st">الحالة</label>
            <select class="select sm auto" id="f-st" name="status" onchange="this.form.submit()">
              <option value="">كل الحالات</option>
              <option value="subscribed" @selected($status === 'subscribed')>مشترك</option>
              <option value="unsubscribed" @selected($status === 'unsubscribed')>ملغى</option>
            </select>
            <button type="submit" class="btn btn-secondary btn-sm"><span class="material-symbols-outlined" aria-hidden="true">filter_alt</span>تطبيق</button>
            @if ($hasFilters)<a class="btn btn-ghost btn-sm" href="{{ route('admin.newsletter.index') }}">مسح التصفية</a>@endif
            <span class="grow"></span>
            <span class="muted" style="font-size:13px" aria-live="polite">{{ $subs->total() }} نتيجة</span>
          </form>
          <div class="table-wrap" tabindex="0">
            <table class="table">
              <thead><tr><th scope="col">البريد الإلكتروني</th><th scope="col">الحالة</th><th scope="col">تاريخ الاشتراك</th><th scope="col" class="col-actions"><span class="sr-only">إجراءات</span></th></tr></thead>
              <tbody>
              @forelse ($subs as $s)
                <tr>
                  <td dir="ltr" style="text-align:start">{{ $s->email }}</td>
                  <td><span class="pill pill-{{ $s->status === 'subscribed' ? 'info' : 'neutral' }}">{{ $s->status === 'subscribed' ? 'مشترك' : 'ملغى' }}</span></td>
                  <td dir="ltr" style="text-align:start">{{ ($s->subscribed_at ?: $s->created_at)?->format('Y-m-d H:i') }}</td>
                  <td class="col-actions">
                    <div class="row" style="gap:6px;justify-content:flex-end">
                      @if ($canEdit)<form method="POST" action="{{ route('admin.newsletter.toggle', $s) }}">@csrf @method('PATCH')<button type="submit" class="btn btn-ghost btn-sm">{{ $s->status === 'subscribed' ? 'إيقاف' : 'تفعيل' }}</button></form>@endif
                      @if ($canDelete)<form method="POST" action="{{ route('admin.newsletter.destroy', $s) }}" data-confirm="سيتم حذف هذا المشترك من القائمة نهائياً." data-confirm-title="حذف المشترك؟" data-confirm-label="نعم، احذف" data-tone="danger">@csrf @method('DELETE')<button type="submit" class="btn btn-ghost btn-sm">حذف</button></form>@endif
                    </div>
                  </td>
                </tr>
              @empty
                <tr><td colspan="4" class="muted" style="text-align:center;padding:28px">{{ $hasFilters ? 'لا نتائج مطابقة.' : 'لا يوجد مشتركون بعد.' }}</td></tr>
              @endforelse
              </tbody>
            </table>
          </div>
          @if ($subs->hasPages())
            <div class="lv-pager">
              @if ($subs->previousPageUrl())<a class="btn btn-ghost btn-sm" href="{{ $subs->previousPageUrl() }}">السابق</a>@else<span></span>@endif
              <span class="muted">صفحة {{ $subs->currentPage() }} من {{ $subs->lastPage() }}</span>
              @if ($subs->nextPageUrl())<a class="btn btn-ghost btn-sm" href="{{ $subs->nextPageUrl() }}">التالي</a>@else<span></span>@endif
            </div>
          @endif
        </section>
      @endsection
@push('constants')
<script>window.__DB_PAGES = Object.assign(window.__DB_PAGES || {}, { newsletter: 1 });</script>
@endpush
