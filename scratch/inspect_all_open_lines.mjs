import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";

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

const entities = [];
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
    } else {
      entities.push({ ent, tx });
    }
  });
}
collect(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

console.log(`Total resolved entities: ${entities.length}`);

// We want to search for any entity whose bounding box is near:
// X range: 100 to 200
// Y range: 10 to 30
// Let's print all entities in this area!
entities.forEach((item, idx) => {
  const ent = item.ent;
  const tx = item.tx;
  const pts = [];
  if (ent.type === 'LINE') {
    pts.push(transformPoint(ent.vertices[0], tx));
    pts.push(transformPoint(ent.vertices[1], tx));
  } else if (ent.type === 'ARC' || ent.type === 'CIRCLE') {
    const cx = ent.center?.x ?? 0;
    const cy = ent.center?.y ?? 0;
    const r = ent.radius ?? 0;
    pts.push(transformPoint({ x: cx - r, y: cy - r }, tx));
    pts.push(transformPoint({ x: cx + r, y: cy + r }, tx));
  } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
    ent.vertices.forEach(v => pts.push(transformPoint(v, tx)));
  }

  if (pts.length > 0) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts.forEach(p => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    });

    if (minX >= 90 && maxX <= 210 && minY >= 10 && maxY <= 35) {
      console.log(`Entity ${idx}: layer="${ent.layer}" type="${ent.type}" bounds: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}] Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);
    }
  }
});
