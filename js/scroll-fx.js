/**
 * scroll-fx.js — Capa de efectos premium compartida (todas las páginas)
 *
 * Responsabilidades:
 *   1. Smooth scroll con inercia (Lenis) sincronizado con GSAP ScrollTrigger.
 *   2. Sistema de reveal on-scroll por data-attributes ([data-anim], [data-stagger]).
 *   3. Parallax sutil ([data-parallax]).
 *   4. Retrofit de los .fade-in existentes (sin romper nada).
 *
 * Accesibilidad / robustez:
 *   - Respeta prefers-reduced-motion: NO inicia Lenis ni animaciones; el contenido
 *     queda visible y el scroll es nativo.
 *   - Si GSAP / Lenis no cargaron (CDN caído), hace salida temprana y el sitio sigue
 *     funcionando con su comportamiento original (page-init.js asume el control).
 *
 * Banderas globales que expone (las leen main.js / page-init.js):
 *   - window.__fxActive : true si esta capa tomó el control de los reveals.
 *   - window.lenis      : instancia de Lenis (o null) para scroll programático.
 *
 * Debe cargarse DESPUÉS de gsap/ScrollTrigger/Lenis y ANTES de page-init.js.
 */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hasGSAP = typeof window.gsap !== 'undefined' &&
                typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';

  // Sin GSAP o con reduced-motion: no tomamos el control. page-init.js sigue
  // gestionando los .fade-in con su IntersectionObserver de siempre.
  if (prefersReduced || !hasGSAP) {
    window.__fxActive = false;
    window.lenis = null;
    return;
  }

  // A partir de aquí SÍ asumimos el control de los reveals.
  window.__fxActive = true;
  window.lenis = null;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  var isMobile = window.matchMedia('(max-width: 768px)').matches;

  /* ============================================================
     1. LENIS  +  SYNC CON SCROLLTRIGGER
  ============================================================ */
  function initSmoothScroll() {
    if (!hasLenis) return; // GSAP reveals funcionan igual con scroll nativo

    var lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      // En móvil dejamos el scroll táctil nativo (mejor sensación y batería).
      smoothTouch: false,
      touchMultiplier: 1.6,
    });

    window.lenis = lenis;

    // Lenis maneja su propio loop a través del ticker de GSAP.
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* ============================================================
     2. REVEALS POR DATA-ATTRIBUTES
        [data-anim="fade-up|fade|scale|left|right"]
        [data-anim-delay="0.15"]  (segundos)
        [data-stagger]  en un contenedor -> anima a sus hijos directos
  ============================================================ */
  var FROM = {
    'fade-up': { opacity: 0, y: 40 },
    'fade':    { opacity: 0 },
    'scale':   { opacity: 0, scale: 0.92 },
    'left':    { opacity: 0, x: -48 },
    'right':   { opacity: 0, x: 48 },
    'up':      { opacity: 0, y: 40 }, // alias
  };

  function revealOne(el) {
    var kind = el.getAttribute('data-anim') || 'fade-up';
    var from = FROM[kind] || FROM['fade-up'];
    var delay = parseFloat(el.getAttribute('data-anim-delay')) || 0;

    gsap.fromTo(el, from, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.85,
      delay: delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  function revealStagger(container) {
    var kind = container.getAttribute('data-anim') || 'fade-up';
    var from = FROM[kind] || FROM['fade-up'];
    var children = container.children;
    if (!children.length) return;

    gsap.fromTo(children, from, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: container,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    });
  }

  function initReveals() {
    document.querySelectorAll('[data-stagger]').forEach(revealStagger);
    document.querySelectorAll('[data-anim]').forEach(function (el) {
      // Un hijo de un contenedor con stagger ya está cubierto por el padre.
      if (el.closest('[data-stagger]') && el.closest('[data-stagger]') !== el) {
        if (el.parentElement && el.parentElement.hasAttribute('data-stagger')) return;
      }
      revealOne(el);
    });
  }

  /* ============================================================
     3. RETROFIT DE LOS .fade-in EXISTENTES
        page-init.js hace bail (ve window.__fxActive) y los manejamos aquí
        con el mismo look (fadeUp) pero disparado por ScrollTrigger.
  ============================================================ */
  var DELAY_CLASS = { 'delay-1': 0.15, 'delay-2': 0.3, 'delay-3': 0.45, 'delay-4': 0.6 };

  function initFadeIns() {
    document.querySelectorAll('.fade-in').forEach(function (el) {
      // Si ya lleva data-anim, lo gestiona initReveals(); evitamos doble animación.
      if (el.hasAttribute('data-anim')) return;
      // Si su contenedor directo tiene data-stagger, lo anima revealStagger() en grupo.
      if (el.parentElement && el.parentElement.hasAttribute('data-stagger')) return;

      var delay = 0;
      Object.keys(DELAY_CLASS).forEach(function (c) {
        if (el.classList.contains(c)) delay = DELAY_CLASS[c];
      });

      gsap.fromTo(el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
          onComplete: function () { el.classList.add('visible'); },
        }
      );
    });
  }

  /* ============================================================
     4. PARALLAX  [data-parallax="0.2"]  (factor de profundidad)
  ============================================================ */
  function initParallax() {
    if (isMobile) return; // evitamos jank en móvil
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var factor = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      gsap.to(el, {
        yPercent: -factor * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el.getAttribute('data-parallax-trigger')
            ? el.closest(el.getAttribute('data-parallax-trigger'))
            : el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  /* ============================================================
     BOOTSTRAP
  ============================================================ */
  initSmoothScroll(); // Lenis cuanto antes para que el scroll sea suave ya

  function boot() {
    initReveals();
    initFadeIns();
    initParallax();
    // Tras montar todo y cargar webfonts/imágenes, recalcular posiciones.
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
