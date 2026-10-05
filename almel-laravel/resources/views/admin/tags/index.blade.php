@extends('layouts.admin')
@section('title', 'الوسوم')
@section('page', 'tags')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-content.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-live.css') }}">
@endpush
@section('content')
@php
  $me = auth()->user();
  $canAdd = $me->hasPermission('tags.create');
  $canEdit = $me->hasPermission('tags.edit');
  $canDelete = $me->hasPermission('tags.delete');
  $canMerge = $canEdit && $canDelete;
  $form = session('tag_form');
  $mode = $form['mode'] ?? null;
  $editId = $form['id'] ?? null;
  $hasFilters = $q !== '';
  $sortLabels = ['usage' => 'الأكثر استخداماً', 'name' => 'الاسم (أبجدياً)', 'new' => 'الأحدث'];
@endphp
        <div class="page-head">
          <div><h1 class="page-title">الوسوم</h1><p class="page-sub">كلمات تصنيف حرة تُلحق بالأخبار وتظهر أسفل الخبر في الموقع. تُضاف الوسوم الجديدة هنا أو مباشرة من شاشة تحرير الخبر، ويمكن دمج الوسوم المتشابهة في وسم واحد.</p></div>
          @if ($canAdd)<div class="page-actions"><button type="button" class="btn btn-primary" id="tg-add" data-perm="tags.create"><span class="material-symbols-outlined" aria-hidden="true">add</span>وسم جديد</button></div>@endif
        </div>

        <section class="card" aria-label="ملخص الوسوم"><dl class="mini-stats">
          <div><dt>إجمالي الوسوم</dt><dd><b>{{ $stats['total'] }}</b></dd></div>
          <div><dt>وسوم مستخدمة</dt><dd><b>{{ $stats['used'] }}</b></dd></div>
          <div><dt>وسوم غير مستخدمة</dt><dd><b>{{ $stats['unused'] }}</b></dd></div>
          <div><dt>الأكثر استخداماً</dt><dd><b>{{ $stats['top'] }}</b></dd></div>
        </dl></section>

        <section class="card mt-24" aria-labelledby="t-tags">
          <h2 class="sr-only" id="t-tags">قائمة الوسوم</h2>
          <form class="toolbar" method="GET" action="{{ route('admin.tags.index') }}" role="search" id="tg-filter">
            <label class="input-icon"><span class="sr-only">بحث في الوسوم</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" name="q" type="search" value="{{ $q }}" placeholder="ابحث باسم الوسم…" autocomplete="off" maxlength="80"></label>
            <label class="sr-only" for="tg-sort">الترتيب</label>
            <select class="select sm auto" id="tg-sort" name="sort" data-autosubmit>
              @foreach ($sortLabels as $k => $l)<option value="{{ $k }}" @selected($sort === $k)>{{ $l }}</option>@endforeach
            </select>
            <button type="submit" class="btn btn-secondary btn-sm"><span class="material-symbols-outlined" aria-hidden="true">filter_alt</span>تطبيق</button>
            @if ($hasFilters)<a class="btn btn-ghost btn-sm" href="{{ route('admin.tags.index', ['sort' => $sort]) }}">مسح التصفية</a>@endif
            <span class="grow"></span>
            <span class="muted" style="font-size:13px" aria-live="polite">{{ $tags->total() }} وسم</span>
          </form>
          <div class="table-wrap" tabindex="0">
            <table class="table">
              <thead><tr><th scope="col">الوسم</th><th scope="col">الرابط المختصر</th><th scope="col">الأخبار</th><th scope="col">تاريخ الإضافة</th><th scope="col" class="col-actions"><span class="sr-only">إجراءات</span></th></tr></thead>
              <tbody>
              @forelse ($tags as $t)
                @php
                  $uses = (int) $t->uses;
                  $pub = (int) $t->published_uses;
                @endphp
                <tr>
                  <td><span class="tag" style="height:28px;font-size:13.5px"><span class="material-symbols-outlined" aria-hidden="true">sell</span>{{ $t->name }}</span></td>
                  <td dir="ltr" style="text-align:start"><span class="muted">{{ $t->slug }}</span></td>
                  <td class="num-cell">@if ($uses > 0)<b>{{ $uses }}</b> <span class="muted">({{ $pub }} منشور)</span>@else<span class="muted">غير مستخدم</span>@endif</td>
                  <td class="num-cell">{{ $t->created_at ? $t->created_at->format('Y-m-d') : '—' }}</td>
                  <td class="col-actions">
                    <div style="display:inline-flex;gap:2px">
                      @if ($canEdit)
                      <button type="button" class="icon-btn sm" data-perm="tags.edit" data-edit data-id="{{ $t->id }}" data-name="{{ $t->name }}" data-slug="{{ $t->slug }}" data-action="{{ route('admin.tags.update', $t->id) }}" aria-label="تعديل الوسم {{ $t->name }}" title="تعديل"><span class="material-symbols-outlined" aria-hidden="true">edit</span></button>
                      @endif
                      @if ($canMerge && $stats['total'] > 1)
                      <button type="button" class="icon-btn sm" data-perm="tags.edit" data-merge data-id="{{ $t->id }}" data-name="{{ $t->name }}" data-uses="{{ $uses }}" data-action="{{ route('admin.tags.merge', $t->id) }}" aria-label="دمج الوسم {{ $t->name }} في وسم آخر" title="دمج في وسم آخر"><span class="material-symbols-outlined" aria-hidden="true">merge</span></button>
                      @endif
                      @if ($canDelete)
                      <form method="POST" action="{{ route('admin.tags.destroy', $t->id) }}" style="display:contents" data-confirm="{{ $uses > 0 ? 'سيُزال الوسم من '.$uses.' خبر. لن يُحذف أي خبر.' : 'هذا الوسم غير مستخدم في أي خبر.' }}" data-confirm-title="حذف الوسم «{{ $t->name }}»؟" data-confirm-label="نعم، احذف" data-tone="danger">@csrf @method('DELETE')
                        <button type="submit" class="icon-btn sm" data-perm="tags.delete" style="color:var(--danger-text)" aria-label="حذف الوسم {{ $t->name }}" title="حذف"><span class="material-symbols-outlined" aria-hidden="true">delete</span></button>
                      </form>
                      @endif
                    </div>
                  </td>
                </tr>
              @empty
                <tr><td colspan="5"><div class="empty" style="padding:32px 0;text-align:center"><span class="material-symbols-outlined empty-ico" aria-hidden="true">sell</span><p>{{ $hasFilters ? 'لا وسوم مطابقة للبحث.' : 'لا توجد وسوم بعد. أضف وسماً جديداً أو أضفه من شاشة تحرير الخبر.' }}</p></div></td></tr>
              @endforelse
              </tbody>
            </table>
          </div>
          @if ($tags->hasPages())
          <div class="card-foot"><nav class="pagination" style="width:100%" aria-label="التنقل بين الصفحات">
            <span class="info">عرض {{ $tags->firstItem() }}–{{ $tags->lastItem() }} من {{ $tags->total() }}</span>
            <div class="pages">
              @if ($tags->onFirstPage())<span class="page-btn" disabled aria-disabled="true"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span><span class="sr-only">السابق</span></span>
              @else<a class="page-btn" href="{{ $tags->previousPageUrl() }}"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span><span class="sr-only">السابق</span></a>@endif
              @for ($p = max(1, $tags->currentPage() - 3); $p <= min($tags->lastPage(), $tags->currentPage() + 3); $p++)
                <a class="page-btn" href="{{ $tags->url($p) }}" @if ($p === $tags->currentPage()) aria-current="page" @endif>{{ $p }}</a>
              @endfor
              @if ($tags->hasMorePages())<a class="page-btn" href="{{ $tags->nextPageUrl() }}"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span><span class="sr-only">التالي</span></a>
              @else<span class="page-btn" disabled aria-disabled="true"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span><span class="sr-only">التالي</span></span>@endif
            </div>
          </nav></div>
          @endif
        </section>
