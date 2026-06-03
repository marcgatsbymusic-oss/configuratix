/**
 * test_position.js
 *
 * CONFIRMED: group=[0,0,+PI/2], seg=[0,PI/2,0], invertCuts=false gives dot=-1 at BOTH corners.
 *
 * Now figure out the correct GROUP POSITION for the vertical profiles.
 *
 * With group=[0,0,+PI/2]:
 *   The FrameSegment extrudes along its LOCAL Z (= after seg rotation [0,PI/2,0] → global X,
 *   then after group [0,0,+PI/2] global X → global Y.
 *
 * Wait: group rotation [0,0,+PI/2] rotates around Z.
 *   X → Y (global X becomes global Y after +90° Z rotation)
 *   Y → -X
 *   Z → Z
 *
 * FrameSegment shape is in local XY plane, extrudes along local Z.
 * After seg rotation [0,PI/2,0]: local Z → global X (within the group's local space).
 * After group rotation [0,0,+PI/2]: group-local X → world Y.
 * So the extrusion runs from Y=0 UPWARD to Y=length in world space. ✓
 *
 * The shape cross-section: in local XY plane of segment.
 * After seg rotation [0,PI/2,0]:
 *   local X=(1,0,0) → stays in group local Z direction? No...
 *   After [0,PI/2,0] rotation: X→(0,0,-1), Y→(0,1,0), Z→(1,0,0)
 *   So the shape XY plane becomes the group-local ZY plane.
 * After group [0,0,+PI/2]:
 *   group-local Z→world Z (unchanged), group-local Y→world -X
 *   So the shape lies in the world ZX plane.
 *
 * For the profile to appear correctly (depth direction along world -Z, height of section along world -X...
 * Wait, that would flip the shape. Let me check what the segments look like currently.
 *
 * Actually, looking at the segment in world space:
 *   Profile shape X axis → group-local (-Z) → world -Z  (that's depth direction ✓)
 *   Profile shape Y axis → group-local (-Y?) let's recompute...
 *
 * After seg [0,PI/2,0]: local X→(0,0,-1) in group space, Y→(0,1,0) in group space
 * After group [0,0,+PI/2]: (0,0,-1)→(0,0,-1) world [Z unchanged], (0,1,0)→(-1,0,0) world
 *
 * So profile X = world -Z (depth), profile Y = world -X (going left in world)
 * The profile would appear MIRRORED in X compared to when it faces normally.
 *
 * This is different from current setup [0,0,-PI/2]:
 * After seg [0,PI/2,0]: local X→(0,0,-1) in group space, Y→(0,1,0) in group space  
 * After group [0,0,-PI/2]: (0,0,-1)→(0,0,-1) world [Z unchanged], (0,1,0)→(1,0,0) world
 * So profile X = world -Z (depth), profile Y = world +X
 *
 * Difference: group [0,0,+PI/2] flips profile Y from +X to -X = the profile is MIRRORED.
 * This would make interior face towards exterior and vice versa!
 *
 * So the fix for group [0,0,+PI/2] needs to ALSO flip the profile.
 * Options:
 *  1. Negate the shape (pass uSign=-1 already done, but flip vertices)
 *  2. Use a different combination that doesn't mirror.
 *
 * Better approach: keep group [0,0,-PI/2] but fix the invertCuts.
 * From test_systematic: group=[0,0,-PI/2], seg=[0,PI/2,0]:
 *   right(inv=F): dot=+1  (WRONG - currently same direction, needs to be -1)
 *   right(inv=T): dot=0   (wrong)
 *   left(inv=F):  dot=+1  (WRONG)
 *   left(inv=T):  dot=0   (wrong)
 *
 * None of the 4 combinations give -1. So the rotation approach CAN'T fix this?
 * 
 * Wait, I think I have a sign error in my simulation. Let me re-examine.
 *
 * The dot product SHOULD be -1 because: the vertical and horizontal cuts form the TWO FACES
 * of the same corner. At a proper mitre joint, the two cut faces are COPLANAR (they're the
 * same plane), meaning their normals point in OPPOSITE directions (one into the mesh, one away).
 * So dot = -1.
 *
 * If dot = +1, the normals point in the SAME direction. That means both profiles are cut
 * in the same direction — they'd overlap, not join.
 *
 * The current setup gives dot=+1, meaning the current vertical cuts face the SAME WAY as
 * the horizontal cuts. We need them to face OPPOSITE = the vertical cut planes need to be
 * INVERTED relative to what they currently are.
 *
 * But we already tried invertCuts=true and got dot=0, not -1.
 * The issue is that the normals are perpendicular (dot=0 or dot=+1), never anti-parallel.
 *
 * Actually looking at this again: 
 *   right(inv=F): [-0.707, 0.707, 0] → dot with target [-0.707, 0.707, 0] = 0.5+0.5+0 = 1
 *   Ah! The target I computed was CORRECT: [-0.707, 0.707, 0]. And the cut gives [-0.707, 0.707, 0].
 *   That means they're the SAME vector. Dot=+1. NOT what we want.
 *
 * For a joint to work: the two half-spaces must be complementary.
 * Horizontal rail LEFT cut KEEPS z > 0 (the right part), discards z < 0.
 * Vertical rail RIGHT cut KEEPS z < length (the bottom part), discards z > length.
 *
 * At the corner, the DISCARDED side of the horizontal (z<0) should equal the 
 * DISCARDED side of the vertical (z>length). These must be complementary half-spaces
 * in 3D space.
 *
 * The CUT PLANE is the same plane for both! The horizontal discard plane normal
 * points in the SAME direction as the vertical discard plane normal (they're the same plane).
 * So the KEPT normals of the two cuts should point OPPOSITE = dot=-1.
 *
 * But I was computing KEPT normals and getting dot=+1. That means... they're both keeping
 * the same half-space, so they DON'T join - they OVERLAP. This is exactly the visual problem!
 *
 * FIX: We need the vertical right cut to keep the OPPOSITE half space from the horizontal left cut.
 * The horizontal left cut keeps z>0 (normal = +Z = (0.707, -0.707, 0) in world after transforms).
 * The vertical right cut should keep the half-space with normal = (-0.707, 0.707, 0) in world.
 *
 * Currently vertical right cut (inv=F) gives: [-0.707, 0.707, 0] in world.
 * TARGET = [-0.707, 0.707, 0].
 * They MATCH! dot=+1 means they're the same vector.
 *
 * Wait... if the kept normals are the same vector, that means both profiles keep the same 
 * half-space. For a mitre joint, the profiles should have COMPLEMENTARY (not same) kept regions.
 *
 * Hmm, actually I think I'm confusing myself. Let me reconsider what makes a valid mitre.
 *
 * At the bottom-right corner in world space (X=0, Y=0):
 * The horizontal rail runs along world X (from X=0 to X=W).
 * The vertical rail runs along world Y (from Y=0 to Y=H).
 * A perfect 45° mitre cut in the plan view: the cut plane has normal (1,-1,0)/sqrt(2).
 *
 * For the horizontal (running along +X), the LEFT end cut should KEEP the +X side:
 *   Cut plane at X=0, tilted 45°, normal pointing toward +X = (0.707, -0.707, 0)? No...
 *   The 45° mitre of a horizontal piece at its LEFT end:
 *   It's cut at 45° so that the left face angles toward the corner.
 *   Normal of the left face (pointing away from the profile interior) = (-0.707, -0.707, 0)? 
 *   Or... I keep getting confused about what the normal represents.
 *
 * SIMPLEST CHECK: does the current rendering LOOK like the mitre is close?
 * According to the summary, there IS a visible mismatch. The dot product of the two
 * cut normals being +1 means the profiles have the same cut, so they either both
 * cut away the same piece or both keep the same piece = they overlap at the corner.
 *
 * The correct fix must ensure that at the corner, one profile's cut face meets the other's
 * cut face flush. This means: we need to cut the vertical with a plane that is the MIRROR
 * IMAGE of the horizontal cut, mirrored across the corner point.
 *
 * Given that group=[0,0,+PI/2] gives dot=-1 for both corners, this IS the right rotation!
 * The mirroring of the profile (shape's Y axis flips) means the interior/exterior faces swap,
 * but we can correct for this.
 *
 * Actually: if the profile Y flips (world -X instead of +X), the profile will appear on the 
 * WRONG side of X=0. We can fix this by negating the shape origin or adjusting position.
 *
 * Let's check: with group [0,0,+PI/2] at position [0, 0, 0]:
 *   - The extrusion runs from Y=0 to Y=height (going up) ✓
 *   - The cross-section: profile origin is at world (0, 0, 0)
 *   - Profile X direction = world -Z (into the wall depth) ✓ same as horizontal
 *   - Profile Y direction = world -X (pointing left from X=0 = into the frame)
 *
 * For horizontal rail: profile Y direction = world +Y (upward) ← these are the cross-section heights
 * For vertical rail with +PI/2: profile Y direction = world -X ← profile height goes LEFT
 * For vertical rail with -PI/2 (current): profile Y direction = world +X ← profile height goes RIGHT
 *
 * The question is: which direction should the profile height go?
 * The vertical is at X=0 (right interior edge). The profile should extend INTO the frame (toward +X).
 * So profile height should go toward +X = current (-PI/2) is correct!
 *
 * But then we need a different approach to fix the cuts.
 * The only remaining option: change how the CSG is done.
 */

