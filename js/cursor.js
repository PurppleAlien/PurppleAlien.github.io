/**
 * cursor.js — Cursor personalizado "cometa" (solo index, escritorio).
 *
 * Un punto luminoso con estela: la cabeza va clavada al puntero (precisión
 * exacta, sin lag) y los segmentos la persiguen con suavizado exponencial
 * independiente del framerate (mismo comportamiento a 60 Hz o 144 Hz).
 * Al pasar sobre elementos interactivos la cabeza crece y vira a púrpura
 * (via clase .lock, animada por transform:scale); al hacer clic, un pulso.
 *
 * Rendimiento: el bucle rAF se duerme cuando la estela converge y despierta
 * con el siguiente pointermove; solo se escribe el style de un segmento si
 * su posición cambió.
 *
 * Guards: solo puntero fino (hover + fine) y sin prefers-reduced-motion.
 * Estilos en assets/css/cursor.css.
 */
(function () {
  'use strict';
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SEL = 'a,button,[role="button"],.btn,.mnp-item,.page-card,.project-card,' +
            '.interest-item,.skill-cat,.service-card,.contact-card,.social-link,' +
            '.hero-badge,.theme-btn,.language-btn,.hamburger-btn,input,textarea,select';

  var N = 9;             // nº de segmentos de la estela
  var FOLLOW = 30;       // rigidez de la estela (s⁻¹): mayor = más pegada
  var SETTLE = 0.04;     // px por frame: umbral para dormir el bucle
  var MAX_DT = 0.05;     // s: tope de dt tras pestañas en segundo plano

  var mx = -100, my = -100, hovered = null, layer = null;
  var segs = [], running = false, lastT = 0;

  function init() {
    layer = document.createElement('div');
    layer.id = 'cursor-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    document.documentElement.classList.add('cursor-on');

    for (var i = 0; i < N; i++) {
      var root = document.createElement('div'); root.className = 'root';
      var dot = document.createElement('div'); dot.className = (i === 0) ? 'cc-seg cc-head' : 'cc-seg';
      var size = Math.max(2, 9 - i);
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.opacity = (1 - i / N).toFixed(2);
      root.appendChild(dot);
      layer.appendChild(root);
      segs.push({ root: root, x: mx, y: my, px: null, py: null });
    }

    document.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      wake();
    }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest(SEL);
      if (!el || el === hovered) return;
      hovered = el;
      layer.classList.add('lock');
    });

    document.addEventListener('mouseout', function (e) {
      var el = e.target.closest(SEL);
      if (!el) return;
      var to = (e.relatedTarget && e.relatedTarget.closest) ? e.relatedTarget.closest(SEL) : null;
      if (to === el) return; // seguimos dentro del mismo elemento
      hovered = null;
      layer.classList.remove('lock');
    });

    document.addEventListener('mousedown', function () { layer.classList.add('fire'); });
    document.addEventListener('mouseup', function () { layer.classList.remove('fire'); });

    // Ocultar el cometa cuando el puntero sale de la ventana
    document.addEventListener('mouseleave', function () { layer.classList.add('off'); });
    document.addEventListener('mouseenter', function () { layer.classList.remove('off'); });

    wake();
  }

  function wake() {
    if (running) return;
    running = true;
    lastT = performance.now();
    requestAnimationFrame(loop);
  }

  function loop(now) {
    var dt = Math.min((now - lastT) / 1000, MAX_DT) || 0;
    lastT = now;

    // Cabeza exacta sobre el puntero: cero lag.
    segs[0].x = mx;
    segs[0].y = my;

    // Estela: suavizado exponencial corregido por dt (frame-rate independent).
    var t = 1 - Math.exp(-FOLLOW * dt);
    var moving = false;
    for (var i = 1; i < segs.length; i++) {
      var dx = (segs[i - 1].x - segs[i].x) * t;
      var dy = (segs[i - 1].y - segs[i].y) * t;
      segs[i].x += dx;
      segs[i].y += dy;
      if (dx > SETTLE || dx < -SETTLE || dy > SETTLE || dy < -SETTLE) moving = true;
    }

    // Escribir el DOM solo cuando la posición realmente cambió.
    for (var j = 0; j < segs.length; j++) {
      var s = segs[j];
      if (s.x !== s.px || s.y !== s.py) {
        s.root.style.transform = 'translate3d(' + s.x + 'px,' + s.y + 'px,0)';
        s.px = s.x; s.py = s.y;
      }
    }

    if (moving) {
      requestAnimationFrame(loop);
    } else {
      running = false; // dormir hasta el próximo pointermove
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
