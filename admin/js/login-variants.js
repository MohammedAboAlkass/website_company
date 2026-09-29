/* جمعية الشمال للتنمية والتطوير المجتمعي — shared logic for the alternative login designs (login-1/2/3.html).
   Mirrors Pages.login in admin.js: any valid email + a password of 4+ characters
   redirects to index.html. Static template: no server, nothing is sent anywhere. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function icon(name) { return '<span class="material-symbols-outlined" aria-hidden="true">' + name + '</span>'; }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  /* ---------- Toast ---------- */
  function toast(title, text) {
    var host = $('#lv-toasts');
    if (!host) return;
    var t = document.createElement('div');
    t.className = 'lv-toast';
    t.innerHTML = icon('info') + '<div><strong></strong><span class="t"></span></div>';
    $('strong', t).textContent = title;
    $('.t', t).textContent = text || '';
    host.appendChild(t);
    setTimeout(function () {
      t.classList.add('is-out');
      setTimeout(function () { t.remove(); }, reduceMotion ? 0 : 320);
    }, 3600);
  }

  /* ---------- Login form ---------- */
  function initLogin() {
    var form = $('#login-form');
    if (!form) return;
    var email = $('#l-email'), pass = $('#l-pass'), remember = $('#l-remember'), btn = $('#l-submit');
    var saved = store.get('almel-admin-email', '');
    if (saved) { email.value = saved; remember.checked = true; }

    function setErr(input, msg) {
      var box = $('#' + input.id + '-err');
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      box.hidden = !msg;
      if (msg) $('span:last-child', box).textContent = msg;
    }
    function check(input) {
      if (input === email) {
        var v = email.value.trim();
        setErr(email, !v ? 'أدخل بريدك الإلكتروني.'
          : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'صيغة البريد غير صحيحة، مثال: name@example.org');
      } else {
        setErr(pass, !pass.value ? 'أدخل كلمة المرور.'
          : pass.value.length < 4 ? 'كلمة المرور يجب أن تكون 4 أحرف على الأقل.' : '');
      }
      return input.getAttribute('aria-invalid') !== 'true';
    }
    [email, pass].forEach(function (i) {
      i.addEventListener('blur', function () { if (i.value) check(i); });
      i.addEventListener('input', function () { if (i.getAttribute('aria-invalid') === 'true') check(i); });
    });

    var toggle = $('#pw-toggle');
    toggle.addEventListener('click', function () {
      var show = pass.type === 'password';
      pass.type = show ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', show ? 'true' : 'false');
      toggle.setAttribute('aria-label', show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
      toggle.innerHTML = icon(show ? 'visibility_off' : 'visibility');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn.classList.contains('is-loading')) return;
      var ok1 = check(email), ok2 = check(pass);
      if (!ok1 || !ok2) { (ok1 ? pass : email).focus(); return; }
      if (remember.checked) store.set('almel-admin-email', email.value.trim()); else store.del('almel-admin-email');
      btn.classList.add('is-loading');
      btn.setAttribute('aria-disabled', 'true');
      btn.innerHTML = '<span class="lv-spinner" aria-hidden="true"></span><span>جارٍ تسجيل الدخول…</span>';
      setTimeout(function () { location.href = 'index.html'; }, reduceMotion ? 50 : 650);
    });

    // #forgot is a plain link to forgot-password.html
  }

  /* ---------- Rotating field quotes (login-1) ---------- */
  function initStory() {
    var story = $('#lv1-story');
    if (!story) return;
    var quotes = $$('.lv1-quote', story), bars = $$('.lv1-bar', story), pauseBtn = $('.lv1-pause', story);
    var idx = 0, paused = reduceMotion, hover = false;

    function show(n) {
      idx = (n + quotes.length) % quotes.length;
      quotes.forEach(function (q, i) {
        var on = i === idx;
        q.classList.toggle('is-active', on);
        q.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      bars.forEach(function (b, i) {
        b.classList.toggle('is-done', i < idx);
        if (i === idx) {
          b.removeAttribute('aria-current');
          void b.offsetWidth; /* restart the progress animation */
          b.setAttribute('aria-current', 'true');
        } else b.removeAttribute('aria-current');
      });
    }
    function sync() {
      story.classList.toggle('is-paused', paused || hover);
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', paused ? 'تشغيل تدوير الاقتباسات' : 'إيقاف تدوير الاقتباسات مؤقتاً');
      var ico = pauseBtn.firstElementChild, name = paused ? 'play_arrow' : 'pause';
      if (ico && ico.textContent !== name) ico.textContent = name; /* never replace nodes: keeps the click target alive */
    }
    bars.forEach(function (b, i) {
      b.addEventListener('click', function () { show(i); });
      $('i', b).addEventListener('animationend', function () {
        if (!reduceMotion && !paused && b.getAttribute('aria-current') === 'true') show(idx + 1);
      });
    });
    pauseBtn.addEventListener('click', function () { paused = !paused; sync(); });
    story.addEventListener('mouseenter', function () { hover = true; sync(); });
    story.addEventListener('mouseleave', function () { hover = false; sync(); });
    story.addEventListener('focusin', function () { hover = true; sync(); });
    story.addEventListener('focusout', function (e) { if (!story.contains(e.relatedTarget)) { hover = false; sync(); } });
    show(0); sync();
  }

  function boot() { initLogin(); initStory(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
