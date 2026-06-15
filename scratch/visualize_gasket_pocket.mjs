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
  const misplacedGsk = allContours['Door_GSK_INT'].filter(c => c.every(p => p.x < -100))[0];

  // Let's generate an SVG focusing on X: [0, 30], Y: [25, 45]
  const viewW = 400;
  const viewH = 400;
  
  // Transform coordinates for drawing:
  // X: 0 to 30 -> 20 to 380
  // Y: 25 to 45 -> 380 to 20
  const tx = (x) => (20 + ((x - 0) / 30) * 360);
  const ty = (y) => (380 - ((y - 25) / 20) * 360);

  const toPath = (pts) => {
    if (pts.length === 0) return '';
    return 'M ' + pts.map(p => `${tx(p.x)},${ty(p.y)}`).join(' L ') + ' Z';
  };

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${viewW} ${viewH}" width="${viewW}" height="${viewH}" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;">
  <!-- Grid -->
  <line x1="${tx(0)}" y1="${ty(25)}" x2="${tx(30)}" y2="${ty(25)}" stroke="#1e293b" />
  <line x1="${tx(0)}" y1="${ty(45)}" x2="${tx(30)}" y2="${ty(45)}" stroke="#1e293b" />
  
  <!-- Sash Profile -->
  <path d="${toPath(doorFrm)}" fill="#2563eb" fill-opacity="0.2" stroke="#2563eb" stroke-width="2" />
`;

  // Let's test a few different offsets for the gasket:
  // Option A (our current wrong one): dx = 8962.85, dy = 21300.10
  // Option B: dx = 8956.76, dy = 21292.97 (pocket center)
  // Option C: dx = 8956.10, dy = 21292.80
  // Option D: dx = 8955.50, dy = 21293.20
  
  const options = [
    { dx: 8962.85, dy: 21300.10, color: "#ef4444", name: "Current (wrong)" },
    { dx: 8956.76, dy: 21292.97, color: "#10b981", name: "Candidate B" },
    { dx: 8956.10, dy: 21292.80, color: "#eab308", name: "Candidate C" },
    { dx: 8955.50, dy: 21293.20, color: "#ec4899", name: "Candidate D" }
  ];

  options.forEach(opt => {
    const translated = misplacedGsk.map(p => ({ x: p.x + opt.dx, y: p.y + opt.dy }));
    svg += `  <!-- ${opt.name} -->\n`;
    svg += `  <path d="${toPath(translated)}" fill="none" stroke="${opt.color}" stroke-width="1.5" />\n`;
    // label
    let gskX = 0, gskY = 0;
    translated.forEach(p => { gskX += p.x; gskY += p.y; });
    gskX /= translated.length; gskY /= translated.length;
    svg += `  <text x="${tx(gskX)}" y="${ty(gskY)}" fill="${opt.color}" font-size="10" text-anchor="middle">${opt.name}</text>\n`;
  });

  svg += `</svg>\n`;
  fs.writeFileSync("C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\ec14721d-ab09-4ccb-b6ad-69c7a7663648\\gasket_pocket_test.svg", svg);
  console.log("Saved test SVG!");
}

main();
