import fs from 'fs';

function lineSegmentsIntersect(p1, p2, p3, p4) {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (d === 0) return false;
  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  return u > 0.0001 && u < 0.9999 && v > 0.0001 && v < 0.9999;
}

function findSelfIntersections(pts) {
  const intersections = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if ((j + 1) % n === i) continue;
      const p3 = pts[j], p4 = pts[(j + 1) % n];
      if (lineSegmentsIntersect(p1, p2, p3, p4)) {
        intersections.push({ i, j });
      }
    }
  }
  return intersections;
}

const files = [
  'src/data/profiles/IgloEdge/IGE_F104.json',
  'src/data/profiles/IgloEdge/IGE_MOVABLE_POST_LEFT_OPENING.json'
];

files.forEach(filePath => {
  console.log(`\nChecking Gasket Layers in ${filePath}...`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [layerName, layerData] of Object.entries(data.layers)) {
    if (layerName.includes('GSK') || layerName === 'GSK_BZD') {
      console.log(`\nLayer: ${layerName}`);
      layerData.contours.forEach((c, idx) => {
        const selfInter = findSelfIntersections(c.points);
        console.log(`  Contour ${idx} (${c.points.length} points, verified: ${c.verified}): self-intersections = ${selfInter.length}`);
      });
    }
  }
});
