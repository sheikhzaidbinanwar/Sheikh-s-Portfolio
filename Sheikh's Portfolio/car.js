/* ============================================================
   SHEIKH'S PORTFOLIO — Cyberpunk Car Journey (Three.js)
   A procedurally-built low-poly concept car drives along an
   authored path through the page, its transform driven by
   scroll progress. No external 3D assets required — everything
   is built from primitives so the experience loads instantly
   and scales cleanly across devices.
   ============================================================ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('car-canvas');
if (!canvas) {
  // Nothing to do if the canvas isn't present.
  throw new Error('car-canvas not found');
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmallScreen = window.innerWidth < 760;

/* ---------------- Renderer / Scene / Camera ---------------- */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const BG_COLOR = 0x0d0b12;
scene.fog = new THREE.FogExp2(BG_COLOR, isSmallScreen ? 0.05 : 0.038);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0.5, 1.2, 11);

/* ---------------- Lighting ---------------- */
const ambient = new THREE.AmbientLight(0x2a1f3d, 0.9);
scene.add(ambient);

const hemi = new THREE.HemisphereLight(0x4c2a86, 0x07070a, 0.6);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xcbb8ff, 0.5);
keyLight.position.set(-6, 8, 4);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0xa855f7, 2.2, 30, 2);
rimLight.position.set(0, 3, -2);
scene.add(rimLight);

/* ---------------- Helpers ---------------- */

// Soft additive glow sprite (used for headlights, underglow, ambience)
function makeGlowTexture() {
  const size = 128;
  const canvasEl = document.createElement('canvas');
  canvasEl.width = size;
  canvasEl.height = size;
  const ctx = canvasEl.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(200,150,255,0.6)');
  gradient.addColorStop(1, 'rgba(120,60,200,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvasEl);
  return tex;
}
const glowTexture = makeGlowTexture();

function makeGlowSprite(color, size, opacity = 0.9) {
  const mat = new THREE.SpriteMaterial({
    map: glowTexture,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size, size, 1);
  return sprite;
}

/* ---------------- Procedural Cyberpunk Car ---------------- */
function buildCar() {
  const car = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x140c1e,
    metalness: 0.75,
    roughness: 0.28,
    emissive: 0x1c0f2e,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 1
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0a0710,
    metalness: 0.3,
    roughness: 0.1,
    emissive: 0x2a1a45,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 1
  });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.85 });

  function withEdges(mesh) {
    const edges = new THREE.EdgesGeometry(mesh.geometry, 20);
    const lines = new THREE.LineSegments(edges, edgeMat);
    mesh.add(lines);
    return mesh;
  }

  // Lower chassis (wide, low, wedge-like)
  const chassisGeo = new THREE.BoxGeometry(1.9, 0.32, 4.2);
  const chassis = withEdges(new THREE.Mesh(chassisGeo, bodyMat));
  chassis.position.y = 0.34;
  car.add(chassis);

  // Front wedge nose (tapered via scaled box)
  const noseGeo = new THREE.BoxGeometry(1.6, 0.26, 1.1);
  const nose = withEdges(new THREE.Mesh(noseGeo, bodyMat));
  nose.position.set(0, 0.46, -1.85);
  nose.scale.set(0.72, 1, 1);
  car.add(nose);

  // Cabin / canopy
  const cabinGeo = new THREE.BoxGeometry(1.5, 0.42, 1.9);
  const cabin = withEdges(new THREE.Mesh(cabinGeo, glassMat));
  cabin.position.set(0, 0.72, 0.15);
  car.add(cabin);

  // Rear deck
  const rearGeo = new THREE.BoxGeometry(1.72, 0.3, 1.0);
  const rear = withEdges(new THREE.Mesh(rearGeo, bodyMat));
  rear.position.set(0, 0.5, 1.75);
  car.add(rear);

  // Side skirts (thin glowing strips along the doors)
  const skirtGeo = new THREE.BoxGeometry(0.06, 0.06, 3.6);
  [-0.97, 0.97].forEach((x) => {
    const skirt = new THREE.Mesh(
      skirtGeo,
      new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 1 })
    );
    skirt.position.set(x, 0.2, 0);
    car.add(skirt);
  });

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a080d, metalness: 0.6, roughness: 0.5, transparent: true, opacity: 1 });
  const rimEdgeMat = new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.9 });
  const wheels = [];
  const wheelPositions = [
    [-1.02, 0.42, -1.35],
    [1.02, 0.42, -1.35],
    [-1.02, 0.42, 1.35],
    [1.02, 0.42, 1.35]
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wheelGroup = new THREE.Group();
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    const rimEdges = new THREE.EdgesGeometry(wheelGeo, 30);
    const rimLines = new THREE.LineSegments(rimEdges, rimEdgeMat);
    rimLines.rotation.z = Math.PI / 2;
    wheelGroup.add(wheel, rimLines);
    wheelGroup.position.set(x, y, z);
    car.add(wheelGroup);
    wheels.push(wheelGroup);
  });

  // Headlights
  const headlightGeo = new THREE.SphereGeometry(0.09, 12, 12);
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xf5f3ff, transparent: true, opacity: 1 });
  [-0.6, 0.6].forEach((x) => {
    const hl = new THREE.Mesh(headlightGeo, headlightMat);
    hl.position.set(x, 0.46, -2.42);
    car.add(hl);
    const glow = makeGlowSprite(0xf5f3ff, 0.9, 0.8);
    glow.position.set(x, 0.46, -2.42);
    car.add(glow);
  });
  const headSpot = new THREE.SpotLight(0xe9e0ff, 3.5, 14, Math.PI / 6, 0.6, 1.4);
  headSpot.position.set(0, 0.55, -2.3);
  headSpot.target.position.set(0, 0, -8);
  car.add(headSpot, headSpot.target);

  // Taillights
  const tailGeo = new THREE.BoxGeometry(0.5, 0.08, 0.05);
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 1 });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.position.set(0, 0.55, 2.3);
  car.add(tail);
  const tailGlow = makeGlowSprite(0xa855f7, 1.1, 0.75);
  tailGlow.position.set(0, 0.55, 2.32);
  car.add(tailGlow);

  // Underglow
  const underGlow = makeGlowSprite(0x7c3aed, 3.2, 0.55);
  underGlow.position.set(0, 0.02, 0);
  underGlow.rotation.x = -Math.PI / 2;
  car.add(underGlow);
  const underLight = new THREE.PointLight(0x7c3aed, 1.6, 6, 2);
  underLight.position.set(0, 0.15, 0);
  car.add(underLight);

  // Rim glow behind the car — big soft atmosphere sprite
  const rimGlow = makeGlowSprite(0x7c3aed, 9, 0.35);
  rimGlow.position.set(0, 1.4, 2.6);
  car.add(rimGlow);

  car.userData.wheels = wheels;
  return car;
}

