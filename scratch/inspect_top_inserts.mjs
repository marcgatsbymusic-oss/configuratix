import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";

function main() {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  console.log("=== TOP-LEVEL INSERTS IN MODEL SPACE ===");
  dxf.entities.forEach((ent, idx) => {
    if (ent.type === 'INSERT') {
      console.log(`Insert #${idx}: name="${ent.name}", pos=(${ent.position?.x}, ${ent.position?.y}), rotation=${ent.rotation}, scale=(${ent.xScale}, ${ent.yScale})`);
    }
  });
}

main();
