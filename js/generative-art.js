/**
 * generative-art.js — Motor de arte generativo (index.html#arte y algoritmos.html)
 *
 * Ocho piezas donde matemáticas, código y arte son la misma cosa:
 *   rose        r(θ) = cos(kθ)                       rosa polar
 *   maurer      θₙ = n·d°, r = sin(6θ)               rosa de Maurer
 *   lissajous   x = sin(at+δ), y = sin(bt)           curvas de Lissajous
 *   spiro       hipotrocoide (R−r, d)                espirógrafo
 *   butterfly   r = e^sinθ − 2cos(mθ) + sin⁵(…)      curva mariposa (T. Fay)
 *   lorenz      σ=10, β=8/3, ρ variable              atractor de Lorenz
 *   dejong      x' = sin(a·y)−cos(b·x), …            atractor de De Jong
 *   phyllo      θ = n·137.508°, r = c√n              filotaxis (ángulo áureo)
 *
 * Controles: velocidad, parámetro principal de cada pieza (con modo auto que
 * lo hace oscilar solo), paleta de color, pausa y aleatorio. La fórmula de la
 * pieza activa se muestra bajo el lienzo con sus valores en vivo.
 *
 * Rendimiento / accesibilidad: solo anima cuando el canvas es visible
 * (IntersectionObserver) y la pestaña está activa; densidades reducidas en
 * móvil; prefers-reduced-motion → fotograma estático (los controles siguen
 * funcionando y redibujan en estático).
 */
