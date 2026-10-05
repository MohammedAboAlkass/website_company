@extends('layouts.admin')
@section('title', 'المستخدمون')
@section('page', 'users')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-content.css') }}">
@endpush
@section('content')
@php
  $form = session('user_form');
  $mode = $form['mode'] ?? null;
  $editId = $form['id'] ?? null;
  $roleTone = ['admin' => 'info', 'manager' => 'info'];
  $can = fn ($k) => $me->hasPermission($k);
  $statusMap = ['active' => ['نشط', 'info'], 'disabled' => ['معطّل', 'danger'], 'invited' => ['مدعو', 'warn']];
  $hasFilters = $filters['q'] !== '' || $filters['role'] !== '' || $filters['status'] !== '';
@endphp

        <div class="page-head">
          <div><h1 class="page-title">المستخدمون</h1><p class="page-sub">أدِر حسابات فريق لوحة التحكم وأدوارهم وكلمات مرورهم. الأدوار وما يحق لكل دور تُدار من صفحة «الأدوار والصلاحيات».</p></div>
          <div class="page-actions">
            @if ($can('roles.view'))<a class="btn btn-secondary" href="{{ route('admin.roles.index') }}" data-perm="roles.view"><span class="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>الأدوار والصلاحيات</a>@endif
            @if ($can('users.create'))<button type="button" class="btn btn-primary" id="u-add" data-perm="users.create"><span class="material-symbols-outlined" aria-hidden="true">person_add</span>مستخدم جديد</button>@endif
          </div>
        </div>

        <section class="card" aria-label="ملخص المستخدمين"><dl class="mini-stats">
          <div><dt>إجمالي المستخدمين</dt><dd><b>{{ $stats['total'] }}</b></dd></div>
          <div><dt>حسابات نشطة</dt><dd><b>{{ $stats['active'] }}</b></dd></div>
          <div><dt>مديرون نشطون</dt><dd><b>{{ $stats['admins'] }}</b></dd></div>
          <div><dt>حسابات معطّلة</dt><dd><b>{{ $stats['disabled'] }}</b></dd></div>
        </dl></section>

        <section class="card mt-24" aria-labelledby="t-ulist">
          <h2 class="sr-only" id="t-ulist">قائمة المستخدمين</h2>
          <form class="toolbar" method="GET" action="{{ route('admin.users.index') }}" role="search">
            <label class="input-icon"><span class="sr-only">بحث في المستخدمين</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" name="q" type="search" value="{{ $filters['q'] }}" placeholder="ابحث بالاسم أو البريد…" autocomplete="off"></label>
            <label class="sr-only" for="f-role">تصفية حسب الدور</label>
            <select class="select sm auto" id="f-role" name="role" onchange="this.form.submit()">
              <option value="">كل الأدوار</option>
              @foreach ($filterRoles as $key => $label)<option value="{{ $key }}" @selected($filters['role'] === $key)>{{ $label }}</option>@endforeach
            </select>
            <label class="sr-only" for="f-status">تصفية حسب الحالة</label>
            <select class="select sm auto" id="f-status" name="status" onchange="this.form.submit()">
              <option value="">كل الحالات</option>
              @foreach ($statusMap as $key => $s)<option value="{{ $key }}" @selected($filters['status'] === $key)>{{ $s[0] }}</option>@endforeach
            </select>
            <button type="submit" class="btn btn-secondary btn-sm"><span class="material-symbols-outlined" aria-hidden="true">filter_alt</span>تطبيق</button>
            @if ($hasFilters)<a class="btn btn-ghost btn-sm" href="{{ route('admin.users.index') }}">مسح التصفية</a>@endif
            <span class="grow"></span>
            <span class="muted" style="font-size:13px" aria-live="polite">{{ $users->total() }} نتيجة</span>
          </form>
          <div class="table-wrap" tabindex="0">
            <table class="table">
              <thead><tr><th scope="col">المستخدم</th><th scope="col">الدور</th><th scope="col">الحالة</th><th scope="col">آخر دخول</th><th scope="col">تاريخ الإنشاء</th><th scope="col" class="col-actions"><span class="sr-only">إجراءات</span></th></tr></thead>
              <tbody>
              @forelse ($users as $u)
                @php
                  $st = $statusMap[$u->status] ?? [$u->status, 'neutral'];
                  $isMe = $u->id === $me->id;
                  $label = $roleLabels[$u->role] ?? $u->role;
                @endphp
                <tr>
                  <td><div class="cell-media"><span class="avatar navy" aria-hidden="true" data-ini="{{ mb_substr($u->name, 0, 1) }}">@if ($u->avatarUrl())<img src="{{ $u->avatarUrl() }}" alt="" loading="lazy">@else{{ mb_substr($u->name, 0, 1) }}@endif</span><div style="min-width:0"><span class="t">{{ $u->name }}@if ($isMe) <span class="muted" style="font-weight:500">(أنت)</span>@endif</span><span class="s ltr">{{ $u->email }}</span></div></div></td>
                  <td><span class="pill pill-{{ $roleTone[$u->role] ?? 'neutral' }} no-dot">{{ $label }}</span>@if (in_array($u->role, $roleOff, true)) <span class="muted" style="font-size:12px">(دور معطّل)</span>@endif</td>
                  <td><span class="pill pill-{{ $st[1] }}">{{ $st[0] }}</span></td>
                  <td class="num-cell">{{ $u->last_login_at ? $u->last_login_at->format('Y-m-d H:i') : '—' }}</td>
                  <td class="num-cell">{{ $u->created_at ? $u->created_at->format('Y-m-d') : '—' }}</td>
                  <td class="col-actions">
                    @php($manage = $canManage($u))
                    <div style="display:inline-flex;gap:2px">
                      @if ($manage && $can('users.edit'))
                      <button type="button" class="icon-btn sm" data-perm="users.edit" data-edit data-id="{{ $u->id }}" data-name="{{ $u->name }}" data-email="{{ $u->email }}" data-role="{{ $u->role }}" data-active="{{ $u->status === 'active' ? 1 : 0 }}" data-self="{{ $isMe ? 1 : 0 }}" data-action="{{ route('admin.users.update', $u) }}" aria-label="تعديل {{ $u->name }}" title="تعديل"><span class="material-symbols-outlined" aria-hidden="true">edit</span></button>
                      <button type="button" class="icon-btn sm" data-perm="users.edit" data-pass data-name="{{ $u->name }}" data-action="{{ route('admin.users.password', $u) }}" aria-label="إعادة تعيين كلمة مرور {{ $u->name }}" title="إعادة تعيين كلمة المرور"><span class="material-symbols-outlined" aria-hidden="true">key</span></button>
                      @endif
                      @unless ($isMe)
                      @if ($manage && $can('users.edit'))
                      <form method="POST" action="{{ route('admin.users.toggle', $u) }}" style="display:contents">@csrf @method('PATCH')
                        <button type="submit" class="icon-btn sm" data-perm="users.edit" aria-label="{{ $u->status === 'active' ? 'تعطيل' : 'تفعيل' }} {{ $u->name }}" title="{{ $u->status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب' }}"><span class="material-symbols-outlined" aria-hidden="true">{{ $u->status === 'active' ? 'person_off' : 'how_to_reg' }}</span></button>
                      </form>
                      @endif
                      @if ($manage && $can('users.delete'))
                      <form method="POST" action="{{ route('admin.users.destroy', $u) }}" style="display:contents" data-name="{{ $u->name }}" data-confirm="سيتم حذف الحساب ولن يتمكن من الدخول بعد الآن." data-confirm-title="حذف المستخدم «{{ $u->name }}»؟" data-confirm-label="نعم، احذف" data-tone="danger">@csrf @method('DELETE')
                        <button type="submit" class="icon-btn sm" data-perm="users.delete" style="color:var(--danger-text)" aria-label="حذف {{ $u->name }}" title="حذف"><span class="material-symbols-outlined" aria-hidden="true">delete</span></button>
                      </form>
                      @endif
                      @endunless
                    </div>
                  </td>
                </tr>
              @empty
                <tr><td colspan="6"><div class="empty" style="padding:32px 0;text-align:center"><span class="material-symbols-outlined empty-ico" aria-hidden="true">group_off</span><p>لا يوجد مستخدمون مطابقون.</p></div></td></tr>
              @endforelse
              </tbody>
            </table>
          </div>
          @if ($users->hasPages())
          <div class="card-foot"><nav class="pagination" style="width:100%" aria-label="التنقل بين الصفحات">
            <span class="info">عرض {{ $users->firstItem() }}–{{ $users->lastItem() }} من {{ $users->total() }}</span>
            <div class="pages">
              @if ($users->onFirstPage())<span class="page-btn" disabled aria-disabled="true"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span><span class="sr-only">السابق</span></span>
              @else<a class="page-btn" href="{{ $users->previousPageUrl() }}"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span><span class="sr-only">السابق</span></a>@endif
              @for ($p = 1; $p <= $users->lastPage(); $p++)
                <a class="page-btn" href="{{ $users->url($p) }}" @if ($p === $users->currentPage()) aria-current="page" @endif>{{ $p }}</a>
              @endfor
              @if ($users->hasMorePages())<a class="page-btn" href="{{ $users->nextPageUrl() }}"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span><span class="sr-only">التالي</span></a>
              @else<span class="page-btn" disabled aria-disabled="true"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span><span class="sr-only">التالي</span></span>@endif
            </div>
          </nav></div>
          @endif
        </section>
