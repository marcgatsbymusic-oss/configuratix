import * as THREE from 'three';

const baseMin = new THREE.Vector3(-0.7044051885604858, -0.01946735382080078, -0.40049609541893005);
const baseMax = new THREE.Vector3(0.4766972064971924, 2.618328094482422, 0.03257495164871216);

const handleMin = new THREE.Vector3(-0.5006213784217834, -4.322551250457764, -1.2815855741500854);
const handleMax = new THREE.Vector3(0.4466323256492615, 0.5246505737304688, 0.4848555028438568);

const euler = new THREE.Euler(Math.PI, 0, 0, 'XYZ');
const matrix = new THREE.Matrix4().makeRotationFromEuler(euler);

const ux = new THREE.Vector3(1, 0, 0).applyMatrix4(matrix);
const uy = new THREE.Vector3(0, 1, 0).applyMatrix4(matrix);
const uz = new THREE.Vector3(0, 0, 1).applyMatrix4(matrix);

console.log('Rotation mapping for [Math.PI, 0, 0]:');
console.log(`  Local X (1,0,0) -> Parent: [${ux.x.toFixed(4)}, ${ux.y.toFixed(4)}, ${ux.z.toFixed(4)}]`);
console.log(`  Local Y (0,1,0) -> Parent: [${uy.x.toFixed(4)}, ${uy.y.toFixed(4)}, ${uy.z.toFixed(4)}]`);
console.log(`  Local Z (0,0,1) -> Parent: [${uz.x.toFixed(4)}, ${uz.y.toFixed(4)}, ${uz.z.toFixed(4)}]`);

function getRotatedBounds(min, max, mat) {
  const vertices = [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ];

  let rMin = new THREE.Vector3(Infinity, Infinity, Infinity);
  let rMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

  for (const v of vertices) {
    v.applyMatrix4(mat);
    rMin.min(v);
    rMax.max(v);
  }

  return { min: rMin, max: rMax };
}

const scale = 0.025;
const rotBase = getRotatedBounds(baseMin, baseMax, matrix);
const rotHandle = getRotatedBounds(handleMin, handleMax, matrix);

console.log('\nRotated Base Bounds (scaled):');
console.log(`  Min: [${(rotBase.min.x * scale).toFixed(6)}, ${(rotBase.min.y * scale).toFixed(6)}, ${(rotBase.min.z * scale).toFixed(6)}]`);
console.log(`  Max: [${(rotBase.max.x * scale).toFixed(6)}, ${(rotBase.max.y * scale).toFixed(6)}, ${(rotBase.max.z * scale).toFixed(6)}]`);

console.log('\nRotated Handle Bounds (scaled):');
console.log(`  Min: [${(rotHandle.min.x * scale).toFixed(6)}, ${(rotHandle.min.y * scale).toFixed(6)}, ${(rotHandle.min.z * scale).toFixed(6)}]`);
console.log(`  Max: [${(rotHandle.max.x * scale).toFixed(6)}, ${(rotHandle.max.y * scale).toFixed(6)}, ${(rotHandle.max.z * scale).toFixed(6)}]`);
