/**
 * test_corners.js
 * 
 * Simulates the EXACT cut plane normals at the bottom-right corner (point A)
 * for:
 *   1. Bottom horizontal rail  (left end, z=0, invertCuts=false)
 *   2. Right vertical rail     (right end, z=sashLength or z=height, invertCuts=false)
 *
 * FrameSegment CSG logic (from FrameSegment.tsx):
 *   Left cut:  rotation.x = (PI/4) * sign,  then translateZ(-boxSize/2)  → normal faces +Z side
 *   Right cut: rotation.x = (-PI/4) * sign, then translateZ(+boxSize/2)  → normal faces -Z side
 *   sign = invertCuts ? -1 : 1
 *
 * The mesh inside each segment is always: rotation=[0, PI/2, 0]
 * meaning the extrusion runs along global X.
 *
 * For bottom horizontal:
 *   Group rotation: [0, 0, 0], then inner group [0, PI/2, 0]
 *   → extrusion runs along global X from X=0 to X=W
 *   Left cut (z=0 end) → at global X=0
 *   Right cut (z=W end) → at global X=W
 *
 * For right vertical (frame, invertCuts=false):
 *   Group rotation: [0, 0, -PI/2], position [0, H, 0]
 *   Inner segment rotation: [0, PI/2, 0]
 *   Extrusion runs along local +Z inside segment
 *   After group rotation [0,0,-PI/2]: local segment Z → global -Y
 *   So the segment extrudes from global Y=H downward
 *   Left cut (z=0) → at group Y=H (top of window) 
 *   Right cut (z=height) → at group Y = H - height*scale = 0 (bottom of window) ← corner A
 *
 * At corner A (bottom-right, global X=0, Y=0):
 *   - Bottom rail LEFT cut normal (invertCuts=false, sign=+1):
 *       rotation.x = +PI/4 → the box is tilted so that it cuts with plane normal in XZ plane
 *       In local segment coords (after [0,PI/2,0] mesh rotation): normal = (sin(PI/4), 0, cos(PI/4))
 *       After group [0,PI/2,0]: x→z, z→-x → normal in world = (cos(PI/4), 0, -sin(PI/4)) = (+0.707, 0, -0.707)
 *
 *   - Vertical rail RIGHT cut normal (invertCuts=false, sign=+1):
 *       rotation.x = -PI/4 → box tilted -PI/4 around its local X
 *       In local segment coords: normal = (sin(-PI/4), 0, cos(-PI/4)) ... let's compute properly
 *
 * Let me compute this more carefully using proper matrix math.
 */

import * as THREE from 'three';

// Helper: get the cut plane normal for a CSG cut box
// The box is positioned and rotated as in FrameSegment.tsx, then we extract its local +Z normal
// to find the cutting plane normal that faces INTO the brush
function getCutNormal(position, rotationX, translateZ) {
  const box = new THREE.Object3D();
  box.position.set(position.x, position.y, position.z);
  box.rotation.x = rotationX;
  box.translateZ(translateZ);
  box.updateMatrixWorld(true);
  
  // The cut plane normal is the local +Y of the box (since rotation.x tilts the box around X,
  // the top face normal is the cutting face). Actually the cutting plane is the face of the 
  // box that intersects the mesh - let's think about this differently.
  // 
  // The box rotates around X by rotationX. Its local Z axis after rotation:
  const localZ = new THREE.Vector3(0, 0, 1);
  localZ.applyEuler(new THREE.Euler(rotationX, 0, 0));
  return localZ;
}

// ─── Bottom horizontal rail ────────────────────────────────────────────────────
// Setup: outer group [0,0,0], inner group [0, PI/2, 0], segment rotation [0, PI/2, 0]
// The segment itself has rotation [0, PI/2, 0] applied inside the FrameSegment mesh
// 
// Left cut of bottom rail (z=0 end, sign=+1):
//   leftBrush.rotation.x = PI/4
//   leftBrush.translateZ(-boxSize/2)
//
// The cut plane normal in SEGMENT local space (before any group transforms):
// After rotation.x = PI/4, the box top face normal (local Y) = (0, cos(PI/4), sin(PI/4))
// But what we care about is the PLANE normal that separates keep from discard.
// The box cuts away the -Z side of the mesh (z < 0 is discarded, z > 0 is kept for left cut)
// So the cut plane normal pointing toward the kept side is +Z in local segment coords = (0, 0, 1)
// After rotation.x = PI/4, this becomes: (0, -sin(PI/4), cos(PI/4))