@endsection
@section('after')
{{-- Add / edit drawer --}}
<div class="drawer" id="u-drawer" role="dialog" aria-modal="true" aria-labelledby="u-title" hidden>
  <form id="u-form" method="POST" action="{{ route('admin.users.store') }}" novalidate style="display:contents">
    @csrf
    <input type="hidden" name="_method" id="u-method" value="POST" disabled>
    <div class="drawer-head">
      <div><h2 id="u-title">مستخدم جديد</h2><p id="u-sub">أدخل بيانات الحساب وحدّد دوره.</p></div>
      <button type="button" class="icon-btn" data-close-drawer aria-label="إغلاق"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
    </div>
    <div class="drawer-body">
      @if ($errors->has('form'))<p class="error" role="alert"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $errors->first('form') }}</span></p>@endif
      <div class="field">
        <label class="label" for="u-name"><span>الاسم <span class="req" aria-hidden="true">*</span></span></label>
        <input class="input" id="u-name" name="name" maxlength="255" required value="{{ in_array($mode, ['create', 'edit']) ? old('name') : '' }}">
        @if (in_array($mode, ['create', 'edit']))@error('name')<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror @endif
      </div>
      <div class="field">
        <label class="label" for="u-email"><span>البريد الإلكتروني <span class="req" aria-hidden="true">*</span></span></label>
        <input class="input" id="u-email" name="email" type="email" dir="ltr" maxlength="255" required autocomplete="off" value="{{ in_array($mode, ['create', 'edit']) ? old('email') : '' }}">
        @if (in_array($mode, ['create', 'edit']))@error('email')<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror @endif
      </div>
      <div class="field">
        <label class="label" for="u-role">الدور <span class="req" aria-hidden="true">*</span></label>
        <select class="select" id="u-role" name="role">
          @foreach ($roles as $key => $label)<option value="{{ $key }}" data-desc="{{ $roleDescs[$key] ?? '' }}" @selected((in_array($mode, ['create', 'edit']) ? old('role', 'editor') : 'editor') === $key)>{{ $label }}</option>@endforeach
          {{-- a role that is not assignable by you (e.g. admin) is added by JS when editing a user that already has it --}}
        </select>
        @if (in_array($mode, ['create', 'edit']))@error('role')<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror @endif
        <p class="hint" id="u-role-hint">اختر الدور؛ صلاحياته تُحدَّد من صفحة «الأدوار والصلاحيات».</p>
      </div>
      <div id="u-pass-wrap">
        <div class="field-row">
          <div class="field">
            <label class="label" for="u-pass"><span>كلمة المرور <span class="req" aria-hidden="true">*</span></span></label>
            <input class="input" id="u-pass" name="password" type="password" dir="ltr" autocomplete="new-password">
          </div>
          <div class="field">
            <label class="label" for="u-pass2"><span>تأكيد كلمة المرور <span class="req" aria-hidden="true">*</span></span></label>
            <input class="input" id="u-pass2" name="password_confirmation" type="password" dir="ltr" autocomplete="new-password">
          </div>
        </div>
        @if ($mode === 'create')@error('password')<p class="error mt-8"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror @endif
        <p class="hint mt-8">8 أحرف على الأقل، وتحتوي على حروف وأرقام.</p>
      </div>
      <div class="field">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <span class="label" id="u-active-l" style="flex:1">الحساب مفعّل<span class="hint" style="font-weight:500">يستطيع المستخدم الدخول فقط عندما يكون الحساب مفعّلاً.</span></span>
          <button type="button" class="switch" id="u-active-sw" role="switch" aria-checked="true" aria-labelledby="u-active-l"></button>
          <input type="hidden" name="active" id="u-active" value="1">
        </div>
      </div>
    </div>
    <div class="drawer-foot">
      <button type="button" class="btn btn-secondary" data-close-drawer>إلغاء</button>
      <button type="submit" class="btn btn-primary"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ</button>
    </div>
  </form>
