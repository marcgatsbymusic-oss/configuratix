// engine/assemble3d.js
// Drop-in: catalog + spec -> THREE.Group of a finished window.
// Geometry comes from three_build.js (one Shape+holes per profile). Placement
// comes from planWindow3D (pure, testable). Junction lap comes from recipes.
//
// Convention: window lies in world XY. +X = width, +Y = height, +Z = interior
// depth. A profile is built in local XY (cross-section) and extruded along
// local +Z (the run length). Each member is oriented with an explicit basis:
//   zAxis = run direction, xAxis = across-face (points toward aperture),
//   yAxis = depth (world +Z). Right-handed: xAxis × yAxis = zAxis.

import { buildProfileMesh, pvcMaterial, sealMaterial } from "./three_build.js";
import { matchRecipe } from "./assemble.js";

const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];

// shift a profile's loops so its bbox-min corner sits at local origin
function atOrigin(profile) {
  const [x0, y0] = profile.bbox;
  return profile.loops.map(L => ({ closed: L.closed, pts: L.pts.map(([x, y]) => [x - x0, y - y0]) }));
}
function dims(profile) { const b = profile.bbox; return { w: b[2]-b[0], d: b[3]-b[1] }; }

// ---------- PURE LAYOUT ----------
// Returns a list of members: { role, profile, length, origin:[x,y,z], basis:{x,y,z} }
// No THREE needed -> unit-testable.
export function planWindow3D(cat, spec) {
  const P = cat.profiles;
  const sel = spec.selection;
  const W = spec.width, H = spec.height;
  const frame = P[sel.frame];
  const { w: fw, d: fd } = dims(frame);
  const members = [];

  // basis from a run angle: z=run, x=inner (90deg left of run), y=depth(+Z).
  // x cross y === z  => always right-handed; depth always +Z (consistent front).
  const basisFor = (theta) => {
    const c = Math.cos(theta), s = Math.sin(theta);
    return { x: [-s, c, 0], y: [0, 0, 1], z: [c, s, 0] };
  };
  const HALF = Math.PI / 2;

  // FRAME: traverse the outer rectangle counter-clockwise from bottom-left.
  // Full-length members; corners overlap INSIDE the frame body (clean, no gaps).
  const frameEdges = [
    { role: "frame:sill",  theta: 0,        origin: [0, 0, 0], length: W },
    { role: "frame:jambR", theta: HALF,     origin: [W, 0, 0], length: H },
    { role: "frame:head",  theta: Math.PI,  origin: [W, H, 0], length: W },
    { role: "frame:jambL", theta: 3 * HALF, origin: [0, H, 0], length: H },
  ];
  for (const e of frameEdges)
    members.push({ role: e.role, profile: frame, length: e.length, origin: e.origin, basis: basisFor(e.theta) });

  const inner = { x: fw, y: fw, w: W - 2 * fw, h: H - 2 * fw };

  // DIVISION -> cells + mullion, with sash lap from the mullion+sash recipe (no gap).
  let cells;
  if (spec.division === "vertical") {
    const mull = P[sel.mullion_movable] || P[sel.mullion_fixed];
    const { w: mw } = dims(mull);
    const cx = inner.x + inner.w * (spec.at ?? 0.5);
    const rec = matchRecipe(cat.recipes, ["mullion_fixed", "sash"]);
    const lap = rec ? Math.abs(rec.parts.find(p => p.component === "sash")?.offset?.[0] ?? 6) : 6;
    members.push({ role: "mullion", profile: mull, length: inner.h,
      origin: [cx - mw / 2, inner.y, fd * 0.15], basis: basisFor(HALF) });
    cells = [
      { x: inner.x, y: inner.y, w: (cx - mw / 2 + lap) - inner.x, h: inner.h },
      { x: cx + mw / 2 - lap, y: inner.y, w: (inner.x + inner.w) - (cx + mw / 2 - lap), h: inner.h },
    ];
  } else {
    cells = [{ x: inner.x, y: inner.y, w: inner.w, h: inner.h }];
  }

  // SASH around each cell (CCW, same basis rule) + glass pane.
  if (spec.glazed !== false && sel.sash) {
    const sash = P[sel.sash];
    const { w: sw } = dims(sash);
    for (const c of cells) {
      const z = fd * 0.2;
      const se = [
        { role: "sash:sill",  theta: 0,        origin: [c.x, c.y, z],             length: c.w },
        { role: "sash:jambR", theta: HALF,     origin: [c.x + c.w, c.y, z],       length: c.h },
        { role: "sash:head",  theta: Math.PI,  origin: [c.x + c.w, c.y + c.h, z], length: c.w },
        { role: "sash:jambL", theta: 3 * HALF, origin: [c.x, c.y + c.h, z],       length: c.h },
      ];
      for (const e of se)
        members.push({ role: e.role, profile: sash, length: e.length, origin: e.origin, basis: basisFor(e.theta) });
      members.push({ role: "glass", glass: { x: c.x + sw, y: c.y + sw, w: c.w - 2 * sw, h: c.h - 2 * sw, z: z + fd * 0.1 } });
    }
  }
  return { members, inner, cells, frameDims: { fw, fd } };
}

// ---------- MESH BUILD (needs THREE) ----------
export function buildWindow3D(cat, spec, THREE, { envMap = null } = {}) {
  const group = new THREE.Group();
  const mat = pvcMaterial(THREE, { color: spec.color ?? 0xf2f2ef, envMap });
  const sealMat = sealMaterial(THREE);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x223138, transmission: 0.85, transparent: true, opacity: 0.5,
    roughness: 0.05, metalness: 0, ior: 1.5, thickness: 24, envMap, side: THREE.DoubleSide,
  });
  const setBasis = (mesh, b, origin) => {
    const m = new THREE.Matrix4().makeBasis(
      new THREE.Vector3(...b.x), new THREE.Vector3(...b.y), new THREE.Vector3(...b.z));
    mesh.applyMatrix4(m);
    mesh.position.set(...origin);
  };

  const plan = planWindow3D(cat, spec);
  for (const mem of plan.members) {
    if (mem.role === "glass") {
      const gg = mem.glass;
      const geo = new THREE.BoxGeometry(gg.w, gg.h, 24);
      const mesh = new THREE.Mesh(geo, glassMat);
      mesh.position.set(gg.x + gg.w/2, gg.y + gg.h/2, gg.z);
      group.add(mesh);
      continue;
    }
    const mesh = buildProfileMesh(atOrigin(mem.profile), mem.length, THREE, mat);
    if (!mesh) continue;
    setBasis(mesh, mem.basis, mem.origin);
    group.add(mesh);
  }
  // re-centre group on origin for easy framing
  const box = new THREE.Box3().setFromObject(group);
  const c = box.getCenter(new THREE.Vector3());
  group.position.sub(c);
  return group;
}
