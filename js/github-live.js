/**
 * github-live.js — Actividad real de GitHub en el index (#github-live)
 *
 * Consume la API pública de GitHub (sin clave) y pinta:
 *   · último push (repo + hace cuánto)
 *   · repos destacados (estrellas → actividad) con lenguaje y descripción
 *   · barra de lenguajes agregada de todos los repos públicos
 *
 * Robustez:
 *   - Caché en localStorage con TTL de 1 h: recargas y navegación entre
 *     páginas no queman el rate limit (60 req/h sin autenticar).
 *   - Fallo silencioso: sin red o rate-limited y sin caché → el bloque
 *     permanece oculto y la página no se entera.
 */
(function () {
  'use strict';

  const USER = 'PurppleAlien';
  const CACHE_KEY = 'gh-live-v1';
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

  const root = document.getElementById('github-live');
  if (!root) return;

  /* Colores estándar de lenguajes (subset de github/linguist) */
  const LANG_COLORS = {
    Java: '#b07219', C: '#555555', 'C++': '#f34b7d', Python: '#3572A5',
    JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26',
    CSS: '#663399', 'C#': '#178600', ShaderLab: '#222c37', TeX: '#3D6117',
    Shell: '#89e051', Kotlin: '#A97BFF', Go: '#00ADD8', Rust: '#dea584',
  };

  function relTime(iso) {
    const lang = (document.documentElement.lang || 'es').startsWith('en') ? 'en' : 'es';
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
    const diffMs = new Date(iso).getTime() - Date.now();
    const mins = Math.round(diffMs / 60000);
    if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
    const hours = Math.round(mins / 60);
    if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
    const days = Math.round(hours / 24);
    if (Math.abs(days) < 30) return rtf.format(days, 'day');
    const months = Math.round(days / 30);
    if (Math.abs(months) < 12) return rtf.format(months, 'month');
    return rtf.format(Math.round(months / 12), 'year');
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { at, repos } = JSON.parse(raw);
      if (Date.now() - at > CACHE_TTL_MS) return null;
      return repos;
    } catch (e) { return null; }
  }

  function writeCache(repos) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }));
    } catch (e) { /* almacenamiento lleno o bloqueado: da igual, es solo caché */ }
  }

  async function fetchRepos() {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=100`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error('GitHub API ' + res.status);
    const data = await res.json();
    // Solo lo que se pinta: mantiene la caché pequeña
    return data.filter(r => !r.fork).map(r => ({
      name: r.name,
      desc: r.description || '',
      lang: r.language,
      stars: r.stargazers_count,
      url: r.html_url,
      pushed: r.pushed_at,
    }));
  }

  /* ---------- render ---------- */
  function el(tag, cls, text) {
    const d = document.createElement(tag);
    if (cls) d.className = cls;
    if (text !== undefined) d.textContent = text;
    return d;
  }

  function render(repos) {
    if (!repos || !repos.length) return;
    root.innerHTML = '';

    root.appendChild(el('div', 'ghl-label', '// GitHub — actividad en vivo'));

    /* Último push */
    const latest = repos.slice().sort((a, b) => new Date(b.pushed) - new Date(a.pushed))[0];
    const pulse = el('div', 'ghl-pulse');
    pulse.appendChild(el('span', 'ghl-dot'));
    const pulseTxt = el('span', 'ghl-pulse-text');
    pulseTxt.append('último push en ');
    const repoLink = el('a', 'ghl-pulse-repo', latest.name);
    repoLink.href = latest.url; repoLink.target = '_blank'; repoLink.rel = 'noopener';
    pulseTxt.appendChild(repoLink);
    pulseTxt.append(' · ' + relTime(latest.pushed));
    pulse.appendChild(pulseTxt);
    root.appendChild(pulse);

    /* Repos destacados: estrellas primero, actividad como desempate */
    const top = repos.slice().sort((a, b) =>
      (b.stars - a.stars) || (new Date(b.pushed) - new Date(a.pushed))
    ).slice(0, 4);

    const grid = el('div', 'ghl-grid');
    top.forEach(r => {
      const card = el('a', 'ghl-card');
      card.href = r.url; card.target = '_blank'; card.rel = 'noopener';
      const head = el('div', 'ghl-card-head');
      head.appendChild(el('span', 'ghl-name', r.name));
      if (r.stars > 0) head.appendChild(el('span', 'ghl-stars', '★ ' + r.stars));
      card.appendChild(head);
      if (r.desc) card.appendChild(el('p', 'ghl-desc', r.desc));
      const foot = el('div', 'ghl-card-foot');
      if (r.lang) {
        const langWrap = el('span', 'ghl-lang');
        const dot = el('span', 'ghl-lang-dot');
        dot.style.background = LANG_COLORS[r.lang] || '#61dafb';
        langWrap.appendChild(dot);
        langWrap.append(r.lang);
        foot.appendChild(langWrap);
      }
      foot.appendChild(el('span', 'ghl-updated', relTime(r.pushed)));
      card.appendChild(foot);
      grid.appendChild(card);
    });
    root.appendChild(grid);

    /* Barra de lenguajes agregada (por nº de repos) */
    const counts = {};
    repos.forEach(r => { if (r.lang) counts[r.lang] = (counts[r.lang] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const total = entries.reduce((s, [, n]) => s + n, 0);
    if (total > 0) {
      const bar = el('div', 'ghl-bar');
      const legend = el('div', 'ghl-legend');
      entries.forEach(([lang, n]) => {
        const pct = (n / total) * 100;
        const seg = el('span', 'ghl-seg');
        seg.style.width = pct + '%';
        seg.style.background = LANG_COLORS[lang] || '#61dafb';
        seg.title = `${lang} ${pct.toFixed(0)}%`;
        bar.appendChild(seg);
        const li = el('span', 'ghl-legend-item');
        const dot = el('span', 'ghl-lang-dot');
        dot.style.background = LANG_COLORS[lang] || '#61dafb';
        li.appendChild(dot);
        li.append(`${lang} ${pct.toFixed(0)}%`);
        legend.appendChild(li);
      });
      root.appendChild(bar);
      root.appendChild(legend);
    }

    /* Pie: datos en vivo */
    const foot = el('p', 'ghl-foot');
    foot.append('datos en vivo de ');
    const a = el('a', null, 'api.github.com');
    a.href = `https://github.com/${USER}?tab=repositories`;
    a.target = '_blank'; a.rel = 'noopener';
    foot.appendChild(a);
    root.appendChild(foot);

    root.hidden = false;
  }

  /* ---------- bootstrap ---------- */
  const cached = readCache();
  if (cached) {
    render(cached);
  } else {
    fetchRepos()
      .then(repos => { writeCache(repos); render(repos); })
      .catch(() => { /* sin red / rate limit: el bloque queda oculto */ });
  }
})();
