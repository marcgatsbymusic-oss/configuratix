import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_MOVABLEPOST_MAIN_OPENING_LEFT_V8.dxf";

const text = fs.readFileSync(INPUT_FILE, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function transformPoint(pt, tx) {
  const localRot = (tx.rotation || 0) * Math.PI / 180;
  const scaleX = tx.scaleX === undefined ? 1 : tx.scaleX;
  const scaleY = tx.scaleY === undefined ? 1 : tx.scaleY;
  return {
    x: pt.x * scaleX * Math.cos(localRot) - pt.y * scaleY * Math.sin(localRot) + tx.x,
    y: pt.x * scaleX * Math.sin(localRot) + pt.y * scaleY * Math.cos(localRot) + tx.y
  };
}

function arcToPolyline(center, r, startAngle, endAngle, tx, segments = 24) {
  let s = startAngle, e = endAngle;
  if (e <= s) e += 2 * Math.PI;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = s + (e - s) * (i / segments);
    pts.push(transformPoint({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) }, tx));
  }
  return pts;
}

function bulgeToArcPts(p1, p2, bulge, tx, segments = 24) {
  const theta = 4 * Math.atan(Math.abs(bulge));
  const d     = dist(p1, p2) / 2;
  const r     = d / Math.sin(theta / 2);
  const mx    = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
  const dx    = p2.x - p1.x, dy = p2.y - p1.y;
  const len   = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return [];
  const px    = -dy / len, py = dx / len;
  const ss    = Math.sqrt(Math.max(0, r * r - d * d));
  const sign  = bulge > 0 ? 1 : -1;
  const cx    = mx + sign * ss * px, cy = my + sign * ss * py;
  let startA  = Math.atan2(p1.y - cy, p1.x - cx);
  let endA    = Math.atan2(p2.y - cy, p2.x - cx);
  if (bulge > 0 && endA < startA) endA += 2 * Math.PI;
  if (bulge < 0 && endA > startA) startA += 2 * Math.PI;
  const pts = [];
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const a = startA + (endA - startA) * t;
    pts.push(transformPoint({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }, tx));
  }
  return pts;
}

function chainSegments(segments, tol = 0.05) {
  if (segments.length === 0) return [];
  const unused = [...segments];
  const chains = [];
  while (unused.length > 0) {
    let seg = unused.splice(0, 1)[0];
    let chain = [...seg.pts];
    let chainEnd = seg.end;
    let changed = true;
    while (changed) {
      changed = false;
      let bestIdx = -1, bestIsRev = false, bestDist = Infinity;
      for (let i = 0; i < unused.length; i++) {
        const s = unused[i];
        let d = dist(chainEnd, s.start);
        if (d <= tol && d < bestDist) {
          bestDist = d; bestIdx = i; bestIsRev = false;
        }
        d = dist(chainEnd, s.end);
        if (d <= tol && d < bestDist) {
          bestDist = d; bestIdx = i; bestIsRev = true;
        }
      }
      if (bestIdx !== -1) {
        const s = unused.splice(bestIdx, 1)[0];
        const pts = bestIsRev ? [...s.pts].reverse() : s.pts;
        chain.push(...pts.slice(1));
        chainEnd = pts[pts.length - 1];
        changed = true;
      }
    }
    chains.push({ pts: chain, start: chain[0], end: chain[chain.length - 1] });
  }
  return chains;
}

const rawGeoms = [];
function collectEntities(entities, tx) {
  entities.forEach(ent => {
    if (ent.type === 'INSERT') {
      const block = dxf.blocks[ent.name];
      if (block && block.entities) {
        const nextTx = { x: ent.position.x + tx.x, y: ent.position.y + tx.y, rotation: tx.rotation + (ent.rotation || 0), scaleX: tx.scaleX * (ent.xScale || 1), scaleY: tx.scaleY * (ent.yScale || 1) };
        collectEntities(block.entities, nextTx);
      }
    } else if (ent.layer === 'IGE_GSK_EXT') {
      rawGeoms.push({ entity: ent, tx });
    }
  });
}
collectEntities(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

const segments = [];
rawGeoms.forEach(({ entity, tx }) => {
  if (entity.type === 'LINE') {
    const s = transformPoint(entity.vertices[0], tx), e = transformPoint(entity.vertices[1], tx);
    segments.push({ start: s, end: e, pts: [s, e] });
  } else if (entity.type === 'ARC') {
    const pts = arcToPolyline(entity.center, entity.radius, entity.startAngle, entity.endAngle, tx);
    segments.push({ start: pts[0], end: pts[pts.length-1], pts });
  } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
    const verts = entity.vertices;
    for (let i = 0; i < verts.length - 1; i++) {
      const p1 = transformPoint(verts[i], tx), p2 = transformPoint(verts[i+1], tx);
      let pts = [p1];
      if (verts[i].bulge) pts.push(...bulgeToArcPts(verts[i], verts[i+1], verts[i].bulge, tx));
      else pts.push(p2);
      segments.push({ start: p1, end: p2, pts });
    }
  }
});

// Gasket 3: Sash exterior glass gasket (raw X >= 200)
const gsk3segs = segments.filter(seg => Math.min(seg.start.x, seg.end.x) >= 200.0);
console.log(`Gasket 3 segments: ${gsk3segs.length}`);

// Chain at 0.1mm tolerance
const chains = chainSegments(gsk3segs, 0.1);
console.log(`Initial chains at 0.1mm: ${chains.length}`);

const openChains = [];
const closedChains = [];
chains.forEach((c, idx) => {
  const isClosed = dist(c.start, c.end) <= 0.1;
  if (isClosed) {
    closedChains.push(c);
  } else {
    openChains.push({ ...c, id: idx });
  }
});

console.log(`  Closed: ${closedChains.length}`);
console.log(`  Open: ${openChains.length}`);

// For each open chain, find the closest endpoint of another open chain
openChains.forEach(c => {
  let bestDistStart = Infinity, bestIdStart = -1, bestEndTypeStart = '';
  let bestDistEnd = Infinity, bestIdEnd = -1, bestEndTypeEnd = '';
  
  openChains.forEach(other => {
    if (c.id === other.id) return;
    
    // Check from c.start
    let d = dist(c.start, other.start);
    if (d < bestDistStart) { bestDistStart = d; bestIdStart = other.id; bestEndTypeStart = 'start'; }
    d = dist(c.start, other.end);
    if (d < bestDistStart) { bestDistStart = d; bestIdStart = other.id; bestEndTypeStart = 'end'; }
    
    // Check from c.end
    d = dist(c.end, other.start);
    if (d < bestDistEnd) { bestDistEnd = d; bestIdEnd = other.id; bestEndTypeEnd = 'start'; }
    d = dist(c.end, other.end);
    if (d < bestDistEnd) { bestDistEnd = d; bestIdEnd = other.id; bestEndTypeEnd = 'end'; }
  });
  
  console.log(`Chain ${c.id} (pts=${c.pts.length}):`);
  console.log(`  Start connects to Chain ${bestIdStart} (${bestEndTypeStart}) at dist = ${bestDistStart.toFixed(4)}mm`);
  console.log(`  End connects to Chain ${bestIdEnd} (${bestEndTypeEnd}) at dist = ${bestDistEnd.toFixed(4)}mm`);
  console.log(`  Self-gap: ${dist(c.start, c.end).toFixed(4)}mm`);
});
