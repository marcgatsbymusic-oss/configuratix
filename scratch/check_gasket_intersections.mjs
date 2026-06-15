import fs from 'fs';

const file = "src/data/profiles/IgloEdge/IGE_MOVABLE_POST_LEFT_OPENING.json";
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

function lineSegmentsIntersect(p1, p2, p3, p4) {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (d === 0) return false; // Parallel
  
  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  
  return u > 0.0001 && u < 0.9999 && v > 0.0001 && v < 0.9999;
}

function findSelfIntersections(pts) {
  const intersections = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if ((j + 1) % n === i) continue; // Adjacent edge
      const p3 = pts[j];
      const p4 = pts[(j + 1) % n];
      if (lineSegmentsIntersect(p1, p2, p3, p4)) {
        intersections.push({ edge1: [i, (i+1)%n], edge2: [j, (j+1)%n] });
      }
    }
  }
  return intersections;
}

console.log('=== Gasket Self-Intersection Check ===');
for (const [layerName, layerData] of Object.entries(data.layers)) {
  if (layerName.includes('GSK') || layerName === 'GSK_BZD') {
    console.log(`\nLayer: ${layerName}`);
    layerData.contours.forEach((c, idx) => {
      const selfIntersections = findSelfIntersections(c.points);
      console.log(`  Contour ${idx}: ${selfIntersections.length} self-intersections`);
      if (selfIntersections.length > 0) {
        console.log(`    Edges intersecting:`, selfIntersections.slice(0, 5));
      }
    });
  }
}
