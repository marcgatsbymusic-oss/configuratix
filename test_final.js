/**
 * test_final.js
 * 
 * For the vertical segment to produce XY-plane mitre cuts matching horizontal rails:
 * 
 * Horizontal rails:
 *   - Extrusion along world X
 *   - Profile depth along world -Z  
 *   - Profile cross-section Y along world +Y
 *   - CSG cut rotation.x = around world -Z (profile X = world -Z after [0,PI/2,0])
 *   - Cut plane tilts in XY plane → correct 45° front-view mitre ✓
 *
 * Vertical rails need:
 *   - Extrusion along world Y
 *   - Profile depth along world -Z (same as horizontal - matches at corners!)
 *   - Profile cross-section Y along world +X (pointing INTO the frame from X=0)  
 *   - CSG cut must rotate around world Y (so plane tilts in XY plane at 45°) ✓
 *
 * For CSG cut rotation.x to rotate around world Y, we need:
 *   The segment's LOCAL X axis = world Y
 * 
 * Desired local axes:
 *   Local X = world Y (so rotation.x = rotation around world Y)
 *   Local Y = world X (profile height goes in +X direction)
 *   Local Z = world Y ... wait, that's the same as local X. Contradiction.
 * 
 * The extrusion runs along LOCAL Z of the segment geometry.
 * If local Z = world Y (extrusion goes up), and local X = world Y too, that's impossible.
 *
 * So we CANNOT have local X = world Y and local Z = world Y simultaneously.
 *
 * The only solution: CHANGE the cut rotation axis from X to Y explicitly.
 * This is exactly what cutAxis='y' does (rotates cut brush around its Y axis).
 *
 * The REAL question is: what segment rotation + group rotation makes:
 *   - Extrusion along world Y ✓
 *   - Profile depth along world -Z ✓
 *   - Profile height along world +X ✓
 *   AND: cut brush rotation.y in segment-local space = rotation around world Y in world space
 *        (so the cut tilts in the world XY plane at 45°)
 *
 * For rotation.y on cut brush to produce world-space rotation around world Y:
 *   The segment's local Y axis must be world Y.
 *
 * Desired local axes:
 *   Local Z = world Y (extrusion → up)
 *   Local X = world -Z (depth)
 *   Local Y = world X (cross-section height)
 *   → Local Y = world Y would require... no, local Y = world X from above.
 *
 * Hmm. Let's try to find a rotation where local Y = world Y AND local Z = world Y is NOT required.
 * We need local Z = world Y (extrusion), local Y = world Y... impossible.
 *
 * So there's no configuration of group+segment where BOTH extrusion=worldY AND localY=worldY.
 *
 * DIFFERENT APPROACH: rotate the cut brush around world Y by constructing the rotation differently.
 * Instead of brush.rotation.y, we can set brush.rotation such that the box's local X → world Y.
 *
 * But FrameSegment only sets rotation.x or rotation.y on the brush. The brush's rotation
 * is in SEGMENT LOCAL SPACE (before group transforms). For the brush's rotation.y to be
 * around world Y, the segment's local Y must be world Y.
 *
 * Let's find what group+segment makes local Y = world Y:
 * 
 * Current vertical: group=[0,0,-PI/2], seg=[0,PI/2,0]
 * Local Y after seg [0,PI/2,0]: (0,1,0) stays (0,1,0) [Y axis unchanged by Y-rotation]
 * After group [0,0,-PI/2]: (0,1,0) → Z-rotation by -PI/2: y'=y*cos+x*sin=1*0+0*(-1)=0... 
 * Z rotation matrix: [cos,-sin,0; sin,cos,0; 0,0,1]
 * For -PI/2: cos=0, sin=-1: [0,1,0; -1,0,0; 0,0,1]
 * (0,1,0) → (0*0 + 1*1, 0*(-1) + 1*0, 0) = (1, 0, 0) = world X
 *
 * So current vertical: local Y → world X ✓ (profile height goes toward +X, into the frame)
 *
 * We need local Y = world Y. Let's see what group rotation achieves that:
 * If seg=[0,PI/2,0], local Y = (0,1,0) before group.
 * After group R, local Y should be (0,1,0) = world Y.
 * So group must map (0,1,0) → (0,1,0): identity or Z-180° or Y-rotation (any Y keeps Y).
 * 
 * If group = [0, 0, 0] (no rotation): seg=[0,PI/2,0]
 *   Local Z = extrusion = (0,0,1) → [0,PI/2,0] → (1,0,0) = world X (horizontal!)
 *   Not what we want.
 *
 * If group = [0, 0, PI] (Z-180°):
 *   After seg [0,PI/2,0]: extrusion = (1,0,0)
 *   After group [0,0,PI]: Z-180° → (1,0,0) → (-1,0,0) = world -X. Still horizontal.
 *
 * The ONLY way to get extrusion along world Y is if the segment-local Z (after all transforms) = world Y.
 *   After seg [0,PI/2,0]: local Z = (1,0,0)
 *   After group R: (1,0,0) should → (0,1,0) = world Y
 *   This requires group R that maps X→Y = Z rotation by +PI/2 (not -PI/2!)
 *   Group [0,0,+PI/2]: [0,-1,0; 1,0,0; 0,0,1] * (1,0,0) = (0,1,0) ✓
 *
 * So group=[0,0,+PI/2] makes extrusion = world Y.
 * But then local Y: (0,1,0) → group [0,0,+PI/2] → (-1,0,0) = world -X.
 * Profile height along world -X means profile extends to the LEFT of X=0. That's outside the window!
 *
 * So BOTH group signs fail: -PI/2 has extrusion along world -Y (downward), +PI/2 has profile in wrong direction.
 *
 * WAIT: the test showed extrusion = (0,-1,0) for group=[0,0,-PI/2]. Let me check +PI/2:
 */
