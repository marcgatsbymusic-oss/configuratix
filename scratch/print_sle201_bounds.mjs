import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/profiles/IgloEdge/SLE201.json', 'utf8'));

console.log('Meta bounds:', data.meta?.bounds);
Object.keys(data.layers).forEach(layerName => {
  const layer = data.layers[layerName];
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let count = 0;
  layer.contours.forEach(c => {
    c.points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      count++;
    });
  });
  console.log(`Layer "${layerName}": points=${count}, X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);
});
