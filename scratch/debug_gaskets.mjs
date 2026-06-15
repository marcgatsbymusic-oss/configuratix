import fs from 'fs';

const file = 'src/data/profiles/IgloEdge/IGE_MOVABLE_POST_LEFT_OPENING.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const gskBzd = data.layers.GSK_BZD.contours;

function getBounds(pts) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  pts.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });
  return { minX, maxX, minY, maxY };
}

gskBzd.forEach((c, idx) => {
  const b = getBounds(c.points);
  console.log(`Contour ${idx}: bounds: X [${b.minX.toFixed(4)}, ${b.maxX.toFixed(4)}]  Y [${b.minY.toFixed(4)}, ${b.maxY.toFixed(4)}]`);
});
