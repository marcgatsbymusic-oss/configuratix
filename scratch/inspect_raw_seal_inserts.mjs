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

  const activeInserts = [];

  function trace(entities, tx, path = "ROOT") {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const localRot = ent.rotation || 0;
        const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
        const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;
        
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

        const currentPath = `${path} -> ${ent.name}`;

        // Check if the insert world position (or a block offset) lies in the active region
        if (worldPos.x >= -50 && worldPos.x <= 250 && worldPos.y >= -50 && worldPos.y <= 250) {
          activeInserts.push({
            path: currentPath,
            worldPos,
            scale: { x: nextTx.scaleX, y: nextTx.scaleY },
            rotation: nextTx.rotation
          });
        }

        const b = dxf.blocks[ent.name];
        if (b && b.entities) {
          trace(b.entities, nextTx, currentPath);
        }
      }
    });
  }

  trace(dxf.entities, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });

  console.log("=== ACTIVE INSERTS IN REGION [-50, 250] ===");
  activeInserts.forEach(ins => {
    console.log(`- Path: "${ins.path}"`);
    console.log(`  WorldPos: (${ins.worldPos.x.toFixed(2)}, ${ins.worldPos.y.toFixed(2)})`);
    console.log(`  Scale: (${ins.scale.x.toFixed(2)}, ${ins.scale.y.toFixed(2)}), Rot: ${ins.rotation.toFixed(2)}`);
  });

} catch (err) {
  console.error(err);
}
