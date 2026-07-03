import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  console.log(`Top-level entities:`);
  dxf.entities.forEach((ent, idx) => {
    console.log(`  Ent ${idx}: type=${ent.type} layer=${ent.layer} name=${ent.name || ''} position=${ent.position ? JSON.stringify(ent.position) : ''}`);
  });

  console.log(`\nBlocks definitions:`);
  Object.entries(dxf.blocks).forEach(([name, block]) => {
    const layers = new Set();
    block.entities?.forEach(e => layers.add(e.layer));
    console.log(`  Block ${name}: entitiesCount=${block.entities?.length} layers=[${Array.from(layers).join(', ')}]`);
  });

} catch (err) {
  console.error(err);
}
