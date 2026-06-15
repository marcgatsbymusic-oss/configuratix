import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/IG5_F2XX1.json', 'utf8'));

const getBounds = (verts) => {
  if (!verts || verts.length === 0) return null;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const v of verts) {
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
  }
  return { minX, maxX, minY, maxY };
};

console.log("IG5_F2XX1.json bounds:");
for (const [key, val] of Object.entries(data.profiles)) {
  const b = getBounds(val.vertices);
  if (b) {
    console.log(`${key.padEnd(15)}: minX=${b.minX.toFixed(2)} maxX=${b.maxX.toFixed(2)} minY=${b.minY.toFixed(2)} maxY=${b.maxY.toFixed(2)}`);
  } else {
    console.log(`${key.padEnd(15)}: no vertices`);
  }
}
