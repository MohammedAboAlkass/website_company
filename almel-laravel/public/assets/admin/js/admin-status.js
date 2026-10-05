/* Status pages: 404 / 403 / maintenance / forgot-password. The maintenance page is real: state from the server (window.__MAINT), admins control it via /admin/maintenance; the other pages are design previews. */
(function () {
  'use strict';
  var UI = window.AdminUI || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var toast = UI.toast || function () {};
  var norm = UI.normalize || function (s) { return String(s || '').toLowerCase().trim(); };
  var page = document.body.getAttribute('data-page');
  function readJSON(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function icon(n) { var s = document.createElement('span'); s.className = 'material-symbols-outlined'; s.setAttribute('aria-hidden', 'true'); s.textContent = n; return s; }
  function setBtn(btn, ic, label) { btn.textContent = ''; btn.appendChild(icon(ic)); var t = document.createElement('span'); t.className = 'btn-text'; t.textContent = label; btn.appendChild(t); }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 404 ---------- */
  function notFound() {
    var from = new URLSearchParams(location.search).get('from');
    if (from) { var p = $('#nf-path'); p.appendChild(document.createTextNode(' — ')); var c = document.createElement('code'); c.dir = 'ltr'; c.textContent = from.slice(0, 80); p.appendChild(c); }
    var q = $('#nf-q'), items = $$('#nf-links li'), empty = $('#nf-empty'), count = $('#nf-count');
    function filter() {
      var v = norm(q.value), n = 0;
      items.forEach(function (li) { var show = !v || norm(li.getAttribute('data-kw')).indexOf(v) >= 0; li.hidden = !show; if (show) n++; });
      empty.hidden = n > 0; count.textContent = v ? (n ? n + ' نتائج مطابقة' : 'لا توجد نتائج') : '';
    }
    q.addEventListener('input', filter);
    $('#nf-form').addEventListener('submit', function (e) { e.preventDefault(); var first = items.filter(function (li) { return !li.hidden; })[0]; if (first && q.value.trim()) location.href = $('a', first).getAttribute('href'); });
  }

  /* ---------- 403 ---------- */
  function forbidden() {
    var ROLE = { admin: 'مدير', editor: 'محرر', writer: 'كاتب', viewer: 'مشاهد', field: 'منسق ميداني', finance: 'مراجع مالي' };
    var users = readJSON('almel-admin-users');
    var role = new URLSearchParams(location.search).get('role') || 'editor';
    if (Array.isArray(users) && users[1] && users[1].role && !new URLSearchParams(location.search).get('role')) role = users[1].role;
    $('#fb-role').textContent = (ROLE[role] || 'محرر') + ' (تجريبي)';
    var pg = new URLSearchParams(location.search).get('page'); if (pg) $('#fb-page').textContent = pg.slice(0, 60);
    var btn = $('#req-access'), sent = false;
    btn.addEventListener('click', function () {
      if (sent) { toast('طلبك قيد المراجعة', { text: 'سيصلك إشعار عند موافقة المدير.', tone: 'info', icon: 'hourglass_top' }); return; }
      sent = true; btn.setAttribute('aria-disabled', 'true'); setBtn(btn, 'check_circle', 'تم إرسال الطلب');
      toast('تم إرسال طلب الصلاحية', { text: 'أُبلغ مدير المنصة (تجريبي — لم يُرسل شيء فعلياً).', icon: 'send' });
    });
  }

  /* ---------- maintenance (state comes from the server: window.__MAINT; admins can change it here) ---------- */
  function maintenance() {
    var M = window.__MAINT || {}, DB = window.AdminDB;
    var timer = null;
    function startCountdown(untilIso) {
      var panel = $('#maint-panel'); clearInterval(timer);
      var eta = untilIso ? Date.parse(untilIso) : NaN;
      if (isNaN(eta)) { if (panel) panel.hidden = true; return; }
      if (panel) panel.hidden = false;
      var bar = $('.maint-progress'); if (bar) bar.hidden = true;
      try { $('#cd-eta').textContent = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(eta)); } catch (e) { $('#cd-eta').textContent = new Date(eta).toLocaleString(); }
      var pad = function (n) { return String(n).padStart(2, '0'); }, lastMin = -1;
      function tick() {
        var left = Math.max(0, eta - Date.now()), sec = Math.floor(left / 1000);
        $('#cd-h').textContent = pad(Math.floor(sec / 3600)); $('#cd-m').textContent = pad(Math.floor(sec % 3600 / 60)); $('#cd-s').textContent = pad(sec % 60);
        var min = Math.ceil(sec / 60);
        if (min !== lastMin && min % 15 === 0) { $('#cd-live').textContent = 'متبقٍ حوالي ' + min + ' دقيقة'; } lastMin = min;
        if (!left) { clearInterval(timer); var cd = $('#countdown'); if (cd) { var p = document.createElement('p'); p.className = 'maint-done'; p.textContent = 'انتهت الصيانة المتوقعة — جرّب تحديث الصفحة.'; cd.replaceWith(p); } }
      }
      tick(); timer = setInterval(tick, 1000);
    }
    var msgEl = $('#maint-msg');
    if (M.message && msgEl) msgEl.textContent = String(M.message).slice(0, 1000);
    if (M.email && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(M.email)) { var a = $('#maint-mail'); if (a) { a.textContent = M.email; a.href = 'mailto:' + M.email; } }
    startCountdown(M.until);
    var STATE = { off: 'متوقف — الموقع العام يعمل بشكل طبيعي.', active: 'مفعّل الآن — الزوار يرون صفحة الصيانة (503).', scheduled: 'مجدول — لم يبدأ بعد، الموقع يعمل حالياً.', expired: 'انتهت المدة المحددة — الموقع يعمل بشكل طبيعي.' };
    $('#maint-retry').addEventListener('click', function () {
      if (M.status === 'active') toast('لا تزال الصيانة جارية', { text: M.until ? 'نعود حوالي ' + $('#cd-eta').textContent + '.' : 'سنعود قريباً.', tone: 'info', icon: 'construction' });
      else toast('الصيانة غير مفعّلة حالياً', { text: STATE[M.status] || '', tone: 'info', icon: 'check_circle' });
    });

    var form = $('#ma-form');
    if (!form || !DB) return;
    var f = { enabled: $('#ma-enabled'), message: $('#ma-message'), ips: $('#ma-ips'), from: $('#ma-from'), until: $('#ma-until') };
    function fill(d) {
      f.enabled.checked = !!d.enabled; f.message.value = d.message || ''; f.ips.value = d.ips || ''; f.from.value = d.from || ''; f.until.value = d.until || '';
      $('#ma-myip').textContent = d.my_ip || '';
      $('#ma-state').textContent = 'الحالة الحالية: ' + (STATE[d.status] || '');
      M.status = d.status;
    }
    function err(k, msg) { var e = $('#ma-' + k + '-err'); if (!e) return; e.hidden = !msg; e.textContent = msg || ''; }
    DB.api('GET', '/admin/maintenance/state').then(function (r) { fill(r.data); }).catch(function (e) { DB.fail(e, 'تعذّر تحميل حالة الصيانة'); });
    $('#ma-addip').addEventListener('click', function () {
      var ip = $('#ma-myip').textContent.trim(); if (!ip) return;
      var cur = f.ips.value.split(/[\s,;]+/).filter(Boolean);
      if (cur.indexOf(ip) < 0) cur.push(ip);
      f.ips.value = cur.join('\n');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ['message', 'ips', 'from', 'until'].forEach(function (k) { err(k, ''); });
      var btn = $('#ma-save'); btn.setAttribute('aria-disabled', 'true');
      DB.api('PUT', '/admin/maintenance', { enabled: f.enabled.checked, message: f.message.value, ips: f.ips.value, from: f.from.value, until: f.until.value }).then(function (r) {
        btn.removeAttribute('aria-disabled');
        fill(r.data); M.until = r.data.until ? new Date(r.data.until).toISOString() : null; M.message = r.data.message;
        if (msgEl) msgEl.textContent = r.data.message;
        startCountdown(M.until);
        toast(r.message || 'تم الحفظ', { icon: 'task_alt', tone: r.data.enabled ? 'info' : 'success' });
      }).catch(function (x) {
        btn.removeAttribute('aria-disabled');
        var errs = (x && x.errors) || {}; Object.keys(errs).forEach(function (k) { err(k, errs[k][0]); });
        DB.fail(x, 'تعذّر الحفظ');
      });
    });
  }

  /* ---------- forgot password ---------- */
  function forgot() {
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, step = 1, email = '';
    var bars = $$('.fp-steps span');
    function err(id, msg) { var e = $('#' + id + '-err'), i = $('#' + id); e.hidden = !msg; $('span:last-child', e).textContent = msg || ''; if (i) i.setAttribute('aria-invalid', String(!!msg)); return !msg; }
    function go(n) {
      step = n;
      $$('.fp-step').forEach(function (s) { s.hidden = +s.getAttribute('data-step') !== n; });
      bars.forEach(function (b, i) { b.classList.toggle('is-done', i < n); });
      $('#fp-step-label').textContent = n < 4 ? 'الخطوة ' + n + ' من 4' : 'اكتمل';
      $('#fp-to-login').hidden = n === 4;
      var hd = $('#fp-' + n + '-t'); if (hd) hd.focus();
      if (n === 2) { setTimeout(function () { otp[0].focus(); }, 30); startResend(); }
      if (n === 3) setTimeout(function () { $('#fp-pass').focus(); }, 30);
    }
    function busy(btn, label, done) {
      btn.classList.add('is-loading'); btn.setAttribute('aria-disabled', 'true');
      btn.textContent = ''; var sp = document.createElement('span'); sp.className = 'spinner'; sp.setAttribute('aria-hidden', 'true'); btn.appendChild(sp);
      var t = document.createElement('span'); t.className = 'btn-text'; t.textContent = label; btn.appendChild(t);
      setTimeout(done, reduce ? 50 : 700);
    }
    function unbusy(btn, ic, label) { btn.classList.remove('is-loading'); btn.removeAttribute('aria-disabled'); setBtn(btn, ic, label); }

    // step 1
    var em = $('#fp-email');
    try { var saved = localStorage.getItem('almel-admin-email'); if (saved) em.value = saved; } catch (e) { /* ignore */ }
    em.addEventListener('input', function () { if (em.getAttribute('aria-invalid') === 'true') err('fp-email', EMAIL.test(em.value.trim()) ? '' : 'أدخل بريداً إلكترونياً صالحاً.'); });
    $('#fp-email-form').addEventListener('submit', function (e) {
      e.preventDefault(); var btn = $('#fp-send'); if (btn.getAttribute('aria-disabled')) return;
      var v = em.value.trim();
      if (!err('fp-email', !v ? 'البريد الإلكتروني مطلوب.' : EMAIL.test(v) ? '' : 'أدخل بريداً إلكترونياً صالحاً، مثل name@shamal-society.org')) { em.focus(); return; }
      email = v; busy(btn, 'جارٍ الإرسال…', function () { unbusy(btn, 'send', 'إرسال رمز التحقق'); $('#fp-email-out').textContent = email; clearOtp(); go(2); toast('أُرسل رمز التحقق', { text: 'تجريبي: لم يُرسل بريد فعلياً.', icon: 'mail' }); });
    });

    // step 2 — OTP
    var otp = $$('#fp-otp input'), group = $('#fp-otp');
    function code() { return otp.map(function (i) { return i.value; }).join(''); }
    function clearOtp() { otp.forEach(function (i) { i.value = ''; }); group.classList.remove('is-invalid'); err('fp-otp', ''); }
    function fill(from, digits) { for (var k = 0; k < digits.length && from + k < otp.length; k++) otp[from + k].value = digits[k]; var next = Math.min(from + digits.length, otp.length - 1); otp[next].focus(); otp[next].select(); if (code().length === 6) setTimeout(function () { $('#fp-otp-form').requestSubmit ? $('#fp-otp-form').requestSubmit() : $('#fp-verify').click(); }, 120); }
    otp.forEach(function (inp, i) {
      inp.addEventListener('input', function () {
        var d = inp.value.replace(/\D/g, '');
        if (group.classList.contains('is-invalid')) { group.classList.remove('is-invalid'); err('fp-otp', ''); }
        if (!d) { inp.value = ''; return; }
        if (d.length > 1) { inp.value = ''; fill(i, d.slice(0, 6 - i)); return; }
        inp.value = d; if (i < otp.length - 1) { otp[i + 1].focus(); otp[i + 1].select(); } else if (code().length === 6) fill(i, d);
      });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !inp.value && i > 0) { e.preventDefault(); otp[i - 1].value = ''; otp[i - 1].focus(); }
        else if (e.key === 'ArrowLeft' && i < otp.length - 1) { e.preventDefault(); otp[i + 1].focus(); } // group is LTR
        else if (e.key === 'ArrowRight' && i > 0) { e.preventDefault(); otp[i - 1].focus(); }
      });
      inp.addEventListener('focus', function () { inp.select(); });
      inp.addEventListener('paste', function (e) {
        var t = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\D/g, '');
        e.preventDefault(); if (!t) return; fill(t.length >= 6 ? 0 : i, t.slice(0, 6));
      });
    });
    var resendT, left = 0;
    function startResend() {
      clearInterval(resendT); left = 30; var b = $('#fp-resend'), tm = $('#fp-timer'); b.disabled = true;
      var upd = function () { tm.textContent = left > 0 ? 'يمكنك طلب رمز جديد بعد ' + left + ' ثانية' : 'لم يصلك الرمز؟'; b.disabled = left > 0; };
      upd(); resendT = setInterval(function () { left--; upd(); if (left <= 0) clearInterval(resendT); }, 1000);
    }
    $('#fp-resend').addEventListener('click', function () { clearOtp(); otp[0].focus(); startResend(); toast('أُرسل رمز جديد', { text: email + ' (تجريبي)', icon: 'mail' }); });
    var verifying = false;
    $('#fp-otp-form').addEventListener('submit', function (e) {
      e.preventDefault(); if (verifying) return;
      var c = code();
      if (c.length < 6) { group.classList.add('is-invalid'); err('fp-otp', 'أدخل الأرقام الستة كاملة.'); otp[Math.min(c.length, 5)].focus(); return; }
      verifying = true; var btn = $('#fp-verify');
      busy(btn, 'جارٍ التحقق…', function () {
        verifying = false; unbusy(btn, 'verified', 'تحقق من الرمز');
        if (c === '000000') { group.classList.add('is-invalid'); err('fp-otp', 'الرمز غير صحيح. تحقق من بريدك وحاول مجدداً.'); otp.forEach(function (i) { i.value = ''; }); otp[0].focus(); return; }
        clearInterval(resendT); go(3);
      });
    });
    $$('[data-goto]').forEach(function (b) { b.addEventListener('click', function () { clearInterval(resendT); go(+b.getAttribute('data-goto')); setTimeout(function () { em.focus(); em.select(); }, 30); }); });

    // step 3 — new password
    var p1 = $('#fp-pass'), p2 = $('#fp-pass2'), meter = $('#fp-pass-meter');
    var LABELS = ['—', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'];
    function rules(v) { return { len: v.length >= 8, 'case': /[a-z]/.test(v) && /[A-Z]/.test(v), num: /\d/.test(v), sym: /[^A-Za-z0-9]/.test(v) }; }
    function score(v) { if (!v) return 0; var r = rules(v), n = (r.len ? 1 : 0) + (r['case'] ? 1 : 0) + (r.num ? 1 : 0) + (r.sym ? 1 : 0); if (!r.len) n = Math.min(n, 1); if (v.length >= 12 && n >= 3) n = 4; return Math.max(1, n); }
    function upd() {
      var v = p1.value, r = rules(v), s = score(v);
      meter.setAttribute('data-score', String(s)); $('#fp-strength').textContent = 'القوة: ' + LABELS[s];
      $$('#fp-rules li').forEach(function (li) { var ok = r[li.getAttribute('data-rule')]; li.classList.toggle('is-ok', ok); $('.material-symbols-outlined', li).textContent = ok ? 'check_circle' : 'radio_button_unchecked'; });
      if (p1.getAttribute('aria-invalid') === 'true') check1(); if (p2.getAttribute('aria-invalid') === 'true') check2();
    }
    function check1() { var v = p1.value; return err('fp-pass', !v ? 'اكتب كلمة المرور الجديدة.' : !rules(v).len ? 'كلمة المرور قصيرة: 8 أحرف على الأقل.' : score(v) < 3 ? 'كلمة المرور ضعيفة: أضف أحرفاً كبيرة وأرقاماً أو رموزاً.' : ''); }
    function check2() { return err('fp-pass2', !p2.value ? 'أعد كتابة كلمة المرور للتأكيد.' : p2.value !== p1.value ? 'كلمتا المرور غير متطابقتين.' : ''); }
    p1.addEventListener('input', upd); p2.addEventListener('input', function () { if (p2.getAttribute('aria-invalid') === 'true') check2(); });
    upd();
    $$('[data-toggle]').forEach(function (b) { b.addEventListener('click', function () { var i = $('#' + b.getAttribute('data-toggle')), show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', String(show)); $('.material-symbols-outlined', b).textContent = show ? 'visibility_off' : 'visibility'; }); });
    $('#fp-pass-form').addEventListener('submit', function (e) {
      e.preventDefault(); var btn = $('#fp-save'); if (btn.getAttribute('aria-disabled')) return;
      var a = check1(), b = check2(); if (!a) { p1.focus(); return; } if (!b) { p2.focus(); return; }
      busy(btn, 'جارٍ الحفظ…', function () { unbusy(btn, 'check', 'حفظ كلمة المرور'); p1.value = p2.value = ''; go(4); toast('تم تغيير كلمة المرور', { text: 'تجريبي: لم تُحفظ أي بيانات.', icon: 'task_alt' }); });
    });
    window.__fp = { go: go };
  }

  var run = { 'status-404': notFound, 'status-403': forbidden, 'status-maintenance': maintenance, forgot: forgot }[page];
  if (run) run();
})();
