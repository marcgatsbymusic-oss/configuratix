import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/profiles/IgloEdge/SLE201.json', 'utf8'));
const layer = data.layers['Aluminium Rail'];
if (!layer) {
  console.log("No Aluminium Rail layer found");
} else {
  console.log(`Found ${layer.contours.length} contours in Aluminium Rail:`);
  layer.contours.forEach((c, idx) => {
    const sumY = c.points.reduce((sum, p) => sum + p.y, 0);
    const centY = sumY / c.points.length;
    const minX = Math.min(...c.points.map(p => p.x));
    const maxX = Math.max(...c.points.map(p => p.x));
    const minY = Math.min(...c.points.map(p => p.y));
    const maxY = Math.max(...c.points.map(p => p.y));
    console.log(`Contour ${idx}: centY=${centY.toFixed(2)}, Y-range=[${minY.toFixed(2)}, ${maxY.toFixed(2)}], X-range=[${minX.toFixed(2)}, ${maxX.toFixed(2)}]`);
  });
}
