import fs from 'fs';
const data = JSON.parse(fs.readFileSync('./src/data/cantorPricingMatrices.json'));
const profileMatrix = data['iglo5'];
const p = profileMatrix['F100'];

const w = 1000;
const h = 1000;

function idw(anchors, w, h) {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const anchor of anchors) {
    const dist = Math.sqrt((anchor.w - w) ** 2 + (anchor.h - h) ** 2);
    if (dist < 0.001) return anchor.price;
    const weight = 1 / (dist ** 2);
    weightedSum += weight * anchor.price;
    totalWeight += weight;
  }
  return weightedSum / totalWeight;
}

const UR = profileMatrix['UR'];
console.log("UR 1000x1000:", idw(UR || [], w, h));

const F100 = profileMatrix['F100'];
console.log("F100 1000x1000:", idw(F100 || [], w, h));

const DK = profileMatrix['DK'];
console.log("DK 1000x1000:", idw(DK || [], w, h));
