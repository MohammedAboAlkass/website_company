/* Google Analytics (settings seo.analytics_id / seo.anonymize_ip / seo.cookie_banner).
   Only loaded when a valid measurement id is saved. With the cookie banner on, nothing is loaded before the visitor accepts. */
(function () {
  'use strict';
  var T = function (k, d) { var c = window.SITE_T; return c && typeof c[k] === 'string' && c[k] !== '' ? c[k] : d; };
  var C = window.ALMEL_GA;
  if (!C || !/^G-[A-Z0-9]{6,12}$/.test(C.id || '')) return;
  var KEY = 'almel-cookie-consent';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ } }
  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', C.id, { anonymize_ip: !!C.anonymize });
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.id);
    document.head.appendChild(s);
  }
  if (!C.banner) { load(); return; }
  var v = get();
  if (v === 'granted') { load(); return; }
  if (v === 'denied') return;

  function show() {
    var st = document.createElement('style');
    st.textContent = '.ck-bar{position:fixed;inset-inline:16px;bottom:16px;z-index:80;max-width:560px;margin-inline:auto;display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;background:#2B2B2B;color:#fff;box-shadow:0 12px 40px rgba(0,0,0,.28);font-size:14px;line-height:1.8}' +
      '.ck-bar p{flex:1 1 240px;margin:0}.ck-bar button{height:40px;padding:0 18px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;font:inherit;font-weight:700;cursor:pointer}' +
      '.ck-bar button.ck-ok{background:#0C7845;border-color:#0C7845}.ck-bar button:focus-visible{outline:3px solid #FF7000;outline-offset:2px}';
    document.head.appendChild(st);
    var bar = document.createElement('div');
    bar.className = 'ck-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', T('js.ck.label', 'ملفات الارتباط'));
    var p = document.createElement('p'); p.textContent = T('js.ck.text', 'نستخدم ملفات الارتباط لقياس زيارات الموقع وتحسين تجربتك، دون أي بيانات تعريفية شخصية. هل توافق؟');
    var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'ck-ok'; ok.textContent = T('js.ck.ok', 'أوافق');
    var no = document.createElement('button'); no.type = 'button'; no.textContent = T('js.ck.no', 'رفض');
    ok.addEventListener('click', function () { set('granted'); bar.remove(); load(); });
    no.addEventListener('click', function () { set('denied'); bar.remove(); });
    bar.appendChild(p); bar.appendChild(ok); bar.appendChild(no);
    document.body.appendChild(bar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
})();
