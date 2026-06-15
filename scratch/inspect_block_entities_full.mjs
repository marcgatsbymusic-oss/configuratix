import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";
try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  for (const [name, block] of Object.entries(dxf.blocks)) {
    if (name.startsWith('*')) continue;
    console.log(`\n===================================`);
    console.log(`Block: "${name}"`);
    console.log(`===================================`);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    function updateBounds(x, y) {
      if (typeof x === 'number' && !isNaN(x)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
      if (typeof y === 'number' && !isNaN(y)) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }

    block.entities?.forEach((ent, idx) => {
      console.log(`  Entity ${idx}: Type=${ent.type}, Layer=${ent.layer}`);
      if (ent.type === 'LINE') {
        updateBounds(ent.x1, ent.y1);
        updateBounds(ent.x2, ent.y2);
      } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
        ent.vertices?.forEach(v => {
          updateBounds(v.x, v.y);
        });
      } else if (ent.type === 'ARC') {
        // approximate arc with center + radius
        const cx = ent.center?.x ?? ent.cx ?? 0;
        const cy = ent.center?.y ?? ent.cy ?? 0;
        const r = ent.radius ?? ent.r ?? 0;
        updateBounds(cx - r, cy - r);
        updateBounds(cx + r, cy + r);
      } else if (ent.type === 'CIRCLE') {
        const cx = ent.center?.x ?? ent.cx ?? 0;
        const cy = ent.center?.y ?? ent.cy ?? 0;
        const r = ent.radius ?? ent.r ?? 0;
        updateBounds(cx - r, cy - r);
        updateBounds(cx + r, cy + r);
      }
    });

    console.log(`  Final Computed Bounds: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}] (W=${(maxX-minX).toFixed(2)}), Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}] (H=${(maxY-minY).toFixed(2)})`);
  }

} catch (err) {
  console.error(err);
}
