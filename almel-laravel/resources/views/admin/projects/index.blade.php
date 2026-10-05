@extends('layouts.admin')
@section('title', 'إدارة المشاريع')
@section('page', 'projects')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-editor.css') }}">
<link rel="stylesheet" href="{{ asset('assets/admin/css/admin-projects.css') }}">
@endpush
@section('content')

        <div class="page-head">
          <div><h1 class="page-title">إدارة المشاريع</h1><p class="page-sub">أضف المشاريع وحدّث تفاصيلها وصورها وتحديثاتها وحالتها قبل ظهورها في الموقع.</p></div>
          <div class="page-actions">
            <button type="button" class="btn btn-primary" id="add-project" data-perm="projects.create"><span class="material-symbols-outlined" aria-hidden="true">add</span>مشروع جديد</button>
          </div>
        </div>

        <section class="card" aria-label="ملخص المشاريع"><dl class="mini-stats" id="p-stats"></dl></section>

        <section class="card mt-24" aria-labelledby="t-plist">
          <h2 class="sr-only" id="t-plist">قائمة المشاريع</h2>
          <div class="toolbar">
            <label class="input-icon"><span class="sr-only">بحث في المشاريع</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" id="proj-search" type="search" placeholder="ابحث بالعنوان أو الموقع…" autocomplete="off"></label>
            <label class="sr-only" for="f-cat">تصفية حسب الفئة</label><select class="select sm auto" id="f-cat"></select>
            <label class="sr-only" for="f-status">تصفية حسب الحالة</label><select class="select sm auto" id="f-status"></select>
            <span class="grow"></span>
            <span class="muted" id="result-count" aria-live="polite" style="font-size:13px"></span>
            <div class="seg icons" id="view-seg" role="group" aria-label="طريقة العرض">
              <button type="button" data-value="table" aria-pressed="true" aria-label="عرض جدول" title="جدول"><span class="material-symbols-outlined" aria-hidden="true">table_rows</span></button>
              <button type="button" data-value="grid" aria-pressed="false" aria-label="عرض شبكة" title="شبكة"><span class="material-symbols-outlined" aria-hidden="true">grid_view</span></button>
            </div>
          </div>
          <div class="bulkbar" id="bulkbar" hidden>
            <strong id="bulk-count" aria-live="polite"></strong><span class="sp"></span>
            <button type="button" class="btn btn-secondary btn-sm" id="bulk-activate" data-perm="projects.publish"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span>تفعيل</button>
            <button type="button" class="btn btn-secondary btn-sm" id="bulk-draft" data-perm="projects.edit"><span class="material-symbols-outlined" aria-hidden="true">inventory_2</span>نقل إلى المسودات</button>
            <button type="button" class="btn btn-danger-ghost btn-sm" id="bulk-delete" data-perm="projects.delete"><span class="material-symbols-outlined" aria-hidden="true">delete</span>حذف</button>
            <button type="button" class="btn btn-ghost btn-sm" id="bulk-clear">إلغاء التحديد</button>
          </div>
          <div id="proj-view" aria-live="polite"></div>
          <div class="card-foot"><div class="pagination" id="proj-pages" style="width:100%"></div></div>
        </section>
      @endsection