@endsection
@section('after')
{{-- Add / edit drawer --}}
<div class="drawer" id="tg-drawer" role="dialog" aria-modal="true" aria-labelledby="tg-title" hidden>
  <form id="tg-form" method="POST" action="{{ route('admin.tags.store') }}" novalidate style="display:contents">
    @csrf
    <input type="hidden" name="_method" id="tg-method" value="PUT" disabled>
    <div class="drawer-head">
      <div><h2 id="tg-title">وسم جديد</h2><p id="tg-sub">اكتب الاسم كما سيظهر أسفل الخبر.</p></div>
      <button type="button" class="icon-btn" data-close-drawer aria-label="إغلاق"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
    </div>
    <div class="drawer-body">
      <div class="field">
        <label class="label" for="tg-name"><span>اسم الوسم <span class="req" aria-hidden="true">*</span></span></label>
        <input class="input" id="tg-name" name="name" maxlength="100" required value="{{ in_array($mode, ['create', 'edit']) ? old('name') : '' }}">
        @if (in_array($mode, ['create', 'edit']))@error('name')<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror @endif
      </div>
      <div class="field">
        <label class="label" for="tg-slug">الرابط المختصر (اختياري)</label>
        <input class="input" id="tg-slug" name="slug" dir="ltr" maxlength="100" value="{{ in_array($mode, ['create', 'edit']) ? old('slug') : '' }}">
        @if (in_array($mode, ['create', 'edit']))@error('slug')<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror @endif
        <p class="hint" id="tg-slug-hint">يُولَّد تلقائياً من الاسم ويقبل الحروف العربية. اتركه فارغاً للإبقاء على الحالي.</p>
      </div>
    </div>
    <div class="drawer-foot">
      <button type="button" class="btn btn-secondary" data-close-drawer>إلغاء</button>
      <button type="submit" class="btn btn-primary"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ</button>
    </div>
  </form>
