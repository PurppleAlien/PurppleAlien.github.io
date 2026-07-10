/**
 * main.js — index.html specific logic
 *
 * page-init.js handles: theme, language (data-i18n), hamburger menu,
 *   scroll-to-top, progress bar, scroll animations.
 *
 * This file handles index-specific extras:
 *   1. Smooth scroll for #anchor links
 *   2. Scroll-spy: active class on nav links
 *   3. Floating code particles in hero
 *   4. Section reveal counter animation
 *   5. Typing effect hero subtitle
 */

/* ============================================================
   1. SMOOTH SCROLL  (anchor links on index)
============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#' || id === '#!') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h') || '72', 10);
      // Con Lenis activo, delegamos en su scroll suave; si no, scroll nativo.
      if (window.lenis) {
        window.lenis.scrollTo(target, { offset: -offset });
      } else {
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }

      // Close mobile nav if open
      const mobileNav = document.getElementById('mobile-nav');
      const hamburger  = document.getElementById('hamburger-btn');
      if (mobileNav && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        if (hamburger) {
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.querySelectorAll('.bar').forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
        }
      }
    });
  });
}

/* ============================================================
   2. SCROLL-SPY
============================================================ */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"], .mobile-nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  function update() {
    const scrollY = window.scrollY + 100;
    let current = '';
    sections.forEach(s => {
      if (scrollY >= s.offsetTop) current = s.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ============================================================
   3. HERO PARTICLES
============================================================ */
function initParticles() {
  // Si la escena 3D del hero (hero3d.js) montó, ella sustituye a estas
  // partículas 2D y no las generamos para no duplicar decoración.
  if (window.__hero3dActive) return;
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const symbols = [
    '{', '}', '()', '=>', '[]', '//','/*', '*/', '&&', '||',
    '0x', '∑', '∂', 'π', '√', '∞', 'λ', '∈', '⊂',
    'BFS','DFS','A*','AI', 'if','for','fn','int','let','new',
    '01','10','11','00',
  ];

  const COUNT = 28;

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('span');
    el.className = 'particle';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const left     = Math.random() * 100;
    const duration = 12 + Math.random() * 20;
    const delay    = -(Math.random() * duration);
    const size     = 0.7 + Math.random() * 0.8;
    const opacity  = 0.06 + Math.random() * 0.1;

    el.style.cssText = `
      left: ${left}%;
      font-size: ${size}rem;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      color: rgba(97,218,251,${opacity});
    `;

    container.appendChild(el);
  }
}

/* ============================================================
   4. COUNTER ANIMATION
============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const end   = parseInt(el.dataset.count, 10);
      const dur   = 1400;
      const step  = dur / end;
      let current = 0;
      const timer = setInterval(() => {
        current++;
        el.textContent = current;
        if (current >= end) clearInterval(timer);
      }, step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ============================================================
   5. TYPING EFFECT  (hero subtitle cycles)
============================================================ */
function initTypingEffect() {
  const el = document.querySelector('.hero-subtitle[data-i18n]');
  if (!el) return;

  const phrases = {
    es: ['Matemático y Desarrollador', 'Algoritmia & IA', 'Java · C · Python', 'Problem Solver'],
    en: ['Mathematician & Developer',  'Algorithms & AI', 'Java · C · Python', 'Problem Solver'],
  };

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let paused    = false;

  function getLang() {
    return localStorage.getItem('language') || 'es';
  }

  function tick() {
    const lang = getLang();
    const list = phrases[lang] || phrases.es;
    const full = list[phraseIdx];

    if (!deleting) {
      charIdx++;
      el.textContent = full.slice(0, charIdx);
      if (charIdx === full.length) {
        if (!paused) { paused = true; setTimeout(() => { paused = false; deleting = true; tick(); }, 2200); return; }
      }
    } else {
      charIdx--;
      el.textContent = full.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % list.length;
      }
    }

    setTimeout(tick, deleting ? 45 : 75);
  }

  setTimeout(tick, 1000);
}

