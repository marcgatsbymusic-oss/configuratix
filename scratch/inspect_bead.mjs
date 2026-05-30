import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

const beadBlock = dxf.blocks["50924 - listwa 22mm"];
if (!beadBlock) {
  console.error("No bead block found");
  process.exit(1);
}

beadBlock.entities.forEach((ent, idx) => {
  if (ent.type.includes('POLYLINE')) {
    console.log(`\nPolyline #${idx}:`);
    console.log(`  Vertices: ${ent.vertices.length}`);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    ent.vertices.forEach(v => {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    });
    console.log(`  Bounds: X=[${minX.toFixed(4)}, ${maxX.toFixed(4)}], Y=[${minY.toFixed(4)}, ${maxY.toFixed(4)}]`);
    console.log(`  Vertices:`, ent.vertices.map(v => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`).join(', '));
  }
});
