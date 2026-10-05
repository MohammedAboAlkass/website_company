/* Small helpers shared by the database-backed admin pages (projects, stories, field activities):
   JSON fetch with Arabic error messages, image upload, relative dates.  Loaded after admin.js. */
(function () {
  'use strict';
  var U = window.AdminUI;
  if (!U) return;

  function csrf() { var m = document.querySelector('meta[name="csrf-token"]'); return m ? m.getAttribute('content') : ''; }

  function api(method, url, body) {
    var opt = { method: method, credentials: 'same-origin', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrf() } };
    if (body instanceof FormData) opt.body = body;
    else if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    return fetch(url, opt).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
        if (r.ok) return j || {};
        var err = { status: r.status, message: (j && j.message) || '', errors: (j && j.errors) || {} };
        if (r.status === 419) err.message = 'انتهت الجلسة. أعد تحميل الصفحة ثم حاول مجدداً.';
        else if (r.status === 401) { err.message = 'انتهت جلسة الدخول.'; setTimeout(function () { location.href = '/admin/login'; }, 800); }
        else if (r.status === 403) err.message = err.message && /[\u0600-\u06FF]/.test(err.message) ? err.message : 'ليست لديك صلاحية لهذا الإجراء.';
        else if (r.status === 404) err.message = 'العنصر غير موجود (ربما حُذف).';
        else if (r.status === 413) err.message = 'حجم الملف أكبر من المسموح.';
        else if (r.status >= 500) err.message = 'تعذّر الاتصال بالخادم. حاول مرة أخرى.';
        throw err;
      });
    }, function () { throw { status: 0, message: 'تعذّر الاتصال بالخادم. تحقق من الاتصال.', errors: {} }; });
  }

  function firstError(e) {
    if (e && e.errors) { var k = Object.keys(e.errors); if (k.length && e.errors[k[0]] && e.errors[k[0]][0]) return e.errors[k[0]][0]; }
    return (e && e.message) || 'حدث خطأ غير متوقع.';
  }
  function fail(e, title) { U.toast(title || 'تعذّر تنفيذ العملية', { text: firstError(e), tone: 'danger', icon: 'error' }); }

  /* Uploads one image; resolves {id,url,name}. Checks type/size on the client first (the server checks again). */
  function upload(file, url, maxMb) {
    if (!file) return Promise.reject({ message: 'لم يتم اختيار ملف.' });
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return Promise.reject({ message: 'الصيغ المسموحة: JPG وPNG وWebP وGIF.', errors: {} });
    if (maxMb && file.size > maxMb * 1048576) return Promise.reject({ message: 'حجم الصورة يجب ألا يتجاوز ' + maxMb + ' ميغابايت.', errors: {} });
    var fd = new FormData(); fd.append('file', file);
    return api('POST', url, fd).then(function (r) { return r.data; });
  }

  function minutesAgo(iso) { var t = Date.parse(iso || ''); return isNaN(t) ? null : Math.max(0, Math.round((Date.now() - t) / 60000)); }
  function agoLabel(iso) { var m = minutesAgo(iso); return m === null ? '—' : (m < 1 ? 'الآن' : U.ago(m)); }

  window.AdminDB = { api: api, firstError: firstError, fail: fail, upload: upload, agoLabel: agoLabel, csrf: csrf };
})();
