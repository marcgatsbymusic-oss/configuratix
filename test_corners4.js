/**
 * test_corners4.js - Final verification
 *
 * CONFIRMED: Segment rotation [PI/2, 0, 0] (no group rotation):
 *   Bottom-right (right cut, invertCuts=true): dot = -1 ✓
 *
 * Now need to check top-right corner.
 * The top rail uses invertCuts=true.
 * The top rail is positioned at Y=deltaY (≈ 1775mm above bottom).
 * Top rail left cut at z=0 end → global X=0 (right side of screen).
 *
 * The top rail left cut: sign=-1, rotation.x = PI/4*(-1) = -PI/4
 * The KEPT side is z > 0, so kept normal = (0,0,1) local.
 * After rotation.x = -PI/4: y' = 0*cos(-PI/4) - 1*sin(-PI/4) = sin(PI/4) = 0.707
 *                            z' = 0*sin(-PI/4) + 1*cos(-PI/4) = cos(PI/4) = 0.707
 * So (0, 0.707, 0.707) in local segment space.
 * The top rail segment has NO mesh rotation prop set, meaning rotation=[0,0,0] default.
 * But wait - actually the top rail IS wrapped in [0, PI/2, 0] inner group (line 337 in viewer).
 * So after inner group: apply [0, PI/2, 0] to (0, 0.707, 0.707):
 *   x' = 0*cos(PI/2) + 0.707*sin(PI/2) = 0.707
 *   y' = 0.707 (unchanged)
 *   z' = -0*sin(PI/2) + 0.707*cos(PI/2) = 0
 * World: (0.707, 0.707, 0)
 *
 * For the vertical segment left cut (z=0 end = top of window, at Y=H):
 * Using rotation [PI/2, 0, 0], no group.
 * Vertical extrudes from Y=H downward (i.e., z=0 = top, z=height = bottom).
 * Left cut (z=0 end, top of window) should connect to TOP RAIL.
 * sign=? what invertCuts do we need?
 *
 * We need world normal of vert left cut = (-0.707, -0.707, 0) [opposite of top rail cut normal]
 */
import * as THREE from 'three';

// Top rail left cut world normal: (0.707, 0.707, 0) [computed above]
const topRailLeftWorldNormal = new THREE.Vector3(0.7071067811865475, 0.7071067811865476, 0);
console.log('Top rail left cut world normal:', topRailLeftWorldNormal);

// The vertical segment left cut normal in world space must be (-0.707, -0.707, 0).
// Using segment rotation [PI/2, 0, 0]:
// local normal of kept side = (0, 0, 1) (left cut keeps z > 0 side)
// After rotation.x = PI/4 * sign (for left cut):
// Case sign=+1 (invertCuts=false): rotation.x = PI/4
//   (0,0,1) → y'=-sin(PI/4)=-0.707, z'=cos(PI/4)=0.707 → (0, -0.707, 0.707)
//   After seg rotation [PI/2, 0, 0]:
const n1 = new THREE.Vector3(0, -Math.sin(Math.PI/4), Math.cos(Math.PI/4));
n1.applyEuler(new THREE.Euler(Math.PI/2, 0, 0));
console.log('Vert left cut, sign=+1, world:', n1);
console.log('  Dot with top rail:', topRailLeftWorldNormal.dot(n1));

// Case sign=-1 (invertCuts=true): rotation.x = -PI/4
//   (0,0,1) → y'=sin(PI/4)=0.707, z'=cos(PI/4)=0.707 → (0, 0.707, 0.707)
//   After seg rotation [PI/2, 0, 0]:
const n2 = new THREE.Vector3(0, Math.sin(Math.PI/4), Math.cos(Math.PI/4));
n2.applyEuler(new THREE.Euler(Math.PI/2, 0, 0));
console.log('Vert left cut, sign=-1 (invertCuts=true), world:', n2);
console.log('  Dot with top rail:', topRailLeftWorldNormal.dot(n2));

console.log('');
console.log('=== BOTTOM-RIGHT CORNER RECAP ===');
// Bottom rail left cut: invertCuts=false, sign=+1, rotation.x=PI/4
// kept normal (0,0,1) after PI/4:
const bRailN = new THREE.Vector3(0, -Math.sin(Math.PI/4), Math.cos(Math.PI/4));
// Apply inner group [0, PI/2, 0]:
bRailN.applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('Bottom rail left cut world normal:', bRailN);

// Vertical right cut (z=height end, BOTTOM of window), invertCuts=true (sign=-1):
// rotation.x = (-PI/4)*(-1) = PI/4
// kept normal (0,0,-1) after PI/4:
//   y' = 0*cos(PI/4) - (-1)*sin(PI/4) = sin(PI/4) = 0.707
//   z' = 0*sin(PI/4) + (-1)*cos(PI/4) = -cos(PI/4) = -0.707
const vRightN = new THREE.Vector3(0, Math.sin(Math.PI/4), -Math.cos(Math.PI/4));
vRightN.applyEuler(new THREE.Euler(Math.PI/2, 0, 0));
console.log('Vert right cut, invertCuts=true, world:', vRightN);
console.log('Dot bottom-right:', bRailN.dot(vRightN));

console.log('');
console.log('=== CONCLUSION ===');
console.log('Using segment rotation [PI/2, 0, 0] with no group rotation:');
console.log('  - invertCuts=true on vertical → bottom-right corner matches (dot=-1)');
console.log('  - invertCuts=true on vertical → top-right corner sign=+1 gives dot:', topRailLeftWorldNormal.dot(n1));
console.log('  - invertCuts=true on vertical → top-right corner sign=-1 gives dot:', topRailLeftWorldNormal.dot(n2));
console.log('');
console.log('Need per-cut inversion: right cut uses invertCuts=true (for bottom), left cut needs something different (for top)');
console.log('So we DO need invertLeftCut and invertRightCut support after all.');
console.log('');
console.log('Bottom corner: right cut, need invertCuts=true → invertRightCut=true');
console.log('Top corner: left cut,', topRailLeftWorldNormal.dot(n1) === -1 ? 'invertCuts=false' : 'invertCuts=true (dot=-1)?', topRailLeftWorldNormal.dot(n2));