(function () {
  'use strict';

  const canvas = document.getElementById('genart-canvas');
  const formulaEl = document.getElementById('genart-formula');
  const infoEl = document.getElementById('genart-info');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 768px)').matches;

  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // 137.508°
  const BG_FADE = '#05080d';

  /* ---------- paletas ---------- */
  const PALETTES = {
    neon:   ['#61dafb', '#c678dd', '#00d4aa'],
    plasma: ['#ff71ce', '#ffa445', '#ffe14d'],
    matrix: ['#00ff88', '#3ad29f', '#baffdd'],
    hielo:  ['#9be7ff', '#5fa8ff', '#e0ecff'],
  };

  function hexRGB(h) {
    const v = parseInt(h.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  /* Color en la posición s∈[0,1] de la paleta activa (arcoíris = ciclo HSL) */
  function colorAt(s, shift) {
    s = ((s % 1) + 1) % 1;
    if (state.palette === 'arcoiris') {
      return 'hsl(' + ((s * 320 + (shift || 0)) % 360) + ',90%,64%)';
    }
    const stops = PALETTES[state.palette] || PALETTES.neon;
    const seg = s * (stops.length - 1);
    const i = Math.min(stops.length - 2, seg | 0);
    const k = seg - i;
    const a = hexRGB(stops[i]), b = hexRGB(stops[i + 1]);
    return 'rgb(' + ((a[0] + (b[0] - a[0]) * k) | 0) + ',' +
                    ((a[1] + (b[1] - a[1]) * k) | 0) + ',' +
                    ((a[2] + (b[2] - a[2]) * k) | 0) + ')';
  }

  /* ---------- estado ---------- */
  const state = {
    piece: 'rose',
    speed: 1,
    paramN: 0.5,      // parámetro normalizado 0..1 (cada pieza lo mapea)
    auto: true,       // el parámetro oscila solo
    palette: 'neon',
    paused: false,
  };

  let W = 0, H = 0, CX = 0, CY = 0, SCALE = 1;
  let t = 0, rafId = null, visible = false, prevNow = null;

  function fmt(x, d) { return x.toFixed(d === undefined ? 2 : d); }

  /* Valor real del parámetro de la pieza activa */
  function paramValue(def) {
    return def.pmin + (def.pmax - def.pmin) * state.paramN;
  }

  /* ---------- piezas ---------- */
  const PIECES = {
    rose: {
      pmin: 2, pmax: 9, clear: 'full',
      draw() {
        const k = paramValue(this);
        const STEPS = mobile ? 800 : 1400;
        ctx.lineWidth = 1.4;
        let px = null, py = null;
        for (let s = 0; s <= STEPS; s++) {
          const th = (s / STEPS) * Math.PI * 14 + t * 0.03;
          const r = Math.cos(k * (th - t * 0.03)) * SCALE;
          const x = CX + r * Math.cos(th), y = CY + r * Math.sin(th);
          if (px !== null) {
            ctx.strokeStyle = colorAt(s / STEPS, t * 20);
            ctx.globalAlpha = 0.75;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
          }
          px = x; py = y;
        }
        ctx.globalAlpha = 1;
        return 'r(θ) = cos(kθ)   ·   k = ' + fmt(k);
      },
    },

    maurer: {
      pmin: 20, pmax: 176, clear: 'full',
      draw() {
        const d = paramValue(this);
        ctx.lineWidth = 0.7;
        let px = null, py = null;
        for (let i = 0; i <= 360; i++) {
          const th = i * d * Math.PI / 180;
          const r = Math.sin(6 * th) * SCALE;
          const x = CX + r * Math.cos(th), y = CY + r * Math.sin(th);
          if (px !== null) {
            ctx.strokeStyle = colorAt(i / 360, t * 30);
            ctx.globalAlpha = 0.55;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
          }
          px = x; py = y;
        }
        ctx.globalAlpha = 1;
        return 'θₙ = n·d°   r = sin(6θ)   ·   d = ' + fmt(d, 1) + '°';
      },
    },

    lissajous: {
      pmin: 0, pmax: 5.999, clear: 'full',
      ratios: [[1, 2], [2, 3], [3, 4], [3, 5], [4, 5], [5, 6]],
      draw() {
        const pair = this.ratios[paramValue(this) | 0];
        const a = pair[0], b = pair[1];
        const delta = t * 0.35;
        const STEPS = mobile ? 700 : 1200;
        ctx.lineWidth = 1.6;
        let px = null, py = null;
        for (let s = 0; s <= STEPS; s++) {
          const u = (s / STEPS) * Math.PI * 2;
          const x = CX + Math.sin(a * u + delta) * SCALE * 1.12;
          const y = CY + Math.sin(b * u) * SCALE * 0.85;
          if (px !== null) {
            ctx.strokeStyle = colorAt(s / STEPS, t * 25);
            ctx.globalAlpha = 0.8;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
          }
          px = x; py = y;
        }
        ctx.globalAlpha = 1;
        return 'x = sin(' + a + 't + δ)   y = sin(' + b + 't)   ·   δ = ' + fmt(delta % 6.283);
      },
    },

    spiro: {
      pmin: 2.05, pmax: 9.95, clear: 'full',
      draw() {
        const k = paramValue(this);          // R/r
        const R = 1, r = R / k, d = r * (0.55 + 0.4 * Math.sin(t * 0.4));
        const STEPS = mobile ? 1600 : 2600;
        ctx.lineWidth = 1.1;
        let px = null, py = null;
        for (let s = 0; s <= STEPS; s++) {
          const u = (s / STEPS) * Math.PI * 2 * 13;
          const q = ((R - r) / r) * u;
          const x = CX + ((R - r) * Math.cos(u) + d * Math.cos(q)) * SCALE;
          const y = CY + ((R - r) * Math.sin(u) - d * Math.sin(q)) * SCALE;
          if (px !== null) {
            ctx.strokeStyle = colorAt(s / STEPS, t * 15);
            ctx.globalAlpha = 0.65;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
          }
          px = x; py = y;
        }
        ctx.globalAlpha = 1;
        return 'hipotrocoide   ·   R/r = ' + fmt(k) + '   d = ' + fmt(d);
      },
    },

    butterfly: {
      pmin: 2, pmax: 8, clear: 'full',
      draw() {
        const m = Math.round(paramValue(this));
        const STEPS = mobile ? 1100 : 1800;
        const rot = t * 0.1;
        const S = SCALE * 0.28;
        ctx.lineWidth = 1.2;
        let px = null, py = null;
        for (let s = 0; s <= STEPS; s++) {
          const th = (s / STEPS) * Math.PI * 24;
          const r = Math.exp(Math.sin(th)) - 2 * Math.cos(m * th) +
                    Math.pow(Math.sin((2 * th - Math.PI) / 24), 5);
          const x = CX + Math.sin(th + rot) * r * S;
          const y = CY - Math.cos(th + rot) * r * S;
          if (px !== null) {
            ctx.strokeStyle = colorAt(s / STEPS, t * 20);
            ctx.globalAlpha = 0.6;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
          }
          px = x; py = y;
        }
        ctx.globalAlpha = 1;
        return 'r = e^sinθ − 2cos(' + m + 'θ) + sin⁵((2θ−π)/24)';
      },
    },

    lorenz: {
      pmin: 20, pmax: 45, clear: 'fade', fade: 0.05,
      pos: { x: 0.1, y: 0, z: 0 },
      reset() { this.pos = { x: 0.1, y: 0, z: 0 }; },
      draw(dt) {
        const rho = paramValue(this);
        const SIGMA = 10, BETA = 8 / 3, h = 0.004;
        const steps = Math.max(1, Math.round((reduced ? 20000 : 420) * state.speed * (dt ? dt * 60 : 1)));
        const p = this.pos;
        const S = SCALE / 28;
        ctx.lineWidth = 1;
        for (let i = 0; i < steps; i++) {
          const dx = SIGMA * (p.y - p.x);
          const dy = p.x * (rho - p.z) - p.y;
          const dz = p.x * p.y - BETA * p.z;
          const x0 = CX + p.x * S * 1.3, y0 = CY + (p.z - rho) * S * -1.15;
          p.x += dx * h; p.y += dy * h; p.z += dz * h;
          const x1 = CX + p.x * S * 1.3, y1 = CY + (p.z - rho) * S * -1.15;
          ctx.strokeStyle = colorAt(p.z / (rho * 1.6), t * 10);
          ctx.globalAlpha = 0.55;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        return "x'=σ(y−x)  y'=x(ρ−z)−y  z'=xy−βz   ·   ρ = " + fmt(rho, 1);
      },
    },

    dejong: {
      pmin: -2.5, pmax: 2.5, clear: 'fade', fade: 0.02,
      p: { x: 0.1, y: 0.1 },
      reset() { this.p = { x: 0.1, y: 0.1 }; },
      draw() {
        const a = paramValue(this), b = 0.43, c = -0.65, d = -2.43;
        const N = reduced ? 60000 : (mobile ? 3000 : 7000);
        const S = SCALE * 0.48;
        const p = this.p;
        ctx.globalAlpha = 0.28;
        for (let i = 0; i < N; i++) {
          const nx = Math.sin(a * p.y) - Math.cos(b * p.x);
          const ny = Math.sin(c * p.x) - Math.cos(d * p.y);
          p.x = nx; p.y = ny;
          ctx.fillStyle = colorAt((nx + 2) / 4, t * 8);
          ctx.fillRect(CX + nx * S, CY + ny * S, 1, 1);
        }
        ctx.globalAlpha = 1;
        return "x' = sin(a·y) − cos(0.43·x)   y' = sin(−0.65·x) − cos(−2.43·y)   ·   a = " + fmt(a);
      },
    },

    phyllo: {
      pmin: 120, pmax: 620, clear: 'full',
      draw() {
        const MAX_N = Math.round(paramValue(this));
        const n = reduced ? MAX_N : Math.min(MAX_N, 40 + Math.floor(((t * 60) % MAX_N)));
        const c = SCALE / Math.sqrt(640);
        for (let i = 0; i < n; i++) {
          const ang = i * GOLDEN_ANGLE + t * 0.05;
          const r = c * Math.sqrt(i);
          const sz = 1.2 + 2.6 * (i / 640);
          ctx.fillStyle = colorAt(i / MAX_N, t * 15);
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.arc(CX + r * Math.cos(ang), CY + r * Math.sin(ang), sz, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        return 'θ = n·137.508°   r = c·√n   ·   n = ' + n + ' / ' + MAX_N;
      },
    },
  };

  /* ---------- lienzo ---------- */
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
    hardClear();
    if (reduced) drawStatic();
  }

  function hardClear() {
    ctx.clearRect(0, 0, W, H);
    const def = PIECES[state.piece];
    if (def.reset) def.reset();
  }

  function setFormula(txt) { if (formulaEl) formulaEl.textContent = txt; }

  /* Contexto de la pieza (historia / matemáticas / aplicaciones): el texto
     vive en translations.js (idx.art.i.<pieza>) para que sea bilingüe. */
  function renderInfo() {
    if (!infoEl) return;
    const lang = document.documentElement.lang || localStorage.getItem('language') || 'es';
    const t = (window.pageTranslations || {})[lang] || {};
    infoEl.textContent = t['idx.art.i.' + state.piece] || '';
  }

  /* ---------- loop ---------- */
  function frame(now) {
    rafId = null;
    if (!visible || document.hidden) return;
    if (prevNow === null) prevNow = now;
    const dt = Math.min((now - prevNow) / 1000, 0.05);
    prevNow = now;

    if (!state.paused) {
      t += dt * state.speed;
      if (state.auto) {
        state.paramN = 0.5 + 0.45 * Math.sin(t * 0.22);
        syncParamSlider();
      }
      const def = PIECES[state.piece];
      if (def.clear === 'full') {
        ctx.clearRect(0, 0, W, H);
      } else {
        ctx.fillStyle = 'rgba(5,8,13,' + def.fade + ')';
        ctx.fillRect(0, 0, W, H);
      }
      setFormula(def.draw(dt));
    }
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (reduced) { drawStatic(); return; }
    prevNow = null;
    if (rafId === null) rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function drawStatic() {
    hardClear();
    t = 1.8;
    setFormula(PIECES[state.piece].draw(0));
  }

  /* ---------- controles ---------- */
  const speedEl = document.getElementById('ga-speed');
  const paramEl = document.getElementById('ga-param');
  const autoEl = document.getElementById('ga-auto');
  const paletteEl = document.getElementById('ga-palette');
  const playEl = document.getElementById('ga-play');
  const randomEl = document.getElementById('ga-random');

  function syncParamSlider() {
    if (paramEl) paramEl.value = Math.round(state.paramN * 100);
  }

  function selectPiece(name) {
    if (!PIECES[name]) return;
    state.piece = name;
    hardClear();
    document.querySelectorAll('.genart-btn').forEach((b) =>
      b.classList.toggle('active', b.dataset.piece === name));
    renderInfo();
    if (reduced) drawStatic();
  }

  document.querySelectorAll('.genart-btn').forEach((btn) => {
    btn.addEventListener('click', () => selectPiece(btn.dataset.piece));
  });

  if (speedEl) speedEl.addEventListener('input', () => {
    state.speed = parseFloat(speedEl.value) || 1;
  });

  if (paramEl) paramEl.addEventListener('input', () => {
    state.paramN = (parseInt(paramEl.value, 10) || 0) / 100;
    state.auto = false;
    if (autoEl) autoEl.checked = false;
    const def = PIECES[state.piece];
    if (def.clear === 'fade') hardClear(); // atractores: nuevo parámetro, nueva figura
    if (reduced) drawStatic();
  });

  if (autoEl) autoEl.addEventListener('change', () => {
    state.auto = autoEl.checked;
  });

  if (paletteEl) paletteEl.addEventListener('change', () => {
    state.palette = paletteEl.value;
    if (PIECES[state.piece].clear === 'fade') hardClear();
    if (reduced) drawStatic();
  });

  if (playEl) playEl.addEventListener('click', () => {
    state.paused = !state.paused;
    playEl.innerHTML = state.paused
      ? '<i class="fas fa-play"></i>'
      : '<i class="fas fa-pause"></i>';
    playEl.setAttribute('aria-label', state.paused ? 'Reanudar' : 'Pausar');
  });

  if (randomEl) randomEl.addEventListener('click', () => {
    const names = Object.keys(PIECES);
    const pals = Object.keys(PALETTES).concat('arcoiris');
    state.palette = pals[(Math.random() * pals.length) | 0];
    if (paletteEl) paletteEl.value = state.palette;
    state.paramN = Math.random();
    syncParamSlider();
    selectPiece(names[(Math.random() * names.length) | 0]);
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
  syncParamSlider();
  renderInfo();

  /* Al cambiar de idioma, re-render del contexto en el idioma nuevo */
  const langBtn = document.getElementById('language-toggle');
  if (langBtn) langBtn.addEventListener('click', () => setTimeout(renderInfo, 60));
})();
