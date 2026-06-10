/**
 * cursor.js — Cursor personalizado "cometa" (solo index, escritorio).
 *
 * Un punto luminoso con estela: la cabeza sigue al ratón y los segmentos
 * la persiguen con inercia decreciente. Al pasar sobre elementos interactivos
 * la cabeza crece y vira a púrpura; al hacer clic, un pulso breve.
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

  var N = 9;            // nº de segmentos de la estela
  var mx = -100, my = -100, hovered = null, layer = null;
  var segs = [];

  function lerp(a, b, t) { return a + (b - a) * t; }

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
      segs.push({ root: root, head: dot, x: mx, y: my });
    }

    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest(SEL);
      if (!el || el === hovered) return;
      hovered = el;
      layer.classList.add('lock');
      segs[0].head.style.width = '13px';
      segs[0].head.style.height = '13px';
    });

    document.addEventListener('mouseout', function (e) {
      var el = e.target.closest(SEL);
      if (!el) return;
      var to = (e.relatedTarget && e.relatedTarget.closest) ? e.relatedTarget.closest(SEL) : null;
      if (to === el) return; // seguimos dentro del mismo elemento
      hovered = null;
      layer.classList.remove('lock');
      segs[0].head.style.width = '9px';
      segs[0].head.style.height = '9px';
    });

    document.addEventListener('mousedown', function () { layer.classList.add('fire'); });
    document.addEventListener('mouseup', function () { layer.classList.remove('fire'); });

    (function loop() {
      segs[0].x = lerp(segs[0].x, mx, 0.35);
      segs[0].y = lerp(segs[0].y, my, 0.35);
      for (var i = 1; i < segs.length; i++) {
        segs[i].x = lerp(segs[i].x, segs[i - 1].x, 0.4);
        segs[i].y = lerp(segs[i].y, segs[i - 1].y, 0.4);
      }
      for (var j = 0; j < segs.length; j++) {
        segs[j].root.style.transform = 'translate3d(' + segs[j].x + 'px,' + segs[j].y + 'px,0)';
      }
      requestAnimationFrame(loop);
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
