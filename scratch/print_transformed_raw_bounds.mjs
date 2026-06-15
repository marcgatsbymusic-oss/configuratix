import fs from 'fs';
import DxfParser from 'dxf-parser';

const DXF_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\Gaskets_GLS_SPACERS FOR_FIX_LEFT_BOTTOM_TOP.dxf";

class Matrix3 {
  constructor() {
    this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1];
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

try {
  const dxfText = fs.readFileSync(DXF_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(dxfText);

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
        if (!rawGeoms[layer]) rawGeoms[layer] = [];
        if (ent.type === 'LINE') {
          rawGeoms[layer].push(tx.transformPoint(ent.vertices[0]));
          rawGeoms[layer].push(tx.transformPoint(ent.vertices[1]));
        } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
          ent.vertices.forEach(v => rawGeoms[layer].push(tx.transformPoint(v)));
        }
      }
    });
  }

  collectEntities(dxf.entities, Matrix3.identity());

  const layerBounds = {};
  for (const [layerName, pts] of Object.entries(rawGeoms)) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    layerBounds[layerName] = { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
  }

  console.log(JSON.stringify(layerBounds, null, 2));

} catch (err) {
  console.error(err);
}
