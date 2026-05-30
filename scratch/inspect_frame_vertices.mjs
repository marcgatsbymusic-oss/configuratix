import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

const block = dxf.blocks["50001 - rama 66mm"];
const poly = block.entities[0]; // Polyline #0
console.log(`Frame polyline vertices count: ${poly.vertices.length}`);
poly.vertices.forEach((v, idx) => {
  console.log(`  v[${idx}]: (${v.x.toFixed(2)}, ${v.y.toFixed(2)})`);
});
