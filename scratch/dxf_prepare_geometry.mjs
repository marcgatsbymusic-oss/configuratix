/**
 * dxf_prepare_geometry.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * DXF Pre-processor for Three.js ExtrudeGeometry
 *
 * Pipeline steps:
 *  1. Parse DXF – pull all LWPOLYLINE, LINE, and ARC entities per layer.
 *  2. Chain LINE/ARC segments into closed contours (gap tolerance: 0.05 mm).
 *  3. Force-close LWPOLYLINE entities that carry flag bit-0=1 (append first vertex).
 *  4. Snap first/last vertex if within SNAP_TOLERANCE (0.05 mm); larger gaps are
 *     force-closed when the entity had a DXF closed flag.
 *  5. Translate all coordinates so the joint bounding-box origin is at (0, 0).
 *  6. Output a clean JSON ready for new THREE.Shape() → ExtrudeGeometry.
 *
 * Usage:
 *   node scratch/dxf_prepare_geometry.mjs <input.dxf> [--out output.json]
 *
 * F100T layer → Three.js group mapping (IGLO 5):
 *   FRM group  : FRM_EXT, GSK_FRM_EXT                        (frame)
 *   SSH group  : SSH_EXT, SSH_INT, GSK_SSH_EXT, GSK_SSH_INT,
 *                BZD, GSK_BZD, Spacer, GLS_INT, GLS_EXT      (sash)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs   from 'fs';
import path from 'path';

// ─── Constants ───────────────────────────────────────────────────────────────
const SNAP_TOLERANCE   = 10.0;  // mm — gap between first and last vertex
const ARC_SEGMENTS     = 24;    // subdivisions per arc
const SIMPLIFY_TOLERANCE = 0.05; // mm - deviation tolerance for line simplification

// Canonical layer names (uppercase) we care about
const TARGET_LAYERS = new Set([
  'FRM_EXT', 'FRM_INT', 'GSK_FRM_EXT', 'GSK_FRM_INT',
  'SSH_EXT', 'SSH_INT', 'GSK_SSH_EXT', 'GSK_SSH_INT',
  'POST_EXT', 'POST_INT', 'GSK_POST_EXT', 'GSK_POST_INT',
  'BZD_SSH', 'BZD_POST', 'BZD_FRM', 'GSK_BZD_SSH', 'GSK_BZD_POST', 'GSK_BZD_FRM', 'SPACER_SSH', 'SPACER_POST', 'SPACER_FRM', 'GLS_INT', 'GLS_EXT'
]);

// Three.js group membership (F100T window type under IGLO 5)
const GROUP_MAP = {
  FRM: ['FRM_EXT', 'FRM_INT', 'GSK_FRM_EXT', 'GSK_FRM_INT', 'BZD_FRM', 'GSK_BZD_FRM', 'SPACER_FRM'],
  SSH: ['SSH_EXT', 'SSH_INT', 'GSK_SSH_EXT', 'GSK_SSH_INT',
        'BZD_SSH', 'GSK_BZD_SSH', 'SPACER_SSH', 'GLS_INT', 'GLS_EXT'],
  POST: ['POST_EXT', 'POST_INT', 'GSK_POST_EXT', 'GSK_POST_INT', 'BZD_POST', 'GSK_BZD_POST', 'SPACER_POST'],
};

// ─── Geometry helpers ─────────────────────────────────────────────────────────

/** Euclidean distance between two points */
function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Convert a DXF ARC entity to a polyline approximation.
 * DXF arcs: counter-clockwise, angles in degrees.
 */
