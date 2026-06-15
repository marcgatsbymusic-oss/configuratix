import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";

function main() {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  for (const name of ["U-001", "U000BEC030_B", "U-010_B1"]) {
    const block = dxf.blocks[name];
    if (!block) {
      console.log(`Block ${name} not found`);
      continue;
    }
    console.log(`\n=== BLOCK ${name} ===`);
    console.log(`Entities count: ${block.entities.length}`);
    
    // Find bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    block.entities.forEach(ent => {
      if (ent.vertices) {
        ent.vertices.forEach(v => {
          if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
          if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
        });
      }
    });
    console.log(`Local bounds: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);
    console.log(`Width: ${(maxX - minX).toFixed(2)}, Height: ${(maxY - minY).toFixed(2)}`);
  }
}

main();
