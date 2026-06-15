import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  const block = dxf.blocks['póro 37mm'];
  
  block.entities.forEach((ent, idx) => {
    let isLarge = false;
    let coords = [];
    if (ent.type === 'LINE') {
      coords.push(ent.vertices[0], ent.vertices[1]);
      if (ent.vertices[0].x > 20 || ent.vertices[1].x > 20) isLarge = true;
    } else if (ent.type === 'ARC') {
      const cx = ent.center.x;
      const r = ent.radius;
      if (cx + r > 20 || cx - r > 20) isLarge = true;
      coords.push({ x: cx, y: ent.center.y });
    }
    
    if (isLarge) {
      console.log(`Outlier Entity ${idx}: Type=${ent.type}, Layer=${ent.layer}, Coords:`, JSON.stringify(ent));
    }
  });

} catch (err) {
  console.error(err);
}
