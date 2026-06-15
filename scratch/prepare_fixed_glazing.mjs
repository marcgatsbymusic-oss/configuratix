import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\Gaskets_GLS_SPACERS FOR_FIX_LEFT_BOTTOM_TOP.dxf";
const FRAME_JSON = "src/data/profiles/IgloEdge/IGLS_OPENING_DOOR_SECTION_AND_FRAME.json";
const JSON_OUT = "src/data/profiles/IgloEdge/Fixed_Glazing.json";
const SVG_OUT = "C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\ec14721d-ab09-4ccb-b6ad-69c7a7663648\\Fixed_Glazing_Preview.svg";
const SVG_WORKSPACE = "Fixed_Glazing_Preview.svg";

const SNAP_TOLERANCE = 0.5; // mm
const ARC_SEGMENTS = 16;
const SIMPLIFY_EPSILON = 0.05; // mm

// Affine 2D transformation matrix
class Matrix3 {
  constructor() {
    this.elements = [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  }
  static identity() { return new Matrix3(); }
  static translation(x, y) {
    const m = new Matrix3();
    m.elements[2] = x;
    m.elements[5] = y;
    return m;
  }
  static rotation(deg) {
    const rad = deg * Math.PI / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const m = new Matrix3();
    m.elements[0] = c;  m.elements[1] = -s;
    m.elements[3] = s;  m.elements[4] = c;
    return m;
  }
  static scaling(sx, sy) {
    const m = new Matrix3();
    m.elements[0] = sx;
    m.elements[4] = sy;
    return m;
  }
  multiply(other) {
    const a = this.elements;
    const b = other.elements;
    const out = new Matrix3();
    out.elements[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6];
    out.elements[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7];
    out.elements[2] = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];
    out.elements[3] = a[3] * b[0] + a[4] * b[3] + a[5] * b[6];
    out.elements[4] = a[3] * b[1] + a[4] * b[4] + a[5] * b[7];
    out.elements[5] = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];
    out.elements[6] = a[6] * b[0] + a[7] * b[3] + a[8] * b[6];
    out.elements[7] = a[6] * b[1] + a[7] * b[4] + a[8] * b[7];
    out.elements[8] = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];
    return out;
  }
  transformPoint(pt) {
    const e = this.elements;
    return {
      x: e[0] * pt.x + e[1] * pt.y + e[2],
      y: e[3] * pt.x + e[4] * pt.y + e[5]
    };
  }
}

function dist(p1, p2) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function arcToPolyline(center, r, startAngle, endAngle, tx, segments = ARC_SEGMENTS) {
  let s = startAngle;
  let e = endAngle;
  if (e <= s) e += 2 * Math.PI;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = s + (e - s) * (i / segments);
    pts.push(tx.transformPoint({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) }));
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
  const h     = Math.sqrt(Math.max(0, r * r - d * d));
  const sign  = bulge < 0 ? -1 : 1;
  const cx    = mx + sign * h * px, cy = my + sign * h * py;
  let startA  = Math.atan2(p1.y - cy, p1.x - cx);
  let endA    = Math.atan2(p2.y - cy, p2.x - cx);
  if (bulge < 0 && endA > startA) startA += 2 * Math.PI;
  if (bulge > 0 && startA > endA) endA += 2 * Math.PI;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = startA + (endA - startA) * t;
    pts.push(tx.transformPoint({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }));
  }
  return pts;
}

function chainSegments(segments, tol = SNAP_TOLERANCE) {
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
  if (gap === 0 || gap <= SNAP_TOLERANCE) pts.pop();
  return pts;
}

function getSignedArea(pts) {
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    area += (p1.x * p2.y) - (p2.x * p1.y);
  }
  return area / 2;
}

function enforceCounterClockwise(pts) {
  const area = getSignedArea(pts);
  if (area < 0) {
    return [...pts].reverse();
  }
  return pts;
}

// Douglas-Peucker Simplification
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
    return rec1.slice(0, rec1.length - 1).concat(rec2);
  }
  return [points[0], points[end]];
}

