/* «حسابي» — profile photo: pick → preview (nothing is saved yet) → save / cancel, and remove (AdminUI.confirm).
   The server validates again (type, 2 MB, real content) and re-encodes the picture as a 256×256 square. No native dialogs. */
(function () {
  'use strict';
  var U = window.AdminUI, DB = window.AdminDB;
  var form = document.getElementById('pf-avatar-form');
  if (!U || !DB || !form) return;
  var input = document.getElementById('pf-avatar-input'), pick = document.getElementById('pf-pick'), rm = document.getElementById('pf-remove');
  var pending = document.getElementById('pf-pending'), save = document.getElementById('pf-save'), cancel = document.getElementById('pf-cancel');
  var av = document.getElementById('pf-avatar'), hint = document.getElementById('pf-hint'), err = document.getElementById('pf-error'), errText = document.getElementById('pf-error-text');
  var HINT = hint.textContent, MAX = 2 * 1024 * 1024, OK = { 'image/jpeg': 1, 'image/png': 1, 'image/webp': 1 }, EXT = /\.(jpe?g|png|webp)$/i;
  var objUrl = null, before = null, busy = false;

  function showError(m) { if (!m) { err.hidden = true; errText.textContent = ''; return; } errText.textContent = m; err.hidden = false; }
  function mb(n) { return (n / 1048576).toFixed(1).replace('.0', ''); }
  function sz(n) { return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' ك.ب' : mb(n) + ' م.ب'; }
  function clearPreview() {
    if (objUrl) { URL.revokeObjectURL(objUrl); objUrl = null; }
    input.value = ''; pending.hidden = true; av.classList.remove('is-preview'); hint.textContent = HINT;
    if (before !== null) { av.innerHTML = before; before = null; }
  }
  function setBusy(b) { busy = b; save.disabled = b; cancel.disabled = b; pick.disabled = b; if (b) rm.disabled = true; else rm.disabled = !hasAvatar(); }
  function hasAvatar() { return !!(window.__ADMIN_USER && window.__ADMIN_USER.avatar); }

  pick.addEventListener('click', function () { if (!busy) input.click(); });
  input.addEventListener('change', function () {
    var f = input.files && input.files[0];
    showError('');
    if (!f) { return; }
    if (!(OK[f.type] || (!f.type && EXT.test(f.name))) || !EXT.test(f.name)) { input.value = ''; showError('صيغة الصورة غير مدعومة. المسموح: JPG وPNG وWEBP فقط.'); return; }
    if (f.size > MAX) { input.value = ''; showError('حجم الصورة (' + mb(f.size) + ' ميغابايت) أكبر من الحد المسموح: 2 ميغابايت.'); return; }
    if (f.size <= 0) { input.value = ''; showError('الملف فارغ.'); return; }
    if (objUrl) URL.revokeObjectURL(objUrl);
    objUrl = URL.createObjectURL(f);
    var probe = new Image();
    probe.onload = function () {
      if (before === null) before = av.innerHTML;
      av.innerHTML = ''; var im = document.createElement('img'); im.src = objUrl; im.alt = ''; av.appendChild(im);
      av.classList.add('is-preview'); pending.hidden = false;
      hint.textContent = 'معاينة: ' + f.name + ' (' + sz(f.size) + ') — لم تُحفظ بعد.';
    };
    probe.onerror = function () { URL.revokeObjectURL(objUrl); objUrl = null; input.value = ''; showError('الملف ليس صورة صالحة.'); };
    probe.src = objUrl;
  });
  cancel.addEventListener('click', function () { if (!busy) { showError(''); clearPreview(); } });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var f = input.files && input.files[0];
    if (!f) { showError('اختر صورة أولاً.'); return; }
    showError(''); setBusy(true);
    var fd = new FormData(); fd.append('avatar', f);
    DB.api('POST', form.getAttribute('action'), fd).then(function (r) {
      var url = r && r.data && r.data.url;
      if (objUrl) { URL.revokeObjectURL(objUrl); objUrl = null; }
      before = null; input.value = ''; pending.hidden = true; av.classList.remove('is-preview'); hint.textContent = HINT;
      U.setAvatar(url);
      setBusy(false);
      U.toast('تم حفظ صورتك الشخصية', { text: 'ظهرت الآن في القائمة الجانبية وقائمة الحساب.', icon: 'account_circle', tone: 'success' });
    }, function (e2) {
      setBusy(false);
      showError(DB.firstError(e2));
    });
  });

  rm.addEventListener('click', function () {
    if (busy || rm.disabled) return;
    U.confirm({ title: 'إزالة الصورة الشخصية؟', text: 'ستُحذف صورتك ويعود عرض الحرف الأول من اسمك بدلاً منها.', icon: 'delete', tone: 'danger', confirmLabel: 'نعم، أزل الصورة', cancelLabel: 'إلغاء' }).then(function (ok) {
      if (!ok) return;
      showError(''); setBusy(true);
      DB.api('DELETE', form.getAttribute('data-delete-url')).then(function () {
        clearPreview(); U.setAvatar(null); setBusy(false);
        U.toast('أُزيلت صورتك الشخصية', { icon: 'account_circle', tone: 'info' });
      }, function (e2) { setBusy(false); showError(DB.firstError(e2)); });
    });
  });
  setBusy(false);
})();
