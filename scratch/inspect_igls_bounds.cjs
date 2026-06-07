const fs = require('fs');

const data = fs.readFileSync('public/sliding_door_handle_IGLS.glb');
const chunkLength = data.readUInt32LE(12);
const jsonStr = data.toString('utf8', 20, 20 + chunkLength);
const gltf = JSON.parse(jsonStr);

console.log('--- Accessors ---');
gltf.accessors.forEach((accessor, i) => {
  if (accessor.type === 'VEC3') {
    console.log(`Accessor ${i}: count=${accessor.count}, min=[${accessor.min?.join(', ')}], max=[${accessor.max?.join(', ')}]`);
  }
});

console.log('\n--- Meshes ---');
gltf.meshes.forEach((mesh, i) => {
  console.log(`Mesh ${i}: name="${mesh.name}"`);
  mesh.primitives.forEach((prim, j) => {
    const posAttr = prim.attributes.POSITION;
    const accessor = gltf.accessors[posAttr];
    console.log(`  Primitive ${j}: position accessor=${posAttr}, min=[${accessor.min?.join(', ')}], max=[${accessor.max?.join(', ')}]`);
  });
});
