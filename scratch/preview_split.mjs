import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_MOVABLEPOST_MAIN_OPENING_LEFT.dxf";
const SVG_OUT = "C:/Users/Shadow/.gemini/antigravity/brain/a5846d4a-35e4-4504-8d50-d5a790726501/IGE_MOVABLEPOST_LEFT_OPENING.svg";

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

try {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

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

  if (!largestSsh || !largestMp) {
    console.error('Error: Could not find IGE_SSH or IGE_MOVABLE_POST solid bodies!');
    process.exit(1);
  }

  // Split sash at its midpoint: (197.00 + 273.00) / 2 = 235.00
  const sshSplitX = 235.00;
  const sshExt = clipPolygon(largestSsh, sshSplitX, true);
  const sshInt = clipPolygon(largestSsh, sshSplitX, false);

  // Split movable post at its midpoint: (154.00 + 232.00) / 2 = 193.00
  const mpSplitX = 193.00;
  const mpExt = clipPolygon(largestMp, mpSplitX, true);
  const mpInt = clipPolygon(largestMp, mpSplitX, false);

  // Determine global bounds for SVG canvas
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  Object.values(layerContours).forEach(contours => {
    contours.forEach(c => {
      c.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
    });
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const SCALE = 8;
  const PAD = 20;
  const svgW = width * SCALE + PAD * 2;
  const svgH = height * SCALE + PAD * 2;

  function tx(x) { return (x - minX) * SCALE + PAD; }
  function ty(y) { return svgH - ((y - minY) * SCALE + PAD); }

  function toPath(pts) {
    if (pts.length === 0) return '';
    return 'M ' + pts.map(p => `${tx(p.x)},${ty(p.y)}`).join(' L ') + ' Z';
  }

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" style="background:#0d1117;">
  <!-- Grid Lines -->
  <defs>
    <pattern id="grid" width="${10*SCALE}" height="${10*SCALE}" patternUnits="userSpaceOnUse">
      <path d="M ${10*SCALE} 0 L 0 0 0 ${10*SCALE}" fill="none" stroke="#223" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <!-- Solid Sash Split Preview -->
  <path d="${toPath(sshExt)}" fill="#e05a47" fill-opacity="0.8" stroke="#f06a57" stroke-width="1.5" />
  <path d="${toPath(sshInt)}" fill="#4a90e2" fill-opacity="0.8" stroke="#5fa6f2" stroke-width="1.5" />
  
  <!-- Solid Movable Post Split Preview -->
  <path d="${toPath(mpExt)}" fill="#c59b27" fill-opacity="0.8" stroke="#d5ab37" stroke-width="1.5" />
  <path d="${toPath(mpInt)}" fill="#2ca02c" fill-opacity="0.8" stroke="#3cba3c" stroke-width="1.5" />

  <!-- Labels -->
  <text x="${tx(215)}" y="${ty(60)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">PST_EXT</text>
  <text x="${tx(202)}" y="${ty(110)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">PST_INT</text>
  <text x="${tx(215)}" y="${ty(25)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">SSH_EXT</text>
  <text x="${tx(255)}" y="${ty(80)}" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">SSH_INT</text>

  <!-- Other contours (Gaskets, Glass, Bead etc) -->
`;

  // Draw Gaskets in special colors
  const gskColors = {
    'IGE_GSK_EXT': '#ff007f',
    'IGE_GSK_MD_SSH': '#ff00ff',
    'IGE_GSK_BZD': '#00ffff'
  };

  Object.entries(layerContours).forEach(([layerName, contours]) => {
    if (layerName === 'IGE_SSH' || layerName === 'IGE_MOVABLE_POST') return;
    
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
    } else if (layerName === 'IGE_BZD') {
      color = '#e0a050';
      opacity = 0.7;
    }

    contours.forEach(c => {
      svg += `  <path d="${toPath(c)}" fill="${color}" fill-opacity="${opacity}" stroke="${color}" stroke-width="${strokeWidth}" />\n`;
    });
  });

  svg += `  <!-- Split Lines -->
  <line x1="${tx(sshSplitX)}" y1="${ty(minY - 5)}" x2="${tx(sshSplitX)}" y2="${ty(maxY + 5)}" stroke="#ff0000" stroke-dasharray="4,4" stroke-width="1.5" />
  <text x="${tx(sshSplitX)}" y="${ty(maxY + 4)}" fill="#ff0000" font-family="monospace" font-size="10" text-anchor="middle">Sash Split X=${sshSplitX}</text>

  <line x1="${tx(mpSplitX)}" y1="${ty(minY - 5)}" x2="${tx(mpSplitX)}" y2="${ty(maxY + 5)}" stroke="#ff0000" stroke-dasharray="4,4" stroke-width="1.5" />
  <text x="${tx(mpSplitX)}" y="${ty(minY - 2)}" fill="#ff0000" font-family="monospace" font-size="10" text-anchor="middle">Movable Post Split X=${mpSplitX}</text>
</svg>
`;

  fs.mkdirSync(path.dirname(SVG_OUT), { recursive: true });
  fs.writeFileSync(SVG_OUT, svg);
  console.log(`✅ SVG preview generated at: ${SVG_OUT}`);

} catch (err) {
  console.error(err);
}
