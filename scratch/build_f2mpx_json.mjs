/**
 * build_f2mpx_json.mjs
 * Combines:
 *   - Frame + Sash profiles from IG5_F2XX1.json (reuse exactly)
 *   - Movable Post profiles from IG5_F2MPX_post_only.json
 * into the final IG5_F2MPX.json
 */
import fs from 'fs';

const f2xx1 = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/IG5_F2XX1.json', 'utf8'));
const postOnly = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/IG5_F2MPX_post_only.json', 'utf8'));

// Keys to copy from F2XX1 (frame + sash layers, NOT the fixed mullion PST layers)
const COPY_FROM_F2XX1 = [
  'FRM_EXT', 'FRM_INT',
  'GSK_FRM_EXT',
  'SSH_EXT', 'SSH_INT',
  'BZD',
  'GSK_BZD',
  'GLS_EXT', 'GLS_INT',
  'SPCR',
  'GSK_SSH_BTM',
  'GSK_SSH_EXT',
  // PST_EXT and PST_INT from F2XX1 are the FIXED mullion — we skip those
];

const profiles = {};

for (const key of COPY_FROM_F2XX1) {
  if (f2xx1.profiles[key]) {
    profiles[key] = f2xx1.profiles[key];
    console.log(`✅ Copied from F2XX1: ${key}  (${f2xx1.profiles[key].vertices?.length || '?'} verts)`);
  } else {
    console.warn(`⚠️  Not found in F2XX1: ${key}`);
  }
}

// Add the movable post profiles
for (const [key, data] of Object.entries(postOnly.profiles)) {
  profiles[key] = data;
  console.log(`✅ Added movable post: ${key}  (${data.vertices?.length || '?'} verts)`);
}

const output = {
  system: 'IGLO_5',
  type: 'F2MPX',
  profiles,
};

fs.writeFileSync('src/data/profiles/IGLO5/IG5_F2MPX.json', JSON.stringify(output, null, 2));
console.log('\n✅ Written: src/data/profiles/IGLO5/IG5_F2MPX.json');
console.log('   Total profile keys:', Object.keys(profiles).join(', '));