import * as THREE from 'three';

const seg = new THREE.Euler(0, Math.PI/2, 0);
const gNeg = new THREE.Euler(0, 0, -Math.PI/2);
const gPos = new THREE.Euler(0, 0, +Math.PI/2);

const extrusionVec = new THREE.Vector3(0, 0, 1);
const e1 = extrusionVec.clone().applyEuler(seg).applyEuler(gNeg);
const e2 = extrusionVec.clone().applyEuler(seg).applyEuler(gPos);
console.log('Extrusion with group -PI/2:', e1.toArray().map(v=>v.toFixed(3)));
console.log('Extrusion with group +PI/2:', e2.toArray().map(v=>v.toFixed(3)));

const localY = new THREE.Vector3(0, 1, 0);
const y1 = localY.clone().applyEuler(seg).applyEuler(gNeg);
const y2 = localY.clone().applyEuler(seg).applyEuler(gPos);
console.log('Local Y with group -PI/2 (profile height):', y1.toArray().map(v=>v.toFixed(3)));
console.log('Local Y with group +PI/2 (profile height):', y2.toArray().map(v=>v.toFixed(3)));

console.log('');
console.log('group -PI/2: extrusion=-Y, profileHeight=+X (correct direction but extruding DOWN)');
console.log('group +PI/2: extrusion=+Y, profileHeight=-X (extruding UP but profile mirrored)');

// For group=-PI/2: extrusion goes DOWN (from group position toward world -Y).
// That means if we position the group at Y=H and extrusion goes -Y, 
// the segment fills from Y=H to Y=H-length = Y=0. That's correct!
// The BOTTOM of the segment (z=length in local) is at Y=0 (bottom of window).
// The TOP (z=0) is at Y=H.
// So: LEFT cut (z=0 end) is at the TOP corner, RIGHT cut (z=length) is at BOTTOM corner.

// For the bottom-right corner (Y=0), we use the RIGHT cut.
// For the top-right corner (Y=H), we use the LEFT cut.
// This matches the current code structure.

