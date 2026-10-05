@extends('layouts.admin')
@section('title', 'مكتبة الوسائط')
@section('page', 'media')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-content.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-live.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-media.css') }}">
@endpush
@section('content')
@php
  $me = auth()->user();
  $canAdd = $me->hasPermission('media.create');
  $canEdit = $me->hasPermission('media.edit');
  $canDelete = $me->hasPermission('media.delete');
  $hasFilters = $q !== '' || $type !== '';
  $keep = array_filter(['q' => $q, 'type' => $type]);
  $typeLabels = ['image' => 'الصور', 'video' => 'الفيديو', 'pdf' => 'ملفات PDF', 'document' => 'مستندات وملفات أخرى'];
  $fmt = function (int $b) { return $b >= 1073741824 ? number_format($b / 1073741824, 1).' GB' : ($b >= 1048576 ? number_format($b / 1048576, 1).' MB' : max(0, (int) round($b / 1024)).' KB'); };
@endphp
        <div class="page-head">
          <div><h1 class="page-title">مكتبة الوسائط</h1><p class="page-sub">كل الصور والفيديوهات والمستندات المرفوعة في مكان واحد: ارفع ملفات جديدة، عدّل اسمها ونصها البديل، انسخ رابطها أو احذف ما لم يعد مستخدماً.</p></div>
          @if ($canAdd)<div class="page-actions"><button type="button" class="btn btn-primary" id="md-pick" data-perm="media.create"><span class="material-symbols-outlined" aria-hidden="true">upload</span>رفع ملفات</button></div>@endif
        </div>

        @if ($errors->any())
          <p class="error" role="alert" style="margin-bottom:16px"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $errors->first() }}</span></p>
        @endif

        <section class="card" aria-label="ملخص المكتبة"><dl class="mini-stats">
          <div><dt>إجمالي الملفات</dt><dd><b>{{ $stats['total'] }}</b></dd></div>
          <div><dt>صور</dt><dd><b>{{ $stats['images'] }}</b></dd></div>
          <div><dt>فيديو</dt><dd><b>{{ $stats['videos'] }}</b></dd></div>
          <div><dt>مستندات وملفات</dt><dd><b>{{ $stats['docs'] }}</b></dd></div>
          <div><dt>الحجم الكلي</dt><dd><b dir="ltr">{{ $fmt($stats['bytes']) }}</b></dd></div>
        </dl></section>

        @if ($canAdd)
        <section class="card mt-24" aria-labelledby="md-t-up" data-perm="media.create">
          <div class="card-body">
            <h2 class="sr-only" id="md-t-up">رفع ملفات</h2>
            <label class="md-drop" id="md-drop" for="md-file">
              <span class="material-symbols-outlined" aria-hidden="true">cloud_upload</span>
              <span><strong>اسحب الملفات إلى هنا أو اضغط للاختيار</strong>
              <small>صور JPG / PNG / WebP / GIF حتى {{ $limits['image'] }} · فيديو MP4 / WebM حتى {{ $limits['video'] }} · PDF وملفات Office وCSV وTXT حتى {{ $limits['document'] }} · حتى 20 ملفاً في كل مرة</small></span>
              <input type="file" id="md-file" multiple accept="{{ $accept }}" hidden>
            </label>
            <ul class="md-uploads" id="md-uploads" aria-live="polite"></ul>
            <noscript>
              <form method="POST" action="{{ route('admin.media.store') }}" enctype="multipart/form-data" class="mt-16">@csrf
                <input type="file" name="files[]" multiple accept="{{ $accept }}"> <button type="submit" class="btn btn-primary btn-sm">رفع</button>
              </form>
            </noscript>
          </div>
        </section>
        @endif

        <section class="card mt-24" aria-labelledby="md-t-list">
          <h2 class="sr-only" id="md-t-list">الملفات</h2>
          <form class="toolbar" method="GET" action="{{ route('admin.media.index') }}" role="search">
            <label class="input-icon"><span class="sr-only">بحث في الملفات</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" name="q" type="search" value="{{ $q }}" placeholder="ابحث بالاسم أو النص البديل…" autocomplete="off" maxlength="80"></label>
            <label class="sr-only" for="md-type">النوع</label>
            <select class="select sm auto" id="md-type" name="type">
              <option value="">كل الأنواع</option>
              @foreach ($typeLabels as $k => $l)<option value="{{ $k }}" @selected($type === $k)>{{ $l }}</option>@endforeach
            </select>
            <input type="hidden" name="view" value="{{ $view }}">
            <button type="submit" class="btn btn-secondary btn-sm"><span class="material-symbols-outlined" aria-hidden="true">filter_alt</span>تطبيق</button>
            @if ($hasFilters)<a class="btn btn-ghost btn-sm" href="{{ route('admin.media.index', ['view' => $view]) }}">مسح التصفية</a>@endif
            <span class="grow"></span>
            <span class="muted" style="font-size:13px" aria-live="polite">{{ $files->total() }} ملف</span>
            <span class="seg icons" role="group" aria-label="طريقة العرض">
              <a class="md-seg" href="{{ route('admin.media.index', $keep + ['view' => 'grid']) }}" @if ($view === 'grid') aria-current="true" @endif aria-label="عرض شبكي" title="عرض شبكي"><span class="material-symbols-outlined" aria-hidden="true">grid_view</span></a>
              <a class="md-seg" href="{{ route('admin.media.index', $keep + ['view' => 'list']) }}" @if ($view === 'list') aria-current="true" @endif aria-label="عرض قائمة" title="عرض قائمة"><span class="material-symbols-outlined" aria-hidden="true">view_list</span></a>
            </span>
          </form>

          @if ($canDelete && count($rows))
          <div class="md-bulk" id="md-bulk-bar" data-perm="media.delete">
            <label class="md-bulk-all"><input type="checkbox" class="checkbox" id="md-all" aria-label="تحديد كل ملفات هذه الصفحة"><span>تحديد الكل</span></label>
            <span class="muted" id="md-sel-count" aria-live="polite">لم يُحدَّد شيء</span>
            <span class="grow"></span>
            <button type="submit" form="md-bulk" class="btn btn-ghost btn-sm" id="md-bulk-btn" style="color:var(--danger-text)" disabled><span class="material-symbols-outlined" aria-hidden="true">delete</span>حذف المحدد</button>
          </div>
          @endif

          @if (! count($rows))
            <div class="empty" style="padding:44px 0"><span class="empty-ico material-symbols-outlined" aria-hidden="true">perm_media</span><h3>{{ $hasFilters ? 'لا نتائج مطابقة' : 'المكتبة فارغة' }}</h3><p>{{ $hasFilters ? 'جرّب كلمات أخرى أو امسح التصفية.' : 'ارفع أول صورة أو مستند لتظهر هنا.' }}</p></div>
          @elseif ($view === 'grid')
            <ul class="md-grid" id="md-items">
              @foreach ($rows as $r)
              <li class="md-card" data-id="{{ $r['id'] }}">
                @if ($canDelete && $r['upload'])<label class="md-sel"><input type="checkbox" class="checkbox md-check" value="{{ $r['id'] }}" aria-label="تحديد {{ $r['title'] }}"></label>@endif
                <button type="button" class="md-thumb" data-open="{{ $r['id'] }}" aria-label="تفاصيل الملف: {{ $r['title'] }}">
                  @if ($r['thumb'])<img src="{{ $r['thumb'] }}" alt="" loading="lazy" decoding="async">@else<span class="material-symbols-outlined" aria-hidden="true">{{ $r['icon'] }}</span>@endif
                  <span class="md-kind">{{ $r['kind_label'] }}</span>
                </button>
                <div class="md-info"><strong class="md-name" title="{{ $r['title'] }}">{{ $r['title'] }}</strong><span class="md-meta">{{ $r['size'] }}@if ($r['dims']) · <bdi dir="ltr">{{ $r['dims'] }}</bdi>@endif</span></div>
                <div class="md-actions">
                  <button type="button" class="icon-btn sm" data-copy="{{ $r['url'] }}" aria-label="نسخ رابط {{ $r['title'] }}" title="نسخ الرابط"><span class="material-symbols-outlined" aria-hidden="true">link</span></button>
                  <button type="button" class="icon-btn sm" data-open="{{ $r['id'] }}" aria-label="تفاصيل {{ $r['title'] }}" title="التفاصيل والتعديل"><span class="material-symbols-outlined" aria-hidden="true">tune</span></button>
                </div>
              </li>
              @endforeach
            </ul>
          @else
            <div class="table-wrap" tabindex="0">
              <table class="table" id="md-items">
                <thead><tr>@if ($canDelete)<th scope="col" style="width:44px"><span class="sr-only">تحديد</span></th>@endif<th scope="col">الملف</th><th scope="col">النوع</th><th scope="col">الحجم</th><th scope="col">رُفع بواسطة</th><th scope="col">التاريخ</th><th scope="col" class="col-actions"><span class="sr-only">إجراءات</span></th></tr></thead>
                <tbody>
                @foreach ($rows as $r)
                  <tr data-id="{{ $r['id'] }}">
                    @if ($canDelete)<td>@if ($r['upload'])<input type="checkbox" class="checkbox md-check" value="{{ $r['id'] }}" aria-label="تحديد {{ $r['title'] }}">@endif</td>@endif
                    <td><button type="button" class="cell-media md-linkbtn" data-open="{{ $r['id'] }}">
                      @if ($r['thumb'])<img src="{{ $r['thumb'] }}" alt="" loading="lazy" decoding="async">@else<span class="md-ico"><span class="material-symbols-outlined" aria-hidden="true">{{ $r['icon'] }}</span></span>@endif
                      <span style="min-width:0"><span class="t">{{ $r['title'] }}</span><span class="s" dir="ltr">{{ $r['name'] }}</span></span></button></td>
                    <td><span class="pill pill-neutral no-dot">{{ $r['kind_label'] }}</span></td>
                    <td class="num-cell">{{ $r['size'] }}@if ($r['dims']) <span class="muted" dir="ltr">· {{ $r['dims'] }}</span>@endif</td>
                    <td>{{ $r['by'] ?: '—' }}</td>
                    <td class="num-cell">{{ $r['date'] }}</td>
                    <td class="col-actions"><div style="display:inline-flex;gap:2px">
                      <button type="button" class="icon-btn sm" data-copy="{{ $r['url'] }}" aria-label="نسخ رابط {{ $r['title'] }}" title="نسخ الرابط"><span class="material-symbols-outlined" aria-hidden="true">link</span></button>
                      <button type="button" class="icon-btn sm" data-open="{{ $r['id'] }}" aria-label="تفاصيل {{ $r['title'] }}" title="التفاصيل والتعديل"><span class="material-symbols-outlined" aria-hidden="true">tune</span></button>
                    </div></td>
                  </tr>
                @endforeach
                </tbody>
              </table>
            </div>
          @endif

          @if ($files->hasPages())
          <div class="card-foot"><nav class="pagination" style="width:100%" aria-label="التنقل بين الصفحات">
            <span class="info">عرض {{ $files->firstItem() }}–{{ $files->lastItem() }} من {{ $files->total() }}</span>
            <div class="pages">
              @if ($files->onFirstPage())<span class="page-btn" disabled aria-disabled="true"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span><span class="sr-only">السابق</span></span>
              @else<a class="page-btn" href="{{ $files->previousPageUrl() }}"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span><span class="sr-only">السابق</span></a>@endif
              @php($from = max(1, $files->currentPage() - 3))
              @php($to = min($files->lastPage(), $files->currentPage() + 3))
              @if ($from > 1)<a class="page-btn" href="{{ $files->url(1) }}">1</a>@if ($from > 2)<span class="page-btn" aria-hidden="true">…</span>@endif @endif
              @for ($p = $from; $p <= $to; $p++)
                <a class="page-btn" href="{{ $files->url($p) }}" @if ($p === $files->currentPage()) aria-current="page" @endif>{{ $p }}</a>
              @endfor
              @if ($to < $files->lastPage())@if ($to < $files->lastPage() - 1)<span class="page-btn" aria-hidden="true">…</span>@endif<a class="page-btn" href="{{ $files->url($files->lastPage()) }}">{{ $files->lastPage() }}</a>@endif
              @if ($files->hasMorePages())<a class="page-btn" href="{{ $files->nextPageUrl() }}"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span><span class="sr-only">التالي</span></a>
              @else<span class="page-btn" disabled aria-disabled="true"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span><span class="sr-only">التالي</span></span>@endif
            </div>
          </nav></div>
          @endif
        </section>
