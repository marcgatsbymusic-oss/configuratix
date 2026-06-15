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

  function collect(entities, tx, path = []) {
    entities.forEach((ent, idx) => {
      if (ent.type === 'INSERT') {
        const nextTx = {
          x: ent.position.x || 0,
          y: ent.position.y || 0,
          rotation: ent.rotation || 0,
          scaleX: (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale,
          scaleY: (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale
        };
        // transform insertion position by parent tx
        const worldPos = transformPoint(nextTx, tx);
        const cumTx = {
          x: worldPos.x,
          y: worldPos.y,
          rotation: tx.rotation + nextTx.rotation,
          scaleX: tx.scaleX * nextTx.scaleX,
          scaleY: tx.scaleY * nextTx.scaleY
        };
        collect(dxf.blocks[ent.name].entities, cumTx, [...path, `${ent.name}(pos: ${ent.position.x}, ${ent.position.y})`]);
      } else {
        // Check if any vertex falls in active region
        let hasActive = false;
        let pts = [];
        if (ent.vertices) {
          ent.vertices.forEach(v => {
            const p = transformPoint(v, tx);
            pts.push(p);
            if (p.x >= -10 && p.x <= 200 && p.y >= -10 && p.y <= 200) {
              hasActive = true;
            }
          });
        }
        if (hasActive) {
          console.log(`Active Entity Type: ${ent.type}, Layer: ${ent.layer}`);
          console.log("  Path:", path.join(" -> "));
          console.log("  World bounds of entity: X: [", Math.min(...pts.map(p => p.x)).toFixed(2), ",", Math.max(...pts.map(p => p.x)).toFixed(2), "] Y: [", Math.min(...pts.map(p => p.y)).toFixed(2), ",", Math.max(...pts.map(p => p.y)).toFixed(2), "]");
        }
      }
    });
  }

  collect(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });
}

main();
