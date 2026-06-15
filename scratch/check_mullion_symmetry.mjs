import fs from 'fs';

const f2xx1 = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/IG5_F2XX1.json', 'utf8'));

function checkSymmetry(vertices) {
  if (!vertices) return true;
  // For every vertex (x, y), there should be a matching vertex (x, -y)
  const threshold = 0.05; // 0.05 mm tolerance
  let symmetricCount = 0;
  for (const v1 of vertices) {
    let found = false;
    for (const v2 of vertices) {
      if (Math.abs(v1.x - v2.x) < threshold && Math.abs(v1.y + v2.y) < threshold) {
        found = true;
        break;
      }
    }
    if (found) {
      symmetricCount++;
    } else {
      // Print first non-symmetric vertex
      console.log(`  Non-symmetric vertex: x=${v1.x.toFixed(2)}, y=${v1.y.toFixed(2)}`);
    }
  }
  return symmetricCount === vertices.length;
}

console.log("PST_EXT symmetric around Y=0:", checkSymmetry(f2xx1.profiles.PST_EXT?.vertices));
console.log("PST_INT symmetric around Y=0:", checkSymmetry(f2xx1.profiles.PST_INT?.vertices));