</div>

{{-- Reset password drawer --}}
<div class="drawer" id="p-drawer" role="dialog" aria-modal="true" aria-labelledby="p-title" hidden>
  <form id="p-form" method="POST" action="#" novalidate style="display:contents">
    @csrf @method('PUT')
    <div class="drawer-head">
      <div><h2 id="p-title">إعادة تعيين كلمة المرور</h2><p id="p-sub"></p></div>
      <button type="button" class="icon-btn" data-close-drawer aria-label="إغلاق"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
    </div>
    <div class="drawer-body">
      <div class="field">
        <label class="label" for="p-pass"><span>كلمة المرور الجديدة <span class="req" aria-hidden="true">*</span></span></label>
        <input class="input" id="p-pass" name="password" type="password" dir="ltr" autocomplete="new-password">
        @if ($mode === 'password')@error('password')<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror @endif
      </div>
      <div class="field">
        <label class="label" for="p-pass2"><span>تأكيد كلمة المرور <span class="req" aria-hidden="true">*</span></span></label>
        <input class="input" id="p-pass2" name="password_confirmation" type="password" dir="ltr" autocomplete="new-password">
        <p class="hint">8 أحرف على الأقل، وتحتوي على حروف وأرقام. سلّم كلمة المرور للمستخدم بطريقة آمنة.</p>
      </div>
    </div>
    <div class="drawer-foot">
      <button type="button" class="btn btn-secondary" data-close-drawer>إلغاء</button>
      <button type="submit" class="btn btn-primary"><span class="material-symbols-outlined" aria-hidden="true">key</span>حفظ كلمة المرور</button>
    </div>
  </form>
