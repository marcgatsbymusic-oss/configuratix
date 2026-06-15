import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_MOVABLEPOST_MAIN_OPENING_LEFT_V8.dxf";

const text = fs.readFileSync(INPUT_FILE, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

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

const rawGeoms = {};

function collectEntities(entities, tx) {
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
        collectEntities(block.entities, nextTx);
      }
    } else {
      const layer = ent.layer || 'unknown';
      if (!rawGeoms[layer]) rawGeoms[layer] = [];
      rawGeoms[layer].push({ entity: ent, tx });
    }
  });
}

collectEntities(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

const targetLayer = 'IGE_GSK_BZD';
const items = rawGeoms[targetLayer] || [];

console.log(`Total raw entities in layer "${targetLayer}": ${items.length}`);

let countLeft = 0;
let countRight = 0;
items.forEach(({ entity, tx }) => {
  let s, e, pts;
  if (entity.type === 'LINE') {
    s = transformPoint(entity.vertices[0], tx);
    e = transformPoint(entity.vertices[1], tx);
  } else if (entity.type === 'ARC') {
    pts = arcToPolyline(entity.center, entity.radius, entity.startAngle, entity.endAngle, tx);
    s = pts[0];
    e = pts[pts.length - 1];
  } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
    const verts = entity.vertices;
    pts = [];
    for (let i = 0; i < verts.length - 1; i++) {
      const v1 = verts[i];
      const v2 = verts[i + 1];
      const p1 = transformPoint(v1, tx);
      const p2 = transformPoint(v2, tx);
      let subPts = [p1];
      if (v1.bulge !== undefined && v1.bulge !== 0) {
        const arc = bulgeToArcPts(v1, v2, v1.bulge, tx);
        subPts.push(...arc);
      } else {
        subPts.push(p2);
      }
      pts.push(...subPts);
    }
    s = pts[0];
    e = pts[pts.length - 1];
  }
  
  if (s && e) {
    if (s.x < 140.0) countLeft++;
    else countRight++;
  }
});

console.log(`Left count (<140): ${countLeft}, Right count (>=140): ${countRight}`);
