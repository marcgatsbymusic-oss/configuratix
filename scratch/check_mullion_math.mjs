import * as THREE from 'three';

const scale = 0.001;

function getGlobalPos(localPt, postPosition, postRotation) {
  // Local geometry coordinates (after subtracting origin)
  // localPt is in CAD mm: {x, y, z}
  const meshPt = new THREE.Vector3(localPt.x * scale, localPt.y * scale, localPt.z * scale);

  // Apply inner rotation [0, Math.PI/2, 0]
  meshPt.applyEuler(new THREE.Euler(0, Math.PI / 2, 0, 'XYZ'));

  // Apply outer rotation postRotation
  meshPt.applyEuler(new THREE.Euler(postRotation[0], postRotation[1], postRotation[2], 'XYZ'));

  // Apply position postPosition
  meshPt.add(new THREE.Vector3(postPosition[0], postPosition[1], postPosition[2]));

  return meshPt;
}

// Frame point at depth X=70 (interior face), width Y=0 (bottom), length Z=0
// Frame is rotated by [0, Math.PI/2, 0]
console.log("Frame point (X=70, Y=0, Z=0) ->");
const framePt = new THREE.Vector3(70 * scale, 0, 0);
framePt.applyEuler(new THREE.Euler(0, Math.PI / 2, 0, 'XYZ'));
console.log("  Global:", framePt);

console.log("\nMullion isFixedMullion = false (F200):");
// postPosition: [Ws, 0, 0], postRotation: [0, 0, Math.PI/2]
// Mullion point (X=70, Y=0, Z=0)
const ptF200 = getGlobalPos({ x: 70, y: 0, z: 0 }, [0.5, 0, 0], [0, 0, Math.PI / 2]);
console.log("  Global:", ptF200);

console.log("\nMullion isFixedMullion = true (F2XX1) before commit 8c524d0:");
// postPosition: [Ws, 46 * scale, 0], postRotation: [0, Math.PI, Math.PI/2]
const ptF2XX1_old = getGlobalPos({ x: 70, y: 0, z: 0 }, [0.5, 46 * scale, 0], [0, Math.PI, Math.PI / 2]);
console.log("  Global:", ptF2XX1_old);

console.log("\nMullion isFixedMullion = true (F2XX1) after commit 8c524d0:");
// postPosition: [Ws, 46 * scale, -70 * scale], postRotation: [0, Math.PI, Math.PI/2]
const ptF2XX1_new = getGlobalPos({ x: 70, y: 0, z: 0 }, [0.5, 46 * scale, -70 * scale], [0, Math.PI, Math.PI / 2]);
console.log("  Global:", ptF2XX1_new);
