import fs from 'fs';
import * as THREE from 'three';

// Let's parse the JSON to get the mesh positions directly, which is very accurate and doesn't require loading binary buffers.
const data = fs.readFileSync('public/sliding_door_handle_IGLS.glb');
const chunkLength = data.readUInt32LE(12);
const jsonStr = data.toString('utf8', 20, 20 + chunkLength);
const gltf = JSON.parse(jsonStr);

console.log('--- Nodes ---');
gltf.nodes.forEach((node, i) => {
  console.log(`Node ${i}: name="${node.name}"`);
  if (node.translation) console.log(`  translation: [${node.translation.join(', ')}]`);
  if (node.rotation) console.log(`  rotation: [${node.rotation.join(', ')}]`);
  if (node.scale) console.log(`  scale: [${node.scale.join(', ')}]`);
  if (node.matrix) console.log(`  matrix: [${node.matrix.join(', ')}]`);
});
