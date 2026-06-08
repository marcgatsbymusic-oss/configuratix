import * as THREE from 'three';

function testRotation(outerEuler, innerEuler) {
  const mOuter = new THREE.Matrix4().makeRotationFromEuler(outerEuler);
  const mInner = new THREE.Matrix4().makeRotationFromEuler(innerEuler);
  const combined = new THREE.Matrix4().multiplyMatrices(mOuter, mInner);

  const vX = new THREE.Vector3(1, 0, 0).applyMatrix4(combined); // Profile depth (X)
  const vY = new THREE.Vector3(0, 1, 0).applyMatrix4(combined); // Profile width (Y)
  const vZ = new THREE.Vector3(0, 0, 1).applyMatrix4(combined); // Extrusion direction (Z)

  return { vX, vY, vZ };
}

console.log("--- TEST 1: isFixedMullion = true ---");
let r1 = testRotation(
  new THREE.Euler(0, Math.PI, Math.PI / 2, 'XYZ'),
  new THREE.Euler(0, Math.PI / 2, 0, 'XYZ')
);
console.log("Profile Depth (1,0,0) ->", r1.vX);
console.log("Profile Width (0,1,0) ->", r1.vY);
console.log("Extrusion Dir (0,0,1) ->", r1.vZ);

console.log("\n--- TEST 2: isFixedMullion = false ---");
let r2 = testRotation(
  new THREE.Euler(0, 0, Math.PI / 2, 'XYZ'),
  new THREE.Euler(0, Math.PI / 2, 0, 'XYZ')
);
console.log("Profile Depth (1,0,0) ->", r2.vX);
console.log("Profile Width (0,1,0) ->", r2.vY);
console.log("Extrusion Dir (0,0,1) ->", r2.vZ);

console.log("\n--- TEST 3: Aligning depth to negative Z (like frame) ---");
let r3 = testRotation(
  new THREE.Euler(0, 0, Math.PI / 2, 'XYZ'),
  new THREE.Euler(0, -Math.PI / 2, 0, 'XYZ')
);
console.log("Profile Depth (1,0,0) ->", r3.vX);
console.log("Profile Width (0,1,0) ->", r3.vY);
console.log("Extrusion Dir (0,0,1) ->", r3.vZ);

console.log("\n--- TEST 4: Fixed mullion 180 Y-flip ---");
let r4 = testRotation(
  new THREE.Euler(0, Math.PI, -Math.PI / 2, 'XYZ'),
  new THREE.Euler(0, -Math.PI / 2, 0, 'XYZ')
);
console.log("Profile Depth (1,0,0) ->", r4.vX);
console.log("Profile Width (0,1,0) ->", r4.vY);
console.log("Extrusion Dir (0,0,1) ->", r4.vZ);
