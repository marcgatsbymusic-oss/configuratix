import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function transformPoint(pt, tx) {
  const localRot = (tx.rotation || 0) * Math.PI / 180;
  const scaleX = tx.scaleX === undefined ? 1 : tx.scaleX;
  const scaleY = tx.scaleY === undefined ? 1 : tx.scaleY;
  return {
    x: pt.x * scaleX * Math.cos(localRot) - pt.y * scaleY * Math.sin(localRot) + tx.x,
    y: pt.x * scaleX * Math.sin(localRot) + pt.y * scaleY * Math.cos(localRot) + tx.y
  };
}

const text = fs.readFileSync(INPUT_FILE, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

const entities = dxf.entities;
const gskEnts = [];

function collect(ents, tx) {
  ents.forEach(ent => {
    if (ent.type === 'INSERT') {
      const block = dxf.blocks[ent.name];
      if (block && block.entities) {
        const localRot = ent.rotation || 0;
        const localScaleX = ent.xScale || 1;
        const localScaleY = ent.yScale || 1;
        const posT = transformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
        const nextTx = {
          x: posT.x,
          y: posT.y,
          rotation: tx.rotation + localRot,
          scaleX: tx.scaleX * localScaleX,
          scaleY: tx.scaleY * localScaleY
        };
        collect(block.entities, nextTx);
      }
    } else if (ent.layer === 'GSK_PST_EXT') {
      gskEnts.push({ ent, tx });
    }
  });
}

collect(entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

console.log(`Found ${gskEnts.length} entities on GSK_PST_EXT`);
gskEnts.forEach((item, idx) => {
  console.log(`Entity ${idx}: type=${item.ent.type}`);
  if (item.ent.vertices) {
    console.log(`  Vertices count: ${item.ent.vertices.length}`);
    item.ent.vertices.forEach((v, vIdx) => {
      const p = transformPoint(v, item.tx);
      console.log(`    v${vIdx}: (${p.x.toFixed(4)}, ${p.y.toFixed(4)})`);
    });
  }
});
