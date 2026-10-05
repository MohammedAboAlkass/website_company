/* «الأدوار والصلاحيات» — two-pane roles manager (list + detail with permission matrix).
   Data: window.__ROLES_BOOT (RoleController::payload). API: /admin/roles (JSON). Server enforces every rule; this UI mirrors it. */
(function () {
  'use strict';
  var UI = window.AdminUI, B = window.__ROLES_BOOT;
  var root = document.getElementById('rl');
  if (!UI || !B || !root) return;

  /* ---------- helpers ---------- */
  var esc = UI.esc, icon = UI.icon;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function csrf() { var m = document.querySelector('meta[name="csrf-token"]'); return m ? m.getAttribute('content') : ''; }
  function api(method, url, body) {
    var opt = { method: method, credentials: 'same-origin', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrf() } };
    if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    return fetch(url, opt).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
        if (r.status === 401) { location.href = '/admin/login'; throw new Error('انتهت الجلسة'); }
        if (!r.ok) { var e2 = new Error((j && j.message) || (r.status === 403 ? 'ليس لديك صلاحية لهذا الإجراء.' : 'تعذّر تنفيذ الطلب (' + r.status + ').')); e2.status = r.status; throw e2; }
        return j || {};
      });
    }, function () { throw new Error('تعذّر الاتصال بالخادم. تحقق من الإنترنت وأعد المحاولة.'); });
  }
  function toastErr(msg) { UI.toast(msg, { tone: 'danger', icon: 'error', duration: 6000 }); }
  function join(list) {
    if (list.length <= 1) return list.join('');
    return list.slice(0, -1).join('، ') + ' و' + list[list.length - 1];
  }
  var BASE = (B.urls && B.urls.base) || '/admin/roles';

  /* ---------- catalog ---------- */
  var ACTIONS = Object.keys(B.actions);            // view, create, edit, delete, publish, export, manage
  var ALABEL = B.actions;
  var MODS = {}, ALLKEYS = [];
  B.catalog.forEach(function (g) { g.modules.forEach(function (m) { MODS[m.key] = m; m.group = g.key; m.actions.forEach(function (a) { ALLKEYS.push(m.key + '.' + a); }); }); });
  var TOTAL = ALLKEYS.length;

  /* ---------- state ---------- */
  var roles = B.roles.slice();
  var users = B.users;                              // null when the viewer may not list users
  var ME = B.me;
  var S = { id: null, tab: 'perms', q: '', mq: '', collapsed: {}, draft: null, base: null, busy: false };
  var listEl = $('#rl-items'), detail = $('#rl-detail'), countEl = $('#rl-count');

  function role(id) { return roles.filter(function (r) { return r.id === id; })[0]; }
  function cur() { return role(S.id); }
  function setOf(arr) { var o = {}; arr.forEach(function (k) { o[k] = 1; }); return o; }
  function size(set) { return Object.keys(set).length; }
  function snap(r) { return { name: r.name, desc: r.description || '', active: !!r.active, perms: setOf(r.permissions) }; }
  function sameSet(a, b) { var ka = Object.keys(a), kb = Object.keys(b); if (ka.length !== kb.length) return false; return ka.every(function (k) { return b[k]; }); }
  function isDirty() { var d = S.draft, b = S.base; return !!d && (d.name !== b.name || d.desc !== b.desc || d.active !== b.active || !sameSet(d.perms, b.perms)); }
  function readOnlyInfo(r) {
    if (r.locked) return 'دور مدير النظام محمي: يملك كل الصلاحيات دائماً ولا يمكن تعديله أو تعطيله أو حذفه. هذا يضمن ألا يُقفل النظام على أحد.';
    if (!ME.can.edit) return 'ليس لديك صلاحية تعديل الأدوار (roles.edit)، فالعرض للاطّلاع فقط.';
    if (!ME.super && r.key === ME.role) return 'لا يمكنك تعديل صلاحيات دورك أنت. اطلب ذلك من مدير النظام.';
    if (!ME.super && r.permissions.some(function (k) { return ME.perms.indexOf(k) < 0; })) return 'هذا الدور يملك صلاحيات لا تملكها أنت، فلا يمكنك تعديله.';
    return '';
  }

  /* ---------- select / leave guard ---------- */
  function select(id, tab) {
    var r = role(id); if (!r) return;
    S.id = id; S.tab = tab || S.tab || 'perms'; S.base = snap(r); S.draft = snap(r); S.mq = '';
    try { history.replaceState(null, '', '#' + r.key); } catch (e) { /* ignore */ }
    renderList(); renderDetail();
  }
  function guard(then) {
    if (!isDirty()) { then(); return; }
    UI.modal({ title: 'تجاهل التغييرات غير المحفوظة؟', text: 'أجريت تعديلات على هذا الدور ولم تحفظها بعد. إن تابعت ستُفقد.', icon: 'warning', tone: 'warn', confirmText: 'تجاهل التغييرات', cancelText: 'البقاء هنا' })
      .then(function (ok) { if (ok) then(); });
  }
  window.addEventListener('beforeunload', function (e) { if (isDirty()) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- list pane ---------- */
  function badges(r) {
    var h = '';
    if (r.locked) h += '<span class="pill pill-solid no-dot rl-b">' + icon('lock') + 'محمي</span>';
    else if (r.system) h += '<span class="pill pill-info no-dot rl-b">نظام</span>';
    if (!r.active) h += '<span class="pill pill-neutral no-dot rl-b">معطّل</span>';
    return h;
  }
  function renderList() {
    var q = UI.normalize(($('#rl-q').value || '').trim());
    var list = roles.filter(function (r) { return !q || UI.normalize(r.name + ' ' + r.key + ' ' + (r.description || '')).indexOf(q) >= 0; });
    countEl.textContent = list.length === roles.length ? roles.length + ' أدوار' : list.length + ' من ' + roles.length + ' أدوار';
    if (!list.length) { listEl.innerHTML = '<li class="rl-empty"><span class="material-symbols-outlined" aria-hidden="true">search_off</span><p>لا توجد أدوار مطابقة.</p></li>'; return; }
    listEl.innerHTML = list.map(function (r) {
      var sel = r.id === S.id;
      var n = sel && S.draft ? size(S.draft.perms) : (r.locked ? TOTAL : r.permissions.length);
      return '<li><button type="button" class="rl-item' + (sel ? ' is-sel' : '') + (r.active ? '' : ' is-off') + '" role="option" aria-selected="' + sel + '" data-id="' + r.id + '">' +
        '<span class="rl-ico">' + icon(r.locked ? 'shield_lock' : 'shield_person') + '</span>' +
        '<span class="rl-it"><strong>' + esc(r.name) + '</strong><small class="ltr">' + esc(r.key) + '</small>' +
        '<span class="rl-meta">' + icon('group') + r.users + ' مستخدم<i>·</i>' + n + ' من ' + TOTAL + '</span></span>' +
        '<span class="rl-bs">' + badges(r) + '</span></button></li>';
    }).join('');
  }
  $('#rl-q').addEventListener('input', renderList);
  listEl.addEventListener('click', function (e) {
    var b = e.target.closest('.rl-item'); if (!b) return;
    var id = +b.getAttribute('data-id'); if (id === S.id) return;
    guard(function () { select(id, 'perms'); });
  });

  /* ---------- permission logic ---------- */
  function setKey(k, on) {
    var p = k.split('.'), m = MODS[p[0]], d = S.draft.perms;
    if (!m) return;
    if (on) { d[k] = 1; if (p[1] !== 'view' && m.actions.indexOf('view') >= 0) d[p[0] + '.view'] = 1; }
    else { delete d[k]; if (p[1] === 'view') m.actions.forEach(function (a) { delete d[p[0] + '.' + a]; }); }
  }
  function keysOf(scope) {
    // scope: {g}|{m}|{m,a}|{g,a}|{all}
    var out = [];
    B.catalog.forEach(function (g) {
      if (scope.g && g.key !== scope.g) return;
      g.modules.forEach(function (m) {
        if (scope.m && m.key !== scope.m) return;
        if (scope.visible && !scope.visible[m.key]) return;
        m.actions.forEach(function (a) { if (!scope.a || scope.a === a) out.push(m.key + '.' + a); });
      });
    });
    return out;
  }
  function bulk(keys, on) { if (on) { keys.filter(function (k) { return k.split('.')[1] === 'view'; }).forEach(function (k) { setKey(k, true); }); keys.forEach(function (k) { setKey(k, true); }); } else { keys.slice().reverse().forEach(function (k) { setKey(k, false); }); } }
  function tri(keys) { var n = 0; keys.forEach(function (k) { if (S.draft.perms[k]) n++; }); return n === 0 ? 0 : (n === keys.length ? 2 : 1); }

  function visibleMods() {
    var q = UI.normalize(S.mq.trim()), v = {};
    Object.keys(MODS).forEach(function (k) { if (!q || UI.normalize(MODS[k].label + ' ' + k).indexOf(q) >= 0) v[k] = 1; });
    return v;
  }

  /* ---------- plain Arabic summary ---------- */
  function summary(perms) {
    var n = size(perms);
    if (n === 0) return [{ i: 'block', t: 'لا يملك هذا الدور أي صلاحية، ولا يستطيع استخدام لوحة التحكم.' }];
    if (n === TOTAL) return [{ i: 'verified_user', t: 'صلاحيات كاملة على كل أقسام لوحة التحكم، بما فيها المستخدمون والأدوار والإعدادات.' }];
    var by = { view: [], write: [], delete: [], publish: [], export: [], manage: [], none: [] };
    Object.keys(MODS).forEach(function (k) {
      var m = MODS[k], has = function (a) { return perms[k + '.' + a]; }, any = m.actions.some(has);
      if (!any) { by.none.push(m.label); return; }
      if (has('create') || has('edit')) by.write.push(m.label + (has('create') && has('edit') ? '' : (has('create') ? ' (إضافة فقط)' : ' (تعديل فقط)')));
      else if (has('view')) by.view.push(m.label);
      if (has('delete')) by.delete.push(m.label);
      if (has('publish')) by.publish.push(m.label);
      if (has('export')) by.export.push(m.label);
      if (has('manage')) by.manage.push(m.label);
    });
    var out = [];
    if (by.view.length) out.push({ i: 'visibility', t: 'يستطيع الاطّلاع فقط على: ' + join(by.view) + '.' });
    if (by.write.length) out.push({ i: 'edit_note', t: 'يستطيع الاطّلاع والإضافة والتعديل في: ' + join(by.write) + '.' });
    if (by.publish.length) out.push({ i: 'publish', t: 'يستطيع نشر: ' + join(by.publish) + '.' });
    if (by.delete.length) out.push({ i: 'delete', t: 'يستطيع الحذف في: ' + join(by.delete) + '.' });
    if (by.export.length) out.push({ i: 'download', t: 'يستطيع تصدير: ' + join(by.export) + '.' });
    if (by.manage.length) out.push({ i: 'tune', t: 'يستطيع إدارة: ' + join(by.manage) + '.' });
    if (!by.delete.length) out.push({ i: 'shield', t: 'لا يستطيع حذف أي شيء.' });
    if (by.none.length) out.push({ i: 'lock', t: 'لا يصل إلى: ' + join(by.none.slice(0, 7)) + (by.none.length > 7 ? ' وغيرها (' + by.none.length + ' قسماً)' : '') + '.' });
    return out;
  }

  /* ---------- detail pane ---------- */
  function renderDetail() {
    var r = cur();
    if (!r) { detail.innerHTML = '<div class="rl-loading"><span class="material-symbols-outlined" aria-hidden="true">shield_person</span><p>اختر دوراً من القائمة لعرض صلاحياته.</p></div>'; return; }
    var ro = readOnlyInfo(r), d = S.draft;
    var nPerm = r.locked ? TOTAL : size(d.perms);
    var pct = Math.round(nPerm / TOTAL * 100);
    var canDelete = ME.can.delete && !r.system && !r.locked;
    detail.innerHTML =
      '<header class="rl-dhead"><div class="rl-dtitle"><span class="rl-ico lg">' + icon(r.locked ? 'shield_lock' : 'shield_person') + '</span>' +
      '<div><h2>' + esc(d.name) + '</h2><p><span class="ltr">' + esc(r.key) + '</span>' + badges(r) + '</p></div></div>' +
      '<div class="rl-dact">' +
      (ME.can.create ? '<button type="button" class="btn btn-secondary btn-sm" id="rl-dup">' + icon('content_copy') + 'نسخ الدور</button>' : '') +
      (canDelete ? '<button type="button" class="btn btn-ghost btn-sm rl-del" id="rl-del">' + icon('delete') + 'حذف</button>' : '') +
      '</div></header>' +
      '<div class="rl-meter"><div class="rl-meter-t"><strong>' + nPerm + ' من ' + TOTAL + '</strong><span>صلاحية ممنوحة</span>' + (r.locked ? '<span class="pill pill-solid no-dot">كاملة</span>' : '') + '</div>' +
      '<div class="rl-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + TOTAL + '" aria-valuenow="' + nPerm + '"><i style="width:' + pct + '%"></i></div></div>' +
      '<div class="tabs rl-tabs" role="tablist" aria-label="أقسام الدور">' +
      tabBtn('perms', 'الصلاحيات', 'rule') + tabBtn('users', 'المستخدمون', 'group', r.users) + tabBtn('info', 'معلومات الدور', 'info') + '</div>' +
      '<div class="rl-panel" id="rl-panel" role="tabpanel"></div>' +
      '<div class="rl-savebar" id="rl-savebar" hidden></div>';
    renderPanel(ro);
    syncBar();
  }
  function tabBtn(id, label, ic, count) {
    return '<button type="button" class="tab" role="tab" data-tab="' + id + '" aria-selected="' + (S.tab === id) + '">' + icon(ic) + label + (count != null ? '<span class="tab-count">' + count + '</span>' : '') + '</button>';
  }
  function renderPanel(ro) {
    var r = cur(); if (ro === undefined) ro = readOnlyInfo(r);
    var p = $('#rl-panel');
    if (S.tab === 'perms') p.innerHTML = permsHTML(r, ro), refresh();
    else if (S.tab === 'users') usersPanel(r, p);
    else infoPanel(r, p, ro);
  }

  /* ---- permissions tab ---- */
  function permsHTML(r, ro) {
    var h = '';
    if (ro) h += '<div class="rl-note' + (r.locked ? ' is-lock' : '') + '" role="note">' + icon(r.locked ? 'lock' : 'info') + '<p>' + esc(ro) + '</p></div>';
    h += '<section class="rl-preview" aria-labelledby="rl-pv-t"><h3 id="rl-pv-t">' + icon('preview') + 'ما الذي يمكن لهذا الدور فعله</h3><ul id="rl-pv"></ul></section>';
    h += '<div class="rl-tools"><label class="input-icon rl-mq"><span class="sr-only">بحث في الأقسام</span>' + icon('search') + '<input class="input sm" id="rl-mq" type="search" placeholder="ابحث عن قسم…" autocomplete="off" value="' + esc(S.mq) + '"></label>' +
      '<span class="rl-count" id="rl-cnt" aria-live="polite"></span><span class="grow"></span>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="rl-fold">' + icon('unfold_less') + 'طيّ الأقسام</button>' +
      (ro ? '' : '<button type="button" class="btn btn-secondary btn-sm" id="rl-none">' + icon('deselect') + 'إلغاء الكل</button><button type="button" class="btn btn-secondary btn-sm" id="rl-all">' + icon('select_all') + 'تفعيل الكل</button>') +
      '</div><div id="rl-groups"></div>';
    return h;
  }
  function groupsHTML(ro) {
    var vis = visibleMods(), h = '', shown = 0, dis = ro ? ' disabled' : '';
    B.catalog.forEach(function (g) {
      var mods = g.modules.filter(function (m) { return vis[m.key]; });
      if (!mods.length) return;
      shown++;
      var closed = !!S.collapsed[g.key] && !S.mq;
      h += '<section class="rl-group" data-g="' + g.key + '"><div class="rl-ghead"><button type="button" class="rl-gtoggle" data-fold="' + g.key + '" aria-expanded="' + !closed + '">' + icon('expand_more') + '<strong>' + esc(g.label) + '</strong><span class="rl-gcount" data-gc="' + g.key + '"></span></button>' +
        '<label class="check-label rl-gall"><input type="checkbox" class="checkbox" data-gall="' + g.key + '"' + dis + ' aria-label="تحديد كل صلاحيات قسم ' + esc(g.label) + '"><span>تحديد القسم</span></label></div>';
      h += '<div class="table-wrap rl-gbody" tabindex="0"' + (closed ? ' hidden' : '') + '><table class="rl-mx"><thead><tr><th scope="col" class="rl-mod">القسم</th>';
      ACTIONS.forEach(function (a) {
        var has = mods.some(function (m) { return m.actions.indexOf(a) >= 0; });
        h += '<th scope="col" class="rl-ac">' + esc(ALABEL[a]) + (has ? '<input type="checkbox" class="checkbox" data-col="' + g.key + ':' + a + '"' + dis + ' aria-label="' + esc(ALABEL[a]) + ' لكل أقسام ' + esc(g.label) + '">' : '') + '</th>';
      });
      h += '</tr></thead><tbody>';
      mods.forEach(function (m) {
        h += '<tr><th scope="row" class="rl-mod"><span class="rl-mi">' + icon(m.icon) + '</span><span>' + esc(m.label) + '</span><input type="checkbox" class="checkbox" data-row="' + m.key + '"' + dis + ' aria-label="كل صلاحيات ' + esc(m.label) + '"></th>';
        ACTIONS.forEach(function (a) {
          if (m.actions.indexOf(a) < 0) { h += '<td class="rl-ac rl-na" aria-label="غير متاح">—</td>'; return; }
          var k = m.key + '.' + a;
          h += '<td class="rl-ac"><input type="checkbox" class="checkbox" data-k="' + k + '"' + dis + ' title="' + esc((B.permNames && B.permNames[k]) || k) + '" aria-label="' + esc((B.permNames && B.permNames[k]) || k) + '"></td>';
        });
        h += '</tr>';
      });
      h += '</tbody></table></div></section>';
    });
    if (!shown) h = '<div class="rl-empty big"><span class="material-symbols-outlined" aria-hidden="true">search_off</span><p>لا توجد أقسام مطابقة لـ «' + esc(S.mq) + '».</p></div>';
    return h;
  }
  function refresh() {
    var r = cur(), ro = readOnlyInfo(r);
    var g = $('#rl-groups'); if (!g) return;
    if (!g.getAttribute('data-built') || g.getAttribute('data-mq') !== S.mq) { g.innerHTML = groupsHTML(ro); g.setAttribute('data-built', '1'); g.setAttribute('data-mq', S.mq); }
    var P = r.locked ? setOf(ALLKEYS) : S.draft.perms;
    $$('[data-k]', g).forEach(function (c) { c.checked = !!P[c.getAttribute('data-k')]; });
    var vis = visibleMods();
    function setTri(c, keys) { var n = 0; keys.forEach(function (k) { if (P[k]) n++; }); c.checked = keys.length > 0 && n === keys.length; c.indeterminate = n > 0 && n < keys.length; }
    $$('[data-row]', g).forEach(function (c) { setTri(c, keysOf({ m: c.getAttribute('data-row') })); });
    $$('[data-col]', g).forEach(function (c) { var p = c.getAttribute('data-col').split(':'); setTri(c, keysOf({ g: p[0], a: p[1], visible: vis })); });
    $$('[data-gall]', g).forEach(function (c) { setTri(c, keysOf({ g: c.getAttribute('data-gall'), visible: vis })); });
    $$('[data-gc]', g).forEach(function (c) { var ks = keysOf({ g: c.getAttribute('data-gc') }), n = ks.filter(function (k) { return P[k]; }).length; c.textContent = n + ' من ' + ks.length; c.className = 'rl-gcount' + (n === 0 ? ' is-zero' : (n === ks.length ? ' is-full' : '')); });
    var cnt = $('#rl-cnt'); if (cnt) cnt.textContent = size(P) + ' من ' + TOTAL + ' صلاحية';
    var pv = $('#rl-pv'); if (pv) pv.innerHTML = summary(P).map(function (x) { return '<li>' + icon(x.i) + '<span>' + esc(x.t) + '</span></li>'; }).join('');
    // header meter + list counter
    var m = $('.rl-meter-t strong'); if (m) m.textContent = size(P) + ' من ' + TOTAL;
    var bar = $('.rl-bar i'); if (bar) bar.style.width = Math.round(size(P) / TOTAL * 100) + '%';
    renderListQuiet();
    syncBar();
  }
  function renderListQuiet() { var y = listEl.scrollTop; renderList(); listEl.scrollTop = y; }

  /* ---- users tab ---- */
  function usersPanel(r, p) {
    var h = '';
    if (!ME.can.users || users === null) {
      p.innerHTML = '<div class="rl-empty big"><span class="material-symbols-outlined" aria-hidden="true">visibility_off</span><p>يوجد ' + r.users + ' مستخدم بهذا الدور. لا تملك صلاحية عرض قائمة المستخدمين (users.view).</p></div>'; return;
    }
    var mine = users.filter(function (u) { return u.role === r.key; });
    var canAssign = ME.can.assign && r.active;
    h += '<div class="rl-uhead"><p>' + mine.length + ' مستخدم بدور «' + esc(r.name) + '»</p><span class="grow"></span>' +
      (canAssign ? '<button type="button" class="btn btn-primary btn-sm" id="rl-uadd">' + icon('person_add') + 'إضافة مستخدمين</button>' : '') + '</div>';
    if (!r.active) h += '<div class="rl-note" role="note">' + icon('info') + '<p>هذا الدور معطّل: لا يستطيع مستخدموه الدخول إلى لوحة التحكم حتى تفعّله من «معلومات الدور».</p></div>';
    if (!mine.length) h += '<div class="rl-empty big"><span class="material-symbols-outlined" aria-hidden="true">group_off</span><p>لا يوجد مستخدمون بهذا الدور بعد.</p></div>';
    else {
      var others = roles.filter(function (x) { return x.id !== r.id && x.active && (ME.super || !x.locked); });
      h += '<ul class="rl-ulist">' + mine.map(function (u) {
        var st = u.status === 'active' ? ['نشط', 'info'] : (u.status === 'invited' ? ['مدعو', 'warn'] : ['معطّل', 'danger']);
        var can = canAssign && !u.me && (ME.super || r.key !== 'admin');
        return '<li><span class="avatar navy" aria-hidden="true">' + esc((u.name || '؟').charAt(0)) + '</span><div class="rl-un"><strong>' + esc(u.name) + (u.me ? ' <span class="muted">(أنت)</span>' : '') + '</strong><small class="ltr">' + esc(u.email) + '</small></div>' +
          '<span class="pill pill-' + st[1] + '">' + st[0] + '</span><span class="muted rl-last">' + (u.last ? esc(u.last) : 'لم يسجّل دخولاً') + '</span>' +
          (can ? '<label class="sr-only" for="mv' + u.id + '">نقل ' + esc(u.name) + ' إلى دور آخر</label><select class="select sm auto" id="mv' + u.id + '" data-move="' + u.id + '"><option value="">نقل إلى…</option>' + others.map(function (o) { return '<option value="' + o.id + '">' + esc(o.name) + '</option>'; }).join('') + '</select>' : '') + '</li>';
      }).join('') + '</ul>';
    }
    p.innerHTML = h;
  }
  function applyAssign(res) {
    if (res.roles) { roles = res.roles; }
    if (res.users) users = res.users;
    var r = cur();
    if (r) { var keep = S.draft; S.base = snap(r); S.draft = keep && S.tab !== 'perms' ? keep : snap(r); if (isDirty() === false) S.draft = snap(r); }
    renderList(); renderDetail();
  }
  function assignTo(r, ids) {
    return api('POST', BASE + '/' + r.id + '/users', { user_ids: ids }).then(function (res) {
      UI.toast(res.message || 'تم النقل', { icon: 'group' });
      if (res.warnings && res.warnings.length) toastErr(res.warnings.join(' '));
      applyAssign(res);
    }, function (e) { toastErr(e.message); });
  }
  function addUsers(r) {
    var cand = users.filter(function (u) { return u.role !== r.key && !u.me && (ME.super || u.role !== 'admin'); });
    if (!cand.length) { UI.toast('لا يوجد مستخدمون آخرون لإضافتهم', { tone: 'info', icon: 'info' }); return; }
    var body = '<div class="field mt-16"><label class="input-icon"><span class="sr-only">بحث</span>' + icon('search') + '<input class="input sm" id="rl-ua-q" type="search" placeholder="ابحث بالاسم أو البريد…" autocomplete="off"></label></div>' +
      '<ul class="rl-pick" id="rl-ua-l">' + cand.map(function (u) {
        var lab = (roles.filter(function (x) { return x.key === u.role; })[0] || { name: u.role }).name;
        return '<li data-s="' + esc(UI.normalize(u.name + ' ' + u.email)) + '"><label class="check-label"><input type="checkbox" class="checkbox" value="' + u.id + '"><span class="rl-un"><strong>' + esc(u.name) + '</strong><small class="ltr">' + esc(u.email) + '</small></span><span class="muted">' + esc(lab) + '</span></label></li>';
      }).join('') + '</ul><p class="hint mt-8">سيُنقل المستخدم من دوره الحالي إلى «' + esc(r.name) + '».</p>';
    UI.modal({
      title: 'إضافة مستخدمين إلى «' + r.name + '»', icon: 'person_add', size: 'lg', confirmText: 'نقل المحدَّدين', body: body, focus: '#rl-ua-q',
      onOpen: function (d) { var q = d.querySelector('#rl-ua-q'); q.addEventListener('input', function () { var v = UI.normalize(q.value); $$('#rl-ua-l li', d).forEach(function (li) { li.hidden = v && li.getAttribute('data-s').indexOf(v) < 0; }); }); },
      validate: function (d) { if ($$('#rl-ua-l input:checked', d).length) return true; UI.toast('حدّد مستخدماً واحداً على الأقل', { tone: 'info', icon: 'info' }); return false; },
      getValue: function (d) { return $$('#rl-ua-l input:checked', d).map(function (c) { return +c.value; }); }
    }).then(function (ids) { if (ids && ids.length) assignTo(r, ids); });
  }

  /* ---- info tab ---- */
  function infoPanel(r, p, ro) {
    var d = S.draft, dis = ro ? ' disabled' : '';
    p.innerHTML =
      (ro ? '<div class="rl-note' + (r.locked ? ' is-lock' : '') + '" role="note">' + icon(r.locked ? 'lock' : 'info') + '<p>' + esc(ro) + '</p></div>' : '') +
      '<div class="rl-info">' +
      '<div class="field"><label class="label" for="ri-name">اسم الدور <span class="req" aria-hidden="true">*</span></label><input class="input" id="ri-name" maxlength="100" value="' + esc(d.name) + '"' + dis + '></div>' +
      '<div class="field"><label class="label" for="ri-key">المعرّف (لا يتغير)</label><input class="input ltr" id="ri-key" value="' + esc(r.key) + '" readonly dir="ltr"><p class="hint">القيمة المخزّنة في حساب كل مستخدم (users.role).</p></div>' +
      '<div class="field rl-wide"><label class="label" for="ri-desc">الوصف</label><textarea class="textarea" id="ri-desc" maxlength="500" rows="3"' + dis + '>' + esc(d.desc) + '</textarea><p class="hint">يظهر للمدير عند اختيار الدور لمستخدم.</p></div>' +
      '<div class="field rl-wide"><div class="rl-sw"><span class="label" id="ri-act-l" style="flex:1">الدور مفعّل<span class="hint" style="font-weight:500">عند التعطيل لا يستطيع مستخدمو هذا الدور الدخول أو استخدام اللوحة.</span></span><button type="button" class="switch" id="ri-act" role="switch" aria-checked="' + d.active + '" aria-labelledby="ri-act-l"' + (ro || r.locked ? ' disabled' : '') + '></button></div>' +
      (!d.active && r.users ? '<p class="rl-warn">' + icon('warning') + 'تنبيه: ' + r.users + ' مستخدم بهذا الدور لن يتمكنوا من الدخول عند الحفظ.</p>' : '') + '</div>' +
      '</div><dl class="rl-facts"><div><dt>النوع</dt><dd>' + (r.locked ? 'دور محمي (مدير النظام)' : (r.system ? 'دور أساسي في النظام' : 'دور مخصص')) + '</dd></div><div><dt>عدد المستخدمين</dt><dd>' + r.users + '</dd></div><div><dt>تاريخ الإنشاء</dt><dd>' + esc(r.created || '—') + '</dd></div><div><dt>آخر تعديل</dt><dd>' + esc(r.updated || '—') + '</dd></div></dl>';
  }

  /* ---------- save bar ---------- */
  function diffCount() {
    var a = Object.keys(S.draft.perms).filter(function (k) { return !S.base.perms[k]; }).length;
    var b = Object.keys(S.base.perms).filter(function (k) { return !S.draft.perms[k]; }).length;
    var o = (S.draft.name !== S.base.name ? 1 : 0) + (S.draft.desc !== S.base.desc ? 1 : 0) + (S.draft.active !== S.base.active ? 1 : 0);
    return { add: a, rem: b, other: o };
  }
  function syncBar() {
    var bar = $('#rl-savebar'); if (!bar) return;
    var r = cur();
    if (!r || !isDirty()) { bar.hidden = true; bar.innerHTML = ''; return; }
    var c = diffCount();
    bar.hidden = false;
    bar.innerHTML = '<div class="rl-sb-t">' + icon('edit_note') + '<span><strong>لديك تغييرات غير محفوظة</strong><small>' +
      (c.add ? '+' + c.add + ' صلاحية ' : '') + (c.rem ? '−' + c.rem + ' صلاحية ' : '') + (c.other ? c.other + ' تعديل بالمعلومات' : '') + '</small></span></div>' +
      '<div class="rl-sb-a"><button type="button" class="btn btn-secondary" id="rl-undo">' + icon('undo') + 'تراجع</button><button type="button" class="btn btn-primary" id="rl-save"' + (S.busy ? ' disabled' : '') + '>' + icon(S.busy ? 'progress_activity' : 'save') + (S.busy ? 'جارٍ الحفظ…' : 'حفظ التغييرات') + '</button></div>';
  }
  function save() {
    var r = cur(); if (!r || S.busy || !isDirty()) return;
    var d = S.draft;
    if (d.name.trim().length < 2) { UI.toast('اسم الدور قصير جداً', { tone: 'danger', icon: 'error' }); S.tab = 'info'; renderDetail(); return; }
    S.busy = true; syncBar();
    var payload = { name_ar: d.name.trim(), description: d.desc.trim(), is_active: d.active };
    if (!r.locked) payload.permissions = Object.keys(d.perms);
    api('PUT', BASE + '/' + r.id, payload).then(function (res) {
      var i = roles.indexOf(r); roles[i] = res.role; S.busy = false;
      S.base = snap(res.role); S.draft = snap(res.role);
      UI.toast(res.message || 'تم الحفظ', { icon: 'verified_user' });
      renderList(); renderDetail();
    }, function (e) { S.busy = false; syncBar(); toastErr(e.message); });
  }

  /* ---------- create / duplicate / delete ---------- */
  function suggestKey(name) { return ''; }
  function askCreate(pre) {
    pre = pre || {};
    var opts = '<option value="">بدون صلاحيات (دور فارغ)</option>' + roles.map(function (x) { return '<option value="' + x.id + '"' + (pre.copy == x.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('');
    var body = '<div class="field mt-16"><label class="label" for="nr-name">اسم الدور <span class="req" aria-hidden="true">*</span></label><input class="input" id="nr-name" maxlength="100" placeholder="مثال: منسّق إعلامي" autocomplete="off" value="' + esc(pre.name || '') + '"><p class="error" id="nr-name-e" hidden></p></div>' +
      '<div class="field mt-16"><label class="label" for="nr-key">المعرّف <span class="req" aria-hidden="true">*</span></label><input class="input ltr" id="nr-key" dir="ltr" maxlength="20" placeholder="media_coord" autocomplete="off" value="' + esc(pre.key || '') + '"><p class="hint">حروف إنجليزية صغيرة وأرقام و _ فقط (2–20) — لا يمكن تغييره لاحقاً.</p><p class="error" id="nr-key-e" hidden></p></div>' +
      '<div class="field mt-16"><label class="label" for="nr-desc">الوصف</label><textarea class="textarea" id="nr-desc" rows="2" maxlength="500">' + esc(pre.desc || '') + '</textarea></div>' +
      '<div class="field mt-16"><label class="label" for="nr-copy">نسخ الصلاحيات من</label><select class="select" id="nr-copy">' + opts + '</select></div>';
    return UI.modal({
      title: pre.copy ? 'نسخ دور' : 'دور جديد', icon: pre.copy ? 'content_copy' : 'add_moderator', size: 'lg', confirmText: pre.copy ? 'إنشاء النسخة' : 'إنشاء الدور', body: body, focus: '#nr-name',
      validate: function (d) {
        var n = d.querySelector('#nr-name'), k = d.querySelector('#nr-key'), ok = true;
        var nv = n.value.trim(), kv = k.value.trim();
        var ne = d.querySelector('#nr-name-e'), ke = d.querySelector('#nr-key-e');
        ne.hidden = true; ke.hidden = true;
        if (nv.length < 2) { ne.textContent = 'اكتب اسماً من حرفين على الأقل.'; ne.hidden = false; ok = false; }
        else if (roles.some(function (x) { return x.name === nv; })) { ne.textContent = 'يوجد دور بنفس الاسم.'; ne.hidden = false; ok = false; }
        if (!/^[a-z][a-z0-9_]{1,19}$/.test(kv)) { ke.textContent = 'معرّف غير صالح: حروف إنجليزية صغيرة وأرقام و _ (يبدأ بحرف).'; ke.hidden = false; ok = false; }
        else if (roles.some(function (x) { return x.key === kv; })) { ke.textContent = 'المعرّف مستخدم لدور آخر.'; ke.hidden = false; ok = false; }
        if (!ok) (ne.hidden ? k : n).focus();
        return ok;
      },
      getValue: function (d) { return { name: d.querySelector('#nr-name').value.trim(), key: d.querySelector('#nr-key').value.trim(), desc: d.querySelector('#nr-desc').value.trim(), copy: d.querySelector('#nr-copy').value }; }
    }).then(function (v) {
      if (!v) return;
      var body2 = { name_ar: v.name, role_key: v.key, description: v.desc, permissions: [] };
      if (v.copy) { delete body2.permissions; body2.copy_from = +v.copy; }
      return api('POST', BASE, body2).then(function (res) {
        roles.push(res.role); UI.toast(res.message || 'تم الإنشاء', { icon: 'add_moderator' });
        select(res.role.id, 'perms');
      }, function (e) { toastErr(e.message); return askCreate(v); });
    });
  }
  function newRole() { guard(function () { askCreate({}); }); }
  function dupRole() {
    var r = cur(); if (!r) return;
    guard(function () { askCreate({ name: 'نسخة من ' + r.name, key: (r.key + '_copy').slice(0, 20), desc: r.description, copy: r.id }); });
  }
  function delRole() {
    var r = cur(); if (!r) return;
    if (r.users > 0) {
      UI.modal({ title: 'لا يمكن حذف هذا الدور', text: 'ما زال مرتبطاً بـ ' + r.users + ' مستخدم. انقلهم إلى دور آخر من تبويب «المستخدمون» ثم احذف الدور.', icon: 'group', tone: 'warn', confirmText: 'فتح المستخدمين', cancelText: 'إغلاق' })
        .then(function (ok) { if (ok) { S.tab = 'users'; renderDetail(); } });
      return;
    }
    UI.confirmDelete('الدور «' + r.name + '»', 'سيُحذف الدور وصلاحياته نهائياً. لا يتأثر أي مستخدم لأن الدور بلا مستخدمين.').then(function (ok) {
      if (!ok) return;
      api('DELETE', BASE + '/' + r.id).then(function (res) {
        roles = roles.filter(function (x) { return x.id !== r.id; });
        UI.toast(res.message || 'تم الحذف', { tone: 'danger' });
        select(roles[0].id, 'perms');
      }, function (e) { toastErr(e.message); });
    });
  }

  /* ---------- events ---------- */
  detail.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tab]');
    if (t) { S.tab = t.getAttribute('data-tab'); $$('.rl-tabs .tab').forEach(function (b) { b.setAttribute('aria-selected', String(b === t)); }); renderPanel(); return; }
    if (e.target.closest('#rl-save')) { save(); return; }
    if (e.target.closest('#rl-undo')) { S.draft = snap(cur()); S.base = snap(cur()); var g = $('#rl-groups'); if (g) g.removeAttribute('data-built'); renderDetail(); return; }
    if (e.target.closest('#rl-dup')) { dupRole(); return; }
    if (e.target.closest('#rl-del')) { delRole(); return; }
    if (e.target.closest('#rl-uadd')) { addUsers(cur()); return; }
    var f = e.target.closest('[data-fold]');
    if (f) { var gk = f.getAttribute('data-fold'); S.collapsed[gk] = !S.collapsed[gk]; var body = f.closest('.rl-group').querySelector('.rl-gbody'); body.hidden = !!S.collapsed[gk]; f.setAttribute('aria-expanded', String(!S.collapsed[gk])); return; }
    if (e.target.closest('#rl-fold')) {
      var any = B.catalog.some(function (g) { return !S.collapsed[g.key]; });
      B.catalog.forEach(function (g) { S.collapsed[g.key] = any; });
      var gr = $('#rl-groups'); if (gr) gr.removeAttribute('data-built'); refresh();
      var fb = $('#rl-fold'); if (fb) fb.innerHTML = icon(any ? 'unfold_more' : 'unfold_less') + (any ? 'فتح الأقسام' : 'طيّ الأقسام');
      return;
    }
    if (e.target.closest('#rl-all')) { bulk(keysOf({ visible: visibleMods() }), true); refresh(); return; }
    if (e.target.closest('#rl-none')) { bulk(keysOf({ visible: visibleMods() }), false); refresh(); return; }
    var sw = e.target.closest('#ri-act');
    if (sw && !sw.disabled) { S.draft.active = !S.draft.active; sw.setAttribute('aria-checked', String(S.draft.active)); renderPanel(); renderDetailHeadOnly(); return; }
  });
  function renderDetailHeadOnly() { syncBar(); renderListQuiet(); }
  detail.addEventListener('change', function (e) {
    var c = e.target;
    if (c.matches('[data-k]')) { setKey(c.getAttribute('data-k'), c.checked); refresh(); return; }
    if (c.matches('[data-row]')) { bulk(keysOf({ m: c.getAttribute('data-row') }), c.checked); refresh(); return; }
    if (c.matches('[data-col]')) { var p = c.getAttribute('data-col').split(':'); bulk(keysOf({ g: p[0], a: p[1], visible: visibleMods() }), c.checked); refresh(); return; }
    if (c.matches('[data-gall]')) { bulk(keysOf({ g: c.getAttribute('data-gall'), visible: visibleMods() }), c.checked); refresh(); return; }
    if (c.matches('[data-move]')) {
      var to = role(+c.value), uid = +c.getAttribute('data-move'); c.value = '';
      if (to) UI.modal({ title: 'نقل المستخدم إلى «' + to.name + '»؟', text: 'سيحصل على صلاحيات هذا الدور فور الحفظ، وتتغير القوائم التي يراها.', icon: 'swap_horiz', confirmText: 'نقل' }).then(function (ok) { if (ok) assignTo(to, [uid]); });
    }
  });
  detail.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'rl-mq') { S.mq = t.value; refresh(); return; }
    if (t.id === 'ri-name') { S.draft.name = t.value; syncBar(); var h2 = $('.rl-dtitle h2'); if (h2) h2.textContent = t.value; return; }
    if (t.id === 'ri-desc') { S.draft.desc = t.value; syncBar(); }
  });
  $('#rl-new') && $('#rl-new').addEventListener('click', newRole);

  /* ---------- start ---------- */
  var first = null, h = (location.hash || '').replace('#', '');
  if (h) first = roles.filter(function (r) { return r.key === h; })[0];
  first = first || roles[0];
  if (first) select(first.id, 'perms'); else { renderList(); renderDetail(); }
})();
