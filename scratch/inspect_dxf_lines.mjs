import fs from 'fs';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH.dxf";
const content = fs.readFileSync(file, 'utf-8');
const lines = content.split(/\r?\n/);

function showLines(centerLine, range = 20) {
  console.log(`\n=== Lines around ${centerLine} ===`);
  const start = Math.max(0, centerLine - range);
  const end = Math.min(lines.length - 1, centerLine + range);
  for (let i = start; i <= end; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}

showLines(2666, 15);
showLines(26068, 15);
