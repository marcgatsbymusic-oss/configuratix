import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

function getBBox(vertices) {
  if (!vertices || vertices.length === 0) return null;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  vertices.forEach(v => {
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
  });
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
}

console.log("Analyzing Block Polylines:");
for (const [name, block] of Object.entries(dxf.blocks || {})) {
  if (!block.entities) continue;
  block.entities.forEach((ent, idx) => {
    if (ent.type.includes('POLYLINE') && ent.vertices) {
      const bbox = getBBox(ent.vertices);
      console.log(`Block "${name}" -> Polyline #${idx}: layer="${ent.layer}", colorIndex=${ent.colorIndex}, vertices=${ent.vertices.length}`);
      console.log(`  BBox: min=(${bbox.minX.toFixed(2)}, ${bbox.minY.toFixed(2)}), max=(${bbox.maxX.toFixed(2)}, ${bbox.maxY.toFixed(2)}), size=(${bbox.w.toFixed(2)} x ${bbox.h.toFixed(2)})`);
    }
  });
}
