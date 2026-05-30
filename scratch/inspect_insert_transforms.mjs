import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

function printInserts(blockName) {
  const block = dxf.blocks[blockName];
  if (!block || !block.entities) return;
  console.log(`\nInserts in block "${blockName}":`);
  block.entities.forEach(ent => {
    if (ent.type === 'INSERT') {
      console.log(`- INSERT name="${ent.name}", pos=(${ent.position.x}, ${ent.position.y}), scale=(${ent.xScale || 1}, ${ent.yScale || 1}, ${ent.zScale || 1}), rot=${ent.rotation || 0}`);
    }
  });
}

printInserts("złożenie 01");
printInserts("rama 01");
printInserts("skrzydło 01");