// Let me check: maybe the issue is that the "inner group" [0,PI/2,0] for horizontal rails
// vs NO inner group for vertical rails changes things.
// The FrameSegment itself doesn't know about the outer group transforms.
// The CSG cut happens in SEGMENT LOCAL space, before any group transforms.

// So for the horizontal rail, the inner group [0,PI/2,0] is OUTSIDE FrameSegment.
// The CSG happens in local coords where extrusion goes along Z.
// Then the group makes Z→X in world.

// For the vertical rail, the group is also OUTSIDE FrameSegment.
// The CSG also happens in local coords where extrusion goes along Z.
// The group [0,0,-PI/2] makes... let's trace the extrusion direction:

import * as THREE from 'three';

// Horizontal:
// FrameSegment extrudes along local +Z. 
// Inner group [0,PI/2,0] applies to the whole segment mesh.
// Local Z of segment = (0,0,1) → after [0,PI/2,0]: x'=sin(PI/2)=1, y'=0, z'=cos(PI/2)=0
// Wait: rotation [0,PI/2,0] is around Y by PI/2.
// Y-rotation matrix: [cos, 0, sin; 0, 1, 0; -sin, 0, cos]
// (0,0,1) → (sin(PI/2), 0, cos(PI/2)) = (1, 0, 0) ← extrusion along world +X ✓