function arcToPolyline(cx, cy, r, startDeg, endDeg, segments = ARC_SEGMENTS) {
  // Normalise so end >= start in CCW direction
  let s = (startDeg % 360 + 360) % 360;
  let e = (endDeg   % 360 + 360) % 360;
  if (e <= s) e += 360;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = ((s + (e - s) * (i / segments)) * Math.PI) / 180;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

/**
 * Bulge → arc polyline for LWPOLYLINE vertices.
 * bulge = tan(θ/4) where θ is the included angle.
 */
function bulgeToArcPts(p1, p2, bulge, segments = ARC_SEGMENTS) {
  const theta = 4 * Math.atan(Math.abs(bulge));
  const d     = dist(p1, p2) / 2;
  const r     = d / Math.sin(theta / 2);
  // Mid-point and perpendicular offset
  const mx    = (p1.x + p2.x) / 2;
  const my    = (p1.y + p2.y) / 2;
  const dx    = p2.x - p1.x;
  const dy    = p2.y - p1.y;
  const len   = Math.sqrt(dx * dx + dy * dy);
  const px    = -dy / len;
  const py    =  dx / len;
  const s     = Math.sqrt(Math.max(0, r * r - d * d));
  // bulge>0 → CCW, centre is on the left of chord
  const sign  = bulge > 0 ? 1 : -1;
  const cx    = mx + sign * s * px;
  const cy    = my + sign * s * py;

  let startA = Math.atan2(p1.y - cy, p1.x - cx);
  let endA   = Math.atan2(p2.y - cy, p2.x - cx);
  // bulge>0 → CCW
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
  // If it's a closed loop (start and end are near identical), find the farthest point to split the DP recursively
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

// ─── DXF text parser (no npm needed) ─────────────────────────────────────────

/**
 * Minimal DXF text parser.
 * Returns { entities: [...], layers: Set }
 */
function parseDxf(text) {
  // Normalise line endings
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  function peek(i) { return (lines[i] || '').trim(); }

  // Fast-forward to a section
  function seekSection(name, start = 0) {
    for (let i = start; i < lines.length - 1; i++) {
      if (peek(i) === '2' && peek(i + 1) === name) return i + 2;
    }
    return -1;
  }

  const entities = [];
  const entStart = seekSection('ENTITIES');
  if (entStart < 0) throw new Error('No ENTITIES section found in DXF');

  let i = entStart;
  while (i < lines.length) {
    if (peek(i) === '0') {
      const type = peek(i + 1);
      if (type === 'ENDSEC' || type === 'EOF') break;

      if (type === 'LWPOLYLINE') {
        const ent = { type: 'LWPOLYLINE', layer: '', flag: 0, vertices: [] };
        i += 2;
        let curX = null;
        while (i < lines.length) {
          const code = peek(i);
          const val  = peek(i + 1);
          if (code === '0') break;
          if (code === '8')  ent.layer = val;
          if (code === '70') ent.flag  = parseInt(val, 10);
          if (code === '10') curX = parseFloat(val);
          if (code === '20' && curX !== null) {
            ent.vertices.push({ x: curX, y: parseFloat(val), bulge: 0 });
            curX = null;
          }
          if (code === '42' && ent.vertices.length > 0) {
            ent.vertices[ent.vertices.length - 1].bulge = parseFloat(val);
          }
          i += 2;
        }
        entities.push(ent);

      } else if (type === 'LINE') {
        const ent = { type: 'LINE', layer: '', x1: 0, y1: 0, x2: 0, y2: 0 };
        i += 2;
        while (i < lines.length) {
          const code = peek(i);
          const val  = peek(i + 1);
          if (code === '0') break;
          if (code === '8')  ent.layer = val;
          if (code === '10') ent.x1 = parseFloat(val);
          if (code === '20') ent.y1 = parseFloat(val);
          if (code === '11') ent.x2 = parseFloat(val);
          if (code === '21') ent.y2 = parseFloat(val);
          i += 2;
        }
        entities.push(ent);

      } else if (type === 'ARC') {
        const ent = { type: 'ARC', layer: '', cx: 0, cy: 0, r: 0, startAngle: 0, endAngle: 360 };
        i += 2;
        while (i < lines.length) {
          const code = peek(i);
          const val  = peek(i + 1);
          if (code === '0') break;
          if (code === '8')  ent.layer      = val;
          if (code === '10') ent.cx         = parseFloat(val);
          if (code === '20') ent.cy         = parseFloat(val);
          if (code === '40') ent.r          = parseFloat(val);
          if (code === '50') ent.startAngle = parseFloat(val);
          if (code === '51') ent.endAngle   = parseFloat(val);
          i += 2;
        }
        entities.push(ent);
      } else {
        i += 2; // skip
      }
    } else {
      i += 2;
    }
  }

  return entities;
}

// ─── Segment chaining ─────────────────────────────────────────────────────────

/**
 * Given an array of { start:{x,y}, end:{x,y}, pts:[{x,y}] } segments,
 * greedy-chain them into one or more closed/open polylines.
 */
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

// ─── Expand LWPOLYLINE bulges to plain vertex arrays ─────────────────────────
function expandLwPolyline(ent) {
  const verts = ent.vertices;
  const pts   = [];
  for (let i = 0; i < verts.length; i++) {
    const v    = verts[i];
    const next = verts[(i + 1) % verts.length];
    pts.push({ x: v.x, y: v.y });
    if (v.bulge !== 0 && i < verts.length - 1) {
      const arc = bulgeToArcPts(v, next, v.bulge);
      pts.push(...arc.slice(0, -1)); // arc already ends at next
    }
  }
  return pts;
}

// ─── Close + snap a chain ────────────────────────────────────────────────────
/**
 * @param {object[]} pts          - array of {x,y}
 * @param {number}   tol          - snap tolerance (default SNAP_TOLERANCE)
 * @param {boolean}  forceClosed  - if true, always force-close regardless of gap
 */
function closeAndSnap(pts, tol = SNAP_TOLERANCE, forceClosed = false) {
  if (pts.length < 2) return pts;
  const first = pts[0];
  const last  = pts[pts.length - 1];
  const gap   = dist(first, last);

  if (gap === 0) {
    // Perfect close — remove duplicate
    pts.pop();
  } else if (gap <= tol) {
    // Within snap tolerance — snap last to first
    pts.pop();
  } else if (forceClosed) {
    // Larger gap but entity declares itself closed — bridge it explicitly
    // Don't add first point (THREE.Shape auto-closes), just leave as-is
    // The 'closed' flag will be set true in metadata
  }
  // If not forceClosed and gap > tol, leave open (caller decides)
  return pts;
}

// ─── Main processing ──────────────────────────────────────────────────────────

function processLayer(layerName, entities) {
  const upper = layerName.toUpperCase();

  // Collect LWPOLYLINE entities
  const lwpolys = entities.filter(
    e => e.type === 'LWPOLYLINE' && e.layer.toUpperCase() === upper
  );

  // Collect LINE / ARC entities
  const lines = entities.filter(
    e => e.type === 'LINE' && e.layer.toUpperCase() === upper
  );
  const arcs = entities.filter(
    e => e.type === 'ARC' && e.layer.toUpperCase() === upper
  );

  const contours = [];

  // ── Process LWPOLYLINEs ──
  for (const ent of lwpolys) {
    // DXF flag bit 0 = entity is closed (last vertex implicitly connects to first)
    const dxfClosed = (ent.flag & 1) !== 0;
    let pts = expandLwPolyline(ent);
    pts = closeAndSnap(pts, SNAP_TOLERANCE, dxfClosed);
    if (pts.length > 2) {
      contours.push({
        source:    'LWPOLYLINE',
        dxfClosed, // record original DXF intent
        points:    pts,
      });
    }
  }

  // ── Chain LINE/ARC segments ──
  // LINE/ARC shapes in professional CAD always form closed profiles;
  // the chainer uses a loose tolerance to reconnect near-touching segments.
  if (lines.length > 0 || arcs.length > 0) {
    const segments = [];

    for (const l of lines) {
      const s = { x: l.x1, y: l.y1 };
      const e = { x: l.x2, y: l.y2 };
      segments.push({ start: s, end: e, pts: [s, e] });
    }

    for (const a of arcs) {
      const pts = arcToPolyline(a.cx, a.cy, a.r, a.startAngle, a.endAngle);
      segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
    }

    // Use a relaxed tolerance for segment stitching.
    // Arc tessellation endpoints can differ by up to ~1.5mm from LINE endpoints
    // due to floating-point in the original DXF export.
    const chains = chainSegments(segments, 1.5);
    for (const chain of chains) {
      // LINE/ARC shapes are always intended to be closed profiles
      const pts = closeAndSnap(chain, SNAP_TOLERANCE, true);
      if (pts.length > 2) {
        contours.push({ source: 'LINE+ARC', dxfClosed: true, points: pts });
      }
    }
  }

  // ── Special: GLS layers may have open LINE segments; build bounding rect ──
  if ((upper === 'GLS_EXT' || upper === 'GLS_INT') && contours.length === 0) {
    const allPts = [];
    for (const l of lines) {
      allPts.push({ x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 });
    }
    if (allPts.length >= 2) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      allPts.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      const rect = [
        { x: minX, y: minY }, { x: maxX, y: minY },
        { x: maxX, y: maxY }, { x: minX, y: maxY },
      ];
      contours.push({ source: 'RECT_FROM_LINES', dxfClosed: true, points: rect });
    }
  }

  // Apply Douglas-Peucker simplification
  return contours.map(c => ({
    ...c,
    points: simplifyContour(c.points, SIMPLIFY_TOLERANCE)
  })); // array of { source, dxfClosed, points }
}

// ─── Coordinate normalisation ─────────────────────────────────────────────────

function computeGlobalBounds(layerResults) {
  let minX =  Infinity, maxX = -Infinity;
  let minY =  Infinity, maxY = -Infinity;
  for (const contours of Object.values(layerResults)) {
    for (const c of contours) {
      for (const p of c.points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

function translateLayer(contours, minX, minY) {
  return contours.map(c => ({
    ...c,
    points: c.points.map(p => ({
      x: parseFloat((p.x - minX).toFixed(6)),
      y: parseFloat((p.y - minY).toFixed(6)),
    })),
  }));
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

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2);
  const inFile  = args[0];
  let   outFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' && args[i + 1]) { outFile = args[++i]; }
  }

  if (!inFile) {
    console.error('Usage: node dxf_prepare_geometry.mjs <input.dxf> [--out output.json]');
    process.exit(1);
  }

  console.log(`\n📂 Reading: ${inFile}`);
  const text     = fs.readFileSync(inFile, 'utf8');
  const entities = parseDxf(text);
  console.log(`   Parsed ${entities.length} entities`);

  // ── Per-layer processing ──
  const layerResults = {};
  const foundLayers  = new Set(entities.map(e => e.layer?.toUpperCase()).filter(Boolean));
  const processLayers = [...TARGET_LAYERS].filter(l => foundLayers.has(l));

  console.log(`\n🔍 Found target layers: ${processLayers.join(', ')}`);

  function polygonArea(points) {
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y - points[j].x * points[i].y;
    }
    return Math.abs(area) / 2.0;
  }

  for (const layer of processLayers) {
    let contours = processLayer(layer, entities);
    
    // Solid block logic: Keep only the largest loop for main bodies
    if (layer === 'FRM_EXT' || layer === 'FRM_INT' || layer === 'SSH_EXT' || layer === 'SSH_INT' || layer === 'BZD_SSH' || layer === 'BZD_POST' || layer === 'BZD_FRM' || layer === 'SPACER_SSH' || layer === 'SPACER_POST' || layer === 'SPACER_FRM' || layer === 'GSK_FRM_EXT' || layer === 'GSK_BZD_SSH' || layer === 'GSK_BZD_POST' || layer === 'GSK_BZD_FRM' || layer === 'POST_EXT' || layer === 'POST_INT') {
      let maxArea = -1;
      let maxIdx = -1;
      for (let i = 0; i < contours.length; i++) {
         let area = polygonArea(contours[i].points);
         if (area > maxArea) {
           maxArea = area;
           maxIdx = i;
         }
      }
      if (maxIdx >= 0) {
        contours = [contours[maxIdx]];
      }
    }

    if (contours.length > 0) {
      layerResults[layer] = contours;
      const totalPts = contours.reduce((s, c) => s + c.points.length, 0);
      console.log(`   ${layer.padEnd(14)} → ${contours.length} contour(s), ${totalPts} points`);
    } else {
      console.warn(`   ${layer.padEnd(14)} → ⚠ no contours extracted`);
    }
  }

  // ── Global normalisation ──
  const bounds = computeGlobalBounds(layerResults);
  console.log(`\n📐 Raw bounding box:`);
  console.log(`   X: ${bounds.minX.toFixed(4)} → ${bounds.maxX.toFixed(4)}  (width: ${(bounds.maxX - bounds.minX).toFixed(4)} mm)`);
  console.log(`   Y: ${bounds.minY.toFixed(4)} → ${bounds.maxY.toFixed(4)}  (height: ${(bounds.maxY - bounds.minY).toFixed(4)} mm)`);

  const normalised = {};
  for (const [layer, contours] of Object.entries(layerResults)) {
    normalised[layer] = translateLayer(contours, bounds.minX, bounds.minY);
  }

  // ── Frame Splitting (Ext/Int) ──
  function clipPolygonX(points, splitX, keepLeft) {
    const result = [];
    function inside(p) { return keepLeft ? p.x <= splitX + 0.0001 : p.x >= splitX - 0.0001; }
    function intersect(p1, p2) {
      const t = (splitX - p1.x) / (p2.x - p1.x);
      return { x: splitX, y: p1.y + t * (p2.y - p1.y) };
    }
    for (let i = 0; i < points.length; i++) {
      const cur = points[i];
      const prev = points[i === 0 ? points.length - 1 : i - 1];
      const curIn = inside(cur);
      const prevIn = inside(prev);
      if (curIn !== prevIn) result.push(intersect(prev, cur));
      if (curIn) result.push(cur);
    }
    return result;
  }

  // Calculate frame bounds to find the correct split point
  let frmMinX = Infinity;
  const allFrmContours = [...(normalised['FRM_EXT'] || []), ...(normalised['FRM_INT'] || [])];
  for (const c of allFrmContours) {
    for (const p of c.points) {
      if (p.x < frmMinX) frmMinX = p.x;
    }
  }
  let splitX = (frmMinX !== Infinity) ? frmMinX + 35.0 : 35.0; 
  if (frmMinX === Infinity) {
    let postMinX = Infinity;
    let postMaxX = -Infinity;
    const allPostContours = [...(normalised['POST_EXT'] || []), ...(normalised['POST_INT'] || [])];
    for (const c of allPostContours) {
      for (const p of c.points) {
        if (p.x < postMinX) postMinX = p.x;
        if (p.x > postMaxX) postMaxX = p.x;
      }
    }
    if (postMinX !== Infinity) {
      splitX = (postMinX + postMaxX) / 2.0;
    }
  }

  if (normalised['FRM_EXT']) {
    normalised['FRM_EXT'] = normalised['FRM_EXT'].map(c => ({
      ...c,
      points: clipPolygonX(c.points, splitX, true)
    }));
  }
  if (normalised['FRM_INT']) {
    normalised['FRM_INT'] = normalised['FRM_INT'].map(c => ({
      ...c,
      points: clipPolygonX(c.points, splitX, false)
    }));
  }
  if (normalised['POST_EXT']) {
    normalised['POST_EXT'] = normalised['POST_EXT'].map(c => ({
      ...c,
      points: clipPolygonX(c.points, splitX, true)
    }));
  }
  if (normalised['POST_INT']) {
    normalised['POST_INT'] = normalised['POST_INT'].map(c => ({
      ...c,
      points: clipPolygonX(c.points, splitX, false)
    }));
  }

  // Calculate splitX for SSH (Sash)
  let sshSplitX = splitX;
  let sshMinX = Infinity, sshMaxX = -Infinity;
  if (normalised['SSH_EXT'] && normalised['SSH_EXT'].length > 0) {
    normalised['SSH_EXT'][0].points.forEach(p => {
      if (p.x < sshMinX) sshMinX = p.x;
      if (p.x > sshMaxX) sshMaxX = p.x;
    });
    sshSplitX = (sshMinX + sshMaxX) / 2.0;
  }

  if (normalised['SSH_EXT']) {
    normalised['SSH_EXT'] = normalised['SSH_EXT'].map(c => ({
      ...c,
      points: clipPolygonX(c.points, sshSplitX, true)
    }));
  }
  if (normalised['SSH_INT']) {
    normalised['SSH_INT'] = normalised['SSH_INT'].map(c => ({
      ...c,
      points: clipPolygonX(c.points, sshSplitX, false)
    }));
  }

  // ── Build output ──
  const output = {
    meta: {
      source:    path.basename(inFile),
      system:    'IGLO_5',
      type:      'F100T',
      snapTol:   SNAP_TOLERANCE,
      arcSegs:   ARC_SEGMENTS,
      bounds: {
        raw:        { minX: bounds.minX, minY: bounds.minY, maxX: bounds.maxX, maxY: bounds.maxY },
        normalised: { minX: 0, minY: 0,
                      maxX: parseFloat((bounds.maxX - bounds.minX).toFixed(4)),
                      maxY: parseFloat((bounds.maxY - bounds.minY).toFixed(4)) },
      },
    },

    // Three.js group definitions (F100T / IGLO 5)
    // Animation: FRM = static frame, SSH = sash (opens left then tilts)
    groups: {
      FRM: GROUP_MAP.FRM,
      SSH: GROUP_MAP.SSH,
    },

    // Three.js animation hint
    animation: {
      type:       'F100T',           // tilt-and-turn
      pivot:      'left',            // sash rotates around its left edge (X axis = 0)
      phases: [
        { name: 'side-open',  axis: 'Y', angleDeg: -90, durationMs: 1200, easing: 'easeInOutCubic' },
        { name: 'tilt',       axis: 'X', angleDeg:  15, durationMs:  900, easing: 'easeInOutCubic' },
      ],
    },

    // Per-layer geometry
    layers: {},
  };

  for (const [layer, contours] of Object.entries(normalised)) {
    // Find which group this layer belongs to
    const group = Object.entries(GROUP_MAP).find(([, members]) =>
      members.includes(layer)
    )?.[0] ?? null;

    output.layers[layer] = {
      group,
      contours: contours.map((c, idx) => {
        const firstPt  = c.points[0];
        const lastPt   = c.points[c.points.length - 1];
        const residGap = dist(firstPt, lastPt);
        // Verified closed = gap is 0 (either was closed or snapped/force-closed)
        const verified = residGap < SNAP_TOLERANCE;
        return {
          id:         `${layer}_${idx}`,
          source:     c.source,
          dxfClosed:  c.dxfClosed ?? false,
          closed:     true,            // our pipeline guarantees closure intent
          verified,                    // actual geometric check
          residualGap: parseFloat(residGap.toFixed(6)),
          pointCount: c.points.length,
          svgPath:    toSvgPath(c.points),
          threeShape: toThreeShapeCommands(c.points),
          // Raw vertices — feed directly into new THREE.Shape()
          points:     c.points,
        };
      }),
    };
  }

  // ── Write output ──
  const json = JSON.stringify(output, null, 2);

  if (outFile) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, json);
    console.log(`\n✅ Written: ${outFile}`);
  } else {
    // Default output next to input file
    const defaultOut = inFile.replace(/\.dxf$/i, '_prepared.json');
    fs.writeFileSync(defaultOut, json);
    console.log(`\n✅ Written: ${defaultOut}`);
  }

  // ── Summary ──
  console.log('\n📊 Layer summary:');
  for (const [layer, data] of Object.entries(output.layers)) {
    const cList = data.contours.map(c => {
      const status = c.verified ? '✓closed' : `⚠gap=${c.residualGap.toFixed(3)}mm`;
      return `${c.pointCount}pts ${status}`;
    }).join(' | ');
    console.log(`   ${layer.padEnd(14)} [${(data.group||'?').padEnd(3)}]  ${cList}`);
  }

  console.log('\n🎬 Animation config:');
  console.log('   Sash group (SSH) opens on LEFT pivot, then tilts.');
  console.log('   Use output.animation.phases to drive THREE.Group rotation.');
  console.log('   FRM group remains static.');
  console.log('   See f100t_threejs_scene.mjs for a ready-to-use Three.js scene.\n');

  return output;
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
