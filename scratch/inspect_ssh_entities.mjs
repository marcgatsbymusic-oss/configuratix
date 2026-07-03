import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  const sshEnts = [];

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

  function collect(entities, tx) {
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
          collect(block.entities, nextTx);
        }
      } else if (ent.layer === 'SSH') {
        sshEnts.push({ entity: ent, tx });
      }
    });
  }
  collect(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

  console.log(`SSH Layer has ${sshEnts.length} entities:`);
  sshEnts.forEach(({ entity, tx }, idx) => {
    console.log(`Entity ${idx}: type=${entity.type} verticesCount=${entity.vertices?.length} closed=${entity.shape || (entity.flag & 1)}`);
    if (entity.vertices) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      entity.vertices.forEach(v => {
        const pt = transformPoint(v, tx);
        if (pt.x < minX) minX = pt.x; if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y; if (pt.y > maxY) maxY = pt.y;
      });
      console.log(`  transformed bounds: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}] Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);
    }
  });

} catch (err) {
  console.error(err);
}
