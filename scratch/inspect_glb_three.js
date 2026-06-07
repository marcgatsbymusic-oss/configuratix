import fs from 'fs';

const data = fs.readFileSync('public/testhandle.glb');
const chunkLength = data.readUInt32LE(12);
const jsonStr = data.toString('utf8', 20, 20 + chunkLength);
const gltf = JSON.parse(jsonStr);

console.log('--- Original testhandle.glb Nodes ---');
if (gltf.nodes) {
  gltf.nodes.forEach((node, i) => {
    console.log(`Node ${i}: name="${node.name}"`);
    if (node.translation) console.log(`  translation: [${node.translation.join(', ')}]`);
    if (node.rotation) console.log(`  rotation: [${node.rotation.join(', ')}]`);
    if (node.scale) console.log(`  scale: [${node.scale.join(', ')}]`);
  });
}
