/**
 * algos.js — Visualizador interactivo de BFS, DFS y A* (algoritmos.html)
 *
 * Define las funciones globales que invocan los onclick del HTML:
 *   selAlgo('BFS'|'DFS'|'ASTAR'), play(), pause(), stepBack(), stepFwd(),
 *   reset(), toggleMode('start'|'end').
 *
 * Modelo: un grafo fijo de 14 nodos (A–N) con coordenadas normalizadas.
 * Cada algoritmo se "graba" en una lista de frames (instantáneas del estado)
 * que luego se reproducen con los controles de playback. Render en <canvas>.
 *
 * Es un script clásico (no módulo): las function declarations de nivel
 * superior quedan en el ámbito global para que los onclick las encuentren.
 */
(function () {
  'use strict';

  /* ============================================================
     PALETA  (coherente con el CSS de la página)
  ============================================================ */
  var C = {
    cyan:   '#61dafb',
    purple: '#c678dd',
    green:  '#00ff88',
    red:    '#f87171',
    yellow: '#fbbc05',
    white:  '#ffffff',
    edge:   'rgba(97,218,251,0.16)',
    edgeHl: '#c678dd',
    base:   'rgba(230,237,243,0.06)',
    text:   '#e6edf3',
  };

  /* ============================================================
     GRAFO  (posiciones normalizadas 0..1, aristas no dirigidas)
  ============================================================ */
  var POS = {
    A: [0.07, 0.50], B: [0.21, 0.24], C: [0.21, 0.78], D: [0.35, 0.50],
    E: [0.35, 0.10], F: [0.50, 0.30], G: [0.50, 0.70], H: [0.49, 0.94],
    I: [0.64, 0.16], J: [0.64, 0.56], K: [0.79, 0.34], L: [0.79, 0.80],
    M: [0.91, 0.60], N: [0.93, 0.30],
  };

  var EDGES = [
    ['A','B'], ['A','C'], ['B','D'], ['B','E'], ['C','D'], ['C','G'], ['C','H'],
    ['D','F'], ['D','G'], ['E','F'], ['E','I'], ['F','I'], ['F','J'], ['G','J'],
    ['G','H'], ['H','L'], ['I','K'], ['I','N'], ['J','K'], ['J','L'], ['J','M'],
    ['K','N'], ['K','M'], ['L','M'], ['M','N'],
  ];

  var NODES = Object.keys(POS);

  // Lista de adyacencia (ordenada para un recorrido determinista)
  var ADJ = {};
  NODES.forEach(function (n) { ADJ[n] = []; });
  EDGES.forEach(function (e) {
    ADJ[e[0]].push(e[1]);
    ADJ[e[1]].push(e[0]);
  });
  NODES.forEach(function (n) { ADJ[n].sort(); });

  function dist(a, b) {
    var dx = POS[a][0] - POS[b][0];
    var dy = POS[a][1] - POS[b][1];
    return Math.sqrt(dx * dx + dy * dy);
  }
  // Coste de arista y heurística comparten unidades (distancia normalizada).
  function weight(a, b) { return dist(a, b); }

  /* ============================================================
     ESTADO
  ============================================================ */
  var algo = 'BFS';
  var startNode = 'A';
  var endNode = 'N';
  var frames = [];
  var idx = 0;
  var playing = false;
  var timer = null;
  var selectMode = null; // 'start' | 'end' | null

  var canvas, ctx, wrap;
  var PAD = 42;          // margen interno del canvas (px CSS)
  var R = 16;            // radio de nodo (px CSS)
  var W = 0, H = 0;      // tamaño en px CSS

  /* ============================================================
     CONSTRUCCIÓN DE FRAMES
     Cada frame: { current, visited[], frontier[], path[], desc, struct, stats }
  ============================================================ */
  function snapshot(s) {
    return {
      current:  s.current || null,
      visited:  (s.visited || []).slice(),
      frontier: (s.frontier || []).slice(),
      path:     (s.path || []).slice(),
      desc:     s.desc || '',
      struct:   s.struct || '',
      stats: {
        step: s.step || 0,
        vis:  (s.visited || []).length,
        q:    (s.frontier || []).length,
      },
    };
  }

  function reconstruct(cameFrom, end) {
    var path = [end], cur = end;
    while (cameFrom[cur] !== undefined && cameFrom[cur] !== null) {
      cur = cameFrom[cur];
      path.unshift(cur);
    }
    return path;
  }

  function fmt(n) { return n.toFixed(2); }

  // Frames de cierre comunes: revela el camino nodo a nodo.
  function appendPathFrames(out, base, path, costLabel) {
    for (var i = 1; i <= path.length; i++) {
      var partial = path.slice(0, i);
      out.push(snapshot({
        current: path[i - 1],
        visited: base.visited,
        frontier: [],
        path: partial,
        step: base.step,
        desc: i < path.length
          ? 'Reconstruyendo el camino…'
          : 'Camino ' + (algo === 'ASTAR' ? 'óptimo' : 'encontrado') +
            ': ' + path.join(' → ') + '  ·  ' + costLabel,
        struct: 'camino: [ ' + partial.join(', ') + ' ]',
      }));
    }
  }

  function buildBFS() {
    var out = [];
    var visited = [];
    var queue = [startNode];
    var inQ = {}; inQ[startNode] = true;
    var cameFrom = {}; cameFrom[startNode] = null;
    var step = 0;

    out.push(snapshot({
      frontier: queue, step: step,
      desc: 'Inicio. Encolamos el nodo ' + startNode + '.',
      struct: 'cola: [ ' + queue.join(', ') + ' ]',
    }));

    while (queue.length) {
      var cur = queue.shift();
      visited.push(cur);
      step++;
      var added = [];
      ADJ[cur].forEach(function (nb) {
        if (!inQ[nb] && visited.indexOf(nb) === -1) {
          inQ[nb] = true;
          cameFrom[nb] = cur;
          queue.push(nb);
          added.push(nb);
        }
      });
      out.push(snapshot({
        current: cur, visited: visited, frontier: queue, step: step,
        desc: cur === endNode
          ? '¡Llegamos a ' + endNode + '! Reconstruyendo camino…'
          : 'Visitamos ' + cur + '. ' +
            (added.length ? 'Encolamos ' + added.join(', ') + '.' : 'Sin vecinos nuevos.'),
        struct: 'cola: [ ' + queue.join(', ') + ' ]',
      }));
      if (cur === endNode) {
        var path = reconstruct(cameFrom, endNode);
        appendPathFrames(out, { visited: visited, step: step }, path,
          'longitud ' + (path.length - 1) + ' aristas');
        return out;
      }
    }
    out.push(snapshot({ visited: visited, step: step,
      desc: 'No existe camino de ' + startNode + ' a ' + endNode + '.' }));
    return out;
  }

  function buildDFS() {
    var out = [];
    var visited = [];
    var stack = [startNode];
    var cameFrom = {}; cameFrom[startNode] = null;
    var step = 0;

    out.push(snapshot({
      frontier: stack, step: step,
      desc: 'Inicio. Apilamos el nodo ' + startNode + '.',
      struct: 'pila: [ ' + stack.join(', ') + ' ]',
    }));

    while (stack.length) {
      var cur = stack.pop();
      if (visited.indexOf(cur) !== -1) continue;
      visited.push(cur);
      step++;
      var added = [];
      // Apilamos en orden inverso para explorar A,B,C… de forma natural.
      ADJ[cur].slice().reverse().forEach(function (nb) {
        if (visited.indexOf(nb) === -1) {
          if (cameFrom[nb] === undefined) cameFrom[nb] = cur;
          stack.push(nb);
          added.push(nb);
        }
      });
      out.push(snapshot({
        current: cur, visited: visited, frontier: stack, step: step,
        desc: cur === endNode
          ? '¡Alcanzamos ' + endNode + '! Reconstruyendo camino…'
          : 'Visitamos ' + cur + '. ' +
            (added.length ? 'Apilamos ' + added.join(', ') + '.' : 'Sin vecinos nuevos.'),
        struct: 'pila: [ ' + stack.join(', ') + ' ]',
      }));
      if (cur === endNode) {
        var path = reconstruct(cameFrom, endNode);
        appendPathFrames(out, { visited: visited, step: step }, path,
          'longitud ' + (path.length - 1) + ' aristas (no garantiza el más corto)');
        return out;
      }
    }
    out.push(snapshot({ visited: visited, step: step,
      desc: 'No existe camino de ' + startNode + ' a ' + endNode + '.' }));
    return out;
  }

  function buildAStar() {
    var out = [];
    var visited = [];
    var open = [startNode];
    var g = {}; g[startNode] = 0;
    var cameFrom = {}; cameFrom[startNode] = null;
    var step = 0;

    function h(n) { return dist(n, endNode); }
    function f(n) { return (g[n] === undefined ? Infinity : g[n]) + h(n); }
    function structStr() {
      var s = open.slice().sort(function (a, b) { return f(a) - f(b); });
      return 'abierto: [ ' + s.map(function (n) { return n + '(' + fmt(f(n)) + ')'; }).join(', ') + ' ]';
    }

    out.push(snapshot({
      frontier: open, step: step,
      desc: 'Inicio. f(' + startNode + ') = g + h = 0 + ' + fmt(h(startNode)) + '.',
      struct: structStr(),
    }));

    while (open.length) {
      // Extraemos el nodo abierto con menor f.
      var best = open[0];
      open.forEach(function (n) { if (f(n) < f(best)) best = n; });
      open.splice(open.indexOf(best), 1);
      var cur = best;
      visited.push(cur);
      step++;

      if (cur === endNode) {
        out.push(snapshot({
          current: cur, visited: visited, frontier: open, step: step,
          desc: '¡Llegamos a ' + endNode + ' con f = ' + fmt(f(cur)) + '! Reconstruyendo…',
          struct: structStr(),
        }));
        var path = reconstruct(cameFrom, endNode);
        appendPathFrames(out, { visited: visited, step: step }, path,
          'coste total g = ' + fmt(g[endNode]));
        return out;
      }

      var relaxed = [];
      ADJ[cur].forEach(function (nb) {
        if (visited.indexOf(nb) !== -1) return;
        var tentative = g[cur] + weight(cur, nb);
        if (g[nb] === undefined || tentative < g[nb]) {
          cameFrom[nb] = cur;
          g[nb] = tentative;
          if (open.indexOf(nb) === -1) open.push(nb);
          relaxed.push(nb);
        }
      });
      out.push(snapshot({
        current: cur, visited: visited, frontier: open, step: step,
        desc: 'Expandimos ' + cur + ' (f = ' + fmt(f(cur)) + '). ' +
          (relaxed.length ? 'Actualizamos ' + relaxed.join(', ') + '.' : 'Sin mejoras.'),
        struct: structStr(),
      }));
    }
    out.push(snapshot({ visited: visited, step: step,
      desc: 'No existe camino de ' + startNode + ' a ' + endNode + '.' }));
    return out;
  }

  function buildFrames() {
    if (algo === 'DFS') frames = buildDFS();
    else if (algo === 'ASTAR') frames = buildAStar();
    else frames = buildBFS();
    idx = 0;
  }

  /* ============================================================
     RENDER
  ============================================================ */
  function px(n) { return [PAD + POS[n][0] * (W - 2 * PAD), PAD + POS[n][1] * (H - 2 * PAD)]; }

  function colorFor(n, fr) {
    if (n === startNode) return C.green;
    if (n === endNode)   return C.red;
    if (fr.path.indexOf(n) !== -1)     return C.purple;
    if (n === fr.current)              return C.white;
    if (fr.frontier.indexOf(n) !== -1) return C.yellow;
    if (fr.visited.indexOf(n) !== -1)  return C.cyan;
    return null;
  }

  function rgba(hex, a) {
    var v = hex.replace('#', '');
    if (v.length === 3) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2];
    var r = parseInt(v.slice(0, 2), 16),
        g = parseInt(v.slice(2, 4), 16),
        b = parseInt(v.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function draw() {
    if (!ctx) return;
    var fr = frames[idx] || snapshot({});
    ctx.clearRect(0, 0, W, H);

    // Aristas
    EDGES.forEach(function (e) {
      var a = px(e[0]), b = px(e[1]);
      var onPath = fr.path.indexOf(e[0]) !== -1 && fr.path.indexOf(e[1]) !== -1 &&
                   Math.abs(fr.path.indexOf(e[0]) - fr.path.indexOf(e[1])) === 1;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.strokeStyle = onPath ? C.edgeHl : C.edge;
      ctx.lineWidth = onPath ? 3 : 1.4;
      ctx.stroke();
    });

    // Nodos
    NODES.forEach(function (n) {
      var p = px(n);
      var col = colorFor(n, fr);
      var isCurrent = n === fr.current;

      if (isCurrent) { ctx.shadowColor = col || C.white; ctx.shadowBlur = 18; }
      ctx.beginPath();
      ctx.arc(p[0], p[1], R, 0, Math.PI * 2);
      ctx.fillStyle = col ? rgba(col, 0.18) : C.base;
      ctx.fill();
      ctx.lineWidth = col ? 2.5 : 1.2;
      ctx.strokeStyle = col || 'rgba(230,237,243,0.18)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = col || C.text;
      ctx.font = '600 13px "Source Code Pro", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n, p[0], p[1]);
    });
  }

  /* ============================================================
     UI / PANELES
  ============================================================ */
  function $(id) { return document.getElementById(id); }

  function refreshUI() {
    var fr = frames[idx] || snapshot({});
    if ($('step-desc')) $('step-desc').textContent = fr.desc;
    if ($('stat-step')) $('stat-step').textContent = fr.stats.step;
    if ($('stat-vis'))  $('stat-vis').textContent  = fr.stats.vis;
    if ($('stat-q'))    $('stat-q').textContent    = fr.stats.q;
    if ($('struct-line')) $('struct-line').textContent = fr.struct;
    if ($('frame-fill')) {
      var pct = frames.length > 1 ? (idx / (frames.length - 1)) * 100 : 0;
      $('frame-fill').style.width = pct + '%';
    }
    // Botones
    var atEnd = idx >= frames.length - 1;
    if ($('btn-play'))  $('btn-play').disabled  = playing || atEnd;
    if ($('btn-pause')) $('btn-pause').disabled = !playing;
    if ($('btn-prev'))  $('btn-prev').disabled  = idx <= 0;
    if ($('btn-next'))  $('btn-next').disabled  = atEnd;
    if ($('lbl-start')) $('lbl-start').textContent = startNode;
    if ($('lbl-end'))   $('lbl-end').textContent   = endNode;
  }

  function render() { draw(); refreshUI(); }

  /* ============================================================
     PLAYBACK
  ============================================================ */
  function speedMs() {
    var s = parseInt(($('speed-slider') || {}).value || '5', 10);
    return 780 - s * 66; // s=1 -> 714ms, s=10 -> 120ms
  }

  function clearTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function startTimer() {
    clearTimer();
    timer = setInterval(function () {
      if (idx >= frames.length - 1) { window.pause(); return; }
      idx++;
      render();
    }, speedMs());
  }

  /* ============================================================
     FUNCIONES GLOBALES  (las invocan los onclick del HTML)
  ============================================================ */
  window.play = function () {
    if (!frames.length) buildFrames();
    if (idx >= frames.length - 1) idx = 0; // reiniciar si terminó
    playing = true;
    startTimer();
    render();
  };

  window.pause = function () {
    playing = false;
    clearTimer();
    render();
  };

  window.stepFwd = function () {
    window.pause();
    if (idx < frames.length - 1) { idx++; render(); }
  };

  window.stepBack = function () {
    window.pause();
    if (idx > 0) { idx--; render(); }
  };

  window.reset = function () {
    window.pause();
    buildFrames();
    render();
  };

  window.selAlgo = function (a) {
    algo = a;
    window.pause();
    ['BFS', 'DFS', 'ASTAR'].forEach(function (k) {
      var tab = $('tab-' + k);
      if (!tab) return;
      tab.classList.remove('active', 'act-dfs', 'act-astar');
      if (k === a) {
        tab.classList.add(a === 'DFS' ? 'act-dfs' : a === 'ASTAR' ? 'act-astar' : 'active');
      }
    });
    buildFrames();
    render();
  };

  window.toggleMode = function (mode) {
    selectMode = (selectMode === mode) ? null : mode;
    var badge = $('mode-badge');
    if ($('btn-start')) $('btn-start').classList.toggle('sel', selectMode === 'start');
    if ($('btn-end'))   $('btn-end').classList.toggle('sel', selectMode === 'end');
    if (badge) {
      if (selectMode) {
        badge.textContent = selectMode === 'start'
          ? 'Haz clic en un nodo para fijar el INICIO…'
          : 'Haz clic en un nodo para fijar el FIN…';
        badge.classList.add('show');
      } else {
        badge.classList.remove('show');
      }
    }
  };

  /* ============================================================
     INTERACCIÓN CON EL CANVAS
  ============================================================ */
  function onCanvasClick(e) {
    if (!selectMode) return;
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    var hit = null;
    NODES.forEach(function (n) {
      var p = px(n);
      if (Math.hypot(p[0] - x, p[1] - y) <= R + 4) hit = n;
    });
    if (!hit) return;
    if (selectMode === 'start') {
      if (hit === endNode) return;
      startNode = hit;
    } else {
      if (hit === startNode) return;
      endNode = hit;
    }
    window.toggleMode(selectMode); // cierra el modo selección
    buildFrames();
    render();
  }

  /* ============================================================
     RESIZE  (alta densidad de píxeles)
  ============================================================ */
  function resize() {
    if (!canvas || !wrap) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = wrap.clientWidth;
    H = Math.max(340, Math.min(W * 0.52, 470));
    canvas.style.height = H + 'px';
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  /* ============================================================
     BOOTSTRAP
  ============================================================ */
  function init() {
    canvas = $('algo-canvas');
    wrap = $('canvas-wrap');
    if (!canvas || !wrap) return;
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize, { passive: true });
    canvas.addEventListener('click', onCanvasClick);

    // Slider de velocidad: si está reproduciendo, reinicia el intervalo.
    var slider = $('speed-slider');
    if (slider) slider.addEventListener('input', function () { if (playing) startTimer(); });

    // ↑/→ avanza paso, ↓/← retrocede (si no estás escribiendo).
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); window.stepFwd(); }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') { e.preventDefault(); window.stepBack(); }
    });

    buildFrames();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
