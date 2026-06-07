import fs from 'fs';

const data = fs.readFileSync('public/sliding_door_handle_IGLS.glb');
const chunkLength = data.readUInt32LE(12);
const jsonStr = data.toString('utf8', 20, 20 + chunkLength);
const gltf = JSON.parse(jsonStr);

console.log('Nodes:');
gltf.nodes.forEach((node, i) => {
  console.log(`Node ${i}: name="${node.name}"`);
  console.log(`  translation:`, node.translation);
  console.log(`  rotation:`, node.rotation);
  console.log(`  scale:`, node.scale);
  console.log(`  matrix:`, node.matrix);
});
