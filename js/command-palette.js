/**
 * command-palette.js — Paleta de comandos Ctrl+K / Cmd+K (todas las páginas)
 *
 * El gesto universal de las herramientas de desarrollo (VS Code, GitHub,
 * Linear...): un buscador de acciones con teclado. Filtro insensible a
 * acentos, navegación con ↑ ↓, Enter ejecuta, Esc cierra.
 *
 * Autocontenido: inyecta su propio DOM y estilos — añadir el <script> a una
 * página basta para tenerla. Sin dependencias.
 */
(function () {
  'use strict';

  /* ---------- acciones ---------- */
  const ACTIONS = [
    { icon: 'fa-home',            label: 'Ir a Inicio',                hint: 'index.html',             run: () => go('index.html') },
    { icon: 'fa-user-graduate',   label: 'Ir a Sobre Mí',              hint: 'sobre-mi.html',          run: () => go('sobre-mi.html') },
    { icon: 'fa-graduation-cap',  label: 'Ir a Proyecto Terminal',     hint: 'proyecto-terminal.html', run: () => go('proyecto-terminal.html') },
    { icon: 'fa-code',            label: 'Ir a Portafolio',            hint: 'portafolio.html',        run: () => go('portafolio.html') },
    { icon: 'fa-flask',           label: 'Ir a Divulgación',           hint: 'divulgacion.html',       run: () => go('divulgacion.html') },
    { icon: 'fa-project-diagram', label: 'Ir a Algoritmos (BFS·DFS·A*)', hint: 'algoritmos.html',      run: () => go('algoritmos.html') },
    { icon: 'fa-envelope',        label: 'Ir a Contacto',              hint: 'contacto.html',          run: () => go('contacto.html') },
    { icon: 'fa-file-pdf',        label: 'Descargar CV',               hint: 'curriculum.pdf',         run: () => { window.open('doc/curriculum.pdf', '_blank'); } },
    { icon: 'fa-terminal',        label: 'Abrir terminal interactiva', hint: 'Ctrl+`',                 run: openTerminal, when: () => !!document.getElementById('term-trigger') },
    { icon: 'fa-palette',         label: 'Ver arte generativo',        hint: '#arte',                  run: () => go('algoritmos.html#arte') },
    { icon: 'fa-rocket',          label: 'Probar detector de paráfrasis (demo en vivo)', hint: 'hf.space', run: () => window.open('https://purpplealien-deteccion-parafrasis.hf.space/', '_blank') },
    { icon: 'fa-brands fa-github',   label: 'Abrir GitHub',            hint: 'github.com/PurppleAlien', run: () => window.open('https://github.com/PurppleAlien', '_blank') },
    { icon: 'fa-brands fa-linkedin', label: 'Abrir LinkedIn',          hint: 'antonio-sould',          run: () => window.open('https://www.linkedin.com/in/antonio-sould/', '_blank') },
    { icon: 'fa-language',        label: 'Cambiar idioma ES/EN',       hint: 'i18n',                   run: () => { const b = document.getElementById('language-toggle'); if (b) b.click(); }, when: () => !!document.getElementById('language-toggle') },
  ];

  function go(href) {
    window.location.href = href;
  }

  function openTerminal() {
    const t = document.getElementById('term-trigger');
    if (t) setTimeout(() => t.click(), 80); // tras cerrar la paleta
  }

  function norm(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /* ---------- estilos ---------- */
  const CSS = `
  .cp-overlay {
    position: fixed; inset: 0; z-index: 99990;
    background: rgba(4,8,12,0.6);
    -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
    opacity: 0; visibility: hidden;
    transition: opacity 0.18s ease, visibility 0.18s ease;
  }
  .cp-overlay.open { opacity: 1; visibility: visible; }
  .cp-panel {
    position: fixed; z-index: 99991;
    top: 16vh; left: 50%;
    width: min(560px, 92vw);
    transform: translateX(-50%) translateY(-8px) scale(0.98);
    background: #0b1018;
    border: 1px solid rgba(97,218,251,0.25);
    border-radius: 12px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(97,218,251,0.08);
    overflow: hidden;
    opacity: 0; visibility: hidden;
    transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
    font-family: 'Source Code Pro', monospace;
  }
  .cp-panel.open { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0) scale(1); }
  .cp-input-row {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(97,218,251,0.12);
  }
  .cp-input-row i { color: rgba(97,218,251,0.6); font-size: 0.9rem; }
  .cp-input {
    flex: 1;
    background: transparent; border: none; outline: none;
    color: #e6edf3;
    font-family: inherit; font-size: 0.95rem;
  }
  .cp-input::placeholder { color: rgba(139,148,158,0.55); }
  .cp-esc {
    font-size: 0.62rem; color: rgba(139,148,158,0.6);
    border: 1px solid rgba(139,148,158,0.3); border-radius: 4px;
    padding: 2px 6px;
  }
  .cp-list { max-height: 46vh; overflow-y: auto; padding: 6px; }
  .cp-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px;
    border-radius: 7px;
    color: #c9d1d9;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .cp-item i { width: 18px; text-align: center; color: #61dafb; font-size: 0.85rem; }
  .cp-item .cp-hint { margin-left: auto; font-size: 0.68rem; color: rgba(139,148,158,0.55); }
  .cp-item.sel { background: rgba(97,218,251,0.1); color: #61dafb; }
  .cp-item.sel .cp-hint { color: rgba(97,218,251,0.5); }
  .cp-empty { padding: 22px 16px; text-align: center; color: #8b949e; font-size: 0.8rem; }
  .cp-foot {
    display: flex; gap: 16px;
    padding: 9px 16px;
    border-top: 1px solid rgba(97,218,251,0.12);
    font-size: 0.64rem; color: rgba(139,148,158,0.55);
  }
  .cp-foot b { color: rgba(97,218,251,0.55); font-weight: 600; }
  `;

  /* ---------- DOM ---------- */
  let overlay, panel, input, list;
  let items = [];        // acciones visibles tras el filtro
  let sel = 0;
  let built = false;

  function build() {
    if (built) return;
    built = true;

    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.className = 'cp-overlay';
    overlay.addEventListener('click', close);

    panel = document.createElement('div');
    panel.className = 'cp-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Paleta de comandos');
    panel.innerHTML = `
      <div class="cp-input-row">
        <i class="fas fa-terminal"></i>
        <input class="cp-input" type="text" placeholder="Escribe un comando o busca…" spellcheck="false" autocomplete="off">
        <span class="cp-esc">ESC</span>
      </div>
      <div class="cp-list"></div>
      <div class="cp-foot"><span><b>↑↓</b> navegar</span><span><b>↵</b> ejecutar</span><span><b>esc</b> cerrar</span></div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    input = panel.querySelector('.cp-input');
    list = panel.querySelector('.cp-list');

    input.addEventListener('input', () => { filter(input.value); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); exec(); }
    });
  }

  function filter(q) {
    const nq = norm(q.trim());
    items = ACTIONS.filter(a =>
      (!a.when || a.when()) &&
      (!nq || norm(a.label + ' ' + a.hint).includes(nq))
    );
    sel = 0;
    renderList();
  }

  function renderList() {
    list.innerHTML = '';
    if (!items.length) {
      const d = document.createElement('div');
      d.className = 'cp-empty';
      d.textContent = 'command not found — prueba "portafolio", "cv", "github"…';
      list.appendChild(d);
      return;
    }
    items.forEach((a, i) => {
      const d = document.createElement('div');
      d.className = 'cp-item' + (i === sel ? ' sel' : '');
      const isBrand = a.icon.indexOf('fa-brands') === 0;
      d.innerHTML = `<i class="${isBrand ? a.icon : 'fas ' + a.icon}"></i><span></span><span class="cp-hint"></span>`;
      d.children[1].textContent = a.label;
      d.children[2].textContent = a.hint;
      d.addEventListener('click', () => { sel = i; exec(); });
      d.addEventListener('mousemove', () => { if (sel !== i) { sel = i; renderList(); } });
      list.appendChild(d);
    });
  }

  function move(dir) {
    if (!items.length) return;
    sel = (sel + dir + items.length) % items.length;
    renderList();
    const el = list.children[sel];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }

  function exec() {
    const a = items[sel];
    if (!a) return;
    close();
    a.run();
  }

  let isOpen = false;
  function open() {
    build();
    isOpen = true;
    overlay.classList.add('open');
    panel.classList.add('open');
    input.value = '';
    filter('');
    setTimeout(() => input.focus(), 60);
  }

  function close() {
    if (!built) return;
    isOpen = false;
    overlay.classList.remove('open');
    panel.classList.remove('open');
    input.blur();
  }

  window.__commandPalette = { open, close };

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      isOpen ? close() : open();
    } else if (e.key === 'Escape' && isOpen) {
      close();
    }
  });
})();
