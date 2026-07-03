import fs from 'fs';

const content = fs.readFileSync('public/IGE_MOVABLE_POST_LEFT_OPENING.svg', 'utf-8');
const paths = content.match(/<path[^>]*>/g) || [];
console.log(`Total paths found in IGE_MOVABLE_POST_LEFT_OPENING.svg: ${paths.length}`);

const layerBounds = {};

paths.forEach(p => {
  const d = p.match(/d="([^"]*)"/)?.[1] || '';
  const fill = p.match(/fill="([^"]*)"/)?.[1] || 'none';
  const coords = d.match(/[0-9.-]+/g) || [];
  let minX = Infinity, maxX = -Infinity;
  for (let i = 0; i < coords.length; i += 2) {
    const x = parseFloat(coords[i]);
    if (!isNaN(x)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }
  if (minX !== Infinity) {
    if (!layerBounds[fill]) {
      layerBounds[fill] = { minX: Infinity, maxX: -Infinity };
    }
    if (minX < layerBounds[fill].minX) layerBounds[fill].minX = minX;
    if (maxX > layerBounds[fill].maxX) layerBounds[fill].maxX = maxX;
  }
});

console.log("=== Bounds per Fill Color ===");
Object.entries(layerBounds).forEach(([fill, bounds]) => {
  console.log(`Fill: ${fill.padEnd(25)} X: [${bounds.minX.toFixed(4)}, ${bounds.maxX.toFixed(4)}]`);
});
