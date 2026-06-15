import fs from 'fs';
import DxfParser from 'dxf-parser';

const DXF_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\Gaskets_GLS_SPACERS FOR_FIX_LEFT_BOTTOM_TOP.dxf";
const FRAME_JSON = "src/data/profiles/IgloEdge/IGLS_OPENING_DOOR_SECTION_AND_FRAME.json";

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

  // 1. Find the bounds of FRAME_FIX_LEFT_TOP_BOTTOM in DXF (raw and transformed)
  const rawPts = [];
  function collectEntities(entities, tx) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          const t = Matrix3.translation(ent.position ? (ent.position.x || 0) : 0, ent.position ? (ent.position.y || 0) : 0);
          collectEntities(block.entities, tx.multiply(t));
        }
      } else if (ent.layer === 'FRAME_FIX_LEFT_TOP_BOTTOM') {
        if (ent.type === 'LINE') {
          rawPts.push(tx.transformPoint(ent.vertices[0]));
          rawPts.push(tx.transformPoint(ent.vertices[1]));
        } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
          ent.vertices.forEach(v => rawPts.push(tx.transformPoint(v)));
        }
      }
    });
  }
  collectEntities(dxf.entities, Matrix3.identity());

  if (rawPts.length === 0) {
    console.log("No shapes found on layer FRAME_FIX_LEFT_TOP_BOTTOM");
    process.exit(0);
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  rawPts.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });
  console.log("RAW FRAME_FIX_LEFT_TOP_BOTTOM bounds in DXF:", { minX, maxX, minY, maxY });

  // Apply the transformation used in prepare_fixed_glazing.mjs:
  // x_target = y_source - 80.67
  // y_target = x_source + 82.50
  const transform = (p) => ({
    x: p.y - 80.67,
    y: p.x + 82.50
  });

  const txPts = rawPts.map(transform);
  let txMinX = Infinity, txMaxX = -Infinity, txMinY = Infinity, txMaxY = -Infinity;
  txPts.forEach(p => {
    if (p.x < txMinX) txMinX = p.x;
    if (p.x > txMaxX) txMaxX = p.x;
    if (p.y < txMinY) txMinY = p.y;
    if (p.y > txMaxY) txMaxY = p.y;
  });
  console.log("TRANSFORMED FRAME_FIX_LEFT_TOP_BOTTOM bounds:", { minX: txMinX, maxX: txMaxX, minY: txMinY, maxY: txMaxY });

  // 2. Load the JSON frame profile and find its bounds
  const frameData = JSON.parse(fs.readFileSync(FRAME_JSON, 'utf8'));
  let frameMinX = Infinity, frameMaxX = -Infinity, frameMinY = Infinity, frameMaxY = -Infinity;
  
  // Find frame's raw bounds across Main_Frame_EXT and Main_Frame_INT (absolute CAD coords)
  const frameLayers = ['Main_Frame_EXT', 'Main_Frame_INT'];
  frameLayers.forEach(l => {
    if (frameData.layers[l]) {
      frameData.layers[l].contours.forEach(c => c.points.forEach(p => {
        if (p.x < frameMinX) frameMinX = p.x;
        if (p.x > frameMaxX) frameMaxX = p.x;
        if (p.y < frameMinY) frameMinY = p.y;
        if (p.y > frameMaxY) frameMaxY = p.y;
      }));
    }
  });
  console.log("Main_Frame bounds in JSON (relative to its own origin):", { minX: frameMinX, maxX: frameMaxX, minY: frameMinY, maxY: frameMaxY });

} catch (err) {
  console.error("Error:", err);
}
