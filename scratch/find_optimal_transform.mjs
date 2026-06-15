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

  // 1. Collect FRAME_FIX_LEFT_TOP_BOTTOM points from DXF (with correct block transform)
  const dxfFramePts = [];
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
      } else if (ent.layer === 'FRAME_FIX_LEFT_TOP_BOTTOM') {
        if (ent.type === 'LINE') {
          dxfFramePts.push(tx.transformPoint(ent.vertices[0]));
          dxfFramePts.push(tx.transformPoint(ent.vertices[1]));
        } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
          ent.vertices.forEach(v => dxfFramePts.push(tx.transformPoint(v)));
        }
      }
    });
  }
  collectEntities(dxf.entities, Matrix3.identity());

  // 2. Collect Main_Frame points from JSON
  const jsonFramePts = [];
  const frameData = JSON.parse(fs.readFileSync(FRAME_JSON, 'utf8'));
  const frameLayers = ['Main_Frame_EXT', 'Main_Frame_INT'];
  frameLayers.forEach(l => {
    if (frameData.layers[l]) {
      frameData.layers[l].contours.forEach(c => c.points.forEach(p => {
        jsonFramePts.push(p);
      }));
    }
  });

  console.log(`DXF Frame points: ${dxfFramePts.length}, JSON Frame points: ${jsonFramePts.length}`);

  // Find bounds of both
  const getBounds = (pts) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX)/2, cy: (minY + maxY)/2 };
  };

  const dxfBounds = getBounds(dxfFramePts);
  const jsonBounds = getBounds(jsonFramePts);

  console.log("DXF Frame Bounds (Absolute):", dxfBounds);
  console.log("JSON Frame Bounds (Relative):", jsonBounds);

  // We want to test different combinations of transforms to map DXF points to JSON space:
  // Since the DXF is a section of the left vertical part, the coordinates are rotated.
  // We will test 8 standard 2D transformations (rotations of 0, 90, 180, 270, with/without reflection)
  // For each, we first map DXF points to their centered space, apply the transform, and then shift to JSON center.

  const orientations = [
    { name: 'Standard (No Swap, sx: 1, sy: 1, rot: 0)', sx: 1, sy: 1, rot: 0, swap: false },
    { name: 'Standard (No Swap, sx: -1, sy: 1, rot: 0)', sx: -1, sy: 1, rot: 0, swap: false },
    { name: 'Standard (No Swap, sx: 1, sy: -1, rot: 0)', sx: 1, sy: -1, rot: 0, swap: false },
    { name: 'Standard (No Swap, sx: 1, sy: 1, rot: 180)', sx: 1, sy: 1, rot: 180, swap: false },
    { name: 'Standard (No Swap, sx: -1, sy: 1, rot: 180)', sx: -1, sy: 1, rot: 180, swap: false },
    { name: 'Swapped (sx: 1, sy: 1, rot: 0)', sx: 1, sy: 1, rot: 0, swap: true },
    { name: 'Swapped (sx: -1, sy: 1, rot: 0)', sx: -1, sy: 1, rot: 0, swap: true },
    { name: 'Swapped (sx: 1, sy: -1, rot: 0)', sx: 1, sy: -1, rot: 0, swap: true },
    { name: 'Swapped (sx: 1, sy: 1, rot: 180)', sx: 1, sy: 1, rot: 180, swap: true },
    { name: 'Swapped (sx: -1, sy: 1, rot: 180)', sx: -1, sy: 1, rot: 180, swap: true },
    { name: 'Swapped (sx: 1, sy: 1, rot: 90)', sx: 1, sy: 1, rot: 90, swap: true },
    { name: 'Swapped (sx: 1, sy: 1, rot: 270)', sx: 1, sy: 1, rot: 270, swap: true },
  ];

  const results = [];

  orientations.forEach(orient => {
    // Transform points
    const transformed = dxfFramePts.map(p => {
      // 1. Center around DXF center
      let cx = p.x - dxfBounds.cx;
      let cy = p.y - dxfBounds.cy;

      // 2. Swap X and Y if specified
      if (orient.swap) {
        const tmp = cx;
        cx = cy;
        cy = tmp;
      }

      // 3. Apply scale/mirror
      cx *= orient.sx;
      cy *= orient.sy;

      // 4. Apply rotation
      const rad = orient.rot * Math.PI / 180;
      const rx = cx * Math.cos(rad) - cy * Math.sin(rad);
      const ry = cx * Math.sin(rad) + cy * Math.cos(rad);

      // 5. Shift to JSON center
      return {
        x: rx + jsonBounds.cx,
        y: ry + jsonBounds.cy
      };
    });

    // Calculate match score
    let totalDist = 0;
    transformed.forEach(tp => {
      let minDist = Infinity;
      jsonFramePts.forEach(jp => {
        const d = Math.hypot(tp.x - jp.x, tp.y - jp.y);
        if (d < minDist) minDist = d;
      });
      totalDist += minDist;
    });

    const avgDist = totalDist / transformed.length;

    // Build equivalent algebraic formula:
    // We want to write:
    // x_target = A * x_source + B * y_source + C
    // y_target = D * x_source + E * y_source + F
    // Let's compute A, B, C, D, E, F by transforming basis points:
    const pOrigin = { x: 0, y: 0 };
    const pX = { x: 1, y: 0 };
    const pY = { x: 0, y: 1 };

    const tf = (p) => {
      let cx = p.x - dxfBounds.cx;
      let cy = p.y - dxfBounds.cy;
      if (orient.swap) {
        const tmp = cx;
        cx = cy;
        cy = tmp;
      }
      cx *= orient.sx;
      cy *= orient.sy;
      const rad = orient.rot * Math.PI / 180;
      const rx = cx * Math.cos(rad) - cy * Math.sin(rad);
      const ry = cx * Math.sin(rad) + cy * Math.cos(rad);
      return { x: rx + jsonBounds.cx, y: ry + jsonBounds.cy };
    };

    const o_t = tf(pOrigin);
    const x_t = tf(pX);
    const y_t = tf(pY);

    const A = x_t.x - o_t.x;
    const B = y_t.x - o_t.x;
    const C = o_t.x;
    const D = x_t.y - o_t.y;
    const E = y_t.y - o_t.y;
    const F = o_t.y;

    results.push({ orient, avgDist, formula: { A, B, C, D, E, F } });
  });

  results.sort((a, b) => a.avgDist - b.avgDist);

  console.log("\n--- OPTIMAL MATCHING RESULTS (FULL CSG MATRIX) ---");
  results.slice(0, 5).forEach((r, idx) => {
    console.log(`${idx + 1}. Orientation: ${r.orient.name}, Avg Point Distance: ${r.avgDist.toFixed(4)} mm`);
    const f = r.formula;
    console.log(`   Algebraic Formula:`);
    console.log(`     x_target = ${f.A.toFixed(4)}*x + ${f.B.toFixed(4)}*y + ${f.C.toFixed(4)}`);
    console.log(`     y_target = ${f.D.toFixed(4)}*x + ${f.E.toFixed(4)}*y + ${f.F.toFixed(4)}`);
  });

} catch (err) {
  console.error(err);
}
