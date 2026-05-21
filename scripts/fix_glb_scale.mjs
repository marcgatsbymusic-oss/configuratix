/**
 * fix_glb_scale.mjs
 *
 * The source window-scene.glb was exported with raw mm coordinates (e.g. vertex X = 1284 mm).
 * Google Scene Viewer (and all AR viewers) interpret GLB units as METERS.
 * So the model appears 1284 m from origin — effectively invisible and unplaceable.
 *
 * This script:
 *  1. Reads the GLB JSON chunk
 *  2. Wraps all root scene nodes under a single new root node with:
 *       scale: [0.001, 0.001, 0.001]   (mm → m)
 *       translation: [-bbox_center_x * 0.001, 0, -bbox_center_z * 0.001] (center on XZ)
 *  3. Writes the corrected GLB back to public/models/window-scene.glb
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath  = path.join(__dirname, '../public/models/window-scene.glb');
const outputPath = path.join(__dirname, '../public/models/window-scene.glb');

const buf = fs.readFileSync(inputPath);

// --- Parse GLB header ---
const magic   = buf.readUInt32LE(0); // 0x46546C67
const version = buf.readUInt32LE(4);
if (magic !== 0x46546C67 || version !== 2) {
  throw new Error('Not a valid glTF 2.0 binary file');
}

const jsonChunkLength = buf.readUInt32LE(12);
const jsonChunkType   = buf.readUInt32LE(16);
if (jsonChunkType !== 0x4E4F534A) throw new Error('First chunk is not JSON');

const jsonBuf = buf.slice(20, 20 + jsonChunkLength);
const json    = JSON.parse(jsonBuf.toString('utf8'));

// --- Compute centroid of all min/max bounds across position accessors ---
let globalMinX = Infinity, globalMaxX = -Infinity;
let globalMinZ = Infinity, globalMaxZ = -Infinity;

for (const acc of (json.accessors || [])) {
  if (acc.type === 'VEC3' && acc.min && acc.max) {
    globalMinX = Math.min(globalMinX, acc.min[0]);
    globalMaxX = Math.max(globalMaxX, acc.max[0]);
    globalMinZ = Math.min(globalMinZ, acc.min[2]);
    globalMaxZ = Math.max(globalMaxZ, acc.max[2]);
  }
}

const centerX = (globalMinX + globalMaxX) / 2;  // in mm
const centerZ = (globalMinZ + globalMaxZ) / 2;  // in mm

console.log(`Geometry centre (mm): X=${centerX.toFixed(1)}, Z=${centerZ.toFixed(1)}`);
console.log(`Applying scale=0.001 + translation=[${(-centerX*0.001).toFixed(4)}, 0, ${(-centerZ*0.001).toFixed(4)}]`);

// --- Inject a wrapper root node ---
// Move all existing scene root nodes under a new wrapper
const sceneRootNodeIndices = json.scenes[json.scene ?? 0].nodes;

const wrapperNodeIndex = json.nodes.length;
json.nodes.push({
  name: 'ar_root_wrapper',
  children: [...sceneRootNodeIndices],
  scale:       [0.001, 0.001, 0.001],
  translation: [-centerX * 0.001, 0, -centerZ * 0.001],
});

// Replace the scene's root node list with just our wrapper
json.scenes[json.scene ?? 0].nodes = [wrapperNodeIndex];

// --- Re-encode JSON chunk (must be 4-byte aligned, padded with spaces) ---
let newJsonStr = JSON.stringify(json);
while (newJsonStr.length % 4 !== 0) newJsonStr += ' ';
const newJsonBuf = Buffer.from(newJsonStr, 'utf8');

// --- Rebuild GLB ---
const binChunkStart = 20 + jsonChunkLength;  // original bin chunk starts here
const binChunk      = buf.slice(binChunkStart); // includes chunk header + data

const newTotalLength = 12 + 8 + newJsonBuf.length + binChunk.length;
const out = Buffer.alloc(newTotalLength);

// GLB header
out.writeUInt32LE(0x46546C67,       0);  // magic
out.writeUInt32LE(2,                4);  // version
out.writeUInt32LE(newTotalLength,   8);  // total file length

// JSON chunk header
out.writeUInt32LE(newJsonBuf.length, 12); // chunk length
out.writeUInt32LE(0x4E4F534A,       16); // chunk type JSON

// JSON chunk data
newJsonBuf.copy(out, 20);

// BIN chunk (unchanged)
binChunk.copy(out, 20 + newJsonBuf.length);

fs.writeFileSync(outputPath, out);
console.log(`✅ Written ${outputPath} (${(out.length / 1024).toFixed(1)} KB)`);
console.log('   Model is now centred at origin, scaled to real-world metres.');