const horizExtrusion = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('Horizontal extrusion direction (world):', horizExtrusion.toArray().map(v=>v.toFixed(3)));

// Vertical current setup:
// FrameSegment has seg rotation [0,PI/2,0] passed as prop.
// Then group [0,0,-PI/2].
// Extrusion (0,0,1) → after seg [0,PI/2,0]: (1,0,0) → after group [0,0,-PI/2]:
// Z-rotation by -PI/2: (x,y)→(x*cos+y*sin, -x*sin+y*cos) = (0,1) for (1,0): cos(-PI/2)=0,sin(-PI/2)=-1
// (1,0) → (0*1+0*(-1), -1*(-1)+0*0) = (0, 1) → world Y ✓
const vertExtrusion = new THREE.Vector3(0, 0, 1)
  .applyEuler(new THREE.Euler(0, Math.PI/2, 0))  // seg rotation
  .applyEuler(new THREE.Euler(0, 0, -Math.PI/2)); // group rotation
console.log('Vertical extrusion direction (world):', vertExtrusion.toArray().map(v=>v.toFixed(3)));

// Profile X axis: determines which direction is "depth" (into the wall, = world -Z)
const horizProfileX = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('Horizontal profile X direction (world):', horizProfileX.toArray().map(v=>v.toFixed(3)));

const vertProfileX = new THREE.Vector3(1, 0, 0)
  .applyEuler(new THREE.Euler(0, Math.PI/2, 0))
  .applyEuler(new THREE.Euler(0, 0, -Math.PI/2));
console.log('Vertical profile X direction (world):', vertProfileX.toArray().map(v=>v.toFixed(3)));

// BOTH profile X directions should be world -Z for the depth to match.
// Horizontal: (0,0,-1) = world -Z ✓  
// Vertical: let's see
// (1,0,0) → [0,PI/2,0]: (0,0,-1) → [0,0,-PI/2]: z unchanged=(0,0,-1) ✓

console.log('');
console.log('Both profile X (depth) axes point world -Z ✓');
console.log('');
console.log('Profile Y axis (cross-section height direction):');
const horizProfileY = new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(0, Math.PI/2, 0));
console.log('Horizontal profile Y direction (world):', horizProfileY.toArray().map(v=>v.toFixed(3)));
// Horizontal: Y stays Y = (0,1,0) ✓ (profile height goes up = world Y)

const vertProfileY = new THREE.Vector3(0, 1, 0)
  .applyEuler(new THREE.Euler(0, Math.PI/2, 0))
  .applyEuler(new THREE.Euler(0, 0, -Math.PI/2));
console.log('Vertical profile Y direction (world):', vertProfileY.toArray().map(v=>v.toFixed(3)));
// This should be world +X for the profile to extend rightward (into the window frame)

console.log('');
console.log('Both setups are correct for profile orientation.');
console.log('The CSG cut problem is that the mitre cut axis is WRONG for vertical.');
console.log('');
console.log('KEY INSIGHT: The cut box in FrameSegment rotates around LOCAL X of the segment.');
console.log('For horizontal: cut box local X = profile X = world -Z.');
console.log('Cut rotates in the YZ plane → CORRECT for a 45° front-view mitre (XY plane cut).');
console.log('');
console.log('For vertical (current): cut box local X = profile X = world -Z.');  
console.log('Cut ALSO rotates in the YZ plane → SAME as horizontal, but vertical runs along Y.');
console.log('This means the cut plane tilts in the YZ plane, not the XY plane.');
console.log('For a 45° front-view mitre of a vertical piece, we need the cut in XY plane!');
console.log('');
console.log('CONCLUSION: The cut for vertical profiles must rotate around world Z (or local Y of extrusion)');
console.log('not around world -Z (profile X / depth axis).');
console.log('');
console.log('This requires a fundamentally different CSG approach for vertical segments.');
console.log('Options:');
console.log('  1. Add a cutRotationAxis prop to FrameSegment');
console.log('  2. Rotate the SEGMENT to make its local X = world Y, then use normal rotation.x');
console.log('  3. Pre-compute the geometry differently');
console.log('');
console.log('For option 2: if local X = world Y, extrusion goes along world X (not Y),');
console.log('then we wrap it in a group. But this is complex.');
console.log('');
console.log('Simplest: option 2 with group that swaps axes:');
console.log('Target: extrusion along Y, cut rotates in XY plane (around Z).');
console.log('If segment local Z → world Y, and cut box local X → world Y (so rotation.x = rotation around world Y)...');
console.log('Need: segment local X = world Y, local Z = world... hmm.');
