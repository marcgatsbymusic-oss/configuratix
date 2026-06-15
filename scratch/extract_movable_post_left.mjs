import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_MOVABLEPOST_MAIN_OPENING_LEFT.dxf";
const OUT_FILE = "c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/data/profiles/IgloEdge/IGE_MOVABLEPOST_LEFT_OPENING.json";
const SVG_OUT = "C:/Users/Shadow/.gemini/antigravity/brain/a5846d4a-35e4-4504-8d50-d5a790726501/IGE_MOVABLEPOST_LEFT_OPENING.svg";

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

async function main() {
  console.log(`\n📂 Reading: ${INPUT_FILE}`);
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

    const stitched = chainSegments(segments, 1.5);
    const closedContours = [];
    
    stitched.forEach(chain => {
      const closed = closeAndSnap(chain);
      if (closed.length > 2) closedContours.push(closed);
    });

    if (closedContours.length > 0) {
      layerContours[layerName] = closedContours;
    }
  }

  // Find solid bodies
  const sshContours = layerContours['IGE_SSH'] || [];
  let largestSsh = null, maxSshArea = -1;
  sshContours.forEach(c => {
    const a = getPolygonArea(c);
    if (a > maxSshArea) { maxSshArea = a; largestSsh = c; }
  });

  const mpContours = layerContours['IGE_MOVABLE_POST'] || [];
  let largestMp = null, maxMpArea = -1;
  mpContours.forEach(c => {
    const a = getPolygonArea(c);
    if (a > maxMpArea) { maxMpArea = a; largestMp = c; }
  });

  const bzdContours = layerContours['IGE_BZD'] || [];
  let largestBzd = null, maxBzdArea = -1;
  bzdContours.forEach(c => {
    const a = getPolygonArea(c);
    if (a > maxBzdArea) { maxBzdArea = a; largestBzd = c; }
  });

  if (!largestSsh || !largestMp || !largestBzd) {
    console.error('Error: Could not find required layers (IGE_SSH, IGE_MOVABLE_POST, or IGE_BZD)!');
    process.exit(1);
  }

  // 1) Perpendicular (horizontal) splits along the Y-axis:
  // Sash: Y-midpoint is 60.00 mm. EXT is Y >= 60.00, INT is Y <= 60.00
  const sshSplitY = 60.00;
  const sshExt = clipPolygonY(largestSsh, sshSplitY, false); // >= sshSplitY
  const sshInt = clipPolygonY(largestSsh, sshSplitY, true);  // <= sshSplitY

  // Movable Post: Y-midpoint is 76.75 mm. EXT is Y >= 76.75, INT is Y <= 76.75
  const mpSplitY = 76.75;
  const mpExt = clipPolygonY(largestMp, mpSplitY, false); // >= mpSplitY
  const mpInt = clipPolygonY(largestMp, mpSplitY, true);  // <= mpSplitY

  // Keep the exact geometry of EPDM gaskets & make BZD solid (keep only largestBzd)
  // Map GSK_SSH_INT from DXF to output layer GSK_SSH_INT
  // Map IGE_GSK_MD_SSH (middle gasket) from DXF to output layer IGE_GSK_MD_MOVABLE_POST
  const rawContours = {
    SSH_EXT: [sshExt],
    SSH_INT: [sshInt],
    PST_EXT: [mpExt],
    PST_INT: [mpInt],
    GSK_SSH_EXT: layerContours['IGE_GSK_EXT'] || [],
    GSK_SSH_INT: layerContours['GSK_SSH_INT'] || [], // Map DXF layer GSK_SSH_INT to output layer GSK_SSH_INT
    IGE_GSK_MD_MOVABLE_POST: layerContours['IGE_GSK_MD_SSH'] || [], // Map middle gasket to IGE_GSK_MD_MOVABLE_POST
    BZD: [largestBzd], // Solid object with no inner lines
    GSK_BZD: layerContours['IGE_GSK_BZD'] || [],
    SPACER: layerContours['IGE_SPACER'] || [],
    GLS_EXT: [],
    GLS_MD: [],
    GLS_INT: []
  };

  // Glass packages
  const glsLayers = ['IGE_GLS_EXT', 'IGE_GLS_MD', 'IGE_GLS_INT'];
  const targetGlsKeys = ['GLS_EXT', 'GLS_MD', 'GLS_INT'];
  glsLayers.forEach((layName, idx) => {
    const contours = layerContours[layName] || [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    contours.forEach(c => c.forEach(p => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    }));
    if (minX !== Infinity) {
      rawContours[targetGlsKeys[idx]].push([
        { x: minX, y: minY }, { x: maxX, y: minY },
        { x: maxX, y: maxY }, { x: minX, y: maxY }
      ]);
    }
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
    PST: ['PST_EXT', 'PST_INT', 'IGE_GSK_MD_MOVABLE_POST'],
    SSH: ['SSH_EXT', 'SSH_INT', 'GSK_SSH_EXT', 'GSK_SSH_INT', 'BZD', 'GSK_BZD', 'SPACER', 'GLS_INT', 'GLS_MD', 'GLS_EXT']
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

        // EPDM gaskets get smaller simplification tolerance (0.01mm) to keep exact geometry
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
      type: 'IGE_MOVABLEPOST_LEFT_OPENING',
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
  
  <!-- Solid Sash Split Preview (Horizontal) -->
  <path d="${toPath(output.layers.SSH_EXT.contours[0].points)}" fill="#e05a47" fill-opacity="0.8" stroke="#f06a57" stroke-width="1.5" />
  <path d="${toPath(output.layers.SSH_INT.contours[0].points)}" fill="#4a90e2" fill-opacity="0.8" stroke="#5fa6f2" stroke-width="1.5" />
  
  <!-- Solid Movable Post Split Preview (Horizontal) -->
  <path d="${toPath(output.layers.PST_EXT.contours[0].points)}" fill="#c59b27" fill-opacity="0.8" stroke="#d5ab37" stroke-width="1.5" />
  <path d="${toPath(output.layers.PST_INT.contours[0].points)}" fill="#2ca02c" fill-opacity="0.8" stroke="#3cba3c" stroke-width="1.5" />

  <!-- Labels -->
  <text x="${tx(190 - minX)}" y="${ty(100 - minY)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">PST_EXT</text>
  <text x="${tx(190 - minX)}" y="${ty(50 - minY)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">PST_INT</text>
  <text x="${tx(245 - minX)}" y="${ty(80 - minY)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">SSH_EXT</text>
  <text x="${tx(245 - minX)}" y="${ty(35 - minY)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">SSH_INT</text>

  <!-- Other contours (Gaskets, Glass, Bead etc) -->
`;

  const gskColors = {
    'GSK_SSH_EXT': '#ff007f',
    'GSK_SSH_INT': '#ff00ff', // Magenta/pink for interior sash gasket
    'IGE_GSK_MD_MOVABLE_POST': '#9b30ff', // Purple for middle gasket
    'GSK_BZD': '#00ffff'
  };

  Object.entries(output.layers).forEach(([layerName, layerData]) => {
    if (['SSH_EXT', 'SSH_INT', 'PST_EXT', 'PST_INT'].includes(layerName)) return;
    
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
  <line x1="${tx(0)}" y1="${ty(sshSplitY - minY)}" x2="${tx(maxX - minX)}" y2="${ty(sshSplitY - minY)}" stroke="#ff0000" stroke-dasharray="4,4" stroke-width="1.5" />
  <text x="${tx((maxX - minX) * 0.95)}" y="${ty(sshSplitY - minY + 2)}" fill="#ff0000" font-family="monospace" font-size="10" text-anchor="end">Sash Split</text>

  <line x1="${tx(0)}" y1="${ty(mpSplitY - minY)}" x2="${tx(maxX - minX)}" y2="${ty(mpSplitY - minY)}" stroke="#ff0000" stroke-dasharray="4,4" stroke-width="1.5" />
  <text x="${tx((maxX - minX) * 0.05)}" y="${ty(mpSplitY - minY - 4)}" fill="#ff0000" font-family="monospace" font-size="10" text-anchor="start">Post Split</text>
</svg>
`;

  fs.mkdirSync(path.dirname(SVG_OUT), { recursive: true });
  fs.writeFileSync(SVG_OUT, svg);
  console.log(`✅ Preview SVG saved to: ${SVG_OUT}`);

  // Summary
  console.log('\n📊 Layer summary:');
  for (const [layer, data] of Object.entries(output.layers)) {
    const cList = data.contours.map(c => `${c.pointCount}pts`).join(' | ');
    console.log(`   ${layer.padEnd(25)} [${(data.group||'?').padEnd(3)}]  ${cList}`);
  }
}

main().catch(err => { console.error('❌', err); process.exit(1); });
