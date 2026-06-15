import fs from 'fs';

const FILE = "src/data/profiles/IgloEdge/Fixed_Glazing.json";

try {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const bounds = {};
  for (const [layerName, layer] of Object.entries(data.layers)) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    layer.contours.forEach(c => c.points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }));
    bounds[layerName] = { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
  }
  console.log(JSON.stringify(bounds, null, 2));
} catch (err) {
  console.error(err);
}
