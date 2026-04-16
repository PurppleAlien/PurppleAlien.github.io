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
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });

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
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initScrollSpy();
  initParticles();
  initCounters();
  initTypingEffect();
});
