import fs from 'fs';

const f104 = JSON.parse(fs.readFileSync('src/data/profiles/IgloEdge/IGE_F104.json', 'utf8'));
const post = JSON.parse(fs.readFileSync('src/data/profiles/IgloEdge/IGE_MOVABLE_POST_LEFT_OPENING.json', 'utf8'));

console.log('=== IGE_F104.json ===');
console.log('Bounds:', f104.meta.bounds);
for (const [name, layer] of Object.entries(f104.layers)) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  layer.contours.forEach(c => c.points.forEach(p => {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }));
  console.log(`Layer: ${name.padEnd(25)} | X: [${minX.toFixed(2)}, ${maxX.toFixed(2)}] | Y: [${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);
}

console.log('\n=== IGE_MOVABLE_POST_LEFT_OPENING.json ===');
console.log('Bounds:', post.meta.bounds);
for (const [name, layer] of Object.entries(post.layers)) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  layer.contours.forEach(c => c.points.forEach(p => {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }));
  console.log(`Layer: ${name.padEnd(25)} | X: [${minX.toFixed(2)}, ${maxX.toFixed(2)}] | Y: [${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);
}
