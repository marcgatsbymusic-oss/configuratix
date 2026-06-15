import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";

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

  const rawGeoms = {};
  
  function collect(entities, mat) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          const t = Matrix3.translation(ent.position.x || 0, ent.position.y || 0);
          const r = Matrix3.rotation(ent.rotation || 0);
          const s = Matrix3.scale(
            (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale,
            (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale
          );
          
          // Local transformation matrix: Translation * Rotation * Scale
          const localMat = t.multiply(r).multiply(s);
          const cumMat = mat.multiply(localMat);
          
          collect(block.entities, cumMat);
        }
      } else {
        const layer = ent.layer || 'unknown';
        if (!rawGeoms[layer]) rawGeoms[layer] = [];
        rawGeoms[layer].push({ entity: ent, mat });
      }
    });
  }

  collect(dxf.entities, Matrix3.identity());

  // Let's print the bounds of Door_GSK_INT under matrix transformation
  const items = rawGeoms['Door_GSK_INT'];
  if (!items) {
    console.log("Door_GSK_INT not found");
    return;
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  items.forEach(({ entity, mat }) => {
    if (entity.vertices) {
      entity.vertices.forEach(v => {
        const p = mat.transformPoint(v);
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      });
    }
  });

  console.log("=== MATRIX TRANSFORMED Door_GSK_INT BOUNDS ===");
  console.log(`X: [${minX.toFixed(4)}, ${maxX.toFixed(4)}] Y: [${minY.toFixed(4)}, ${maxY.toFixed(4)}]`);
}

main();
