/**
 * test_systematic.js
 *
 * SYSTEMATIC APPROACH: Find the exact group rotation and invertCuts combination
 * that makes BOTH corners (bottom-right and top-right) match simultaneously.
 *
 * Known world-space cut normals of the HORIZONTAL rails:
 *   Bottom rail LEFT cut (at X=0, global bottom): invertCuts=false → let's compute clean
 *   Top rail LEFT cut (at X=0, global top): invertCuts=true → let's compute clean
 *
 * Setup for horizontal rails:
 *   Outer group: rotation=[0,0,0], position=[0, 0, 0] (bottom) or [0, deltaY, 0] (top)
 *   Inner group: rotation=[0, PI/2, 0]  
 *   FrameSegment has NO explicit rotation prop (defaults to [0,0,0])
 *   So the extrusion shape points in the local Z direction.
 *   After inner group [0,PI/2,0]: local Z → global X
 *   The extrusion runs from X=0 to X=W.
 *
 *   LEFT CUT (z=0 end, at X=0):
 *     Box: rotation.x = PI/4 * sign
 *     Cut plane separates z<0 (discarded) from z>0 (kept).
 *     The box subtracts the z<0 region. The cut plane normal points toward kept side (+Z local).
 *     After rotation.x=angle: (0,0,1) → (0, -sin(a), cos(a))
 *     After inner group [0,PI/2,0]: (0, -sin(a), cos(a)) → (cos(a), -sin(a), 0)
 *
 *   Bottom: sign=+1, a=PI/4 → normal = (cos(PI/4), -sin(PI/4), 0) = (0.707, -0.707, 0)
 *   Top: sign=-1, a=-PI/4 → normal = (cos(-PI/4), -sin(-PI/4), 0) = (0.707, 0.707, 0)
 *
 * Now for vertical rail at X=0 (right side), we want:
 *   BOTTOM corner (Y=0): vertical cut normal = (-0.707, 0.707, 0) [opposite of bottom rail left]
 *   TOP corner (Y=H): vertical cut normal = (-0.707, -0.707, 0) [opposite of top rail left]
 *
 * So at the bottom the vertical segment needs cut normal (-0.707, +0.707, 0)
 * And at the top it needs cut normal (-0.707, -0.707, 0).
 *
 * These are in the XY plane (Z=0 in world), which means the cut is a vertical plane
 * tilted 45° in the XY plane. That's a mitre cut in the plan view (horizontal section).
 *
 * But FrameSegment's CSG cut always rotates around the X axis of the local segment,
 * producing cut planes that contain the X axis. With the extrusion running along some
 * direction, the cut plane always contains the profile's cross-section plane axes.
 *
 * The REAL issue: For a window frame, horizontal rails get mitred by cutting in the YZ plane
 * (the cut is a sloped cut in cross-section - i.e., the 45° is in the depth direction).
 * But we want an architectural mitre in the PLAN view (45° in the XY global plane).
 *
 * Wait - let me reconsider what the user ACTUALLY wants. The "mitre cut" that was
 * implemented joins the corner at 45° in the cross-sectional profile, not in plan view.
 * The cut goes through the profile depth (Z direction in world space).
 *
 * The ACTUAL cut planes from FrameSegment (Z = depth direction, into the wall):
 *   Bottom rail LEFT cut normal: (0.707, -0.707, 0) - this is in XY plane, Z=0
 *   This means the cut is a 45° angle when viewed from the front (XY view).
 *
 * For the vertical rail to match:
 *   At bottom: needs normal (-0.707, 0.707, 0)
 *   
 * Looking at the cut from the front: it's a 45° diagonal in XY space.
 * The vertical rail runs in Y direction. Its cut at the bottom should slope 45° 
 * in the XY plane to match the horizontal rail's cut which slopes 45° in XY.
 *
 * For FrameSegment, if the vertical extrudes along Y (segment rotation that makes Z→Y),
 * and the cut box rotates around some axis:
 * We need the cut plane to have normal in XY plane at 45°.
 *
 * If vertical segment uses rotation=[0, 0, PI/2] (so local Z→global Y via Euler Z rotation):
 * Actually let's try: segment rotation = [0, 0, 0] with group = none
 * and extrusion going in Y by having the shape lie in XZ plane.
 *
 * Or better: use the fact that FrameSegment's cuts rotate around its LOCAL X axis.
 * We need to orient the segment so that its LOCAL X axis is the GLOBAL Z axis (depth),
 * and the extrusion goes along GLOBAL Y.
 *
 * If local X = global Z, local Y = global X, local Z = global Y:
 * That's an Euler rotation of... let's work out:
 * Standard local: X=(1,0,0), Y=(0,1,0), Z=(0,0,1)
 * Target local:   X=(0,0,1), Y=(1,0,0), Z=(0,1,0)
 *
 * Actually what we want is much simpler. Let me think about the geometry from scratch.
 *
 * The horizontal bottom rail:
 *   - Has a cross-section profile in the local XY plane
 *   - Extrudes along local Z (= global X after inner group [0,PI/2,0])
 *   - The left mitre cut is at z=0 (global X=0)
 *   - The cut box rotates around LOCAL X (= global X after transforms... no wait)
 *   
 * I need to trace more carefully what "local X" means for the cut box.
 * The cut box is placed BEFORE any group transforms. Its rotation.x is around the 
 * raw segment's local X axis, which is the shape's X axis (= the profile depth direction).
 * 
 * For the bottom horizontal rail:
 *   Shape lies in XY. After mesh (no rotation), extrusion goes in Z.
 *   Inner group [0,PI/2,0] makes Z→-X, X→Z (in global).
 *   So profile X (depth direction) = global Z.
 *   Cut box rotation.x rotates around profile-X = global Z.
 *   This gives a cut plane that is tilted in global XY plane. ✓ (That's the mitre we see)
 *
 * For the vertical rail to also have a mitre in the same XY plane:
 *   The vertical extrudes along global Y.
 *   We need the profile X (depth direction) to also be global Z.
 *   Currently: vertical group [0,0,-PI/2] → profile X = ... let's compute.
 *   
 *   If we use group [0,0,-PI/2] and segment rotation [0,PI/2,0]:
 *   Profile X starts as (1,0,0).
 *   After segment [0,PI/2,0]: X→(0,0,-1) → local X of cut = global Z... wait that's (-Z)?
 *   No: Euler [0,PI/2,0] rotates Y→Y, X→Z, Z→-X. So local X → (0,0,1)? No...
 *   
 *   Euler rotation [0,PI/2,0] (rotation around Y axis by PI/2):
 *   X→Z direction: (1,0,0)→(0,0,-1)
 *   Z→-X direction: (0,0,1)→(1,0,0)
 *   Actually rotation matrix for Y by PI/2:
 *   [cos PI/2, 0, sin PI/2] = [0, 0, 1]
 *   [0, 1, 0             ] = [0, 1, 0]  
 *   [-sin PI/2,0, cos PI/2]= [-1,0, 0]
 *   So X=(1,0,0) → (0,0,-1), Z=(0,0,1)→(1,0,0)
 *
 *   After segment rotation [0,PI/2,0]: profile local X = (0,0,-1) global (within segment)
 *   After group [0,0,-PI/2]: (0,0,-1) → ... rotation Z by -PI/2: x'=x*cos(-PI/2)-y*sin(-PI/2), etc.
 *   (0,0,-1) rotated by Z -PI/2: x'=0, y'=0, z'=-1 → unchanged (Z axis is preserved)
 *   So profile X = (0,0,-1) = global -Z.
 *   
 *   The cut box rotates around global -Z. That's equivalent to rotating around global Z.
 *   So actually the current setup SHOULD work... but the test shows it doesn't!
 *
 * Let me just brute-force enumerate what we get.
 */

