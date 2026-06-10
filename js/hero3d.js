/**
 * hero3d.js — Escena 3D de fondo a PÁGINA COMPLETA (solo index.html)  [módulo ES]
 *
 * Modelo "vuelo de cámara" estilo robinpayot.com:
 *   - Un canvas WebGL fijo (position:fixed) cubre todo el viewport y vive
 *     DETRÁS del contenido (z-index 0). El contenido (secciones translúcidas)
 *     flota encima.
 *   - Las figuras matemáticas metálicas se distribuyen en profundidad formando
 *     un "corredor". La CÁMARA vuela hacia el fondo y orbita suavemente según
 *     el progreso de scroll de TODA la página (0 arriba → 1 abajo), de modo que
 *     vas atravesando las figuras a medida que bajas.
 *   - Reflejos vía environment map (PMREM + RoomEnvironment), niebla para dar
 *     profundidad, campo de partículas (estrellas) y parallax sutil de ratón.
 *
 * Robustez / rendimiento:
 *   - Guards: prefers-reduced-motion, sin WebGL o móvil pequeño → no monta la
 *     escena y deja el fallback (partículas 2D de main.js + CSS). Marca
 *     window.__hero3dActive en consecuencia.
 *   - Pausa el render con la pestaña oculta. pixelRatio limitado y nº de
 *     partículas adaptativo. Progreso de scroll suavizado (lerp) para un vuelo
 *     fluido y sin mareo.
 *
 * Se carga como <script type="module"> con el import map de Three.js del <head>.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ============================================================
   GUARDS
============================================================ */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 900px)').matches;
const mount = document.getElementById('hero-3d');

function webglSupported() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

/* Paleta de marca */
const CYAN = 0x61dafb;
const PURPLE = 0xc678dd;
const DARK = 0x1b2230;
const FOG = 0x05080d;

// Animación del título: independiente del 3D (es barata; solo evita reduced-motion).
initTitle();

if (reduced || !mount || !webglSupported()) {
  // Fallback: dejamos las partículas 2D de main.js y las decoraciones CSS.
  window.__hero3dActive = false;
  if (mount) mount.classList.remove('loading');
} else {
  window.__hero3dActive = true; // síncrono: main.js (DOMContentLoaded) saltará initParticles
  // Diferimos el montaje un frame: la página pinta primero y el coste de init
  // (env map, geometrías) no bloquea el primer render → carga percibida más rápida.
  try {
    requestAnimationFrame(function () {
      try { initScene(mount); }
      catch (e) { console.warn('[hero3d] no se pudo montar la escena 3D:', e); window.__hero3dActive = false; mount.classList.remove('loading'); mount.innerHTML = ''; }
    });
  } catch (e) {
    console.warn('[hero3d] no se pudo montar la escena 3D:', e);
    window.__hero3dActive = false;
    mount.classList.remove('loading');
    mount.innerHTML = '';
  }
}

/* ============================================================
   TÍTULO  (SplitText, letra a letra)
============================================================ */
function initTitle() {
  const h1 = document.getElementById('hero-title');
  if (!h1 || reduced) return;
  if (typeof window.gsap === 'undefined' || typeof window.SplitText === 'undefined') return;

  const gsap = window.gsap;
  try {
    const split = new window.SplitText(h1, { type: 'chars' });
    gsap.from(split.chars, {
      yPercent: 120,
      opacity: 0,
      ease: 'back.out(1.7)',
      duration: 0.8,
      stagger: 0.045,
      delay: 0.15,
    });
  } catch (e) {
    /* si SplitText falla, el h1 ya es visible por defecto */
  }
}

