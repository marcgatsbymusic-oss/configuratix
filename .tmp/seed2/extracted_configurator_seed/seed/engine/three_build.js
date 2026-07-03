// engine/three_build.js
// Turns a normalized profile (many loops) into ONE extruded mesh with holes —
// not a stack of solid slabs. This is the fix for chunky/stepped frames,
// missing walls, and block-like seals.
//
// Pure helpers (classifyLoops, signedArea, ...) run in Node for testing.
// loopsToShape / buildProfileMesh / pvcMaterial need a THREE namespace injected.

// ---------- pure geometry ----------
export function signedArea(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}
function centroid(pts) {
  let x = 0, y = 0;
  for (const [px, py] of pts) { x += px; y += py; }
  return [x / pts.length, y / pts.length];
}
function pointInPolygon([px, py], pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (((yi > py) !== (yj > py)) &&
        (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

// Decide which loop is the outer boundary and which are holes.
// Largest |area| = outer; any closed loop whose centroid lies inside it = hole.
// Returns indices into the original loops array. Open loops are dropped.
export function classifyLoops(loops) {
  const closed = loops.map((L, i) => ({ i, pts: L.pts }))
                      .filter((_, idx) => loops[idx].closed && loops[idx].pts.length >= 3);
  if (!closed.length) return { outer: -1, holes: [] };
  let outer = closed[0];
  let best = Math.abs(signedArea(outer.pts));
  for (const c of closed) {
    const a = Math.abs(signedArea(c.pts));
    if (a > best) { best = a; outer = c; }
  }
  const holes = closed
    .filter(c => c.i !== outer.i && pointInPolygon(centroid(c.pts), outer.pts))
    .map(c => c.i);
  return { outer: outer.i, holes };
}

// Force a loop to a desired winding (true = CCW). Returns a new pts array.
export function orient(pts, wantCCW) {
  const ccw = signedArea(pts) > 0;
  return ccw === wantCCW ? pts.slice() : pts.slice().reverse();
}

// ---------- THREE builders ----------
// Build one THREE.Shape (outer CCW) with holes (CW). Correct winding prevents
// dropped/inverted faces.
export function loopsToShape(loops, THREE) {
  const { outer, holes } = classifyLoops(loops);
  if (outer < 0) return null;
  const toVec = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = new THREE.Shape(toVec(orient(loops[outer].pts, true)));
  for (const h of holes) shape.holes.push(new THREE.Path(toVec(orient(loops[h].pts, false))));
  return shape;
}

// Extrude a profile along an edge of given length. depthDir handles which way
// the cross-section faces. Small bevel gives a realistic lit edge, not a razor.
export function buildProfileMesh(loops, length, THREE, material, { bevel = 0.4 } = {}) {
  const shape = loopsToShape(loops, THREE);
  if (!shape) return null;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: length, bevelEnabled: bevel > 0, bevelThickness: bevel,
    bevelSize: bevel, bevelSegments: 1, steps: 1,
  });
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  return mesh;
}

// PVC / painted-alu look. Drop tiled textures; let an HDR env map do the work.
export function pvcMaterial(THREE, { color = 0xf2f2ef, envMap = null } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.35, metalness: 0.0,
    clearcoat: 0.3, clearcoatRoughness: 0.4,
    envMap, envMapIntensity: 1.0, side: THREE.DoubleSide,
  });
}

// Thin EPDM seal lip — render this instead of the raw catalog gasket block.
// w,h in mm (e.g. 3 x 5). Matte, dark, slightly rounded via bevel.
export function sealMaterial(THREE, { color = 0x1b1b1b } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide,
  });
}
