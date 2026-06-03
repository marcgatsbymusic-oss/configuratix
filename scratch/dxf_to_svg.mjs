/**
 * dxf_to_svg.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * DXF to SVG Profile Converter (with Recursive Block Resolution & Transforms)
 * Extracts profiles from architectural DXFs and saves them as colored, vector SVGs.
 *
 * Usage:
 *   node scratch/dxf_to_svg.mjs <input.dxf> [--out output.svg]
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

// ─── Constants ───────────────────────────────────────────────────────────────
const SNAP_TOLERANCE   = 0.05;  // mm
const ARC_SEGMENTS     = 24;    // subdivisions per arc
const SIMPLIFY_TOLERANCE = 0.05; // mm

// Color mapping for professional visual styling of layers
const COLORS = {
  // Glass and glass accessories (harmonic blues/teals)
  'GLS_EXT': { fill: 'rgba(92, 172, 238, 0.45)', stroke: '#3a95e6' },
  'GLS_INT': { fill: 'rgba(92, 172, 238, 0.45)', stroke: '#3a95e6' },
  'GLS_MDL': { fill: 'rgba(92, 172, 238, 0.3)', stroke: '#3a95e6' },
  'Spacer': { fill: '#404044', stroke: '#1d1d20' },
  'GSK_EXT_DOOR_GLS': { fill: '#141416', stroke: '#000000' },
  'BZD': { fill: '#37373f', stroke: '#141417' }, // Glazing bead
  'GSK_BZD': { fill: '#111111', stroke: '#000000' },

  // Frame and sashes (sleek dark greys)
  'DOOR_FRM_EXT': { fill: '#222226', stroke: '#0a0a0c' },
  'DOOR_FRM_INT': { fill: '#29292e', stroke: '#0a0a0c' },
  'BottomTop_EXT': { fill: '#45454e', stroke: '#1f1f24' },
  'BottomTop_INT': { fill: '#4e4e57', stroke: '#1f1f24' },
  'Profile cover exterior': { fill: '#2f2f35', stroke: '#0e0e11' },

  // Gaskets and seals (jet blacks)
  'GSK_SEAL_DOOR': { fill: '#151517', stroke: '#000000' },
  'GSK_LARGE_UNDERNEATH_DOOR': { fill: '#121214', stroke: '#000000' },
  'GSK_HIDDEN_PIECE_EXT': { fill: '#0a0a0c', stroke: '#000000' },

  // Rails and reinforcement (metallics)
  'Aluminium Rail': { fill: '#ececf2', stroke: '#8c8cb5' },
  'Profil stal': { fill: '#b8b8c5', stroke: '#52525c' },

  // Hidden and support elements (warm wood/bronze contrast highlights)
  'External hidden support piece': { fill: '#b3820a', stroke: '#5c4300' },
  'Hidden Piece': { fill: '#c67d35', stroke: '#613c16' }
};

const DEFAULT_COLOR = { fill: 'rgba(150, 150, 150, 0.25)', stroke: '#777777' };

// ─── Geometry helper functions ────────────────────────────────────────────────

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function arcToPolylineRad(cx, cy, r, startRad, endRad, segments = ARC_SEGMENTS) {
  let s = startRad;
  let e = endRad;
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
  const mx    = (p1.x + p2.x) / 2;
  const my    = (p1.y + p2.y) / 2;
  const dx    = p2.x - p1.x;
  const dy    = p2.y - p1.y;
  const len   = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return [];
  const px    = -dy / len;
  const py    =  dx / len;
  const s     = Math.sqrt(Math.max(0, r * r - d * d));
  const sign  = bulge > 0 ? 1 : -1;
  const cx    = mx + sign * s * px;
  const cy    = my + sign * s * py;

  let startA = Math.atan2(p1.y - cy, p1.x - cx);
  let endA   = Math.atan2(p2.y - cy, p2.x - cx);
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

// ─── Douglas-Peucker Simplification ──────────────────────────────────────────

function perpendicularDistance(point, lineStart, lineEnd) {
  let dx = lineEnd.x - lineStart.x;
  let dy = lineEnd.y - lineStart.y;
  const mag = Math.hypot(dx, dy);
  if (mag > 0.0) { dx /= mag; dy /= mag; }
  const pvx = point.x - lineStart.x;
  const pvy = point.y - lineStart.y;
  const pvdot = dx * pvx + dy * pvy;
  const rx = pvx - pvdot * dx;
  const ry = pvy - pvdot * dy;
  return Math.hypot(rx, ry);
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
    const rec1 = simplifyDouglasPeucker(points.slice(0, index + 1), epsilon);
    const rec2 = simplifyDouglasPeucker(points.slice(index), epsilon);
    return rec1.slice(0, -1).concat(rec2);
  } else {
    return [points[0], points[end]];
  }
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

// ─── Segment chaining ─────────────────────────────────────────────────────────

function angleBetween(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (mag1 === 0 || mag2 === 0) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.acos(cosTheta);
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
      let bestIdx = -1;
      let bestIsRev = false;
      let bestDist = Infinity;
      let bestAngleDiff = Infinity;

      for (let i = 0; i < unused.length; i++) {
        const s = unused[i];
        
        let d = dist(chainEnd, s.start);
        if (d <= tol) {
          let nextDir = { x: s.end.x - s.start.x, y: s.end.y - s.start.y };
          let aDiff = angleBetween(currentDir, nextDir);
          if (d < bestDist - 0.001 || (Math.abs(d - bestDist) <= 0.001 && aDiff < bestAngleDiff)) {
              bestDist = d;
              bestAngleDiff = aDiff;
              bestIdx = i;
              bestIsRev = false;
          }
        }
        
        const rev = { start: s.end, end: s.start, pts: [...s.pts].reverse() };
        d = dist(chainEnd, rev.start);
        if (d <= tol) {
          let nextDir = { x: rev.end.x - rev.start.x, y: rev.end.y - rev.start.y };
          let aDiff = angleBetween(currentDir, nextDir);
          if (d < bestDist - 0.001 || (Math.abs(d - bestDist) <= 0.001 && aDiff < bestAngleDiff)) {
              bestDist = d;
              bestAngleDiff = aDiff;
              bestIdx = i;
              bestIsRev = true;
          }
        }
      }

      if (bestIdx !== -1) {
          const s = unused.splice(bestIdx, 1)[0];
          const pts = bestIsRev ? [...s.pts].reverse() : s.pts;
          chain.push(...pts.slice(1));
          chainEnd = pts[pts.length - 1];
          const beforeLast = pts[pts.length - 2];
          currentDir = { x: chainEnd.x - beforeLast.x, y: chainEnd.y - beforeLast.y };
          changed = true;
      }
    }
    chains.push(chain);
  }
  return chains;
}

function closeAndSnap(pts, tol = SNAP_TOLERANCE) {
  if (pts.length < 2) return pts;
  const first = pts[0];
  const last  = pts[pts.length - 1];
  const gap   = dist(first, last);

  if (gap === 0 || gap <= tol) {
    pts.pop();
  }
  return pts;
}

// ─── Transforms ──────────────────────────────────────────────────────────────

function transformPoint(pt, tx) {
  let xs = pt.x * tx.scaleX;
  let ys = pt.y * tx.scaleY;
  let xr = xs * Math.cos(tx.rotation) - ys * Math.sin(tx.rotation);
  let yr = xs * Math.sin(tx.rotation) + ys * Math.cos(tx.rotation);
  return {
    x: xr + tx.x,
    y: yr + tx.y
  };
}

// ─── Main Program ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const inFile = args[0];
  let outFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' && args[i + 1]) { outFile = args[++i]; }
  }

  if (!inFile) {
    console.error('Usage: node dxf_to_svg.mjs <input.dxf> [--out output.svg]');
    process.exit(1);
  }

  console.log(`\n📂 Reading: ${inFile}`);
  const text = fs.readFileSync(inFile, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  const layerSegments = {};
  const foundLayers = new Set();

  // Recursive parser to traverse nested block structures
  function processEntities(entities, tx) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          const localRot = (ent.rotation || 0) * Math.PI / 180;
          const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
          const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;

          const posTransformed = transformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
          const nextTx = {
            x: posTransformed.x,
            y: posTransformed.y,
            rotation: tx.rotation + localRot,
            scaleX: tx.scaleX * localScaleX,
            scaleY: tx.scaleY * localScaleY
          };
          processEntities(block.entities, nextTx);
        }
      } else {
        const layer = ent.layer;
        if (!layer) return;

        foundLayers.add(layer);
        if (!layerSegments[layer]) layerSegments[layer] = [];

        if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
          const localPts = [];
          const verts = ent.vertices;
          if (!verts || verts.length === 0) return;
          const isClosed = (ent.shape || (ent.flag & 1) !== 0);

          for (let i = 0; i < verts.length; i++) {
            const v = verts[i];
            localPts.push({ x: v.x, y: v.y });
            if (v.bulge !== undefined && v.bulge !== 0 && (i < verts.length - 1 || isClosed)) {
              const next = verts[(i + 1) % verts.length];
              const arc = bulgeToArcPts(v, next, v.bulge);
              localPts.push(...arc.slice(0, -1));
            }
          }

          const worldPts = localPts.map(pt => transformPoint(pt, tx));
          for (let i = 0; i < worldPts.length - 1; i++) {
            const s = worldPts[i];
            const e = worldPts[i + 1];
            layerSegments[layer].push({ start: s, end: e, pts: [s, e] });
          }
          if (isClosed && worldPts.length > 2) {
            const s = worldPts[worldPts.length - 1];
            const e = worldPts[0];
            layerSegments[layer].push({ start: s, end: e, pts: [s, e] });
          }

        } else if (ent.type === 'LINE') {
          if (!ent.vertices || ent.vertices.length < 2) return;
          const sWorld = transformPoint(ent.vertices[0], tx);
          const eWorld = transformPoint(ent.vertices[1], tx);
          layerSegments[layer].push({ start: sWorld, end: eWorld, pts: [sWorld, eWorld] });

        } else if (ent.type === 'ARC') {
          const localPts = arcToPolylineRad(ent.center.x, ent.center.y, ent.radius, ent.startAngle, ent.endAngle);
          const worldPts = localPts.map(pt => transformPoint(pt, tx));
          for (let i = 0; i < worldPts.length - 1; i++) {
            const s = worldPts[i];
            const e = worldPts[i + 1];
            layerSegments[layer].push({ start: s, end: e, pts: [s, e] });
          }
        }
      }
    });
  }

  // Identity root transform
  processEntities(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

  // Filter out empty layers
  const activeLayers = Object.keys(layerSegments).filter(l => layerSegments[l].length > 0);
  console.log(`   Found ${activeLayers.length} active layers with geometry.`);

  // Stitch and simplify contours
  const rawLayerContours = {};
  for (const layer of activeLayers) {
    const segments = layerSegments[layer];
    const chains = chainSegments(segments, 1.5);
    const closedContours = [];

    for (const chain of chains) {
      const pts = closeAndSnap(chain, SNAP_TOLERANCE);
      if (pts.length > 2) {
        const simplified = simplifyContour(pts, SIMPLIFY_TOLERANCE);
        if (simplified.length > 2) {
          closedContours.push(simplified);
        }
      }
    }

    if (closedContours.length > 0) {
      rawLayerContours[layer] = closedContours;
    }
  }

  // Calculate World Bounding Box
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const contours of Object.values(rawLayerContours)) {
    for (const c of contours) {
      for (const p of c) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }
  }

  if (minX === Infinity) {
    console.error("❌ Error: No geometry could be stitched into valid contours.");
    process.exit(1);
  }

  const width = parseFloat((maxX - minX).toFixed(4));
  const height = parseFloat((maxY - minY).toFixed(4));
  console.log(`   Dimension: ${width} mm x ${height} mm`);

  // Build SVG Content
  let svgContent = `<svg viewBox="0 0 ${width} ${height}" width="${width * 4}" height="${height * 4}" xmlns="http://www.w3.org/2000/svg" style="background:#181822; padding: 20px; border-radius: 12px; border: 1px solid #2d2d3d;">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#252538" stroke-width="0.5"/>
    </pattern>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <g id="geometry">
`;

  // Write layers as paths
  Object.entries(rawLayerContours).forEach(([layer, contours]) => {
    // Find matching styling colors (case-insensitive)
    const styleKey = Object.keys(COLORS).find(k => k.toUpperCase() === layer.toUpperCase()) || layer;
    const cStyle = COLORS[styleKey] || DEFAULT_COLOR;

    svgContent += `    <!-- Layer: ${layer} -->\n`;
    contours.forEach((c, idx) => {
      // Flip CAD Y coordinates so SVG renders upright
      const flipped = c.map(p => ({
        x: p.x - minX,
        y: height - (p.y - minY)
      }));

      const [first, ...rest] = flipped;
      let dPath = `M ${first.x.toFixed(3)} ${first.y.toFixed(3)}`;
      rest.forEach(p => {
        dPath += ` L ${p.x.toFixed(3)} ${p.y.toFixed(3)}`;
      });
      dPath += ' Z';

      svgContent += `    <path d="${dPath}" fill="${cStyle.fill}" stroke="${cStyle.stroke}" stroke-width="0.8" opacity="0.9" id="${layer}_${idx}" />\n`;
    });
  });

  svgContent += `  </g>\n</svg>`;

  const finalOut = outFile || inFile.replace(/\.dxf$/i, '.svg');
  fs.writeFileSync(finalOut, svgContent);
  console.log(`\n🎉 SVG generated successfully at: ${finalOut}\n`);
}

main().catch(err => {
  console.error("❌ Exception occurred:", err);
  process.exit(1);
});
