/**
 * extract_f2mpx_profiles.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Extracts the movable post (PST_EXT / PST_INT) profiles from the
 * IGL5_Movablepost_Fusion_processed.dxf for the F2MPX typology.
 *
 * Layer name mapping (DXF layer prefix → canonical name used in profile JSON):
 *   IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_SSH_MOVABLE_LEFT_EXT  → PST_EXT
 *   IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_SSH_MOVABLE_LEFT_INT  → PST_INT
 *   IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_GSK_MOVABLE_LEFT_EXT  → GSK_PST_EXT
 *   IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_GLS_MOVABLEPOST_EXT   → GLS_EXT (post)
 *   IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_GLS_MOVABLEPOST_INT   → GLS_INT (post)
 *   IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_SPACER_MOVABLEPOST    → SPACER_PST
 *   IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_BZD_MOVABLEPOST       → BZD_PST
 *   IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_GSK_MOVABLEPOST_INT   → GSK_PST_INT
 *   IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_GSK_MOVABLEPOST_BZD   → GSK_PST_BZD
 *
 * The FRM + SSH + glass for the outer frame and sashes are taken from the
 * existing IG5_F2XX1.json (those share the same frame/sash as all Iglo 5 windows).
 *
 * Usage:
 *   node scratch/extract_f2mpx_profiles.mjs
 */

import fs   from 'fs';
import path from 'path';

const DXF_PATH = 'C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\IGL5_Movablepost_Fusion_processed.dxf';

const OUT_PATH = 'src/data/profiles/IGLO5/IG5_F2MPX_post_only.json';

// Map: exact DXF layer name → canonical output key
const LAYER_MAP = {
  'IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_SSH_MOVABLE_LEFT_EXT': 'PST_EXT',
  'IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_SSH_MOVABLE_LEFT_INT': 'PST_INT',
  'IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_GSK_MOVABLE_LEFT_EXT': 'GSK_PST_EXT',
  'IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_GLS_MOVABLEPOST_EXT':  'GLS_PST_EXT',
  'IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_GLS_MOVABLEPOST_INT':  'GLS_PST_INT',
  'IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_SPACER_MOVABLEPOST':   'SPACER_PST',
  'IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_BZD_MOVABLEPOST':      'BZD_PST',
  'IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_GSK_MOVABLEPOST_INT':  'GSK_PST_INT',
  'IGL5_MOVABLE POST RIGHT OPENING v2_IGL5_GSK_MOVABLEPOST_BZD':  'GSK_PST_BZD',
};

// ─── Geometry helpers ─────────────────────────────────────────────────────────
const SNAP_TOL = 0.05;
const ARC_SEGS = 24;
const DP_EPSILON = 0.05;

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function arcToPolyline(cx, cy, r, startDeg, endDeg) {
  let s = (startDeg % 360 + 360) % 360;
  let e = (endDeg   % 360 + 360) % 360;
  if (e <= s) e += 360;
  const pts = [];
  for (let i = 0; i <= ARC_SEGS; i++) {
    const a = ((s + (e - s) * (i / ARC_SEGS)) * Math.PI) / 180;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function bulgeToArcPts(p1, p2, bulge) {
  const theta = 4 * Math.atan(Math.abs(bulge));
  const d  = dist(p1, p2) / 2;
  const r  = d / Math.sin(theta / 2);
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const px = -dy / len, py = dx / len;
  const s = Math.sqrt(Math.max(0, r * r - d * d));
  const sign = bulge > 0 ? 1 : -1;
  const cx = mx + sign * s * px, cy = my + sign * s * py;
  let startA = Math.atan2(p1.y - cy, p1.x - cx);
  let endA   = Math.atan2(p2.y - cy, p2.x - cx);
  if (bulge > 0 && endA < startA) endA += 2 * Math.PI;
  if (bulge < 0 && endA > startA) startA += 2 * Math.PI;
  const pts = [];
  for (let i = 1; i <= ARC_SEGS; i++) {
    const t = i / ARC_SEGS;
    const a = startA + (endA - startA) * t;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function expandLwPolyline(ent) {
  const verts = ent.vertices;
  const pts = [];
  for (let i = 0; i < verts.length; i++) {
    const v = verts[i];
    const next = verts[(i + 1) % verts.length];
    pts.push({ x: v.x, y: v.y });
    if (v.bulge !== 0 && i < verts.length - 1) {
      pts.push(...bulgeToArcPts(v, next, v.bulge).slice(0, -1));
    }
  }
  return pts;
}

function perpendicularDistance(pt, a, b) {
  let dx = b.x - a.x, dy = b.y - a.y;
  const mag = Math.hypot(dx, dy);
  if (mag > 0) { dx /= mag; dy /= mag; }
  const pvx = pt.x - a.x, pvy = pt.y - a.y;
  const pvd = dx * pvx + dy * pvy;
  return Math.hypot(pvx - pvd * dx, pvy - pvd * dy);
}

function douglasPeucker(pts, eps) {
  if (pts.length <= 2) return pts;
  let dmax = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpendicularDistance(pts[i], pts[0], pts[pts.length - 1]);
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax > eps) {
    return [...douglasPeucker(pts.slice(0, idx + 1), eps).slice(0, -1),
            ...douglasPeucker(pts.slice(idx), eps)];
  }
  return [pts[0], pts[pts.length - 1]];
}

function simplify(pts, eps) {
  if (pts.length <= 3) return pts;
  let dmax = 0, splitIdx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i].x - pts[0].x, pts[i].y - pts[0].y);
    if (d > dmax) { dmax = d; splitIdx = i; }
  }
  if (splitIdx === 0) return pts;
  const h1 = douglasPeucker(pts.slice(0, splitIdx + 1), eps);
  const h2 = douglasPeucker(pts.slice(splitIdx), eps);
  return [...h1.slice(0, -1), ...h2];
}

