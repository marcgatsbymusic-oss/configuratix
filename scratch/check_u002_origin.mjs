import fs from 'fs';

const vertices = JSON.parse(fs.readFileSync('scratch/u002_vertices.json', 'utf8'));

let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
vertices.forEach(v => {
  if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
  if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
});

console.log(`U-002 Raw Bounds: X=[${minX.toFixed(4)}, ${maxX.toFixed(4)}] Y=[${minY.toFixed(4)}, ${maxY.toFixed(4)}]`);
console.log(`Width: ${(maxX - minX).toFixed(4)} mm`);
console.log(`Height: ${(maxY - minY).toFixed(4)} mm`);
