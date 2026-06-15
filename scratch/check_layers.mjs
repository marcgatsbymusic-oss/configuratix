import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH.dxf";

try {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);
  
  const layers = new Set();
  
  function collectLayers(entities) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          collectLayers(block.entities);
        }
      } else {
        if (ent.layer) layers.add(ent.layer);
      }
    });
  }
  
  collectLayers(dxf.entities);
  console.log("Found layers:", Array.from(layers));
} catch (err) {
  console.error(err);
}
