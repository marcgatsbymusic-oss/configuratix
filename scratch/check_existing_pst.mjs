import fs from 'fs';

const f200Path = 'src/data/profiles/IGLO5/IG5_F200.json';
try {
  const f200 = JSON.parse(fs.readFileSync(f200Path, 'utf-8'));
  const pstExt = f200.profiles.PST_EXT;
  const pstInt = f200.profiles.PST_INT;

  if (pstExt) {
    const xs = pstExt.vertices.map(v => v.x);
    const ys = pstExt.vertices.map(v => v.y);
    console.log(`PST_EXT:`);
    console.log(`  X: ${Math.min(...xs).toFixed(3)} to ${Math.max(...xs).toFixed(3)}`);
    console.log(`  Y: ${Math.min(...ys).toFixed(3)} to ${Math.max(...ys).toFixed(3)}`);
  } else {
    console.log('No PST_EXT found in IG5_F200.json');
  }

  if (pstInt) {
    const xs = pstInt.vertices.map(v => v.x);
    const ys = pstInt.vertices.map(v => v.y);
    console.log(`PST_INT:`);
    console.log(`  X: ${Math.min(...xs).toFixed(3)} to ${Math.max(...xs).toFixed(3)}`);
    console.log(`  Y: ${Math.min(...ys).toFixed(3)} to ${Math.max(...ys).toFixed(3)}`);
  } else {
    console.log('No PST_INT found in IG5_F200.json');
  }
} catch (err) {
  console.error(err);
}
