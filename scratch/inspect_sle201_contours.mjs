import fs from 'fs';

const jsonPath = 'src/data/profiles/IgloEdge/SLE201.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

Object.entries(data.layers).forEach(([layer, lData]) => {
  console.log(`Layer: ${layer}`);
  lData.contours.forEach((contour, idx) => {
    let minY = Infinity, maxY = -Infinity;
    let minX = Infinity, maxX = -Infinity;
    contour.points.forEach(p => {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
    });
    console.log(`  Contour ${idx}: Y range [${minY.toFixed(2)}, ${maxY.toFixed(2)}], X range [${minX.toFixed(2)}, ${maxX.toFixed(2)}], points: ${contour.points.length}`);
  });
});
