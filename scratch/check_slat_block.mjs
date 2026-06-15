import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  const block = dxf.blocks['póro 37mm'];
  if (!block) {
    console.error("Block not found");
    process.exit(1);
  }

  console.log(`Entity count: ${block.entities.length}`);
  
  block.entities.forEach((ent, idx) => {
    if (idx < 5) {
      console.log(`Entity ${idx}: Type=${ent.type}, Layer=${ent.layer}`);
      if (ent.type === 'LINE') {
        console.log(`  Line: (${ent.start.x}, ${ent.start.y}) -> (${ent.end.x}, ${ent.end.y})`);
      } else if (ent.type === 'ARC') {
        console.log(`  Arc: Center=(${ent.center.x}, ${ent.center.y}), Radius=${ent.radius}, Start=${ent.startAngle}, End=${ent.endAngle}`);
      }
    }
  });

} catch (err) {
  console.error(err);
}
