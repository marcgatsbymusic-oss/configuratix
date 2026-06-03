/**
 * test_corners2.js
 *
 * The bottom rail cut normal in world space is: (0, -0.707, -0.707)  [YZ plane]
 * We need the vertical rail right-cut normal in world space to be: (0, +0.707, +0.707)  [opposite = dot -1]
 *
 * The vertical segment setup:
 *   - group rotation [0, 0, -PI/2], position [0, H, 0]
 *   - mesh rotation [0, PI/2, 0] inside segment
 *   - right cut (z = height end): box at z=height, some rotation, then translateZ(+boxSize/2)
 *
 * In FrameSegment, the cut box only rotates around .rotation.x.
 * We need to find: what rotation.x value gives us world normal (0, 0.707, 0.707)?
 *
 * Let's back-track:
 *   World normal target: (0, 0.707, 0.707)
 *   Undo group rotation [0, 0, -PI/2] (apply inverse = [0, 0, +PI/2]):
 *   After group inverse: (0.707, 0, 0.707) ... nope let me compute
 */
import * as THREE from 'three';

const target = new THREE.Vector3(0, 0.7071, 0.7071);

// Undo group rotation [0, 0, -PI/2] — apply inverse (positive PI/2 around Z)
const afterUndoGroup = target.clone().applyEuler(new THREE.Euler(0, 0, Math.PI/2));
console.log('After undoing group [0,0,-PI/2]:', afterUndoGroup);

// Undo mesh rotation [0, PI/2, 0] — apply inverse (negative PI/2 around Y)
const afterUndoMesh = afterUndoGroup.clone().applyEuler(new THREE.Euler(0, -Math.PI/2, 0));
console.log('After undoing mesh [0,PI/2,0]:', afterUndoMesh);

// Now this is the required normal in segment local space.
// The right-cut box rotation.x gives us: kept-side local normal = (0, -sin(rotX), cos(rotX))
// Wait — let me redo this.
// For right cut kept side: the mesh region z < length is kept, so discard is z > length.
// The cut plane faces -Z (toward kept side). So the kept-side normal = (0, 0, -1) in pre-rotation space.
// After rotation.x = angle: (0, 0, -1) → (0, sin(angle), -cos(angle))
// We need: (0, sin(angle), -cos(angle)) = afterUndoMesh
console.log('');
console.log('Required local normal (should be (0, sin(a), -cos(a))):', afterUndoMesh);
const sinA = afterUndoMesh.y;
const cosA = -afterUndoMesh.z;
const angle = Math.atan2(sinA, cosA);
console.log('Required rotation.x =', angle, 'rad =', angle * 180 / Math.PI, 'deg');
console.log('');

// Verify: does rotation.x = angle give the right world normal?
const localNormal = new THREE.Vector3(0, Math.sin(angle), -Math.cos(angle));
console.log('Local normal check:', localNormal);
const meshNormal = localNormal.clone().applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('After mesh rotation:', meshNormal);
const worldNormal = meshNormal.clone().applyEuler(new THREE.Euler(0, 0, -Math.PI/2));
console.log('World normal:', worldNormal);
const dot = new THREE.Vector3(0, -0.7071, -0.7071).dot(worldNormal);
console.log('Dot product with bottom rail cut:', dot, '(should be -1)');

console.log('');
console.log('=== ALTERNATIVE: rotation around Z instead of X ===');
// What if we rotate the cut box around Z instead of X?
// In FrameSegment, only rotation.x is set. But we can try rotation.z:
// For a box with rotation.z = a applied to (0,0,-1):
//   x' = -sin(-PI/2-a) ... this gets complicated.
// Instead let me just try rotation.y:

// Let's try: what if the box is rotated differently?
// Maybe the fix is to change the segment mesh rotation from [0, PI/2, 0] to something else
// for vertical segments, or change the group rotation.