function closeChain(pts) {
  if (pts.length < 2) return pts;
  const gap = dist(pts[0], pts[pts.length - 1]);
  if (gap < SNAP_TOL) pts.pop();
  return pts;
}

function angleBetween(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m = Math.sqrt((v1.x**2 + v1.y**2) * (v2.x**2 + v2.y**2));
  if (m === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / m)));
}

function chainSegments(segments) {
  if (!segments.length) return [];
  const unused = [...segments];
  const chains = [];
  while (unused.length > 0) {
    let seg = unused.splice(0, 1)[0];
    let chain = [...seg.pts];
    let chainEnd = seg.end;
    let dir = { x: seg.end.x - seg.start.x, y: seg.end.y - seg.start.y };
    let changed = true;
    while (changed) {
      changed = false;
      let best = { idx: -1, rev: false, d: Infinity, aDiff: Infinity };
      for (let i = 0; i < unused.length; i++) {
        const s = unused[i];
        const tryConnect = (from, to, pts, rev) => {
          const d = dist(chainEnd, from);
          if (d <= 1.5) {
            const nd = { x: to.x - from.x, y: to.y - from.y };
            const a = angleBetween(dir, nd);
            if (d < best.d - 0.001 || (Math.abs(d - best.d) <= 0.001 && a < best.aDiff)) {
              best = { idx: i, rev, d, aDiff: a };
            }
          }
        };
        tryConnect(s.start, s.end, s.pts, false);
        tryConnect(s.end, s.start, s.pts, true);
      }
      if (best.idx !== -1) {
        const s = unused.splice(best.idx, 1)[0];
        const pts = best.rev ? [...s.pts].reverse() : s.pts;
        chain.push(...pts.slice(1));
        chainEnd = pts[pts.length - 1];
        const prev = pts[pts.length - 2];
        dir = { x: chainEnd.x - prev.x, y: chainEnd.y - prev.y };
        changed = true;
      }
    }
    chains.push(chain);
  }
  return chains;
}

