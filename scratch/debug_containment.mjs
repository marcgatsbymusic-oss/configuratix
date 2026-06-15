import fs from 'fs';

const file = 'src/data/profiles/IgloEdge/IGE_MOVABLE_POST_LEFT_OPENING.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const gskBzd = data.layers.GSK_BZD.contours;
const poly0 = gskBzd[0].points;
const poly1 = gskBzd[1].points;

function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Print all vertices of poly0 to check for self-intersections or duplicates
console.log('Poly0 Vertices:', poly0.length);
console.log('Poly1 Vertices:', poly1.length);

// Test 10x10 grid of points within Poly1 bounds
const b1 = { minX: 148.8823, maxX: 150.1890, minY: 17.1023, maxY: 20.3967 };
let insideCount = 0;
let totalCount = 0;

for (let x = b1.minX; x <= b1.maxX; x += (b1.maxX - b1.minX) / 10) {
  for (let y = b1.minY; y <= b1.maxY; y += (b1.maxY - b1.minY) / 10) {
    totalCount++;
    if (isPointInPolygon({ x, y }, poly0)) {
      insideCount++;
    }
  }
}

console.log(`Grid test: ${insideCount} / ${totalCount} points were inside Poly0`);
