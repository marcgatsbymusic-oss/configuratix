import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH.dxf";
const text = fs.readFileSync(file, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

console.log("Blocks keys:", Object.keys(dxf.blocks));
for (const [name, block] of Object.entries(dxf.blocks)) {
  if (block.entities) {
    const layerCounts = {};
    const typeCounts = {};
    block.entities.forEach(e => {
      layerCounts[e.layer] = (layerCounts[e.layer] || 0) + 1;
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });
    console.log(`Block "${name}":`);
    console.log(`  Layers:`, layerCounts);
    console.log(`  Types:`, typeCounts);
  }
}