/* ============================================================
   ESCENA 3D — corredor de figuras + vuelo de cámara con scroll
============================================================ */
function initScene(container) {
  const W0 = window.innerWidth, H0 = window.innerHeight;

  // antialias solo en escritorio; pixelRatio acotado (clave para fluidez en pantallas HiDPI)
  const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5));
  renderer.setSize(W0, H0);
  renderer.setClearColor(0x000000, 0); // transparente: deja ver el fondo del body
  container.appendChild(renderer.domElement);
  container.classList.remove('loading');

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(FOG, 0.021); // las figuras emergen de la oscuridad al acercarte

  const camera = new THREE.PerspectiveCamera(50, W0 / H0, 0.1, 200);
  camera.position.set(0, 0, 10);

  // Environment map (reflejos metálicos sin ficheros HDR)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  // Luces de acento de marca (refuerzan el color sobre el env map)
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 6, 8);
  scene.add(key);
  const cyanLight = new THREE.PointLight(CYAN, 22, 40);
  cyanLight.position.set(-6, 3, 4);
  scene.add(cyanLight);
  const purpleLight = new THREE.PointLight(PURPLE, 18, 40);
  purpleLight.position.set(6, -3, 2);
  scene.add(purpleLight);

  // API pública: permite que js/fx-lab.js tiña los acentos por sección (suave, con lerp)
  const targetCyan = new THREE.Color(CYAN);
  const targetPurple = new THREE.Color(PURPLE);
  window.__hero3dAPI = {
    setAccent(c, p) { if (c != null) targetCyan.set(c); if (p != null) targetPurple.set(p); },
    reset() { targetCyan.set(CYAN); targetPurple.set(PURPLE); },
  };

  /* ---------- Corredor de figuras matemáticas ---------- */
  const SPACING = 9;          // profundidad entre figuras
  const FIRST_Z = -4;         // z de la primera figura
  // Geometrías aligeradas (menos segmentos = menos vértices = más FPS, mismo aspecto)
  const defs = [
    { geo: new THREE.TorusKnotGeometry(0.95, 0.3, 128, 16),       color: DARK,   metalness: 1.0, roughness: 0.16, scale: 1.35 },
    { geo: new THREE.IcosahedronGeometry(0.95, 0),                color: CYAN,   metalness: 0.85, roughness: 0.25 },
    { geo: new THREE.TorusGeometry(0.72, 0.22, 18, 64),           color: PURPLE, metalness: 0.95, roughness: 0.22 },
    { geo: new THREE.OctahedronGeometry(1.0, 0),                  color: DARK,   metalness: 1.0, roughness: 0.2 },
    { geo: new THREE.DodecahedronGeometry(0.9, 0),                color: CYAN,   metalness: 0.9, roughness: 0.26 },
    { geo: new THREE.TorusKnotGeometry(0.8, 0.27, 110, 16, 2, 3), color: PURPLE, metalness: 1.0, roughness: 0.2 },
    { geo: new THREE.IcosahedronGeometry(1.05, 1),                color: DARK,   metalness: 1.0, roughness: 0.18, scale: 1.1 },
    { geo: new THREE.TorusGeometry(0.85, 0.16, 16, 80),           color: CYAN,   metalness: 0.92, roughness: 0.22 },
  ];

  const objs = [];
  defs.forEach((d, i) => {
    const mat = new THREE.MeshStandardMaterial({
      color: d.color, metalness: d.metalness, roughness: d.roughness, envMapIntensity: 1.15,
    });
    const m = new THREE.Mesh(d.geo, mat);
    const side = (i % 2) ? 1 : -1;
    m.position.set(side * (1.1 + (i % 4) * 0.22), ((i % 3) - 1) * 0.75, FIRST_Z - i * SPACING);
    if (d.scale) m.scale.setScalar(d.scale);
    m.userData.spin = {
      x: 0.06 + (i % 3) * 0.04,
      y: 0.10 + (i % 4) * 0.03,
      z: 0.04 + (i % 2) * 0.05,
    };
    scene.add(m);
    objs.push(m);

    // Cáscara wireframe envolviendo algunas figuras (toque "matemático")
    if (i % 2 === 0) {
      const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.9, 1),
        new THREE.MeshBasicMaterial({ color: CYAN, wireframe: true, transparent: true, opacity: 0.05 })
      );
      shell.position.copy(m.position);
      m.userData.shell = shell;
      scene.add(shell);
    }
  });

  const LAST_Z = FIRST_Z - (defs.length - 1) * SPACING; // z de la última figura

  /* ---------- Campo de partículas (estrellas del corredor) ---------- */
  const COUNT = mobile ? 350 : 850;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 26;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = 8 - Math.random() * (Math.abs(LAST_Z) + 18); // de delante hasta el fondo
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: CYAN, size: 0.04, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending, fog: true,
  }));
  scene.add(particles);

  /* ---------- Interacción: ratón + scroll ---------- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // Progreso de scroll de TODA la página (0 arriba → 1 abajo), suavizado.
  let pTarget = 0, p = 0;
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    pTarget = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Recorrido de la cámara ---------- */
  const CAM_START_Z = 10;
  const CAM_END_Z = LAST_Z + 6;   // termina cerca de la última figura, habiéndolas atravesado todas
  const ORBIT_R = 0.95;          // radio de la órbita lateral (sutil: el vuelo hacia el fondo manda)
  const TURNS = 0.8;             // nº de vueltas de la órbita a lo largo de toda la página
  const lookTarget = new THREE.Vector3();

  /* ---------- Resize ---------- */
  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize, { passive: true });

  /* ---------- Loop ---------- */
  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    if (document.hidden) return;

    const t = clock.getElapsedTime();

    // Giro propio (vida idle) de cada figura
    objs.forEach((o) => {
      o.rotation.x = t * o.userData.spin.x;
      o.rotation.y = t * o.userData.spin.y;
      o.rotation.z = t * o.userData.spin.z;
      if (o.userData.shell) o.userData.shell.rotation.y = -t * 0.04;
    });
    particles.rotation.y = t * 0.01;

    // Parallax de ratón (lerp suave)
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    // Progreso de scroll suavizado → vuelo de cámara
    p += (pTarget - p) * 0.06;
    const camZ = CAM_START_Z + (CAM_END_Z - CAM_START_Z) * p;
    const ang = p * Math.PI * 2 * TURNS;

    camera.position.x = Math.sin(ang) * ORBIT_R + mouse.x * 0.7;
    camera.position.y = Math.cos(ang * 0.8) * 0.55 - mouse.y * 0.5;
    camera.position.z = camZ;

    // Mira hacia el centro del corredor, un poco por delante (balanceo mínimo)
    lookTarget.set(Math.sin(ang) * 0.18, Math.cos(ang * 0.8) * 0.12, camZ - 7);
    camera.lookAt(lookTarget);

    // Transición suave de color de los acentos (efecto "3D reacciona a sección")
    cyanLight.color.lerp(targetCyan, 0.05);
    purpleLight.color.lerp(targetPurple, 0.05);

    renderer.render(scene, camera);
  }
  tick();
}
