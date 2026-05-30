/**
 * f100t_threejs_scene.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Three.js scene builder for IGLO 5 / F100T (Tilt-and-Turn window)
 *
 * Animation sequence:
 *   Phase 1 – Side open  : Sash rotates -90° around its LEFT vertical edge (Y axis)
 *   Phase 2 – Tilt       : Sash tilts +15° inward around its BOTTOM edge (X axis)
 *
 * Usage (ES module in a Vite/Three.js project):
 *
 *   import { buildF100TScene, animateF100T } from './f100t_threejs_scene.mjs';
 *   import profileData from './f100t_prepared.json' with { type: 'json' };
 *
 *   const { scene, camera, renderer, groups } = buildF100TScene(profileData, mountEl);
 *   animateF100T(groups, profileData);
 *
 * CLI usage (Node.js):
 *   node scratch/f100t_threejs_scene.mjs scratch/f100t_prepared.json --out scratch/f100t_preview.html
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Node.js imports (safe in browser via bundler tree-shaking if unused)
import fs   from 'fs';
import path from 'path';

// ─── Easing ───────────────────────────────────────────────────────────────────
const easing = {
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInOutSine:  t => -(Math.cos(Math.PI * t) - 1) / 2,
  linear:         t => t,
};

// ─── HTML template generator (zero browser deps – pure string) ───────────────

/**
 * Generate a standalone HTML preview file that imports Three.js from CDN
 * and renders the F100T animation.
 *
 * @param {object}      profileData  - prepared JSON from dxf_prepare_geometry
 * @param {string|null} outPath      - if provided, writes file and returns path
 * @returns {string}  HTML content
 */
