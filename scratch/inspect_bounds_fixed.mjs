import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\Gaskets_GLS_SPACERS FOR_FIX_LEFT_BOTTOM_TOP.dxf";
const SVG_OUT = "C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\ec14721d-ab09-4ccb-b6ad-69c7a7663648\\Gaskets_GLS_SPACERS_FOR_FIX.svg";

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

function arcToPolyline(center, r, startAngle, endAngle, tx, segments = 16) {
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

function bulgeToArcPts(p1, p2, bulge, tx, segments = 16) {
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

try {
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

  // Extract all points for each layer to find bounds
  const layerPoints = {};
  const layerBounds = {};

  for (const [layerName, items] of Object.entries(rawGeoms)) {
    const pts = [];
    items.forEach(({ entity, tx }) => {
      if (entity.type === 'LINE') {
        if (entity.vertices && entity.vertices.length >= 2) {
          pts.push(tx.transformPoint(entity.vertices[0]));
          pts.push(tx.transformPoint(entity.vertices[1]));
        }
      } else if (entity.type === 'ARC') {
        const arcPts = arcToPolyline(entity.center, entity.radius, entity.startAngle, entity.endAngle, tx);
        pts.push(...arcPts);
      } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
        const verts = entity.vertices;
        if (verts && verts.length > 0) {
          for (let i = 0; i < verts.length; i++) {
            pts.push(tx.transformPoint(verts[i]));
            if (verts[i].bulge !== undefined && verts[i].bulge !== 0 && i < verts.length - 1) {
              const bulgePts = bulgeToArcPts(verts[i], verts[i + 1], verts[i].bulge, tx);
              pts.push(...bulgePts);
            }
          }
        }
      }
    });

    if (pts.length > 0) {
      layerPoints[layerName] = pts;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      pts.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      layerBounds[layerName] = { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
    }
  }

  console.log('\n--- LAYER BOUNDS (RAW IN DXF) ---');
  console.log(JSON.stringify(layerBounds, null, 2));

  // Find overall bounds
  let overallMinX = Infinity, overallMaxX = -Infinity, overallMinY = Infinity, overallMaxY = -Infinity;
  Object.values(layerBounds).forEach(b => {
    if (b.minX < overallMinX) overallMinX = b.minX;
    if (b.maxX > overallMaxX) overallMaxX = b.maxX;
    if (b.minY < overallMinY) overallMinY = b.minY;
    if (b.maxY > overallMaxY) overallMaxY = b.maxY;
  });

  const width = overallMaxX - overallMinX;
  const height = overallMaxY - overallMinY;
  console.log('\n--- OVERALL BOUNDS ---');
  console.log({ minX: overallMinX, maxX: overallMaxX, minY: overallMinY, maxY: overallMaxY, w: width, h: height });

  // Generate SVG Preview
  const SCALE = 6;
  const PAD = 20;
  const svgW = width * SCALE + PAD * 2;
  const svgH = height * SCALE + PAD * 2;

  const stx = (x) => ((x - overallMinX) * SCALE + PAD);
  const sty = (y) => (svgH - ((y - overallMinY) * SCALE + PAD)); // Flip Y axis for SVG

  const toPath = (pts) => {
    if (pts.length === 0) return '';
    return 'M ' + pts.map(p => `${stx(p.x)},${sty(p.y)}`).join(' L ') + ' Z';
  };

  const colorMap = {
    'Profil stal': '#cbd5e1',
    'FRAME_FIX_LEFT_TOP_BOTTOM': '#d97706', // Gold/orange
    'GSK_EXT': '#db2777', // Pink
    'BZD': '#eab308', // Yellow
    'GSK_BZD': '#ec4899', // Light pink
    'GLS_INT': '#0284c7', // Dark blue
    'GLS_MD': '#38bdf8', // Blue
    'GLS_EXT': '#7dd3fc', // Light blue
    'SPACER': '#64748b',
    'Mostek pvc': '#a855f7', // Purple
    'EPDM': '#10b981' // Green
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
  for (const [layerName, items] of Object.entries(rawGeoms)) {
    const color = colorMap[layerName] || '#888888';
    
    items.forEach(({ entity, tx }, idx) => {
      let pts = [];
      if (entity.type === 'LINE') {
        if (entity.vertices && entity.vertices.length >= 2) {
          pts.push(tx.transformPoint(entity.vertices[0]));
          pts.push(tx.transformPoint(entity.vertices[1]));
        }
      } else if (entity.type === 'ARC') {
        pts = arcToPolyline(entity.center, entity.radius, entity.startAngle, entity.endAngle, tx);
      } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
        const verts = entity.vertices;
        if (verts && verts.length > 0) {
          for (let i = 0; i < verts.length; i++) {
            pts.push(tx.transformPoint(verts[i]));
            if (verts[i].bulge !== undefined && verts[i].bulge !== 0 && i < verts.length - 1) {
              const bulgePts = bulgeToArcPts(verts[i], verts[i + 1], verts[i].bulge, tx);
              pts.push(...bulgePts);
            }
          }
        }
      }
      
      if (pts.length > 1) {
        svg += `    <!-- ${layerName} [${idx}] -->\n`;
        // Check if polyline should be closed
        const isClosed = entity.closed || entity.type === 'LWPOLYLINE';
        const dStr = 'M ' + pts.map(p => `${stx(p.x)},${sty(p.y)}`).join(' L ') + (isClosed ? ' Z' : '');
        const fill = isClosed ? color : 'none';
        const fillOpacity = isClosed ? '0.4' : '1';
        svg += `    <path d="${dStr}" fill="${fill}" fill-opacity="${fillOpacity}" stroke="${color}" stroke-width="1.2" />\n`;
      }
    });
  }

  svg += `  </g>
  <text x="20" y="35" fill="#f8fafc" font-size="16" font-weight="bold">Fixed Gaskets, GLS, Spacer, BZD - AutoCAD Parse</text>
</svg>
`;

  fs.writeFileSync(SVG_OUT, svg);
  console.log(`✅ Saved SVG preview to: ${SVG_OUT}`);

} catch (err) {
  console.error(err);
}
