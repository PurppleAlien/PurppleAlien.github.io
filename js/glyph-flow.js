/* ================================================================
   glyph-flow.js — Fondo vivo de glifos (matrix reinventado)
   ----------------------------------------------------------------
   Campo de flujo de caracteres matemáticos/código que corre FIJO
   detrás de todo el sitio (canvas #glyph-flow, z-index -1). Adaptado
   del prototipo fx-demos/glyph-field.html:
     · los glifos derivan por un campo seno/coseno (curl-noise barato)
     · huyen suavemente del cursor
     · parpadean con fase propia (nada de "lluvia" literal de Matrix)
   Rendimiento:
     · densidad proporcional al área, con tope (móvil ≈ mitad)
     · se pausa cuando la pestaña está oculta (visibilitychange)
     · ~30 fps le basta: throttle simple por timestamp
   Accesibilidad: no arranca con prefers-reduced-motion.
   ================================================================ */
(function () {
  'use strict';

  const cv = document.getElementById('glyph-flow');
  if (!cv || !cv.getContext) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cv.remove();
    return;
  }

  const ctx = cv.getContext('2d');
  const CHARS = 'λΣ∇πµ01{}<>=+*#%∂∫√≠→abdefgit'.split('');
  const COLORS = ['#61dafb', '#c678dd', '#3ad29f'];
  const DENSITY = 1 / 26000;          // partículas por px² (muy dispersas)
  const MAX_PARTS = 140;
  const FRAME_MS = 33;                // ~30 fps: fondo, no protagonista
  const MOUSE_R2 = 8100;              // radio² de repulsión del cursor

  let W = 0, H = 0, parts = [], last = 0, running = true;
  const mouse = { x: -9999, y: -9999 };

  function makePart() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      ch: CHARS[(Math.random() * CHARS.length) | 0],
      col: COLORS[(Math.random() * COLORS.length) | 0],
      size: 11 + Math.random() * 6,
      ph: Math.random() * 6.28,       // fase de parpadeo
      sp: 0.5 + Math.random() * 0.9,  // velocidad propia
    };
  }

  function resize() {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
    const mobile = W < 768;
    const target = Math.min(MAX_PARTS, Math.round(W * H * DENSITY * (mobile ? 0.5 : 1)));
    while (parts.length < target) parts.push(makePart());
    parts.length = target;
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { last = 0; requestAnimationFrame(frame); }
  });

  let t = 0;
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (now - last < FRAME_MS) return;
    last = now;
    t += 0.008;

    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const p of parts) {
      // campo de flujo: ángulo derivado del espacio + tiempo
      const a = Math.sin(p.x * 0.004 + t) + Math.cos(p.y * 0.004 - t * 0.6);
      p.x += Math.cos(a * Math.PI) * p.sp;
      p.y += Math.sin(a * Math.PI) * p.sp;

      // repulsión suave del cursor
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_R2) {
        const d = Math.sqrt(d2) || 1, f = (MOUSE_R2 - d2) / MOUSE_R2 * 4;
        p.x += dx / d * f; p.y += dy / d * f;
      }

      // envolver bordes
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

      // parpadeo individual — opacidad base muy baja: es atmósfera
      ctx.globalAlpha = 0.10 + 0.10 * (0.5 + 0.5 * Math.sin(t * 2.2 + p.ph));
      ctx.fillStyle = p.col;
      ctx.font = `${p.size}px "Source Code Pro", "Courier New", monospace`;
      ctx.fillText(p.ch, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  resize();
  requestAnimationFrame(frame);
})();
