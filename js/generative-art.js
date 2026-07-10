/**
 * generative-art.js — Sección "Arte Generativo" (index.html, #arte)
 *
 * Tres piezas donde matemáticas, código y arte son la misma cosa:
 *   · rose        r(θ) = cos(kθ)          — rosa polar con k morfando
 *   · lissajous   x = sin(at+δ), y = sin(bt) — curvas de Lissajous con δ animada
 *   · phyllotaxis r = c√n, θ = n·137.508°  — filotaxis con el ángulo áureo
 *
 * La fórmula de la pieza activa se muestra bajo el lienzo con sus parámetros
 * actualizándose en vivo: el espectador ve el código-matemática que dibuja.
 *
 * Rendimiento / accesibilidad:
 *   - Solo anima cuando la sección es visible (IntersectionObserver) y la
 *     pestaña está activa.
 *   - prefers-reduced-motion: dibuja un fotograma estático por pieza, sin loop.
 *   - Canvas a DPR acotado (máx 1.5) y tamaño del contenedor.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('genart-canvas');
  const formulaEl = document.getElementById('genart-formula');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CYAN = '#61dafb', PURPLE = '#c678dd', TEAL = '#00d4aa';
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // 137.508°

  let W = 0, H = 0, CX = 0, CY = 0, SCALE = 1;
  let piece = 'rose';
  let visible = false;
  let rafId = null;
  let t = 0;

  function resize() {
    const frame = canvas.parentElement;
    const w = frame.clientWidth || 600;
    const h = Math.min(520, Math.max(300, Math.round(w * 0.56)));
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w; H = h; CX = w / 2; CY = h / 2;
    SCALE = Math.min(W, H) * 0.42;
    if (reduced) drawStatic();
  }

  /* ---------- utilidades de dibujo ---------- */
  function lerpColor(c1, c2, k) {
    const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
    const r = ((a >> 16) + (((b >> 16) - (a >> 16)) * k)) | 0;
    const g = (((a >> 8) & 255) + ((((b >> 8) & 255) - ((a >> 8) & 255)) * k)) | 0;
    const bl = ((a & 255) + (((b & 255) - (a & 255)) * k)) | 0;
    return `rgb(${r},${g},${bl})`;
  }

  function fmt(x, d) { return x.toFixed(d === undefined ? 2 : d); }

  /* ---------- piezas ---------- */
  const PIECES = {
    rose: {
      label: 'Rosa polar',
      draw(time) {
        // k morfa lentamente entre 2 y 7: la rosa cambia de nº de pétalos
        const k = 4.5 + 2.5 * Math.sin(time * 0.12);
        ctx.clearRect(0, 0, W, H);
        const STEPS = 1400;
        ctx.lineWidth = 1.4;
        for (let s = 1; s <= STEPS; s++) {
          const th0 = ((s - 1) / STEPS) * Math.PI * 2 * 7;
          const th1 = (s / STEPS) * Math.PI * 2 * 7;
          const r0 = Math.cos(k * th0) * SCALE;
          const r1 = Math.cos(k * th1) * SCALE;
          ctx.strokeStyle = lerpColor(CYAN, PURPLE, s / STEPS);
          ctx.globalAlpha = 0.75;
          ctx.beginPath();
          ctx.moveTo(CX + r0 * Math.cos(th0), CY + r0 * Math.sin(th0));
          ctx.lineTo(CX + r1 * Math.cos(th1), CY + r1 * Math.sin(th1));
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        return `r(θ) = cos(kθ)   ·   k = ${fmt(k)}`;
      },
    },

    lissajous: {
      label: 'Lissajous',
      draw(time) {
        const a = 3, b = 4;
        const delta = time * 0.35;
        ctx.clearRect(0, 0, W, H);
        const STEPS = 1200;
        ctx.lineWidth = 1.6;
        let px = null, py = null;
        for (let s = 0; s <= STEPS; s++) {
          const u = (s / STEPS) * Math.PI * 2;
          const x = CX + Math.sin(a * u + delta) * SCALE * 1.15;
          const y = CY + Math.sin(b * u) * SCALE * 0.85;
          if (px !== null) {
            ctx.strokeStyle = lerpColor(TEAL, PURPLE, s / STEPS);
            ctx.globalAlpha = 0.8;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
          }
          px = x; py = y;
        }
        ctx.globalAlpha = 1;
        return `x = sin(${a}t + δ)   y = sin(${b}t)   ·   δ = ${fmt(delta % (Math.PI * 2))}`;
      },
    },

    phyllotaxis: {
      label: 'Filotaxis',
      draw(time) {
        // El nº de semillas crece y se reinicia: la espiral "florece" en bucle
        const MAX_N = 620;
        const n = reduced ? MAX_N : 40 + Math.floor(((time * 60) % (MAX_N - 40)));
        const c = SCALE / Math.sqrt(MAX_N);
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < n; i++) {
          const ang = i * GOLDEN_ANGLE + time * 0.05;
          const r = c * Math.sqrt(i);
          const x = CX + r * Math.cos(ang);
          const y = CY + r * Math.sin(ang);
          const sz = 1.2 + 2.6 * (i / MAX_N);
          ctx.fillStyle = lerpColor(CYAN, TEAL, (i / MAX_N + 0.15 * Math.sin(time)) % 1);
          ctx.globalAlpha = 0.85;
          ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        return `θ = n · 137.508°   r = c·√n   ·   n = ${n}`;
      },
    },
  };

  function setFormula(txt) {
    if (formulaEl) formulaEl.textContent = txt;
  }

  /* ---------- loop ---------- */
  function frame() {
    rafId = null;
    if (!visible || document.hidden) return;
    t += 1 / 60;
    setFormula(PIECES[piece].draw(t));
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (reduced) { drawStatic(); return; }
    if (rafId === null) rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function drawStatic() {
    setFormula(PIECES[piece].draw(1.8));
  }

  /* ---------- controles ---------- */
  document.querySelectorAll('.genart-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      piece = btn.dataset.piece;
      document.querySelectorAll('.genart-btn').forEach((b) => b.classList.toggle('active', b === btn));
      if (reduced) drawStatic();
    });
  });

  /* ---------- visibilidad ---------- */
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        visible = en.isIntersecting;
        visible ? start() : stop();
      });
    }, { threshold: 0.15 });
    io.observe(canvas);
  } else {
    visible = true;
    start();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible) start();
  });

  window.addEventListener('resize', resize, { passive: true });
  resize();
})();
