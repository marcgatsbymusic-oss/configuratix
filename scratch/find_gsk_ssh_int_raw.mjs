import fs from 'fs';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";
const text = fs.readFileSync(dxfPath, 'utf8');

const lines = text.split(/\r?\n/);
let matchCount = 0;

console.log("=== Searching for GSK_SSH_INT in raw DXF ===");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('GSK_SSH_INT')) {
    matchCount++;
    console.log(`Line ${i}: "${lines[i]}"`);
    // Print 5 lines before and after
    const start = Math.max(0, i - 4);
    const end = Math.min(lines.length - 1, i + 6);
    for (let j = start; j <= end; j++) {
      console.log(`  ${j === i ? '=>' : '  '} ${j}: ${lines[j]}`);
    }
  }
}
console.log(`Total occurrences: ${matchCount}`);
