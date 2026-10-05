@extends('layouts.admin')
@section('title', 'الرسائل والطلبات')
@section('page', 'messages')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-live.css') }}">
@endpush
@section('content')
@php
  $T = \App\Support\AdminStats::MSG_TYPES;
  $me = auth()->user();
  $canEdit = $me->hasPermission('messages.edit');
  $canDelete = $me->hasPermission('messages.delete');
  $keep = array_filter(['box' => $box !== 'all' ? $box : null, 'type' => $type ?: null, 'q' => $q ?: null]);
  $hid = function (array $extra = []) use ($keep) { $h = ''; foreach (array_merge($keep, $extra) as $k => $v) { $h .= '<input type="hidden" name="'.e($k).'" value="'.e($v).'">'; } return new \Illuminate\Support\HtmlString($h); };
  $boxes = ['all' => 'الكل', 'unread' => 'غير مقروءة', 'starred' => 'المميزة', 'pending' => 'قيد المتابعة', 'handled' => 'تمت متابعتها', 'archived' => 'الأرشيف'];
  $url = fn (array $p) => route('admin.messages.index', array_filter(array_merge($keep, $p)));
@endphp
        <div class="page-head">
          <div><h1 class="page-title">الرسائل والطلبات</h1><p class="page-sub" aria-live="polite">{{ $counts['unread'] ? $counts['unread'].' رسائل غير مقروءة بحاجة إلى متابعة' : 'لا توجد رسائل غير مقروءة' }} · {{ $counts['all'] }} في الوارد · {{ $counts['archived'] }} في الأرشيف</p></div>
          @if ($canEdit)
          <div class="page-actions">
            <form method="POST" action="{{ route('admin.messages.read-all') }}">@csrf
              <button type="submit" class="btn btn-secondary" @disabled(! $counts['unread'])><span class="material-symbols-outlined" aria-hidden="true">done_all</span>تعليم الكل كمقروء</button>
            </form>
          </div>
          @endif
        </div>

        <section class="card inbox{{ $active ? ' show-reader' : '' }}" id="inbox" aria-label="صندوق الرسائل">
          <div class="inbox-list">
            <form class="inbox-filters" method="GET" action="{{ route('admin.messages.index') }}" role="search">
              <input type="hidden" name="box" value="{{ $box }}"><input type="hidden" name="type" value="{{ $type }}">
              <label class="input-icon"><span class="sr-only">بحث في الرسائل</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" name="q" type="search" value="{{ $q }}" placeholder="ابحث بالاسم أو البريد أو النص…" autocomplete="off" maxlength="80"></label>
              <div class="lv-fgroup">
                <p class="lv-cap" aria-hidden="true">الحالة</p>
                <div class="seg lv-seg" role="group" aria-label="تصفية الرسائل">
                  @foreach ($boxes as $k => $label)
                    <button type="submit" name="box" value="{{ $k }}" aria-pressed="{{ $box === $k ? 'true' : 'false' }}">{{ $label }}<span class="lv-n">{{ $counts[$k] }}</span></button>
                  @endforeach
                </div>
              </div>
              <div class="lv-fgroup">
                <p class="lv-cap" aria-hidden="true">النوع</p>
                <div class="chips type-chips" role="group" aria-label="نوع الرسالة">
                  <button type="submit" name="type" value="" class="chip-btn" aria-pressed="{{ $type === '' ? 'true' : 'false' }}">كل الأنواع</button>
                  @foreach ($T as $k => $t)
                    <button type="submit" name="type" value="{{ $k }}" class="chip-btn" aria-pressed="{{ $type === $k ? 'true' : 'false' }}">{{ $t[0] }}@if (! empty($typeCounts[$k])) <span class="lv-n">{{ $typeCounts[$k] }}</span>@endif</button>
                  @endforeach
                </div>
              </div>
            </form>
            <ul class="inbox-items" id="m-list" aria-label="الرسائل">
              @forelse ($messages as $m)
                @php $t = $T[$m->type] ?? $T['other']; $sel = $active && $active->id === $m->id; @endphp
                <li class="mitem{{ $m->is_read ? '' : ' unread' }}" aria-current="{{ $sel ? 'true' : 'false' }}" @if ($sel) data-selected="1" @endif>
                  <a class="lv-mlink" href="{{ $url(['id' => $m->id, 'page' => $messages->currentPage() > 1 ? $messages->currentPage() : null]) }}">
                    <span class="avatar navy" aria-hidden="true"><span class="material-symbols-outlined">{{ $t[2] }}</span></span>
                    <div class="li-main">
                      <div class="top">@if (! $m->is_read)<span class="udot" aria-hidden="true"></span>@endif<span class="from">{{ $m->name }}</span><time dir="ltr">{{ $m->created_at?->format('Y-m-d H:i') }}</time></div>
                      <p class="subj">@if (! $m->is_read)<span class="sr-only">غير مقروءة: </span>@endif{{ $m->subject ?: \Illuminate\Support\Str::limit(preg_replace('/\s+/u', ' ', (string) $m->message), 60) }}</p>
                      <p class="snip">{{ \Illuminate\Support\Str::limit(preg_replace('/\s+/u', ' ', (string) $m->message), 110) }}</p>
                      <div class="row2"><span class="pill pill-{{ $t[1] }}">{{ $t[0] }}</span>@if ($m->is_starred)<span class="material-symbols-outlined fill star" aria-hidden="true">star</span><span class="sr-only">مميزة بنجمة</span>@endif @if ($m->handled_at)<span class="pill pill-neutral no-dot">تمت المتابعة</span>@endif</div>
                    </div>
                  </a>
                </li>
              @empty
                <li class="lv-empty"><span class="material-symbols-outlined" aria-hidden="true">inbox</span><strong>لا توجد رسائل</strong><span>{{ $q !== '' ? 'لا نتائج مطابقة لبحثك.' : 'لا توجد رسائل في هذا التصنيف حالياً.' }}</span></li>
              @endforelse
            </ul>
            @if ($messages->hasPages())
              <div class="lv-pager">
                @if ($messages->previousPageUrl())<a class="btn btn-ghost btn-sm" href="{{ $messages->previousPageUrl() }}">السابق</a>@else<span></span>@endif
                <span class="muted">صفحة {{ $messages->currentPage() }} من {{ $messages->lastPage() }}</span>
                @if ($messages->nextPageUrl())<a class="btn btn-ghost btn-sm" href="{{ $messages->nextPageUrl() }}">التالي</a>@else<span></span>@endif
              </div>
            @endif
          </div>

          <section class="reader" id="m-reader" aria-label="قراءة الرسالة">
            @if (! $active)
              <div class="reader-scroll" style="justify-content:center"><div class="lv-empty"><span class="material-symbols-outlined" aria-hidden="true">mark_email_read</span><strong>اختر رسالة لقراءتها</strong><span>تظهر هنا تفاصيل الرسالة وحالة المتابعة.</span></div></div>
            @else
              @php $t = $T[$active->type] ?? $T['other']; $subject = $active->subject ?: 'رسالة من '.$active->name; @endphp
              <div class="reader-head">
                <a class="icon-btn reader-back" href="{{ $url([]) }}" aria-label="العودة إلى القائمة"><span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
                <span class="pill pill-{{ $t[1] }}">{{ $t[0] }}</span>
                <span class="tb-spacer"></span>
                <div class="reader-actions" role="toolbar" aria-label="إجراءات الرسالة">
                  @if ($canEdit)
                  <form method="POST" action="{{ route('admin.messages.star', $active) }}">@csrf @method('PATCH'){{ $hid() }}<button type="submit" class="icon-btn" aria-pressed="{{ $active->is_starred ? 'true' : 'false' }}" aria-label="تمييز بنجمة" title="تمييز بنجمة"><span class="material-symbols-outlined {{ $active->is_starred ? 'fill' : '' }}" aria-hidden="true">star</span></button></form>
                  <form method="POST" action="{{ route('admin.messages.read', $active) }}">@csrf @method('PATCH'){{ $hid() }}<input type="hidden" name="read" value="0"><button type="submit" class="icon-btn" aria-label="تعليم كغير مقروءة" title="تعليم كغير مقروءة"><span class="material-symbols-outlined" aria-hidden="true">mark_email_unread</span></button></form>
                  <form method="POST" action="{{ route('admin.messages.archive', $active) }}">@csrf @method('PATCH'){{ $hid() }}<button type="submit" class="icon-btn" aria-label="{{ $active->is_archived ? 'إلغاء الأرشفة' : 'أرشفة' }}" title="{{ $active->is_archived ? 'إلغاء الأرشفة' : 'أرشفة' }}"><span class="material-symbols-outlined" aria-hidden="true">{{ $active->is_archived ? 'unarchive' : 'archive' }}</span></button></form>
                  @endif
                  @if ($canDelete)
                  <form method="POST" action="{{ route('admin.messages.destroy', $active) }}" data-confirm="سيتم حذف هذه الرسالة نهائياً ولا يمكن التراجع عن ذلك." data-confirm-title="حذف الرسالة؟" data-confirm-label="نعم، احذف" data-tone="danger">@csrf @method('DELETE'){{ $hid() }}<button type="submit" class="icon-btn" aria-label="حذف" title="حذف"><span class="material-symbols-outlined" aria-hidden="true">delete</span></button></form>
                  @endif
                </div>
              </div>
              <div class="reader-scroll">
                <div class="reader-body">
                  <h2 class="reader-subject" id="m-subject" tabindex="-1">{{ $subject }}</h2>
                  <div class="reader-meta">
                    <span class="avatar navy" aria-hidden="true"><span class="material-symbols-outlined">{{ $t[2] }}</span></span>
                    <div style="flex:1;min-width:0"><strong>{{ $active->name }}</strong><span class="ltr">{{ $active->email }}</span>@if ($active->phone)<span class="ltr" style="display:block">{{ $active->phone }}</span>@endif</div>
                    <span class="ltr" dir="ltr">{{ $active->created_at?->format('Y-m-d H:i') }}</span>
                  </div>
                  <div class="reader-text">{!! nl2br(e($active->message)) !!}</div>
                  <dl class="lv-meta">
                    <div><dt>الموافقة على التواصل</dt><dd>{{ $active->consent_given ? 'نعم' : 'لم تُسجَّل' }}</dd></div>
                    @if ($active->handled_at)<div><dt>تمت المتابعة</dt><dd><span dir="ltr">{{ $active->handled_at->format('Y-m-d H:i') }}</span>@if ($active->handler) — {{ $active->handler->name }}@endif</dd></div>@endif
                  </dl>
                </div>
                <div class="reply" id="m-reply">
                  <div class="reply-to"><span class="material-symbols-outlined flip-rtl" aria-hidden="true">reply</span>الرد على <span class="ltr">{{ $active->email }}</span></div>
                  <p class="muted" style="font-size:13px;margin:6px 0 10px">لا يرسل الموقع بريداً إلكترونياً. افتح الرد من برنامج البريد لديك ثم سجّل هنا حالة المتابعة.</p>
                  <a class="btn btn-secondary btn-sm" href="mailto:{{ $active->email }}?subject={{ rawurlencode('رد: '.$subject) }}"><span class="material-symbols-outlined" aria-hidden="true">mail</span>فتح الرد بالبريد</a>
                  @if ($canEdit)
                  <form method="POST" action="{{ route('admin.messages.handle', $active) }}" class="lv-handle">@csrf @method('PATCH'){{ $hid() }}
                    <label class="label" for="m-note">ملاحظة داخلية (لا تظهر للزائر)</label>
                    <textarea class="textarea" id="m-note" name="internal_note" rows="3" maxlength="2000" placeholder="مثال: تم الاتصال بالمرسل وتحويله لمسؤول المتطوعين">{{ $active->internal_note }}</textarea>
                    <div class="lv-handle-foot">
                      @if ($active->handled_at)
                        <button type="submit" class="btn btn-primary btn-sm"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ الملاحظة</button>
                        <button type="submit" class="btn btn-ghost btn-sm" name="handled" value="0"><span class="material-symbols-outlined" aria-hidden="true">undo</span>إعادة إلى قيد المتابعة</button>
                      @else
                        <button type="submit" class="btn btn-primary btn-sm" name="handled" value="1"><span class="material-symbols-outlined" aria-hidden="true">task_alt</span>تمت المتابعة / الرد</button>
                      @endif
                    </div>
                  </form>
                  @elseif ($active->internal_note)
                    <div class="reader-text" style="margin-top:10px"><strong>ملاحظة داخلية:</strong><br>{!! nl2br(e($active->internal_note)) !!}</div>
                  @endif
                </div>
              </div>
            @endif
          </section>
        </section>
      @endsection
@push('constants')
<script>window.__DB_PAGES = Object.assign(window.__DB_PAGES || {}, { messages: 1 });</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-messages-live.js') }}" defer></script>
@endpush
