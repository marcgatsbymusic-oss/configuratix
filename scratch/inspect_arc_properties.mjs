import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH.dxf";
try {
  const fileText = fs.readFileSync(file, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  let foundArc = null;
  
  function findArc(entities) {
    for (const ent of entities) {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          const res = findArc(block.entities);
          if (res) return res;
        }
      } else if (ent.type === 'ARC') {
        return ent;
      }
    }
    return null;
  }

  const arc = findArc(dxf.entities);
  console.log("=== ARC ENTITY PROPERTIES ===");
  console.log(JSON.stringify(arc, null, 2));
} catch (e) {
  console.error(e);
}
