/**
 * prepare_iglo_edge_slide.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Recursive DXF Pre-processor for Iglo Edge (SLE201) Horizontal Sliding Door
 * Uses dxf-parser to resolve nested block references (INSERTs) with transforms.
 *
 * Usage:
 *   node scratch/prepare_iglo_edge_slide.mjs <input.dxf> [--out output.json]
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

// ─── Constants ───────────────────────────────────────────────────────────────
const SNAP_TOLERANCE   = 0.05;  // mm
const ARC_SEGMENTS     = 24;    // subdivisions per arc
const SIMPLIFY_TOLERANCE = 0.05; // mm

// Target layers mapping to groups (Child1 and Child2)
const LAYER_GROUP_MAP = {
  // Child1 (Glass, sash, glazing bead, seals)
  'BZD': 'Child1',
  'DOOR_FRM_EXT': 'Child1',
  'DOOR_FRM_INT': 'Child1',
  'GLS_EXT': 'Child1',
  'GLS_INT': 'Child1',
  'GLS_MDL': 'Child1',
  'GSK_BZD': 'Child1',
  'GSK_SEAL_DOOR': 'Child1',
  'Spacer': 'Child1',
  'GSK_EXT_DOOR_GLS': 'Child1',
  'Profil stal': 'Child1',
  
  // Child2 (Sliding rails, support pieces, cover profiles)
  'Aluminium Rail': 'Child2',
  'BottomTop_EXT': 'Child2',
  'BottomTop_INT': 'Child2',
  'External hidden support piece': 'Child2',
  'Hidden Piece': 'Child2',
  'GSK_HIDDEN_PIECE_EXT': 'Child2',
  'GSK_LARGE_UNDERNEATH_DOOR': 'Child2',
  'Profile cover exterior': 'Child2'
};

const TARGET_LAYERS = new Set(Object.keys(LAYER_GROUP_MAP));

// Group lists for output metadata
const GROUP_MAP = {
  Child1: Object.keys(LAYER_GROUP_MAP).filter(k => LAYER_GROUP_MAP[k] === 'Child1'),
  Child2: Object.keys(LAYER_GROUP_MAP).filter(k => LAYER_GROUP_MAP[k] === 'Child2')
};

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Approximation of an arc in radians */
function arcToPolylineRad(cx, cy, r, startRad, endRad, segments = ARC_SEGMENTS) {
  let s = startRad;
  let e = endRad;
  if (e <= s) e += 2 * Math.PI;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = s + (e - s) * (i / segments);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

/** Bulge to arc converter for LWPOLYLINEs */
function bulgeToArcPts(p1, p2, bulge, segments = ARC_SEGMENTS) {
  const theta = 4 * Math.atan(Math.abs(bulge));
  const d     = dist(p1, p2) / 2;
  const r     = d / Math.sin(theta / 2);
  const mx    = (p1.x + p2.x) / 2;
  const my    = (p1.y + p2.y) / 2;
  const dx    = p2.x - p1.x;
  const dy    = p2.y - p1.y;
  const len   = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return [];
  const px    = -dy / len;
  const py    =  dx / len;
  const s     = Math.sqrt(Math.max(0, r * r - d * d));
  const sign  = bulge > 0 ? 1 : -1;
  const cx    = mx + sign * s * px;
  const cy    = my + sign * s * py;

  let startA = Math.atan2(p1.y - cy, p1.x - cx);
  let endA   = Math.atan2(p2.y - cy, p2.x - cx);
  if (bulge > 0 && endA < startA) endA += 2 * Math.PI;
  if (bulge < 0 && endA > startA) startA += 2 * Math.PI;

  const pts = [];
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const a = startA + (endA - startA) * t;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

// ─── Douglas-Peucker Line Simplification ──────────────────────────────────────

function perpendicularDistance(point, lineStart, lineEnd) {
  let dx = lineEnd.x - lineStart.x;
  let dy = lineEnd.y - lineStart.y;
  const mag = Math.hypot(dx, dy);
  if (mag > 0.0) { dx /= mag; dy /= mag; }
  const pvx = point.x - lineStart.x;
  const pvy = point.y - lineStart.y;
  const pvdot = dx * pvx + dy * pvy;
  const rx = pvx - pvdot * dx;
  const ry = pvy - pvdot * dy;
  return Math.hypot(rx, ry);
}

function simplifyDouglasPeucker(points, epsilon) {
  if (points.length <= 2) return points;
  let dmax = 0, index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) { index = i; dmax = d; }
  }
  if (dmax > epsilon) {
    const rec1 = simplifyDouglasPeucker(points.slice(0, index + 1), epsilon);
    const rec2 = simplifyDouglasPeucker(points.slice(index), epsilon);
    return rec1.slice(0, -1).concat(rec2);
  } else {
    return [points[0], points[end]];
  }
}

