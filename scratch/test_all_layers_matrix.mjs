import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";

// Old transform logic
function oldTransformPoint(pt, tx) {
  const localRot = (tx.rotation || 0) * Math.PI / 180;
  const scaleX = tx.scaleX === undefined ? 1 : tx.scaleX;
  const scaleY = tx.scaleY === undefined ? 1 : tx.scaleY;
  
  let xs = pt.x * scaleX;
  let ys = pt.y * scaleY;
  let xr = xs * Math.cos(localRot) - ys * Math.sin(localRot);
  let yr = xs * Math.sin(localRot) + ys * Math.cos(localRot);
  return { x: xr + tx.x, y: yr + tx.y };
}

// Matrix helper class
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

function main() {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  const rawGeoms = [];
  
  function collect(entities, tx, mat) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          const localRot = ent.rotation || 0;
          const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
          const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;
          
          // Old nextTx
          const posT_old = oldTransformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
          const nextTx_old = {
            x: posT_old.x,
            y: posT_old.y,
            rotation: tx.rotation + localRot,
            scaleX: tx.scaleX * localScaleX,
            scaleY: tx.scaleY * localScaleY
          };

          // New matrix
          const t = Matrix3.translation(ent.position.x || 0, ent.position.y || 0);
          const r = Matrix3.rotation(ent.rotation || 0);
          const s = Matrix3.scale(localScaleX, localScaleY);
          const localMat = t.multiply(r).multiply(s);
          const cumMat = mat.multiply(localMat);
          
          collect(block.entities, nextTx_old, cumMat);
        }
      } else {
        const layer = ent.layer || 'unknown';
        rawGeoms.push({ entity: ent, tx, mat, layer });
      }
    });
  }

  collect(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }, Matrix3.identity());

  const layers = [...new Set(rawGeoms.map(g => g.layer))];
  console.log(`Comparing ${layers.length} layers:`);
  
  for (const layer of layers) {
    const items = rawGeoms.filter(g => g.layer === layer);
    
    // Bounds for old
    let oldMinX = Infinity, oldMaxX = -Infinity, oldMinY = Infinity, oldMaxY = -Infinity;
    // Bounds for new matrix
    let newMinX = Infinity, newMaxX = -Infinity, newMinY = Infinity, newMaxY = -Infinity;
    
    items.forEach(({ entity, tx, mat }) => {
      let pts = [];
      if (entity.vertices) {
        pts = entity.vertices;
      } else if (entity.type === 'LINE') {
        pts = entity.vertices || [];
      }
      pts.forEach(v => {
        const pOld = oldTransformPoint(v, tx);
        if (pOld.x < oldMinX) oldMinX = pOld.x; if (pOld.x > oldMaxX) oldMaxX = pOld.x;
        if (pOld.y < oldMinY) oldMinY = pOld.y; if (pOld.y > oldMaxY) oldMaxY = pOld.y;
        
        const pNew = mat.transformPoint(v);
        if (pNew.x < newMinX) newMinX = pNew.x; if (pNew.x > newMaxX) newMaxX = pNew.x;
        if (pNew.y < newMinY) newMinY = pNew.y; if (pNew.y > newMaxY) newMaxY = pNew.y;
      });
    });

    if (oldMinX !== Infinity && newMinX !== Infinity) {
      const dxMin = Math.abs(oldMinX - newMinX);
      const dyMin = Math.abs(oldMinY - newMinY);
      const dxMax = Math.abs(oldMaxX - newMaxX);
      const dyMax = Math.abs(oldMaxY - newMaxY);
      const maxDiff = Math.max(dxMin, dyMin, dxMax, dyMax);
      
      console.log(`Layer: ${layer.padEnd(20)} | Diff: ${maxDiff.toFixed(4)} mm | Old Bounds X: [${oldMinX.toFixed(2)}, ${oldMaxX.toFixed(2)}] Y: [${oldMinY.toFixed(2)}, ${oldMaxY.toFixed(2)}] | New Bounds X: [${newMinX.toFixed(2)}, ${newMaxX.toFixed(2)}] Y: [${newMinY.toFixed(2)}, ${newMaxY.toFixed(2)}]`);
    }
  }
}

main();