import * as THREE from 'three';

// Compute the world-space cut normal given various vertical rail configurations
function computeVertRightCutNormal(groupEuler, segEuler, invertCuts) {
  const sign = invertCuts ? -1 : 1;
  // Right cut: rotation.x = -PI/4 * sign
  const cutRotX = (-Math.PI/4) * sign;
  
  // The kept side of right cut: z < length → normal points -Z in local segment space
  const localN = new THREE.Vector3(0, 0, -1);
  
  // Apply cut rotation around segment local X:
  localN.applyEuler(new THREE.Euler(cutRotX, 0, 0));
  
  // Apply segment rotation:
  localN.applyEuler(segEuler);
  
  // Apply group rotation:
  localN.applyEuler(groupEuler);
  
  return localN;
}

function computeVertLeftCutNormal(groupEuler, segEuler, invertCuts) {
  const sign = invertCuts ? -1 : 1;
  // Left cut: rotation.x = PI/4 * sign
  const cutRotX = (Math.PI/4) * sign;
  
  // The kept side of left cut: z > 0 → normal points +Z in local segment space
  const localN = new THREE.Vector3(0, 0, 1);
  
  // Apply cut rotation around segment local X:
  localN.applyEuler(new THREE.Euler(cutRotX, 0, 0));
  
  // Apply segment rotation:
  localN.applyEuler(segEuler);
  
  // Apply group rotation:
  localN.applyEuler(groupEuler);
  
  return localN;
}