</div>

{{-- Merge drawer --}}
@if ($canMerge)
<div class="drawer" id="tm-drawer" role="dialog" aria-modal="true" aria-labelledby="tm-title" hidden>
  <form id="tm-form" method="POST" action="#" novalidate data-confirm="" data-confirm-title="دمج الوسوم؟" data-confirm-label="نعم، ادمج" data-tone="warn" style="display:contents">
    @csrf
    <div class="drawer-head">
      <div><h2 id="tm-title">دمج وسم في وسم آخر</h2><p id="tm-sub"></p></div>
      <button type="button" class="icon-btn" data-close-drawer aria-label="إغلاق"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
    </div>
    <div class="drawer-body">
      <p class="muted" style="margin:0">تنتقل كل أخبار هذا الوسم إلى الوسم الذي تختاره، ثم يُحذف هذا الوسم. لا يُحذف أي خبر.</p>
      <div class="field">
        <label class="label" for="tm-target">ادمج في الوسم</label>
        <select class="select" id="tm-target" name="target_id" required><option value="">اختر وسماً…</option></select>
      </div>
    </div>
    <div class="drawer-foot">
      <button type="button" class="btn btn-secondary" data-close-drawer>إلغاء</button>
      <button type="submit" class="btn btn-primary"><span class="material-symbols-outlined" aria-hidden="true">merge</span>دمج</button>
    </div>
  </form>
</div>
@endif
@endsection
@push('scripts')
<script>window.__TAGS_CFG = {!! json_encode([
  'store' => route('admin.tags.store'),
  'mode' => $mode, 'editId' => $editId,
  'old' => ['name' => old('name', ''), 'slug' => old('slug', '')],
  'targets' => $mergeTargets,
], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
<script src="{{ asset('assets/admin/js/admin-tags.js') }}"></script>
@endpush
