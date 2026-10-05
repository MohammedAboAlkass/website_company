@extends('layouts.admin')
@section('title', 'الأخبار')
@section('page', 'news')
@section('content')

        <div class="page-head">
          <div><h1 class="page-title">الأخبار</h1><p class="page-sub">أدِر الأخبار المنشورة والمسودات والمواد المجدولة للمركز الإعلامي.</p></div>
          <div class="page-actions">
            <a class="btn btn-primary" href="{{ url('/admin/news-edit') }}"><span class="material-symbols-outlined" aria-hidden="true">add</span>خبر جديد</a>
          </div>
        </div>
        <section class="card" aria-labelledby="t-news">
          <h2 class="sr-only" id="t-news">قائمة الأخبار</h2>
          <div class="tabs" role="tablist" id="news-tabs" aria-label="حالة الخبر" data-shared-panel="true">
            <button type="button" class="tab" role="tab" id="tab-all" data-value="all" aria-selected="true" aria-controls="news-panel">الكل <span class="tab-count" data-tab-count="all"></span></button>
            <button type="button" class="tab" role="tab" id="tab-published" data-value="published" aria-selected="false" aria-controls="news-panel" tabindex="-1">منشور <span class="tab-count" data-tab-count="published"></span></button>
            <button type="button" class="tab" role="tab" id="tab-draft" data-value="draft" aria-selected="false" aria-controls="news-panel" tabindex="-1">مسودة <span class="tab-count" data-tab-count="draft"></span></button>
            <button type="button" class="tab" role="tab" id="tab-scheduled" data-value="scheduled" aria-selected="false" aria-controls="news-panel" tabindex="-1">مجدول <span class="tab-count" data-tab-count="scheduled"></span></button>
          </div>
          <div class="toolbar">
            <label class="input-icon"><span class="sr-only">بحث في الأخبار</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" id="n-search" type="search" placeholder="ابحث بالعنوان أو الوسم…" autocomplete="off"></label>
            <label class="sr-only" for="n-cat">تصفية حسب التصنيف</label><select class="select sm auto" id="n-cat"></select>
          </div>
          <div id="news-panel" role="tabpanel" aria-labelledby="tab-all"><div id="news-body"></div></div>
          <div class="card-foot"><div class="pagination" id="news-pages" style="width:100%"></div></div>
        </section>
      @endsection
@push('constants')
<script>window.__DB_PAGES = { news: 1 }; window.__NEWS_OPTS = {!! json_encode($opts, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
@endpush
@push('scripts')
<script src="{{ asset('assets/admin/js/admin-news-db.js') }}"></script>
@endpush
