@extends('layouts.admin')
@section('title', 'تحرير خبر')
@section('page', 'news-edit')
@section('content')

        <div class="page-head">
          <div><h1 class="page-title" id="ne-heading">خبر جديد</h1><p class="page-sub"><span class="save-state" id="save-state" aria-live="polite"><span class="material-symbols-outlined" aria-hidden="true">cloud_done</span>لا توجد تغييرات بعد</span></p></div>
          <div class="page-actions">
            <button type="button" class="btn btn-ghost" id="ne-preview"><span class="material-symbols-outlined" aria-hidden="true">visibility</span>معاينة</button>
            <button type="button" class="btn btn-secondary" id="ne-draft"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ كمسودة</button>
            <button type="button" class="btn btn-primary" id="ne-publish"><span class="material-symbols-outlined flip-rtl" aria-hidden="true">send</span><span class="btn-text">نشر الآن</span></button>
          </div>
        </div>
        <div class="grid">
          <section class="card xl-8" aria-label="محتوى الخبر">
            <div class="card-body" style="display:flex;flex-direction:column;gap:24px">
              <div>
                <label class="sr-only" for="ne-title">عنوان الخبر</label>
                <textarea id="ne-title" class="editor-title" rows="1" placeholder="اكتب عنواناً واضحاً وجذاباً للخبر…" aria-describedby="ne-title-err"></textarea>
                <p class="error mt-8" id="ne-title-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span>العنوان يجب أن يكون 8 أحرف على الأقل.</span></p>
              </div>
              <div class="field">
                <span class="label" id="ne-cover-label">صورة الغلاف</span>
                <div class="dropzone" id="ne-dropzone">
                  <input type="file" id="ne-cover-input" accept="image/*" aria-labelledby="ne-cover-label ne-cover-hint">
                  <span class="dz-ico"><span class="material-symbols-outlined" aria-hidden="true">add_photo_alternate</span></span>
                  <strong>اسحب صورة الغلاف هنا أو <span style="color:var(--accent-text)">تصفّح</span></strong>
                  <span class="hint" id="ne-cover-hint">مقاس 1600×900 أو أكبر — تظهر في بطاقة الخبر وعند المشاركة</span>
                </div>
                <div class="cover-preview" id="ne-cover-preview" hidden>
                  <img id="ne-cover-img" alt="معاينة صورة الغلاف">
                  <div class="cp-actions">
                    <button type="button" class="btn btn-sm" id="ne-cover-change"><span class="material-symbols-outlined" aria-hidden="true">sync</span>تغيير</button>
                    <button type="button" class="btn btn-sm danger" id="ne-cover-remove"><span class="material-symbols-outlined" aria-hidden="true">delete</span>إزالة</button>
                  </div>
                </div>
              </div>
              <div class="field">
                <span class="label" id="ne-body-label">نص الخبر</span>
                <div id="ne-editor"></div>
              </div>
            </div>
          </section>

          <div class="xl-4">
            <div class="stack sticky-side">
              <section class="card" aria-labelledby="t-pub">
                <div class="card-head bordered"><h2 class="card-title" id="t-pub">النشر</h2></div>
                <div class="card-body" style="display:flex;flex-direction:column;gap:20px">
                  <div class="field"><label class="label" for="ne-status">الحالة</label>
                    <select class="select" id="ne-status"></select></div>
                  <div class="field" id="ne-date-field"><label class="label" for="ne-date">تاريخ ووقت النشر</label><input class="input" id="ne-date" type="datetime-local"></div>
                  <div class="row" style="font-size:13px;color:var(--text-2)"><span class="material-symbols-outlined" aria-hidden="true">person</span><span>الكاتب: <span id="ne-author">فريق الإعلام</span></span></div>
                </div>
              </section>
              <section class="card" aria-labelledby="t-tax">
                <div class="card-head bordered"><h2 class="card-title" id="t-tax">التصنيف والوسوم</h2></div>
                <div class="card-body" style="display:flex;flex-direction:column;gap:20px">
                  <div class="field"><label class="label" for="ne-cat">التصنيف</label><select class="select" id="ne-cat"></select></div>
                  <div class="field"><label class="label" for="ne-tag-input">الوسوم</label>
                    <div class="tags-input"><ul id="ne-tags-list" style="display:contents" aria-label="الوسوم المضافة"></ul><input id="ne-tag-input" placeholder="أضف وسماً ثم Enter" aria-describedby="ne-tag-hint" list="ne-tag-suggest" autocomplete="off" maxlength="100"></div>
                    <p class="hint" id="ne-tag-hint">اضغط Enter أو الفاصلة لإضافة وسم. تظهر الوسوم الموجودة كاقتراحات أثناء الكتابة.</p>
                    <datalist id="ne-tag-suggest">@foreach (\App\Models\Tag::query()->orderBy('name')->limit(300)->pluck('name') as $__tagName)<option value="{{ $__tagName }}"></option>@endforeach</datalist></div>
                </div>
              </section>
              <section class="card" aria-labelledby="t-seo">
                <div class="card-head bordered"><h2 class="card-title" id="t-seo">معاينة محركات البحث</h2></div>
                <div class="card-body" style="display:flex;flex-direction:column;gap:20px">
                  <div class="seo-preview" aria-live="polite">
                    <div class="u"><i aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-2.8 3.6-7 6.2-7 10.2A7 7 0 0 0 12 21a7 7 0 0 0 7-7.8C19 9.2 14.8 6.6 12 3Z"/></svg></i><span class="url" id="seo-u"></span></div>
                    <p class="t" id="seo-t"></p><p class="d" id="seo-d"></p>
                  </div>
                  <div class="field"><label class="label" for="ne-slug">الرابط المختصر (Slug)</label><input class="input" id="ne-slug" dir="ltr" placeholder="news-title"></div>
                  <div class="field"><label class="label" for="ne-meta"><span>الوصف التعريفي</span><span class="counter" id="ne-meta-count">0 / 160</span></label><textarea class="textarea" id="ne-meta" rows="3" placeholder="وصف موجز يظهر في نتائج البحث…"></textarea></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      @endsection
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-editor.css') }}">
@endpush
@push('constants')
<script>window.__DB_PAGES = { 'news-edit': 1 }; window.__NEWS_OPTS = {!! json_encode($opts, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-editor.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-news-db.js') }}"></script>
@endpush