export function generatePreviewHTML(profileData, outPath = null) {
  const dataJson = JSON.stringify(profileData);

  const html = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IGLO 5 · F100T – Tilt &amp; Turn Window Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0e0e1c; font-family: 'Inter', system-ui, sans-serif; overflow: hidden; }
    #canvas-container { width: 100vw; height: 100vh; }
    #ui {
      position: fixed; top: 20px; left: 20px;
      color: #e0d8ff;
      background: rgba(10,10,28,0.82);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(160,140,255,0.18);
      border-radius: 14px;
      padding: 18px 22px;
      min-width: 250px;
      z-index: 100;
      box-shadow: 0 8px 40px rgba(0,0,0,0.55);
    }
    #ui h2 {
      font-size: 13px; font-weight: 700;
      color: #b8a0ff; letter-spacing: 0.1em;
      text-transform: uppercase; margin-bottom: 14px;
    }
    .layer-row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 11px; padding: 4px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .layer-row:last-child { border-bottom: none; }
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      display: inline-block; margin-right: 6px;
    }
    .group-frm .dot { background: #ffd080; }
    .group-ssh .dot { background: #60d4ff; }
    .layer-name { color: #ccc; }
    .layer-pts  { color: #666; font-size: 10px; }
    #anim-section { margin-top: 16px; }
    .phase-row { margin-bottom: 8px; }
    .phase-label {
      font-size: 10px; display: flex; justify-content: space-between;
      color: #9080c0; margin-bottom: 4px;
    }
    .track {
      height: 3px; background: rgba(255,255,255,0.08);
      border-radius: 2px; overflow: hidden;
    }
    .fill { height: 100%; border-radius: 2px; width: 0%; }
    .fill-1 { background: linear-gradient(90deg, #9060ff, #40c8ff); }
    .fill-2 { background: linear-gradient(90deg, #40c8ff, #40ffaa); }
    #btn-replay {
      margin-top: 14px; width: 100%; padding: 8px 0;
      border: 1px solid rgba(150,130,255,0.28);
      background: rgba(90,70,180,0.14);
      color: #c0b0ff; border-radius: 9px; cursor: pointer;
      font-size: 11px; letter-spacing: 0.06em;
      transition: background 0.2s, color 0.2s;
    }
    #btn-replay:hover { background: rgba(90,70,180,0.38); color: #fff; }
    #hint {
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      font-size: 11px; color: rgba(255,255,255,0.3);
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="ui">
    <h2>IGLO 5 · F100T</h2>
    <div id="layer-list"></div>
    <div id="anim-section">
      <div class="phase-row">
        <div class="phase-label"><span>① Side open</span><span id="p1-pct">0%</span></div>
        <div class="track"><div class="fill fill-1" id="bar1"></div></div>
      </div>
      <div class="phase-row">
        <div class="phase-label"><span>② Tilt</span><span id="p2-pct">0%</span></div>
        <div class="track"><div class="fill fill-2" id="bar2"></div></div>
      </div>
    </div>
    <button id="btn-replay">↺ Replay animation</button>
  </div>
  <div id="hint">Drag to orbit · Scroll to zoom</div>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PROFILE = ${dataJson};
const bbox    = PROFILE.meta.bounds.normalised;
const SCALE   = 0.1;   // 1 mm = 0.1 world units
const DEPTH   = 7.0;   // 70 mm profile depth
const profW   = bbox.maxX * SCALE;
const profH   = bbox.maxY * SCALE;

// ── Materials ──────────────────────────────────────────────────────────────
function mat(color, extra={}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.08, ...extra });
}
const MATS = {
  FRM_EXT:     mat(0xc8bca8),
  FRM_INT:     mat(0xddd0c0),
  GSK_FRM_EXT: mat(0x181818, { roughness: 0.95, metalness: 0 }),
  SSH_EXT:     mat(0xb8a898),
  SSH_INT:     mat(0xc8b8a8),
  GSK_SSH_EXT: mat(0x111111, { roughness: 0.95, metalness: 0 }),
  GSK_SSH_INT: mat(0x111111, { roughness: 0.95, metalness: 0 }),
  BZD:         mat(0xd0c0b0),
  GSK_BZD:     mat(0x111111, { roughness: 0.95, metalness: 0 }),
  SPACER:      mat(0x888888, { metalness: 0.55, roughness: 0.35 }),
  GLS_INT:     new THREE.MeshPhysicalMaterial({ color: 0xd0eaff, roughness: 0.04,
                  transparent: true, opacity: 0.30, transmission: 0.85 }),
  GLS_EXT:     new THREE.MeshPhysicalMaterial({ color: 0xc8e0f8, roughness: 0.04,
                  transparent: true, opacity: 0.25, transmission: 0.85 }),
};
const DEF_MAT = mat(0xaaaaaa);

// ── Scene ──────────────────────────────────────────────────────────────────
const mount    = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1e);
scene.fog        = new THREE.FogExp2(0x0d0d1e, 0.018);

const camera = new THREE.PerspectiveCamera(28, mount.clientWidth / mount.clientHeight, 0.01, 800);
camera.position.set(6, 4.5, 26);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.target.set(0, 0, 3.5);
controls.update();

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const key = new THREE.DirectionalLight(0xfff8e8, 2.4);
key.position.set(10, 16, 14); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0005;
scene.add(key);
const fill = new THREE.DirectionalLight(0xb0ccff, 0.65);
fill.position.set(-8, 4, 6); scene.add(fill);
const rim  = new THREE.DirectionalLight(0xffe0a0, 0.3);
rim.position.set(0, -6, -10); scene.add(rim);

// Ground plane
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(30, 64),
  new THREE.MeshStandardMaterial({ color: 0x080814, roughness: 1, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -(profH / 2) - 0.5;
ground.receiveShadow = true;
scene.add(ground);

// ── Geometry builder ──────────────────────────────────────────────────────
function buildLayer(layerName, layerData) {
  const g   = new THREE.Group();
  g.name    = layerName;
  const mat = MATS[layerName] ?? DEF_MAT;
  const extOpts = { depth: DEPTH, bevelEnabled: false };

  for (const c of layerData.contours) {
    if (c.points.length < 3) continue;
    const shape = new THREE.Shape();
    shape.moveTo(c.points[0].x * SCALE, c.points[0].y * SCALE);
    for (let i = 1; i < c.points.length; i++) {
      shape.lineTo(c.points[i].x * SCALE, c.points[i].y * SCALE);
    }
    try {
      const geo  = new THREE.ExtrudeGeometry(shape, extOpts);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name  = c.id;
      mesh.castShadow = mesh.receiveShadow = true;
      g.add(mesh);
    } catch (e) {
      console.warn('[F100T] ExtrudeGeometry error for', c.id, e.message);
    }
  }
  return g;
}

// Build FRM + SSH groups
// Profile left edge is at x=0 in normalised space → world x = 0 * SCALE = 0
// We offset each group so the LEFT edge sits at world x=0 for correct pivot.
const frmGroup = new THREE.Group(); frmGroup.name = 'FRM';
const sshGroup = new THREE.Group(); sshGroup.name = 'SSH';

// Centre vertically: shift Y by -profH/2
const oY = -profH / 2;

for (const [name, data] of Object.entries(PROFILE.layers)) {
  const mesh = buildLayer(name, data);
  mesh.position.set(0, oY, 0);  // X=0 = left edge of profile (pivot point for side-open)
  (data.group === 'FRM' ? frmGroup : sshGroup).add(mesh);
}

// FRM stays at origin
scene.add(frmGroup);

// SSH: wrap in a pivot at the LEFT edge (x = 0) so rotation pivots correctly
// sshGroup left edge is already at x=0, so the pivot group sits at x=0
const leftPivot = new THREE.Group();
leftPivot.name = 'sash_pivot_left';
leftPivot.add(sshGroup);
scene.add(leftPivot);

// ── Layer list UI ─────────────────────────────────────────────────────────
const listEl = document.getElementById('layer-list');
for (const [name, data] of Object.entries(PROFILE.layers)) {
  const pts = data.contours.reduce((s, c) => s + c.pointCount, 0);
  const row = document.createElement('div');
  row.className = 'layer-row group-' + (data.group ?? 'unknown').toLowerCase();
  row.innerHTML = '<span class="dot"></span><span class="layer-name">' + name + '</span>'
                + '<span class="layer-pts">' + pts + ' pts</span>';
  listEl.appendChild(row);
}

// ── Animation ─────────────────────────────────────────────────────────────
const ease = t => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

// Phase 1: Side open  → rotate leftPivot around Y axis by -90°
// Phase 2: Tilt       → rotate leftPivot around X axis by +15°
const anim = [
  { axis: 'y', from: 0, to: -Math.PI / 2, dur: 1200, bar: 'bar1', pct: 'p1-pct' },
  { axis: 'x', from: 0, to:  Math.PI / 12, dur:  900, bar: 'bar2', pct: 'p2-pct' },
];

let phase = 0, phStart = null, running = true;

function resetAnim() {
  phase = 0; phStart = null; running = true;
  leftPivot.rotation.set(0, 0, 0);
  anim.forEach(a => {
    document.getElementById(a.bar).style.width = '0%';
    document.getElementById(a.pct).textContent = '0%';
  });
}
document.getElementById('btn-replay').addEventListener('click', resetAnim);

// ── Render loop ───────────────────────────────────────────────────────────
function loop(ts) {
  requestAnimationFrame(loop);
  controls.update();

  if (running && phase < anim.length) {
    if (phStart === null) phStart = ts;
    const a   = anim[phase];
    const t   = Math.min((ts - phStart) / a.dur, 1);
    const val = a.from + (a.to - a.from) * ease(t);
    leftPivot.rotation[a.axis] = val;

    const pct = Math.round(t * 100);
    document.getElementById(a.bar).style.width = pct + '%';
    document.getElementById(a.pct).textContent = pct + '%';

    if (t >= 1) {
      phase++;
      phStart = null;
      if (phase >= anim.length) {
        running = false;
        setTimeout(resetAnim, 2200);
      }
    }
  }

  renderer.render(scene, camera);
}
requestAnimationFrame(loop);

// ── Resize ────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const w = mount.clientWidth, h = mount.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
</script>
</body>
</html>`;

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf8');
  }
  return html;
}

// ─── Vite/Three.js scene builder (browser) ───────────────────────────────────

/**
 * Build a Three.js scene from profile data (browser entry point).
 * THREE must be passed in (not imported here to avoid Node.js conflicts).
 *
 * @param {object}      THREE        - Three.js module
 * @param {object}      profileData  - prepared JSON
 * @param {HTMLElement} mountEl      - DOM element
 * @param {object}      opts
 */
export function buildF100TScene(THREE, profileData, mountEl, opts = {}) {
  const bbox   = profileData.meta.bounds.normalised;
  const SCALE  = opts.scale ?? 0.1;
  const DEPTH  = (opts.depthMm ?? 70) * SCALE;
  const profW  = bbox.maxX * SCALE;
  const profH  = bbox.maxY * SCALE;

  function makeMat(color, extra = {}) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.08, ...extra });
  }

  const MATS = {
    FRM_EXT:     makeMat(0xc8bca8),
    FRM_INT:     makeMat(0xddd0c0),
    GSK_FRM_EXT: makeMat(0x181818, { roughness: 0.95, metalness: 0 }),
    SSH_EXT:     makeMat(0xb8a898),
    SSH_INT:     makeMat(0xc8b8a8),
    GSK_SSH_EXT: makeMat(0x111111, { roughness: 0.95, metalness: 0 }),
    GSK_SSH_INT: makeMat(0x111111, { roughness: 0.95, metalness: 0 }),
    BZD:         makeMat(0xd0c0b0),
    GSK_BZD:     makeMat(0x111111, { roughness: 0.95, metalness: 0 }),
    SPACER:      makeMat(0x888888, { metalness: 0.55, roughness: 0.35 }),
    GLS_INT:     new THREE.MeshPhysicalMaterial({ color: 0xd0eaff, roughness: 0.04, transparent: true, opacity: 0.30 }),
    GLS_EXT:     new THREE.MeshPhysicalMaterial({ color: 0xc8e0f8, roughness: 0.04, transparent: true, opacity: 0.25 }),
  };
  const DEF_MAT = makeMat(0xaaaaaa);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  mountEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d1e);

  const camera = new THREE.PerspectiveCamera(28, mountEl.clientWidth / mountEl.clientHeight, 0.01, 800);
  camera.position.set(6, 4.5, 26);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xfff8e8, 2.4);
  key.position.set(10, 16, 14); key.castShadow = true;
  scene.add(key);
  scene.add(Object.assign(new THREE.DirectionalLight(0xb0ccff, 0.65), { position: new THREE.Vector3(-8, 4, 6) }));

  function buildLayer(name, data) {
    const g   = new THREE.Group();
    const mat = MATS[name] ?? DEF_MAT;
    for (const c of data.contours) {
      if (c.points.length < 3) continue;
      const shape = new THREE.Shape();
      shape.moveTo(c.points[0].x * SCALE, c.points[0].y * SCALE);
      for (let i = 1; i < c.points.length; i++) shape.lineTo(c.points[i].x * SCALE, c.points[i].y * SCALE);
      try {
        g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false }), mat));
      } catch {}
    }
    return g;
  }

  const oY = -profH / 2;
  const frmGroup = new THREE.Group();
  const sshGroup = new THREE.Group();

  for (const [name, data] of Object.entries(profileData.layers)) {
    const mesh = buildLayer(name, data);
    mesh.position.y = oY;
    (data.group === 'FRM' ? frmGroup : sshGroup).add(mesh);
  }

  scene.add(frmGroup);
  const leftPivot = new THREE.Group();
  leftPivot.add(sshGroup);
  scene.add(leftPivot);

  let animId;
  function renderLoop() {
    animId = requestAnimationFrame(renderLoop);
    renderer.render(scene, camera);
  }
  renderLoop();

  return {
    scene, camera, renderer,
    groups: { frmGroup, sshGroup, leftPivot },
    stop: () => cancelAnimationFrame(animId),
  };
}

/**
 * Animate the sash group (F100T tilt-and-turn).
 *
 * @param {object}  leftPivot    - THREE.Group wrapping the sash, pivots at left edge
 * @param {object}  profileData  - prepared JSON (reads animation.phases)
 * @param {object}  opts
 * @param {boolean} opts.loop    - auto-loop (default true)
 * @param {number}  opts.pause   - pause ms between loops (default 2000)
 */
export function animateF100T(leftPivot, profileData, opts = {}) {
  const shouldLoop = opts.loop  ?? true;
  const pauseMs    = opts.pause ?? 2000;
  const phases     = profileData.animation.phases;

  const ease = t => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

  const cfg = phases.map(p => ({
    axis: p.axis.toLowerCase(),
    from: 0,
    to:   (p.angleDeg * Math.PI) / 180,
    dur:  p.durationMs,
  }));

  let phase = 0, phStart = null, complete = false;

  function frame(ts) {
    if (complete) return;
    if (phStart === null) phStart = ts;
    const c   = cfg[phase];
    const t   = Math.min((ts - phStart) / c.dur, 1);
    leftPivot.rotation[c.axis] = c.from + (c.to - c.from) * ease(t);

    if (t >= 1) {
      phase++;
      phStart = null;
      if (phase >= cfg.length) {
        if (shouldLoop) {
          setTimeout(() => {
            phase = 0; phStart = null;
            leftPivot.rotation.set(0, 0, 0);
            requestAnimationFrame(frame);
          }, pauseMs);
        } else {
          complete = true;
        }
        return;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    stop:  () => { complete = true; },
    reset: () => {
      complete = false; phase = 0; phStart = null;
      leftPivot.rotation.set(0, 0, 0);
      requestAnimationFrame(frame);
    },
  };
}

// ─── CLI entry point ─────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].includes('f100t_threejs_scene')) {
  const args   = process.argv.slice(2);
  const inJson = args[0];
  let outHtml  = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' && args[i + 1]) outHtml = args[++i];
  }

  if (!inJson) {
    console.error('Usage: node f100t_threejs_scene.mjs <prepared.json> [--out preview.html]');
    process.exit(1);
  }

  const profileData = JSON.parse(fs.readFileSync(inJson, 'utf8'));
  outHtml ??= inJson.replace(/\.json$/i, '_preview.html');

  generatePreviewHTML(profileData, outHtml);
  console.log(`\n✅ Preview HTML written: ${outHtml}`);
  console.log('   Open in a browser to see the F100T tilt-and-turn animation.\n');
}
