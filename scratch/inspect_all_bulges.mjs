import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

const blocksToCheck = ["50924 - listwa 22mm", "U- listwy przyszybowej", "U-001"];

blocksToCheck.forEach(blockName => {
  const block = dxf.blocks[blockName];
  if (block) {
    console.log(`\n========================================`);
    console.log(`Block: "${blockName}"`);
    block.entities.forEach((ent, idx) => {
      if (ent.type.includes('POLYLINE')) {
        let bulgeCount = 0;
        ent.vertices.forEach(v => {
          if (v.bulge && v.bulge !== 0) bulgeCount++;
        });
        console.log(`  Polyline #${idx}: ${ent.vertices.length} vertices, ${bulgeCount} bulges`);
      }
    });
  }
});
