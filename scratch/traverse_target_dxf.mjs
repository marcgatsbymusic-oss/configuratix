import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH.dxf";
try {
  const fileText = fs.readFileSync(file, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  console.log("=== RECURSIVE HIERARCHY TRAVERSAL ===");

  function traverse(ent, indent = 0, tx = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }) {
    const space = " ".repeat(indent);
    if (ent.type === 'INSERT') {
      const block = dxf.blocks[ent.name];
      console.log(`${space}- INSERT blockName="${ent.name}" at (${ent.position.x}, ${ent.position.y}) rot=${ent.rotation || 0} scale=(${ent.xScale || 1}, ${ent.yScale || 1})`);
      if (block && block.entities) {
        block.entities.forEach(child => {
          traverse(child, indent + 2);
        });
      } else {
        console.log(`${space}  (Block not found or has no entities)`);
      }
    } else {
      console.log(`${space}- ENTITY type="${ent.type}" layer="${ent.layer}"`);
    }
  }

  dxf.entities.forEach((ent, idx) => {
    console.log(`\nMain Entity #${idx}:`);
    traverse(ent);
  });
} catch (e) {
  console.error(e);
}
