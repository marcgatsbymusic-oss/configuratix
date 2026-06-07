import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/profiles/IgloEdge/SLE201.json', 'utf8'));
console.log("All layers in SLE201.json:");
for (const [name, layer] of Object.entries(data.layers)) {
  console.log(`- ${name}: ${layer.contours.length} contours`);
  layer.contours.forEach((c, idx) => {
    const sumY = c.points.reduce((sum, p) => sum + p.y, 0);
    const centY = sumY / c.points.length;
    console.log(`  Contour ${idx}: centY=${centY.toFixed(2)}, points=${c.points.length}`);
  });
}
