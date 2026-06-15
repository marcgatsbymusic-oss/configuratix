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

// Ray-casting algorithm for polygon containment check
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

try {
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

  // Extract all contours in the DXF file (no bounds filter)
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

  // Active sash and frame profiles
  const doorFrm = allContours['Door_Frame'].filter(c => c.every(p => p.x >= -10 && p.x <= 200 && p.y >= -10 && p.y <= 200))[0];
  const mainFrm = allContours['Main_Frame'].filter(c => c.every(p => p.x >= -10 && p.x <= 200 && p.y >= -10 && p.y <= 200))[0];

  // The misplaced gasket
  const misplacedGsk = allContours['Door_GSK_INT'].filter(c => c.every(p => p.x < -100))[0];

  if (!doorFrm || !misplacedGsk) {
    console.log("Could not find door frame or misplaced gasket!");
    process.exit(1);
  }

  // Calculate center of misplaced gasket
  let gskX = 0, gskY = 0;
  misplacedGsk.forEach(p => { gskX += p.x; gskY += p.y; });
  gskX /= misplacedGsk.length;
  gskY /= misplacedGsk.length;

  console.log(`Misplaced gasket center: (${gskX.toFixed(2)}, ${gskY.toFixed(2)})`);

  // Let's search in the grid [X: -200 to 200, Y: -200 to 200] relative to the Door_Frame (sash)
  // to find where the gasket fits nicely on the sash boundary
  // Sash bounds
  let sashMinX = Infinity, sashMaxX = -Infinity, sashMinY = Infinity, sashMaxY = -Infinity;
  doorFrm.forEach(p => {
    if (p.x < sashMinX) sashMinX = p.x; if (p.x > sashMaxX) sashMaxX = p.x;
    if (p.y < sashMinY) sashMinY = p.y; if (p.y > sashMaxY) sashMaxY = p.y;
  });

  console.log(`Sash Bounds: X=[${sashMinX.toFixed(2)}, ${sashMaxX.toFixed(2)}], Y=[${sashMinY.toFixed(2)}, ${sashMaxY.toFixed(2)}]`);

  // Test translations
  let bestTx = null, bestTy = null;
  let minOverlapCount = Infinity;
  let bestFitsSashRebate = false;

  // Let's define the rebate search grid:
  // Since the gasket is in world coordinates around X=-9000, Y=-21000,
  // we want to find a translation delta (dx, dy) to add to the gasket.
  // The translated gasket point will be: pt.x + dx, pt.y + dy.
  // We want the translated gasket center (gskX + dx, gskY + dy) to lie in the active region,
  // and specifically it should touch the interior sash rebate, which is near X = [5, 20], Y = [30, 60] (or similar).
  
  // Let's do a sweep of dx, dy:
  const targetXMin = sashMinX - 10;
  const targetXMax = sashMaxX + 10;
  const targetYMin = sashMinY - 10;
  const targetYMax = sashMaxY + 10;

  console.log("Searching for optimal placement...");

  // Let's check: in the original CAD drawings, what is the exact relative distance between block inserts?
  // Let's look at the CAD file's offset:
  // The Door_Frame insert local pos inside 40011+240002 is (-5773.69, -2824.37).
  // The Door_GSK_INT insert local pos inside same block is (4609.04, -10627.03)?
  // Wait! No, Door_GSK_INT is nested under EDGE_SL_1 directly, at local pos (4609.04, -10627.03).
  // While 40011+240002 is at local pos (82.30, 85.92) under EDGE_SL_1.
  // Wait!
  // If the designer copied the gasket from a vertical head section:
  // In a typical Drutex vertical section:
  // The head section is shifted vertically by the sash height (e.g. Y = 1000mm or Y = 2000mm).
  // And the threshold section is shifted vertically by Y = -1000mm or Y = -2000mm.
  // And X is shifted because of the sliding track.
  // Let's see: if we look at the difference in X:
  // - Gasket world X: -8972
  // - Sash world X: 41
  // - Difference: ~9013 mm
  // If the threshold is 9 meters away?
  // Yes! The drawing contains details spaced 9000 mm apart!
  // So the translation delta in X is exactly 9000 mm! Or 9062.5 mm?
  // Let's sweep dx around 9000 to 9100, and dy around 21200 to 21400!
  
  const step = 0.5;
  let foundMatch = false;

  for (let dx = 8990; dx <= 9110; dx += step) {
    for (let dy = 21250; dy <= 21390; dy += step) {
      // Translate gasket center
      const tx = gskX + dx;
      const ty = gskY + dy;

      // Translate gasket corners
      const translatedGsk = misplacedGsk.map(p => ({ x: p.x + dx, y: p.y + dy }));

      // Check containment: we want the gasket to NOT overlap with the interior of the sash
      // But it should touch it (i.e. be very close, within 1mm).
      // Also it should not overlap with the main frame.
      
      // Let's count how many points of the gasket lie inside the sash polygon
      let insideSash = 0;
      translatedGsk.forEach(p => {
        if (isPointInPolygon(p, doorFrm)) insideSash++;
      });

      // Let's count how many points lie inside the main frame polygon
      let insideFrame = 0;
      translatedGsk.forEach(p => {
        if (isPointInPolygon(p, mainFrm)) insideFrame++;
      });

      if (insideSash === 0 && insideFrame === 0) {
        // Gasket is outside sash and frame.
        // Check if it is touching the sash rebate.
        // Let's find the minimum distance from gasket to sash
        let minD = Infinity;
        translatedGsk.forEach(gp => {
          doorFrm.forEach(sp => {
            const d = dist(gp, sp);
            if (d < minD) minD = d;
          });
        });

        // Gasket touches sash if minD < 1mm
        if (minD < 1.0) {
          // Check if it is in the interior rebate zone:
          // The interior rebate zone of the sash is on the left (lower X, e.g. X < 20) and bottom (lower Y, e.g. Y < 70)
          if (tx > sashMinX - 5 && tx < sashMinX + 25 && ty > sashMinY - 5 && ty < sashMinY + 45) {
            console.log(`Found candidate placement: dx=${dx.toFixed(2)}, dy=${dy.toFixed(2)} -> center=(${tx.toFixed(2)}, ${ty.toFixed(2)}) minD=${minD.toFixed(3)}`);
            foundMatch = true;
          }
        }
      }
    }
  }

} catch (err) {
  console.error(err);
}
