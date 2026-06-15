import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_MOVABLEPOST_MAIN_OPENING_LEFT.dxf";

const SNAP_TOLERANCE = 0.05;
const ARC_SEGMENTS = 24;

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

function arcToPolyline(center, r, startAngle, endAngle, tx, segments = ARC_SEGMENTS) {
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

function bulgeToArcPts(p1, p2, bulge, tx, segments = ARC_SEGMENTS) {
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

function angleBetween(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (mag1 === 0 || mag2 === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
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

function closeAndSnap(pts) {
  if (pts.length < 2) return pts;
  const gap = dist(pts[0], pts[pts.length - 1]);
  if (gap === 0 || gap <= SNAP_TOLERANCE) pts.pop();
  return pts;
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

function clipPolygon(points, value, isLessThan) {
  const result = [];
  for (let i = 0; i < points.length; i++) {
    const cur = points[i];
    const prev = points[(i - 1 + points.length) % points.length];
    
    const curInside = isLessThan ? (cur.x <= value) : (cur.x >= value);
    const prevInside = isLessThan ? (prev.x <= value) : (prev.x >= value);
    
    if (curInside) {
      if (!prevInside) {
        const t = (value - prev.x) / (cur.x - prev.x);
        const y = prev.y + t * (cur.y - prev.y);
        result.push({ x: value, y: y });
      }
      result.push({ x: cur.x, y: cur.y });
    } else if (prevInside) {
      const t = (value - prev.x) / (cur.x - prev.x);
      const y = prev.y + t * (cur.y - prev.y);
      result.push({ x: value, y: y });
    }
  }
  return result;
}

function getBounds(pts) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  pts.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });
  return { minX, maxX, minY, maxY };
}

try {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  const rawGeoms = {};
  function collectEntities(entities, tx) {
    entities.forEach(ent => {
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
          collectEntities(block.entities, nextTx);
        }
      } else {
        const layer = ent.layer || 'unknown';
        if (!rawGeoms[layer]) {
          rawGeoms[layer] = [];
        }
        rawGeoms[layer].push({ entity: ent, tx });
      }
    });
  }

  collectEntities(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

  const layerContours = {};
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
    const closedContours = [];
    
    stitched.forEach(chain => {
      const closed = closeAndSnap(chain);
      if (closed.length > 2) closedContours.push(closed);
    });

    lwpolys.forEach(chain => {
      const closed = closeAndSnap(chain);
      if (closed.length > 2) closedContours.push(closed);
    });

    if (closedContours.length > 0) {
      layerContours[layerName] = closedContours;
    }
  }

  const largestSsh = layerContours['IGE_SSH'].map(c => ({ contour: c, area: getPolygonArea(c) })).sort((a,b) => b.area - a.area)[0].contour;
  const largestMp = layerContours['IGE_MOVABLE_POST'].map(c => ({ contour: c, area: getPolygonArea(c) })).sort((a,b) => b.area - a.area)[0].contour;

  const sshSplitX = 235.00;
  const sshExt = clipPolygon(largestSsh, sshSplitX, true);
  const sshInt = clipPolygon(largestSsh, sshSplitX, false);

  const mpSplitX = 194.00;
  const mpExt = clipPolygon(largestMp, mpSplitX, true);
  const mpInt = clipPolygon(largestMp, mpSplitX, false);

  console.log('\n--- VERIFICATION RESULTS ---');
  [
    { name: 'SSH_EXT', pts: sshExt },
    { name: 'SSH_INT', pts: sshInt },
    { name: 'PST_EXT', pts: mpExt },
    { name: 'PST_INT', pts: mpInt }
  ].forEach(p => {
    const b = getBounds(p.pts);
    const dStartEnd = dist(p.pts[0], p.pts[p.pts.length - 1]);
    console.log(`${p.name}:`);
    console.log(`  Points: ${p.pts.length}`);
    console.log(`  Area: ${getPolygonArea(p.pts).toFixed(2)} mm²`);
    console.log(`  Bounds: X [${b.minX.toFixed(2)}, ${b.maxX.toFixed(2)}]  Y [${b.minY.toFixed(2)}, ${b.maxY.toFixed(2)}]`);
    console.log(`  Start-to-end distance: ${dStartEnd.toFixed(6)} mm`);
    if (p.pts.length > 0) {
      console.log(`  First 3 points:`, p.pts.slice(0, 3));
      console.log(`  Last 3 points:`, p.pts.slice(-3));
    }
  });

} catch (err) {
  console.error(err);
}
