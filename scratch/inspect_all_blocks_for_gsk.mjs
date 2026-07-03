import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";

const text = fs.readFileSync(INPUT_FILE, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

console.log("=== Checking Blocks for GSK_SSH_INT ===");
Object.entries(dxf.blocks).forEach(([blockName, block]) => {
  if (block.entities) {
    const counts = {};
    block.entities.forEach(ent => {
      counts[ent.layer] = (counts[ent.layer] || 0) + 1;
    });
    if (counts['GSK_SSH_INT']) {
      console.log(`Block "${blockName}" contains ${counts['GSK_SSH_INT']} entities on layer GSK_SSH_INT`);
    }
  }
});

console.log("\n=== Checking Top-Level Entities for GSK_SSH_INT ===");
const topCounts = {};
dxf.entities.forEach(ent => {
  topCounts[ent.layer] = (topCounts[ent.layer] || 0) + 1;
});
if (topCounts['GSK_SSH_INT']) {
  console.log(`Top-level has ${topCounts['GSK_SSH_INT']} entities on layer GSK_SSH_INT`);
} else {
  console.log("No top-level entities on layer GSK_SSH_INT");
}
