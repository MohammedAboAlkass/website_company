/* =========================================================
   جمعية الأمل — inner pages script (v11)
   Loaded on the inner pages BEFORE js/main.js, so content rendered here
   (project.html / article.html) is picked up by main.js's reveal and
   counter observers. main.js still handles the header, mobile menu,
   reveal, counters, FAQ accordion, newsletter and toast.
   Data for project.html / article.html lives in js/site-data.js.
   ========================================================= */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const qs = new URLSearchParams(location.search);
  const D = window.PAGES_DATA || { projects: [], news: [] };
  const page = document.body.dataset.page;
  const WA = "https://wa.me/201007749292";
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const usd = (v) => "$" + Math.round(v).toLocaleString("en-US");
  const icon = (name, extra = "") => `<span class="material-symbols-outlined${extra ? " " + extra : ""}" aria-hidden="true">${name}</span>`;
  const SAMPLE = '<span class="sample-badge">محتوى تجريبي</span>';

  const toast = (msg) => {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove("show"), 3200);
  };
  const cascade = (els) => {
    let i = 0;
    els.forEach((el) => {
      el.classList.add("is-in");
      $$(".bar-fill", el).forEach((b) => b.classList.add("is-in"));
      if (reduceMotion) return;
      el.style.setProperty("--card-idx", i++);
      el.classList.remove("card-cascade");
      void el.offsetWidth;
      el.classList.add("card-cascade");
    });
  };
  const setChips = (bar, value) => $$(".chip", bar).forEach((c) => {
    const on = c.dataset.filter === value;
    c.classList.toggle("is-on", on);
    c.setAttribute("aria-pressed", String(on));
  });
  const syncUrl = (key, value) => {
    try {
      const u = new URL(location.href);
      if (value && value !== "all") u.searchParams.set(key, value); else u.searchParams.delete(key);
      history.replaceState(null, "", u.href);
    } catch (_) { /* file:// may refuse history updates; filtering still works */ }
  };
  const hasChip = (bar, v) => v && $$(".chip", bar).some((c) => c.dataset.filter === v);

  /* ---------- Card templates (keep in sync with tools/v11/common.py) ---------- */
  const projectCard = (p) => {
    const b = p.badge;
    const bInner = b.live ? '<span class="live-dot live-dot-white"></span>' : `<span class="material-symbols-outlined">${esc(b.icon)}</span>`;
    const facts = p.facts.map((f) => `<div><dt>${esc(f.dt)}:</dt><dd${f.accent ? ' class="text-gold-deep"' : ""}>${esc(f.dd)}</dd></div>`).join("");
    const url = `project.html?id=${encodeURIComponent(p.id)}`;
    return `<article class="project-card" data-cat="${esc(p.cat)}">
      <div class="project-media">
        <img src="${esc(p.image)}" alt="${esc(p.alt)}" loading="lazy">
        <span class="badge ${esc(b.cls)} absolute top-3 right-3">${bInner}${esc(b.text)}</span>
        <span class="loc-chip"><span class="material-symbols-outlined">location_on</span>${esc(p.loc)}</span>
      </div>
      <div class="project-body">${p.sample ? "<!-- PLACEHOLDER -->" + SAMPLE : ""}
        <h3 class="project-title"><a href="${url}">${esc(p.title)}</a></h3>
        <p class="project-desc">${esc(p.desc)}</p>
        <dl class="project-facts">${facts}</dl>
        <div class="progress" role="progressbar" aria-valuenow="${p.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="نسبة التمويل: ${esc(p.title)}">
          <div class="progress-track"><div class="bar-fill ${esc(p.bar)}" style="--w:${p.progress}%"></div></div>
          <span class="progress-val" dir="ltr">${p.progress}%</span>
        </div>
        <div class="project-actions">
          <a href="${url}" class="btn btn-forest h-11 flex-1 text-[14px]" aria-label="تفاصيل المبادرة: ${esc(p.title)}">تفاصيل المبادرة<span class="material-symbols-outlined btn-arrow text-[18px]" aria-hidden="true">arrow_back</span></a>
          <a href="gallery.html" class="icon-square" aria-label="المعرض"><span class="material-symbols-outlined text-[20px]">photo_camera</span></a>
        </div>
      </div>
    </article>`;
  };
  const newsCard = (n) => `<article class="n-card" data-cat="${esc(n.cat)}">
      <div class="n-card-media">${n.sample ? "<!-- PLACEHOLDER -->" + SAMPLE : ""}<img src="${esc(n.image)}" alt="" loading="lazy"></div>
      <div class="n-card-body">
        <div class="n-card-meta"><span class="badge-soft">${esc(n.catLabel)}</span><time>${icon("calendar_month")}${esc(n.date)}</time></div>
        <h3 class="n-card-title"><a href="article.html?id=${encodeURIComponent(n.id)}">${esc(n.title)}</a></h3>
        <p class="n-card-excerpt">${esc(n.excerpt)}</p>
        <div class="n-card-foot"><span><span class="link-arrow">اقرأ الخبر<span class="material-symbols-outlined">arrow_back</span></span></span></div>
      </div>
    </article>`;

  /* ---------- Share buttons ---------- */
  const X_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z"/></svg>';
  const FB_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/></svg>';
  const fillShare = (title) => {
    const url = location.href;
    const t = encodeURIComponent(title), u = encodeURIComponent(url);
    const html = `
      <a class="share-btn" href="https://wa.me/?text=${t}%20${u}" target="_blank" rel="noopener" aria-label="مشاركة عبر واتساب">${icon("chat")}</a>
      <a class="share-btn" href="https://twitter.com/intent/tweet?text=${t}&url=${u}" target="_blank" rel="noopener" aria-label="مشاركة على منصة X">${X_SVG}</a>
      <a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener" aria-label="مشاركة على فيسبوك">${FB_SVG}</a>
      <a class="share-btn" href="https://t.me/share/url?url=${u}&text=${t}" target="_blank" rel="noopener" aria-label="مشاركة عبر تيليجرام">${icon("send")}</a>
      <button type="button" class="share-btn" data-copy aria-label="نسخ الرابط">${icon("link")}</button>`;
    $$("[data-share]").forEach((box) => { box.innerHTML = html; });
  };
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    const url = location.href;
    let ok = false;
    try { await navigator.clipboard.writeText(url); ok = true; } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = url; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch (__) { ok = false; }
      ta.remove();
    }
    toast(ok ? "تم نسخ الرابط" : "تعذّر النسخ، انسخ الرابط من شريط العنوان");
  });

  /* ---------- Shared hero helpers ---------- */
  const setHero = ({ title, lead, image, kicker }) => {
    if (title != null) { const h = $("[data-hero-title]"); if (h) h.textContent = title; const c = $("[data-crumb-current]"); if (c) c.textContent = title; }
    if (lead != null) { const l = $("[data-hero-lead]"); if (l) l.textContent = lead; }
    if (image) { const i = $("[data-hero-img]"); if (i) i.src = image; }
    if (kicker != null) { const k = $("[data-hero-kicker]"); if (k) k.innerHTML = kicker; }
  };

  /* =========================================================
     PROJECT DETAIL
     ========================================================= */
  if (page === "project" && D.projects.length) {
    const p = D.projects.find((x) => x.id === qs.get("id")) || D.projects[0];
    document.title = `${p.title} — جمعية الأمل لإغاثة أهل غزة`;
    setHero({ title: p.title, lead: p.desc, image: p.image });
    const chipsBox = $("#pd-hero-chips");
    if (chipsBox) {
      chipsBox.innerHTML =
        (p.badge.live ? `<span class="hero-chip hero-chip-urgent"><span class="live-dot live-dot-white" aria-hidden="true"></span>${esc(p.badge.text)}</span>` : "") +
        `<span class="hero-chip">${icon(p.catIcon)}${esc(p.catLabel)}</span>` +
        `<span class="hero-chip">${icon("location_on")}${esc(p.loc)}</span>` +
        `<span class="hero-chip"><b dir="ltr">${p.progress}%</b>نسبة التمويل</span>` +
        (p.sample ? '<!-- PLACEHOLDER --><span class="sample-badge sample-badge-dark">محتوى تجريبي</span>' : "");
    }
    const b = p.badge;
    $("#pd-cover").innerHTML = `<img src="${esc(p.image)}" alt="${esc(p.alt)}">
      <span class="badge ${esc(b.cls)}">${b.live ? '<span class="live-dot live-dot-white"></span>' : icon(b.icon)}${esc(b.text)}</span>
      <figcaption>${icon("location_on")}${esc(p.loc)}</figcaption>`;
    const facts = [
      ...p.facts.map((f, i) => ({ ic: i ? "groups" : "inventory_2", dt: f.dt, dd: f.dd })),
      { ic: "location_on", dt: "الموقع", dd: p.loc },
      { ic: p.catIcon, dt: "التصنيف", dd: p.catLabel },
    ];
    $("#pd-facts").innerHTML = facts.map((f) => `<div class="pd-fact"><dt>${icon(f.ic)}${esc(f.dt)}</dt><dd>${esc(f.dd)}</dd></div>`).join("");
    $('[data-pd="desc"]').textContent = p.desc;
    $("#pd-covers").innerHTML = p.covers.map((c) => `<div class="cover-item">${icon(c.icon)}<h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`).join("");
    $("#pd-gallery").dataset.n = String(p.gallery.length);
    $("#pd-gallery").innerHTML = p.gallery.map((g) => `<a class="pd-thumb" href="${esc(g.src)}" data-lb-group="project" data-lb-kicker="${esc(p.title)}" data-lb-title="${esc(g.caption)}" aria-label="عرض الصورة: ${esc(g.caption)}"><img src="${esc(g.src)}" alt="${esc(g.caption)}" loading="lazy"></a>`).join("");
    /* PLACEHOLDER: project updates — replace with real dated updates */
    const updates = [
      ["تاريخ التحديث", "تحديث ميداني (نموذج)", "يُضاف هنا تحديث مختصر عن سير التنفيذ: ما تم توزيعه والمنطقة، مع صورة موثّقة."],
      ["تاريخ التحديث", "تقرير صرف (نموذج)", "ملخص الصرف المعتمد للدفعة مع رابط التوثيق عند نشره."],
      ["تاريخ الإطلاق", "إطلاق المشروع (نموذج)", "تاريخ إطلاق المشروع وأهدافه الأولى كما وردت في خطة التنفيذ."],
    ];
    $("#pd-updates").innerHTML = updates.map(([d, t, x]) => `<li class="update"><span class="update-dot" aria-hidden="true"></span><div class="update-card"><time>${d}</time><h3>${t}</h3><p>${x}</p></div></li>`).join("");

    // funding box (goal / raised are PLACEHOLDER figures)
    $('[data-pd="pct"]').textContent = p.progress + "%";
    const bar = $('[data-pd="bar"]');
    bar.setAttribute("aria-valuenow", p.progress);
    bar.setAttribute("aria-label", "نسبة التمويل: " + p.title);
    $(".bar-fill", bar).style.setProperty("--w", p.progress + "%");
    $('[data-pd="raised"]').textContent = usd(p.raised);
    $('[data-pd="goal"]').textContent = usd(p.goal);
    $('[data-pd="left"]').textContent = usd(Math.max(0, p.goal - p.raised));

    const related = [...D.projects.filter((x) => x.id !== p.id && x.cat === p.cat), ...D.projects.filter((x) => x.id !== p.id && x.cat !== p.cat)].slice(0, 3);
    $("#pd-related").innerHTML = related.map(projectCard).join("");
    $$("#pd-related .project-card").forEach((c) => c.classList.add("reveal"));
    fillShare(p.title);

    // donate form
    const form = $("#donate-form");
    const custom = $("#donate-custom");
    const other = $("#donate-other");
    const cta = $('[data-pd="cta"]');
    const waBtn = $("#donate-wa");
    const read = () => {
      const a = form.elements.amount.value;
      const freq = form.elements.freq.value;
      const amt = a === "custom" ? parseFloat(other.value) : parseFloat(a);
      return { freq, amt: Number.isFinite(amt) && amt > 0 ? amt : 0, custom: a === "custom" };
    };
    const sync = () => {
      const { freq, amt, custom: isCustom } = read();
      custom.hidden = !isCustom;
      const label = freq === "monthly" ? "تبرّع شهرياً" : "تبرّع الآن";
      cta.innerHTML = amt ? `${label} — <bdi dir="ltr">${usd(amt)}</bdi>` : label;
      const msg = `مرحباً، أرغب في التبرع لمشروع: ${p.title}${amt ? ` — المبلغ: ${usd(amt)} (${freq === "monthly" ? "شهرياً" : "مرة واحدة"})` : ""}`;
      waBtn.href = `${WA}?text=${encodeURIComponent(msg)}`;
    };
    form.addEventListener("change", (e) => { sync(); if (e.target.name === "amount" && e.target.value === "custom") other.focus(); });
    form.addEventListener("input", sync);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { freq, amt, custom: isCustom } = read();
      if (isCustom && !amt) { other.setAttribute("aria-invalid", "true"); other.focus(); toast("أدخل مبلغاً صحيحاً للتبرع"); return; }
      other.removeAttribute("aria-invalid");
      const u = new URLSearchParams({ topic: "donate", project: p.id, amount: String(amt), freq });
      location.href = `contact.html?${u.toString()}#message-form`;
    });
    sync();
  }

  /* =========================================================
     ARTICLE
     ========================================================= */
  if (page === "article" && D.news.length) {
    const n = D.news.find((x) => x.id === qs.get("id")) || D.news[0];
    document.title = `${n.title} — جمعية الأمل لإغاثة أهل غزة`;
    setHero({ title: n.title, image: n.image, kicker: esc(n.catLabel) + (n.sample ? ' <!-- PLACEHOLDER --><span class="sample-badge sample-badge-dark">محتوى تجريبي</span>' : "") });
    const meta = [[`calendar_month`, n.date], ["schedule", n.read], ["apartment", n.desk]].filter((m) => m[1]);
    $("#ar-meta").innerHTML = meta.map(([i, t]) => `<span>${icon(i)}${esc(t)}</span>`).join("");
    $("#ar-cover").innerHTML = `<img src="${esc(n.image)}" alt="${esc(n.alt)}">`;
    const hl = n.highlights && n.highlights.length
      ? `<h2>أبرز ما في الخبر</h2><ul>${n.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : "";
    const figImg = (D.news.find((x) => x.image !== n.image && !x.sample) || n).image; // illustrative image, not the cover
    /* PLACEHOLDER: full article body — only the lead paragraph and highlights are real (from index.html) */
    $("#ar-body").innerHTML = `
      <p class="prose-lead">${esc(n.excerpt)}</p>
      ${hl}
      <!-- PLACEHOLDER: replace everything below with the official article text -->
      <div class="notice">${icon("edit_note")}<p>${SAMPLE} النص الكامل للخبر غير منشور بعد؛ الفقرات التالية نموذج لتنسيق الصفحة ويجب استبدالها بالنص المعتمد من المكتب الإعلامي.</p></div>
      <h2>تفاصيل الخبر</h2>
      <p>هنا يُضاف النص الكامل للخبر كما يعتمده المكتب الإعلامي: خلفية الحدث، والمكان والتاريخ، والجهات المشاركة في التنفيذ.</p>
      <p>يُفضَّل أن يتضمن هذا القسم أرقاماً موثّقة فقط من تقارير التوزيع، مع الإشارة إلى مصدرها ورابط التقرير عند توفره.</p>
      <blockquote>مساحة لاقتباس موثّق من أحد أعضاء الفريق الميداني أو المستفيدين، مع ذكر الاسم والصفة بعد الحصول على الإذن.</blockquote>
      <figure><img src="${esc(figImg)}" alt="" loading="lazy"><figcaption>تعليق الصورة: يُضاف وصف موثّق للصورة ومكان التقاطها.</figcaption></figure>
      <h3>الخطوات القادمة</h3>
      <p>تُذكر هنا المرحلة التالية من الحملة أو المشروع، وكيف يمكن للمتبرعين المساهمة فيها.</p>`;
    const facts = [["التصنيف", n.catLabel], ["التاريخ", n.date], ["المرجع", n.ref], ["الجهة", n.desk], ["مدة القراءة", n.read]].filter((f) => f[1]);
    $("#ar-facts").innerHTML = facts.map(([k, v]) => `<div><dt>${k}</dt><dd${k === "المرجع" ? ' dir="ltr"' : ""}>${esc(v)}</dd></div>`).join("");
    const related = [...D.news.filter((x) => x.id !== n.id && x.cat === n.cat), ...D.news.filter((x) => x.id !== n.id && x.cat !== n.cat)]
      .sort((a, b) => Number(a.sample) - Number(b.sample)).slice(0, 3);
    $("#ar-related").innerHTML = related.map(newsCard).join("");
    $$("#ar-related .n-card").forEach((c) => c.classList.add("reveal"));
    fillShare(n.title);
  }

  /* =========================================================
     PROJECTS LIST — category filter
     ========================================================= */
  const pjBar = $("#pj-filters");
  if (pjBar) {
    const cards = $$("#pj-grid .project-card");
    const count = $("#pj-count");
    const empty = $("#pj-empty");
    const apply = (f, animate) => {
      setChips(pjBar, f);
      const shown = cards.filter((c) => {
        const on = f === "all" || c.dataset.cat === f;
        c.style.display = on ? "" : "none";
        return on;
      });
      count.innerHTML = `عرض <b>${shown.length}</b> من <b>${cards.length}</b> مشاريع`;
      empty.hidden = shown.length > 0;
      if (animate) cascade(shown);
    };
    $$(".chip", pjBar).forEach((c) => c.addEventListener("click", () => { apply(c.dataset.filter, true); syncUrl("cat", c.dataset.filter); }));
    if (hasChip(pjBar, qs.get("cat"))) apply(qs.get("cat"), false);
  }

  /* =========================================================
     NEWS LIST — category + search + pagination
     ========================================================= */
  const nwGrid = $("#nw-grid");
  if (nwGrid) {
    const bar = $("#nw-filters");
    const search = $("#nw-search");
    const pager = $("#nw-pager");
    const count = $("#nw-count");
    const empty = $("#nw-empty");
    const cards = $$(".n-card", nwGrid);
    const PER_PAGE = 6;
    const norm = (s) => String(s).toLowerCase().replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
    let cat = "all", q = "", pageNo = 1;
    const render = (animate, scroll) => {
      const matched = cards.filter((c) => (cat === "all" || c.dataset.cat === cat) && (!q || norm(c.dataset.search).includes(q)));
      const pages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
      pageNo = Math.min(Math.max(1, pageNo), pages);
      const start = (pageNo - 1) * PER_PAGE;
      const visible = matched.slice(start, start + PER_PAGE);
      cards.forEach((c) => { c.style.display = visible.includes(c) ? "" : "none"; });
      count.innerHTML = matched.length
        ? `عرض <b dir="ltr">${start + 1}–${start + visible.length}</b> من <b>${matched.length}</b> خبراً`
        : "لا توجد نتائج";
      empty.hidden = matched.length > 0;
      const focused = document.activeElement && pager.contains(document.activeElement) ? document.activeElement.dataset.page : null;
      pager.hidden = pages <= 1;
      let html = `<button type="button" data-page="prev" aria-label="الصفحة السابقة"${pageNo === 1 ? " disabled" : ""}>${icon("arrow_forward")}</button>`;
      for (let i = 1; i <= pages; i++) html += `<button type="button" data-page="${i}" aria-label="الصفحة ${i}"${i === pageNo ? ' aria-current="page"' : ""}>${i}</button>`;
      html += `<button type="button" data-page="next" aria-label="الصفحة التالية"${pageNo === pages ? " disabled" : ""}>${icon("arrow_back")}</button>`;
      pager.innerHTML = html;
      if (focused) {
        const again = $(`[data-page="${focused}"]`, pager);
        (again && !again.disabled ? again : $('[aria-current="page"]', pager))?.focus({ preventScroll: true });
      }
      if (animate) cascade(visible);
      if (scroll) {
        const top = $("#news-list").getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      }
    };
    $$(".chip", bar).forEach((c) => c.addEventListener("click", () => { cat = c.dataset.filter; setChips(bar, cat); pageNo = 1; render(true); syncUrl("cat", cat); }));
    let t;
    search.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { q = norm(search.value.trim()); pageNo = 1; render(true); }, 160); });
    search.closest("label")?.addEventListener("submit", (e) => e.preventDefault());
    pager.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-page]");
      if (!btn || btn.disabled) return;
      const v = btn.dataset.page;
      pageNo = v === "prev" ? pageNo - 1 : v === "next" ? pageNo + 1 : Number(v);
      render(true, true);
    });
    if (hasChip(bar, qs.get("cat"))) { cat = qs.get("cat"); setChips(bar, cat); }
    if (qs.get("q")) { search.value = qs.get("q"); q = norm(search.value); }
    render(false);
  }

  /* =========================================================
     GALLERY — filter
     ========================================================= */
  const glGrid = $("#gl-grid");
  if (glGrid) {
    const bar = $("#gl-filters");
    const items = $$(".m-item", glGrid);
    const count = $("#gl-count");
    const empty = $("#gl-empty");
    const apply = (f, animate) => {
      setChips(bar, f);
      const shown = items.filter((it) => {
        const on = f === "all" || it.dataset.gcat === f || it.dataset.gtype === f;
        it.style.display = on ? "" : "none";
        return on;
      });
      count.innerHTML = `عرض <b>${shown.length}</b> مادة`;
      empty.hidden = shown.length > 0;
      if (animate) cascade(shown);
    };
    $$(".chip", bar).forEach((c) => c.addEventListener("click", () => { apply(c.dataset.filter, true); syncUrl("cat", c.dataset.filter); }));
    if (hasChip(bar, qs.get("cat"))) apply(qs.get("cat"), false);
  }

  /* =========================================================
     LIGHTBOX (gallery + project photos) — keyboard, swipe, focus trap
     ========================================================= */
  const lb = $("#lightbox");
  if (lb) {
    const media = $('[data-lb="media"]', lb);
    const kick = $('[data-lb="kicker"]', lb);
    const title = $('[data-lb="title"]', lb);
    const iEl = $('[data-lb="i"]', lb);
    const nEl = $('[data-lb="n"]', lb);
    const btnClose = $('[data-lb="close"]', lb);
    const btnPrev = $('[data-lb="prev"]', lb);
    const btnNext = $('[data-lb="next"]', lb);
    const stage = $(".lb-stage", lb);
    let list = [], idx = 0, lastFocus = null;
    const visible = (el) => el.style.display !== "none" && el.getClientRects().length > 0;
    const show = (i) => {
      if (!list.length) return;
      idx = (i + list.length) % list.length;
      const el = list[idx];
      const src = el.getAttribute("href");
      media.innerHTML = "";
      if (el.dataset.lbType === "video") {
        const v = document.createElement("video");
        v.src = src; v.controls = true; v.playsInline = true; v.preload = "metadata";
        if (el.dataset.lbPoster) v.poster = el.dataset.lbPoster;
        v.setAttribute("aria-label", el.dataset.lbTitle || "فيديو");
        media.appendChild(v);
      } else {
        const img = new Image();
        img.src = src; img.alt = el.dataset.lbTitle || ""; img.decoding = "async";
        media.appendChild(img);
      }
      kick.textContent = el.dataset.lbKicker || "";
      title.textContent = el.dataset.lbTitle || "";
      iEl.textContent = idx + 1;
      nEl.textContent = list.length;
      btnPrev.hidden = btnNext.hidden = list.length < 2;
      [idx + 1, idx - 1].forEach((k) => {
        const nb = list[(k + list.length) % list.length];
        if (nb && nb.dataset.lbType !== "video") { const im = new Image(); im.src = nb.getAttribute("href"); }
      });
    };
    const focusables = () => $$("button:not([hidden]), video[controls], a[href]", lb).filter((x) => x.getClientRects().length);
    const onKey = (e) => {
      const inVideo = e.target.tagName === "VIDEO";
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowLeft" && !inVideo) { e.preventDefault(); show(idx + 1); }   // RTL: left = next
      else if (e.key === "ArrowRight" && !inVideo) { e.preventDefault(); show(idx - 1); }
      else if (e.key === "Home") { e.preventDefault(); show(0); }
      else if (e.key === "End") { e.preventDefault(); show(list.length - 1); }
      else if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!lb.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    };
    const open = (el) => {
      list = $$(`[data-lb-group="${el.dataset.lbGroup}"]`).filter(visible);
      if (!list.includes(el)) list = [el];
      lastFocus = el;
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      show(list.indexOf(el));
      btnClose.focus({ preventScroll: true });
      document.addEventListener("keydown", onKey);
    };
    const close = () => {
      media.innerHTML = "";
      lb.hidden = true;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      lastFocus?.focus({ preventScroll: true });
    };
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-lb-group]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(a);
    });
    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", () => show(idx - 1));
    btnNext.addEventListener("click", () => show(idx + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target === stage || e.target === media) close(); });
    let sx = 0, sy = 0, tracking = false;
    stage.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) { tracking = false; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (!tracking) return;
      tracking = false;
      const tt = e.changedTouches[0];
      const dx = tt.clientX - sx, dy = tt.clientY - sy;
      // RTL: swiping right (finger →) brings the next item in from the left
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) show(idx + (dx > 0 ? 1 : -1));
    }, { passive: true });
  }

  /* =========================================================
     CONTACT — client-side validation only (no backend)
     ========================================================= */
  const cf = $("#contact-page-form");
  if (cf) {
    const success = $("#cf-success");
    const alertBox = $("#cf-alert");
    const alertText = $("#cf-alert-text");
    const topic = qs.get("topic");
    if (topic && $(`option[value="${CSS.escape(topic)}"]`, cf.elements.topic)) cf.elements.topic.value = topic;
    const proj = (D.projects || []).find((x) => x.id === qs.get("project"));
    const amount = parseFloat(qs.get("amount"));
    if (proj) {
      const freq = qs.get("freq") === "monthly" ? "شهرياً" : "مرة واحدة";
      cf.elements.message.value = `أرغب في التبرع لمشروع: ${proj.title}` + (amount > 0 ? `\nالمبلغ: ${usd(amount)} (${freq})` : "") + "\n";
    }
    const rules = {
      name: (v) => !v.trim() ? "هذا الحقل مطلوب: اكتب اسمك الكامل." : v.trim().length < 3 ? "يرجى إدخال الاسم الكامل (3 أحرف على الأقل)." : "",
      phone: (v) => {
        const d = v.replace(/\D/g, "");
        if (!v.trim()) return "هذا الحقل مطلوب: أدخل رقم هاتفك.";
        return /^[+\d\s()-]+$/.test(v.trim()) && d.length >= 8 && d.length <= 15 ? "" : "أدخل رقم هاتف صحيحاً مع رمز الدولة (8–15 رقماً).";
      },
      email: (v) => !v.trim() ? "هذا الحقل مطلوب: أدخل بريدك الإلكتروني." : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "أدخل بريداً إلكترونياً صحيحاً، مثل name@example.com.",
      message: (v) => !v.trim() ? "هذا الحقل مطلوب: اكتب نص رسالتك." : v.trim().length < 10 ? "اكتب رسالة من 10 أحرف على الأقل." : "",
      consent: (_, el) => el.checked ? "" : "يرجى الموافقة على التواصل معك لإتمام الإرسال.",
    };
    const check = (name) => {
      const el = cf.elements[name];
      const msg = rules[name](el.value, el);
      const wrap = el.closest(".field");
      const err = $(`#${el.id}-err`);
      wrap.classList.toggle("is-invalid", !!msg);
      wrap.classList.toggle("is-valid", !msg);
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      err.hidden = !msg;
      err.innerHTML = msg ? `${icon("error")}${msg}` : "";
      return !msg;
    };
    Object.keys(rules).forEach((name) => {
      const el = cf.elements[name];
      el.addEventListener("blur", () => { if (el.value || el.dataset.touched) { el.dataset.touched = "1"; check(name); } });
      el.addEventListener(name === "consent" ? "change" : "input", () => { if (el.getAttribute("aria-invalid") === "true") check(name); });
    });
    cf.addEventListener("submit", (e) => {
      e.preventDefault();
      const bad = Object.keys(rules).filter((n) => !check(n));
      if (bad.length) {
        alertText.textContent = bad.length === 1 ? "يرجى تصحيح حقل واحد قبل الإرسال." : `يرجى تصحيح ${bad.length} حقول قبل الإرسال.`;
        alertBox.hidden = false;
        cf.elements[bad[0]].focus();
        return;
      }
      alertBox.hidden = true;
      cf.hidden = true;
      success.hidden = false;
      success.focus();
      toast("شكراً لتواصلك، تم استلام رسالتك بنجاح.");
    });
    $("#cf-again").addEventListener("click", () => {
      cf.reset();
      $$(".field", cf).forEach((f) => f.classList.remove("is-invalid", "is-valid"));
      $$("[aria-invalid]", cf).forEach((el) => el.setAttribute("aria-invalid", "false"));
      $$(".field-error", cf).forEach((el) => { el.hidden = true; });
      $$("[data-touched]", cf).forEach((el) => delete el.dataset.touched);
      success.hidden = true;
      cf.hidden = false;
      cf.elements.name.focus();
    });
  }
})();