const car = buildCar();
scene.add(car);

/* ---------------- Ground / Road ---------------- */
const grid = new THREE.GridHelper(200, 80, 0x7c3aed, 0x1c1026);
grid.position.y = 0;
grid.material.transparent = true;
grid.material.opacity = 0.18;
scene.add(grid);

// Road edge neon strips
const stripGeo = new THREE.BoxGeometry(0.05, 0.03, 200);
const stripMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
[-1.9, 1.9].forEach((x) => {
  const strip = new THREE.Mesh(stripGeo, stripMat);
  strip.position.set(x, 0.02, -60);
  scene.add(strip);
});

// Drifting ambient particles
const particleCount = isSmallScreen ? 70 : 180;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 30;
  particlePositions[i * 3 + 1] = Math.random() * 8;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 70 - 10;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0xa855f7,
  size: 0.045,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

/* ---------------- Authored Journey Path ---------------- */
/* Each keyframe corresponds to a [data-stage] section in the page.
   Car position/rotation and camera position/fov/lookAt are hand
   composed to feel like distinct cinematic beats. */
const KEYFRAMES = {
  hero:        { car: [0.4, -0.1, 5.4],  rot: 0.18,  cam: [0.6, 1.15, 10.5], fov: 34, look: [0, 0.6, 5] },
  about:       { car: [3.0, -0.15, 2.6], rot: 1.0,   cam: [4.3, 1.4, 7.6],   fov: 30, look: [3.0, 0.5, 2.6] },
  journey:     { car: [-2.2, -0.05, -1.4], rot: -0.35, cam: [-1.0, 1.6, 4.6], fov: 42, look: [-2.2, 0.4, -1.4] },
  services:    { car: [3.6, 0.05, -6.4], rot: 0.55,  cam: [1.8, 2.1, -0.6],  fov: 30, look: [3.0, 0.5, -6.4] },
  skills:      { car: [-3.4, 0.05, -10.6], rot: -0.6, cam: [-1.2, 2.3, -4.8], fov: 30, look: [-3.0, 0.5, -10.6] },
  transition2: { car: [0.6, 0.0, -13.4], rot: 0.05,  cam: [0.2, 1.6, -8.0],  fov: 38, look: [0.6, 0.5, -13.4] },
  portfolio:   { car: [1.6, -0.05, -16.6], rot: 0.22, cam: [3.0, 1.6, -11.4], fov: 32, look: [1.6, 0.5, -16.6] },
  experience:  { car: [-1.2, 0.0, -21.4], rot: -0.14, cam: [-2.4, 1.8, -15.6], fov: 32, look: [-1.2, 0.5, -21.4] },
  transition3: { car: [0.3, -0.05, -25.4], rot: 0.05, cam: [0.0, 1.5, -19.6], fov: 34, look: [0.3, 0.5, -25.4] },
  contact:     { car: [0, -0.1, -31],    rot: 0.02,  cam: [0, 1.35, -21.5],  fov: 24, look: [0, 0.6, -31] }
};
const STAGE_ORDER = ['hero','about','journey','services','skills','transition2','portfolio','experience','transition3','contact'];

