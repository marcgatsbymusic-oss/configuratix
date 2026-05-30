import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

console.log("Top-level entities count:", dxf.entities.length);
dxf.entities.forEach((ent, idx) => {
  console.log(`Entity #${idx}: type=${ent.type}, layer="${ent.layer}", name="${ent.name || ''}"`);
  if (ent.position) console.log(`  Position:`, ent.position);
});
