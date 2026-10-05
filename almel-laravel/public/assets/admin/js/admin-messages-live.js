/* /admin/messages: switch filters, search, pages and the open message without a full page reload.
   Progressive enhancement: the page, its GET form and its links work unchanged without JavaScript.
   With JavaScript the same URL is fetched (X-Requested-With: XMLHttpRequest) and only the filter state,
   the list (+ pager), the reader and the header counts are swapped. Any problem falls back to normal navigation. */
(function () {
  'use strict';
  var inbox = document.getElementById('inbox');
  if (!inbox || !window.fetch || !window.URL || !window.AbortController || !window.DOMParser || !window.history || !history.pushState) return;
  var form = inbox.querySelector('.inbox-filters');
  var list = document.getElementById('m-list');
  var reader = document.getElementById('m-reader');
  var qInput = form && form.querySelector('input[name="q"]');
  var hidBox = form && form.querySelector('input[type="hidden"][name="box"]');
  var hidType = form && form.querySelector('input[type="hidden"][name="type"]');
  if (!form || !list || !reader || !qInput || !hidBox || !hidType) return;

  var PATH = new URL(form.getAttribute('action') || location.pathname, location.href).pathname;
  var ctrl = null, seq = 0, timer = 0;

  function currentUrl() { return location.pathname + location.search; }

  /* Clean URL from the filter state (same parameters the server uses for its own links). */
  function buildUrl(box, type, q) {
    var p = new URLSearchParams();
    if (box && box !== 'all') p.set('box', box);
    if (type) p.set('type', type);
    if (q) p.set('q', q);
    var s = p.toString();
    return PATH + (s ? '?' + s : '');
  }

  function setBusy(on) {
    inbox.classList.toggle('lv-loading', on);
    list.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  function announce(text) {
    var region = document.getElementById('toasts');
    if (!region) return;
    var old = region.querySelector('[data-lv-live]');
    if (old) old.remove();
    var s = document.createElement('span');
    s.className = 'sr-only';
    s.setAttribute('data-lv-live', '');
    s.textContent = text;
    region.appendChild(s);
  }

  function syncButtons(nForm) {
    var ob = form.querySelectorAll('button[type="submit"][name]');
    var nb = nForm.querySelectorAll('button[type="submit"][name]');
    if (ob.length !== nb.length) throw new Error('filters changed');
    for (var i = 0; i < ob.length; i++) {
      if (ob[i].name !== nb[i].name || ob[i].value !== nb[i].value) throw new Error('filters changed');
      ob[i].setAttribute('aria-pressed', nb[i].getAttribute('aria-pressed') === 'true' ? 'true' : 'false');
      var oc = ob[i].querySelector('.lv-n'), nc = nb[i].querySelector('.lv-n');
      if (nc) {
        if (oc) { if (oc.textContent !== nc.textContent) oc.textContent = nc.textContent; }
        else { ob[i].appendChild(document.createTextNode(' ')); ob[i].appendChild(document.importNode(nc, true)); }
      } else if (oc) {
        var prev = oc.previousSibling;
        if (prev && prev.nodeType === 3 && !prev.nodeValue.trim()) prev.remove();
        oc.remove();
      }
    }
  }

  function syncHeader(doc) {
    var os = document.querySelector('.page-head .page-sub'), ns = doc.querySelector('.page-head .page-sub');
    if (os && ns && os.textContent !== ns.textContent) os.textContent = ns.textContent;
    var oa = document.querySelector('.page-head .page-actions button'), na = doc.querySelector('.page-head .page-actions button');
    if (oa && na) oa.disabled = na.disabled;
  }

  /* The sidebar badge is drawn once by admin.js from window.__ADMIN_COUNTS; refresh it from the fetched page. */
  function syncSidebarBadge(html) {
    try {
      var m = /window\.__ADMIN_COUNTS\s*=\s*(\{[^;]*\});/.exec(html);
      if (!m) return;
      var c = JSON.parse(m[1]);
      window.__ADMIN_COUNTS = c;
      var n = c.messages_unread | 0;
      var b = document.querySelector('[data-count="messages"]'), sr = document.querySelector('[data-count-sr="messages"]');
      if (b) { b.textContent = n; b.hidden = !n; }
      if (sr) sr.textContent = n ? '، ' + n + ' غير مقروءة' : '';
    } catch (e) { /* cosmetic only */ }
  }

  function selectedId() {
    var a = list.querySelector('li[aria-current="true"] a[href]');
    if (!a) return '';
    try { return new URL(a.href, location.href).searchParams.get('id') || ''; } catch (e) { return ''; }
  }

  function apply(doc, html, o) {
    var nInbox = doc.getElementById('inbox'), nList = doc.getElementById('m-list'), nReader = doc.getElementById('m-reader');
    var nForm = nInbox && nInbox.querySelector('.inbox-filters');
    if (!nInbox || !nList || !nReader || !nForm) throw new Error('unexpected page');
    var prevId = selectedId();

    syncButtons(nForm);
    var nb = nForm.querySelector('input[type="hidden"][name="box"]'), nt = nForm.querySelector('input[type="hidden"][name="type"]');
    if (nb) hidBox.value = nb.value;
    if (nt) hidType.value = nt.value;
    if (o.syncQ) { var nq = nForm.querySelector('input[name="q"]'); if (nq) qInput.value = nq.value; }

    list.innerHTML = nList.innerHTML;
    var op = inbox.querySelector('.lv-pager'), np = nInbox.querySelector('.lv-pager');
    if (np) { var imp = document.importNode(np, true); if (op) op.replaceWith(imp); else list.after(imp); }
    else if (op) op.remove();
    if (o.trigger !== 'open') list.scrollTop = 0; /* opening a message keeps the list where it was */

    reader.innerHTML = nReader.innerHTML;
    inbox.classList.toggle('show-reader', nInbox.classList.contains('show-reader'));
    syncHeader(doc);
    syncSidebarBadge(html);

    var count = list.querySelectorAll('li.mitem').length;
    var subject = document.getElementById('m-subject');
    if (o.trigger === 'open' && subject) announce('فُتحت الرسالة: ' + subject.textContent.trim());
    else announce(count ? 'تم تحديث القائمة: ' + count + ' رسالة' : 'لا توجد رسائل مطابقة');

    if (o.trigger === 'open' && subject) { subject.focus(); }
    else if (o.trigger === 'back' || o.trigger === 'page') {
      var target = null;
      if (prevId) {
        var links = list.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
          try { if (new URL(links[i].href, location.href).searchParams.get('id') === prevId) { target = links[i]; break; } } catch (e) { /* skip */ }
        }
      }
      if (!target && o.trigger === 'page') { list.setAttribute('tabindex', '-1'); target = list; }
      if (target) target.focus({ preventScroll: o.trigger === 'page' });
    }
  }

  function fail(url, o) {
    if (o.push === false) location.reload(); else location.assign(url);
  }

  function go(url, o) {
    o = o || {};
    clearTimeout(timer);
    if (ctrl) ctrl.abort();
    var c = ctrl = new AbortController();
    var mine = ++seq;
    setBusy(true);
    fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'text/html' }, credentials: 'same-origin', signal: c.signal })
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        if (new URL(r.url).pathname !== PATH) throw new Error('redirected');
        return r.text();
      })
      .then(function (html) {
        if (mine !== seq) return;
        apply(new DOMParser().parseFromString(html, 'text/html'), html, o);
        if (o.push !== false) {
          var nu = new URL(url, location.href), next = nu.pathname + nu.search;
          if (next === currentUrl() || (o.trigger === 'search' && history.state && history.state.lvmTyping)) history.replaceState({ lvm: 1, lvmTyping: o.trigger === 'search' }, '', next);
          else history.pushState({ lvm: 1, lvmTyping: o.trigger === 'search' }, '', next);
        }
        setBusy(false);
      })
      .catch(function (err) {
        if (mine !== seq) return;
        if (err && err.name === 'AbortError') return;
        setBusy(false);
        fail(url, o);
      });
  }

  /* Remember the chosen filter at once (so two quick clicks combine correctly) and show it as pressed;
     the server's answer then confirms or corrects every value in apply(). */
  function filterClick(b) {
    var box = hidBox.value, type = hidType.value;
    if (b.name === 'box') { box = b.value; hidBox.value = box; } else if (b.name === 'type') { type = b.value; hidType.value = type; }
    var group = b.closest('[role="group"]');
    if (group) {
      var all = group.querySelectorAll('button[type="submit"][name]');
      for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-pressed', all[i] === b ? 'true' : 'false');
    }
    go(buildUrl(box, type, qInput.value.trim()), { trigger: 'filter' });
  }

  function searchNow(force) {
    var url = buildUrl(hidBox.value, hidType.value, qInput.value.trim());
    if (!force && url === currentUrl()) return;
    go(url, { trigger: 'search' });
  }

  inbox.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var b = e.target.closest ? e.target.closest('button[type="submit"][name]') : null;
    if (b && form.contains(b)) { e.preventDefault(); filterClick(b); return; }
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !inbox.contains(a)) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var u;
    try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (u.origin !== location.origin || u.pathname !== PATH) return;
    e.preventDefault();
    var trigger = a.closest('.lv-pager') ? 'page' : (a.classList.contains('reader-back') ? 'back' : 'open');
    go(u.pathname + u.search, { trigger: trigger });
  });

  /* Enter in the search box: search inside the current filters (the browser would otherwise press the first button, "all"). */
  qInput.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    searchNow(true);
  });
  qInput.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(searchNow, qInput.value.trim() === '' ? 0 : 350);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); searchNow(true); });

  window.addEventListener('popstate', function () {
    if (location.pathname !== PATH) return;
    go(currentUrl(), { push: false, trigger: 'pop', syncQ: true });
  });
})();
