/**
 * fractals.js — Explorador de fractales (algoritmos.html#fractales)
 *
 * Seis fractales clásicos dibujados en canvas 2D, sin librerías:
 *   · Mandelbrot   escape-time con coloreado suave; clic = zoom ×2.5,
 *                  shift+clic = alejar. Se dibuja por franjas en rAF
 *                  para no congelar el hilo principal.
 *   · Julia        mismo motor; el slider gira c = 0.7885·e^{iθ}
 *   · Koch         copo de nieve por recursión de segmentos
 *   · Sierpiński   triángulos recursivos
 *   · Helecho      IFS de Barnsley, puntos progresivos
 *   · Árbol        bifurcación recursiva; el slider abre el ángulo
 *
 * Respeta prefers-reduced-motion: sin dibujo progresivo, todo se
 * pinta de golpe. Reutiliza los estilos .genart-* de shared.css.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('fractal-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var paramEl = document.getElementById('fr-param');
  var resetEl = document.getElementById('fr-reset');
  var statEl = document.getElementById('fr-stat');
  var formulaEl = document.getElementById('fractal-formula');
  var infoEl = document.getElementById('fractal-info');
  var btns = document.querySelectorAll('#fractales .genart-btn');

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 960, H = 600;
  canvas.width = W;
  canvas.height = H;

  var current = 'mandelbrot';
  var param = 0.5;         // slider 0..1
  var job = 0;             // id de trabajo: invalida renders en curso

  /* Paleta del sitio: cian → púrpura sobre fondo oscuro */
  var BG = '#0a0e14';
  function siteColor(t, a) {
    // t en [0,1]: 0 = cian (#61dafb), 1 = púrpura (#c678dd)
    var r = Math.round(97 + (198 - 97) * t);
    var g = Math.round(218 + (120 - 218) * t);
    var b = Math.round(251 + (221 - 251) * t);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + (a == null ? 1 : a) + ')';
  }

  function clear() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
  }

  /* ══════════════ escape-time (Mandelbrot / Julia) ══════════════ */

  var mView = { cx: -0.6, cy: 0, scale: 3.2 };   // vista Mandelbrot
  var jView = { cx: 0,    cy: 0, scale: 3.4 };   // vista Julia

  function view() { return current === 'mandelbrot' ? mView : jView; }

  function escapeTimeRender() {
    var myJob = ++job;
    var v = view();
    var isM = (current === 'mandelbrot');
    var maxIt = isM ? Math.round(60 + param * 340)          // 60..400
                    : 250;
    var theta = param * Math.PI * 2;
    var jcr = 0.7885 * Math.cos(theta), jci = 0.7885 * Math.sin(theta);

    var img = ctx.createImageData(W, 1);
    var data = img.data;
    var y = 0;
    var ROWS = REDUCED ? H : 24;  // franjas por frame

    updateStat(maxIt);

    function renderRows() {
      if (myJob !== job) return;  // se cambió de pieza / vista
      var stop = Math.min(y + ROWS, H);
      for (; y < stop; y++) {
        var ci = v.cy + (y - H / 2) * v.scale / W;
        for (var x = 0; x < W; x++) {
          var cr = v.cx + (x - W / 2) * v.scale / W;
          var zr, zi, kr, ki;
          if (isM) { zr = 0; zi = 0; kr = cr; ki = ci; }
          else     { zr = cr; zi = ci; kr = jcr; ki = jci; }
          var n = 0, zr2 = zr * zr, zi2 = zi * zi;
          while (n < maxIt && zr2 + zi2 <= 4) {
            zi = 2 * zr * zi + ki;
            zr = zr2 - zi2 + kr;
            zr2 = zr * zr; zi2 = zi * zi;
            n++;
          }
          var o = x * 4;
          if (n === maxIt) {           // interior: fondo
            data[o] = 10; data[o + 1] = 14; data[o + 2] = 20;
          } else {
            // coloreado suave: n + 1 − log2(log|z|)
            var s = n + 1 - Math.log(Math.log(zr2 + zi2) / 2) / Math.LN2;
            var t = s / maxIt;
            var u = Math.pow(Math.min(1, Math.max(0, t)), 0.45);
            data[o]     = Math.round(10 + (97 + 101 * u) * u);
            data[o + 1] = Math.round(14 + (218 - 98 * u) * u);
            data[o + 2] = Math.round(20 + (251 - 30 * u) * u);
          }
          data[o + 3] = 255;
        }
        ctx.putImageData(img, 0, y);
      }
      if (y < H) requestAnimationFrame(renderRows);
    }
    renderRows();
  }

  function updateStat(iters) {
    var v = view();
    var zoom = (current === 'mandelbrot' ? 3.2 : 3.4) / v.scale;
    statEl.textContent = 'zoom ×' + (zoom >= 100 ? Math.round(zoom) : zoom.toFixed(1)) +
                         ' · ' + iters + ' iteraciones · clic: acercar · shift+clic: alejar';
  }

  canvas.addEventListener('click', function (e) {
    if (current !== 'mandelbrot' && current !== 'julia') return;
    var r = canvas.getBoundingClientRect();
    var px = (e.clientX - r.left) * (W / r.width);
    var py = (e.clientY - r.top) * (H / r.height);
    var v = view();
    v.cx += (px - W / 2) * v.scale / W;
    v.cy += (py - H / 2) * v.scale / W;
    v.scale *= e.shiftKey ? 2.5 : 1 / 2.5;
    escapeTimeRender();
  });

  /* ══════════════ Copo de Koch ══════════════ */

  function koch() {
    ++job;
    clear();
    var depth = Math.round(param * 6);              // 0..6
    var size = Math.min(W, H) * 0.86;
    var h = size * Math.sqrt(3) / 2;
    var cx = W / 2, cy = H / 2 + h / 6;
    var p1 = [cx - size / 2, cy - h / 3 + h / 2];
    var p2 = [cx + size / 2, cy - h / 3 + h / 2];
    var p3 = [cx, cy - h * 2 / 3 + h / 2 - h];

    ctx.strokeStyle = siteColor(0.25);
    ctx.lineWidth = depth > 4 ? 0.8 : 1.4;
    ctx.shadowColor = 'rgba(97,218,251,0.5)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    segment(p3, p2, depth);
    segment(p2, p1, depth);
    segment(p1, p3, depth);
    ctx.stroke();
    ctx.shadowBlur = 0;

    statEl.textContent = 'profundidad ' + depth + ' · ' + (3 * Math.pow(4, depth)) + ' segmentos · dimensión log4/log3 ≈ 1.2619';

    function segment(a, b, d) {
      if (d === 0) {
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        return;
      }
      var dx = (b[0] - a[0]) / 3, dy = (b[1] - a[1]) / 3;
      var pA = [a[0] + dx, a[1] + dy];
      var pB = [a[0] + 2 * dx, a[1] + 2 * dy];
      // vértice del "pico" (rotación −60° del tercio central)
      var px = pA[0] + dx * 0.5 + dy * Math.sqrt(3) / 2;
      var py = pA[1] + dy * 0.5 - dx * Math.sqrt(3) / 2;
      segment(a, pA, d - 1);
      segment(pA, [px, py], d - 1);
      segment([px, py], pB, d - 1);
      segment(pB, b, d - 1);
    }
  }

  /* ══════════════ Triángulo de Sierpiński ══════════════ */

  function sierpinski() {
    ++job;
    clear();
    var depth = Math.round(1 + param * 7);           // 1..8
    var size = Math.min(W, H) * 0.92;
    var h = size * Math.sqrt(3) / 2;
    var x0 = W / 2 - size / 2, y0 = H / 2 + h / 2;

    tri([x0, y0], [x0 + size, y0], [W / 2, y0 - h], depth);
    statEl.textContent = 'profundidad ' + depth + ' · ' + Math.pow(3, depth) + ' triángulos · dimensión log3/log2 ≈ 1.585';

    function tri(a, b, c, d) {
      if (d === 0) {
        var t = (a[1] - (H / 2 - h / 2)) / h;        // color por altura
        ctx.fillStyle = siteColor(1 - t, 0.9);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]);
        ctx.closePath();
        ctx.fill();
        return;
      }
      var ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      var bc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
      var ca = [(c[0] + a[0]) / 2, (c[1] + a[1]) / 2];
      tri(a, ab, ca, d - 1);
      tri(ab, b, bc, d - 1);
      tri(ca, bc, c, d - 1);
    }
  }

  /* ══════════════ Helecho de Barnsley (IFS) ══════════════ */

  function fern() {
    var myJob = ++job;
    clear();
    var total = Math.round(20000 + param * 160000);  // 20k..180k puntos
    var x = 0, y = 0, drawn = 0;
    var PER_FRAME = REDUCED ? total : 5000;
    var scale = H / 10.6;

    statEl.textContent = total.toLocaleString('es-MX') + ' puntos · 4 transformaciones afines (IFS)';

    function step() {
      if (myJob !== job) return;
      ctx.fillStyle = siteColor(0.15, 0.65);
      var stop = Math.min(drawn + PER_FRAME, total);
      for (; drawn < stop; drawn++) {
        var r = Math.random(), nx, ny;
        if (r < 0.01)      { nx = 0;                       ny = 0.16 * y; }
        else if (r < 0.86) { nx = 0.85 * x + 0.04 * y;     ny = -0.04 * x + 0.85 * y + 1.6; }
        else if (r < 0.93) { nx = 0.20 * x - 0.26 * y;     ny = 0.23 * x + 0.22 * y + 1.6; }
        else               { nx = -0.15 * x + 0.28 * y;    ny = 0.26 * x + 0.24 * y + 0.44; }
        x = nx; y = ny;
        ctx.fillRect(W / 2 + x * scale, H - 20 - y * scale, 1, 1);
      }
      if (drawn < total) requestAnimationFrame(step);
    }
    step();
  }

  /* ══════════════ Árbol recursivo ══════════════ */

  function tree() {
    ++job;
    clear();
    var angle = (10 + param * 62) * Math.PI / 180;   // 10°..72°
    var depth = 11;
    var trunk = H * 0.26;

    branch(W / 2, H - 16, -Math.PI / 2, trunk, depth);
    statEl.textContent = 'ángulo ' + Math.round(angle * 180 / Math.PI) + '° · profundidad ' + depth + ' · ' + (Math.pow(2, depth + 1) - 1) + ' ramas';

    function branch(x, y, a, len, d) {
      if (d === 0 || len < 1.5) return;
      var nx = x + Math.cos(a) * len;
      var ny = y + Math.sin(a) * len;
      var t = 1 - d / depth;
      ctx.strokeStyle = siteColor(t, 0.55 + 0.45 * (d / depth));
      ctx.lineWidth = Math.max(0.6, d * 0.85);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      branch(nx, ny, a - angle, len * 0.72, d - 1);
      branch(nx, ny, a + angle, len * 0.72, d - 1);
    }
  }

  /* ══════════════ metadatos por pieza ══════════════ */

  var PIECES = {
    mandelbrot: {
      draw: escapeTimeRender,
      formula: 'z ← z² + c   (c recorre el plano; el conjunto: donde z no escapa)',
      info: 'El objeto más famoso de la matemática visual (Mandelbrot, 1980). Cada pixel es un número complejo c: se itera z←z²+c y se colorea según cuántos pasos tarda en escapar. La frontera tiene detalle infinito — haz clic para comprobarlo. El slider sube las iteraciones (más detalle en zooms profundos).'
    },
    julia: {
      draw: escapeTimeRender,
      formula: 'z ← z² + c   (c fijo: 0.7885·e^{iθ} — el slider gira θ)',
      info: 'La misma iteración que Mandelbrot pero con c fijo: cada valor de c produce un conjunto de Julia distinto. Mueve el slider para recorrer c por un círculo y ver la familia completa transformarse — conectados dentro del conjunto de Mandelbrot, polvo de Cantor fuera. También acepta zoom con clic.'
    },
    koch: {
      draw: koch,
      formula: 'segmento → 4 segmentos de ⅓   ·   D = log 4 / log 3 ≈ 1.2619',
      info: 'Helge von Koch (1904) lo propuso como curva continua sin tangente en ningún punto. Cada iteración reemplaza el tercio central de cada segmento por un pico triangular: el perímetro crece ×4/3 cada vez (¡diverge a infinito!) mientras el área permanece finita. El slider controla la profundidad de recursión.'
    },
    sierpinski: {
      draw: sierpinski,
      formula: 'triángulo → 3 copias de ½   ·   D = log 3 / log 2 ≈ 1.585',
      info: 'Wacław Sierpiński (1915). Divide un triángulo en 4 y elimina el central, para siempre. Aparece por sorpresa en el triángulo de Pascal módulo 2, en autómatas celulares (regla 90) y hasta en el juego del caos. Su área tiende a cero; su dimensión queda entre la línea y el plano.'
    },
    fern: {
      draw: fern,
      formula: '4 transformaciones afines aplicadas al azar (IFS)',
      info: 'Michael Barnsley (1988) demostró que una imagen tan orgánica como un helecho se comprime en 4 transformaciones lineales con probabilidades. Se itera un punto al azar millones de veces y el "atractor" emerge solo. Es la idea detrás de la compresión fractal de imágenes. El slider añade puntos.'
    },
    tree: {
      draw: tree,
      formula: 'rama → 2 ramas de 0.72·largo, giradas ±θ',
      info: 'El fractal más intuitivo: cada rama engendra dos ramas más cortas. Con θ pequeño parece un ciprés; cerca de 60° se abre en corales. Las plantas reales usan variantes de esta recursión (sistemas-L de Lindenmayer). El slider controla el ángulo de bifurcación θ.'
    }
  };

  function show(name) {
    current = name;
    btns.forEach(function (b) { b.classList.toggle('active', b.dataset.fractal === name); });
    var p = PIECES[name];
    formulaEl.textContent = p.formula;
    infoEl.textContent = p.info;
    p.draw();
  }

  btns.forEach(function (b) {
    b.addEventListener('click', function () { show(b.dataset.fractal); });
  });

  paramEl.addEventListener('input', function () {
    param = paramEl.value / 100;
    PIECES[current].draw();
  });

  resetEl.addEventListener('click', function () {
    mView.cx = -0.6; mView.cy = 0; mView.scale = 3.2;
    jView.cx = 0;    jView.cy = 0; jView.scale = 3.4;
    PIECES[current].draw();
  });

  /* Primer render cuando la sección entra al viewport (ahorra CPU al cargar) */
  var started = false;
  function start() {
    if (started) return;
    started = true;
    show(current);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { start(); io.disconnect(); }
    }, { rootMargin: '200px' });
    io.observe(canvas);
  } else {
    start();
  }
})();
