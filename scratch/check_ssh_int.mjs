import * as THREE from 'three';

const outerEuler = new THREE.Euler(0, 0, Math.PI / 2, 'XYZ');
const qOuter = new THREE.Quaternion().setFromEuler(outerEuler);
const mOuter = new THREE.Matrix4().makeRotationFromQuaternion(qOuter);

const innerEuler = new THREE.Euler(0, Math.PI / 2, 0, 'XYZ');
const qInner = new THREE.Quaternion().setFromEuler(innerEuler);
const mInner = new THREE.Matrix4().makeRotationFromQuaternion(qInner);

const combined = new THREE.Matrix4().multiplyMatrices(mOuter, mInner);

console.log("Stile combined matrix:");
const el = combined.elements;
for (let i = 0; i < 4; i++) {
  console.log([el[i], el[i+4], el[i+8], el[i+12]].map(x => x.toFixed(4)).join('\t'));
}

const vX = new THREE.Vector3(1, 0, 0).applyMatrix4(combined); // Profile depth (originally 0..70)
const vY = new THREE.Vector3(0, 1, 0).applyMatrix4(combined); // Profile width (symmetric around 0)
const vZ = new THREE.Vector3(0, 0, 1).applyMatrix4(combined); // Extrusion direction (originally 0..length)

console.log("\nTransforms:");
console.log("Profile Depth (1,0,0) ->", vX);
console.log("Profile Width (0,1,0) ->", vY);
console.log("Extrusion Dir (0,0,1) ->", vZ);
