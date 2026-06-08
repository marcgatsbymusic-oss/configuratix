import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = 'C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO5_FIXED\\DXF\\IGLO5_FIXED.dxf';
try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  console.log(`Top-level entities:`);
  dxf.entities.forEach((ent, idx) => {
    console.log(`\nEntity #${idx}: ${ent.type} (Layer: "${ent.layer}")`);
    if (ent.type === 'INSERT') {
      console.log(`  Inserts Block: "${ent.name}"`);
      console.log(`  Position: (${ent.position.x}, ${ent.position.y})`);
      console.log(`  Scale: (${ent.xScale || 1}, ${ent.yScale || 1})`);
      console.log(`  Rotation: ${ent.rotation || 0}`);
    }
  });

  console.log(`\nRecursive tree:`);
  function dump(entities, depth = 0) {
    const indent = '  '.repeat(depth);
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        console.log(`${indent}- INSERT block "${ent.name}" at pos (${ent.position.x}, ${ent.position.y}) scale (${ent.xScale || 1}, ${ent.yScale || 1}) rot ${ent.rotation || 0}`);
        const bl = dxf.blocks[ent.name];
        if (bl && bl.entities) dump(bl.entities, depth + 1);
      } else {
        console.log(`${indent}- Entity ${ent.type} on layer "${ent.layer}"`);
      }
    });
  }
  dump(dxf.entities);

} catch (err) {
  console.error(err);
}