// ─── DXF Parser ──────────────────────────────────────────────────────────────
function parseDxf(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  function peek(i) { return (lines[i] || '').trim(); }
  function seekSection(name, start = 0) {
    for (let i = start; i < lines.length - 1; i++) {
      if (peek(i) === '2' && peek(i + 1) === name) return i + 2;
    }
    return -1;
  }
  const entities = [];
  const entStart = seekSection('ENTITIES');
  if (entStart < 0) throw new Error('No ENTITIES section');
  let i = entStart;
  while (i < lines.length) {
    if (peek(i) === '0') {
      const type = peek(i + 1);
      if (type === 'ENDSEC' || type === 'EOF') break;
      if (type === 'LWPOLYLINE') {
        const ent = { type, layer: '', flag: 0, vertices: [] };
        i += 2;
        let curX = null;
        while (i < lines.length) {
          const code = peek(i), val = peek(i + 1);
          if (code === '0') break;
          if (code === '8') ent.layer = val;
          if (code === '70') ent.flag = parseInt(val, 10);
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
        const ent = { type, layer: '', x1: 0, y1: 0, x2: 0, y2: 0 };
        i += 2;
        while (i < lines.length) {
          const code = peek(i), val = peek(i + 1);
          if (code === '0') break;
          if (code === '8') ent.layer = val;
          if (code === '10') ent.x1 = parseFloat(val);
          if (code === '20') ent.y1 = parseFloat(val);
          if (code === '11') ent.x2 = parseFloat(val);
          if (code === '21') ent.y2 = parseFloat(val);
          i += 2;
        }
        entities.push(ent);
      } else if (type === 'ARC') {
        const ent = { type, layer: '', cx: 0, cy: 0, r: 0, startAngle: 0, endAngle: 360 };
        i += 2;
        while (i < lines.length) {
          const code = peek(i), val = peek(i + 1);
          if (code === '0') break;
          if (code === '8') ent.layer = val;
          if (code === '10') ent.cx = parseFloat(val);
          if (code === '20') ent.cy = parseFloat(val);
          if (code === '40') ent.r = parseFloat(val);
          if (code === '50') ent.startAngle = parseFloat(val);
          if (code === '51') ent.endAngle = parseFloat(val);
          i += 2;
        }
        entities.push(ent);
      } else { i += 2; }
    } else { i += 2; }
  }
  return entities;
}

function processLayer(layerName, entities) {
  const lwpolys = entities.filter(e => e.type === 'LWPOLYLINE' && e.layer === layerName);
  const lineEnts = entities.filter(e => e.type === 'LINE' && e.layer === layerName);
  const arcEnts  = entities.filter(e => e.type === 'ARC'  && e.layer === layerName);
  const contours = [];

  for (const ent of lwpolys) {
    const dxfClosed = (ent.flag & 1) !== 0;
    let pts = expandLwPolyline(ent);
    pts = closeChain(pts);
    if (pts.length > 2) contours.push(pts);
  }

  if (lineEnts.length > 0 || arcEnts.length > 0) {
    const segs = [];
    for (const l of lineEnts) {
      const s = { x: l.x1, y: l.y1 }, e = { x: l.x2, y: l.y2 };
      segs.push({ start: s, end: e, pts: [s, e] });
    }
    for (const a of arcEnts) {
      const pts = arcToPolyline(a.cx, a.cy, a.r, a.startAngle, a.endAngle);
      segs.push({ start: pts[0], end: pts[pts.length - 1], pts });
    }
    for (const chain of chainSegments(segs)) {
      const pts = closeChain(chain);
      if (pts.length > 2) contours.push(pts);
    }
  }

  return contours.map(pts => simplify(pts, DP_EPSILON));
}

function toSvgPath(pts) {
  if (!pts.length) return '';
  return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(function main() {
  console.log('📂 Reading DXF…');
  const text = fs.readFileSync(DXF_PATH, 'utf-8');
  const entities = parseDxf(text);
  console.log(`   ${entities.length} entities parsed`);

  // Per-layer extraction
  const rawLayers = {};
  for (const [dxfLayer, canonicalKey] of Object.entries(LAYER_MAP)) {
    const contours = processLayer(dxfLayer, entities);
    if (contours.length > 0) {
      rawLayers[canonicalKey] = contours;
      console.log(`   ✅ ${canonicalKey.padEnd(16)} ← ${contours.length} contour(s), ${contours.reduce((s,c)=>s+c.length,0)} pts`);
    } else {
      console.warn(`   ⚠️  ${canonicalKey.padEnd(16)} — no contours`);
    }
  }

  // Global bounding box (only PST layers for normalisation origin)
  const pstKeys = ['PST_EXT', 'PST_INT', 'GSK_PST_EXT'];
  let minX = Infinity, minY = Infinity;
  for (const key of pstKeys) {
    for (const contour of (rawLayers[key] || [])) {
      for (const p of contour) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
      }
    }
  }
  // Fall back to global min if pst layers empty
  if (!isFinite(minX)) {
    for (const contours of Object.values(rawLayers)) {
      for (const contour of contours) {
        for (const p of contour) {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
        }
      }
    }
  }
  console.log(`\n📐 Origin shift: minX=${minX.toFixed(4)}, minY=${minY.toFixed(4)}`);

  // Build output
  const profiles = {};
  for (const [key, contours] of Object.entries(rawLayers)) {
    // Use first / largest contour
    const mainContour = contours.sort((a, b) => b.length - a.length)[0];
    const vertices = mainContour.map(p => ({
      x: parseFloat((p.x - minX).toFixed(6)),
      y: parseFloat((p.y - minY).toFixed(6)),
    }));
    profiles[key] = {
      svgPath: toSvgPath(vertices),
      vertices,
    };
  }

  const output = {
    system: 'IGLO_5',
    type: 'F2MPX',
    description: 'Movable post profiles only — merge with F2XX1 frame/sash for full F2MPX assembly',
    profiles,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\n✅ Written: ${OUT_PATH}`);

  // Print bounds of each profile
  console.log('\n📊 Profile bounds (after normalisation):');
  for (const [key, data] of Object.entries(profiles)) {
    const xs = data.vertices.map(v => v.x);
    const ys = data.vertices.map(v => v.y);
    console.log(`   ${key.padEnd(16)}  x:[${Math.min(...xs).toFixed(2)}, ${Math.max(...xs).toFixed(2)}]  y:[${Math.min(...ys).toFixed(2)}, ${Math.max(...ys).toFixed(2)}]`);
  }
})();
