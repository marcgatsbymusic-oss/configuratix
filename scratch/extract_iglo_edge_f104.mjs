import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH_V2.dxf";
const OUT_FILE = "c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/data/profiles/IgloEdge/IGE_F104.json";
const SVG_OUT = "C:/Users/Shadow/.gemini/antigravity/brain/6b9806df-1085-4711-9884-04ae8c4485f5/IGE_F104_profile.svg";
const SVG_PUBLIC = "c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/public/IGE_F104_profile.svg";

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
    let bestMode = ''; // 'start-start', 'start-end', 'end-start', 'end-end', 'self-close'

    for (let i = 0; i < currentChains.length; i++) {
      const c1 = currentChains[i];
      if (c1.closed) continue;

      const s1 = c1.pts[0];
      const e1 = c1.pts[c1.pts.length - 1];

      // Self-close check
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

function makeSolidBlocks(contours, minArea = 1.0) {
  if (!contours || contours.length === 0) return [];
  
  // Filter out degenerate contours
  const validContours = contours.filter(c => {
    if (c.length < 3) return false;
    const area = getPolygonArea(c);
    return area >= minArea;
  });

  // Sort contours by area descending so that outer loops are processed first
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

function getCentroid(pts) {
  let cx = 0, cy = 0;
  pts.forEach(p => { cx += p.x; cy += p.y; });
  return { x: cx / pts.length, y: cy / pts.length };
}

// Sutherland-Hodgman polygon clipper
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

async function main() {
  console.log(`\n📂 Reading: ${INPUT_FILE}`);
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  // rawGeoms will group transformed dxf entities by layer
  const rawGeoms = {};

  function collectEntities(entities, tx, parentBlockName) {
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
          collectEntities(block.entities, nextTx, ent.name);
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

  collectEntities(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }, null);

  const layerContours = {};

  // Process each layer and stitch/chain LINEs & ARCs
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
        if (entity.closed && verts.length > 2) {
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

    // Stitch the segments into closed contours (using layer-specific tolerances to avoid noise)
    const tol = (layerName === 'IGE_GSK_BZD' || layerName === 'IGE_BZD') ? 0.8 : 0.1;
    const initialChains = chainSegments(segments, 0.1);
    const stitched = stitchChains(initialChains, tol);
    const closedContours = [];
    
    stitched.forEach(chain => {
      const closed = closeAndSnap(chain, tol);
      if (closed.length > 2) closedContours.push(closed);
    });

    if (closedContours.length > 0) {
      layerContours[layerName] = closedContours;
      console.log(`Layer "${layerName}" -> stitched into ${closedContours.length} closed contours (stitch tol: ${tol}mm).`);
    }
  }

  // 1. FRAME: find largest contour of IGE_FRM
  const frmContours = layerContours['IGE_FRM'] || [];
  let largestFrm = null, maxFrmArea = -1;
  frmContours.forEach(contour => {
    const a = getPolygonArea(contour);
    if (a > maxFrmArea) { maxFrmArea = a; largestFrm = contour; }
  });
  const splitX = 41.0;
  const frmExt = largestFrm ? clipPolygon(largestFrm, splitX, true) : [];
  const frmInt = largestFrm ? clipPolygon(largestFrm, splitX, false) : [];

  // 2. SASH: find largest contour of IGE_SSH
  const sshContours = layerContours['IGE_SSH'] || [];
  let largestSsh = null, maxSshArea = -1;
  sshContours.forEach(contour => {
    const a = getPolygonArea(contour);
    if (a > maxSshArea) { maxSshArea = a; largestSsh = contour; }
  });
  const splitX_ssh = 60.0;
  const sshExt = largestSsh ? clipPolygon(largestSsh, splitX_ssh, true) : [];
  const sshInt = largestSsh ? clipPolygon(largestSsh, splitX_ssh, false) : [];

  // 3. BEAD: find largest contour of IGE_BZD
  const bzdContours = layerContours['IGE_BZD'] || [];
  let largestBzd = null, maxBzdArea = -1;
  bzdContours.forEach(contour => {
    const a = getPolygonArea(contour);
    if (a > maxBzdArea) { maxBzdArea = a; largestBzd = contour; }
  });

  // 4. GSK_FRM_EXT: combines IGE_GSK_EXT (avgX < 25) and IGE_GSK_FRM_MD
  const gskExtContours = layerContours['IGE_GSK_EXT'] || [];
  const gskFrmMDContours = layerContours['IGE_GSK_FRM_MD'] || [];
  const gskFrmExtCandidates = [];
  gskExtContours.forEach(c => {
    const avgX = c.reduce((sum, p) => sum + p.x, 0) / c.length;
    if (avgX < 25.0) {
      gskFrmExtCandidates.push(c);
    }
  });
  gskFrmMDContours.forEach(c => {
    gskFrmExtCandidates.push(c);
  });
  const gskFrmExt = makeSolidBlocks(gskFrmExtCandidates, 10.0);

  // 5. GSK_SSH_EXT: IGE_GSK_EXT (avgX >= 25)
  const gskSshExtCandidates = [];
  gskExtContours.forEach(c => {
    const avgX = c.reduce((sum, p) => sum + p.x, 0) / c.length;
    if (avgX >= 25.0) {
      gskSshExtCandidates.push(c);
    }
  });
  const gskSshExt = makeSolidBlocks(gskSshExtCandidates, 10.0);

  // 6. GSK_SSH_INT: IGE_GSK_SSH_INT
  const gskSshInt = makeSolidBlocks(layerContours['IGE_GSK_SSH_INT'] || [], 10.0);

  // 7. GSK_BZD: IGE_GSK_BZD
  const gskBzd = makeSolidBlocks(layerContours['IGE_GSK_BZD'] || [], 10.0);

  // 8. SPACER: IGE_SPACER
  const spacer = makeSolidBlocks(layerContours['IGE_SPACER'] || [], 5.0);

  // 9. GLS Layers
  const glsExtList = [];
  const glsExtContours = layerContours['IGE_GLS_EXT'] || [];
  let minX_gls = Infinity, maxX_gls = -Infinity, minY_gls = Infinity, maxY_gls = -Infinity;
  glsExtContours.forEach(c => c.forEach(p => {
    if (p.x < minX_gls) minX_gls = p.x; if (p.x > maxX_gls) maxX_gls = p.x;
    if (p.y < minY_gls) minY_gls = p.y; if (p.y > maxY_gls) maxY_gls = p.y;
  }));
  if (minX_gls !== Infinity) {
    glsExtList.push([
      { x: minX_gls, y: minY_gls }, { x: maxX_gls, y: minY_gls },
      { x: maxX_gls, y: maxY_gls }, { x: minX_gls, y: maxY_gls }
    ]);
  }

  const glsMdList = [];
  const glsMdContours = layerContours['IGE_GLS_MD'] || [];
  minX_gls = Infinity; maxX_gls = -Infinity; minY_gls = Infinity; maxY_gls = -Infinity;
  glsMdContours.forEach(c => c.forEach(p => {
    if (p.x < minX_gls) minX_gls = p.x; if (p.x > maxX_gls) maxX_gls = p.x;
    if (p.y < minY_gls) minY_gls = p.y; if (p.y > maxY_gls) maxY_gls = p.y;
  }));
  if (minX_gls !== Infinity) {
    glsMdList.push([
      { x: minX_gls, y: minY_gls }, { x: maxX_gls, y: minY_gls },
      { x: maxX_gls, y: maxY_gls }, { x: minX_gls, y: maxY_gls }
    ]);
  }

  const glsIntList = [];
  const glsIntContours = layerContours['IGE_GLS_INT'] || [];
  minX_gls = Infinity; maxX_gls = -Infinity; minY_gls = Infinity; maxY_gls = -Infinity;
  glsIntContours.forEach(c => c.forEach(p => {
    if (p.x < minX_gls) minX_gls = p.x; if (p.x > maxX_gls) maxX_gls = p.x;
    if (p.y < minY_gls) minY_gls = p.y; if (p.y > maxY_gls) maxY_gls = p.y;
  }));
  if (minX_gls !== Infinity) {
    glsIntList.push([
      { x: minX_gls, y: minY_gls }, { x: maxX_gls, y: minY_gls },
      { x: maxX_gls, y: maxY_gls }, { x: minX_gls, y: maxY_gls }
    ]);
  }

  const rawContours = {
    FRM_EXT: frmExt.length > 2 ? [frmExt] : [],
    FRM_INT: frmInt.length > 2 ? [frmInt] : [],
    SSH_EXT: sshExt.length > 2 ? [sshExt] : [],
    SSH_INT: sshInt.length > 2 ? [sshInt] : [],
    GSK_FRM_EXT: gskFrmExt,
    GSK_SSH_EXT: gskSshExt,
    GSK_SSH_INT: gskSshInt,
    BZD: largestBzd ? [largestBzd] : [],
    GSK_BZD: gskBzd,
    SPACER: spacer,
    GLS_EXT: glsExtList,
    GLS_MD: glsMdList,
    GLS_INT: glsIntList
  };

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

  const normalisedLayers = {};
  const GROUP_MAPPING = {
    FRM: ['FRM_EXT', 'FRM_INT', 'GSK_FRM_EXT'],
    SSH: ['SSH_EXT', 'SSH_INT', 'GSK_SSH_EXT', 'GSK_SSH_INT', 'BZD', 'GSK_BZD', 'SPACER', 'GLS_INT', 'GLS_MD', 'GLS_EXT']
  };

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

        // EPDM gaskets get smaller simplification tolerance (0.01mm) to keep exact geometry
        const tol = layerName.includes('GSK') ? 0.01 : SIMPLIFY_TOLERANCE;
        const simplified = simplifyContour(normPts, tol);
        const firstPt = simplified[0];
        const lastPt = simplified[simplified.length - 1];
        const residGap = dist(firstPt, lastPt);
        
        // We consider it verified if the residual gap is snapped/closed within SNAP_TOLERANCE (0.05mm)
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
      type: 'F104',
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

  // Build the preview SVG from normalized coordinates
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
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" style="background:#0d1117;">
  <!-- Grid Lines -->
  <defs>
    <pattern id="grid" width="${10*scale}" height="${10*scale}" patternUnits="userSpaceOnUse">
      <path d="M ${10*scale} 0 L 0 0 0 ${10*scale}" fill="none" stroke="#223" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <!-- Solid FRM Split Preview -->
  <path d="${toPath(output.layers.FRM_EXT.contours[0].points)}" fill="#c59b27" fill-opacity="0.8" stroke="#d5ab37" stroke-width="1.5" />
  <path d="${toPath(output.layers.FRM_INT.contours[0].points)}" fill="#2ca02c" fill-opacity="0.8" stroke="#3cba3c" stroke-width="1.5" />
  
  <!-- Solid SSH Split Preview -->
  <path d="${toPath(output.layers.SSH_EXT.contours[0].points)}" fill="#e05a47" fill-opacity="0.8" stroke="#f06a57" stroke-width="1.5" />
  <path d="${toPath(output.layers.SSH_INT.contours[0].points)}" fill="#4a90e2" fill-opacity="0.8" stroke="#5fa6f2" stroke-width="1.5" />

  <!-- Labels -->
  <text x="${tx(20 - minX)}" y="${ty(100 - minY)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">SSH_EXT</text>
  <text x="${tx(20 - minX)}" y="${ty(30 - minY)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">FRM_EXT</text>
  <text x="${tx(70 - minX)}" y="${ty(100 - minY)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">SSH_INT</text>
  <text x="${tx(70 - minX)}" y="${ty(30 - minY)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">FRM_INT</text>

  <!-- Other contours (Gaskets, Glass, Bead etc) -->
`;

  const gskColors = {
    'GSK_FRM_EXT': '#ff007f',
    'GSK_SSH_EXT': '#ff007f',
    'GSK_SSH_INT': '#ff00ff',
    'GSK_BZD': '#00ffff'
  };

  Object.entries(output.layers).forEach(([layerName, layerData]) => {
    if (['FRM_EXT', 'FRM_INT', 'SSH_EXT', 'SSH_INT'].includes(layerName)) return;
    
    let color = '#888';
    let opacity = 0.5;
    let strokeWidth = 1;

    if (gskColors[layerName]) {
      color = gskColors[layerName];
      opacity = 0.9;
      strokeWidth = 1.5;
    } else if (layerName.includes('GLS')) {
      color = '#a0c0e0';
      opacity = 0.4;
    } else if (layerName === 'BZD') {
      color = '#e0a050';
      opacity = 0.7;
      strokeWidth = 1.5;
    }

    layerData.contours.forEach(c => {
      svg += `  <path d="${toPath(c.points)}" fill="${color}" fill-opacity="${opacity}" stroke="${color}" stroke-width="${strokeWidth}" />\n`;
    });
  });

  svg += `  <!-- Split Lines -->
  <line x1="${tx(splitX - minX)}" y1="${ty(0)}" x2="${tx(splitX - minX)}" y2="${ty(maxY - minY)}" stroke="#ff0000" stroke-dasharray="4,4" stroke-width="1.5" />
  <text x="${tx(splitX - minX + 2)}" y="${ty((maxY - minY) * 0.95)}" fill="#ff0000" font-family="monospace" font-size="10" text-anchor="start">Frame Split</text>

  <line x1="${tx(splitX_ssh - minX)}" y1="${ty(0)}" x2="${tx(splitX_ssh - minX)}" y2="${ty(maxY - minY)}" stroke="#ff0000" stroke-dasharray="4,4" stroke-width="1.5" />
  <text x="${tx(splitX_ssh - minX + 2)}" y="${ty((maxY - minY) * 0.05)}" fill="#ff0000" font-family="monospace" font-size="10" text-anchor="start">Sash Split</text>
</svg>
`;

  fs.mkdirSync(path.dirname(SVG_OUT), { recursive: true });
  fs.writeFileSync(SVG_OUT, svg);
  fs.writeFileSync(SVG_PUBLIC, svg);
  console.log(`✅ Preview SVG saved to: ${SVG_OUT} and public/`);

  // Summary
  console.log('\n📊 Layer summary:');
  for (const [layer, data] of Object.entries(output.layers)) {
    const cList = data.contours.map(c => `${c.pointCount}pts`).join(' | ');
    console.log(`   ${layer.padEnd(14)} [${(data.group||'?').padEnd(3)}]  ${cList}`);
  }
}

main().catch(err => { console.error('❌', err); process.exit(1); });
