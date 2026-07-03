import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";

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

function bulgeToArcPts(p1, p2, bulge, tx) {
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
  const segments = 24;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const a = startA + (endA - startA) * t;
    pts.push(transformPoint({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }, tx));
  }
  return pts;
}

function angleBetween(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (mag1 === 0 || mag2 === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
}

function chainSegments(segments, tol = 0.05) {
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
      let bestIdx = -1, bestIsRev = false, bestDist = Infinity, bestAngleDiff = Infinity;
      for (let i = 0; i < unused.length; i++) {
        const s = unused[i];
        let d = dist(chainEnd, s.start);
        if (d <= tol) {
          const nd = { x: s.end.x - s.start.x, y: s.end.y - s.start.y };
          const aDiff = angleBetween(currentDir, nd);
          if (d < bestDist - 0.001 || (Math.abs(d - bestDist) <= 0.001 && aDiff < bestAngleDiff)) {
            bestDist = d; bestAngleDiff = aDiff; bestIdx = i; bestIsRev = false;
          }
        }
        const rev = { start: s.end, end: s.start, pts: [...s.pts].reverse() };
        d = dist(chainEnd, rev.start);
        if (d <= tol) {
          const nd = { x: rev.end.x - rev.start.x, y: rev.end.y - rev.start.y };
          const aDiff = angleBetween(currentDir, nd);
          if (d < bestDist - 0.001 || (Math.abs(d - bestDist) <= 0.001 && aDiff < bestAngleDiff)) {
            bestDist = d; bestAngleDiff = aDiff; bestIdx = i; bestIsRev = true;
          }
        }
      }
      if (bestIdx !== -1) {
        const s = unused.splice(bestIdx, 1)[0];
        const pts = bestIsRev ? [...s.pts].reverse() : s.pts;
        chain.push(...pts.slice(1));
        chainEnd = pts[pts.length - 1];
        const bl = pts[pts.length - 2];
        currentDir = { x: chainEnd.x - bl.x, y: chainEnd.y - bl.y };
        changed = true;
      }
    }
    chains.push(chain);
  }
  return chains;
}

function deduplicateSegments(segs, tol = 0.01) {
  const unique = [];
  segs.forEach(seg => {
    const isDup = unique.some(u => 
      (dist(u.start, seg.start) <= tol && dist(u.end, seg.end) <= tol) ||
      (dist(u.start, seg.end) <= tol && dist(u.end, seg.start) <= tol)
    );
    if (!isDup) {
      unique.push(seg);
    }
  });
  return unique;
}

const text = fs.readFileSync(INPUT_FILE, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

const rawGeoms = [];
function collect(ents, tx) {
  ents.forEach(ent => {
    if (ent.type === 'INSERT') {
      const block = dxf.blocks[ent.name];
      if (block && block.entities) {
        const localRot = ent.rotation || 0;
        const localScaleX = ent.xScale || 1;
        const localScaleY = ent.yScale || 1;
        const posT = transformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
        const nextTx = {
          x: posT.x,
          y: posT.y,
          rotation: tx.rotation + localRot,
          scaleX: tx.scaleX * localScaleX,
          scaleY: tx.scaleY * localScaleY
        };
        collect(block.entities, nextTx);
      }
    } else if (ent.layer === 'GSK_PST_EXT') {
      rawGeoms.push({ entity: ent, tx });
    }
  });
}
collect(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

const segments = [];
rawGeoms.forEach(({ entity, tx }) => {
  const verts = entity.vertices;
  for (let i = 0; i < verts.length - 1; i++) {
    const v1 = verts[i];
    const v2 = verts[i + 1];
    const p1 = transformPoint(v1, tx);
    const p2 = transformPoint(v2, tx);
    let pts = [p1];
    if (v1.bulge !== undefined && v1.bulge !== 0) {
      const arc = bulgeToArcPts(v1, v2, v1.bulge, tx);
      pts.push(...arc);
    } else {
      pts.push(p2);
    }
    segments.push({ start: p1, end: p2, pts });
  }

  const isClosed = entity.shape || (entity.flag & 1) !== 0 || entity.closed;
  if (isClosed && verts.length > 2) {
    const v1 = verts[verts.length - 1];
    const v2 = verts[0];
    const p1 = transformPoint(v1, tx);
    const p2 = transformPoint(v2, tx);
    let pts = [p1];
    if (v1.bulge !== undefined && v1.bulge !== 0) {
      const arc = bulgeToArcPts(v1, v2, v1.bulge, tx);
      pts.push(...arc);
    } else {
      pts.push(p2);
    }
    segments.push({ start: p1, end: p2, pts });
  }
});

const dedupedSegments = deduplicateSegments(segments, 0.01);
const initialChains = chainSegments(dedupedSegments, 0.1);
const c0 = initialChains[0];
console.log(`Chain 0 start: (${c0[0].x}, ${c0[0].y})`);
console.log(`Chain 0 end  : (${c0[c0.length-1].x}, ${c0[c0.length-1].y})`);
console.log(`Gap distance : ${dist(c0[0], c0[c0.length-1])}`);
console.log(`Initial chains count: ${initialChains.length}`);
initialChains.forEach((c, idx) => {
  console.log(`  Chain ${idx}: points=${c.length}`);
});