@section('after')
<div class="drawer drawer-wide" id="project-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-describedby="drawer-sub" hidden>
    <form id="project-form" novalidate style="display:contents">
      <div class="drawer-head">
        <div><h2 id="drawer-title">مشروع جديد</h2><p id="drawer-sub">أدخل بيانات المشروع لإضافته إلى القائمة.</p></div>
        <button type="button" class="icon-btn" data-close-drawer aria-label="إغلاق"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
      </div>
      <div class="tabs pf-tabs" role="tablist" id="pf-tabs" aria-label="أقسام بيانات المشروع">
        <button type="button" class="tab" role="tab" id="pft-basic" aria-controls="pfp-basic" aria-selected="true">الأساسية</button>
        <button type="button" class="tab" role="tab" id="pft-content" aria-controls="pfp-content" aria-selected="false" tabindex="-1">الوصف والمحتوى</button>
        <button type="button" class="tab" role="tab" id="pft-gallery" aria-controls="pfp-gallery" aria-selected="false" tabindex="-1">معرض الصور <span class="tab-count" id="pf-gal-n">0</span></button>
        <button type="button" class="tab" role="tab" id="pft-updates" aria-controls="pfp-updates" aria-selected="false" tabindex="-1">التحديثات <span class="tab-count" id="pf-upd-n">0</span></button>
        <button type="button" class="tab" role="tab" id="pft-seo" aria-controls="pfp-seo" aria-selected="false" tabindex="-1">الظهور والبحث</button>
      </div>
      <div class="drawer-body">
        <div role="tabpanel" id="pfp-basic" aria-labelledby="pft-basic">
          <div class="field">
            <label class="label" for="pf-title"><span>عنوان المشروع <span class="req" aria-hidden="true">*</span></span><span class="counter" id="pf-title-count" aria-live="polite">0 / 120</span></label>
            <input class="input" id="pf-title" maxlength="120" required aria-describedby="pf-title-err" placeholder="مثال: سلال غذائية لمراكز الإيواء">
            <p class="error" id="pf-title-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
          </div>
          <div class="field-row">
            <div class="field"><label class="label" for="pf-cat"><span>الفئة <span class="req" aria-hidden="true">*</span></span></label><select class="select" id="pf-cat" aria-describedby="pf-program-err"></select><p class="error" id="pf-program-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
            <div class="field"><label class="label" for="pf-status">الحالة</label><select class="select" id="pf-status" aria-describedby="pf-status-err"></select><p class="error" id="pf-status-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
          </div>
          <div class="field-row">
            <div class="field"><label class="label" for="pf-gov"><span>المحافظة <span class="opt">اختياري</span></span></label><select class="select" id="pf-gov"></select></div>
            <div class="field"><label class="label" for="pf-location"><span>الموقع التفصيلي <span class="opt">اختياري</span></span></label><input class="input" id="pf-location" maxlength="255" placeholder="الحي أو المخيم" aria-describedby="pf-location_text-err"><p class="error" id="pf-location_text-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
          </div>
          <div class="field-row">
            <div class="field"><label class="label" for="pf-ben"><span>عدد المستفيدين <span class="opt">اختياري</span></span></label><input class="input num" id="pf-ben" type="number" min="0" step="1" inputmode="numeric" dir="ltr" placeholder="مثال: 4500" aria-describedby="pf-beneficiaries_count-err"><p class="error" id="pf-beneficiaries_count-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
            <div class="field"><span class="label" aria-hidden="true">&nbsp;</span><label class="ct-switch-inline"><input type="checkbox" class="checkbox" id="pf-featured"><span>عرض في أقسام المشاريع المميّزة بالصفحة الرئيسية</span></label></div>
          </div>
          <div class="field-row">
            <div class="field"><label class="label" for="pf-start"><span>تاريخ البداية <span class="opt">اختياري</span></span></label><input class="input" id="pf-start" type="date" dir="ltr" aria-describedby="pf-start_date-err"><p class="error" id="pf-start_date-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
            <div class="field"><label class="label" for="pf-end"><span>تاريخ النهاية <span class="opt">اختياري</span></span></label><input class="input" id="pf-end" type="date" dir="ltr" aria-describedby="pf-end_date-err"><p class="error" id="pf-end_date-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
          </div>
          <div class="field">
            <span class="label" id="pf-cover-label"><span>صورة الغلاف <span class="opt">اختياري</span></span></span>
            <div class="dropzone" id="pf-dropzone">
              <input type="file" id="pf-cover-input" accept="image/jpeg,image/png,image/webp,image/gif" aria-labelledby="pf-cover-label pf-cover-hint">
              <span class="dz-ico"><span class="material-symbols-outlined" aria-hidden="true">cloud_upload</span></span>
              <strong>اسحب الصورة هنا أو <span style="color:var(--accent-text)">تصفّح</span></strong>
              <span class="hint" id="pf-cover-hint">JPG أو PNG أو WebP — يُفضّل 1600×900 — حتى {{ $opts['maxMb'] }} ميغابايت</span>
            </div>
            <div class="cover-preview" id="pf-cover-preview" hidden>
              <img id="pf-cover-img" alt="معاينة صورة الغلاف">
              <div class="cp-actions">
                <button type="button" class="btn btn-sm" id="pf-cover-change"><span class="material-symbols-outlined" aria-hidden="true">sync</span>تغيير</button>
                <button type="button" class="btn btn-sm danger" id="pf-cover-remove"><span class="material-symbols-outlined" aria-hidden="true">delete</span>إزالة</button>
              </div>
            </div>
            <p class="hint" id="pf-cover-name" aria-live="polite"></p>
            <p class="error" id="pf-cover_media_id-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
          </div>
          <div class="field"><label class="label" for="pf-cover-alt"><span>النص البديل للصورة <span class="opt">اختياري</span></span></label><input class="input" id="pf-cover-alt" maxlength="255" placeholder="وصف مختصر لما تُظهره الصورة" aria-describedby="pf-cover_alt-err"><p class="error" id="pf-cover_alt-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
        </div>

        <div role="tabpanel" id="pfp-content" aria-labelledby="pft-content" hidden>
          <div class="field">
            <label class="label" for="pf-summary"><span>ملخص قصير <span class="opt">يظهر في البطاقات</span></span><span class="counter" id="pf-summary-count" aria-live="polite">0 / 500</span></label>
            <textarea class="textarea" id="pf-summary" rows="3" maxlength="500" placeholder="جملتان تلخّصان المشروع (يُملأ تلقائياً من الوصف إن تُرك فارغاً)…" aria-describedby="pf-summary-err" style="min-height:0"></textarea>
            <p class="error" id="pf-summary-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
          </div>
          <div class="field">
            <label class="label" for="pf-desc"><span>الوصف الكامل</span><span class="counter" id="pf-desc-count" aria-live="polite">0 / 20000</span></label>
            <textarea class="textarea" id="pf-desc" rows="8" data-rich data-rich-max="20000" data-rich-count="pf-desc-count" placeholder="صف هدف المشروع والفئة المستفيدة ونطاق التنفيذ…" aria-describedby="pf-description-err"></textarea>
            <p class="error" id="pf-description-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
          </div>
          <div class="pf-block">
            <div class="pf-block-head"><div><h3>حقائق سريعة</h3><p>أزواج «عنوان / قيمة» تظهر في صفحة المشروع، مثل: النطاق — 4 مخابز مركزية.</p></div><button type="button" class="btn btn-secondary btn-sm" id="pf-add-fact"><span class="material-symbols-outlined" aria-hidden="true">add</span>إضافة حقيقة</button></div>
            <div class="pf-rows" id="pf-facts"></div>
          </div>
          <div class="pf-block">
            <div class="pf-block-head"><div><h3>ماذا يشمل المشروع؟</h3><p>بطاقات بأيقونة وعنوان ونص قصير.</p></div><button type="button" class="btn btn-secondary btn-sm" id="pf-add-comp"><span class="material-symbols-outlined" aria-hidden="true">add</span>إضافة مكوّن</button></div>
            <div class="pf-rows" id="pf-comps"></div>
          </div>
        </div>

        <div role="tabpanel" id="pfp-gallery" aria-labelledby="pft-gallery" hidden>
          <div class="dropzone" id="pf-gal-dz">
            <input type="file" id="pf-gal-input" accept="image/jpeg,image/png,image/webp,image/gif" multiple aria-label="رفع صور إلى معرض المشروع" aria-describedby="pf-gal-hint">
            <span class="dz-ico"><span class="material-symbols-outlined" aria-hidden="true">add_photo_alternate</span></span>
            <strong>اسحب الصور هنا أو <span style="color:var(--accent-text)">تصفّح</span></strong>
            <span class="hint" id="pf-gal-hint">يمكن رفع عدة صور معاً — حتى {{ $opts['maxMb'] }} ميغابايت للصورة — 40 صورة كحد أقصى</span>
          </div>
          <p class="error" id="pf-images-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
          <ul class="pf-gal" id="pf-gal" aria-label="صور معرض المشروع"></ul>
        </div>

        <div role="tabpanel" id="pfp-updates" aria-labelledby="pft-updates" hidden>
          <div class="pf-block-head"><div><h3>التحديثات الزمنية</h3><p>سجلّ تقدّم العمل الذي يظهر في صفحة المشروع، الأحدث أولاً.</p></div><button type="button" class="btn btn-secondary btn-sm" id="pf-add-upd"><span class="material-symbols-outlined" aria-hidden="true">add</span>إضافة تحديث</button></div>
          <p class="error" id="pf-updates-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p>
          <div class="pf-rows" id="pf-upds"></div>
        </div>

        <div role="tabpanel" id="pfp-seo" aria-labelledby="pft-seo" hidden>
          <div class="pf-block">
            <div class="pf-block-head"><div><h3>شارة البطاقة</h3><p>وسم صغير يظهر على بطاقة المشروع، مثل «أولوية قصوى».</p></div></div>
            <div class="field-row">
              <div class="field"><label class="label" for="pf-badge-text"><span>نص الشارة <span class="opt">اختياري</span></span></label><input class="input" id="pf-badge-text" maxlength="60" aria-describedby="pf-badge_text-err"><p class="error" id="pf-badge_text-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
              <div class="field"><label class="label" for="pf-badge-tone">لون الشارة</label><select class="select" id="pf-badge-tone"></select></div>
            </div>
            <div class="field"><label class="label" for="pf-badge-icon">أيقونة الشارة</label><select class="select" id="pf-badge-icon"></select></div>
          </div>
          <div class="pf-block">
            <div class="pf-block-head"><div><h3>محركات البحث</h3><p>اتركها فارغة لاستخدام العنوان والملخص تلقائياً.</p></div></div>
            <div class="field"><label class="label" for="pf-seo-title"><span>عنوان محركات البحث <span class="opt">اختياري</span></span><span class="counter" id="pf-seo-title-count">0 / 255</span></label><input class="input" id="pf-seo-title" maxlength="255" aria-describedby="pf-seo_title-err"><p class="error" id="pf-seo_title-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
            <div class="field"><label class="label" for="pf-seo-desc"><span>الوصف التعريفي <span class="opt">اختياري</span></span><span class="counter" id="pf-seo-desc-count">0 / 320</span></label><textarea class="textarea" id="pf-seo-desc" rows="3" maxlength="320" style="min-height:0" aria-describedby="pf-seo_description-err"></textarea><p class="error" id="pf-seo_description-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>
          </div>
        </div>
      </div>
      <div class="drawer-foot">
        <span class="save-state" id="pf-state" aria-live="polite"></span>
        <button type="button" class="btn btn-secondary" data-close-drawer>إلغاء</button>
        <button type="submit" class="btn btn-primary" id="pf-save"><span class="material-symbols-outlined" aria-hidden="true">save</span>حفظ المشروع</button>
      </div>
    </form>
  </div>

@endsection
@push('constants')
<script>window.__DB_PAGES = { projects: 1 }; window.__PRJ_OPTS = {!! json_encode($opts, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-editor.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-dbkit.js') }}"></script>
<script src="{{ asset('assets/admin/js/admin-projects-db.js') }}"></script>
@endpush
