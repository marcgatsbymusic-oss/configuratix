import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  console.log(`Top-level inserts and their global bounding boxes:`);
  
  function getBlockLocalBounds(block) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    block.entities?.forEach(ent => {
      if (ent.type === 'LINE') {
        minX = Math.min(minX, ent.x1, ent.x2);
        maxX = Math.max(maxX, ent.x1, ent.x2);
        minY = Math.min(minY, ent.y1, ent.y2);
        maxY = Math.max(maxY, ent.y1, ent.y2);
      } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
        ent.vertices?.forEach(v => {
          minX = Math.min(minX, v.x);
          maxX = Math.max(maxX, v.x);
          minY = Math.min(minY, v.y);
          maxY = Math.max(maxY, v.y);
        });
      } else if (ent.type === 'ARC' || ent.type === 'CIRCLE') {
        const cx = ent.center?.x ?? ent.cx ?? 0;
        const cy = ent.center?.y ?? ent.cy ?? 0;
        const r = ent.radius ?? ent.r ?? 0;
        minX = Math.min(minX, cx - r);
        maxX = Math.max(maxX, cx + r);
        minY = Math.min(minY, cy - r);
        maxY = Math.max(maxY, cy + r);
      }
    });
    return { minX, maxX, minY, maxY };
  }

  const blockBounds = {};
  for (const [name, block] of Object.entries(dxf.blocks)) {
    if (name.startsWith('*')) continue;
    blockBounds[name] = getBlockLocalBounds(block);
  }

  function transformPoint(p, pos, scale, rotDeg) {
    let x = p.x;
    let y = p.y;
    const sx = scale?.x ?? 1;
    const sy = scale?.y ?? 1;
    x *= sx;
    y *= sy;
    if (rotDeg) {
      const rad = (rotDeg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      x = rx;
      y = ry;
    }
    x += pos.x;
    y += pos.y;
    return { x, y };
  }

  const inserts = dxf.entities.filter(e => e.type === 'INSERT');
  inserts.forEach((ins, idx) => {
    const bounds = blockBounds[ins.name];
    if (!bounds || bounds.minX === Infinity) {
      console.log(`Insert ${idx}: "${ins.name}" - no geometric bounds found.`);
      return;
    }
    // Transform the four corners of local bounds
    const corners = [
      { x: bounds.minX, y: bounds.minY },
      { x: bounds.maxX, y: bounds.minY },
      { x: bounds.maxX, y: bounds.maxY },
      { x: bounds.minX, y: bounds.maxY }
    ];
    let gMinX = Infinity, gMaxX = -Infinity, gMinY = Infinity, gMaxY = -Infinity;
    corners.forEach(c => {
      const pt = transformPoint(c, ins.position, ins.scale, ins.rotation);
      gMinX = Math.min(gMinX, pt.x);
      gMaxX = Math.max(gMaxX, pt.x);
      gMinY = Math.min(gMinY, pt.y);
      gMaxY = Math.max(gMaxY, pt.y);
    });
    console.log(`Insert ${idx}: "${ins.name}" at (${ins.position.x.toFixed(2)}, ${ins.position.y.toFixed(2)}) Rot=${(ins.rotation ?? 0).toFixed(1)}° -> Global X=[${gMinX.toFixed(2)}, ${gMaxX.toFixed(2)}], Y=[${gMinY.toFixed(2)}, ${gMaxY.toFixed(2)}]`);
  });

  console.log(`\nTop-level primitive entities (Lines, Arcs, Polylines not in blocks):`);
  const prims = dxf.entities.filter(e => e.type !== 'INSERT');
  prims.forEach((ent, idx) => {
    if (idx < 10) {
      console.log(`Prim ${idx}: Type=${ent.type}, Layer=${ent.layer}`);
    }
  });

} catch (err) {
  console.error(err);
}
