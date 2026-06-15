import fs from 'fs';
import * as THREE from 'three';

const glbPath = "C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/public/models/Bottom_hinge_right.glb";

// A simple parser for GLB binary geometry data
function run() {
  const buffer = fs.readFileSync(glbPath);
  const chunkLength = buffer.readUInt32LE(12);
  const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
  const gltf = JSON.parse(jsonStr);

  const binOffset = 20 + chunkLength + 8; // Start of binary buffer chunk
  const binBuffer = buffer.subarray(binOffset);

  console.log("Parsing geometry buffers to find bounding boxes...");

  const nodeWorldTransforms = [];

  // Compute world matrices
  function computeWorldTransforms(nodeIdx, parentMatrix = new THREE.Matrix4()) {
    const node = gltf.nodes[nodeIdx];
    const localMatrix = new THREE.Matrix4();
    if (node.matrix) {
      localMatrix.fromArray(node.matrix);
    } else {
      const translation = node.translation ? new THREE.Vector3().fromArray(node.translation) : new THREE.Vector3();
      const rotation = node.rotation ? new THREE.Quaternion().fromArray(node.rotation) : new THREE.Quaternion();
      const scale = node.scale ? new THREE.Vector3().fromArray(node.scale) : new THREE.Vector3(1, 1, 1);
      localMatrix.compose(translation, rotation, scale);
    }
    const worldMatrix = parentMatrix.clone().multiply(localMatrix);
    nodeWorldTransforms[nodeIdx] = worldMatrix;

    if (node.children) {
      node.children.forEach(childIdx => {
        computeWorldTransforms(childIdx, worldMatrix);
      });
    }
  }

  // Find root nodes (nodes not in any children list)
  const allChildren = new Set();
  gltf.nodes.forEach(n => {
    if (n.children) {
      n.children.forEach(c => allChildren.add(c));
    }
  });

  gltf.nodes.forEach((n, idx) => {
    if (!allChildren.has(idx)) {
      computeWorldTransforms(idx);
    }
  });

  // Helper to read buffer view
  function getAccessorData(accessorIdx) {
    const accessor = gltf.accessors[accessorIdx];
    const bufferView = gltf.bufferViews[accessor.bufferView];
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    const totalBytes = accessor.count * (accessor.type === 'VEC3' ? 12 : accessor.type === 'VEC4' ? 16 : 4);
    const dataSub = binBuffer.subarray(byteOffset, byteOffset + totalBytes);
    
    const array = [];
    if (accessor.type === 'VEC3') {
      for (let i = 0; i < accessor.count; i++) {
        array.push(new THREE.Vector3(
          dataSub.readFloatLE(i * 12),
          dataSub.readFloatLE(i * 12 + 4),
          dataSub.readFloatLE(i * 12 + 8)
        ));
      }
    }
    return array;
  }

  gltf.nodes.forEach((node, nodeIdx) => {
    if (node.mesh === undefined) return;
    const mesh = gltf.meshes[node.mesh];
    const worldMatrix = nodeWorldTransforms[nodeIdx];

    mesh.primitives.forEach((primitive, primIdx) => {
      const posAccessorIdx = primitive.attributes.POSITION;
      if (posAccessorIdx === undefined) return;

      const positions = getAccessorData(posAccessorIdx);
      const bbox = new THREE.Box3();
      positions.forEach(p => {
        const worldPos = p.clone().applyMatrix4(worldMatrix);
        bbox.expandByPoint(worldPos);
      });

      const center = new THREE.Vector3();
      bbox.getCenter(center);
      const size = new THREE.Vector3();
      bbox.getSize(size);

      console.log(`\nNode [${nodeIdx}]: "${node.name}" (Mesh ${node.mesh})`);
      console.log(`  World Bounding Box:`);
      console.log(`    Min: [${bbox.min.x.toFixed(5)}, ${bbox.min.y.toFixed(5)}, ${bbox.min.z.toFixed(5)}]`);
      console.log(`    Max: [${bbox.max.x.toFixed(5)}, ${bbox.max.y.toFixed(5)}, ${bbox.max.z.toFixed(5)}]`);
      console.log(`    Center: [${center.x.toFixed(5)}, ${center.y.toFixed(5)}, ${center.z.toFixed(5)}]`);
      console.log(`    Size: [${size.x.toFixed(5)}, ${size.y.toFixed(5)}, ${size.z.toFixed(5)}]`);
    });
  });
}

run();
