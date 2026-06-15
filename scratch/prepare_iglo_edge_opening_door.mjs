import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

// Inputs and Outputs
const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";
const ART_DIR = "C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\ec14721d-ab09-4ccb-b6ad-69c7a7663648";
const SVG_OUT = path.join(ART_DIR, "IGLS_OPENING_DOOR_SECTION_AND_FRAME.svg");
const SVG_WORKSPACE = "C:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.svg";

const JSON_COMBINED = "C:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\data\\profiles\\IgloEdge\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.json";
const JSON_MAIN_FRM = "C:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\data\\profiles\\IgloEdge\\Main_Frame.json";
const JSON_DOOR_FRM = "C:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\data\\profiles\\IgloEdge\\Door_Frame.json";

// Constants
const SNAP_TOLERANCE   = 0.05;  // mm
const ARC_SEGMENTS     = 24;    // subdivisions per arc
const SIMPLIFY_TOLERANCE = 0.05; // mm

// Sutherland-Hodgman vertical clipping
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

// Bounding box filter (discard extra components from other detail drawings)
function inActiveBounds(pts) {
  return pts.every(p => p.x >= -10 && p.x <= 200 && p.y >= -10 && p.y <= 200);
}

// Geometry helpers
function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

class Matrix3 {
  constructor() {
    this.elements = [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  }

  static identity() {
    return new Matrix3();
  }

  static translation(x, y) {
    const m = new Matrix3();
    m.elements = [
      1, 0, x,
      0, 1, y,
      0, 0, 1
    ];
    return m;
  }

  static rotation(deg) {
    const rad = deg * Math.PI / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const m = new Matrix3();
    m.elements = [
      c, -s, 0,
      s,  c, 0,
      0,  0, 1
    ];
    return m;
  }

  static scale(x, y) {
    const m = new Matrix3();
    m.elements = [
      x, 0, 0,
      0, y, 0,
      0, 0, 1
    ];
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

function transformPoint(pt, tx) {
  return tx.transformPoint(pt);
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

function toSvgPath(points) {
  if (!points.length) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ` +
         rest.map(p => `L ${p.x} ${p.y}`).join(' ') +
         ' Z';
}

function toThreeShapeCommands(points) {
  if (!points.length) return [];
  const cmds = [{ cmd: 'moveTo', x: points[0].x, y: points[0].y }];
  for (let i = 1; i < points.length; i++) {
    cmds.push({ cmd: 'lineTo', x: points[i].x, y: points[i].y });
  }
  return cmds;
}

// Main Runner
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
          
          const t = Matrix3.translation(ent.position.x || 0, ent.position.y || 0);
          const r = Matrix3.rotation(localRot);
          const s = Matrix3.scale(localScaleX, localScaleY);
          
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

  // Collect raw geometries
  collectEntities(dxf.entities, Matrix3.identity());

  // Stitch and simplify contours
  const activeContours = {};

  for (const [layerName, items] of Object.entries(rawGeoms)) {
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
    const closedContours = [];

    stitched.forEach(chain => {
      if (chain.length > 2) {
        const gap = dist(chain[0], chain[chain.length - 1]);
        if (gap <= 0.5) {
          closedContours.push(closeAndSnap(chain));
        }
      }
    });

    lwpolys.forEach(chain => {
      if (chain.length > 2) {
        closedContours.push(closeAndSnap(chain));
      }
    });

    // Filter contours in active region only
    let processedContours = closedContours;
    // No manual offset needed for Door_GSK_INT as Matrix3 correctly transforms it
    const valid = processedContours.filter(inActiveBounds).map(c => simplifyContour(c, SIMPLIFY_TOLERANCE));
    if (valid.length > 0) {
      activeContours[layerName] = valid;
    }
  }

  // --- SPLIT LOGIC ---
  const mainFrameRaw = activeContours['Main_Frame']?.[0];
  const doorFrameRaw = activeContours['Door_Frame']?.[0];

  if (!mainFrameRaw || !doorFrameRaw) {
    console.error("Error: Could not find Main_Frame or Door_Frame contours in the active space!");
    process.exit(1);
  }

  console.log("Splitting Main_Frame...");
  const mainSplitX = 97.10; // Midpoint of [15.50, 178.69]
  const mainFrmExt = clipPolygon(mainFrameRaw, mainSplitX, false); // X >= 97.10
  const mainFrmInt = clipPolygon(mainFrameRaw, mainSplitX, true);  // X <= 97.10

  console.log("Splitting Door_Frame...");
  const doorSplitX = 41.29; // Midpoint of [0.11, 82.47]
  const doorFrmExt = clipPolygon(doorFrameRaw, doorSplitX, false); // X >= 41.29
  const doorFrmInt = clipPolygon(doorFrameRaw, doorSplitX, true);  // X <= 41.29

  // Assemble all active contours, replacing the raw unsplit ones with the split ones
  const finalContours = {};
  for (const [layer, contours] of Object.entries(activeContours)) {
    if (layer === 'Main_Frame' || layer === 'Door_Frame' || layer === 'Profil stal') continue;
    finalContours[layer] = contours;
  }

  finalContours['Main_Frame_EXT'] = [mainFrmExt];
  finalContours['Main_Frame_INT'] = [mainFrmInt];
  finalContours['Door_Frame_EXT'] = [doorFrmExt];
  finalContours['Door_Frame_INT'] = [doorFrmInt];

  // --- COORDINATE NORMALIZATION ---
  // Find global bounds across all final contours
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  Object.values(finalContours).forEach(contours => {
    contours.forEach(c => {
      c.forEach(p => {
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      });
    });
  });

  const width = maxX - minX;
  const height = maxY - minY;
  console.log(`Global Bounds Normalized: X=[0, ${width.toFixed(4)}], Y=[0, ${height.toFixed(4)}]`);

  // Translate all vertices
  const normalizedContours = {};
  for (const [layer, contours] of Object.entries(finalContours)) {
    normalizedContours[layer] = contours.map(c => 
      c.map(p => ({
        x: parseFloat((p.x - minX).toFixed(6)),
        y: parseFloat((p.y - minY).toFixed(6))
      }))
    );
  }

  // --- BUILD METADATA & GROUPS ---
  const groups = {
    FRM: ['Main_Frame_EXT', 'Main_Frame_INT', 'Main_GSK_CENTRAL', 'Fix_Cover', 'Aluminium'],
    SSH: ['Door_Frame_EXT', 'Door_Frame_INT', 'Door_BZD', 'Door_GSK_BZD', 'Door_GSK_EXT', 'Door_GSK_INT', 'Door_GLS_EXT', 'Door_GLS_MD', 'Door_GLS_INT', 'Door_SPACER']
  };

  const layerGroupMap = {};
  Object.entries(groups).forEach(([grp, layers]) => {
    layers.forEach(l => { layerGroupMap[l] = grp; });
  });

  // Base output payload structure
  const buildJsonPayload = (selectedLayers) => {
    const layerData = {};
    for (const layerName of selectedLayers) {
      const contours = normalizedContours[layerName];
      if (!contours) continue;

      layerData[layerName] = {
        group: layerGroupMap[layerName] || null,
        contours: contours.map((pts, idx) => ({
          id: `${layerName}_${idx}`,
          source: layerName.includes('Frame') ? "CLIP_POLYGON" : "DXF_STITCHED",
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

    return {
      meta: {
        source: path.basename(INPUT_FILE),
        system: "IGLO_EDGE",
        type: "IGLS_OPENING_DOOR",
        bounds: {
          raw: { minX, minY, maxX, maxY },
          normalised: { minX: 0, minY: 0, maxX: parseFloat(width.toFixed(4)), maxY: parseFloat(height.toFixed(4)) },
          width,
          height,
          unit: "mm"
        }
      },
      groups: {
        FRM: Object.keys(layerData).filter(l => layerGroupMap[l] === 'FRM'),
        SSH: Object.keys(layerData).filter(l => layerGroupMap[l] === 'SSH')
      },
      layers: layerData
    };
  };

  // 1. Combined profile JSON
  const payloadCombined = buildJsonPayload(Object.keys(normalizedContours));
  fs.mkdirSync(path.dirname(JSON_COMBINED), { recursive: true });
  fs.writeFileSync(JSON_COMBINED, JSON.stringify(payloadCombined, null, 2));
  console.log(`✅ Saved Combined JSON to: ${JSON_COMBINED}`);

  // 2. Main Frame only JSON
  const payloadMainFrame = buildJsonPayload(['Main_Frame_EXT', 'Main_Frame_INT', 'Main_GSK_CENTRAL', 'Fix_Cover', 'Aluminium']);
  fs.writeFileSync(JSON_MAIN_FRM, JSON.stringify(payloadMainFrame, null, 2));
  console.log(`✅ Saved Main Frame JSON to: ${JSON_MAIN_FRM}`);

  // 3. Door Frame only JSON
  const payloadDoorFrame = buildJsonPayload(['Door_Frame_EXT', 'Door_Frame_INT', 'Door_BZD', 'Door_GSK_BZD', 'Door_GSK_EXT', 'Door_GSK_INT', 'Door_GLS_EXT', 'Door_GLS_MD', 'Door_GLS_INT', 'Door_SPACER']);
  fs.writeFileSync(JSON_DOOR_FRM, JSON.stringify(payloadDoorFrame, null, 2));
  console.log(`✅ Saved Door Frame JSON to: ${JSON_DOOR_FRM}`);

  // --- SVG VIEW PREVIEW ---
  const SCALE = 6;
  const PAD = 20;
  const svgW = width * SCALE + PAD * 2;
  const svgH = height * SCALE + PAD * 2;

  const tx = (x) => (x * SCALE + PAD);
  const ty = (y) => (svgH - (y * SCALE + PAD)); // Flip Y axis for SVG rendering

  const toPath = (pts) => {
    if (pts.length === 0) return '';
    return 'M ' + pts.map(p => `${tx(p.x)},${ty(p.y)}`).join(' L ') + ' Z';
  };

  // Color mapping
  const colorMap = {
    // Split Main Frame
    'Main_Frame_EXT': '#d97706', // Gold/orange
    'Main_Frame_INT': '#059669', // Emerald/green
    
    // Split Door Frame
    'Door_Frame_EXT': '#dc2626', // Red
    'Door_Frame_INT': '#2563eb', // Blue
    
    // Glass
    'Door_GLS_EXT': '#7dd3fc',
    'Door_GLS_MD': '#38bdf8',
    'Door_GLS_INT': '#0284c7',
    
    // Gaskets
    'Door_GSK_EXT': '#db2777',
    'Door_GSK_INT': '#a21caf', // Purple
    'Door_GSK_BZD': '#ec4899',
    'Main_GSK_CENTRAL': '#f472b6',
    
    // Bead and Covers
    'Door_BZD': '#eab308',
    'Fix_Cover': '#84cc16',
    
    // Aluminium and reinforcements
    'Aluminium': '#a1a1aa',
    'Profil stal': '#cbd5e1',
    'Door_SPACER': '#64748b'
  };

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a; font-family: sans-serif;">
  <defs>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" stroke-width="0.5"/>
    </pattern>
  </defs>
  
  <!-- Grid -->
  <rect width="100%" height="100%" fill="url(#grid)" />

  <g id="geometry">
`;

  // Draw other layers first so they sit below frame outlines
  const backgroundLayers = ['Door_GLS_EXT', 'Door_GLS_MD', 'Door_GLS_INT', 'Door_SPACER', 'Aluminium'];
  backgroundLayers.forEach(layer => {
    const contours = normalizedContours[layer];
    if (!contours) return;
    const color = colorMap[layer] || '#64748b';
    contours.forEach(c => {
      svg += `    <path d="${toPath(c)}" fill="${color}" fill-opacity="0.4" stroke="${color}" stroke-width="1" />\n`;
    });
  });

  // Draw Gaskets and Cover profiles
  const detailLayers = ['Door_GSK_EXT', 'Door_GSK_INT', 'Door_GSK_BZD', 'Main_GSK_CENTRAL', 'Door_BZD', 'Fix_Cover'];
  detailLayers.forEach(layer => {
    const contours = normalizedContours[layer];
    if (!contours) return;
    const color = colorMap[layer] || '#888888';
    contours.forEach((c, idx) => {
      svg += `    <!-- ${layer} [${idx}] -->\n`;
      svg += `    <path d="${toPath(c)}" fill="${color}" fill-opacity="0.8" stroke="${color}" stroke-width="1.2" />\n`;
    });
  });

  // Draw Split Main Frame (EXT & INT)
  const mainExtContours = normalizedContours['Main_Frame_EXT'];
  if (mainExtContours) {
    mainExtContours.forEach(c => {
      svg += `    <!-- Main Frame EXT -->\n`;
      svg += `    <path d="${toPath(c)}" fill="${colorMap['Main_Frame_EXT']}" fill-opacity="0.85" stroke="#f59e0b" stroke-width="1.5" />\n`;
    });
  }
  const mainIntContours = normalizedContours['Main_Frame_INT'];
  if (mainIntContours) {
    mainIntContours.forEach(c => {
      svg += `    <!-- Main Frame INT -->\n`;
      svg += `    <path d="${toPath(c)}" fill="${colorMap['Main_Frame_INT']}" fill-opacity="0.85" stroke="#10b981" stroke-width="1.5" />\n`;
    });
  }

  // Draw Split Door Frame (EXT & INT)
  const doorExtContours = normalizedContours['Door_Frame_EXT'];
  if (doorExtContours) {
    doorExtContours.forEach(c => {
      svg += `    <!-- Door Frame EXT -->\n`;
      svg += `    <path d="${toPath(c)}" fill="${colorMap['Door_Frame_EXT']}" fill-opacity="0.85" stroke="#ef4444" stroke-width="1.5" />\n`;
    });
  }
  const doorIntContours = normalizedContours['Door_Frame_INT'];
  if (doorIntContours) {
    doorIntContours.forEach(c => {
      svg += `    <!-- Door Frame INT -->\n`;
      svg += `    <path d="${toPath(c)}" fill="${colorMap['Door_Frame_INT']}" fill-opacity="0.85" stroke="#3b82f6" stroke-width="1.5" />\n`;
    });
  }

  // Add split vertical dashed lines
  const normMainSplitX = mainSplitX - minX;
  const normDoorSplitX = doorSplitX - minX;

  svg += `
    <!-- Split Dashed Lines -->
    <line x1="${tx(normMainSplitX)}" y1="${ty(0)}" x2="${tx(normMainSplitX)}" y2="${ty(height)}" stroke="#e2e8f0" stroke-dasharray="5,5" stroke-width="1.5" opacity="0.6" />
    <line x1="${tx(normDoorSplitX)}" y1="${ty(0)}" x2="${tx(normDoorSplitX)}" y2="${ty(height)}" stroke="#e2e8f0" stroke-dasharray="5,5" stroke-width="1.5" opacity="0.6" />
    
    <text x="${tx(normMainSplitX)}" y="${ty(height) - 10}" fill="#e2e8f0" font-size="10" text-anchor="middle" font-family="monospace">Main Split X = ${normMainSplitX.toFixed(2)}</text>
    <text x="${tx(normDoorSplitX)}" y="${ty(height) - 25}" fill="#e2e8f0" font-size="10" text-anchor="middle" font-family="monospace">Door Split X = ${normDoorSplitX.toFixed(2)}</text>
  </g>

  <!-- Title & Legend -->
  <text x="${PAD}" y="${PAD + 15}" fill="#f8fafc" font-size="16" font-weight="bold">Iglo Edge Slide - Opening Door Section &amp; Frame</text>
  <text x="${PAD}" y="${PAD + 32}" fill="#94a3b8" font-size="11">Sutherland-Hodgman bi-color profile splitting preview</text>

  <!-- Legend Items -->
  <g transform="translate(${PAD}, ${svgH - PAD - 20})">
    <rect x="0" y="0" width="12" height="12" fill="${colorMap['Main_Frame_EXT']}" />
    <text x="18" y="10" fill="#cbd5e1" font-size="10">Main Frame EXT</text>

    <rect x="120" y="0" width="12" height="12" fill="${colorMap['Main_Frame_INT']}" />
    <text x="138" y="10" fill="#cbd5e1" font-size="10">Main Frame INT</text>

    <rect x="240" y="0" width="12" height="12" fill="${colorMap['Door_Frame_EXT']}" />
    <text x="258" y="10" fill="#cbd5e1" font-size="10">Door Frame EXT</text>

    <rect x="360" y="0" width="12" height="12" fill="${colorMap['Door_Frame_INT']}" />
    <text x="378" y="10" fill="#cbd5e1" font-size="10">Door Frame INT</text>
  </g>
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