/* ============================================================
   6. ÍNDICE DE SECCIONES (nav lateral derecha)
============================================================ */
function initSectionIndex() {
  const ids = ['home', 'explore', 'about', 'skills', 'research', 'projects', 'studio', 'arte', 'contact', 'philosophy'];
  const nav = document.createElement('nav');
  nav.className = 'sidenav';
  nav.setAttribute('aria-label', 'Índice de secciones');
  const links = [];
  ids.forEach(id => {
    const sec = document.getElementById(id);
    if (!sec) return;
    const a = document.createElement('a');
    a.href = '#' + id; a.className = 'sidenav-dot'; a.dataset.id = id;
    a.innerHTML = '<span class="sidenav-label">' + id + '</span>';
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.getElementById(id);
      const off = 70;
      if (window.lenis && window.lenis.scrollTo) window.lenis.scrollTo(t, { offset: -off });
      else window.scrollTo({ top: t.offsetTop - off, behavior: 'smooth' });
    });
    nav.appendChild(a); links.push(a);
  });
  if (!links.length) return;
  document.body.appendChild(nav);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.dataset.id === en.target.id));
      });
    }, { threshold: 0.5 });
    ids.forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });
  }
}

/* ============================================================
   7. ESCENA 3D REACTIVA: tiñe los acentos de la escena por sección
============================================================ */
function initSceneReactive() {
  const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  const palettes = {
    home: [0x61dafb, 0xc678dd], explore: [0x61dafb, 0xc678dd],
    about: [0x00d4aa, 0x61dafb], skills: [0x61dafb, 0x3d85c6],
    research: [0xc678dd, 0x61dafb], projects: [0xfbbc05, 0xc678dd],
    studio: [0x00d4aa, 0x61dafb], arte: [0xc678dd, 0x00d4aa],
    contact: [0xff7eb6, 0xc678dd],
    philosophy: [0x61dafb, 0xc678dd],
  };
  let tries = 0;
  (function whenReady() {
    const api = window.__hero3dAPI;
    if (!api) { if (tries++ < 40) setTimeout(whenReady, 150); return; }
    Object.keys(palettes).forEach(id => {
      const s = document.getElementById(id);
      if (!s) return;
      const pal = palettes[id];
      ScrollTrigger.create({
        trigger: s, start: 'top 60%', end: 'bottom 40%',
        onEnter: () => api.setAccent(pal[0], pal[1]),
        onEnterBack: () => api.setAccent(pal[0], pal[1]),
      });
    });
    ScrollTrigger.refresh();
  })();
}

/* ============================================================
   8. ROTADOR DE CITAS (sección filosofía)
      Cicla Turing → Gauss → Euler → von Neumann. Bilingüe: lee las
      claves idx.quote.qN.* de pageTranslations según el idioma actual,
      así el conmutador ES/EN también cambia la cita visible.
============================================================ */
function initQuoteRotator() {
  const textEl   = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  const block    = document.getElementById('quote-rotator');
  if (!textEl || !authorEl || !block) return;

  const TOTAL = 4;
  const HOLD_MS = 8000;
  const FADE_MS = 450;
  let idx = 0;

  function currentLang() {
    return document.documentElement.lang || localStorage.getItem('language') || 'es';
  }

  function render() {
    const t = (window.pageTranslations || {})[currentLang()];
    if (!t) return;
    const n = idx + 1;
    if (t[`idx.quote.q${n}.text`])   textEl.textContent   = t[`idx.quote.q${n}.text`];
    if (t[`idx.quote.q${n}.author`]) authorEl.textContent = t[`idx.quote.q${n}.author`];
  }

  function next() {
    block.style.transition = `opacity ${FADE_MS}ms ease`;
    block.style.opacity = '0';
    setTimeout(() => {
      idx = (idx + 1) % TOTAL;
      render();
      block.style.opacity = '1';
    }, FADE_MS);
  }

  render();
  setInterval(next, HOLD_MS);

  // Al cambiar de idioma, re-render inmediato de la cita visible.
  const langBtn = document.getElementById('language-toggle');
  if (langBtn) langBtn.addEventListener('click', () => setTimeout(render, 50));
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initScrollSpy();
  initParticles();
  initCounters();
  initTypingEffect();
  initSectionIndex();
  initSceneReactive();
  initQuoteRotator();
});
