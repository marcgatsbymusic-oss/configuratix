import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";
const OUT_FILE = "c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/data/profiles/IgloEdge/IGE_WINDOW_MOVABLE_POST.json";
const SVG_OUT = "C:/Users/Shadow/.gemini/antigravity/brain/5b053f40-aa59-47e7-8cd5-d62422570e6b/IGE_Movable_post_section_cleaned.svg";
const SVG_PUBLIC = "c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/public/IGE_Movable_post_section_cleaned.svg";

const SNAP_TOLERANCE = 0.05; // mm
const ARC_SEGMENTS = 24;
const SIMPLIFY_TOLERANCE = 0.05; // mm

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

// Douglas-Peucker simplification
function perpendicularDistance(point, lineStart, lineEnd) {
  let dx = lineEnd.x - lineStart.x, dy = lineEnd.y - lineStart.y;
  const mag = Math.hypot(dx, dy);
  if (mag > 0.0) { dx /= mag; dy /= mag; }
  const pvx = point.x - lineStart.x, pvy = point.y - lineStart.y;
  const pvdot = dx * pvx + dy * pvy;
  return Math.hypot(pvx - pvdot * dx, pvy - pvdot * dy);
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
    const r1 = simplifyDouglasPeucker(points.slice(0, index + 1), epsilon);
    const r2 = simplifyDouglasPeucker(points.slice(index), epsilon);
    return r1.slice(0, -1).concat(r2);
  }
  return [points[0], points[end]];
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

function closeAndSnap(pts, tol = SNAP_TOLERANCE) {
  if (pts.length < 2) return pts;
  const gap = dist(pts[0], pts[pts.length - 1]);
  if (gap <= tol) {
    pts[pts.length - 1] = { x: pts[0].x, y: pts[0].y };
  }
  return pts;
}

