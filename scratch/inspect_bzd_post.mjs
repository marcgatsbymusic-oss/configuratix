import fs from 'fs';
import DxfParser from 'dxf-parser';

const POST_DXF = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_MOVABLEPOST_MAIN_OPENING_LEFT_V8.dxf";

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
    pts.push(transformPoint({ x: cx + r * Math.cos(startA + (endA - startA) * (i / segments)), y: cy + r * Math.sin(startA + (endA - startA) * (i / segments)) }, tx));
  }
  return pts;
}

function chainSegments(segments, tol = 0.1) {
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

function stitchChains(chains, tol = 1.5) {
  let currentChains = chains.map((c, idx) => ({
    pts: [...c.pts],
    start: c.start,
    end: c.end,
    closed: dist(c.start, c.end) <= 0.05,
    id: idx
  }));

  let changed = true;
  while (changed) {
    changed = false;
    let bestDist = Infinity;
    let bestI = -1, bestJ = -1;
    let bestMode = '';

    for (let i = 0; i < currentChains.length; i++) {
      const c1 = currentChains[i];
      if (c1.closed) continue;
      const s1 = c1.pts[0];
      const e1 = c1.pts[c1.pts.length - 1];

      const dSelf = dist(s1, e1);
      if (dSelf <= tol && dSelf < bestDist) {
        bestDist = dSelf; bestI = i; bestJ = -1; bestMode = 'self-close';
      }

      for (let j = i + 1; j < currentChains.length; j++) {
        const c2 = currentChains[j];
        if (c2.closed) continue;
        const s2 = c2.pts[0];
        const e2 = c2.pts[c2.pts.length - 1];

        const d_ee = dist(e1, s2);
        if (d_ee <= tol && d_ee < bestDist) {
          bestDist = d_ee; bestI = i; bestJ = j; bestMode = 'end-start';
        }
        const d_es = dist(e1, e2);
        if (d_es <= tol && d_es < bestDist) {
          bestDist = d_es; bestI = i; bestJ = j; bestMode = 'end-end';
        }
        const d_se = dist(s1, s2);
        if (d_se <= tol && d_se < bestDist) {
          bestDist = d_se; bestI = i; bestJ = j; bestMode = 'start-start';
        }
        const d_ss = dist(s1, e2);
        if (d_ss <= tol && d_ss < bestDist) {
          bestDist = d_ss; bestI = i; bestJ = j; bestMode = 'start-end';
        }
      }
    }

    if (bestDist <= tol) {
      changed = true;
      if (bestMode === 'self-close') {
        currentChains[bestI].closed = true;
      } else {
        const c1 = currentChains[bestI];
        const c2 = currentChains[bestJ];
        let mergedPts = [];
        if (bestMode === 'end-start') mergedPts = [...c1.pts, ...c2.pts];
        else if (bestMode === 'end-end') mergedPts = [...c1.pts, ...[...c2.pts].reverse()];
        else if (bestMode === 'start-start') mergedPts = [...[...c1.pts].reverse(), ...c2.pts];
        else if (bestMode === 'start-end') mergedPts = [...c2.pts, ...c1.pts];
        c1.pts = mergedPts;
        c1.closed = dist(mergedPts[0], mergedPts[mergedPts.length - 1]) <= 0.05;
        currentChains.splice(bestJ, 1);
      }
    }
  }
  return currentChains;
}

const parser = new DxfParser();
const dxf = parser.parseSync(fs.readFileSync(POST_DXF, 'utf8'));
const rawGeoms = [];
function collect(entities, tx) {
  entities.forEach(ent => {
    if (ent.type === 'INSERT') {
      const block = dxf.blocks[ent.name];
      if (block && block.entities) {
        collect(block.entities, {
          x: ent.position.x || 0,
          y: ent.position.y || 0,
          rotation: (tx.rotation || 0) + (ent.rotation || 0),
          scaleX: (tx.scaleX || 1) * (ent.xScale || 1),
          scaleY: (tx.scaleY || 1) * (ent.yScale || 1)
        });
      }
    } else if (ent.layer === 'IGE_GSK_BZD') {
      rawGeoms.push({ entity: ent, tx });
    }
  });
}
collect(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

const segments = [];
rawGeoms.forEach(({ entity, tx }) => {
  if (entity.type === 'LINE') {
    const s = transformPoint(entity.vertices[0], tx), e = transformPoint(entity.vertices[1], tx);
    segments.push({ start: s, end: e, pts: [s, e] });
  } else if (entity.type === 'ARC') {
    const pts = [];
    let s = entity.startAngle, e = entity.endAngle;
    if (e <= s) e += 2 * Math.PI;
    for (let i = 0; i <= 24; i++) {
      const a = s + (e - s) * (i / 24);
      pts.push(transformPoint({ x: entity.center.x + entity.radius * Math.cos(a), y: entity.center.y + entity.radius * Math.sin(a) }, tx));
    }
    segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
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

console.log(`Total segments in IGE_GSK_BZD: ${segments.length}`);

const initialChains = chainSegments(segments, 0.1);
console.log(`Initial chains count (dist <= 0.1mm): ${initialChains.length}`);
initialChains.forEach((c, idx) => {
  console.log(`Chain ${idx}: pts=${c.pts.length}, start=(${c.start.x.toFixed(4)}, ${c.start.y.toFixed(4)}), end=(${c.end.x.toFixed(4)}, ${c.end.y.toFixed(4)}), dist=${dist(c.start, c.end).toFixed(4)}`);
});

// Let's try stitching with larger tolerances
[0.5, 0.8, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0].forEach(tol => {
  const stitched = stitchChains(initialChains, tol);
  console.log(`\nStitched with tol = ${tol}mm: count = ${stitched.length}`);
  stitched.forEach((c, idx) => {
    const gap = dist(c.pts[0], c.pts[c.pts.length - 1]);
    console.log(`  Chain ${idx}: pts=${c.pts.length}, gap = ${gap.toFixed(4)}mm`);
  });
});
