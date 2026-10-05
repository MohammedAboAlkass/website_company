@extends('layouts.admin')
@section('title', 'النسخ الاحتياطي')
@section('page', 'backup')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-builder.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-backup.css') }}">
@endpush
@section('content')
        <div class="page-head">
          <div><h1 class="page-title">النسخ الاحتياطي</h1><p class="page-sub">صدّر بيانات الموقع إلى ملف JSON واحتفظ به، أو استعد نسخة سابقة بعد معاينتها والتأكد من سلامتها.</p></div>
        </div>

        <div class="bk-note" role="note">
          <span class="material-symbols-outlined" aria-hidden="true">info</span>
          <p><strong>ما لا تشمله النسخة:</strong> حسابات المستخدمين وكلمات المرور، سجل النشاط، الجلسات، المفاتيح السرية، وملفات الصور والفيديو المرفوعة (تُحفظ بياناتها في القاعدة فقط، أما الملفات نفسها فانسخ مجلد <code dir="ltr">storage/app/public</code> عند الحاجة).</p>
        </div>

        <div class="grid mt-24">
          <section class="card xl-6" aria-labelledby="bk-t-export">
            <div class="card-head bordered"><div><h2 class="card-title" id="bk-t-export">إنشاء نسخة وتنزيلها</h2><p class="card-sub">اختر ما تريد تضمينه ثم أنشئ الملف.</p></div></div>
            <div class="card-body">
              <div id="bk-groups" class="bk-groups" aria-live="polite"></div>
              <div class="field"><label class="label" for="bk-note">ملاحظة (اختياري)</label><input class="input" id="bk-note" maxlength="300" placeholder="مثال: قبل تحديث الصفحة الرئيسية"></div>
              <button type="button" class="btn btn-primary" id="bk-export"><span class="material-symbols-outlined" aria-hidden="true">download</span>إنشاء النسخة وتنزيلها</button>
            </div>
          </section>

          <section class="card xl-6" aria-labelledby="bk-t-import">
            <div class="card-head bordered"><div><h2 class="card-title" id="bk-t-import">استعادة نسخة</h2><p class="card-sub">يُفحص الملف أولاً ولا يتغير شيء قبل تأكيدك. تؤخذ نسخة أمان تلقائية قبل الاستعادة.</p></div></div>
            <div class="card-body">
              <label class="bk-drop" id="bk-drop" for="bk-file"><span class="material-symbols-outlined" aria-hidden="true">upload_file</span><span><strong>اختر ملف النسخة (JSON)</strong><small>أو اسحبه إلى هنا — حتى 50 ميغابايت</small></span><input type="file" id="bk-file" accept=".json,application/json" hidden></label>
              <div id="bk-preview" hidden></div>
            </div>
          </section>
        </div>

        <section class="card mt-24" aria-labelledby="bk-t-hist">
          <div class="card-head bordered"><div><h2 class="card-title" id="bk-t-hist">سجل النسخ</h2><p class="card-sub">آخر العمليات. نسخ «الأمان» تُنشأ تلقائياً قبل كل استعادة.</p></div></div>
          <div id="bk-history"></div>
        </section>
@endsection
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-dbkit.js') }}"></script>
<script>window.__DB_PAGES = { backup: 1 };</script>
<script src="{{ asset('assets/admin/js/admin-backup.js') }}"></script>
@endpush
