import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

const INPUT_FILE = 'C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/IGLO5_FIXED/DXF/IGLO5_FIXED.dxf';
const OUT_FILE = 'c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/data/profiles/IGLO5/IG5_F1XXT.json';

const SNAP_TOLERANCE = 0.05; // mm
const ARC_SEGMENTS = 24;
const SIMPLIFY_TOLERANCE = 0.05; // mm

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function arcToPolylineRad(cx, cy, r, startRad, endRad, segments = ARC_SEGMENTS) {
  let s = startRad, e = endRad;
  if (e <= s) e += 2 * Math.PI;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = s + (e - s) * (i / segments);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function bulgeToArcPts(p1, p2, bulge, segments = ARC_SEGMENTS) {
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
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
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

function transformPoint(pt, tx) {
  let xs = pt.x * tx.scaleX, ys = pt.y * tx.scaleY;
  let xr = xs * Math.cos(tx.rotation) - ys * Math.sin(tx.rotation);
  let yr = xs * Math.sin(tx.rotation) + ys * Math.cos(tx.rotation);
  return { x: xr + tx.x, y: yr + tx.y };
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

function toSvgPath(points) {
  if (!points.length) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
}

function toThreeShapeCommands(points) {
  if (!points.length) return [];
  const cmds = [{ cmd: 'moveTo', x: points[0].x, y: points[0].y }];
  for (let i = 1; i < points.length; i++) cmds.push({ cmd: 'lineTo', x: points[i].x, y: points[i].y });
  return cmds;
}

async function main() {
  console.log(`\n📂 Reading: ${INPUT_FILE}`);
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  // Storage for extracted contours
  // Structure: layer -> Array of Array of points
  const rawContours = {
    FRM_EXT: [],
    FRM_INT: [],
    GSK_EXT: [],
    BZD: [],
    GSK_BZD: [],
    SPACER: [],
    GLS_EXT: [],
    GLS_INT: []
  };

  // Helper to process entities recursively from blocks
  function collectEntities(entities, tx, parentBlockName) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          const localRot = (ent.rotation || 0) * Math.PI / 180;
          const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
          const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;
          const posT = transformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
          const nextTx = {
            x: posT.x, y: posT.y,
            rotation: tx.rotation + localRot,
            scaleX: tx.scaleX * localScaleX, scaleY: tx.scaleY * localScaleY
          };
          collectEntities(block.entities, nextTx, ent.name);
        }
      } else {
        // We look at the parent block name to classify where this geometry belongs
        if (parentBlockName === '50001 - rama 66mm') {
          // This is the frame profile!
          // We only care about the outer outline (Entity #0), which has 129 vertices in local coordinates.
          // The inner cavities (Entity #1 and #2) have fewer vertices and are ignored.
          if (ent.type === 'LWPOLYLINE' && ent.vertices.length > 20) {
            const localPts = ent.vertices.map(v => ({ x: v.x, y: v.y }));
            const worldPts = localPts.map(pt => transformPoint(pt, tx));
            
            // Slice the frame at X = -35.0 (the midpoint of the 70mm frame depth)
            // Left half (X <= -35.0) -> FRM_EXT
            // Right half (X >= -35.0) -> FRM_INT
            const splitX = -35.0;
            const ptsExt = clipPolygon(worldPts, splitX, true);
            const ptsInt = clipPolygon(worldPts, splitX, false);

            if (ptsExt.length > 2) rawContours.FRM_EXT.push(ptsExt);
            if (ptsInt.length > 2) rawContours.FRM_INT.push(ptsInt);
          }
        } else if (parentBlockName === 'U-001') {
          // This is the external frame gasket (GSK_EXT)
          if (ent.type === 'LWPOLYLINE' && ent.vertices.length > 2) {
            const localPts = [];
            const verts = ent.vertices;
            for (let i = 0; i < verts.length; i++) {
              const v = verts[i];
              localPts.push({ x: v.x, y: v.y });
              if (v.bulge !== undefined && v.bulge !== 0) {
                const next = verts[(i + 1) % verts.length];
                localPts.push(...bulgeToArcPts(v, next, v.bulge).slice(0, -1));
              }
            }
            const worldPts = localPts.map(pt => transformPoint(pt, tx));
            const closed = closeAndSnap(worldPts);
            if (closed.length > 2) rawContours.GSK_EXT.push(closed);
          }
        } else if (parentBlockName === '50924 - listwa 22mm') {
          // This is the glazing bead (BZD). We only extract the outer outline (Entity #0 with 41 vertices).
          if (ent.type === 'LWPOLYLINE' && ent.vertices.length > 20) {
            const localPts = ent.vertices.map(v => ({ x: v.x, y: v.y }));
            const worldPts = localPts.map(pt => transformPoint(pt, tx));
            const closed = closeAndSnap(worldPts);
            if (closed.length > 2) rawContours.BZD.push(closed);
          }
        } else if (parentBlockName === 'U- listwy przyszybowej') {
          // This is the bead gasket (GSK_BZD)
          if (ent.type === 'LWPOLYLINE' && ent.vertices.length > 2) {
            const localPts = [];
            const verts = ent.vertices;
            for (let i = 0; i < verts.length; i++) {
              const v = verts[i];
              localPts.push({ x: v.x, y: v.y });
              if (v.bulge !== undefined && v.bulge !== 0) {
                const next = verts[(i + 1) % verts.length];
                localPts.push(...bulgeToArcPts(v, next, v.bulge).slice(0, -1));
              }
            }
            const worldPts = localPts.map(pt => transformPoint(pt, tx));
            const closed = closeAndSnap(worldPts);
            if (closed.length > 2) rawContours.GSK_BZD.push(closed);
          }
        } else if (parentBlockName === 'szyba 24mm') {
          // Spacer and Glass
          if (ent.type === 'LWPOLYLINE') {
            // Spacer bar (Entity #3 with 4 vertices)
            const localPts = ent.vertices.map(v => ({ x: v.x, y: v.y }));
            const worldPts = localPts.map(pt => transformPoint(pt, tx));
            const closed = closeAndSnap(worldPts);
            if (closed.length > 2) rawContours.SPACER.push(closed);
          } else if (ent.type === 'LINE') {
            // Glass panes are drawn as lines inside the CAD block.
            // Local X <= 16 -> GLS_EXT
            // Local X > 16  -> GLS_INT
            // We ignore horizontal helper lines (their local X spans across, meaning start.x != end.x)
            if (Math.abs(ent.vertices[0].x - ent.vertices[1].x) < 0.1) {
              const localX = ent.vertices[0].x;
              const y1 = ent.vertices[0].y;
              const y2 = ent.vertices[1].y;
              const minY = Math.min(y1, y2);
              const maxY = Math.max(y1, y2);

              const p1 = transformPoint({ x: localX, y: minY }, tx);
              const p2 = transformPoint({ x: localX, y: maxY }, tx);

              if (localX <= 16) {
                if (!rawContours._glsExtLines) rawContours._glsExtLines = [];
                rawContours._glsExtLines.push({ p1, p2 });
              } else {
                if (!rawContours._glsIntLines) rawContours._glsIntLines = [];
                rawContours._glsIntLines.push({ p1, p2 });
              }
            }
          }
        }
      }
    });
  }

  // 1. Traverse entities
  collectEntities(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }, null);

  // 2. Re-construct closed glass pane contours from the collected vertical lines
  function buildGlassPane(lines) {
    if (!lines || lines.length < 2) return null;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    lines.forEach(l => {
      minX = Math.min(minX, l.p1.x, l.p2.x);
      maxX = Math.max(maxX, l.p1.x, l.p2.x);
      minY = Math.min(minY, l.p1.y, l.p2.y);
      maxY = Math.max(maxY, l.p1.y, l.p2.y);
    });
    // Return closed bounding rectangle
    return [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY }
    ];
  }

  const glsExtPane = buildGlassPane(rawContours._glsExtLines);
  if (glsExtPane) rawContours.GLS_EXT.push(glsExtPane);

  const glsIntPane = buildGlassPane(rawContours._glsIntLines);
  if (glsIntPane) rawContours.GLS_INT.push(glsIntPane);

  // Clean up temporary arrays
  delete rawContours._glsExtLines;
  delete rawContours._glsIntLines;

  // 3. Compute global bounding box across all extracted layers
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

  console.log(`📐 Extracted Global Bounds:`);
  console.log(`   X: ${minX.toFixed(4)} → ${maxX.toFixed(4)} mm (width: ${(maxX - minX).toFixed(4)} mm)`);
  console.log(`   Y: ${minY.toFixed(4)} → ${maxY.toFixed(4)} mm (height: ${(maxY - minY).toFixed(4)} mm)`);

  // 4. Normalise coordinates (shift to origin (0, 0)) and simplify
  const normalisedLayers = {};
  Object.entries(rawContours).forEach(([layerName, contours]) => {
    normalisedLayers[layerName] = {
      group: layerName.startsWith('GSK') ? 'gasket' :
             layerName.startsWith('GLS') ? 'glass' :
             layerName === 'SPACER' ? 'spacer' :
             layerName.startsWith('BZD') ? 'sash' : 'frame',
      contours: contours.map((c, idx) => {
        const normPts = c.map(p => ({
          x: parseFloat((p.x - minX).toFixed(6)),
          y: parseFloat((p.y - minY).toFixed(6))
        }));
        
        // Simplify vertices
        const simplified = simplifyContour(normPts, SIMPLIFY_TOLERANCE);
        const firstPt = simplified[0];
        const lastPt = simplified[simplified.length - 1];
        const residGap = dist(firstPt, lastPt);
        const verified = residGap < SNAP_TOLERANCE;

        return {
          id: `${layerName}_${idx}`,
          source: 'DXF_BLOCK',
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

  // 5. Build output JSON payload
  const output = {
    system: 'IGLO_5',
    type: 'F1XXT',
    source: path.basename(INPUT_FILE),
    generated: new Date().toISOString(),
    meta: {
      bounds: {
        raw: { minX, minY, maxX, maxY },
        normalised: { minX: 0, minY: 0, maxX: parseFloat((maxX - minX).toFixed(4)), maxY: parseFloat((maxY - minY).toFixed(4)) },
        width: maxX - minX,
        height: maxY - minY,
        unit: 'mm'
      },
      extrusion: { axis: 'Z', referenceLength: 1000, unit: 'mm' }
    },
    layers: normalisedLayers
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Output saved to: ${OUT_FILE}`);

  // 6. Layer Summary
  console.log('\n📊 Layer summary:');
  for (const [layer, data] of Object.entries(output.layers)) {
    const cList = data.contours.map(c => `${c.pointCount}pts`).join(' | ');
    console.log(`   ${layer.padEnd(14)} [${(data.group||'?').padEnd(6)}]  ${cList}`);
  }
}

main().catch(err => { console.error('❌', err); process.exit(1); });
