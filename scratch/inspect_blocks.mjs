import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

console.log("Dumping details of all blocks:");
for (const [name, block] of Object.entries(dxf.blocks || {})) {
  console.log(`\n========================================`);
  console.log(`Block Name: "${name}"`);
  console.log(`Entities count: ${block.entities ? block.entities.length : 0}`);
  if (block.entities) {
    const counts = {};
    block.entities.forEach(ent => {
      counts[ent.type] = (counts[ent.type] || 0) + 1;
    });
    console.log(`Entity types:`, counts);

    // List all entities details
    block.entities.forEach((ent, idx) => {
      console.log(`  Entity #${idx}: type=${ent.type}, layer="${ent.layer}", colorIndex=${ent.colorIndex}`);
      if (ent.type === 'INSERT') {
        console.log(`    -> INSERT block "${ent.name}"`);
      } else if (ent.type.includes('POLYLINE')) {
        console.log(`    -> Vertices count: ${ent.vertices ? ent.vertices.length : 0}`);
      }
    });
  }
}