@endsection
@section('after')
{{-- Details / edit drawer --}}
<div class="drawer" id="md-drawer" role="dialog" aria-modal="true" aria-labelledby="md-d-title" hidden>
  <form id="md-form" method="POST" action="#" novalidate style="display:contents">
    @csrf @method('PUT')
    <div class="drawer-head">
      <div><h2 id="md-d-title">تفاصيل الملف</h2><p id="md-d-sub"></p></div>
      <button type="button" class="icon-btn" data-close-drawer aria-label="إغلاق"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
    </div>
    <div class="drawer-body">
      <div class="md-prev" id="md-prev"></div>
      <div class="field">
        <label class="label" for="md-url">رابط الملف</label>
        <div class="md-copy"><input class="input" id="md-url" dir="ltr" readonly><button type="button" class="btn btn-secondary btn-sm" id="md-copy"><span class="material-symbols-outlined" aria-hidden="true">content_copy</span>نسخ</button></div>
      </div>
      <dl class="md-dl" id="md-dl"></dl>
      <div class="md-use" id="md-use" aria-live="polite"></div>
      <div class="field">
        <label class="label" for="md-title">الاسم (يظهر في المكتبة)</label>
        <input class="input" id="md-title" name="title" maxlength="255" @unless ($canEdit) readonly @endunless>
      </div>
      <div class="field">
        <label class="label" for="md-alt">النص البديل (للصور)</label>
        <input class="input" id="md-alt" name="alt_text" maxlength="255" @unless ($canEdit) readonly @endunless>
        <p class="hint">يصف الصورة لمن لا يستطيع رؤيتها ولمحركات البحث.</p>
      </div>
      <div class="field">
        <label class="label" for="md-cap">التعليق</label>
        <textarea class="textarea" id="md-cap" name="caption" rows="3" maxlength="500" @unless ($canEdit) readonly @endunless></textarea>
      </div>
    </div>
    <div class="drawer-foot" style="justify-content:space-between">
      @if ($canDelete)
      <button type="submit" class="btn btn-ghost" id="md-del" form="md-del-form" style="color:var(--danger-text)" data-perm="media.delete"><span class="material-symbols-outlined" aria-hidden="true">delete</span>حذف الملف</button>
      @else<span></span>@endif
      <div style="display:flex;gap:8px">
        <button type="button" class="btn btn-secondary" data-close-drawer>إغلاق</button>
        @if ($canEdit)<button type="submit" class="btn btn-primary" data-perm="media.edit"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ</button>@endif
      </div>
    </div>
  </form>
  @if ($canDelete)
  <form id="md-del-form" method="POST" action="#" data-confirm="سيُحذف الملف نهائياً من المكتبة ومن التخزين." data-confirm-title="حذف الملف؟" data-confirm-label="نعم، احذف" data-tone="danger" hidden>@csrf @method('DELETE')</form>
  @endif
