import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

let output = "Leaf polylines and lines recursively with CORRECT affine transformations:\n";

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

// Transform point using affine transform: scale -> rotate -> translate
function transformPoint(p, tx, ty, rotDeg, sx, sy) {
  // Scale
  let x = p.x * sx;
  let y = p.y * sy;
  
  // Rotate
  if (rotDeg !== 0) {
    const rad = rotDeg * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    x = rx;
    y = ry;
  }
  
  // Translate
  return {
    x: x + tx,
    y: y + ty
  };
}

function traverse(ent, tx = 0, ty = 0, rot = 0, sx = 1, sy = 1, path = "") {
  const currentPath = path ? `${path} -> ${ent.type} (${ent.name || ent.layer})` : `${ent.type} (${ent.name || ent.layer})`;
  
  if (ent.type === 'INSERT') {
    const block = dxf.blocks[ent.name];
    if (block && block.entities) {
      // The insert parameters
      const itx = ent.position.x || 0;
      const ity = ent.position.y || 0;
      const irot = ent.rotation || 0;
      const isx = ent.xScale ?? 1;
      const isy = ent.yScale ?? 1;
      
      // Combine transformations:
      // When nesting, we apply the parent transform to the child insert's translation.
      // And we add rotations (for 2D) and multiply scales.
      // Let's compute the absolute position of the child insert:
      const absPos = transformPoint({ x: itx, y: ity }, tx, ty, rot, sx, sy);
      const absRot = rot + irot;
      const absSx = sx * isx;
      const absSy = sy * isy;
      
      block.entities.forEach(child => {
        traverse(child, absPos.x, absPos.y, absRot, absSx, absSy, currentPath);
      });
    }
  } else if (ent.type.includes('POLYLINE') && ent.vertices) {
    const absVertices = ent.vertices.map(v => transformPoint(v, tx, ty, rot, sx, sy));
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
    const p1 = transformPoint(ent.vertices[0], tx, ty, rot, sx, sy);
    const p2 = transformPoint(ent.vertices[1], tx, ty, rot, sx, sy);
    const absVertices = [p1, p2];
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
  traverse(ent, 0, 0, 0, 1, 1, "");
});

output += `Collected ${items.length} leaf polylines/lines.\n`;
items.forEach((item, idx) => {
  output += `\nItem #${idx}: type=${item.type}, layer="${item.layer}", colorIndex=${item.colorIndex}\n`;
  output += `  Path: ${item.path}\n`;
  output += `  BBox: min=(${item.bbox.minX.toFixed(2)}, ${item.bbox.minY.toFixed(2)}), max=(${item.bbox.maxX.toFixed(2)}, ${item.bbox.maxY.toFixed(2)}), size=(${item.bbox.w.toFixed(2)} x ${item.bbox.h.toFixed(2)})\n`;
  output += `  Vertices: ${item.vertices.length}\n`;
});

fs.writeFileSync("scratch/leaf_details_transformed.txt", output);
console.log("Successfully wrote leaf details to scratch/leaf_details_transformed.txt");