function simplifyContour(points, epsilon) {
  if (points.length <= 3) return points;
  let dmax = 0, splitIdx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = Math.hypot(points[i].x - points[0].x, points[i].y - points[0].y);
    if (d > dmax) { dmax = d; splitIdx = i; }
  }
  if (splitIdx === 0) return points;
  const half1 = simplifyDouglasPeucker(points.slice(0, splitIdx + 1), epsilon);
  const half2 = simplifyDouglasPeucker(points.slice(splitIdx), epsilon);
  return half1.slice(0, -1).concat(half2);
}

// ─── Segment chaining ─────────────────────────────────────────────────────────

function angleBetween(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (mag1 === 0 || mag2 === 0) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.acos(cosTheta);
}

function chainSegments(segments, tol = SNAP_TOLERANCE) {
  if (segments.length === 0) return [];
  const unused = [...segments];
  const chains = [];

  while (unused.length > 0) {
    let seg = unused.splice(0, 1)[0];
    let chain = [...seg.pts];
    let chainEnd = seg.end;
    let currentDir = { x: seg.end.x - seg.start.x, y: seg.end.y - seg.start.y };

    let changed = true;
    while (changed) {
      changed = false;
      let bestIdx = -1;
      let bestIsRev = false;
      let bestDist = Infinity;
      let bestAngleDiff = Infinity;

      for (let i = 0; i < unused.length; i++) {
        const s = unused[i];
        
        // Forward check
        let d = dist(chainEnd, s.start);
        if (d <= tol) {
          let nextDir = { x: s.end.x - s.start.x, y: s.end.y - s.start.y };
          let aDiff = angleBetween(currentDir, nextDir);
          if (d < bestDist - 0.001 || (Math.abs(d - bestDist) <= 0.001 && aDiff < bestAngleDiff)) {
              bestDist = d;
              bestAngleDiff = aDiff;
              bestIdx = i;
              bestIsRev = false;
          }
        }
        
        // Reverse check
        const rev = { start: s.end, end: s.start, pts: [...s.pts].reverse() };
        d = dist(chainEnd, rev.start);
        if (d <= tol) {
          let nextDir = { x: rev.end.x - rev.start.x, y: rev.end.y - rev.start.y };
          let aDiff = angleBetween(currentDir, nextDir);
          if (d < bestDist - 0.001 || (Math.abs(d - bestDist) <= 0.001 && aDiff < bestAngleDiff)) {
              bestDist = d;
              bestAngleDiff = aDiff;
              bestIdx = i;
              bestIsRev = true;
          }
        }
      }

      if (bestIdx !== -1) {
          const s = unused.splice(bestIdx, 1)[0];
          const pts = bestIsRev ? [...s.pts].reverse() : s.pts;
          chain.push(...pts.slice(1));
          chainEnd = pts[pts.length - 1];
          const beforeLast = pts[pts.length - 2];
          currentDir = { x: chainEnd.x - beforeLast.x, y: chainEnd.y - beforeLast.y };
          changed = true;
      }
    }
    chains.push(chain);
  }
  return chains;
}

// ─── Close + snap a chain ────────────────────────────────────────────────────
function closeAndSnap(pts, tol = SNAP_TOLERANCE, forceClosed = false) {
  if (pts.length < 2) return pts;
  const first = pts[0];
  const last  = pts[pts.length - 1];
  const gap   = dist(first, last);

  if (gap === 0) {
    pts.pop();
  } else if (gap <= tol) {
    pts.pop();
  }
  return pts;
}

