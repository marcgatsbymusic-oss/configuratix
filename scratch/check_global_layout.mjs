import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";

function arcToPolyline(cx, cy, r, startAngleRad, endAngleRad, segments = 16) {
  let s = startAngleRad;
  let e = endAngleRad;
  if (e <= s) e += 2 * Math.PI;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = s + (e - s) * (i / segments);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  // Compute true bounds for each block
  const blockBounds = {};
  for (const [name, block] of Object.entries(dxf.blocks)) {
    if (name.startsWith('*')) continue;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    function update(x, y) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    block.entities?.forEach(ent => {
      if (ent.type === 'LINE') {
        update(ent.vertices[0].x, ent.vertices[0].y);
        update(ent.vertices[1].x, ent.vertices[1].y);
      } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
        ent.vertices?.forEach(v => {
          update(v.x, v.y);
        });
      } else if (ent.type === 'ARC') {
        const pts = arcToPolyline(ent.center.x, ent.center.y, ent.radius, ent.startAngle, ent.endAngle);
        pts.forEach(p => update(p.x, p.y));
      }
    });
    blockBounds[name] = { minX, maxX, minY, maxY };
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

  console.log("Global true bounds of all inserts:\n");
  const inserts = dxf.entities.filter(e => e.type === 'INSERT');
  inserts.forEach((ins, idx) => {
    const bounds = blockBounds[ins.name];
    if (!bounds || bounds.minX === Infinity) return;
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
    console.log(`Insert ${idx.toString().padStart(2)}: "${ins.name.padEnd(15)}" Rot=${(ins.rotation ?? 0).toFixed(1)}° -> Global X=[${gMinX.toFixed(2)}, ${gMaxX.toFixed(2)}], Y=[${gMinY.toFixed(2)}, ${gMaxY.toFixed(2)}]`);
  });

} catch (err) {
  console.error(err);
}
