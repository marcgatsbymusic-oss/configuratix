import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  const block = dxf.blocks['póro 37mm'];
  const lineEnt = block.entities.find(e => e.type === 'LINE');
  console.log("LINE keys:", Object.keys(lineEnt));
  console.log("LINE values:", JSON.stringify(lineEnt, null, 2));

} catch (err) {
  console.error(err);
}
