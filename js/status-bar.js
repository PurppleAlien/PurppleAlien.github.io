/**
 * status-bar.js — Barra de estado estilo tmux/vim al pie (todas las páginas)
 *
 * `⎇ main · página` a la izquierda; idioma, hora local, disponibilidad y el
 * atajo Ctrl+K a la derecha. Información útil con estética de terminal:
 * sustituye decoración pasiva por estado real.
 *
 * Solo escritorio (≥ 769px y puntero fino): en móvil roba altura sin aportar.
 * Autocontenido: inyecta DOM y estilos; añadir el <script> basta.
 */
(function () {
  'use strict';

  if (!window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches) return;

  const PAGE_NAMES = {
    'index.html': '~/inicio',
    'sobre-mi.html': '~/sobre-mi',
    'proyecto-terminal.html': '~/proyecto-terminal',
    'portafolio.html': '~/portafolio',
    'divulgacion.html': '~/divulgacion',
    'algoritmos.html': '~/algoritmos',
    'contacto.html': '~/contacto',
    '404.html': '~/404',
  };

  const CSS = `
  .status-bar {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    height: 26px;
    z-index: 9980;
    display: flex;
    align-items: center;
    gap: 0;
    padding: 0 14px;
    background: rgba(8, 12, 17, 0.94);
    border-top: 1px solid rgba(97,218,251,0.14);
    font-family: 'Source Code Pro', monospace;
    font-size: 0.68rem;
    color: #8b949e;
    user-select: none;
  }
  body { padding-bottom: 26px; } /* el contenido no queda tapado por la barra */
  .sb-seg { display: inline-flex; align-items: center; gap: 6px; padding: 0 12px; height: 100%; }
  .sb-seg + .sb-seg { border-left: 1px solid rgba(97,218,251,0.08); }
  .sb-branch { color: #61dafb; }
  .sb-branch i { font-size: 0.65rem; }
  .sb-path { color: #c9d1d9; }
  .sb-right { margin-left: auto; display: flex; height: 100%; }
  .sb-avail { color: #00ff88; }
  .sb-avail::before {
    content: '';
    width: 7px; height: 7px; border-radius: 50%;
    background: #00ff88;
    box-shadow: 0 0 8px rgba(0,255,136,0.7);
    display: inline-block;
    margin-right: 6px;
  }
  .sb-kbd {
    cursor: pointer;
    transition: color 0.2s ease;
  }
  .sb-kbd:hover { color: #61dafb; }
  .sb-kbd b {
    font-weight: 600;
    color: rgba(97,218,251,0.7);
    border: 1px solid rgba(97,218,251,0.25);
    border-radius: 3px;
    padding: 0 5px;
  }
  `;

  function build() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const page = window.location.pathname.split('/').pop() || 'index.html';
    const lang = (document.documentElement.lang || 'es').toUpperCase();

    const bar = document.createElement('div');
    bar.className = 'status-bar';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = `
      <span class="sb-seg sb-branch"><i class="fas fa-code-branch"></i> main</span>
      <span class="sb-seg sb-path">${PAGE_NAMES[page] || '~/' + page.replace('.html', '')}</span>
      <span class="sb-right">
        <span class="sb-seg sb-lang">${lang}</span>
        <span class="sb-seg sb-time">--:--</span>
        <span class="sb-seg sb-avail">disponible</span>
        <span class="sb-seg sb-kbd" title="Paleta de comandos"><b>Ctrl K</b>&nbsp;comandos</span>
      </span>
    `;
    document.body.appendChild(bar);

    /* Hora local, actualizada cada 30 s */
    const timeEl = bar.querySelector('.sb-time');
    function tickClock() {
      timeEl.textContent = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
    tickClock();
    setInterval(tickClock, 30000);

    /* Idioma en vivo: el botón ES/EN cambia documentElement.lang */
    const langEl = bar.querySelector('.sb-lang');
    const langBtn = document.getElementById('language-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        setTimeout(() => { langEl.textContent = (document.documentElement.lang || 'es').toUpperCase(); }, 60);
      });
    }

    /* Atajo: click abre la paleta de comandos si está cargada */
    bar.querySelector('.sb-kbd').addEventListener('click', () => {
      if (window.__commandPalette) window.__commandPalette.open();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
