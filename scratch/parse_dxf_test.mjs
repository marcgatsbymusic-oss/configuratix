import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfFilePath = "C:\\Users\\Shadow\\Desktop\\Isolated IGLO 5 Single Window Frame.dxf";

try {
  const fileText = fs.readFileSync(dxfFilePath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  console.log("Analyzing layers for bi-color support (FRM_EXT vs FRM_INT)...\n");

  const layerAnalysis = {};

  dxf.entities.forEach(ent => {
    if (!layerAnalysis[ent.layer]) {
      layerAnalysis[ent.layer] = {
        entities: 0,
        types: new Set(),
        blocks: new Set()
      };
    }
    layerAnalysis[ent.layer].entities++;
    layerAnalysis[ent.layer].types.add(ent.type);
    if (ent.type === 'INSERT') {
      layerAnalysis[ent.layer].blocks.add(ent.name);
    }
  });

  for (const [layerName, data] of Object.entries(layerAnalysis)) {
    console.log(`Layer: ${layerName}`);
    console.log(`  - Entities: ${data.entities}`);
    console.log(`  - Types: ${Array.from(data.types).join(', ')}`);
    if (data.blocks.size > 0) {
      console.log(`  - Blocks: ${Array.from(data.blocks).join(', ')}`);
    }
    console.log("");
  }

} catch (err) {
  console.error("Error parsing DXF:", err);
}
