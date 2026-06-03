/**
 * test_cutaxis_y.js
 * Verify that cutAxis='y' (rotation.y instead of rotation.x) with group=[0,0,-PI/2]
 * produces the correct matching cut normals at both corners.
 */
import * as THREE from 'three';

// Cut normal computation with rotation.y
function computeCutNormal(cutRotY, segEuler, groupEuler, isLeftCut) {
  // left cut keeps +Z side: local normal (0,0,1)
  // right cut keeps -Z side: local normal (0,0,-1)
  const localN = isLeftCut ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 0, -1);
  
  // Apply cut rotation around Y:
  localN.applyEuler(new THREE.Euler(0, cutRotY, 0));
  
  // Apply segment rotation:
  localN.applyEuler(segEuler);
  
  // Apply group rotation:
  localN.applyEuler(groupEuler);
  
  return localN;
}

// Known horizontal rail normals:
// Bottom left cut: invertCuts=false, rotation.x=PI/4 applied to (0,0,1), then inner group [0,PI/2,0]
const bottomLeftN = new THREE.Vector3(0, 0, 1);
bottomLeftN.applyEuler(new THREE.Euler(Math.PI/4, 0, 0));
bottomLeftN.applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('Bottom rail left cut world normal:', bottomLeftN.toArray().map(v=>v.toFixed(3)));

// Top left cut: invertCuts=true, rotation.x=-PI/4 applied to (0,0,1), then inner group [0,PI/2,0]
const topLeftN = new THREE.Vector3(0, 0, 1);
topLeftN.applyEuler(new THREE.Euler(-Math.PI/4, 0, 0));
topLeftN.applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('Top rail left cut world normal:', topLeftN.toArray().map(v=>v.toFixed(3)));

const gE = new THREE.Euler(0, 0, -Math.PI/2);
const sE = new THREE.Euler(0, Math.PI/2, 0);
const sign = 1; // invertCuts=false

console.log('');
console.log('=== Vertical [group=-PI/2, seg=PI/2, cutAxis=y, invertCuts=false] ===');
// Right cut at bottom corner (z=length end): rotation.y = -PI/4 * sign = -PI/4
const vertRightN = computeCutNormal(-Math.PI/4 * sign, sE, gE, false);
console.log('Vert right cut (bottom corner):', vertRightN.toArray().map(v=>v.toFixed(3)));
console.log('  Target: opposite of bottom left =', bottomLeftN.clone().negate().toArray().map(v=>v.toFixed(3)));
console.log('  Dot:', vertRightN.dot(bottomLeftN.clone().negate()).toFixed(3));

// Left cut at top corner (z=0 end): rotation.y = +PI/4 * sign = +PI/4
const vertLeftN = computeCutNormal(Math.PI/4 * sign, sE, gE, true);
console.log('Vert left cut (top corner):', vertLeftN.toArray().map(v=>v.toFixed(3)));
console.log('  Target: opposite of top left =', topLeftN.clone().negate().toArray().map(v=>v.toFixed(3)));
console.log('  Dot:', vertLeftN.dot(topLeftN.clone().negate()).toFixed(3));

console.log('');
console.log('=== With invertCuts=true (sign=-1) ===');
const signInv = -1;
const vertRightNInv = computeCutNormal(-Math.PI/4 * signInv, sE, gE, false);
const vertLeftNInv = computeCutNormal(Math.PI/4 * signInv, sE, gE, true);
console.log('Vert right cut (inv=T):', vertRightNInv.toArray().map(v=>v.toFixed(3)), 'dot bottom:', vertRightNInv.dot(bottomLeftN.clone().negate()).toFixed(3));
console.log('Vert left cut (inv=T):', vertLeftNInv.toArray().map(v=>v.toFixed(3)), 'dot top:', vertLeftNInv.dot(topLeftN.clone().negate()).toFixed(3));
