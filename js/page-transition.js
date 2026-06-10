/**
 * page-transition.js — Transición tipo "cortina" entre páginas (todo el sitio).
 *
 * Al cargar la página, una cortina cubre y se retira (reveal-in). Al pulsar un
 * enlace interno (*.html), la cortina cubre y luego navega (cover-out). Da
 * sensación de app fluida sin el parpadeo blanco entre páginas.
 *
 * Robustez: si no hay GSAP o hay prefers-reduced-motion, no hace nada
 * (navegación nativa normal). Maneja bfcache (volver atrás) reseteando la cortina.
 * Requiere GSAP cargado antes. Estilos: .pt-overlay en shared.css.
 */
(function () {
  'use strict';
  var gsap = window.gsap;
  if (!gsap) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.body) return;

  var overlay = document.createElement('div');
  overlay.className = 'pt-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  // Reveal-in al cargar
  gsap.set(overlay, { scaleY: 1, transformOrigin: 'top' });
  gsap.to(overlay, { scaleY: 0, duration: 0.6, ease: 'power3.inOut', onComplete: function () { overlay.style.pointerEvents = 'none'; } });

  function isInternal(a) {
    var href = a.getAttribute('href');
    if (!href || a.target === '_blank' || a.hasAttribute('download')) return false;
    if (/^(https?:|mailto:|tel:|\/\/|#)/.test(href)) return false;
    return /\.html(\?|#|$)/.test(href);
  }

  document.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // respetar abrir en pestaña
    var a = e.target.closest('a');
    if (!a || !isInternal(a)) return;
    e.preventDefault();
    var href = a.getAttribute('href');
    gsap.set(overlay, { scaleY: 0, transformOrigin: 'bottom', pointerEvents: 'auto' });
    gsap.to(overlay, { scaleY: 1, duration: 0.5, ease: 'power3.inOut', onComplete: function () { window.location.href = href; } });
  }, true);

  // Al volver con el botón atrás (bfcache) la página puede restaurarse con la
  // cortina a medias → la reseteamos.
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) gsap.set(overlay, { scaleY: 0, pointerEvents: 'none' });
  });
})();