</div>
@endsection
@push('scripts')
<script>
(function () {
  var UI = window.AdminUI; if (!UI) return;
  var $ = function (s) { return document.querySelector(s); };
  var drawer = $('#u-drawer'), form = $('#u-form'), pdrawer = $('#p-drawer'), pform = $('#p-form');
  var sw = $('#u-active-sw'), act = $('#u-active'), storeUrl = @json(route('admin.users.store'));
  var roleSel = $('#u-role'), roleHint = $('#u-role-hint'), ROLE_LABELS = @json($roleLabels), ROLE_DESCS = @json($roleDescs);
  function defRole() { return roleSel.querySelector('option[value="editor"]') ? 'editor' : (roleSel.options[0] ? roleSel.options[0].value : ''); }
  function setRole(v) { // keep a non-assignable current role selectable (read-only) when editing
    if (v && !roleSel.querySelector('option[value="' + v + '"]')) { var o = document.createElement('option'); o.value = v; o.textContent = ROLE_LABELS[v] || v; o.dataset.extra = '1'; roleSel.appendChild(o); }
    roleSel.value = v || defRole(); showHint();
  }
  function showHint() { var d = ROLE_DESCS[roleSel.value]; roleHint.textContent = d ? d : 'اختر الدور؛ صلاحياته تُحدَّد من صفحة «الأدوار والصلاحيات».'; }
  roleSel.addEventListener('change', showHint);
  function dropExtra() { roleSel.querySelectorAll('option[data-extra]').forEach(function (o) { o.remove(); }); }
  function setActive(on) { sw.setAttribute('aria-checked', on ? 'true' : 'false'); act.value = on ? '1' : '0'; }
  sw.addEventListener('click', function () { if (!sw.disabled) setActive(sw.getAttribute('aria-checked') !== 'true'); });
  function openCreate() {
    form.action = storeUrl; $('#u-method').disabled = true;
    $('#u-title').textContent = 'مستخدم جديد'; $('#u-sub').textContent = 'أدخل بيانات الحساب وحدّد دوره.';
    dropExtra(); $('#u-name').value = ''; $('#u-email').value = ''; setRole(defRole()); $('#u-pass').value = ''; $('#u-pass2').value = '';
    $('#u-pass-wrap').hidden = false; $('#u-pass').disabled = false; $('#u-pass2').disabled = false;
    setActive(true); sw.disabled = false; $('#u-role').disabled = false;
    UI.Drawer.open(drawer);
  }
  function openEdit(b) {
    form.action = b.dataset.action; $('#u-method').disabled = false; $('#u-method').value = 'PUT';
    $('#u-title').textContent = 'تعديل مستخدم'; $('#u-sub').textContent = b.dataset.email;
    dropExtra(); $('#u-name').value = b.dataset.name; $('#u-email').value = b.dataset.email; setRole(b.dataset.role);
    $('#u-pass-wrap').hidden = true; $('#u-pass').disabled = true; $('#u-pass2').disabled = true;
    setActive(b.dataset.active === '1');
    var self = b.dataset.self === '1'; sw.disabled = self; $('#u-role').disabled = self; // you cannot change your own role/status
    UI.Drawer.open(drawer);
  }
  function openPass(b) {
    pform.action = b.dataset.action; $('#p-sub').textContent = b.dataset.name; $('#p-pass').value = ''; $('#p-pass2').value = '';
    UI.Drawer.open(pdrawer);
  }
  $('#u-add').addEventListener('click', openCreate);
  document.querySelectorAll('[data-edit]').forEach(function (b) { b.addEventListener('click', function () { openEdit(b); }); });
  document.querySelectorAll('[data-pass]').forEach(function (b) { b.addEventListener('click', function () { openPass(b); }); });
  form.addEventListener('submit', function () { $('#u-role').disabled = false; }); // disabled selects are not submitted
  // delete confirmation: handled by the shared data-confirm handler in admin.js
  @if ($mode === 'create')
  openCreate(); $('#u-name').value = @json(old('name', '')); $('#u-email').value = @json(old('email', '')); setRole(@json(old('role', 'editor'))); setActive(@json((bool) old('active', true)));
  @elseif ($mode === 'edit')
  (function () { var b = document.querySelector('[data-edit][data-id="{{ (int) $editId }}"]'); if (b) { openEdit(b); $('#u-name').value = @json(old('name', '')); $('#u-email').value = @json(old('email', '')); if (!$('#u-role').disabled) setRole(@json(old('role', 'editor'))); } })();
  @elseif ($mode === 'password')
  (function () { var b = document.querySelector('[data-pass][data-action$="/users/{{ (int) $editId }}/password"]'); if (b) openPass(b); })();
  @endif
})();
</script>
@endpush
