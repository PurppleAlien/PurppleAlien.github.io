/**
 * page-init.js
 * Shared initialization for sub-pages:
 *   contacto.html, sobre-mi.html, portafolio.html, divulgacion.html
 *
 * Responsibilities:
 *   1. Dark / light theme (synced with index.html via localStorage 'theme')
 *   2. Language switching ES ↔ EN using data-i18n attributes
 *   3. Hamburger mobile menu
 *   4. Scroll animations (.fade-in)
 *   5. Scroll-to-top button
 *   6. Read progress bar
 */

/* ============================================================
   1. THEME
============================================================ */
function initTheme() {
  // Solo modo oscuro: se quitó el conmutador claro/oscuro.
  document.body.classList.add('dark-mode');
  try { localStorage.setItem('theme', 'dark'); } catch (e) {}
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  localStorage.setItem('theme', theme);
  localStorage.setItem('darkMode', theme === 'dark'); // back-compat

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.innerHTML = theme === 'dark'
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    btn.title = theme === 'dark' ? 'Modo claro / Light mode' : 'Modo oscuro / Dark mode';
  }
}

/* ============================================================
   2. LANGUAGE
============================================================ */
function initLanguage() {
  const saved = localStorage.getItem('language') || 'es';
  applyPageLanguage(saved);

  const btn = document.getElementById('language-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = document.documentElement.lang || localStorage.getItem('language') || 'es';
    applyPageLanguage(current === 'es' ? 'en' : 'es');
  });
}

function applyPageLanguage(lang) {
  if (!window.pageTranslations || !window.pageTranslations[lang]) return;
  const t = window.pageTranslations[lang];

  /* textContent */
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });

  /* innerHTML (use sparingly, only for rich text) */
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  /* placeholder */
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  /* title attribute */
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (t[key] !== undefined) el.title = t[key];
  });

  /* Update flag button */
  const flagBtn = document.getElementById('language-toggle');
  if (flagBtn) {
    const flagSpan = flagBtn.querySelector('.language-flag');
    if (flagSpan) flagSpan.textContent = lang === 'en' ? '🇺🇸' : '🇲🇽';
    flagBtn.title = lang === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés';
  }

  document.documentElement.lang = lang;
  localStorage.setItem('language', lang);
}

/* Expose globally so inline handlers can call it */
window.applyPageLanguage = applyPageLanguage;

/* ============================================================
   3. HAMBURGER MOBILE MENU
============================================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    // Animate bars
    const bars = hamburger.querySelectorAll('.bar');
    if (isOpen) {
      bars[0] && (bars[0].style.transform = 'translateY(7px) rotate(45deg)');
      bars[1] && (bars[1].style.opacity = '0');
      bars[2] && (bars[2].style.transform = 'translateY(-7px) rotate(-45deg)');
    } else {
      bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }
  });

  /* Close on nav link click */
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeMobileMenu(hamburger, mobileNav));
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (mobileNav.classList.contains('open') &&
        !mobileNav.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMobileMenu(hamburger, mobileNav);
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileMenu(hamburger, mobileNav);
  });
}

function closeMobileMenu(btn, nav) {
  nav.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
  btn.querySelectorAll('.bar').forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
}

/* ============================================================
   4. SCROLL ANIMATIONS
============================================================ */
function initScrollAnimations() {
  // Si la capa FX (scroll-fx.js + GSAP) está activa, ella gestiona los
  // reveals con ScrollTrigger; evitamos doble manejo.
  if (window.__fxActive) return;
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   5. READ PROGRESS BAR
============================================================ */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ============================================================
   7. ACTIVE NAV LINK
============================================================ */
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.includes(path)) a.classList.add('active');
  });
}

/* ============================================================
   BOOTSTRAP
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initMobileMenu();
  initScrollAnimations();
  initProgressBar();
  initActiveNav();
});
