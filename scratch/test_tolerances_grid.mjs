import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

const F104_DXF = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH_V2.dxf";
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
  return currentChains.map(c => c.pts);
}

function lineSegmentsIntersect(p1, p2, p3, p4) {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (d === 0) return false;
  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  return u > 0.0001 && u < 0.9999 && v > 0.0001 && v < 0.9999;
}

function findSelfIntersections(pts) {
  const intersections = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if ((j + 1) % n === i) continue;
      const p3 = pts[j], p4 = pts[(j + 1) % n];
      if (lineSegmentsIntersect(p1, p2, p3, p4)) {
        intersections.push({ i, j });
      }
    }
  }
  return intersections;
}

function getPolygonArea(pts) {
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % n];
    area += (p1.x * p2.y) - (p2.x * p1.y);
  }
  return Math.abs(area / 2);
}

function testDxfLayer(dxfPath, targetLayer, filterFn) {
  const parser = new DxfParser();
  const dxf = parser.parseSync(fs.readFileSync(dxfPath, 'utf8'));
  const rawGeoms = [];
  
  function collect(entities, tx) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          const localRot = ent.rotation || 0;
          const localScaleX = ent.xScale === 0 ? 1 : (ent.xScale || 1);
          const localScaleY = ent.yScale === 0 ? 1 : (ent.yScale || 1);
          const posT = transformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
          collect(block.entities, {
            x: posT.x,
            y: posT.y,
            rotation: tx.rotation + localRot,
            scaleX: tx.scaleX * localScaleX,
            scaleY: tx.scaleY * localScaleY
          });
        }
      } else if (ent.layer === targetLayer) {
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

  const filteredSegs = filterFn ? segments.filter(filterFn) : segments;

  console.log(`\nTesting ${targetLayer} (${path.basename(dxfPath)}):`);
  const tols = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.2, 1.5];
  tols.forEach(tol => {
    const initialChains = chainSegments(filteredSegs, 0.1);
    const stitched = stitchChains(initialChains, tol);
    
    let validClosedCount = 0;
    let totalIntersections = 0;
    
    stitched.forEach(chain => {
      // close loop
      const closed = [...chain];
      if (dist(closed[0], closed[closed.length - 1]) <= tol) {
        if (dist(closed[0], closed[closed.length - 1]) > 0.0001) {
          closed.pop();
        }
      }
      if (closed.length > 2 && getPolygonArea(closed) > 10.0) {
        validClosedCount++;
        totalIntersections += findSelfIntersections(closed).length;
      }
    });

    console.log(`  Stitch Tol ${tol.toFixed(2)}mm: closedContours=${validClosedCount}, totalSelfIntersections=${totalIntersections}`);
  });
}

// Test GSK_BZD on post dxf (where we saw 15 self-intersections)
testDxfLayer(POST_DXF, 'IGE_GSK_BZD', seg => {
  const minX = Math.min(seg.start.x, seg.end.x);
  return minX >= 140.0;
});

// Test GSK_FRM_MD on F104 dxf (middle central gasket where we saw 33 self-intersections)
testDxfLayer(F104_DXF, 'IGE_GSK_FRM_MD');
