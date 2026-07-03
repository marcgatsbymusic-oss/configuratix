import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";
const text = fs.readFileSync(dxfPath, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

console.log("=== Searching for U-002 inserts in DXF ===");
const inserts = [];

function findInserts(entities, tx) {
  entities.forEach(ent => {
    if (ent.type === 'INSERT') {
      const localRot = ent.rotation || 0;
      const localScaleX = ent.xScale || 1;
      const localScaleY = ent.yScale || 1;
      const posT = {
        x: ent.position.x * tx.scaleX * Math.cos(tx.rotation * Math.PI / 180) - ent.position.y * tx.scaleY * Math.sin(tx.rotation * Math.PI / 180) + tx.x,
        y: ent.position.x * tx.scaleX * Math.sin(tx.rotation * Math.PI / 180) + ent.position.y * tx.scaleY * Math.cos(tx.rotation * Math.PI / 180) + tx.y
      };
      
      const nextTx = {
        x: posT.x,
        y: posT.y,
        rotation: tx.rotation + localRot,
        scaleX: tx.scaleX * localScaleX,
        scaleY: tx.scaleY * localScaleY
      };

      if (ent.name === 'U-002' || ent.name.includes('U-002')) {
        inserts.push({ ent, tx: nextTx });
        console.log(`Found insert: block="${ent.name}" layer="${ent.layer}" pos=(${posT.x.toFixed(4)}, ${posT.y.toFixed(4)}) rot=${nextTx.rotation.toFixed(2)} scale=(${nextTx.scaleX.toFixed(4)}, ${nextTx.scaleY.toFixed(4)})`);
      }

      const block = dxf.blocks[ent.name];
      if (block && block.entities) {
        findInserts(block.entities, nextTx);
      }
    }
  });
}

findInserts(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });
console.log(`Total U-002 inserts: ${inserts.length}`);