console.log('=== BOTTOM RAIL LEFT CUT (at global X=0) ===');
// Segment local space normal of kept half:
const bottomLeftCutLocalNormal = new THREE.Vector3(0, -Math.sin(Math.PI/4), Math.cos(Math.PI/4));
console.log('In segment local coords:', bottomLeftCutLocalNormal);

// Apply segment mesh rotation [0, PI/2, 0]:
const bottomLeftCutMeshNormal = bottomLeftCutLocalNormal.clone().applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('After mesh rotation [0, PI/2, 0]:', bottomLeftCutMeshNormal);

// Apply inner group rotation [0, PI/2, 0]:
const bottomLeftCutInnerNormal = bottomLeftCutMeshNormal.clone().applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('After inner group [0, PI/2, 0] (world):', bottomLeftCutInnerNormal);

console.log('');
console.log('=== VERTICAL RAIL RIGHT CUT (at global Y=0, corner A) ===');
// Vertical rail: group rotation [0, 0, -PI/2]
// Segment mesh rotation [0, PI/2, 0]
// Right cut (z=length end, sign=+1): rotation.x = -PI/4, translateZ(+boxSize/2)
// The cut plane normal pointing toward kept half is -Z in local coords = (0, 0, -1)
// After rotation.x = -PI/4: (0, sin(-PI/4), cos(-PI/4)) ... 
// Actually for right cut: the box sits at z=length, tilted -PI/4.
// The kept region is z < length, so the normal pointing AWAY from discard is -Z:
const vertRightCutLocalNormal = new THREE.Vector3(0, Math.sin(Math.PI/4), Math.cos(Math.PI/4));
// (rotation.x = -PI/4 applied to (0,0,-1): (0, sin(PI/4), -cos(PI/4))... let me be more careful)
// vec (0,0,-1) rotated by Euler(x=-PI/4): 
//   y' = y*cos(-PI/4) - z*sin(-PI/4) = 0 + sin(PI/4) = sin(PI/4)
//   z' = y*sin(-PI/4) + z*cos(-PI/4) = 0 - cos(PI/4) = -cos(PI/4)
const vertRightCutSegmentNormal = new THREE.Vector3(0, Math.sin(Math.PI/4), -Math.cos(Math.PI/4));
console.log('In segment local coords:', vertRightCutSegmentNormal);

// Apply segment mesh rotation [0, PI/2, 0]:
const vertRightCutMeshNormal = vertRightCutSegmentNormal.clone().applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('After mesh rotation [0, PI/2, 0]:', vertRightCutMeshNormal);

// Apply group rotation [0, 0, -PI/2]:
const vertRightCutWorldNormal = vertRightCutMeshNormal.clone().applyEuler(new THREE.Euler(0, 0, -Math.PI/2));
console.log('After group rotation [0, 0, -PI/2] (world):', vertRightCutWorldNormal);

console.log('');
console.log('=== DOT PRODUCT (should be -1 for perfect mitre match) ===');
const dot = bottomLeftCutInnerNormal.dot(vertRightCutWorldNormal);
console.log('Dot product:', dot);

console.log('');
console.log('=== TRYING WITH invertCuts=true ON VERTICAL ===');
// If we use invertCuts=true on vertical, sign=-1:
// Right cut: rotation.x = (-PI/4) * (-1) = PI/4
// Kept side normal in local coords: (0, 0, -1) rotated by PI/4:
//   y' = 0*cos(PI/4) - (-1)*sin(PI/4) = sin(PI/4)
//   z' = 0*sin(PI/4) + (-1)*cos(PI/4) = -cos(PI/4)
const vertInvNormal = new THREE.Vector3(0, Math.sin(Math.PI/4), -Math.cos(Math.PI/4));
const vertInvMeshNormal = vertInvNormal.clone().applyEuler(new THREE.Euler(0, Math.PI/2, 0));
const vertInvWorldNormal = vertInvMeshNormal.clone().applyEuler(new THREE.Euler(0, 0, -Math.PI/2));
console.log('Vertical right cut with invertCuts=true (world):', vertInvWorldNormal);
const dot2 = bottomLeftCutInnerNormal.dot(vertInvWorldNormal);
console.log('Dot product with invertCuts=true:', dot2);
