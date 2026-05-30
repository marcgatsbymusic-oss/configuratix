import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

const beadBlock = dxf.blocks["50924 - listwa 22mm"];
if (beadBlock) {
  beadBlock.entities.forEach((ent, idx) => {
    if (ent.type.includes('POLYLINE')) {
      console.log(`Polyline #${idx}:`);
      let hasBulge = false;
      ent.vertices.forEach((v, vidx) => {
        if (v.bulge && v.bulge !== 0) {
          hasBulge = true;
          console.log(`  v[${vidx}]: bulge=${v.bulge}, x=${v.x}, y=${v.y}`);
        }
      });
      if (!hasBulge) {
        console.log("  No bulges.");
      }
    }
  });
}
