import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";
try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  for (const [name, block] of Object.entries(dxf.blocks)) {
    if (name.startsWith('*')) continue;
    console.log(`\nBlock: "${name}", Entity Count: ${block.entities?.length || 0}`);
    const types = {};
    const layers = {};
    block.entities?.forEach(e => {
      types[e.type] = (types[e.type] || 0) + 1;
      layers[e.layer] = (layers[e.layer] || 0) + 1;
    });
    console.log('  Types:', types);
    console.log('  Layers:', layers);
    
    // Let's print bounding box of the block's entities
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    block.entities?.forEach(ent => {
      if (ent.type === 'LINE') {
        minX = Math.min(minX, ent.x1, ent.x2);
        maxX = Math.max(maxX, ent.x1, ent.x2);
        minY = Math.min(minY, ent.y1, ent.y2);
        maxY = Math.max(maxY, ent.y1, ent.y2);
      } else if (ent.type === 'LWPOLYLINE') {
        ent.vertices.forEach(v => {
          minX = Math.min(minX, v.x);
          maxX = Math.max(maxX, v.x);
          minY = Math.min(minY, v.y);
          maxY = Math.max(maxY, v.y);
        });
      }
    });
    console.log(`  Bounds: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}] (W=${(maxX-minX).toFixed(2)}), Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}] (H=${(maxY-minY).toFixed(2)})`);
  }

} catch (err) {
  console.error(err);
}
