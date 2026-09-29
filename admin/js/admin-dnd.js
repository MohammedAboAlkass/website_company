/* =========================================================================
   AdminDnD — sortable (optionally nested) lists with Pointer Events.
   Works with mouse, pen and touch (no HTML5 drag & drop).
   Markup contract:
     <ol class="…">  ← list
       <li data-id="…" data-depth="0|1"> … <button class="dnd-handle">…</button> … </li>
   Rows are rendered flat; nesting is expressed by data-depth (0 = top level).
   A dragged row carries its deeper descendants with it (the "block").
   Horizontal movement changes the projected depth (RTL: drag left = nest,
   drag right = un-nest). Callbacks:
     onMove({ id, index, depth, parentId })  while dragging (projection)
     onDrop({ id, index, depth, from, fromDepth, changed })
     onCancel()
   `index` is the position of the block among the remaining rows.
   ========================================================================= */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function depthOf(el) { return +(el.getAttribute('data-depth') || 0); }

  function Sortable(list, o) {
    o = o || {};
    var handleSel = o.handle || '.dnd-handle';
    var maxDepth = o.maxDepth || 0;
    var indent = o.indent || 40;
    var threshold = 4;
    var st = null;

    function rows() { return Array.prototype.filter.call(list.children, function (el) { return el.hasAttribute('data-id') && !el.classList.contains('dnd-placeholder'); }); }
    function isRTL() { return getComputedStyle(list).direction === 'rtl'; }

    list.addEventListener('pointerdown', function (e) {
      var h = e.target.closest(handleSel);
      if (!h || !list.contains(h) || st) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (h.getAttribute('aria-disabled') === 'true') return;
      var row = h.closest('[data-id]');
      if (!row || row.parentNode !== list) return;
      e.preventDefault();
      try { h.setPointerCapture(e.pointerId); } catch (err) { /* synthetic */ }
      st = { pid: e.pointerId, handle: h, row: row, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, started: false };
      h.addEventListener('pointermove', onMove);
      h.addEventListener('pointerup', onUp);
      h.addEventListener('pointercancel', onCancelEvt);
      document.addEventListener('keydown', onKey, true);
    });

    function begin() {
      var all = rows();
      var i0 = all.indexOf(st.row), d0 = depthOf(st.row);
      var block = [st.row];
      for (var j = i0 + 1; j < all.length && depthOf(all[j]) > d0; j++) block.push(all[j]);
      var rest = all.filter(function (r) { return block.indexOf(r) < 0; });
      var lr = list.getBoundingClientRect();
      var cs = getComputedStyle(list);
      var r0 = block[0].getBoundingClientRect(), rN = block[block.length - 1].getBoundingClientRect();
      var H = rN.bottom - r0.top;
      // Ghost: a visual copy of the block that follows the pointer
      var ghost = document.createElement('div');
      ghost.className = 'dnd-ghost ' + (o.ghostClass || '');
      ghost.setAttribute('aria-hidden', 'true');
      var padS = parseFloat(cs.paddingLeft) || 0, padE = parseFloat(cs.paddingRight) || 0;
      ghost.style.left = (lr.left + padS) + 'px';
      ghost.style.top = r0.top + 'px';
      ghost.style.width = (lr.width - padS - padE) + 'px';
      var inner = document.createElement(list.tagName === 'OL' ? 'ol' : 'ul');
      inner.className = list.className + ' dnd-ghost-list';
      block.forEach(function (r) {
        var c = r.cloneNode(true);
        c.removeAttribute('id');
        Array.prototype.forEach.call(c.querySelectorAll('[id]'), function (x) { x.removeAttribute('id'); });
        inner.appendChild(c);
      });
      ghost.appendChild(inner);
      ghost.inert = true;
      document.body.appendChild(ghost);
      // Placeholder where the block will land
      var ph = document.createElement('li');
      ph.className = 'dnd-placeholder';
      ph.setAttribute('aria-hidden', 'true');
      ph.style.height = H + 'px';
      ph.setAttribute('data-depth', d0);
      ph.innerHTML = '<span class="dnd-ph-box"></span>';
      list.insertBefore(ph, st.row);
      block.forEach(function (r) { r.classList.add('dnd-source'); r.hidden = true; });
      st.started = true;
      st.all = all; st.block = block; st.rest = rest; st.i0 = i0; st.d0 = d0; st.H = H;
      st.index = i0; st.depth = d0; st.hasChildren = block.length > 1;
      st.ghost = ghost; st.ph = ph; st.gx = r0.left; st.gy = r0.top;
      st.grabDY = st.y0 - r0.top;
      st.dir = isRTL() ? -1 : 1;
      st.heights = rest.map(function (r) { return r.getBoundingClientRect().height; });
      st.padTop = parseFloat(cs.paddingTop) || 0;
      document.documentElement.classList.add('dnd-active');
      list.classList.add('is-sorting');
      requestAnimationFrame(function () { if (st && st.ghost) st.ghost.classList.add('is-lifted'); });
      if (o.onStart) o.onStart({ id: st.row.getAttribute('data-id') });
      loop();
    }

    function limits(i) {
      var prev = st.rest[i - 1], next = st.rest[i];
      var maxD = st.hasChildren ? 0 : Math.min(maxDepth, prev ? depthOf(prev) + 1 : 0);
      var minD = next ? depthOf(next) : 0;
      if (maxDepth === 0) { maxD = 0; minD = 0; }
      return { min: minD, max: maxD, ok: minD <= maxD };
    }

    function project() {
      var lr = list.getBoundingClientRect();
      var rel = (st.y - st.grabDY) - (lr.top + st.padTop);
      var best = -1, bestDist = Infinity, off = 0;
      for (var i = 0; i <= st.rest.length; i++) {
        if (limits(i).ok) {
          var d = Math.abs(off - rel);
          if (d < bestDist) { bestDist = d; best = i; }
        }
        off += st.heights[i] || 0;
      }
      if (best < 0) best = st.index;
      var lim = limits(best);
      // RTL (dir = -1): moving left (negative dx) nests deeper; LTR: moving right
      var delta = Math.round(((st.x - st.x0) * st.dir) / indent);
      var depth = Math.max(lim.min, Math.min(lim.max, st.d0 + delta));
      var changed = best !== st.index || depth !== st.depth;
      if (best !== st.index) movePlaceholder(best);
      st.index = best;
      if (changed) setDepth(depth);
      st.depth = depth;
      if (changed && o.onMove) o.onMove(info());
    }

    function parentOf(index, depth) {
      if (depth < 1) return null;
      for (var i = index - 1; i >= 0; i--) if (depthOf(st.rest[i]) === depth - 1) return st.rest[i];
      return null;
    }
    function info() {
      var p = parentOf(st.index, st.depth);
      return { id: st.row.getAttribute('data-id'), index: st.index, depth: st.depth, parentId: p ? p.getAttribute('data-id') : null, from: st.i0, fromDepth: st.d0, changed: st.index !== st.i0 || st.depth !== st.d0 };
    }

    function movePlaceholder(i) {
      var before = st.rest.map(function (r) { return r.getBoundingClientRect().top; });
      list.insertBefore(st.ph, st.rest[i] || null);
      if (reduceMotion) return;
      st.rest.forEach(function (r, k) {
        var dy = before[k] - r.getBoundingClientRect().top;
        if (Math.abs(dy) > 0.5 && r.animate) r.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.22,.8,.24,1)' });
      });
    }
    function setDepth(d) {
      st.ph.setAttribute('data-depth', d);
      Array.prototype.forEach.call(list.querySelectorAll('.is-drop-parent'), function (el) { el.classList.remove('is-drop-parent'); });
      // find parent in the *new* order: rows before the placeholder
      var p = parentOf(st.index, d);
      if (p) p.classList.add('is-drop-parent');
    }

    function loop() {
      if (!st || !st.started) return;
      // auto-scroll near the viewport edges (works for touch too)
      var edge = 72, sp = 0;
      if (st.y < edge) sp = -Math.ceil((edge - st.y) / 6);
      else if (st.y > innerHeight - edge) sp = Math.ceil((st.y - (innerHeight - edge)) / 6);
      if (sp) { var before = scrollY; window.scrollBy(0, sp); if (scrollY !== before) project(); }
      st.raf = requestAnimationFrame(loop);
    }

    function onMove(e) {
      if (!st || e.pointerId !== st.pid) return;
      st.x = e.clientX; st.y = e.clientY;
      if (!st.started) {
        if (Math.abs(st.x - st.x0) < threshold && Math.abs(st.y - st.y0) < threshold) return;
        begin();
      }
      e.preventDefault();
      st.ghost.style.transform = 'translate(' + (st.x - st.x0) + 'px,' + (st.y - st.y0) + 'px)';
      project();
    }

    function cleanup() {
      if (!st) return;
      cancelAnimationFrame(st.raf);
      var h = st.handle;
      h.removeEventListener('pointermove', onMove);
      h.removeEventListener('pointerup', onUp);
      h.removeEventListener('pointercancel', onCancelEvt);
      document.removeEventListener('keydown', onKey, true);
      try { h.releasePointerCapture(st.pid); } catch (err) { /* ignore */ }
      if (st.started) {
        if (st.ghost) st.ghost.remove();
        if (st.ph) st.ph.remove();
        st.block.forEach(function (r) { r.hidden = false; r.classList.remove('dnd-source'); });
        Array.prototype.forEach.call(list.querySelectorAll('.is-drop-parent'), function (el) { el.classList.remove('is-drop-parent'); });
        document.documentElement.classList.remove('dnd-active');
        list.classList.remove('is-sorting');
      }
      st = null;
    }

    function onUp(e) {
      if (!st || e.pointerId !== st.pid) return;
      if (!st.started) { cleanup(); return; }
      var res = info();
      var ghost = st.ghost, ph = st.ph;
      var r = ph.getBoundingClientRect();
      var finish = function () { cleanup(); if (o.onDrop) o.onDrop(res); };
      if (reduceMotion || !ghost.animate) { finish(); return; }
      // settle the ghost into the placeholder, then commit
      var depthShift = (res.depth - res.fromDepth) * indent * (isRTL() ? -1 : 1);
      ghost.classList.remove('is-lifted');
      ghost.classList.add('is-dropping');
      var anim = ghost.animate([{ transform: ghost.style.transform }, { transform: 'translate(' + depthShift + 'px,' + (r.top - st.gy) + 'px)' }], { duration: 160, easing: 'cubic-bezier(.22,.8,.24,1)', fill: 'forwards' });
      st.dropping = true;
      anim.onfinish = finish;
    }
    function onCancelEvt(e) { if (st && e.pointerId === st.pid && !st.dropping) cancel(); }
    function cancel() {
      var started = st && st.started;
      cleanup();
      if (started && o.onCancel) o.onCancel();
    }
    function onKey(e) { if (e.key === 'Escape' && st && st.started && !st.dropping) { e.preventDefault(); e.stopPropagation(); cancel(); } }

    return { destroy: function () { cancel(); }, isDragging: function () { return !!(st && st.started); } };
  }

  /* Tree helpers (2 levels): tree = [{…, children:[…]}] ⇄ flat = [{item, depth}] */
  function flatten(tree) {
    var out = [];
    tree.forEach(function (it) { out.push({ item: it, depth: 0 }); (it.children || []).forEach(function (c) { out.push({ item: c, depth: 1 }); }); });
    return out;
  }
  function build(flat) {
    var tree = [];
    flat.forEach(function (f) {
      var it = f.item;
      if (f.depth > 0 && tree.length) { var p = tree[tree.length - 1]; (p.children = p.children || []).push(it); }
      else tree.push(it);
    });
    tree.forEach(function (it) { if (it.children && !it.children.length) delete it.children; });
    return tree;
  }
  /* Apply a drop result to a tree (by id). Returns a new tree. */
  function applyDrop(tree, res, idOf) {
    var flat = flatten(tree);
    var from = -1;
    for (var i = 0; i < flat.length; i++) if (idOf(flat[i].item) === res.id) { from = i; break; }
    if (from < 0) return tree;
    var d0 = flat[from].depth, n = 1;
    while (from + n < flat.length && flat[from + n].depth > d0) n++;
    var block = flat.splice(from, n);
    var shift = res.depth - d0;
    block.forEach(function (b) { b.depth += shift; });
    Array.prototype.splice.apply(flat, [res.index, 0].concat(block));
    // detach children arrays; build() re-creates them from the flat order
    flat.forEach(function (f) { delete f.item.children; });
    return build(flat);
  }

  window.AdminDnD = { Sortable: Sortable, flatten: flatten, build: build, applyDrop: applyDrop };
})();
