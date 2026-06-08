import fs from 'fs';

const f200 = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/IG5_F200.json', 'utf8'));
const f2xx1 = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/IG5_F2XX1.json', 'utf8'));

function getBounds(verts) {
  if (!verts || verts.length === 0) return null;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const v of verts) {
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
  }
  return { minX, maxX, minY, maxY };
}

console.log("F200 PST_EXT Bounds:", getBounds(f200.profiles.PST_EXT?.vertices));
console.log("F2XX1 PST_EXT Bounds:", getBounds(f2xx1.profiles.PST_EXT?.vertices));

console.log("F200 PST_INT Bounds:", getBounds(f200.profiles.PST_INT?.vertices));
console.log("F2XX1 PST_INT Bounds:", getBounds(f2xx1.profiles.PST_INT?.vertices));
