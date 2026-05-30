import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

let output = "Dumping all leaf polylines and lines recursively with absolute coordinates:\n";

const items = [];

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

function traverse(ent, offsetX = 0, offsetY = 0, path = "") {
  const currentPath = path ? `${path} -> ${ent.type} (${ent.name || ent.layer})` : `${ent.type} (${ent.name || ent.layer})`;
  
  if (ent.type === 'INSERT') {
    const block = dxf.blocks[ent.name];
    if (block && block.entities) {
      block.entities.forEach(child => {
        traverse(child, offsetX + (ent.position.x || 0), offsetY + (ent.position.y || 0), currentPath);
      });
    }
  } else if (ent.type.includes('POLYLINE') && ent.vertices) {
    const absVertices = ent.vertices.map(v => ({ x: v.x + offsetX, y: v.y + offsetY }));
    const bbox = getBBox(absVertices);
    items.push({
      type: ent.type,
      path: currentPath,
      layer: ent.layer,
      colorIndex: ent.colorIndex,
      vertices: absVertices,
      bbox
    });
  } else if (ent.type === 'LINE') {
    const absVertices = [
      { x: ent.vertices[0].x + offsetX, y: ent.vertices[0].y + offsetY },
      { x: ent.vertices[1].x + offsetX, y: ent.vertices[1].y + offsetY }
    ];
    const bbox = getBBox(absVertices);
    items.push({
      type: ent.type,
      path: currentPath,
      layer: ent.layer,
      colorIndex: ent.colorIndex,
      vertices: absVertices,
      bbox
    });
  }
}

dxf.entities.forEach(ent => {
  traverse(ent, 0, 0, "");
});

output += `Collected ${items.length} leaf polylines/lines.\n`;
items.forEach((item, idx) => {
  output += `\nItem #${idx}: type=${item.type}, layer="${item.layer}", colorIndex=${item.colorIndex}\n`;
  output += `  Path: ${item.path}\n`;
  output += `  BBox: min=(${item.bbox.minX.toFixed(2)}, ${item.bbox.minY.toFixed(2)}), max=(${item.bbox.maxX.toFixed(2)}, ${item.bbox.maxY.toFixed(2)}), size=(${item.bbox.w.toFixed(2)} x ${item.bbox.h.toFixed(2)})\n`;
  output += `  Vertices: ${item.vertices.length}\n`;
});

fs.writeFileSync("scratch/leaf_details.txt", output);
console.log("Successfully wrote leaf details to scratch/leaf_details.txt");
