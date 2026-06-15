import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";

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
    chains.push(chain);
  }
  return chains;
}

function closeAndSnap(pts) {
  if (pts.length < 2) return pts;
  const gap = dist(pts[0], pts[pts.length - 1]);
  if (gap === 0 || gap <= 0.05) pts.pop();
  return pts;
}

function main() {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  const rawGeoms = {};
  function collect(entities, tx) {
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
          collect(block.entities, nextTx);
        }
      } else {
        const layer = ent.layer || 'unknown';
        if (!rawGeoms[layer]) rawGeoms[layer] = [];
        rawGeoms[layer].push({ entity: ent, tx });
      }
    });
  }

  collect(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

  const allContours = {};
  for (const [layer, items] of Object.entries(rawGeoms)) {
    const segments = [];
    const lwpolys = [];
    items.forEach(({ entity, tx }) => {
      if (entity.type === 'LINE') {
        if (entity.vertices && entity.vertices.length >= 2) {
          const s = transformPoint(entity.vertices[0], tx);
          const e = transformPoint(entity.vertices[1], tx);
          segments.push({ start: s, end: e, pts: [s, e] });
        }
      } else if (entity.type === 'ARC') {
        const pts = arcToPolyline(entity.center, entity.radius, entity.startAngle, entity.endAngle, tx);
        segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
      } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
        const verts = entity.vertices;
        if (verts && verts.length > 0) {
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
      }
    });

    const stitched = chainSegments(segments, 1.5);
    const closed = [];
    stitched.forEach(ch => { if (ch.length > 2) closed.push(closeAndSnap(ch)); });
    lwpolys.forEach(ch => { if (ch.length > 2) closed.push(closeAndSnap(ch)); });

    if (closed.length > 0) {
      allContours[layer] = closed;
    }
  }

  const doorFrm = allContours['Door_Frame'].filter(c => c.every(p => p.x >= -10 && p.x <= 200 && p.y >= -10 && p.y <= 200))[0];
  const mainFrm = allContours['Main_Frame'].filter(c => c.every(p => p.x >= -10 && p.x <= 200 && p.y >= -10 && p.y <= 200))[0];
  const misplacedGsk = allContours['Door_GSK_INT'].filter(c => c.every(p => p.x < -100))[0];

  const dx = 8957.80;
  const dy = 21289.60;
  const translated = misplacedGsk.map(p => ({ x: p.x + dx, y: p.y + dy }));

  const viewW = 500;
  const viewH = 500;
  
  // Crop window: X=[2, 22], Y=[26, 44]
  const tx = (x) => (20 + ((x - 2) / 20) * 460);
  const ty = (y) => (480 - ((y - 26) / 18) * 460);

  const toPath = (pts) => {
    if (pts.length === 0) return '';
    return 'M ' + pts.map(p => `${tx(p.x)},${ty(p.y)}`).join(' L ') + ' Z';
  };

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${viewW} ${viewH}" width="${viewW}" height="${viewH}" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a; font-family: sans-serif;">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.5"/>
    </pattern>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#grid)" />

  <!-- Main Frame (Interior Rebate Part) -->
  <path d="${toPath(mainFrm)}" fill="#059669" fill-opacity="0.2" stroke="#059669" stroke-width="1.5" />
  <text x="${tx(16)}" y="${ty(28)}" fill="#059669" font-size="10">Main Frame INT</text>

  <!-- Sash Profile -->
  <path d="${toPath(doorFrm)}" fill="#2563eb" fill-opacity="0.2" stroke="#2563eb" stroke-width="2" />
  <text x="${tx(4)}" y="${ty(42)}" fill="#2563eb" font-size="11" font-weight="bold">Sash Profile (Door_Frame)</text>

  <!-- Pocket Zoom Outline -->
  <rect x="${tx(7.0)}" y="${ty(39.0)}" width="${tx(12.0) - tx(7.0)}" height="${ty(33.0) - ty(39.0)}" fill="none" stroke="#eab308" stroke-width="1" stroke-dasharray="3,3" />
  <text x="${tx(7.2)}" y="${ty(39.5)}" fill="#eab308" font-size="9">Groove pocket X:[7,12] Y:[33,39]</text>

  <!-- Aligned Gasket -->
  <path d="${toPath(translated)}" fill="#a21caf" fill-opacity="0.8" stroke="#ffffff" stroke-width="1.2" />
  <text x="${tx(13.8)}" y="${ty(35.5)}" fill="#ffffff" font-size="10" font-weight="bold">Door_GSK_INT</text>

  <text x="20" y="30" fill="#f8fafc" font-size="14" font-weight="bold">Door_GSK_INT Pocket Fit Zoom Preview</text>
  <text x="20" y="48" fill="#94a3b8" font-size="10">Translation: dx = 8957.80, dy = 21289.60</text>
</svg>
`;

  fs.writeFileSync("C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\ec14721d-ab09-4ccb-b6ad-69c7a7663648\\pocket_close_up.svg", svg);
  fs.writeFileSync("C:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\pocket_close_up.svg", svg);
  console.log("Saved close up SVG!");
}

main();
