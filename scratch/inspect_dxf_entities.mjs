import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = 'C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO5_FIXED\\DXF\\IGLO5_FIXED.dxf';
try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  Object.entries(dxf.blocks).forEach(([blockName, block]) => {
    if (blockName.startsWith('*')) return; // skip model/paper space
    console.log(`\n=============================================`);
    console.log(`BLOCK: "${blockName}"`);
    console.log(`=============================================`);
    if (!block.entities) {
      console.log('No entities');
      return;
    }

    block.entities.forEach((ent, idx) => {
      console.log(`\n  Entity #${idx}: ${ent.type} (Layer: "${ent.layer}")`);
      if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
        const verts = ent.vertices || [];
        console.log(`    Vertices: ${verts.length}`);
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        verts.forEach(v => {
          if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
          if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
        });
        console.log(`    Bounds: X[${minX.toFixed(3)} -> ${maxX.toFixed(3)}] Y[${minY.toFixed(3)} -> ${maxY.toFixed(3)}]`);
        console.log(`    First pt: (${verts[0]?.x?.toFixed(3)}, ${verts[0]?.y?.toFixed(3)})`);
      } else if (ent.type === 'LINE') {
        console.log(`    Vertices: ${ent.vertices?.length || 0}`);
        if (ent.vertices) {
          console.log(`    Start: (${ent.vertices[0].x.toFixed(3)}, ${ent.vertices[0].y.toFixed(3)})`);
          console.log(`    End: (${ent.vertices[1].x.toFixed(3)}, ${ent.vertices[1].y.toFixed(3)})`);
        }
      } else if (ent.type === 'ARC') {
        console.log(`    Center: (${ent.center.x.toFixed(3)}, ${ent.center.y.toFixed(3)}) Radius: ${ent.radius.toFixed(3)}`);
      }
    });
  });

} catch (err) {
  console.error(err);
}