/* ---------------- Scroll -> Stage progress mapping ---------------- */
const stageElements = STAGE_ORDER
  .map((name) => ({ name, el: document.querySelector(`[data-stage="${name}"]`) }))
  .filter((s) => s.el);

let stageBounds = [];
function computeStageBounds() {
  const docHeight = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  stageBounds = stageElements.map((s) => {
    const rectTop = s.el.getBoundingClientRect().top + window.scrollY;
    return { name: s.name, t: Math.min(Math.max(rectTop / docHeight, 0), 1) };
  });
  // Ensure first stage starts at 0 and stays sorted
  if (stageBounds.length) stageBounds[0].t = 0;
  stageBounds.sort((a, b) => a.t - b.t);
}
computeStageBounds();

// Exposed so other scripts (e.g. after GSAP ScrollTrigger pins add
// runway height to the document) can ask the path to re-sync.
window.__recomputeCarStageBounds = function () {
  computeStageBounds();
  if (!prefersReducedMotion) updateTargetsFromScroll();
};

function smootherstep(x) {
  x = Math.max(0, Math.min(1, x));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

// Target transform values (updated on scroll), current values (eased each frame)
const target = {
  carPos: new THREE.Vector3(),
  carRot: 0,
  camPos: new THREE.Vector3(),
  camLook: new THREE.Vector3(),
  fov: 35
};
const current = {
  carPos: new THREE.Vector3(),
  carRot: 0,
  camPos: new THREE.Vector3(),
  camLook: new THREE.Vector3(),
  fov: 35
};

function kf(name) {
  const k = KEYFRAMES[name];
  return {
    car: new THREE.Vector3(...k.car),
    rot: k.rot,
    cam: new THREE.Vector3(...k.cam),
    look: new THREE.Vector3(...k.look),
    fov: k.fov
  };
}

let carOpacityTarget = 1;
let carScaleTarget = 1;

function updateTargetsFromScroll() {
  if (!stageBounds.length) return;
  const scrollT = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);

  // Find bracketing stage keyframes
  let lower = stageBounds[0];
  let upper = stageBounds[stageBounds.length - 1];
  for (let i = 0; i < stageBounds.length - 1; i++) {
    if (scrollT >= stageBounds[i].t && scrollT <= stageBounds[i + 1].t) {
      lower = stageBounds[i];
      upper = stageBounds[i + 1];
      break;
    }
  }
  if (scrollT <= stageBounds[0].t) { lower = upper = stageBounds[0]; }
  if (scrollT >= stageBounds[stageBounds.length - 1].t) { lower = upper = stageBounds[stageBounds.length - 1]; }

  const span = Math.max(upper.t - lower.t, 0.0001);
  const localT = smootherstep((scrollT - lower.t) / span);

  const a = kf(lower.name);
  const b = kf(upper.name);

  target.carPos.lerpVectors(a.car, b.car, localT);
  target.carRot = a.rot + (b.rot - a.rot) * localT;
  target.camPos.lerpVectors(a.cam, b.cam, localT);
  target.camLook.lerpVectors(a.look, b.look, localT);
  target.fov = a.fov + (b.fov - a.fov) * localT;

  // Ending sequence: once inside the contact stage, keep pushing the car
  // further away and fading it out as the user keeps scrolling.
  const contactEl = document.querySelector('[data-stage="contact"]');
  if (contactEl) {
    const rect = contactEl.getBoundingClientRect();
    const sectionHeight = Math.max(rect.height, 1);
    const progressInto = Math.min(Math.max((0 - rect.top) / sectionHeight, 0), 1);
    if (progressInto > 0) {
      const extra = smootherstep(progressInto);
      target.carPos.z -= extra * 14;
      target.camPos.z -= extra * 6;
      target.camLook.z -= extra * 14;
      carOpacityTarget = 1 - extra;
      carScaleTarget = 1 - extra * 0.55;
    } else {
      carOpacityTarget = 1;
      carScaleTarget = 1;
    }
  }
}