async function main() {
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
          
          const t = Matrix3.translation(ent.position ? (ent.position.x || 0) : 0, ent.position ? (ent.position.y || 0) : 0);
          const r = Matrix3.rotation(localRot);
          const s = Matrix3.scaling(localScaleX, localScaleY);
          const localMat = t.multiply(r).multiply(s);
          const nextTx = tx.multiply(localMat);
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

  collectEntities(dxf.entities, Matrix3.identity());

  // Define layers we want to keep and rename
  const keepLayersMap = {
    'GSK_EXT': 'Fix_GSK_EXT',
    'GSK_BZD': 'Fix_GSK_BZD',
    'BZD': 'Fix_BZD',
    'GLS_EXT': 'Fix_GLS_EXT',
    'GLS_MD': 'Fix_GLS_MD',
    'GLS_INT': 'Fix_GLS_INT',
    'SPACER': 'Fix_SPACER'
  };

  const activeContours = {};

  // Transformation rules:
  // x_target = y_source + 15.4857
  // y_target = x_source + 0.0224
  const transformAndRotate = (pt) => {
    return {
      x: pt.y + 15.4857,
      y: pt.x + 0.0224
    };
  };

  for (const [layerName, targetName] of Object.entries(keepLayersMap)) {
    const items = rawGeoms[layerName];
    if (!items) continue;

    const segments = [];
    items.forEach(({ entity, tx }) => {
      if (entity.type === 'LINE') {
        if (entity.vertices && entity.vertices.length >= 2) {
          const s = transformAndRotate(tx.transformPoint(entity.vertices[0]));
          const e = transformAndRotate(tx.transformPoint(entity.vertices[1]));
          segments.push({ start: s, end: e, pts: [s, e] });
        }
      } else if (entity.type === 'ARC') {
        const pts = arcToPolyline(entity.center, entity.radius, entity.startAngle, entity.endAngle, tx).map(transformAndRotate);
        segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
      } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
        const verts = entity.vertices;
        if (verts && verts.length > 0) {
          let pts = [];
          for (let i = 0; i < verts.length; i++) {
            pts.push(transformAndRotate(tx.transformPoint(verts[i])));
            if (verts[i].bulge !== undefined && verts[i].bulge !== 0 && i < verts.length - 1) {
              const bulgePts = bulgeToArcPts(verts[i], verts[i + 1], verts[i].bulge, tx).map(transformAndRotate);
              pts.push(...bulgePts);
            }
          }
          segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
        }
      }
    });

    const chains = chainSegments(segments);
    const simplifiedChains = chains.map(chain => {
      let closedPts = closeAndSnap(chain);
      closedPts = simplifyDouglasPeucker(closedPts, SIMPLIFY_EPSILON);
      return enforceCounterClockwise(closedPts);
    });

    activeContours[targetName] = simplifiedChains;
  }

  // --- BUILD payLoad JSON ---
  const normalizedContours = {};
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  // Since they need to align with Main_Frame, let's normalize them relative to commonOrigin!
  // Wait, let's load IGLS_OPENING_DOOR_SECTION_AND_FRAME.json to find its minX and minY so we normalize using the EXACT same origin!
  const frameData = JSON.parse(fs.readFileSync(FRAME_JSON, 'utf8'));
  
  // Find frame's minX and minY across all layers to match commonOrigin exactly
  let frameMinX = Infinity, frameMinY = Infinity;
  for (const layer of Object.values(frameData.layers)) {
    layer.contours.forEach(c => c.points.forEach(p => {
      if (p.x < frameMinX) frameMinX = p.x;
      if (p.y < frameMinY) frameMinY = p.y;
    }));
  }
  
  console.log(`Common frame origin to match: X = ${frameMinX}, Y = ${frameMinY}`);

  const toSvgPath = (pts) => {
    if (pts.length === 0) return '';
    return 'M ' + pts.map(p => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' L ') + ' Z';
  };

  const toThreeShapeCommands = (pts) => {
    if (pts.length === 0) return [];
    const cmds = [{ cmd: 'moveTo', x: pts[0].x, y: pts[0].y }];
    for (let i = 1; i < pts.length; i++) {
      cmds.push({ cmd: 'lineTo', x: pts[i].x, y: pts[i].y });
    }
    return cmds;
  };

  const layerData = {};
  for (const [targetName, contours] of Object.entries(activeContours)) {
    // We normalize the points relative to the frameMinX and frameMinY so they align perfectly with commonOrigin!
    // Wait, why did the original preprocessor normalize?
    // In prepare_iglo_edge_opening_door.mjs:
    // `p.x - minX`, where `minX` is the overall minX across all layers.
    // If we normalize relative to frameMinX, then in the JSON, the coordinates of Fixed_Glazing will be relative to frameMinX.
    // In IGLSideTestBuildViewer.tsx, commonOrigin is computed across all layers (including the new ones).
    // If we normalize them by subtracting frameMinX, they will align perfectly. Let's do that!
    const normalizedLayers = contours.map(pts => pts.map(p => ({
      x: parseFloat((p.x - frameMinX).toFixed(6)),
      y: parseFloat((p.y - frameMinY).toFixed(6))
    })));

    normalizedContours[targetName] = normalizedLayers;

    layerData[targetName] = {
      group: 'FRM', // Fixed glazing belongs to the frame group
      contours: normalizedLayers.map((pts, idx) => ({
        id: `${targetName}_${idx}`,
        source: "DXF_STITCHED",
        dxfClosed: true,
        closed: true,
        verified: true,
        residualGap: 0,
        pointCount: pts.length,
        svgPath: toSvgPath(pts),
        threeShape: toThreeShapeCommands(pts),
        points: pts
      }))
    };
  }

  const payload = {
    meta: {
      source: path.basename(INPUT_FILE),
      system: "IGLO_EDGE",
      type: "IGLS_FIXED_GLAZING",
      bounds: {
        raw: { minX: frameMinX, minY: frameMinY, maxX: 180.4619, maxY: 163.0598 }
      }
    },
    layers: layerData
  };

  fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
  fs.writeFileSync(JSON_OUT, JSON.stringify(payload, null, 2));
  console.log(`✅ Saved Fixed Glazing JSON to: ${JSON_OUT}`);

  // --- SVG VIEW PREVIEW ---
  // We will load the main frame layers from FRAME_JSON to display them in the SVG alongside the fixed glazing layers!
  const svgLayers = {};
  // Copy frame layers
  const frameLayersToDraw = ['Main_Frame_EXT', 'Main_Frame_INT', 'Main_GSK_CENTRAL'];
  frameLayersToDraw.forEach(l => {
    if (frameData.layers[l]) {
      // De-normalize back to absolute coordinates
      svgLayers[l] = frameData.layers[l].contours.map(c => c.points.map(p => ({
        x: p.x + frameMinX,
        y: p.y + frameMinY
      })));
    }
  });

  // Add fixed glazing layers
  for (const [targetName, contours] of Object.entries(activeContours)) {
    svgLayers[targetName] = contours;
  }

  // Find bounds for SVG
  let svgMinX = Infinity, svgMaxX = -Infinity, svgMinY = Infinity, svgMaxY = -Infinity;
  Object.values(svgLayers).forEach(contours => {
    contours.forEach(pts => pts.forEach(p => {
      if (p.x < svgMinX) svgMinX = p.x;
      if (p.x > svgMaxX) svgMaxX = p.x;
      if (p.y < svgMinY) svgMinY = p.y;
      if (p.y > svgMaxY) svgMaxY = p.y;
    }));
  });

  const width = svgMaxX - svgMinX;
  const height = svgMaxY - svgMinY;
  const SCALE = 6;
  const PAD = 20;
  const svgW = width * SCALE + PAD * 2;
  const svgH = height * SCALE + PAD * 2;

  const stx = (x) => ((x - svgMinX) * SCALE + PAD);
  const sty = (y) => (svgH - ((y - svgMinY) * SCALE + PAD));

  const colorMap = {
    'Main_Frame_EXT': '#1e293b', // Dark frame body outline
    'Main_Frame_INT': '#334155', // Dark frame body outline
    'Main_GSK_CENTRAL': '#f472b6',
    'Fix_GSK_EXT': '#db2777', // Pink gasket
    'Fix_GSK_BZD': '#ec4899', // Light pink gasket
    'Fix_BZD': '#eab308', // Yellow glazing bead
    'Fix_GLS_EXT': '#7dd3fc', // Light blue glass
    'Fix_GLS_MD': '#38bdf8', // Blue glass
    'Fix_GLS_INT': '#0284c7', // Dark blue glass
    'Fix_SPACER': '#64748b' // Spacer
  };

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a; font-family: sans-serif;">
  <defs>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" stroke-width="0.5"/>
    </pattern>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#grid)" />
  <g id="geometry">
