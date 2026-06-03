/**
 * test_corners3.js
 *
 * Key insight: FrameSegment always rotates the CSG brush around X-axis.
 * But for vertical segments (group rotation [0,0,-PI/2]), this produces the wrong cut plane.
 *
 * Solution A: Add a `cutAxis` prop ('x' default, 'y' for vertical segments)
 * Solution B: Don't rotate the group [0,0,-PI/2]; instead rotate the segment itself.
 *             i.e. use a single group with NO rotation, just position the mesh differently.
 *
 * Solution B approach:
 *   - Remove group rotation for vertical
 *   - Pass rotation=[PI/2, 0, 0] to segment (extruding along Y)
 *   - The extrusion runs along local +Z of the shape; after rotation [PI/2,0,0] → global Y
 *   - Position group at [0, 0, 0] for bottom-anchored extrusion
 *
 * Let's test: if segment has rotation [PI/2, 0, 0] and NO outer group rotation:
 *   Extrusion local Z → after [PI/2,0,0] → global Y ✓ (goes up)
 *
 * For vertical right cut (z=height end, invertCuts=false, sign=1):
 *   rotation.x = (-PI/4) * 1 = -PI/4
 *   Box placed at z=height, then translateZ(+boxSize/2)
 *   Cut plane normal (kept side = z < height, facing -Z):
 *   (0, 0, -1) after rotation.x = -PI/4:
 *     y' = 0*cos(-PI/4) - (-1)*sin(-PI/4) = -sin(PI/4) = -0.707
 *     z' = 0*sin(-PI/4) + (-1)*cos(-PI/4) = -cos(PI/4) = -0.707
 *   So in local-after-cut-rotation space: (0, -0.707, -0.707)
 *
 *   Now apply segment rotation [PI/2, 0, 0]:
 *     (0, y, z) → (x, y*cos(PI/2)-z*sin(PI/2), y*sin(PI/2)+z*cos(PI/2))
 *              = (0, 0*1 - (-0.707)*1, -0.707*1 + (-0.707)*0)
 *     Hmm let me compute properly:
 */
import * as THREE from 'three';

console.log('=== Solution B: segment rotation [PI/2, 0, 0], no group rotation ===');
console.log('');

// Bottom rail left cut normal in world space (from test_corners.js result):
// World: (0, -0.707, -0.707)
const bottomLeftWorldNormal = new THREE.Vector3(0, -0.7071067811865475, -0.7071067811865476);
console.log('Bottom rail left cut world normal:', bottomLeftWorldNormal);

// Vertical segment right cut (z=height end, sign=1, rotation.x = -PI/4):
// local-before-segment-rotation normal = (0, 0, -1) → after rotation.x = -PI/4:
const preSegNormal = new THREE.Vector3(0, 0, -1);
preSegNormal.applyEuler(new THREE.Euler(-Math.PI/4, 0, 0));
console.log('Normal after cut box rotation.x=-PI/4:', preSegNormal);

// Apply segment rotation [PI/2, 0, 0]:
const worldNormal = preSegNormal.clone().applyEuler(new THREE.Euler(Math.PI/2, 0, 0));
console.log('After segment rotation [PI/2,0,0] (world):', worldNormal);

const dot = bottomLeftWorldNormal.dot(worldNormal);
console.log('Dot product:', dot, '(want -1)');

console.log('');
console.log('=== Testing with invertCuts=true on vertical ===');
const preSegNormal2 = new THREE.Vector3(0, 0, -1);
preSegNormal2.applyEuler(new THREE.Euler(Math.PI/4, 0, 0)); // rotation.x = (-PI/4)*(-1) = PI/4
console.log('Normal after cut box rotation.x=+PI/4:', preSegNormal2);
const worldNormal2 = preSegNormal2.clone().applyEuler(new THREE.Euler(Math.PI/2, 0, 0));
console.log('After segment rotation [PI/2,0,0] (world):', worldNormal2);
const dot2 = bottomLeftWorldNormal.dot(worldNormal2);
console.log('Dot product with invertCuts=true:', dot2);

console.log('');
console.log('=== For top corner: vertical LEFT cut vs top rail LEFT cut ===');
// Top rail left cut: invertCuts=true, sign=-1, rotation.x = PI/4*(-1) = -PI/4
// kept side normal (0,0,1) after rotation.x=-PI/4:
const topRailKeptNormal = new THREE.Vector3(0, 0, 1);
topRailKeptNormal.applyEuler(new THREE.Euler(-Math.PI/4, 0, 0));
console.log('Top rail kept normal pre-mesh:', topRailKeptNormal);
// Apply inner group [0, PI/2, 0]:
topRailKeptNormal.applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('After inner group [0,PI/2,0]:', topRailKeptNormal);
// No outer group (outer group is [0,0,0]):
console.log('Top rail left cut world normal:', topRailKeptNormal);

// Vertical left cut (z=0 end, sign=1, rotation.x = PI/4):
// kept side normal (0,0,+1) after rotation.x=PI/4:
const vertLeftKeptNormal = new THREE.Vector3(0, 0, 1);
vertLeftKeptNormal.applyEuler(new THREE.Euler(Math.PI/4, 0, 0));
console.log('Vert left kept normal pre-seg:', vertLeftKeptNormal);
// Apply segment rotation [PI/2, 0, 0]:
vertLeftKeptNormal.applyEuler(new THREE.Euler(Math.PI/2, 0, 0));
console.log('After segment rotation [PI/2,0,0] (world):', vertLeftKeptNormal);

const dot3 = topRailKeptNormal.dot(vertLeftKeptNormal);
console.log('Dot product top corner:', dot3, '(want -1)');

console.log('');
console.log('=== If vertical uses invertCuts=true for left cut at top ===');
// rotation.x = PI/4 * (-1) = -PI/4
const vertLeftInvNormal = new THREE.Vector3(0, 0, 1);
vertLeftInvNormal.applyEuler(new THREE.Euler(-Math.PI/4, 0, 0));
vertLeftInvNormal.applyEuler(new THREE.Euler(Math.PI/2, 0, 0));
console.log('Vert left with invertCuts=true world:', vertLeftInvNormal);
const dot4 = topRailKeptNormal.dot(vertLeftInvNormal);
console.log('Dot product top corner with invertCuts=true:', dot4);

console.log('');
console.log('=== Summary for Solution B ===');
console.log('Segment rotation [PI/2, 0, 0]:');
console.log('  Bottom-right corner (right cut, invertCuts=false): dot =', dot);
console.log('  Top-right corner (left cut, invertCuts=false): dot =', dot3);
console.log('  Top-right corner (left cut, invertCuts=true): dot =', dot4);
