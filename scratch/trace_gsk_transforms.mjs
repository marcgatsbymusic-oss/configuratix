import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";

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

function main() {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  console.log("Tracing insert chain for U000BEC030_B...");

  function trace(entities, tx, path = []) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const nextPath = [...path, ent.name];
        if (ent.name === 'U000BEC030_B') {
          console.log("FOUND U000BEC030_B!");
          console.log("Path:", nextPath.join(" -> "));
          console.log("Accumulated tx up to here:", tx);
          console.log("U000BEC030_B details:", {
            position: ent.position,
            rotation: ent.rotation,
            xScale: ent.xScale,
            yScale: ent.yScale
          });
          
          const localRot = ent.rotation || 0;
          const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
          const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;
          const posT = transformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
          
          const finalTx = {
            x: posT.x,
            y: posT.y,
            rotation: tx.rotation + localRot,
            scaleX: tx.scaleX * localScaleX,
            scaleY: tx.scaleY * localScaleY
          };
          console.log("Final tx for entities:", finalTx);

          // Let's transform a local block point to world coordinates
          const localPt = { x: 10650, y: 4480 };
          const worldPt = transformPoint(localPt, finalTx);
          console.log(`Test point local (${localPt.x}, ${localPt.y}) -> world (${worldPt.x.toFixed(4)}, ${worldPt.y.toFixed(4)})`);
        }
        
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
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
          trace(block.entities, nextTx, nextPath);
        }
      }
    });
  }

  trace(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });
}

main();
