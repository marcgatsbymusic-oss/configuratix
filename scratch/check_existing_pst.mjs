import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";

try {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  function transformPoint(pt, tx) {
    const localRot = (tx.rotation || 0) * Math.PI / 180;
    const scaleX = tx.scaleX === undefined ? 1 : tx.scaleX;
    const scaleY = tx.scaleY === undefined ? 1 : tx.scaleY;
    
    let xs = pt.x * scaleX;
    let ys = pt.y * scaleY;
    let xr = xs * Math.cos(localRot) - ys * Math.sin(localRot);
    let yr = xs * Math.sin(localRot) + ys * Math.cos(localRot);
    return { x: xr + tx.x, y: yr + tx.y };
  }

  function findInserts(entities, tx, targetName) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const localRot = ent.rotation || 0;
        const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
        const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;
        const posT = transformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
        
        const nextTx = {
          x: posT.x,
          y: posT.y,
          rotation: tx.rotation + localRot,
          scaleX: tx.scaleX * localScaleX,
          scaleY: tx.scaleY * localScaleY
        };

        if (ent.name === targetName || ent.name.includes(targetName)) {
          console.log(`Matched Insert: block="${ent.name}" worldPos=(${posT.x.toFixed(2)}, ${posT.y.toFixed(2)}) scale=(${nextTx.scaleX.toFixed(2)}, ${nextTx.scaleY.toFixed(2)})`);
        }

        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          findInserts(block.entities, nextTx, targetName);
        }
      }
    });
  }

  console.log("=== Finding U000BEC030_B inserts ===");
  findInserts(dxf.entities, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, "U000BEC030_B");

  console.log("=== Finding all block inserts in IGLS ===");
  function findActiveInserts(entities, tx) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const localRot = ent.rotation || 0;
        const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
        const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;
        const posT = transformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
        
        const nextTx = {
          x: posT.x,
          y: posT.y,
          rotation: tx.rotation + localRot,
          scaleX: tx.scaleX * localScaleX,
          scaleY: tx.scaleY * localScaleY
        };

        console.log(`Insert: block="${ent.name}" worldPos=(${posT.x.toFixed(2)}, ${posT.y.toFixed(2)})`);

        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          findActiveInserts(block.entities, nextTx);
        }
      }
    });
  }
  findActiveInserts(dxf.entities, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });

} catch (err) {
  console.error(err);
}
