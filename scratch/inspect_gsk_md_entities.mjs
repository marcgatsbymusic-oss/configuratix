import fs from 'fs';
import path from 'path';
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

  const rawGeoms = [];

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
        if (ent.layer === 'IGE_GSK_MD_SSH') {
          rawGeoms.push({ entity: ent, tx });
        }
      }
    });
  }

  collectEntities(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

  console.log(`Found ${rawGeoms.length} entities in IGE_GSK_MD_SSH:`);
  rawGeoms.forEach((g, idx) => {
    const ent = g.entity;
    console.log(`  Entity ${idx}: type=${ent.type}`);
    if (ent.vertices) {
      console.log(`    vertices count=${ent.vertices.length}`);
      ent.vertices.forEach((v, vi) => {
        const p = transformPoint(v, g.tx);
        console.log(`      v ${vi}: x=${p.x.toFixed(4)}, y=${p.y.toFixed(4)}, bulge=${v.bulge}`);
      });
    }
  });
}

main();
