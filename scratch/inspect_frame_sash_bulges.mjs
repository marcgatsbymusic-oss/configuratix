import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

const frameBlock = dxf.blocks["50001 - rama 66mm"];
if (frameBlock) {
  frameBlock.entities.forEach((ent, idx) => {
    if (ent.type.includes('POLYLINE')) {
      let bulgeCount = 0;
      ent.vertices.forEach(v => {
        if (v.bulge && v.bulge !== 0) bulgeCount++;
      });
      console.log(`Frame Polyline #${idx}: ${ent.vertices.length} vertices, ${bulgeCount} bulges`);
    }
  });
} else {
  console.log("No frame block found");
}

// Let's also look at all shapes we collected in create_profile_f103.mjs
// to see if we can find other blocks that might have bulges.
console.log("Listing all blocks in dxf blocks keys:");
console.log(Object.keys(dxf.blocks || {}));
