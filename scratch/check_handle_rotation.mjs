import * as THREE from 'three';

const euler = new THREE.Euler(Math.PI / 2, Math.PI + Math.PI / 2, 0, 'XYZ');
const matrix = new THREE.Matrix4().makeRotationFromEuler(euler);

const ux = new THREE.Vector3(1, 0, 0).applyMatrix4(matrix);
const uy = new THREE.Vector3(0, 1, 0).applyMatrix4(matrix);
const uz = new THREE.Vector3(0, 0, 1).applyMatrix4(matrix);

console.log('Rotation mapping:');
console.log(`  Local X (1,0,0) -> Parent: [${ux.x.toFixed(4)}, ${ux.y.toFixed(4)}, ${ux.z.toFixed(4)}]`);
console.log(`  Local Y (0,1,0) -> Parent: [${uy.x.toFixed(4)}, ${uy.y.toFixed(4)}, ${uy.z.toFixed(4)}]`);
console.log(`  Local Z (0,0,1) -> Parent: [${uz.x.toFixed(4)}, ${uz.y.toFixed(4)}, ${uz.z.toFixed(4)}]`);
