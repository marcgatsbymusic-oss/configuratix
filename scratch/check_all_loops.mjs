import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH.dxf";

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function transformPoint(pt, tx) {
  const localRot = (tx.rotation || 0) * Math.PI / 180;
  const scaleX = tx.scaleX === undefined ? 1 : tx.scaleX;
  const scaleY = tx.scaleY === undefined ? 1 : tx.scaleY;
  
  let xs = pt.x * scaleX;
  let ys = pt.y * scaleY;
  let xr = xs * Math.cos(localRot) - ys * Math.sin(localRot);
  let yr = xs * Math.sin(localRot) + ys * Math.cos(localRot);
  return { x: xr + tx.x, y: yr + tx.y };
}

function arcToPolyline(center, r, startAngle, endAngle, tx, segments = 24) {
  let s = startAngle;
  let e = endAngle;
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

function chainSegments(segments, tol = 1.5) {
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
    chains.push(chain);
  }
  return chains;
}

function getPolygonArea(pts) {
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    area += (p1.x * p2.y) - (p2.x * p1.y);
  }
  return Math.abs(area / 2);
}

try {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);
  
  const rawGeoms = {};
  
  function collect(entities, tx) {
    for (const ent of entities) {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          const localRot = ent.rotation || 0;
          const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
          const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;
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
      } else {
        const layer = ent.layer || 'unknown';
        if (!rawGeoms[layer]) rawGeoms[layer] = [];
        rawGeoms[layer].push({ entity: ent, tx });
      }
    }
  }

  collect(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });
  
  for (const [layerName, items] of Object.entries(rawGeoms)) {
    const segments = [];
    const lwpolys = [];
    
    items.forEach(({ entity, tx }) => {
      if (entity.type === 'LINE') {
        const s = transformPoint(entity.vertices[0], tx);
        const e = transformPoint(entity.vertices[1], tx);
        segments.push({ start: s, end: e, pts: [s, e] });
      } else if (entity.type === 'ARC') {
        const pts = arcToPolyline(entity.center, entity.radius, entity.startAngle, entity.endAngle, tx);
        segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
      } else if (entity.type === 'LWPOLYLINE') {
        const verts = entity.vertices;
        let pts = [];
        for (let i = 0; i < verts.length; i++) {
          const v = verts[i];
          pts.push(transformPoint(v, tx));
          if (v.bulge !== undefined && v.bulge !== 0 && i < verts.length - 1) {
            const arc = bulgeToArcPts(v, verts[i + 1], v.bulge, tx);
            pts.push(...arc.slice(0, -1));
          }
        }
        lwpolys.push(pts);
      }
    });

    const stitched = chainSegments(segments, 1.5);
    const contours = [];
    
    stitched.forEach(chain => {
      if (chain.length > 2) contours.push(chain);
    });
    lwpolys.forEach(chain => {
      if (chain.length > 2) contours.push(chain);
    });
    
    if (contours.length > 0) {
      console.log(`\nLayer: ${layerName}, Closed contours found: ${contours.length}`);
      contours.forEach((c, idx) => {
        const area = getPolygonArea(c);
        let sumX = 0, sumY = 0;
        c.forEach(p => { sumX += p.x; sumY += p.y; });
        const cx = sumX / c.length;
        const cy = sumY / c.length;
        console.log(`  Contour ${idx}: Area: ${area.toFixed(2)} mm², Centroid: [${cx.toFixed(2)}, ${cy.toFixed(2)}]`);
      });
    }
  }
} catch (err) {
  console.error(err);
}
