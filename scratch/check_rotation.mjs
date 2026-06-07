import * as THREE from 'three';

const euler = new THREE.Euler(0, Math.PI / 2, 0, 'XYZ');
const q = new THREE.Quaternion().setFromEuler(euler);

const localZ = new THREE.Vector3(0, 0, 1);
localZ.applyQuaternion(q);
console.log('Local Z maps to:', localZ.toArray().map(v => Math.round(v)));

const localY = new THREE.Vector3(0, 1, 0);
localY.applyQuaternion(q);
console.log('Local Y maps to:', localY.toArray().map(v => Math.round(v)));

const localX = new THREE.Vector3(1, 0, 0);
localX.applyQuaternion(q);
console.log('Local X maps to:', localX.toArray().map(v => Math.round(v)));
