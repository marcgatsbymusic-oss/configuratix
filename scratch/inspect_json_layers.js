import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/profiles/IgloEdge/IGE_WINDOW_MOVABLE_POST.json', 'utf-8'));
console.log("=== JSON Layers and Contour Counts ===");
Object.entries(data.layers).forEach(([name, val]) => {
  console.log(`Layer: ${name.padEnd(25)} Contours: ${val.contours.length}`);
  if (val.contours.length > 0) {
    const minX = Math.min(...val.contours[0].points.map(p => p.x));
    const maxX = Math.max(...val.contours[0].points.map(p => p.x));
    console.log(`  -> Contour 0 X bounds: [${minX.toFixed(4)}, ${maxX.toFixed(4)}]`);
  }
});