// Now: with cutAxis='y', the right cut brush rotates around brush local Y.
// The brush's local Y in segment space is (0,1,0).
// After seg [0,PI/2,0]: local Y → (0,1,0) [Y unchanged]
// After group [0,0,-PI/2]: (0,1,0) → (1,0,0) = world X.
// So rotation.y on the brush rotates around world X.
// The cut plane would tilt in the YZ plane (same as rotation.x effect in X rotation!).
// That's the SAME plane, not the XY plane we need.

console.log('');
console.log('With group -PI/2: brush rotation.y rotates around world X (still YZ plane tilt)');
console.log('This is NOT what we need (we need XY plane tilt = rotation around world Z).');

// What we ACTUALLY need: cut brush rotation around world Z.
// In segment-local space, world Z = ?
// After seg [0,PI/2,0]: local Z → (1,0,0) in group space
// After group [0,0,-PI/2]: (1,0,0) → (0,-1,0)... 
// Wait: (1,0,0) via Z-rotation -PI/2 = [0,1,0;-1,0,0;0,0,1](1,0,0) = (0,-1,0)
// So segment local Z → world -Y.
// 
// World Z = (0,0,1) in world. In segment-local = undo group then undo seg:
const worldZ = new THREE.Vector3(0, 0, 1);
// undo group -PI/2 (apply +PI/2):
worldZ.applyEuler(new THREE.Euler(0, 0, Math.PI/2));
// undo seg [0,PI/2,0] (apply [0,-PI/2,0]):
worldZ.applyEuler(new THREE.Euler(0, -Math.PI/2, 0));
console.log('World Z in segment local space:', worldZ.toArray().map(v=>v.toFixed(3)));

// So world Z = (0,0,1) in segment local = local Z. To rotate the brush around world Z,
// we need to set the brush's rotation.z, NOT rotation.x or rotation.y.
console.log('');
console.log('To rotate brush around world Z, we need brush.rotation.z');
console.log('This requires a cutAxis=z option in FrameSegment.');

// Verify: with brush rotation.z, what cut normals do we get?
function computeCutNormalZ(cutRotZ, segE, groupE, isLeftCut) {
  const localN = isLeftCut ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 0, -1);
  localN.applyEuler(new THREE.Euler(0, 0, cutRotZ));
  localN.applyEuler(segE);
  localN.applyEuler(groupE);
  return localN;
}

const sign = 1; // invertCuts=false
const rightCutN = computeCutNormalZ(-Math.PI/4 * sign, seg, gNeg, false);
const leftCutN = computeCutNormalZ(Math.PI/4 * sign, seg, gNeg, true);

// Target normals:
const bottomTargetN = new THREE.Vector3(-0.707, 0.707, 0);
const topTargetN = new THREE.Vector3(-0.707, -0.707, 0);

console.log('');
console.log('=== With cutAxis=z (brush rotation.z) ===');
console.log('Right cut (bottom corner):', rightCutN.toArray().map(v=>v.toFixed(3)));
console.log('  Dot with target:', rightCutN.dot(bottomTargetN).toFixed(3), '(want -1)');
console.log('Left cut (top corner):', leftCutN.toArray().map(v=>v.toFixed(3)));
console.log('  Dot with target:', leftCutN.dot(topTargetN).toFixed(3), '(want -1)');

// Also try invertCuts=true:
const signInv = -1;
const rightCutNInv = computeCutNormalZ(-Math.PI/4 * signInv, seg, gNeg, false);
const leftCutNInv = computeCutNormalZ(Math.PI/4 * signInv, seg, gNeg, true);
console.log('With invertCuts=true:');
console.log('Right cut (bottom):', rightCutNInv.toArray().map(v=>v.toFixed(3)), 'dot:', rightCutNInv.dot(bottomTargetN).toFixed(3));
console.log('Left cut (top):', leftCutNInv.toArray().map(v=>v.toFixed(3)), 'dot:', leftCutNInv.dot(topTargetN).toFixed(3));