// Actually, the simplest fix: use a different group rotation for vertical segments.
// Current: group [0, 0, -PI/2]
// What if: group [0, 0, PI/2] with position [0, 0, 0] (bottom)?

console.log('=== TRYING: group [0,0,+PI/2], mesh [0,PI/2,0], right cut ===');
// group [0,0,PI/2]: local X→Y, local Y→-X, local Z→Z
// mesh [0,PI/2,0]: local X→-Z, local Y→Y, local Z→X
// So the extrusion direction (local +Z of segment) → through mesh [0,PI/2,0] → global X
// Then through group [0,0,PI/2]: global X → global Y
// Segment extrudes upward from position [0,0,0] to [0, height, 0] ✓
// Right cut (at z=height, bottom of window when reading top-down):
//   rotation.x = -PI/4 * sign (sign=1)
//   local normal of kept side (0,0,-1) after rotation.x = -PI/4:
//   y' = sin(-PI/4) = -0.707, z' = -cos(-PI/4) = -0.707
const vert2LocalNormal = new THREE.Vector3(0, -Math.sin(Math.PI/4), -Math.cos(Math.PI/4));
console.log('Local normal:', vert2LocalNormal);
const vert2MeshNormal = vert2LocalNormal.clone().applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('After mesh:', vert2MeshNormal);
const vert2WorldNormal = vert2MeshNormal.clone().applyEuler(new THREE.Euler(0, 0, Math.PI/2));
console.log('World normal:', vert2WorldNormal);
const dot3 = new THREE.Vector3(0, -0.7071, -0.7071).dot(vert2WorldNormal);
console.log('Dot with bottom left cut:', dot3);

console.log('');
console.log('=== TRYING: group [0,0,+PI/2], mesh [0,PI/2,0], LEFT cut (top corner) ===');
// Left cut at top corner (z=0 end):
//   rotation.x = PI/4 * sign (sign=1)
//   local normal of kept side (0,0,+1) after rotation.x = PI/4:
//   y' = 0*cos(PI/4) - 1*sin(PI/4) = -0.707
//   z' = 0*sin(PI/4) + 1*cos(PI/4) = 0.707
const vert2LeftLocalNormal = new THREE.Vector3(0, -Math.sin(Math.PI/4), Math.cos(Math.PI/4));
const vert2LeftMeshNormal = vert2LeftLocalNormal.clone().applyEuler(new THREE.Euler(0, Math.PI/2, 0));
const vert2LeftWorldNormal = vert2LeftMeshNormal.clone().applyEuler(new THREE.Euler(0, 0, Math.PI/2));
console.log('World normal:', vert2LeftWorldNormal);
// Top rail cut normal (invertCuts=true, sign=-1):
// Left cut: rotation.x = PI/4 * (-1) = -PI/4
// kept-side normal (0,0,1) after -PI/4: y'=sin(PI/4)=0.707, z'=cos(PI/4)=0.707... wait
// For top rail invertCuts=true: sign=-1
// Left cut: rotation.x = PI/4 * (-1) = -PI/4
// Box subtracts the LEFT side of the mesh.
// The plane: box rotated -PI/4 around X, the cutting plane faces +Z.
// The kept local normal = (0, 0, 1) → after -PI/4 around X: y' = sin(PI/4) = 0.707, z' = cos(PI/4) = 0.707
const topRailLeftLocalNormal = new THREE.Vector3(0, Math.sin(Math.PI/4), Math.cos(Math.PI/4));
const topRailLeftMeshNormal = topRailLeftLocalNormal.clone().applyEuler(new THREE.Euler(0, Math.PI/2, 0));
const topRailLeftWorldNormal = topRailLeftMeshNormal.clone().applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('Top rail left cut world normal:', topRailLeftWorldNormal);
const dot4 = vert2LeftWorldNormal.dot(topRailLeftWorldNormal);
console.log('Dot of top corner (vert left cut, top rail left cut):', dot4);
