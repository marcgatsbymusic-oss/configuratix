import f2xx1 from '../src/data/profiles/IGLO5/IG5_F2XX1.json' with { type: 'json' };
import f103 from '../src/data/profiles/IGLO5/IG5_F103.json' with { type: 'json' };

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

const keys = ["GSK_FRM_EXT", "GSK_SSH_EXT", "GSK_SSH_BTM", "GSK_BZD"];
console.log("Gasket Bounds Comparison:");
for (const k of keys) {
  const b_f2xx1 = getBounds(f2xx1.profiles[k]?.vertices);
  const b_f103 = getBounds(f103.profiles[k]?.vertices);
  console.log(`\nKey: ${k}`);
  console.log(`  F2XX1: minX=${b_f2xx1?.minX.toFixed(2)} maxX=${b_f2xx1?.maxX.toFixed(2)} minY=${b_f2xx1?.minY.toFixed(2)} maxY=${b_f2xx1?.maxY.toFixed(2)}`);
  console.log(`  F103 : minX=${b_f103?.minX.toFixed(2)} maxX=${b_f103?.maxX.toFixed(2)} minY=${b_f103?.minY.toFixed(2)} maxY=${b_f103?.maxY.toFixed(2)}`);
}
