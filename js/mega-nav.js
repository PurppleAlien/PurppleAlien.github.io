/**
 * mega-nav.js — Menú hamburguesa compartido (todas las páginas).
 *
 * Panel lateral con SOLO los enlaces a las páginas del sitio.
 * Autocontenido: inyecta su propio CSS y su markup, así funciona
 * igual en páginas con shared.css y en 404.html (que no lo carga).
 *
 * Comportamiento:
 *   · Usa el #hamburger-btn del header si existe (clonándolo para
 *     eliminar los listeners del menú móvil legado de page-init.js).
 *   · Si la página no tiene hamburger (404), crea un botón flotante.
 *   · Cierra con ✕, con la tecla Escape o pulsando el overlay.
 *   · Marca la página actual con estilo y aria-current="page".
 */
(function () {
  'use strict';

  var PAGES = [
    { href: 'index.html',             icon: 'fa-home',            label: 'Inicio',            tag: './inicio' },
    { href: 'sobre-mi.html',          icon: 'fa-user-graduate',   label: 'Sobre Mí',          tag: './sobre-mi' },
    { href: 'portafolio.html',        icon: 'fa-code-branch',     label: 'Portafolio',        tag: './portafolio',         cls: 'c-purple' },
    { href: 'divulgacion.html',       icon: 'fa-flask',           label: 'Divulgación',       tag: './divulgacion',        cls: 'c-green' },
    { href: 'proyecto-terminal.html', icon: 'fa-graduation-cap',  label: 'Proyecto Terminal', tag: './proyecto-terminal',  cls: 'c-red' },
    { href: 'algoritmos.html',        icon: 'fa-project-diagram', label: 'Algoritmos',        tag: './algoritmos',         accent: '#00ff88' },
    { href: 'contacto.html',          icon: 'fa-paper-plane',     label: 'Contacto',          tag: './contacto',           cls: 'c-yellow' }
  ];

  var CSS = '\
.mega-nav-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:9000;opacity:0;visibility:hidden;transition:opacity 0.4s ease,visibility 0.4s ease;}\
.mega-nav-overlay.open{opacity:1;visibility:visible;}\
.mega-nav-panel{position:fixed;top:0;left:0;width:390px;max-width:93vw;height:100vh;background:#080c11;border-right:1px solid rgba(97,218,251,0.18);z-index:9001;transform:translateX(-100%);transition:transform 0.45s cubic-bezier(0.4,0,0.2,1);overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;scrollbar-width:thin;scrollbar-color:rgba(97,218,251,0.2) transparent;}\
.mega-nav-panel.open{transform:translateX(0);}\
.mega-nav-panel::before{content:"";position:fixed;top:0;left:0;width:390px;max-width:93vw;height:100vh;background:repeating-linear-gradient(0deg,transparent 0px,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px);pointer-events:none;z-index:0;}\
.mega-nav-panel::after{content:"";position:fixed;top:0;left:calc(390px - 2px);width:2px;height:100vh;background:linear-gradient(180deg,transparent 0%,#61dafb 25%,#c678dd 60%,#00d4aa 85%,transparent 100%);opacity:0;transition:opacity 0.45s ease 0.1s;}\
.mega-nav-panel.open::after{opacity:0.55;}\
.mnp-inner{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;padding-bottom:24px;}\
.mnp-header{display:flex;align-items:center;justify-content:space-between;padding:22px 22px 18px;border-bottom:1px solid rgba(97,218,251,0.1);background:rgba(97,218,251,0.02);}\
.mnp-logo{display:flex;align-items:center;gap:12px;text-decoration:none;}\
.mnp-logo-photo{width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #61dafb;box-shadow:0 0 14px rgba(97,218,251,0.35),0 0 28px rgba(97,218,251,0.1);transition:box-shadow 0.3s ease;}\
.mnp-logo:hover .mnp-logo-photo{box-shadow:0 0 22px rgba(97,218,251,0.6),0 0 44px rgba(97,218,251,0.2);}\
.mnp-logo-text{font-family:"Oswald",sans-serif;font-size:1.15rem;font-weight:600;color:#e6edf3;letter-spacing:0.3px;line-height:1.15;}\
.mnp-logo-text em{font-style:normal;display:block;font-size:0.7rem;font-family:"Source Code Pro",monospace;font-weight:400;color:rgba(97,218,251,0.5);margin-top:2px;}\
.mnp-close{width:36px;height:36px;background:rgba(97,218,251,0.07);border:1px solid rgba(97,218,251,0.2);border-radius:8px;color:#8b949e;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.25s ease;flex-shrink:0;}\
.mnp-close:hover{background:rgba(97,218,251,0.15);color:#61dafb;border-color:#61dafb;transform:rotate(90deg);}\
.mnp-status{display:flex;align-items:center;gap:8px;padding:9px 22px;background:rgba(97,218,251,0.03);border-bottom:1px solid rgba(97,218,251,0.06);}\
.mnp-status-dot{width:7px;height:7px;border-radius:50%;background:#00ff88;box-shadow:0 0 8px rgba(0,255,136,0.6);flex-shrink:0;animation:mnpDotPulse 2s ease-in-out infinite;}\
@keyframes mnpDotPulse{0%,100%{box-shadow:0 0 6px rgba(0,255,136,0.5);}50%{box-shadow:0 0 16px rgba(0,255,136,0.95);}}\
.mnp-status-text{font-family:"Source Code Pro",monospace;font-size:0.7rem;color:rgba(97,218,251,0.35);letter-spacing:0.5px;overflow:hidden;white-space:nowrap;}\
.mnp-section{padding:18px 22px 14px;}\
.mnp-label{font-family:"Source Code Pro",monospace;font-size:0.68rem;color:rgba(97,218,251,0.3);text-transform:uppercase;letter-spacing:1.8px;margin-bottom:10px;}\
.mnp-item{display:flex;align-items:center;gap:12px;padding:11px 12px;margin-bottom:4px;border-radius:10px;text-decoration:none;color:#c9d1d9;font-size:0.98rem;transition:all 0.25s ease;position:relative;overflow:hidden;border:1px solid transparent;}\
.mnp-item::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#61dafb;transform:scaleY(0);transform-origin:center;transition:transform 0.25s ease;border-radius:0 2px 2px 0;}\
.mnp-item:hover::before,.mnp-item.current::before{transform:scaleY(1);}\
.mnp-item:hover,.mnp-item.current{color:#e6edf3;background:rgba(97,218,251,0.06);border-color:rgba(97,218,251,0.15);padding-left:18px;}\
.mnp-item i{width:20px;color:#61dafb;font-size:0.9rem;flex-shrink:0;transition:transform 0.25s ease;}\
.mnp-item:hover i{transform:scale(1.2) rotate(-5deg);}\
.mnp-item-tag{margin-left:auto;font-family:"Source Code Pro",monospace;font-size:0.64rem;color:rgba(97,218,251,0.2);flex-shrink:0;transition:color 0.25s ease;}\
.mnp-item:hover .mnp-item-tag,.mnp-item.current .mnp-item-tag{color:rgba(97,218,251,0.45);}\
.mnp-item.c-purple i{color:#c678dd;}.mnp-item.c-purple::before{background:#c678dd;}.mnp-item.c-purple:hover,.mnp-item.c-purple.current{background:rgba(198,120,221,0.06);border-color:rgba(198,120,221,0.18);}\
.mnp-item.c-green i{color:#00d4aa;}.mnp-item.c-green::before{background:#00d4aa;}.mnp-item.c-green:hover,.mnp-item.c-green.current{background:rgba(0,212,170,0.06);border-color:rgba(0,212,170,0.18);}\
.mnp-item.c-yellow i{color:#fbbc05;}.mnp-item.c-yellow::before{background:#fbbc05;}.mnp-item.c-yellow:hover,.mnp-item.c-yellow.current{background:rgba(251,188,5,0.06);border-color:rgba(251,188,5,0.18);}\
.mnp-item.c-red i{color:#f87171;}.mnp-item.c-red::before{background:#f87171;}.mnp-item.c-red:hover,.mnp-item.c-red.current{background:rgba(248,113,113,0.06);border-color:rgba(248,113,113,0.18);}\
.hamburger-btn.mnp-active{background:rgba(97,218,251,0.18)!important;border-color:#61dafb!important;color:#61dafb!important;}\
.mnp-float-btn{position:fixed;top:16px;left:16px;z-index:8999;width:42px;height:42px;border-radius:10px;background:rgba(97,218,251,0.07);border:1px solid rgba(97,218,251,0.2);color:#e2e8f0;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.25s ease;}\
.mnp-float-btn:hover{background:#61dafb;color:#0d1117;border-color:#61dafb;}';

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function currentPage() {
    var p = location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  function buildPanel() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.className = 'mega-nav-overlay';
    overlay.id = 'mega-nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    var here = currentPage();
    var items = PAGES.map(function (p) {
      var cls = 'mnp-item' + (p.cls ? ' ' + p.cls : '') + (p.href === here ? ' current' : '');
      var accent = p.accent ? ' style="--mnp-accent:' + p.accent + ';"' : '';
      var cur = p.href === here ? ' aria-current="page"' : '';
      return '<a href="' + p.href + '" class="' + cls + '"' + accent + cur + '>' +
             '<i class="fas ' + p.icon + '"></i>' +
             '<span>' + esc(p.label) + '</span>' +
             '<span class="mnp-item-tag">' + esc(p.tag) + '</span></a>';
    }).join('');

    var panel = document.createElement('div');
    panel.className = 'mega-nav-panel';
    panel.id = 'mega-nav-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Menú principal');
    panel.innerHTML =
      '<div class="mnp-inner">' +
        '<div class="mnp-header">' +
          '<a href="index.html" class="mnp-logo">' +
            '<img src="images/mifoto.jpg" alt="Antonio Soria" class="mnp-logo-photo">' +
            '<span class="mnp-logo-text">Antonio Soria<em>matemático &amp; dev</em></span>' +
          '</a>' +
          '<button class="mnp-close" id="mnp-close" aria-label="Cerrar menú"><i class="fas fa-times"></i></button>' +
        '</div>' +
        '<div class="mnp-status">' +
          '<span class="mnp-status-dot"></span>' +
          '<span class="mnp-status-text">~/antonio-soria $&nbsp;<span id="mnp-cursor">_</span></span>' +
        '</div>' +
        '<div class="mnp-section">' +
          '<div class="mnp-label">// páginas del sitio</div>' + items +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    return { overlay: overlay, panel: panel };
  }

  function getButton() {
    var oldBtn = document.getElementById('hamburger-btn');
    if (oldBtn) {
      // Clonar elimina los listeners del menú móvil legado (page-init.js)
      var btn = oldBtn.cloneNode(true);
      oldBtn.parentNode.replaceChild(btn, oldBtn);
      return btn;
    }
    // Página sin header (404): botón flotante propio
    var fab = document.createElement('button');
    fab.className = 'mnp-float-btn';
    fab.setAttribute('aria-label', 'Menú');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(fab);
    return fab;
  }

  function init() {
    var ui = buildPanel();
    var overlay = ui.overlay, panel = ui.panel;
    var hamburger = getButton();
    var closeBtn = panel.querySelector('#mnp-close');

    function openPanel() {
      var legacy = document.getElementById('mobile-nav');
      if (legacy) legacy.classList.remove('open');
      overlay.classList.add('open');
      panel.classList.add('open');
      hamburger.classList.add('mnp-active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      // Entrada escalonada de los items
      var items = panel.querySelectorAll('.mnp-item');
      items.forEach(function (item, i) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-24px)';
        item.style.transition = 'none';
        requestAnimationFrame(function () {
          setTimeout(function () {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease, background 0.25s ease, border-color 0.25s ease, color 0.25s ease, padding 0.25s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, 60 + i * 38);
        });
      });
    }

    function closePanel() {
      overlay.classList.remove('open');
      panel.classList.remove('open');
      hamburger.classList.remove('mnp-active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.querySelectorAll('.bar').forEach(function (b) {
        b.style.transform = ''; b.style.opacity = '';
      });
    }

    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.contains('open') ? closePanel() : openPanel();
    });
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });

    // Cursor parpadeante de la barra de estado
    var cursor = document.getElementById('mnp-cursor');
    if (cursor) {
      setInterval(function () {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
      }, 550);
    }
  }

  // Correr DESPUÉS de los DOMContentLoaded de page-init.js/main.js,
  // para que el clon del hamburger elimine sus listeners.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });
  } else {
    setTimeout(init, 0);
  }
})();
