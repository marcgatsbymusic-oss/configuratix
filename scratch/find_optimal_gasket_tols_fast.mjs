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

function isPointInPolygon(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > pt.y) !== (yj > pt.y))
        && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
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

  if (!doorFrm || !misplacedGsk) {
    console.log("Could not find door frame or misplaced gasket contour!");
    return;
  }

  // Calculate center of misplaced gasket
  let gskX = 0, gskY = 0;
  misplacedGsk.forEach(p => { gskX += p.x; gskY += p.y; });
  gskX /= misplacedGsk.length;
  gskY /= misplacedGsk.length;

  console.log(`Misplaced gasket center: (${gskX.toFixed(2)}, ${gskY.toFixed(2)})`);

  let sashMinX = Infinity, sashMaxX = -Infinity, sashMinY = Infinity, sashMaxY = -Infinity;
  doorFrm.forEach(p => {
    if (p.x < sashMinX) sashMinX = p.x; if (p.x > sashMaxX) sashMaxX = p.x;
    if (p.y < sashMinY) sashMinY = p.y; if (p.y > sashMaxY) sashMaxY = p.y;
  });
  console.log(`Sash Bounds: X=[${sashMinX.toFixed(2)}, ${sashMaxX.toFixed(2)}], Y=[${sashMinY.toFixed(2)}, ${sashMaxY.toFixed(2)}]`);

  // Two-pass sweep:
  // Pass 1: Coarse search
  console.log("Running coarse search...");
  const coarseStep = 2.0;
  const candidates = [];
  for (let dx = 8990; dx <= 9110; dx += coarseStep) {
    for (let dy = 21250; dy <= 21390; dy += coarseStep) {
      const tx = gskX + dx;
      const ty = gskY + dy;
      
      const translatedGsk = misplacedGsk.map(p => ({ x: p.x + dx, y: p.y + dy }));
      
      let insideSash = 0;
      translatedGsk.forEach(p => {
        if (isPointInPolygon(p, doorFrm)) insideSash++;
      });
      let insideFrame = 0;
      translatedGsk.forEach(p => {
        if (isPointInPolygon(p, mainFrm)) insideFrame++;
      });
      
      if (insideSash === 0 && insideFrame === 0) {
        let minD = Infinity;
        translatedGsk.forEach(gp => {
          doorFrm.forEach(sp => {
            const d = dist(gp, sp);
            if (d < minD) minD = d;
          });
        });
        
        if (minD < 5.0) { // fairly close
          if (tx > sashMinX - 5 && tx < sashMinX + 25 && ty > sashMinY - 5 && ty < sashMinY + 45) {
            candidates.push({ dx, dy, minD });
          }
        }
      }
    }
  }

  console.log(`Found ${candidates.length} coarse candidates.`);
  if (candidates.length === 0) {
    console.log("No coarse candidates found.");
    return;
  }

  // Pass 2: Fine search around the best candidate
  candidates.sort((a, b) => a.minD - b.minD);
  const bestCoarse = candidates[0];
  console.log(`Best coarse candidate: dx=${bestCoarse.dx}, dy=${bestCoarse.dy}, minD=${bestCoarse.minD}`);

  console.log("Running fine search...");
  const fineStep = 0.1;
  const fineCandidates = [];
  for (let dx = bestCoarse.dx - 4.0; dx <= bestCoarse.dx + 4.0; dx += fineStep) {
    for (let dy = bestCoarse.dy - 4.0; dy <= bestCoarse.dy + 4.0; dy += fineStep) {
      const tx = gskX + dx;
      const ty = gskY + dy;
      const translatedGsk = misplacedGsk.map(p => ({ x: p.x + dx, y: p.y + dy }));
      
      let insideSash = 0;
      translatedGsk.forEach(p => {
        if (isPointInPolygon(p, doorFrm)) insideSash++;
      });
      let insideFrame = 0;
      translatedGsk.forEach(p => {
        if (isPointInPolygon(p, mainFrm)) insideFrame++;
      });
      
      if (insideSash === 0 && insideFrame === 0) {
        let minD = Infinity;
        translatedGsk.forEach(gp => {
          doorFrm.forEach(sp => {
            const d = dist(gp, sp);
            if (d < minD) minD = d;
          });
        });
        
        if (minD < 0.1) { // very close contact
          fineCandidates.push({ dx, dy, minD, tx, ty });
        }
      }
    }
  }

  console.log(`Found ${fineCandidates.length} fine candidates.`);
  fineCandidates.sort((a, b) => a.minD - b.minD);
  if (fineCandidates.length > 0) {
    const best = fineCandidates[0];
    console.log("=== OPTIMAL TRANSLATION FOUND ===");
    console.log(`dx = ${best.dx.toFixed(4)}`);
    console.log(`dy = ${best.dy.toFixed(4)}`);
    console.log(`Gasket World Center: (${best.tx.toFixed(4)}, ${best.ty.toFixed(4)})`);
    console.log(`Minimum Distance to Sash: ${best.minD.toFixed(5)} mm`);
  } else {
    // print some next-best candidates
    console.log("No fine candidates with minD < 0.1mm found. Listing top close candidates:");
    // rerun with relaxed minD
    const list = [];
    for (let dx = bestCoarse.dx - 4.0; dx <= bestCoarse.dx + 4.0; dx += fineStep) {
      for (let dy = bestCoarse.dy - 4.0; dy <= bestCoarse.dy + 4.0; dy += fineStep) {
        const tx = gskX + dx;
        const ty = gskY + dy;
        const translatedGsk = misplacedGsk.map(p => ({ x: p.x + dx, y: p.y + dy }));
        let insideSash = 0;
        translatedGsk.forEach(p => { if (isPointInPolygon(p, doorFrm)) insideSash++; });
        let insideFrame = 0;
        translatedGsk.forEach(p => { if (isPointInPolygon(p, mainFrm)) insideFrame++; });
        if (insideSash === 0 && insideFrame === 0) {
          let minD = Infinity;
          translatedGsk.forEach(gp => {
            doorFrm.forEach(sp => {
              const d = dist(gp, sp);
              if (d < minD) minD = d;
            });
          });
          list.push({ dx, dy, minD, tx, ty });
        }
      }
    }
    list.sort((a, b) => a.minD - b.minD);
    list.slice(0, 5).forEach(c => {
      console.log(`dx=${c.dx.toFixed(2)}, dy=${c.dy.toFixed(2)} -> center=(${c.tx.toFixed(2)}, ${c.ty.toFixed(2)}) minD=${c.minD.toFixed(3)}`);
    });
  }
}

main();
