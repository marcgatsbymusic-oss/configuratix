import fs from 'fs';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";
const text = fs.readFileSync(dxfPath, 'utf8');
const lines = text.split(/\r?\n/);

console.log("=== Printing DXF lines 4140 to 4180 ===");
for (let j = 4140; j <= 4180; j++) {
  console.log(`${j}: ${lines[j]}`);
}
