import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  const targetBlock = dxf.blocks['80029+80033+x2_50930A'];
  if (!targetBlock) {
    console.error(`Block 80029+80033+x2_50930A not found!`);
    process.exit(1);
  }

  console.log(`Block 80029+80033+x2_50930A entities:`);
  targetBlock.entities?.forEach((ent, idx) => {
    console.log(`  Ent ${idx}: type=${ent.type} layer=${ent.layer} name=${ent.name || ''} position=${ent.position ? JSON.stringify(ent.position) : ''} scale=${ent.scale ? JSON.stringify(ent.scale) : ''} rotation=${ent.rotation || 0}`);
  });

} catch (err) {
  console.error(err);
}