</div>
@if ($canDelete)
<form id="md-bulk" method="POST" action="{{ route('admin.media.bulk-delete') }}" data-confirm="" data-confirm-title="حذف الملفات المحددة؟" data-confirm-label="نعم، احذف" data-tone="danger" hidden>@csrf<div id="md-bulk-ids"></div></form>
@endif
@endsection
@push('scripts')
<script>window.__MEDIA_CFG = {!! json_encode([
  'rows' => collect($rows)->keyBy('id')->all(),
  'urls' => ['store' => route('admin.media.store'), 'item' => url('/admin/media')],
  'can' => ['edit' => $canEdit, 'delete' => $canDelete, 'add' => $canAdd],
  'limits' => ['image' => \App\Support\MediaManager::limitKb('image') * 1024, 'video' => \App\Support\MediaManager::limitKb('video') * 1024, 'document' => \App\Support\MediaManager::limitKb('document') * 1024],
  'limitLabels' => $limits,
  'kinds' => ['jpg' => 'image', 'jpeg' => 'image', 'png' => 'image', 'webp' => 'image', 'gif' => 'image', 'mp4' => 'video', 'webm' => 'video'],
  'exts' => \App\Support\MediaManager::extensions(),
], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
<script src="{{ asset('assets/admin/js/admin-media.js') }}"></script>
@endpush
