import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";

try {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  console.log("=== NESTED INSERT TREE FOR EDGE_SL_1 ===");
  
  function dumpInsert(ent, depth = 0, tx = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }) {
    const indent = "  ".repeat(depth);
    const localRot = ent.rotation || 0;
    const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
    const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;
    
    // transform position
    const localRotRad = (tx.rotation || 0) * Math.PI / 180;
    let xs = (ent.position.x || 0) * tx.scaleX;
    let ys = (ent.position.y || 0) * tx.scaleY;
    let xr = xs * Math.cos(localRotRad) - ys * Math.sin(localRotRad);
    let yr = xs * Math.sin(localRotRad) + ys * Math.cos(localRotRad);
    const worldPos = { x: xr + tx.x, y: yr + tx.y };
    
    const nextTx = {
      x: worldPos.x,
      y: worldPos.y,
      rotation: tx.rotation + localRot,
      scaleX: tx.scaleX * localScaleX,
      scaleY: tx.scaleY * localScaleY
    };

    console.log(`${indent}- INSERT Block: "${ent.name}"`);
    console.log(`${indent}  Local Pos: (${ent.position.x}, ${ent.position.y}), Scale: (${localScaleX}, ${localScaleY}), Rot: ${localRot}`);
    console.log(`${indent}  World Pos: (${worldPos.x.toFixed(4)}, ${worldPos.y.toFixed(4)}), Acc. Scale: (${nextTx.scaleX.toFixed(4)}, ${nextTx.scaleY.toFixed(4)}), Acc. Rot: ${nextTx.rotation.toFixed(4)}`);

    const block = dxf.blocks[ent.name];
    if (block && block.entities) {
      block.entities.forEach(child => {
        if (child.type === 'INSERT') {
          dumpInsert(child, depth + 1, nextTx);
        } else {
          // print other types
          console.log(`${indent}    * ${child.type} (layer: "${child.layer}")`);
        }
      });
    }
  }

  dxf.entities.forEach((ent, idx) => {
    if (ent.type === 'INSERT') {
      console.log(`Top-level insert #${idx}:`);
      dumpInsert(ent, 0, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });
    }
  });

} catch (err) {
  console.error("Error:", err);
}
