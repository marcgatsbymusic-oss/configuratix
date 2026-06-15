import fs from 'fs';

const file = JSON.parse(fs.readFileSync('C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/data/profiles/IgloEdge/Main_Frame.json', 'utf8'));

const alum = file.layers.Aluminium;
if (alum) {
  const contour = alum.contours[0];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  contour.points.forEach(p => {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  });
  console.log(`Aluminium Bounds: X: [${minX.toFixed(4)}, ${maxX.toFixed(4)}] Y: [${minY.toFixed(4)}, ${maxY.toFixed(4)}]`);
} else {
  console.log("Aluminium layer not found!");
}
