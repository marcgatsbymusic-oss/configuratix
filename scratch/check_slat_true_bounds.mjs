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

    console.log(`Block: "${name}" -> True Bounds: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}] (W=${(maxX-minX).toFixed(2)}), Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}] (H=${(maxY-minY).toFixed(2)})`);
  }

} catch (err) {
  console.error(err);
}