// KNOWN: bottom rail left cut normal (opposite = what vertical right cut needs)
// Bottom rail: outer group [0,0,0], inner group [0,PI/2,0]
// invertCuts=false, sign=+1, cutRotX = PI/4
// kept side = z > 0, local (0,0,1) after rotation.x=PI/4: y=-sin(PI/4), z=cos(PI/4)
const bottomN = new THREE.Vector3(0, 0, 1);
bottomN.applyEuler(new THREE.Euler(Math.PI/4, 0, 0));
bottomN.applyEuler(new THREE.Euler(0, Math.PI/2, 0)); // inner group
console.log('Bottom rail left cut world normal:', bottomN.toArray().map(v=>v.toFixed(3)));
const bottomTarget = bottomN.clone().negate(); // what vert right cut should equal
console.log('Target for vert right cut normal:', bottomTarget.toArray().map(v=>v.toFixed(3)));

// KNOWN: top rail left cut normal (opposite = what vertical left cut needs)
// Top rail: outer group [0,0,0], inner group [0,PI/2,0]
// invertCuts=true, sign=-1, cutRotX = -PI/4
// kept side = z > 0, local (0,0,1) after rotation.x=-PI/4: y=+sin(PI/4), z=cos(PI/4)
const topN = new THREE.Vector3(0, 0, 1);
topN.applyEuler(new THREE.Euler(-Math.PI/4, 0, 0));
topN.applyEuler(new THREE.Euler(0, Math.PI/2, 0)); // inner group
console.log('');
console.log('Top rail left cut world normal:', topN.toArray().map(v=>v.toFixed(3)));
const topTarget = topN.clone().negate();
console.log('Target for vert left cut normal:', topTarget.toArray().map(v=>v.toFixed(3)));

console.log('');
console.log('=== Trying group=[0,0,-PI/2], seg=[0,PI/2,0] (current) ===');
{
  const gE = new THREE.Euler(0, 0, -Math.PI/2);
  const sE = new THREE.Euler(0, Math.PI/2, 0);
  const rN = computeVertRightCutNormal(gE, sE, false);
  const lN = computeVertLeftCutNormal(gE, sE, false);
  const rN_inv = computeVertRightCutNormal(gE, sE, true);
  const lN_inv = computeVertLeftCutNormal(gE, sE, true);
  console.log('right(inv=F):', rN.toArray().map(v=>v.toFixed(3)), 'dot bottom:', rN.dot(bottomTarget).toFixed(3));
  console.log('right(inv=T):', rN_inv.toArray().map(v=>v.toFixed(3)), 'dot bottom:', rN_inv.dot(bottomTarget).toFixed(3));
  console.log('left(inv=F): ', lN.toArray().map(v=>v.toFixed(3)), 'dot top:', lN.dot(topTarget).toFixed(3));
  console.log('left(inv=T): ', lN_inv.toArray().map(v=>v.toFixed(3)), 'dot top:', lN_inv.dot(topTarget).toFixed(3));
}

