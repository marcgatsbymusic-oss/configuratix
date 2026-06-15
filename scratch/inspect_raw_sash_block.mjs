import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";

try {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  const block = dxf.blocks["40011"];
  console.log(`Block 40011 (Door_Frame) has ${block.entities?.length || 0} entities.`);
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  block.entities.forEach(ent => {
    const verts = ent.vertices || (ent.center ? [ent.center] : []);
    verts.forEach(p => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    });
  });
  console.log(`Local bounds of 40011: X=[${minX.toFixed(4)}, ${maxX.toFixed(4)}], Y=[${minY.toFixed(4)}, ${maxY.toFixed(4)}]`);

  // Trace inserts of 40011
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

        if (ent.name === "40011") {
          console.log(`\nFound Insert of 40011: path="${currentPath}"`);
          console.log(`  Position local: (${ent.position.x}, ${ent.position.y})`);
          console.log(`  Position parent-world: (${worldPos.x.toFixed(4)}, ${worldPos.y.toFixed(4)})`);
          console.log(`  Scale accumulated: (${nextTx.scaleX.toFixed(4)}, ${nextTx.scaleY.toFixed(4)})`);
          console.log(`  Rotation accumulated: ${nextTx.rotation.toFixed(4)}`);

          const localCorners = [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY }
          ];

          function transformPoint(pt, t) {
            const rotRad = (t.rotation || 0) * Math.PI / 180;
            let sx = pt.x * t.scaleX;
            let sy = pt.y * t.scaleY;
            let rx = sx * Math.cos(rotRad) - sy * Math.sin(rotRad);
            let ry = sx * Math.sin(rotRad) + sy * Math.cos(rotRad);
            return { x: rx + t.x, y: ry + t.y };
          }

          const worldCorners = localCorners.map(p => transformPoint(p, nextTx));
          let wMinX = Infinity, wMaxX = -Infinity;
          let wMinY = Infinity, wMaxY = -Infinity;
          worldCorners.forEach(p => {
            if (p.x < wMinX) wMinX = p.x; if (p.x > wMaxX) wMaxX = p.x;
            if (p.y < wMinY) wMinY = p.y; if (p.y > wMaxY) wMaxY = p.y;
          });
          console.log(`  World bounds of this insert: X=[${wMinX.toFixed(4)}, ${wMaxX.toFixed(4)}], Y=[${wMinY.toFixed(4)}, ${wMaxY.toFixed(4)}]`);
        }

        const b = dxf.blocks[ent.name];
        if (b && b.entities) {
          trace(b.entities, nextTx, currentPath);
        }
      }
    });
  }

  trace(dxf.entities, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });

} catch (err) {
  console.error(err);
}
