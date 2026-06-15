import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH.dxf";
const OUT_FILE = "scratch/f104_raw_contours.svg";

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
  
  const layerColors = {
    IGE_FRM: '#409eff',
    IGE_SSH: '#ff7a45',
    IGE_BZD: '#ffc53d',
    IGE_GSK_EXT: '#ff4d4f',
    IGE_GSK_FRM_MD: '#eb2f96',
    IGE_GSK_BZD: '#722ed1',
    IGE_SPACER: '#13c2c2',
    IGE_GLS_EXT: '#52c41a',
    IGE_GLS_MD: '#2f54eb',
    IGE_GLS_INT: '#fa8c16'
  };

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const allContours = {};

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
      allContours[layerName] = contours;
      contours.forEach(c => c.forEach(p => {
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      }));
    }
  }

  const SCALE = 6;
  const PADDING = 40;
  const width = (maxX - minX) * SCALE + PADDING * 2;
  const height = (maxY - minY) * SCALE + PADDING * 2 + 150; // extra space for legend

  function tx(x) { return (x - minX) * SCALE + PADDING; }
  function ty(y) { return height - ((y - minY) * SCALE + PADDING + 120); } // shift up for legend at bottom

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width.toFixed(0)}" height="${height.toFixed(0)}" style="background:#14141d;">
  <text x="${width/2}" y="30" fill="#ffffff" font-family="monospace" font-size="16" font-weight="bold" text-anchor="middle">IGE_FRM_SSH.dxf - All Layers and Contours</text>
  <g stroke-linecap="round" stroke-linejoin="round">
`;

  // Draw contours
  for (const [layerName, contours] of Object.entries(allContours)) {
    const color = layerColors[layerName] || '#ffffff';
    contours.forEach((c, idx) => {
      const d = 'M ' + c.map(p => `${tx(p.x).toFixed(2)},${ty(p.y).toFixed(2)}`).join(' L ') + ' Z';
      svg += `    <path d="${d}" fill="none" stroke="${color}" stroke-width="2" opacity="0.85" />\n`;
      
      // Label centroid
      let sumX = 0, sumY = 0;
      c.forEach(p => { sumX += p.x; sumY += p.y; });
      const cx = sumX / c.length;
      const cy = sumY / c.length;
      svg += `    <circle cx="${tx(cx).toFixed(2)}" cy="${ty(cy).toFixed(2)}" r="2.5" fill="${color}" />\n`;
      svg += `    <text x="${tx(cx).toFixed(2)}" y="${(ty(cy) - 4).toFixed(2)}" fill="#ffffff" font-family="sans-serif" font-size="8" text-anchor="middle" opacity="0.75">${layerName}_${idx}</text>\n`;
    });
  }

  svg += `  </g>\n  <!-- Legend -->\n  <g transform="translate(40, ${height - 100})">\n`;
  let legIdx = 0;
  for (const [layerName, color] of Object.entries(layerColors)) {
    const col = legIdx % 4;
    const row = Math.floor(legIdx / 4);
    const lx = col * 180;
    const ly = row * 25;
    const count = allContours[layerName] ? allContours[layerName].length : 0;
    svg += `    <rect x="${lx}" y="${ly}" width="15" height="15" fill="${color}" rx="3"/>\n`;
    svg += `    <text x="${lx + 22}" y="${ly + 12}" fill="#ffffff" font-family="monospace" font-size="11" text-anchor="start">${layerName} (${count})</text>\n`;
    legIdx++;
  }
  svg += `  </g>\n</svg>`;

  fs.writeFileSync(OUT_FILE, svg, 'utf-8');
  console.log(`✅ Saved preview SVG to: ${OUT_FILE}`);
} catch (err) {
  console.error(err);
}
