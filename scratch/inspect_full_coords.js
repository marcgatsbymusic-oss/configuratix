import fs from 'fs';

const content = fs.readFileSync('public/IGE_MOVABLE_POST_LEFT_OPENING_FULL.svg', 'utf-8');
const paths = content.match(/<path[^>]*>/g) || [];
console.log(`Total paths found in uncolored full SVG: ${paths.length}`);

// We want to find the min/max X coordinates for each ID/Layer
const layerBounds = {};

paths.forEach(p => {
  const id = p.match(/id="([^"]*)"/)?.[1] || p.match(/Layer: ([^\s]*)/)?.[1] || 'unknown';
  const d = p.match(/d="([^"]*)"/)?.[1] || '';
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
    const layerName = id.replace(/_\d+$/, '');
    if (!layerBounds[layerName]) {
      layerBounds[layerName] = { minX: Infinity, maxX: -Infinity };
    }
    if (minX < layerBounds[layerName].minX) layerBounds[layerName].minX = minX;
    if (maxX > layerBounds[layerName].maxX) layerBounds[layerName].maxX = maxX;
  }
});

console.log("=== Bounds per Layer ===");
Object.entries(layerBounds).forEach(([name, bounds]) => {
  console.log(`Layer: ${name.padEnd(25)} X: [${bounds.minX.toFixed(4)}, ${bounds.maxX.toFixed(4)}]`);
});
