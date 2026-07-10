/**
 * games.js — Sala de juegos con IA adversarial (algoritmos.html#juegos)
 *
 * Ports web (mejorados) de mis juegos en Java del repositorio
 * PurppleAlien/Inteligencia-Artificial:
 *
 *   · Gato       minimax + poda alfa-beta, utilidad 10−d (prefiere ganar antes)
 *   · Conecta 4  negamax + poda alfa-beta + ordenación centro-primero;
 *                en infierno: iterative deepening con presupuesto de tiempo
 *   · Misioneros y Caníbales — puzzle jugable + solución óptima por BFS
 *
 * Dificultades (gato y conecta 4):
 *   novato    la IA se equivoca a propósito (jugadas aleatorias frecuentes)
 *   pesadilla IA fuerte con un resquicio de error
 *   infierno  IA perfecta/profunda: no se le puede ganar
 */
(function () {
  'use strict';

  const root = document.getElementById('juegos');
  if (!root) return;

  /* ================= tabs ================= */
  const tabs = root.querySelectorAll('.game-tab');
  const panels = root.querySelectorAll('.game-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((b) => b.classList.toggle('active', b === tab));
      panels.forEach((p) => p.classList.toggle('active', p.id === 'game-' + tab.dataset.game));
    });
  });

  /* Selector de dificultad genérico */
  function initDiff(groupSel, onChange) {
    const btns = root.querySelectorAll(groupSel + ' .diff-btn');
    btns.forEach((b) => {
      b.addEventListener('click', () => {
        btns.forEach((x) => x.classList.toggle('active', x === b));
        onChange(b.dataset.diff);
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     GATO — minimax + poda alfa-beta
  ══════════════════════════════════════════════════════════ */
  (function gato() {
    const boardEl = document.getElementById('gato-board');
    const statusEl = document.getElementById('gato-status');
    const scoreEl = document.getElementById('gato-score');
    if (!boardEl) return;

    const HU = 'X', AI = 'O';
    const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let board, over, diff = 'pesadilla';
    let score = { w: 0, d: 0, l: 0 };

    const cells = [];
    for (let i = 0; i < 9; i++) {
      const c = document.createElement('button');
      c.className = 'gato-cell';
      c.setAttribute('aria-label', 'casilla ' + (i + 1));
      c.addEventListener('click', () => humanMove(i));
      boardEl.appendChild(c);
      cells.push(c);
    }

    function winner(b) {
      for (const [a, m, z] of LINES) {
        if (b[a] && b[a] === b[m] && b[a] === b[z]) return b[a];
      }
      return b.includes(null) ? null : 'D'; // D = empate
    }

    /* Utilidad clásica 10−d: ganar pronto vale más, perder tarde duele menos */
    function minimax(b, depth, alpha, beta, isAI) {
      const w = winner(b);
      if (w === AI) return 10 - depth;
      if (w === HU) return depth - 10;
      if (w === 'D') return 0;
      let best = isAI ? -Infinity : Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i]) continue;
        b[i] = isAI ? AI : HU;
        const v = minimax(b, depth + 1, alpha, beta, !isAI);
        b[i] = null;
        if (isAI) { best = Math.max(best, v); alpha = Math.max(alpha, v); }
        else      { best = Math.min(best, v); beta = Math.min(beta, v); }
        if (alpha >= beta) break; // ✂ poda
      }
      return best;
    }

    function bestMove() {
      const free = board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
      const errRate = diff === 'novato' ? 0.65 : diff === 'pesadilla' ? 0.12 : 0;
      if (Math.random() < errRate) return free[(Math.random() * free.length) | 0];
      let best = -Infinity, move = free[0];
      for (const i of free) {
        board[i] = AI;
        const v = minimax(board, 0, -Infinity, Infinity, false);
        board[i] = null;
        if (v > best) { best = v; move = i; }
      }
      return move;
    }

    function paint() {
      board.forEach((v, i) => {
        cells[i].textContent = v || '';
        cells[i].className = 'gato-cell' + (v === HU ? ' hu' : v === AI ? ' ai' : '');
        cells[i].disabled = !!v || over;
      });
      scoreEl.textContent = `victorias ${score.w} · empates ${score.d} · derrotas ${score.l}`;
    }

    function finish(w) {
      over = true;
      if (w === HU) { score.w++; statusEl.textContent = '¡ganaste! (la IA exige revancha)'; }
      else if (w === AI) { score.l++; statusEl.textContent = 'la IA gana — minimax no perdona'; }
      else { score.d++; statusEl.textContent = 'empate — el mejor resultado posible en infierno'; }
      paint();
    }

    function humanMove(i) {
      if (over || board[i]) return;
      board[i] = HU;
      let w = winner(board);
      if (w) { finish(w); return; }
      statusEl.textContent = 'pensando…';
      paint();
      setTimeout(() => {
        board[bestMove()] = AI;
        w = winner(board);
        if (w) { finish(w); return; }
        statusEl.textContent = 'tu turno — juegas con X';
        paint();
      }, 180);
    }

    function reset(aiFirst) {
      board = Array(9).fill(null);
      over = false;
      statusEl.textContent = 'tu turno — juegas con X';
      if (aiFirst) { board[bestMove()] = AI; }
      paint();
    }

    initDiff('#game-gato', (d) => { diff = d; reset(false); });
    document.getElementById('gato-reset').addEventListener('click', () => reset(false));
    document.getElementById('gato-ai-first').addEventListener('click', () => reset(true));
    reset(false);
  })();

  /* ══════════════════════════════════════════════════════════
     CONECTA 4 — negamax + poda alfa-beta (+ iterative deepening)
  ══════════════════════════════════════════════════════════ */
  (function conecta4() {
    const boardEl = document.getElementById('c4-board');
    const statusEl = document.getElementById('c4-status');
    const scoreEl = document.getElementById('c4-score');
    if (!boardEl) return;

    const ROWS = 6, COLS = 7;
    const ORDER = [3, 2, 4, 1, 5, 0, 6]; // centro primero: poda mucho más
    const HU = 1, AI = 2;
    let grid, over, thinking, diff = 'pesadilla';
    let score = { w: 0, d: 0, l: 0 };

    /* DOM: columnas clicables con celdas dentro */
    const cellEls = [];
    for (let c = 0; c < COLS; c++) {
      const col = document.createElement('div');
      col.className = 'c4-col';
      col.addEventListener('click', () => humanMove(c));
      const colCells = [];
      for (let r = 0; r < ROWS; r++) {
        const cell = document.createElement('div');
        cell.className = 'c4-cell';
        col.appendChild(cell);
        colCells.push(cell);
      }
      boardEl.appendChild(col);
      cellEls.push(colCells);
    }

    function drop(c, p) {
      for (let r = ROWS - 1; r >= 0; r--) {
        if (!grid[r][c]) { grid[r][c] = p; return r; }
      }
      return -1;
    }
    function undo(c) {
      for (let r = 0; r < ROWS; r++) {
        if (grid[r][c]) { grid[r][c] = 0; return; }
      }
    }
    function validCols() { return ORDER.filter((c) => !grid[0][c]); }

    function isWin(r, c, p) {
      const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
      for (const [dr, dc] of DIRS) {
        let n = 1;
        for (const s of [1, -1]) {
          let rr = r + dr * s, cc = c + dc * s;
          while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && grid[rr][cc] === p) {
            n++; rr += dr * s; cc += dc * s;
          }
        }
        if (n >= 4) return true;
      }
      return false;
    }

    /* Evaluación por ventanas de 4 (perspectiva de p) */
    function evalWindow(cnt, opp) {
      if (cnt === 3 && opp === 0) return 60;
      if (cnt === 2 && opp === 0) return 8;
      if (opp === 3 && cnt === 0) return -70;
      return 0;
    }
    function evaluate(p) {
      const q = 3 - p;
      let s = 0;
      for (let r = 0; r < ROWS; r++) if (grid[r][3] === p) s += 6; // centro
      const add = (cells) => {
        let mine = 0, theirs = 0;
        for (const v of cells) { if (v === p) mine++; else if (v === q) theirs++; }
        s += evalWindow(mine, theirs);
      };
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS - 3; c++)
          add([grid[r][c], grid[r][c + 1], grid[r][c + 2], grid[r][c + 3]]);
      for (let c = 0; c < COLS; c++)
        for (let r = 0; r < ROWS - 3; r++)
          add([grid[r][c], grid[r + 1][c], grid[r + 2][c], grid[r + 3][c]]);
      for (let r = 0; r < ROWS - 3; r++)
        for (let c = 0; c < COLS - 3; c++) {
          add([grid[r][c], grid[r + 1][c + 1], grid[r + 2][c + 2], grid[r + 3][c + 3]]);
          add([grid[r + 3][c], grid[r + 2][c + 1], grid[r + 1][c + 2], grid[r][c + 3]]);
        }
      return s;
    }

    function negamax(depth, alpha, beta, p) {
      const cols = validCols();
      if (!cols.length) return { score: 0, col: -1 };
      // victoria inmediata: cortocircuito antes de recursión
      for (const c of cols) {
        const r = drop(c, p);
        const won = isWin(r, c, p);
        undo(c);
        if (won) return { score: 100000 + depth, col: c };
      }
      if (depth === 0) return { score: evaluate(p), col: cols[0] };
      let best = -Infinity, bestCol = cols[0];
      for (const c of cols) {
        drop(c, p);
        const v = -negamax(depth - 1, -beta, -alpha, 3 - p).score;
        undo(c);
        if (v > best) { best = v; bestCol = c; }
        alpha = Math.max(alpha, v);
        if (alpha >= beta) break; // ✂ poda alfa-beta
      }
      return { score: best, col: bestCol };
    }

    function aiCol() {
      const cols = validCols();
      if (diff === 'novato') {
        // gana/bloquea lo obvio; si no, profundidad 2 con ruido
        if (Math.random() < 0.35) return cols[(Math.random() * cols.length) | 0];
        return negamax(2, -Infinity, Infinity, AI).col;
      }
      if (diff === 'pesadilla') return negamax(6, -Infinity, Infinity, AI).col;
      // infierno: iterative deepening con presupuesto de tiempo
      const t0 = performance.now();
      let best = negamax(4, -Infinity, Infinity, AI);
      for (let d = 6; d <= 12; d += 2) {
        if (performance.now() - t0 > 900) break;
        best = negamax(d, -Infinity, Infinity, AI);
        if (best.score > 90000) break; // victoria forzada encontrada
      }
      return best.col;
    }

    function paint() {
      for (let c = 0; c < COLS; c++)
        for (let r = 0; r < ROWS; r++) {
          const v = grid[r][c];
          cellEls[c][r].className = 'c4-cell' + (v === HU ? ' hu' : v === AI ? ' ai' : '');
        }
      scoreEl.textContent = `victorias ${score.w} · empates ${score.d} · derrotas ${score.l}`;
    }

    function finish(msg, key) {
      over = true;
      score[key]++;
      statusEl.textContent = msg;
      paint();
    }

    function afterMove(r, c, p) {
      if (isWin(r, c, p)) {
        finish(p === HU ? '¡ganaste! nada mal contra negamax' : 'la IA conecta 4 — profundidad gana', p === HU ? 'w' : 'l');
        return true;
      }
      if (!validCols().length) { finish('empate — tablero lleno', 'd'); return true; }
      return false;
    }

    function humanMove(c) {
      if (over || thinking || grid[0][c]) return;
      const r = drop(c, HU);
      paint();
      if (afterMove(r, c, HU)) return;
      thinking = true;
      statusEl.textContent = 'pensando…';
      setTimeout(() => {
        const col = aiCol();
        const rr = drop(col, AI);
        thinking = false;
        paint();
        if (!afterMove(rr, col, AI)) statusEl.textContent = 'tu turno — fichas cian';
      }, 60);
    }

    function reset(aiFirst) {
      grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
      over = false; thinking = false;
      statusEl.textContent = 'tu turno — fichas cian';
      if (aiFirst) drop(3, AI); // apertura clásica: centro
      paint();
    }

    initDiff('#game-c4', (d) => { diff = d; reset(false); });
    document.getElementById('c4-reset').addEventListener('click', () => reset(false));
    document.getElementById('c4-ai-first').addEventListener('click', () => reset(true));
    reset(false);
  })();

  /* ══════════════════════════════════════════════════════════
     MISIONEROS Y CANÍBALES — puzzle jugable + solución BFS
  ══════════════════════════════════════════════════════════ */
  (function misioneros() {
    const leftEl = document.getElementById('mc-left');
    const rightEl = document.getElementById('mc-right');
    const boatEl = document.getElementById('mc-boat');
    const statusEl = document.getElementById('mc-status');
    const movesEl = document.getElementById('mc-moves');
    if (!leftEl) return;

    // 6 personajes: 3 misioneros (M) y 3 caníbales (C)
    let people, boatSide, crossings, over, animTimer = null;

    function initState() {
      people = [];
      for (let i = 0; i < 3; i++) people.push({ type: 'M', loc: 'L' });
      for (let i = 0; i < 3; i++) people.push({ type: 'C', loc: 'L' });
      boatSide = 'L';
      crossings = 0;
      over = false;
    }

    function count(loc, type) {
      return people.filter((p) => p.loc === loc && p.type === type).length;
    }
    function bankCounts(side) {
      // los que están en el bote cuentan en la orilla del bote para la regla
      const m = count(side, 'M') + (boatSide === side ? count('B', 'M') : 0);
      const c = count(side, 'C') + (boatSide === side ? count('B', 'C') : 0);
      return { m, c };
    }

    function paint() {
      leftEl.innerHTML = ''; rightEl.innerHTML = ''; boatEl.innerHTML = '';
      people.forEach((p, i) => {
        const chip = document.createElement('button');
        chip.className = 'mc-chip ' + (p.type === 'M' ? 'mc-m' : 'mc-c');
        chip.textContent = p.type;
        chip.title = p.type === 'M' ? 'misionero' : 'caníbal';
        chip.addEventListener('click', () => toggle(i));
        (p.loc === 'L' ? leftEl : p.loc === 'R' ? rightEl : boatEl).appendChild(chip);
      });
      boatEl.parentElement.classList.toggle('right', boatSide === 'R');
      movesEl.textContent = 'cruces: ' + crossings + ' (óptimo: 11)';
    }

    function toggle(i) {
      if (over || animTimer) return;
      const p = people[i];
      if (p.loc === 'B') { p.loc = boatSide; }
      else if (p.loc === boatSide) {
        if (count('B', 'M') + count('B', 'C') >= 2) {
          statusEl.textContent = 'el bote solo carga 2';
          return;
        }
        p.loc = 'B';
      } else {
        statusEl.textContent = 'ese personaje está en la otra orilla (el bote está en la ' + (boatSide === 'L' ? 'izquierda' : 'derecha') + ')';
        return;
      }
      statusEl.textContent = 'sube 1 o 2 al bote y cruza';
      paint();
    }

    function checkDeath() {
      for (const side of ['L', 'R']) {
        const m = count(side, 'M'), c = count(side, 'C');
        if (m > 0 && c > m) return true;
      }
      return false;
    }

    function cross(silent) {
      if (over || (animTimer && !silent)) return;
      const aboard = count('B', 'M') + count('B', 'C');
      if (aboard < 1) { statusEl.textContent = 'el bote necesita al menos 1 tripulante'; return; }
      boatSide = boatSide === 'L' ? 'R' : 'L';
      people.forEach((p) => { if (p.loc === 'B') p.loc = boatSide; }); // desembarcan
      crossings++;
      if (checkDeath()) {
        over = true;
        statusEl.textContent = '☠ los caníbales superan a los misioneros — reinicia';
      } else if (count('R', 'M') === 3 && count('R', 'C') === 3) {
        over = true;
        statusEl.textContent = crossings === 11
          ? '★ ¡perfecto! resuelto en los 11 cruces óptimos'
          : '¡resuelto en ' + crossings + ' cruces! (el óptimo BFS es 11)';
      } else {
        statusEl.textContent = 'sube 1 o 2 al bote y cruza';
      }
      paint();
    }

    /* BFS sobre el espacio de estados (mIzq, cIzq, bote) — como mi versión Java */
    function solveBFS() {
      const MOVES = [[1, 0], [2, 0], [0, 1], [0, 2], [1, 1]];
      const key = (s) => s.join(',');
      const start = [3, 3, 0]; // bote: 0=izquierda, 1=derecha
      const prev = new Map([[key(start), null]]);
      const queue = [start];
      let goal = null;
      while (queue.length) {
        const s = queue.shift();
        if (s[0] === 0 && s[1] === 0 && s[2] === 1) { goal = s; break; }
        const dir = s[2] === 0 ? -1 : 1;
        for (const [dm, dc] of MOVES) {
          const n = [s[0] + dm * dir, s[1] + dc * dir, 1 - s[2]];
          if (n[0] < 0 || n[0] > 3 || n[1] < 0 || n[1] > 3) continue;
          const mL = n[0], cL = n[1], mR = 3 - mL, cR = 3 - cL;
          if ((mL > 0 && cL > mL) || (mR > 0 && cR > mR)) continue;
          if (prev.has(key(n))) continue;
          prev.set(key(n), { s, move: [dm, dc] });
          queue.push(n);
        }
      }
      const steps = [];
      let cur = prev.get(key(goal));
      while (cur) { steps.unshift(cur.move); cur = prev.get(key(cur.s)); }
      return steps; // 11 movimientos [m, c]
    }

    function animateSolution() {
      if (animTimer) return;
      initState();
      paint();
      statusEl.textContent = 'resolviendo con BFS…';
      const steps = solveBFS();
      let i = 0;
      animTimer = setInterval(() => {
        if (i >= steps.length) { clearInterval(animTimer); animTimer = null; return; }
        const [m, c] = steps[i++];
        // embarcar m misioneros y c caníbales desde la orilla del bote
        let needM = m, needC = c;
        for (const p of people) {
          if (needM && p.type === 'M' && p.loc === boatSide) { p.loc = 'B'; needM--; }
          else if (needC && p.type === 'C' && p.loc === boatSide) { p.loc = 'B'; needC--; }
        }
        over = false;
        cross(true);
        statusEl.textContent = 'BFS · cruce ' + crossings + ' de 11 — lleva ' + m + 'M y ' + c + 'C';
        if (i >= steps.length) statusEl.textContent = '★ BFS resuelto: 11 cruces, la solución óptima';
      }, 1000);
    }

    document.getElementById('mc-cross').addEventListener('click', () => cross(false));
    document.getElementById('mc-reset').addEventListener('click', () => {
      if (animTimer) { clearInterval(animTimer); animTimer = null; }
      initState(); paint();
      statusEl.textContent = 'sube 1 o 2 al bote y cruza — que nunca haya más C que M en una orilla';
    });
    document.getElementById('mc-solve').addEventListener('click', animateSolution);

    initState();
    paint();
    statusEl.textContent = 'sube 1 o 2 al bote y cruza — que nunca haya más C que M en una orilla';
  })();
})();
