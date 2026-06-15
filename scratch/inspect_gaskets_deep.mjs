import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";

try {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  console.log("=== DEEP INSPECTION FOR U000BEC030_B ===");

  const block = dxf.blocks["U000BEC030_B"];
  if (!block) {
    console.log("Block U000BEC030_B not found!");
    process.exit(1);
  }

  console.log(`Block U000BEC030_B has ${block.entities ? block.entities.length : 0} entities.`);
  
  // Find bounds of entities in local space
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  block.entities.forEach((ent, idx) => {
    if (idx < 5) {
      console.log(`Entity #${idx}: type=${ent.type}, layer=${ent.layer}, vertices=`, ent.vertices || ent.center);
    }
    const verts = ent.vertices || (ent.center ? [ent.center] : []);
    verts.forEach(p => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    });
  });

  console.log(`Local bounds of U000BEC030_B: X=[${minX}, ${maxX}], Y=[${minY}, ${maxY}]`);

  // Now trace all inserts of this block and their parent transforms
  function trace(entities, tx, path = "") {
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

        const currentPath = path ? `${path} -> ${ent.name}` : ent.name;

        if (ent.name === "U000BEC030_B") {
          console.log(`\nFound Insert: path="${currentPath}"`);
          console.log(`  Position local: (${ent.position.x}, ${ent.position.y})`);
          console.log(`  Position parent-world: (${worldPos.x.toFixed(4)}, ${worldPos.y.toFixed(4)})`);
          console.log(`  Scale accumulated: (${nextTx.scaleX.toFixed(4)}, ${nextTx.scaleY.toFixed(4)})`);
          console.log(`  Rotation accumulated: ${nextTx.rotation.toFixed(4)}`);

          // Let's transform local bounds of the block to world coordinates
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
          console.log(`  Computed World bounds of this insert: X=[${wMinX.toFixed(4)}, ${wMaxX.toFixed(4)}], Y=[${wMinY.toFixed(4)}, ${wMaxY.toFixed(4)}]`);
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
