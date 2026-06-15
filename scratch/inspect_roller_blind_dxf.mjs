import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";
try {
  console.log(`Checking path: ${dxfPath}`);
  if (!fs.existsSync(dxfPath)) {
    console.error(`File does not exist at: ${dxfPath}`);
    process.exit(1);
  }
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  console.log(`Top-level entities: ${dxf.entities.length}`);
  console.log(`Blocks: ${Object.keys(dxf.blocks).length}`);

  const blockEntities = {};
  Object.entries(dxf.blocks).forEach(([name, block]) => {
    blockEntities[name] = { count: block.entities?.length || 0, layers: new Set() };
    block.entities?.forEach(ent => {
      blockEntities[name].layers.add(ent.layer);
    });
  });
  console.log('Blocks summary:', Object.fromEntries(
    Object.entries(blockEntities).map(([k, v]) => [k, { count: v.count, layers: Array.from(v.layers) }])
  ));

  const allLayers = {};
  function collect(entities) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const bl = dxf.blocks[ent.name];
        if (bl && bl.entities) collect(bl.entities);
      } else {
        if (!allLayers[ent.layer]) {
          allLayers[ent.layer] = { count: 0, types: new Set() };
        }
        allLayers[ent.layer].count++;
        allLayers[ent.layer].types.add(ent.type);
      }
    });
  }
  collect(dxf.entities);

  console.log('\nAll layers (resolved recursively):');
  console.log(JSON.stringify(
    Object.fromEntries(
      Object.entries(allLayers).map(([k, v]) => [k, { count: v.count, types: Array.from(v.types) }])
    ), null, 2
  ));

} catch (err) {
  console.error(err);
}