/* ---------------- Reduced motion fallback ---------------- */
if (prefersReducedMotion) {
  // Park the car in a single elegant hero-facing pose; no scroll-driven travel.
  const a = kf('hero');
  target.carPos.copy(a.car);
  target.carRot = a.rot;
  target.camPos.copy(a.cam);
  target.camLook.copy(a.look);
  target.fov = a.fov;
  current.carPos.copy(a.car);
  current.carRot = a.rot;
  current.camPos.copy(a.cam);
  current.camLook.copy(a.look);
  current.fov = a.fov;
} else {
  window.addEventListener('scroll', updateTargetsFromScroll, { passive: true });
  updateTargetsFromScroll();
  current.carPos.copy(target.carPos);
  current.camPos.copy(target.camPos);
  current.camLook.copy(target.camLook);
  current.carRot = target.carRot;
  current.fov = target.fov;
}

/* ---------------- Resize handling ---------------- */
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  computeStageBounds();
  if (!prefersReducedMotion) updateTargetsFromScroll();
}
window.addEventListener('resize', onResize);

/* ---------------- Render loop ---------------- */
const clock = new THREE.Clock();
let isVisible = true;
document.addEventListener('visibilitychange', () => {
  isVisible = document.visibilityState === 'visible';
});

let carOpacityCurrent = 1;
let carScaleCurrent = 1;

function applyCarOpacity(value) {
  car.traverse((obj) => {
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (m && 'opacity' in m) {
          m.transparent = true;
          m.opacity = Math.min(m.userData.baseOpacity ?? 1, value);
        }
      });
    }
  });
}
// Cache base opacities once
car.traverse((obj) => {
  if (obj.material) {
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => { if (m) m.userData.baseOpacity = m.opacity ?? 1; });
  }
});

function animate() {
  requestAnimationFrame(animate);
  if (!isVisible) return;

  const dt = Math.min(clock.getDelta(), 0.05);
  const damp = prefersReducedMotion ? 1 : 1 - Math.pow(0.001, dt);

  current.carPos.lerp(target.carPos, damp);
  current.camPos.lerp(target.camPos, damp);
  current.camLook.lerp(target.camLook, damp);
  current.carRot += (target.carRot - current.carRot) * damp;
  current.fov += (target.fov - current.fov) * damp;
  carOpacityCurrent += (carOpacityTarget - carOpacityCurrent) * damp;
  carScaleCurrent += (carScaleTarget - carScaleCurrent) * damp;

  car.position.copy(current.carPos);
  car.rotation.y = current.carRot;
  car.scale.setScalar(Math.max(carScaleCurrent, 0.01));
  if (carOpacityCurrent < 0.98) applyCarOpacity(Math.max(carOpacityCurrent, 0));

  camera.position.copy(current.camPos);
  camera.lookAt(current.camLook);
  camera.fov = current.fov;
  camera.updateProjectionMatrix();

  // Idle wheel spin — subtle, constant, suggests motion without being literal speed
  const spinSpeed = prefersReducedMotion ? 1.2 : 5.5;
  car.userData.wheels.forEach((w) => { w.rotation.x -= spinSpeed * dt; });

  // Gentle vertical bob for a "hovering concept car" premium feel
  car.position.y += Math.sin(clock.elapsedTime * 1.6) * 0.02;

  // Slow particle drift
  particles.rotation.y += dt * 0.01;
  particles.position.z += dt * 0.3;
  if (particles.position.z > 20) particles.position.z = 0;

  renderer.render(scene, camera);
}
animate();
