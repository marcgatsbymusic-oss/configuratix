import * as THREE from 'three';

// Let's assume a point on the shape that is inside the pocket, e.g. at local X = 120 (towards interior), Y = 300 (top of bottom rail, inside pocket)
const localPoint = new THREE.Vector3(120 * 0.001, 300 * 0.001, 0);

// --- Bottom Rail ---
// Group: position [0, 0, 0], rotation [0, 0, 0]
// Segment: rotation [0, PI/2, 0]
const horizGroup = new THREE.Group();
const horizMesh = new THREE.Mesh();
horizMesh.rotation.set(0, Math.PI / 2, 0);
horizGroup.add(horizMesh);
horizGroup.updateMatrixWorld(true);

const globalHoriz = localPoint.clone().applyMatrix4(horizMesh.matrixWorld);
console.log("Bottom Rail Pocket Point (global):", globalHoriz);


// --- Case A: group rotation [0, 0, -Math.PI / 2], position [0, H, 0] ---
const groupA = new THREE.Group();
groupA.position.set(0, 2.1, 0);
groupA.rotation.set(0, 0, -Math.PI / 2);
const meshA = new THREE.Mesh();
meshA.rotation.set(0, Math.PI / 2, 0);
groupA.add(meshA);
groupA.updateMatrixWorld(true);

const globalA = localPoint.clone().applyMatrix4(meshA.matrixWorld);
console.log("Case A Vertical Pocket Point (global):", globalA);


// --- Case B: group rotation [0, 0, Math.PI / 2], position [0, 0, 0] ---
const groupB = new THREE.Group();
groupB.position.set(0, 0, 0);
groupB.rotation.set(0, 0, Math.PI / 2);
const meshB = new THREE.Mesh();
meshB.rotation.set(0, Math.PI / 2, 0);
groupB.add(meshB);
groupB.updateMatrixWorld(true);

const globalB = localPoint.clone().applyMatrix4(meshB.matrixWorld);
console.log("Case B Vertical Pocket Point (global):", globalB);