console.log('');
console.log('=== Trying group=[0,0,PI/2], seg=[0,PI/2,0] ===');
{
  const gE = new THREE.Euler(0, 0, Math.PI/2);
  const sE = new THREE.Euler(0, Math.PI/2, 0);
  const rN = computeVertRightCutNormal(gE, sE, false);
  const lN = computeVertLeftCutNormal(gE, sE, false);
  const rN_inv = computeVertRightCutNormal(gE, sE, true);
  const lN_inv = computeVertLeftCutNormal(gE, sE, true);
  console.log('right(inv=F):', rN.toArray().map(v=>v.toFixed(3)), 'dot bottom:', rN.dot(bottomTarget).toFixed(3));
  console.log('right(inv=T):', rN_inv.toArray().map(v=>v.toFixed(3)), 'dot bottom:', rN_inv.dot(bottomTarget).toFixed(3));
  console.log('left(inv=F): ', lN.toArray().map(v=>v.toFixed(3)), 'dot top:', lN.dot(topTarget).toFixed(3));
  console.log('left(inv=T): ', lN_inv.toArray().map(v=>v.toFixed(3)), 'dot top:', lN_inv.dot(topTarget).toFixed(3));
}

console.log('');
console.log('=== Trying no group, seg=[PI/2,0,0] ===');
{
  const gE = new THREE.Euler(0, 0, 0);
  const sE = new THREE.Euler(Math.PI/2, 0, 0);
  const rN = computeVertRightCutNormal(gE, sE, false);
  const lN = computeVertLeftCutNormal(gE, sE, false);
  const rN_inv = computeVertRightCutNormal(gE, sE, true);
  const lN_inv = computeVertLeftCutNormal(gE, sE, true);
  console.log('right(inv=F):', rN.toArray().map(v=>v.toFixed(3)), 'dot bottom:', rN.dot(bottomTarget).toFixed(3));
  console.log('right(inv=T):', rN_inv.toArray().map(v=>v.toFixed(3)), 'dot bottom:', rN_inv.dot(bottomTarget).toFixed(3));
  console.log('left(inv=F): ', lN.toArray().map(v=>v.toFixed(3)), 'dot top:', lN.dot(topTarget).toFixed(3));
  console.log('left(inv=T): ', lN_inv.toArray().map(v=>v.toFixed(3)), 'dot top:', lN_inv.dot(topTarget).toFixed(3));
}

console.log('');
console.log('=== Trying no group, seg=[0,0,-PI/2] ===');
{
  const gE = new THREE.Euler(0, 0, 0);
  const sE = new THREE.Euler(0, 0, -Math.PI/2);
  const rN = computeVertRightCutNormal(gE, sE, false);
  const lN = computeVertLeftCutNormal(gE, sE, false);
  const rN_inv = computeVertRightCutNormal(gE, sE, true);
  const lN_inv = computeVertLeftCutNormal(gE, sE, true);
  console.log('right(inv=F):', rN.toArray().map(v=>v.toFixed(3)), 'dot bottom:', rN.dot(bottomTarget).toFixed(3));
  console.log('right(inv=T):', rN_inv.toArray().map(v=>v.toFixed(3)), 'dot bottom:', rN_inv.dot(bottomTarget).toFixed(3));
  console.log('left(inv=F): ', lN.toArray().map(v=>v.toFixed(3)), 'dot top:', lN.dot(topTarget).toFixed(3));
  console.log('left(inv=T): ', lN_inv.toArray().map(v=>v.toFixed(3)), 'dot top:', lN_inv.dot(topTarget).toFixed(3));
}

console.log('');
console.log('=== Trying group=[0,PI/2,0], seg=[0,0,-PI/2] ===');
{
  const gE = new THREE.Euler(0, Math.PI/2, 0);
  const sE = new THREE.Euler(0, 0, -Math.PI/2);
  const rN = computeVertRightCutNormal(gE, sE, false);
  const lN = computeVertLeftCutNormal(gE, sE, false);
  const rN_inv = computeVertRightCutNormal(gE, sE, true);
  const lN_inv = computeVertLeftCutNormal(gE, sE, true);
  console.log('right(inv=F):', rN.toArray().map(v=>v.toFixed(3)), 'dot bottom:', rN.dot(bottomTarget).toFixed(3));
  console.log('right(inv=T):', rN_inv.toArray().map(v=>v.toFixed(3)), 'dot bottom:', rN_inv.dot(bottomTarget).toFixed(3));
  console.log('left(inv=F): ', lN.toArray().map(v=>v.toFixed(3)), 'dot top:', lN.dot(topTarget).toFixed(3));
  console.log('left(inv=T): ', lN_inv.toArray().map(v=>v.toFixed(3)), 'dot top:', lN_inv.dot(topTarget).toFixed(3));
}
