import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH.dxf";

try {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

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

  console.log('\nAll layers in IGE_FRM_SSH.dxf:');
  console.log(JSON.stringify(
    Object.fromEntries(
      Object.entries(allLayers).map(([k, v]) => [k, { count: v.count, types: Array.from(v.types) }])
    ), null, 2
  ));
} catch (err) {
  console.error(err);
}