function stitchChains(chains, tol = 1.5) {
  let currentChains = chains.map((pts, idx) => ({
    pts: [...pts],
    start: pts[0],
    end: pts[pts.length - 1],
    closed: dist(pts[0], pts[pts.length - 1]) <= 0.05,
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

        if (bestMode === 'end-start') {
          mergedPts = [...c1.pts, ...c2.pts];
        } else if (bestMode === 'end-end') {
          mergedPts = [...c1.pts, ...[...c2.pts].reverse()];
        } else if (bestMode === 'start-start') {
          mergedPts = [...[...c1.pts].reverse(), ...c2.pts];
        } else if (bestMode === 'start-end') {
          mergedPts = [...c2.pts, ...c1.pts];
        }

        c1.pts = mergedPts;
        c1.closed = dist(mergedPts[0], mergedPts[mergedPts.length - 1]) <= 0.05;
        currentChains.splice(bestJ, 1);
      }
    }
  }

  return currentChains.map(c => c.pts);
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

// Sutherland-Hodgman clipping against Y line
function clipPolygonY(points, yValue, isLessThan) {
  const result = [];
  for (let i = 0; i < points.length; i++) {
    const cur = points[i];
    const prev = points[(i - 1 + points.length) % points.length];
    
    const curInside = isLessThan ? (cur.y <= yValue) : (cur.y >= yValue);
    const prevInside = isLessThan ? (prev.y <= yValue) : (prev.y >= yValue);
    
    if (curInside) {
      if (!prevInside) {
        const t = (yValue - prev.y) / (cur.y - prev.y);
        const x = prev.x + t * (cur.x - prev.x);
        result.push({ x: x, y: yValue });
      }
      result.push({ x: cur.x, y: cur.y });
    } else if (prevInside) {
      const t = (yValue - prev.y) / (cur.y - prev.y);
      const x = prev.x + t * (cur.x - prev.x);
      result.push({ x: x, y: yValue });
    }
  }
  return result;
}

function toSvgPath(points) {
  if (!points.length) return '';
  const [first, ...rest] = points;
  return `M ${first.x.toFixed(4)} ${first.y.toFixed(4)} ` + rest.map(p => `L ${p.x.toFixed(4)} ${p.y.toFixed(4)}`).join(' ') + ' Z';
}

function toThreeShapeCommands(points) {
  if (!points.length) return [];
  const cmds = [{ cmd: 'moveTo', x: parseFloat(points[0].x.toFixed(6)), y: parseFloat(points[0].y.toFixed(6)) }];
  for (let i = 1; i < points.length; i++) {
    cmds.push({ cmd: 'lineTo', x: parseFloat(points[i].x.toFixed(6)), y: parseFloat(points[i].y.toFixed(6)) });
  }
  return cmds;
}

function makeSolidBlocks(contours, minArea = 1.0) {
  if (!contours || contours.length === 0) return [];
  
  const validContours = contours.filter(c => {
    if (c.length < 3) return false;
    const area = getPolygonArea(c);
    return area >= minArea;
  });

  const sorted = validContours.map(c => ({
    points: c,
    area: getPolygonArea(c),
    centroid: getCentroid(c)
  })).sort((a, b) => b.area - a.area);

  const kept = [];
  for (const item of sorted) {
    let isInsideAny = false;
    for (const keptItem of kept) {
      if (isPointInPolygon(item.centroid, keptItem.points)) {
        isInsideAny = true;
        break;
      }
    }
    if (!isInsideAny) {
      kept.push(item);
    }
  }
  return kept.map(item => item.points);
}

function getCentroid(pts) {
  let cx = 0, cy = 0;
  pts.forEach(p => { cx += p.x; cy += p.y; });
  return { x: cx / pts.length, y: cy / pts.length };
}

function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
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

async function main() {
  console.log(`\n📂 Reading DXF: ${INPUT_FILE}`);
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  const rawGeoms = {};

  const u002Inserts = [];

  function collectEntities(entities, tx) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
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

        if (ent.name === 'U-002' || ent.name.includes('U-002')) {
          u002Inserts.push(nextTx);
        } else {
          const block = dxf.blocks[ent.name];
          if (block && block.entities) {
            collectEntities(block.entities, nextTx);
          }
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

    items.forEach(({ entity, tx }) => {
      if (entity.type === 'LINE') {
        const s = transformPoint(entity.vertices[0], tx);
        const e = transformPoint(entity.vertices[1], tx);
        segments.push({ start: s, end: e, pts: [s, e] });
      } else if (entity.type === 'ARC') {
        const pts = arcToPolyline(entity.center, entity.radius, entity.startAngle, entity.endAngle, tx);
        segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
      } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
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
      }
    });

    const dedupedSegments = deduplicateSegments(segments, 0.01);
    const tol = (layerName === 'GSK_BZD' || layerName === 'BZD') ? 0.8 : 0.1;
    const initialChains = chainSegments(dedupedSegments, 0.1);
    const stitched = stitchChains(initialChains, tol);
    const closedContours = [];
    
    stitched.forEach(chain => {
      const snapTol = (layerName === 'GSK_BZD' || layerName === 'BZD') ? 3.0 : tol;
      const closed = closeAndSnap(chain, snapTol);
      if (closed.length > 2) closedContours.push(closed);
    });

    if (closedContours.length > 0) {
      layerContours[layerName] = closedContours;
    }
  }

  // 1) Find the two sashes in 'SSH' layer
  const sashes = layerContours['SSH'] || [];
  if (sashes.length < 2) {
    console.error('Error: Could not find at least 2 sashes in SSH layer!');
    process.exit(1);
  }

  // Sort by minX to identify Left and Right sash
  sashes.sort((a, b) => {
    let minXa = Math.min(...a.map(p => p.x));
    let minXb = Math.min(...b.map(p => p.x));
    return minXa - minXb;
  });

  const leftSash = sashes[0];
  const rightSash = sashes[1];

  // 2) Find Movable Post in 'MOVABLE_POST' layer
  const mpContours = layerContours['MOVABLE_POST'] || [];
  if (mpContours.length === 0) {
    console.error('Error: Could not find MOVABLE_POST layer!');
    process.exit(1);
  }
  let largestMp = mpContours[0], maxMpArea = -1;
  mpContours.forEach(c => {
    const a = getPolygonArea(c);
    if (a > maxMpArea) { maxMpArea = a; largestMp = c; }
  });

  // 3) Find beads (BZD) for Left and Right sash
  const beads = layerContours['BZD'] || [];
  beads.sort((a, b) => {
    let minXa = Math.min(...a.map(p => p.x));
    let minXb = Math.min(...b.map(p => p.x));
    return minXa - minXb;
  });
  const leftBzd = beads[0];
  const rightBzd = beads[1];

  // 4) Splits along the Y-axis:
  const sshSplitY = 60.00;
  // Left Sash Splits
  const leftSshExt = clipPolygonY(leftSash, sshSplitY, false);
  const leftSshInt = clipPolygonY(leftSash, sshSplitY, true);
  // Right Sash Splits
  const rightSshExt = clipPolygonY(rightSash, sshSplitY, false);
  const rightSshInt = clipPolygonY(rightSash, sshSplitY, true);

  const mpSplitY = 76.75;
  // Movable Post Splits
  const mpExt = clipPolygonY(largestMp, mpSplitY, false);
  const mpInt = clipPolygonY(largestMp, mpSplitY, true);

  // 5) Separate Gaskets (GSK_PST_EXT)
  const extGaskets = makeSolidBlocks(layerContours['GSK_PST_EXT'] || [], 10.0);
  extGaskets.sort((a, b) => {
    let minXa = Math.min(...a.map(p => p.x));
    let minXb = Math.min(...b.map(p => p.x));
    return minXa - minXb;
  });
  
  // GSK_PST_EXT sorted left-to-right:
  // idx 0: far left (left sash ext gasket)
  // idx 1: left post ext gasket (GSK_PST_L)
  // idx 2: right post ext gasket (GSK_PST_R)
  // idx 3: far right (right sash ext gasket)
  const leftSshGskExt = extGaskets[0] ? [extGaskets[0]] : [];
  const gskPstL = extGaskets[1] ? [extGaskets[1]] : [];
  const gskPstR = extGaskets[2] ? [extGaskets[2]] : [];
  const rightSshGskExt = extGaskets[3] ? [extGaskets[3]] : [];

  // Glazing Bead Gaskets
  const beadGaskets = makeSolidBlocks(layerContours['GSK_BZD'] || [], 10.0);
  beadGaskets.sort((a, b) => {
    let minXa = Math.min(...a.map(p => p.x));
    let minXb = Math.min(...b.map(p => p.x));
    return minXa - minXb;
  });
  const leftGskBzd = beadGaskets[0] ? [beadGaskets[0]] : [];
  const rightGskBzd = beadGaskets[1] ? [beadGaskets[1]] : [];

  // Spacers
  const spacers = makeSolidBlocks(layerContours['SPACER'] || [], 1.0);
  spacers.sort((a, b) => {
    let minXa = Math.min(...a.map(p => p.x));
    let minXb = Math.min(...b.map(p => p.x));
    return minXa - minXb;
  });
  const leftSpacers = spacers.filter(c => Math.min(...c.map(p => p.x)) < 150);
  const rightSpacers = spacers.filter(c => Math.min(...c.map(p => p.x)) >= 150);

  // Middle Gasket (GSK_MD) maps to IGE_GSK_MD_MOVABLE_POST
  const gskMd = makeSolidBlocks(layerContours['GSK_MD'] || [], 1.0);

  // Steel Reinforcement (Profil stal)
  const steel = makeSolidBlocks(layerContours['Profil stal'] || [], 1.0);
  steel.sort((a, b) => {
    let minXa = Math.min(...a.map(p => p.x));
    let minXb = Math.min(...b.map(p => p.x));
    return minXa - minXb;
  });
  const leftSteel = steel.filter(c => Math.min(...c.map(p => p.x)) < 150);
  const rightSteel = steel.filter(c => Math.min(...c.map(p => p.x)) >= 150);

  // 5.5) Reconstruct interior sash gaskets (GSK_SSH_INT) from U-002 inserts
  const uniqueU002 = [];
  u002Inserts.forEach(ins => {
    const isDup = uniqueU002.some(u => 
      dist(u, ins) <= 0.1 && 
      Math.abs(u.rotation - ins.rotation) <= 0.1 && 
      Math.abs(u.scaleX - ins.scaleX) <= 0.1 && 
      Math.abs(u.scaleY - ins.scaleY) <= 0.1
    );
    if (!isDup) {
      uniqueU002.push(ins);
    }
  });

  const u002Vertices = JSON.parse(fs.readFileSync('scratch/u002_vertices.json', 'utf8'));
  const gskSshIntLeft = [];
  const gskSshIntRight = [];

  uniqueU002.forEach(ins => {
    const transformed = u002Vertices.map(v => {
      const xs = v.x * ins.scaleX;
      const ys = v.y * ins.scaleY;
      const rad = ins.rotation * Math.PI / 180;
      const xr = xs * Math.cos(rad) - ys * Math.sin(rad);
      const yr = xs * Math.sin(rad) + ys * Math.cos(rad);
      return { x: xr + ins.x, y: yr + ins.y };
    });
    
    let sumX = 0;
    transformed.forEach(p => sumX += p.x);
    const avgX = sumX / transformed.length;
    
    if (avgX < 155.0) {
      gskSshIntLeft.push(transformed);
    } else {
      gskSshIntRight.push(transformed);
    }
  });

  const rawContours = {
    // Left Sash
    L_SSH_EXT: [leftSshExt],
    L_SSH_INT: [leftSshInt],
    L_BZD: leftBzd ? [leftBzd] : [],
    L_GSK_BZD: leftGskBzd,
    L_GSK_SSH_EXT: leftSshGskExt,
    L_GSK_SSH_INT: gskSshIntLeft,
    L_SPACER: leftSpacers,
    L_STEEL: leftSteel,
    
    // Right Sash
    SSH_EXT: [rightSshExt],
    SSH_INT: [rightSshInt],
    BZD: rightBzd ? [rightBzd] : [],
    GSK_BZD: rightGskBzd,
    GSK_SSH_EXT: rightSshGskExt,
    GSK_SSH_INT: gskSshIntRight,
    SPACER: rightSpacers,
    STEEL: rightSteel,

    // Post
    PST_EXT: [mpExt],
    PST_INT: [mpInt],
    GSK_PST_L: gskPstL,
    GSK_PST_R: gskPstR,
    IGE_GSK_MD_MOVABLE_POST: gskMd,

    // Glass (Left and Right)
    L_GLS_EXT: [], L_GLS_MD: [], L_GLS_INT: [],
    GLS_EXT: [], GLS_MD: [], GLS_INT: []
  };

  // Glass packages
  const glsLayers = ['GLS_EXT', 'GLS_MD', 'GLS_INT'];
  glsLayers.forEach(layName => {
    const contours = layerContours[layName] || [];
    contours.forEach(c => {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      c.forEach(p => {
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      });
      if (minX !== Infinity) {
        const isLeft = minX < 150.0;
        const targetKey = isLeft ? `L_${layName}` : layName;
        rawContours[targetKey].push([
          { x: minX, y: minY }, { x: maxX, y: minY },
          { x: maxX, y: maxY }, { x: minX, y: maxY }
        ]);
      }
    });
  });

  // Compute global bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  Object.values(rawContours).forEach(contours => {
    contours.forEach(c => {
      c.forEach(p => {
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      });
    });
  });

  console.log(`📐 Global Bounds:`);
  console.log(`   X: ${minX.toFixed(4)} → ${maxX.toFixed(4)} mm (width: ${(maxX - minX).toFixed(4)} mm)`);
  console.log(`   Y: ${minY.toFixed(4)} → ${maxY.toFixed(4)} mm (height: ${(maxY - minY).toFixed(4)} mm)`);

  const GROUP_MAPPING = {
    PST: ['PST_EXT', 'PST_INT', 'GSK_PST_L', 'GSK_PST_R', 'IGE_GSK_MD_MOVABLE_POST'],
    SSH: ['SSH_EXT', 'SSH_INT', 'GSK_SSH_EXT', 'GSK_SSH_INT', 'BZD', 'GSK_BZD', 'SPACER', 'GLS_INT', 'GLS_MD', 'GLS_EXT', 'STEEL'],
    L_SSH: ['L_SSH_EXT', 'L_SSH_INT', 'L_GSK_SSH_EXT', 'L_GSK_SSH_INT', 'L_BZD', 'L_GSK_BZD', 'L_SPACER', 'L_GLS_INT', 'L_GLS_MD', 'L_GLS_EXT', 'L_STEEL']
  };

  const normalisedLayers = {};

  Object.entries(rawContours).forEach(([layerName, contours]) => {
    const groupName = Object.entries(GROUP_MAPPING).find(([, members]) =>
      members.includes(layerName)
    )?.[0] ?? null;

    normalisedLayers[layerName] = {
      group: groupName,
      contours: contours.map((c, idx) => {
        const normPts = c.map(p => ({
          x: parseFloat((p.x - minX).toFixed(6)),
          y: parseFloat((p.y - minY).toFixed(6))
        }));

        const tol = layerName.includes('GSK') ? 0.01 : SIMPLIFY_TOLERANCE;
        const simplified = simplifyContour(normPts, tol);
        const firstPt = simplified[0];
        const lastPt = simplified[simplified.length - 1];
        const residGap = dist(firstPt, lastPt);
        const verified = residGap < SNAP_TOLERANCE;

        return {
          id: `${layerName}_${idx}`,
          source: 'DXF_SOLID_BODY',
          dxfClosed: true,
          closed: true,
          verified,
          residualGap: parseFloat(residGap.toFixed(6)),
          pointCount: simplified.length,
          svgPath: toSvgPath(simplified),
          threeShape: toThreeShapeCommands(simplified),
          points: simplified
        };
      })
    };
  });

  const output = {
    meta: {
      source: path.basename(INPUT_FILE),
      system: '1600-IGLO EDGE',
      type: 'IGE_WINDOW_MOVABLE_POST',
      bounds: {
        raw: { minX, minY, maxX, maxY },
        normalised: { minX: 0, minY: 0, maxX: parseFloat((maxX - minX).toFixed(4)), maxY: parseFloat((maxY - minY).toFixed(4)) },
        width: maxX - minX,
        height: maxY - minY,
        unit: 'mm'
      }
    },
    groups: GROUP_MAPPING,
    layers: normalisedLayers
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Saved JSON to: ${OUT_FILE}`);

  // Build a beautiful SVG file
  const scale = 8;
  const PAD = 20;
  const svgW = (maxX - minX) * scale + PAD * 2;
  const svgH = (maxY - minY) * scale + PAD * 2;

  function tx(x) { return x * scale + PAD; }
  function ty(y) { return svgH - (y * scale + PAD); }

  function toPath(pts) {
    if (pts.length === 0) return '';
    return 'M ' + pts.map(p => `${tx(p.x)},${ty(p.y)}`).join(' L ') + ' Z';
  }

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" style="background:#1e1e2e;">
  <!-- Grid Lines -->
  <defs>
    <pattern id="grid" width="${10*scale}" height="${10*scale}" patternUnits="userSpaceOnUse">
      <path d="M ${10*scale} 0 L 0 0 0 ${10*scale}" fill="none" stroke="#2c2e3e" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <!-- Left Sash -->
  <path d="${toPath(output.layers.L_SSH_EXT.contours[0].points)}" fill="#e06c75" fill-opacity="0.85" stroke="#be5046" stroke-width="1.5" />
  <path d="${toPath(output.layers.L_SSH_INT.contours[0].points)}" fill="#61afef" fill-opacity="0.85" stroke="#4b8dc7" stroke-width="1.5" />
  
  <!-- Right Sash -->
  <path d="${toPath(output.layers.SSH_EXT.contours[0].points)}" fill="#e5c07b" fill-opacity="0.85" stroke="#d19a66" stroke-width="1.5" />
  <path d="${toPath(output.layers.SSH_INT.contours[0].points)}" fill="#98c379" fill-opacity="0.85" stroke="#5c6370" stroke-width="1.5" />
  
  <!-- Movable Post -->
  <path d="${toPath(output.layers.PST_EXT.contours[0].points)}" fill="#c678dd" fill-opacity="0.85" stroke="#a359c2" stroke-width="1.5" />
  <path d="${toPath(output.layers.PST_INT.contours[0].points)}" fill="#56b6c2" fill-opacity="0.85" stroke="#3b96a1" stroke-width="1.5" />

  <!-- Labels -->
  <text x="${tx(96 - minX)}" y="${ty(80 - minY)}" fill="#fff" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">L_SSH_EXT</text>
  <text x="${tx(96 - minX)}" y="${ty(35 - minY)}" fill="#fff" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">L_SSH_INT</text>
  <text x="${tx(218 - minX)}" y="${ty(80 - minY)}" fill="#fff" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">SSH_EXT</text>
  <text x="${tx(218 - minX)}" y="${ty(35 - minY)}" fill="#fff" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">SSH_INT</text>
  <text x="${tx(157 - minX)}" y="${ty(98 - minY)}" fill="#fff" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">PST_EXT</text>
  <text x="${tx(157 - minX)}" y="${ty(54 - minY)}" fill="#fff" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">PST_INT</text>

  <!-- Gaskets, Spacers, Glazing beads, Glass, etc -->
`;

  const layerColors = {
    'L_GSK_SSH_EXT': '#ff007f',
    'GSK_SSH_EXT': '#ff007f',
    'L_GSK_SSH_INT': '#ff007f',
    'GSK_SSH_INT': '#ff007f',
    'GSK_PST_L': '#ff00ff',
    'GSK_PST_R': '#ff00ff',
    'IGE_GSK_MD_MOVABLE_POST': '#7f00ff',
    'L_GSK_BZD': '#00ffff',
    'GSK_BZD': '#00ffff',
    'L_BZD': '#d19a66',
    'BZD': '#d19a66',
    'L_SPACER': '#888',
    'SPACER': '#888',
    'L_GLS_EXT': '#4fc3f7',
    'L_GLS_MD': '#4fc3f7',
    'L_GLS_INT': '#4fc3f7',
    'GLS_EXT': '#4fc3f7',
    'GLS_MD': '#4fc3f7',
    'GLS_INT': '#4fc3f7',
    'L_STEEL': '#abb2bf',
    'STEEL': '#abb2bf'
  };

  Object.entries(output.layers).forEach(([layerName, layerData]) => {
    if (['L_SSH_EXT', 'L_SSH_INT', 'SSH_EXT', 'SSH_INT', 'PST_EXT', 'PST_INT'].includes(layerName)) return;
    
    let color = '#888';
    let opacity = 0.5;
    let strokeWidth = 1;

    if (layerColors[layerName]) {
      color = layerColors[layerName];
      opacity = layerName.includes('GLS') ? 0.3 : 0.8;
      strokeWidth = layerName.includes('GSK') ? 1.5 : 1.0;
    }

    layerData.contours.forEach(c => {
      svg += `  <path d="${toPath(c.points)}" fill="${color}" fill-opacity="${opacity}" stroke="${color}" stroke-width="${strokeWidth}" />\n`;
    });
  });

  svg += `  <!-- Split Lines -->
  <line x1="${tx(0)}" y1="${ty(sshSplitY - minY)}" x2="${tx(maxX - minX)}" y2="${ty(sshSplitY - minY)}" stroke="#ff4a4a" stroke-dasharray="4,4" stroke-width="1.5" />
  <text x="${tx((maxX - minX) * 0.98)}" y="${ty(sshSplitY - minY + 2)}" fill="#ff4a4a" font-family="sans-serif" font-size="10" text-anchor="end" font-weight="bold">SASH SPLIT (Y=60.00)</text>

  <line x1="${tx(0)}" y1="${ty(mpSplitY - minY)}" x2="${tx(maxX - minX)}" y2="${ty(mpSplitY - minY)}" stroke="#ff4a4a" stroke-dasharray="4,4" stroke-width="1.5" />
  <text x="${tx((maxX - minX) * 0.02)}" y="${ty(mpSplitY - minY - 4)}" fill="#ff4a4a" font-family="sans-serif" font-size="10" text-anchor="start" font-weight="bold">POST SPLIT (Y=76.75)</text>
</svg>
`;

  fs.mkdirSync(path.dirname(SVG_OUT), { recursive: true });
  fs.writeFileSync(SVG_OUT, svg);
  fs.writeFileSync(SVG_PUBLIC, svg);
  console.log(`✅ Preview SVG saved to: ${SVG_OUT} and ${SVG_PUBLIC}`);
}

main().catch(err => { console.error('❌', err); process.exit(1); });
