import fs from 'fs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

// Since we are running in Node, we can use a mock/simple parse or just read the GLB file structure.
// Or we can load it using a minimal parser.
// Actually, GLB is a binary format. Let's do a simple string search for "gltf" or JSON chunk.
const data = fs.readFileSync('public/sliding_door_handle_IGLS.glb');
console.log('GLB size in bytes:', data.length);

// Read GLB header: magic (4 bytes), version (4 bytes), length (4 bytes)
const magic = data.readUInt32LE(0);
const version = data.readUInt32LE(4);
const length = data.readUInt32LE(8);
console.log('Magic:', magic.toString(16), 'Version:', version, 'Length:', length);

// Read first chunk (JSON): chunkLength (4 bytes), chunkType (4 bytes)
const chunkLength = data.readUInt32LE(12);
const chunkType = data.readUInt32LE(16);
console.log('JSON Chunk Length:', chunkLength, 'Type:', chunkType.toString(16));

if (chunkType === 0x4E4F534A) { // 'JSON'
  const jsonStr = data.toString('utf8', 20, 20 + chunkLength);
  const gltf = JSON.parse(jsonStr);
  console.log('Nodes in GLB:');
  if (gltf.nodes) {
    gltf.nodes.forEach((node, index) => {
      console.log(`Node ${index}: name="${node.name}"`, node.mesh !== undefined ? `mesh=${node.mesh}` : '', node.children ? `children=[${node.children.join(', ')}]` : '');
    });
  }
  if (gltf.meshes) {
    console.log('\nMeshes in GLB:');
    gltf.meshes.forEach((mesh, index) => {
      console.log(`Mesh ${index}: name="${mesh.name}"`);
    });
  }
} else {
  console.log('First chunk is not JSON!');
}
