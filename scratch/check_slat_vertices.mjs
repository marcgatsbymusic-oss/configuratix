import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  const block = dxf.blocks['póro 37mm'];
  console.log(`Block entity count: ${block.entities.length}`);

  let points = [];
  block.entities.forEach(ent => {
    if (ent.type === 'LINE') {
      points.push(ent.vertices[0], ent.vertices[1]);
    } else if (ent.type === 'ARC') {
      // Arc center and approximate endpoints
      const cx = ent.center.x;
      const cy = ent.center.y;
      const r = ent.radius;
      points.push({ x: cx - r, y: cy });
      points.push({ x: cx + r, y: cy });
      points.push({ x: cx, y: cy - r });
      points.push({ x: cx, y: cy + r });
    }
  });

  // Let's sort points by X
  points.sort((a, b) => a.x - b.x);
  console.log(`Total vertices/extremes collected: ${points.length}`);
  console.log(`X range: [${points[0].x.toFixed(2)}, ${points[points.length - 1].x.toFixed(2)}]`);
  
  // Group points by X in buckets of 10mm to see where the density is
  const groups = {};
  points.forEach(p => {
    const bucket = Math.floor(p.x / 10) * 10;
    groups[bucket] = (groups[bucket] || 0) + 1;
  });
  console.log('X coordinates distribution (grouped by 10mm buckets):');
  console.log(groups);

} catch (err) {
  console.error(err);
}
