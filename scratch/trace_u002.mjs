import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH.dxf";
const text = fs.readFileSync(file, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

function findInserts(entities, parentName = "root") {
  entities.forEach(ent => {
    if (ent.type === 'INSERT') {
      console.log(`Found INSERT of "${ent.name}" in block/root "${parentName}" at position x=${ent.position?.x}, y=${ent.position?.y}, rotation=${ent.rotation}`);
      const subBlock = dxf.blocks[ent.name];
      if (subBlock && subBlock.entities) {
        findInserts(subBlock.entities, ent.name);
      }
    }
  });
}

findInserts(dxf.entities);
