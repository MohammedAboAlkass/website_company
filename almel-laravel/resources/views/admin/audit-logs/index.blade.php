@extends('layouts.admin')
@section('title', 'سجل العمليات')
@section('page', 'audit')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-content.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-live.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-audit.css') }}">
@endpush
@section('content')
@php
  $hasFilters = collect($f)->filter(fn ($v) => $v !== '')->isNotEmpty();
  $exportQuery = array_filter($f, fn ($v) => $v !== '');
@endphp
        <div class="page-head">
          <div><h1 class="page-title">سجل العمليات</h1><p class="page-sub">سجل للقراءة فقط بكل ما جرى في لوحة التحكم: من دخل، ومن أضاف أو عدّل أو حذف، ومتى ومن أي عنوان. لا يمكن تعديل السجل أو حذفه من هنا، وكلمات المرور لا تُسجَّل أبداً.</p></div>
          @if ($canExport)<div class="page-actions"><a class="btn btn-secondary" data-perm="audit.export" href="{{ route('admin.audit-logs.export', $exportQuery) }}"><span class="material-symbols-outlined" aria-hidden="true">download</span>تصدير CSV</a></div>@endif
        </div>

        <section class="card" aria-label="ملخص السجل"><dl class="mini-stats">
          <div><dt>إجمالي السجلات</dt><dd><b>{{ $stats['total'] }}</b></dd></div>
          <div><dt>عمليات اليوم</dt><dd><b>{{ $stats['today'] }}</b></dd></div>
          <div><dt>دخول فاشل (7 أيام)</dt><dd><b>{{ $stats['failed'] }}</b></dd></div>
          <div><dt>مستخدمون نشطون (7 أيام)</dt><dd><b>{{ $stats['actors'] }}</b></dd></div>
        </dl></section>

        <section class="card mt-24" aria-labelledby="t-audit">
          <h2 class="sr-only" id="t-audit">سجل العمليات</h2>
          <form class="toolbar au-filters" method="GET" action="{{ route('admin.audit-logs.index') }}" role="search">
            <label class="input-icon"><span class="sr-only">بحث في السجل</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" name="q" type="search" value="{{ $f['q'] }}" placeholder="ابحث في الوصف أو اسم السجل أو العنوان…" autocomplete="off" maxlength="80"></label>
            <label class="sr-only" for="au-user">المستخدم</label>
            <select class="select sm auto" id="au-user" name="user" data-autosubmit>
              <option value="">كل المستخدمين</option>
              <option value="system" @selected($f['user'] === 'system')>النظام / زائر</option>
              @foreach ($users as $u)<option value="{{ $u->id }}" @selected($f['user'] === (string) $u->id)>{{ $u->name }}</option>@endforeach
            </select>
            <label class="sr-only" for="au-module">القسم</label>
            <select class="select sm auto" id="au-module" name="module" data-autosubmit>
              <option value="">كل الأقسام</option>
              @foreach ($modules as $key => $m)<option value="{{ $key }}" @selected($f['module'] === $key)>{{ $m[0] }}</option>@endforeach
              <option value="other" @selected($f['module'] === 'other')>أخرى</option>
            </select>
            <label class="sr-only" for="au-action">العملية</label>
            <select class="select sm auto" id="au-action" name="action" data-autosubmit>
              <option value="">كل العمليات</option>
              @foreach ($actions as $a)<option value="{{ $a['key'] }}" @selected($f['action'] === $a['key'])>{{ $a['label'] }}</option>@endforeach
            </select>
            <label class="au-date"><span>من</span><input class="input sm" type="date" name="from" value="{{ $f['from'] }}" max="{{ now()->format('Y-m-d') }}"></label>
            <label class="au-date"><span>إلى</span><input class="input sm" type="date" name="to" value="{{ $f['to'] }}" max="{{ now()->format('Y-m-d') }}"></label>
            <button type="submit" class="btn btn-secondary btn-sm"><span class="material-symbols-outlined" aria-hidden="true">filter_alt</span>تطبيق</button>
            @if ($hasFilters)<a class="btn btn-ghost btn-sm" href="{{ route('admin.audit-logs.index') }}">مسح التصفية</a>@endif
            <span class="grow"></span>
            <span class="muted" style="font-size:13px" aria-live="polite">{{ $logs->total() }} سجل</span>
          </form>
          <div class="table-wrap" tabindex="0">
            <table class="table">
              <thead><tr><th scope="col">الوقت</th><th scope="col">المستخدم</th><th scope="col">العملية</th><th scope="col">الوصف</th><th scope="col">العنوان (IP)</th><th scope="col" class="col-actions"><span class="sr-only">التفاصيل</span></th></tr></thead>
              <tbody>
              @forelse ($rows as $r)
                <tr>
                  <td class="num-cell" dir="ltr" style="text-align:start">{{ $r['time'] }}</td>
                  <td>@if ($r['user'])<div class="cell-media"><div style="min-width:0"><span class="t" style="max-width:200px">{{ $r['user'] }}</span><span class="s ltr">{{ $r['email'] }}</span></div></div>@elseif ($r['email'])<span class="muted">زائر</span> <span class="s ltr muted">{{ $r['email'] }}</span>@else<span class="muted">النظام</span>@endif</td>
                  <td><span class="pill pill-{{ $r['tone'] }}">{{ $r['label'] }}</span><span class="au-mod"><span class="material-symbols-outlined" aria-hidden="true">{{ $r['icon'] }}</span>{{ $r['module'] }}</span></td>
                  <td class="au-desc">{{ $r['description'] }}@if ($r['subject'] && ! str_contains($r['description'], $r['subject']))<span class="au-subj">{{ $r['subject'] }}</span>@endif</td>
                  <td class="num-cell" dir="ltr" style="text-align:start">{{ $r['ip'] ?: '—' }}</td>
                  <td class="col-actions"><button type="button" class="icon-btn sm" data-open="{{ $r['id'] }}" aria-label="تفاصيل العملية رقم {{ $r['id'] }}" title="التفاصيل{{ $r['has_changes'] ? ' والتغييرات' : '' }}"><span class="material-symbols-outlined" aria-hidden="true">{{ $r['has_changes'] ? 'difference' : 'visibility' }}</span></button></td>
                </tr>
              @empty
                <tr><td colspan="6"><div class="empty" style="padding:32px 0;text-align:center"><span class="material-symbols-outlined empty-ico" aria-hidden="true">history</span><p>{{ $hasFilters ? 'لا سجلات مطابقة للتصفية.' : 'لا توجد سجلات بعد.' }}</p></div></td></tr>
              @endforelse
              </tbody>
            </table>
          </div>
          @if ($logs->hasPages())
          <div class="card-foot"><nav class="pagination" style="width:100%" aria-label="التنقل بين الصفحات">
            <span class="info">عرض {{ $logs->firstItem() }}–{{ $logs->lastItem() }} من {{ $logs->total() }}</span>
            <div class="pages">
              @if ($logs->onFirstPage())<span class="page-btn" disabled aria-disabled="true"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span><span class="sr-only">السابق</span></span>
              @else<a class="page-btn" href="{{ $logs->previousPageUrl() }}"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span><span class="sr-only">السابق</span></a>@endif
              @php($from = max(1, $logs->currentPage() - 3))
              @php($to = min($logs->lastPage(), $logs->currentPage() + 3))
              @if ($from > 1)<a class="page-btn" href="{{ $logs->url(1) }}">1</a>@if ($from > 2)<span class="page-btn" aria-hidden="true">…</span>@endif @endif
              @for ($p = $from; $p <= $to; $p++)
                <a class="page-btn" href="{{ $logs->url($p) }}" @if ($p === $logs->currentPage()) aria-current="page" @endif>{{ $p }}</a>
              @endfor
              @if ($to < $logs->lastPage())@if ($to < $logs->lastPage() - 1)<span class="page-btn" aria-hidden="true">…</span>@endif<a class="page-btn" href="{{ $logs->url($logs->lastPage()) }}">{{ $logs->lastPage() }}</a>@endif
              @if ($logs->hasMorePages())<a class="page-btn" href="{{ $logs->nextPageUrl() }}"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span><span class="sr-only">التالي</span></a>
              @else<span class="page-btn" disabled aria-disabled="true"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span><span class="sr-only">التالي</span></span>@endif
            </div>
          </nav></div>
          @endif
        </section>
@endsection
@section('after')
<div class="drawer au-drawer" id="au-drawer" role="dialog" aria-modal="true" aria-labelledby="au-d-title" hidden>
  <div class="drawer-head">
    <div><h2 id="au-d-title">تفاصيل العملية</h2><p id="au-d-sub"></p></div>
    <button type="button" class="icon-btn" data-close-drawer aria-label="إغلاق"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
  </div>
  <div class="drawer-body" id="au-d-body" aria-live="polite"></div>
  <div class="drawer-foot"><button type="button" class="btn btn-secondary" data-close-drawer>إغلاق</button></div>
</div>
@endsection
@push('scripts')
<script>window.__AUDIT_CFG = {!! json_encode(['item' => url('/admin/audit-logs'), 'open' => $open], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
<script src="{{ asset('assets/admin/js/admin-audit.js') }}"></script>
@endpush
