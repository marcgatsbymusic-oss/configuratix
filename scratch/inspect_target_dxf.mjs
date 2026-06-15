import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";
try {
  const fileText = fs.readFileSync(file, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  console.log("=== TARGET DXF ANALYSIS ===");
  console.log(`Entities count in main: ${dxf.entities.length}`);
  
  const mainLayers = {};
  dxf.entities.forEach(ent => {
    if (!mainLayers[ent.layer]) {
      mainLayers[ent.layer] = { count: 0, types: new Set() };
    }
    mainLayers[ent.layer].count++;
    mainLayers[ent.layer].types.add(ent.type);
  });
  console.log("\nMain entities layers and types:");
  console.log(Object.fromEntries(
    Object.entries(mainLayers).map(([k, v]) => [k, { count: v.count, types: Array.from(v.types) }])
  ));

  console.log("\nInsert entities:");
  dxf.entities.forEach((ent, idx) => {
    if (ent.type === 'INSERT') {
      console.log(`- Insert #${idx}: block name = "${ent.name}" at position:`, ent.position, `scale:`, {x: ent.xScale, y: ent.yScale, z: ent.zScale}, `rotation:`, ent.rotation);
    }
  });

  console.log("\nBlocks list:");
  const blockNames = Object.keys(dxf.blocks || {});
  console.log(blockNames);

  blockNames.forEach(name => {
    const block = dxf.blocks[name];
    console.log(`\nBlock "${name}" has ${block.entities ? block.entities.length : 0} entities.`);
    if (block.entities && block.entities.length > 0) {
      const blockLayers = new Set();
      const blockEntTypes = new Set();
      block.entities.forEach(e => {
        blockLayers.add(e.layer);
        blockEntTypes.add(e.type);
      });
      console.log(`  Layers in block:`, Array.from(blockLayers));
      console.log(`  Entity types in block:`, Array.from(blockEntTypes));
    }
  });
} catch (e) {
  console.error("Error parsing DXF:", e);
}
