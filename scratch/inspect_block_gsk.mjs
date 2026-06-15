import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";

function main() {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  const block = dxf.blocks["U000BEC030_B"];
  if (!block) {
    console.log("Block U000BEC030_B not found!");
    return;
  }

  console.log(`Block U000BEC030_B: name=${block.name}, position=(${block.position?.x}, ${block.position?.y})`);
  console.log("Entities count:", block.entities?.length);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  block.entities.forEach((ent, idx) => {
    if (ent.vertices) {
      ent.vertices.forEach(v => {
        if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
        if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
      });
    } else if (ent.center && ent.radius) {
      const c = ent.center;
      const r = ent.radius;
      if (c.x - r < minX) minX = c.x - r; if (c.x + r > maxX) maxX = c.x + r;
      if (c.y - r < minY) minY = c.y - r; if (c.y + r > maxY) maxY = c.y + r;
    }
  });

  console.log(`Local bounds of block entities: X=[${minX}, ${maxX}] Y=[${minY}, ${maxY}]`);
}

main();
