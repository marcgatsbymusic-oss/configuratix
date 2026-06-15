import fs from 'fs';

function lineSegmentsIntersect(p1, p2, p3, p4) {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (d === 0) return false;
  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  return u > 0.0001 && u < 0.9999 && v > 0.0001 && v < 0.9999;
}

const file = "src/data/profiles/IgloEdge/IGE_F104.json";
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const pts = data.layers.GSK_FRM_EXT.contours[1].points;
const inters = [];
const n = pts.length;
for (let i = 0; i < n; i++) {
  const p1 = pts[i], p2 = pts[(i + 1) % n];
  for (let j = i + 2; j < n; j++) {
    if ((j + 1) % n === i) continue;
    const p3 = pts[j], p4 = pts[(j + 1) % n];
    if (lineSegmentsIntersect(p1, p2, p3, p4)) {
      inters.push({ edge1: [i, (i+1)%n], edge2: [j, (j+1)%n] });
    }
  }
}
console.log(`GSK_FRM_EXT Contour 1 has ${inters.length} intersections. First 15:`);
console.log(inters.slice(0, 15));
