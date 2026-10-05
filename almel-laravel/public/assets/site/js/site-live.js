/* Sends the public contact forms to the server (POST /contact -> table contact_messages). No e-mail is sent. */
(() => {
  "use strict";
  const T = (k, d) => { const c = window.SITE_T; return c && typeof c[k] === "string" && c[k] !== "" ? c[k] : d; };
  if (window.SiteLive) return; /* loaded once even when two templates include it */
  const toast = (msg) => {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove("show"), 3600);
  };
  const send = (form, onErr, onOk) => {
    const btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    fetch(form.getAttribute("action") || "/contact", {
      method: "POST",
      headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      body: new FormData(form),
      credentials: "same-origin",
    })
      .then(async (r) => {
        let j = {};
        try { j = await r.json(); } catch (_) { /* not JSON */ }
        if (r.ok) return onOk(j);
        if (r.status === 419) return onErr(T("js.err.419", "انتهت صلاحية الصفحة، حدّثها ثم أعد المحاولة."));
        if (r.status === 429) return onErr(T("js.err.429", "محاولات كثيرة خلال وقت قصير، أعد المحاولة بعد قليل."));
        if (r.status === 422) return onErr(j.message || T("js.err.422", "تحقق من الحقول المطلوبة."));
        return onErr(T("js.err.send", "تعذّر إرسال الرسالة الآن، حاول لاحقاً."));
      })
      .catch(() => onErr(T("js.err.net", "تعذّر الاتصال بالخادم، تحقق من الاتصال وأعد المحاولة.")))
      .finally(() => { if (btn) btn.disabled = false; });
  };
  window.SiteLive = { send, toast };

  /* home-page form (#contact-form): runs before main.js's demo handler */
  document.addEventListener("submit", (e) => {
    const f = e.target;
    if (!(f instanceof HTMLFormElement) || f.id !== "contact-form" || !f.dataset.live) return;
    e.preventDefault();
    e.stopPropagation();
    if (!f.reportValidity()) return;
    send(f, toast, (j) => { f.reset(); toast(j.message || T("contact.msg.success", "شكراً لتواصلك، تم استلام رسالتك بنجاح.")); });
  }, true);

  /* footer newsletter form (#news-form): stores the e-mail (POST /newsletter), no mail is sent */
  document.addEventListener("submit", (e) => {
    const f = e.target;
    if (!(f instanceof HTMLFormElement) || f.id !== "news-form" || !f.dataset.live) return;
    e.preventDefault();
    e.stopPropagation();
    const em = f.querySelector('input[type="email"]');
    if (em && !em.value.trim()) { toast(T("news.msg.email_required", "أدخل بريدك الإلكتروني.")); return; }
    send(f, toast, (j) => { f.reset(); toast(j.message || T("news.msg.ok", "شكراً لاشتراكك في النشرة البريدية.")); });
  }, true);
})();
