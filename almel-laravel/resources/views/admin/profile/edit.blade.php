@extends('layouts.admin')
@section('title', 'حسابي')
@section('page', 'profile')
@section('content')
        @php
          $av = $user->avatarUrl();
          $ini = mb_substr(trim((string) $user->name) !== '' ? trim((string) $user->name) : (string) $user->email, 0, 1);
        @endphp
        <div class="page-head">
          <div><h1 class="page-title">حسابي</h1><p class="page-sub">عدّل اسمك وصورتك وبيانات التواصل وغيّر كلمة المرور.</p></div>
        </div>

        <div class="profile-grid">
        <section class="card" aria-labelledby="t-prof">
          <div class="card-head bordered profile-head">
            <span class="avatar xl" id="pf-avatar" data-me-avatar data-ini="{{ $ini }}" aria-hidden="true">@if ($av)<img src="{{ $av }}" alt="">@else{{ $ini }}@endif</span>
            <div class="profile-id">
              <h2 class="card-title" id="t-prof">البيانات الشخصية</h2>
              <p class="card-sub ltr">{{ $user->email }} · {{ $user->roleLabel() }}</p>
              <form id="pf-avatar-form" class="profile-photo-actions" method="POST" action="{{ route('admin.profile.avatar') }}" enctype="multipart/form-data" data-delete-url="{{ route('admin.profile.avatar.destroy') }}" novalidate>
                @csrf
                <input type="file" id="pf-avatar-input" name="avatar" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" hidden>
                <button type="button" class="btn btn-secondary btn-sm" id="pf-pick"><span class="material-symbols-outlined" aria-hidden="true">upload</span>رفع صورة</button>
                <button type="button" class="btn btn-danger-ghost btn-sm" id="pf-remove" @disabled(! $av)><span class="material-symbols-outlined" aria-hidden="true">delete</span>إزالة الصورة</button>
                <span class="profile-pending" id="pf-pending" hidden>
                  <button type="submit" class="btn btn-primary btn-sm" id="pf-save"><span class="material-symbols-outlined" aria-hidden="true">check</span>حفظ الصورة</button>
                  <button type="button" class="btn btn-ghost btn-sm" id="pf-cancel">إلغاء</button>
                </span>
              </form>
              <p class="hint" id="pf-hint">JPG أو PNG أو WEBP، حتى 2 ميغابايت. تُقصّ الصورة مربّعة تلقائياً.</p>
              <p class="error" id="pf-error" role="alert" @if (! $errors->has('avatar')) hidden @endif><span class="material-symbols-outlined" aria-hidden="true">error</span><span id="pf-error-text">{{ $errors->first('avatar') }}</span></p>
            </div>
          </div>
          <form method="POST" action="{{ route('admin.profile.update') }}" class="card-body profile-form" novalidate>
            @csrf @method('PUT')
            <div class="field">
              <label class="label" for="pr-name"><span>الاسم <span class="req" aria-hidden="true">*</span></span></label>
              <input class="input" id="pr-name" name="name" maxlength="255" required value="{{ old('name', $user->name) }}">
              @error('name')<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror
            </div>
            <div class="field-row">
              <div class="field"><label class="label" for="pr-phone"><span>الهاتف <span class="opt">اختياري</span></span></label><input class="input" id="pr-phone" name="phone" dir="ltr" maxlength="30" value="{{ old('phone', $user->phone) }}">@error('phone')<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror</div>
              <div class="field"><label class="label" for="pr-job"><span>المسمى الوظيفي <span class="opt">اختياري</span></span></label><input class="input" id="pr-job" name="job_title" maxlength="120" value="{{ old('job_title', $user->job_title) }}">@error('job_title')<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror</div>
            </div>
            <div class="profile-actions"><button type="submit" class="btn btn-primary"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ البيانات</button></div>
          </form>
        </section>

        <section class="card" aria-labelledby="t-pw">
          <div class="card-head bordered profile-head"><div><h2 class="card-title" id="t-pw">تغيير كلمة المرور</h2><p class="card-sub">8 أحرف على الأقل، وتحتوي على حروف وأرقام.</p></div></div>
          <form method="POST" action="{{ route('admin.profile.password') }}" class="card-body profile-form" novalidate>
            @csrf @method('PUT')
            <div class="field">
              <label class="label" for="pw-cur">كلمة المرور الحالية</label>
              <input class="input" id="pw-cur" name="current_password" type="password" dir="ltr" autocomplete="current-password" required>
              @error('current_password')<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror
            </div>
            <div class="field-row">
              <div class="field"><label class="label" for="pw-new">كلمة المرور الجديدة</label><input class="input" id="pw-new" name="password" type="password" dir="ltr" autocomplete="new-password" required>@error('password')<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ $message }}</span></p>@enderror</div>
              <div class="field"><label class="label" for="pw-new2">تأكيد كلمة المرور</label><input class="input" id="pw-new2" name="password_confirmation" type="password" dir="ltr" autocomplete="new-password" required></div>
            </div>
            <div class="profile-actions"><button type="submit" class="btn btn-primary"><span class="material-symbols-outlined" aria-hidden="true">key</span>تغيير كلمة المرور</button></div>
          </form>
        </section>
        </div>
@endsection
@push('scripts')
  <script src="{{ asset('assets/admin/js/admin-dbkit.js') }}"></script>
  <script src="{{ asset('assets/admin/js/admin-profile.js') }}"></script>
@endpush
