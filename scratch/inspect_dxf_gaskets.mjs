import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_MOVABLEPOST_MAIN_OPENING_LEFT.dxf";

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

  const layerEntities = {};

  function collectEntities(entities, tx) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
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
          collectEntities(block.entities, nextTx);
        }
      } else {
        const layer = ent.layer || 'unknown';
        if (!layerEntities[layer]) {
          layerEntities[layer] = [];
        }
        layerEntities[layer].push({ entity: ent, tx });
      }
    });
  }

  collectEntities(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

  console.log("=== DXF Layers and Bounds ===");
  for (const [layerName, items] of Object.entries(layerEntities)) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    items.forEach(({ entity, tx }) => {
      if (entity.vertices) {
        entity.vertices.forEach(v => {
          const p = transformPoint(v, tx);
          if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
        });
      } else if (entity.center && entity.radius) {
        const c = transformPoint(entity.center, tx);
        const r = entity.radius;
        if (c.x - r < minX) minX = c.x - r; if (c.x + r > maxX) maxX = c.x + r;
        if (c.y - r < minY) minY = c.y - r; if (c.y + r > maxY) maxY = c.y + r;
      }
    });
    console.log(`Layer: ${layerName.padEnd(25)} entities=${items.length} X: [${minX.toFixed(2)}, ${maxX.toFixed(2)}] Y: [${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);
  }
}

main();