`;

  // Draw layers
  for (const [layerName, contours] of Object.entries(svgLayers)) {
    const color = colorMap[layerName] || '#888888';
    contours.forEach((pts, idx) => {
      const dStr = 'M ' + pts.map(p => `${stx(p.x)},${sty(p.y)}`).join(' L ') + ' Z';
      const isFrame = layerName.includes('Main_Frame');
      const fillOpacity = isFrame ? '0.15' : '0.6';
      const strokeWidth = isFrame ? '0.8' : '1.5';
      svg += `    <!-- ${layerName} [${idx}] -->\n`;
      svg += `    <path d="${dStr}" fill="${color}" fill-opacity="${fillOpacity}" stroke="${color}" stroke-width="${strokeWidth}" />\n`;
    });
  }

  svg += `  </g>
  <text x="20" y="35" fill="#f8fafc" font-size="16" font-weight="bold">Fixed Part Gaskets, glass package, bead, spacer aligned with Frame</text>
  <text x="20" y="52" fill="#94a3b8" font-size="11">Alignment inside the exterior frame track (left side assembly)</text>
</svg>
`;

  fs.writeFileSync(SVG_OUT, svg);
  fs.writeFileSync(SVG_WORKSPACE, svg);
  console.log(`✅ Saved SVG preview to: ${SVG_OUT}`);
  console.log(`✅ Saved SVG preview to: ${SVG_WORKSPACE}`);
}

main().catch(err => {
  console.error("Error executing script:", err);
  process.exit(1);
});