// ─── SVG + Three.js output helpers ───────────────────────────────────────────
function toSvgPath(points) {
  if (!points.length) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ` +
         rest.map(p => `L ${p.x} ${p.y}`).join(' ') +
         ' Z';
}

function toThreeShapeCommands(points) {
  if (!points.length) return [];
  const cmds = [{ cmd: 'moveTo', x: points[0].x, y: points[0].y }];
  for (let i = 1; i < points.length; i++) {
    cmds.push({ cmd: 'lineTo', x: points[i].x, y: points[i].y });
  }
  return cmds;
}

// ─── Transform logic ─────────────────────────────────────────────────────────

function transformPoint(pt, tx) {
  // 1. Scale
  let xs = pt.x * tx.scaleX;
  let ys = pt.y * tx.scaleY;
  // 2. Rotate
  let xr = xs * Math.cos(tx.rotation) - ys * Math.sin(tx.rotation);
  let yr = xs * Math.sin(tx.rotation) + ys * Math.cos(tx.rotation);
  // 3. Translate
  return {
    x: xr + tx.x,
    y: yr + tx.y
  };
}

// ─── Main Program ────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2);
  const inFile  = args[0];
  let   outFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' && args[i + 1]) { outFile = args[++i]; }
  }

  if (!inFile) {
    console.error('Usage: node prepare_iglo_edge_slide.mjs <input.dxf> [--out output.json]');
    process.exit(1);
  }

  console.log(`\n📂 Parsing DXF file: ${inFile}`);
  const text = fs.readFileSync(inFile, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);
  console.log(`   Parsed ${dxf.entities.length} top-level entities and ${Object.keys(dxf.blocks).length} block definitions.`);

  // Buffer to collect segments for each target layer
  // A segment is represented as: { start: {x,y}, end: {x,y}, pts: [{x,y}] }
  const layerSegments = {};
  TARGET_LAYERS.forEach(l => { layerSegments[l] = []; });

  // Recursive parser function
  function processEntities(entities, tx) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          const localRot = (ent.rotation || 0) * Math.PI / 180;
          const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
          const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;

          // Compose transform
          const posTransformed = transformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
          const nextTx = {
            x: posTransformed.x,
            y: posTransformed.y,
            rotation: tx.rotation + localRot,
            scaleX: tx.scaleX * localScaleX,
            scaleY: tx.scaleY * localScaleY
          };
          processEntities(block.entities, nextTx);
        }
      } else {
        const layerUpper = ent.layer?.toUpperCase();
        // Match the target layer list (case-insensitive)
        const matchedLayer = Array.from(TARGET_LAYERS).find(tl => tl.toUpperCase() === layerUpper);
        if (!matchedLayer) return;

        if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
          // 1. Expand bulges to plain local point array
          const localPts = [];
          const verts = ent.vertices;
          if (!verts || verts.length === 0) return;

          const isClosed = (ent.shape || (ent.flag & 1) !== 0);

          for (let i = 0; i < verts.length; i++) {
            const v = verts[i];
            localPts.push({ x: v.x, y: v.y });
            if (v.bulge !== undefined && v.bulge !== 0 && (i < verts.length - 1 || isClosed)) {
              const next = verts[(i + 1) % verts.length];
              const arc = bulgeToArcPts(v, next, v.bulge);
              // bulgeToArcPts returns points including end-point; slice it off to avoid duplicates
              localPts.push(...arc.slice(0, -1));
            }
          }

          // 2. Transform local points to world coordinates
          const worldPts = localPts.map(pt => transformPoint(pt, tx));

          // 3. Store as individual line segments for chaining
          for (let i = 0; i < worldPts.length - 1; i++) {
            const s = worldPts[i];
            const e = worldPts[i + 1];
            layerSegments[matchedLayer].push({ start: s, end: e, pts: [s, e] });
          }
          if (isClosed && worldPts.length > 2) {
            const s = worldPts[worldPts.length - 1];
            const e = worldPts[0];
            layerSegments[matchedLayer].push({ start: s, end: e, pts: [s, e] });
          }

        } else if (ent.type === 'LINE') {
          if (!ent.vertices || ent.vertices.length < 2) return;
          const sLocal = ent.vertices[0];
          const eLocal = ent.vertices[1];
          const sWorld = transformPoint(sLocal, tx);
          const eWorld = transformPoint(eLocal, tx);
          layerSegments[matchedLayer].push({ start: sWorld, end: eWorld, pts: [sWorld, eWorld] });

        } else if (ent.type === 'ARC') {
          // Convert ARC center/radius to polyline approximation in local coords first
          const localPts = arcToPolylineRad(ent.center.x, ent.center.y, ent.radius, ent.startAngle, ent.endAngle);
          const worldPts = localPts.map(pt => transformPoint(pt, tx));
          for (let i = 0; i < worldPts.length - 1; i++) {
            const s = worldPts[i];
            const e = worldPts[i + 1];
            layerSegments[matchedLayer].push({ start: s, end: e, pts: [s, e] });
          }
        }
      }
    });
  }

  // Run recursive processing starting at top-level with identity transform
  const rootTx = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
  processEntities(dxf.entities, rootTx);

  console.log(`\nStitching and simplify contours...`);
  const rawLayerContours = {};

  for (const layer of TARGET_LAYERS) {
    const segments = layerSegments[layer];
    if (segments.length === 0) continue;

    // Stitch segments using relaxed tolerance (1.5mm) to account for floating-point issues in CAD exports
    const chains = chainSegments(segments, 1.5);
    const closedContours = [];

    for (const chain of chains) {
      const pts = closeAndSnap(chain, SNAP_TOLERANCE, true);
      if (pts.length > 2) {
        // Apply Douglas-Peucker simplification
        const simplified = simplifyContour(pts, SIMPLIFY_TOLERANCE);
        if (simplified.length > 2) {
          closedContours.push(simplified);
        }
      }
    }

    if (closedContours.length > 0) {
      rawLayerContours[layer] = closedContours;
      const totalPoints = closedContours.reduce((sum, c) => sum + c.length, 0);
      console.log(`   ${layer.padEnd(30)} → ${closedContours.length} contour(s), ${totalPoints} vertices`);
    }
  }

  // ── Global Bounding Box Calculation ──
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const contours of Object.values(rawLayerContours)) {
    for (const c of contours) {
      for (const p of c) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }
  }

  if (minX === Infinity) {
    console.error("❌ Error: No geometry extracted from target layers. Check layer naming mapping.");
    process.exit(1);
  }

  console.log(`\n📐 World Bounding Box (Raw):`);
  console.log(`   X: ${minX.toFixed(4)} → ${maxX.toFixed(4)}  (width: ${(maxX - minX).toFixed(4)} mm)`);
  console.log(`   Y: ${minY.toFixed(4)} → ${maxY.toFixed(4)}  (height: ${(maxY - minY).toFixed(4)} mm)`);

  // Translate all vertices to place the bounding-box minimum at (0,0)
  const output = {
    meta: {
      source: path.basename(inFile),
      system: 'IGLO_EDGE',
      type: 'SLE201',
      bounds: {
        raw: { minX, minY, maxX, maxY },
        normalised: {
          minX: 0,
          minY: 0,
          maxX: parseFloat((maxX - minX).toFixed(4)),
          maxY: parseFloat((maxY - minY).toFixed(4))
        }
      }
    },
    groups: GROUP_MAP,
    layers: {}
  };

  for (const [layer, contours] of Object.entries(rawLayerContours)) {
    const normalisedContours = contours.map(c => {
      return c.map(p => ({
        x: parseFloat((p.x - minX).toFixed(6)),
        y: parseFloat((p.y - minY).toFixed(6))
      }));
    });

    output.layers[layer] = {
      group: LAYER_GROUP_MAP[layer] || null,
      contours: normalisedContours.map((pts, idx) => {
        return {
          id: `${layer}_${idx}`,
          pointCount: pts.length,
          svgPath: toSvgPath(pts),
          threeShape: toThreeShapeCommands(pts),
          points: pts
        };
      })
    };
  }

  // ── Write output ──
  const json = JSON.stringify(output, null, 2);
  if (outFile) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, json);
    console.log(`\n✅ Output saved successfully to: ${outFile}\n`);
  } else {
    const defaultOut = inFile.replace(/\.dxf$/i, '_prepared.json');
    fs.writeFileSync(defaultOut, json);
    console.log(`\n✅ Output saved successfully to: ${defaultOut}\n`);
  }
}

main().catch(err => {
  console.error("❌ Exception occurred:", err);
  process.exit(1);
});
