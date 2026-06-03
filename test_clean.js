/**
 * test_clean.js  
 * Start completely fresh. Manually compute what the bottom-left corner looks like
 * then figure out what cut the vertical needs.
 * 
 * THE GEOMETRY:
 * Bottom horizontal rail:
 *   - Shape is defined in the XY plane (profile cross-section)
 *   - Extrudes along local +Z in FrameSegment coords
 *   - FrameSegment is placed in an inner group with rotation [0, PI/2, 0]
 *   - This inner group is inside an outer group with rotation [0, 0, 0]
 *   - The extrusion direction in world: local Z → [0,PI/2,0] → world +X
 *   - The profile runs from X=0 to X=W
 *
 * Vertical right rail:
 *   - Same shape (profile cross-section) in the XY plane
 *   - Extrudes along local +Z in FrameSegment coords
 *   - FrameSegment has rotation prop = [0, PI/2, 0] (applied to the mesh)
 *   - Wrapped in outer group with rotation [0, 0, -PI/2]
 *   - Positioned at [0, H, 0]
 *   - Extrusion direction: local Z → [0,PI/2,0] → (1,0,0) in group-local → [0,0,-PI/2] → (0,-1,0) world
 *   - So the segment goes from Y=H downward to Y=H-length
 *
 * AT THE BOTTOM-RIGHT CORNER (global X=0, Y=0):
 * Both profiles must meet with a clean 45° mitre in the XY plane (plan view).
 *
 * For the HORIZONTAL bottom rail at its LEFT end (X=0):
 *   The cut goes diagonally, removing the material beyond X=0.
 *   In the XY plan view, the mitre face is diagonal at 45°.
 *   The cut plane passes through (0, 0) at 45°, with normal direction bisecting X and Y.
 *   
 * Let's just look at what FrameSegment's CSG actually produces visually.
 * The cut box rotates around local X of the segment = profile X = world -Z (after [0,PI/2,0]).
 * When it rotates by PI/4 around world -Z, the box's cutting face tilts 45° in the XY plane.
 * 
 * That means: the cutting face (which was perpendicular to Z before rotation) 
 * is now at 45° to both X and Y. The kept half is at X > 0 side.
 * The cut plane normal (pointing toward kept side) = (sin(PI/4), -sin(PI/4), 0) = (+0.707, -0.707, 0).
 * Hmm but that means it's angled in the XY plane.
 *
 * Actually, when rotation.x = PI/4 (around local X = world -Z):
 * The rotation is around world -Z. The box's cut face, which was in the YZ plane (local),
 * now rotates by PI/4 around world -Z.
 * The kept side of the cut was the +Z local side = world +X.
 * After rotation PI/4 around world -Z: (0,0,1) → world X was already there.
 * 
 * I need to think about this differently. The cut box is a cube that we subtract.
 * For the left cut (z=0 end):
 *   The box is centered at z=0, translated by -boxSize/2 in Z, rotated rotation.x = PI/4.
 *   The face of the box at z = +boxSize/2 is the cutting face (the face intersecting the mesh).
 *
 * Local coordinate frame at this point: X is profile depth (→ world -Z after transforms).
 * The box starts aligned with local axes, then rotates PI/4 around its own X axis.
 * The box's Z+ face (which is the cutting face at z = +boxSize/2 before translation)
 * has normal (0, 0, 1) in the box's local coords.
 * After rotation.x = PI/4: (0, 0, 1) → (0, -sin(PI/4), cos(PI/4)) = (0, -0.707, 0.707).
 * 
 * This normal is in the SEGMENT's local frame.
 * Transform to world:
 * - No mesh rotation on horizontal segment (rotation=[0,0,0] default)
 * - Inner group [0, PI/2, 0]: (0, -0.707, 0.707) → Y stays: y=-0.707, X: x' = 0.707*sin(PI/2)+0*cos(PI/2) = 0.707? 
 * 
 * Y-rotation by PI/2: x'=x*cos+z*sin, y'=y, z'=-x*sin+z*cos
 * (0, -0.707, 0.707): x'=0*0+0.707*1=0.707, y'=-0.707, z'=-0*1+0.707*0=0
 * → (0.707, -0.707, 0) world ✓ (matches what I had before)
 *
 * This is the NORMAL of the cutting plane face of the box in world space.
 * This face cuts through the horizontal rail and creates the mitre face.
 * The cut removes material on the OPPOSITE side (z < 0 in segment local = x < 0 in world).
 *
 * For the vertical rail to JOIN at this corner:
 * The vertical rail's cut face must be the SAME PLANE (or a parallel plane at z=0).
 * The same plane has the same normal: (0.707, -0.707, 0).
 * But the MATERIAL REMOVAL for the vertical must be on the OTHER SIDE.
 * The vertical removes material at its bottom end (z = length = bottom corner).
 * The cut removes material at z > length (below the corner in local terms).
 * In world terms: below Y=0 (below the bottom of the window).
 *
 * So for the vertical's RIGHT cut (z=length end):
 * The cutting box face must have normal (0.707, -0.707, 0) pointing OUTWARD (away from kept material).
 * The kept material is at z < length = world Y > 0.
 * The cut face normal pointing toward KEPT = it should also be (0.707, -0.707, 0)???
 *
 * No! Let me think again.
 * 
 * For horizontal LEFT cut:
 *   - Box subtracts the z < 0 region (left of the cut at z=0)
 *   - The cutting face of the box at z=0 has normal pointing toward z > 0 (the kept side)
 *   - World: this normal = (0.707, -0.707, 0)
 *   - The mitre face on the horizontal rail piece is this angled face
 *   - The mitre face normal (pointing AWAY from the rail, outward) = (-0.707, 0.707, 0) = OPPOSITE
 *
 * For vertical RIGHT cut (must mate with horizontal left cut):
 *   - The vertical's mitre face must be the SAME PLANE
 *   - The vertical keeps material at z < length (Y > 0 in world)
 *   - The mitre face on the vertical piece has normal pointing AWAY from the vertical = ?
 *   - If the face has normal pointing toward +Y (upward, into the vertical piece) = (0, 1, 0)?
 *   - But the mitre face is a 45° angled face, so it's (0.707, 0.707, 0) or (-0.707, 0.707, 0)?
 *
 * The MITRE FACE is shared. When two pieces mate at a corner:
 * Piece 1 (horizontal) has mitre face with outward normal toward (-X, +Y, 0) = (-0.707, 0.707, 0) [pointing away from the rail body]  
 * Wait no. The horizontal rail runs in +X. Its left end is at X=0. The mitre face normal points toward -X (back along the rail direction, modified by 45°).
 *
 * For a proper 45° mitre:
 * Horizontal rail (running in +X): left end mitre face normal = (-0.707, -0.707, 0) [pointing toward lower-left in XY]
 * Vertical rail (running in +Y): bottom end mitre face normal = (-0.707, -0.707, 0)... no, that's the same.
 * Actually the vertical rail's mitre face points toward lower-left too: (-0.707, -0.707, 0).
 *
 * Wait, the TWO pieces share the same diagonal cut plane. Both mitre faces are on this plane.
 * The horizontal's mitre face normal (outward from horizontal) points in one direction.
 * The vertical's mitre face normal (outward from vertical) points in the OPPOSITE direction.
 * But they're COPLANAR (same cutting plane).
 *
 * For a 45° mitre cut at the bottom-right corner:
 * The cut plane passes through (X=0, Y=0, Z=all depths).
 * The plane normal is (1, -1, 0)/sqrt(2) or (-1, 1, 0)/sqrt(2) [in XY].
 * 
 * Horizontal rail: cut at z=0 (X=0). Keep the z > 0 part (X > 0). 
 * The mitre face of the horizontal rail faces OUTWARD = toward smaller X (and toward larger Y due to 45°).
 * Outward normal of horizontal mitre face = normal pointing away from the kept part = (-0.707, 0.707, 0)? 
 * Hmm, that depends on the 45° direction.
 *
 * Actually from the CSG: the box cuts and the face orientation is defined by the box rotation.
 * The cut face of the BOX (which becomes the mitre face of the mesh piece) has normal 
 * pointing INTO THE KEPT PART. So for the horizontal left cut, the face normal pointing 
 * into kept = (0.707, -0.707, 0). The OUTWARD normal of the horizontal mitre face = -(0.707, -0.707, 0) = (-0.707, 0.707, 0).
 *
 * For the mitre joint to work, the vertical's mitre face outward normal must = -(horizontal's mitre face outward normal) = (0.707, -0.707, 0).
 * I.e., the vertical mitre face normal pointing INTO THE VERTICAL's KEPT PART = (0.707, -0.707, 0).
 *
 * The vertical keeps z < length (Y > 0 in world). The cut box face pointing INTO the kept part should be (0.707, -0.707, 0).
 * This is the normal of the cut box face BEFORE it intersects (the z+ face of the box).
 * After the right cut box rotation (rotation.something = angle), this face normal goes to (0.707, -0.707, 0).
 * We need: cutBox-local (0,0,1) → (some rotation) → segment local → group → world = (0.707, -0.707, 0)
 *
 * Undo world transforms:
 * (0.707, -0.707, 0) → undo group [0,0,-PI/2] → undo seg [0,PI/2,0] → = box local (0,0,1)?
 * 
 * undo group [0,0,-PI/2] = apply [0,0,+PI/2]:
 * Z-rotation +PI/2 matrix: [0,-1,0;1,0,0;0,0,1]
 * (0.707, -0.707, 0) → (0.707*0 + (-0.707)*(-1), 0.707*1 + (-0.707)*0, 0) = (0.707, 0.707, 0)
 *
 * undo seg [0,PI/2,0] = apply [0,-PI/2,0]:
 * Y-rotation -PI/2: [0,0,-1;0,1,0;1,0,0]
 * (0.707, 0.707, 0) → (0.707*0+0*0+0*(-1), 0.707*0+0.707*1+0*0, 0.707*1+0.707*0+0*0) = (0, 0.707, 0.707)
 *
 * So we need the cut box's +Z face (0,0,1) to become (0, 0.707, 0.707) after the cut brush rotation.
 * But the box starts with +Z face = (0,0,1). After rotation.something, it becomes (0, 0.707, 0.707).
 * 
 * (0, 0.707, 0.707) = (0,0,1) rotated by -PI/4 around X:
 *   y' = 0*cos(-PI/4) - 1*sin(-PI/4) = sin(PI/4) = 0.707
 *   z' = 0*sin(-PI/4) + 1*cos(-PI/4) = cos(PI/4) = 0.707
 *   → yes! rotation.x = -PI/4 = (-PI/4) * sign where sign=1
 *   This is exactly what FrameSegment does for the right cut with invertCuts=false!
 *
 * So the current invertCuts=false IS CORRECT for the right cut at the bottom corner!
 *
 * But test_systematic showed dot=+1 (not -1). Let me recheck the target.
 */
import * as THREE from 'three';

// Recompute from first principles
// Horizontal left cut: the face of the cut box pointing into the kept part (+Z after rotation.x=PI/4):
const boxLeftFaceN = new THREE.Vector3(0, 0, 1); // box local +Z face
boxLeftFaceN.applyEuler(new THREE.Euler(Math.PI/4, 0, 0)); // rotation.x = PI/4
// Now in segment local space (no rotation prop on horizontal mesh):
boxLeftFaceN.applyEuler(new THREE.Euler(0, Math.PI/2, 0)); // inner group
console.log('Horizontal LEFT cut face normal (world):', boxLeftFaceN.toArray().map(v=>v.toFixed(3)));

// Vertical right cut: face of cut box pointing into kept part (-Z after rotation.x=-PI/4):
// Right cut kept side = -Z local (before segment rotation), box face at z=length points toward -Z:
// Actually the right cut box's kept-side face is at z- side of the box.
// The -Z face of the box (pointing toward kept): (0,0,-1)
// After rotation.x = -PI/4: y' = 0*cos+1*sin(-PI/4) ... wait
// rotation.x = -PI/4 applied to (0,0,-1):
//   y' = 0*cos(-PI/4) - (-1)*sin(-PI/4) = sin(PI/4) = ... no, sin(-PI/4) = -sin(PI/4)
//   y' = 0*cos(-PI/4) - (-1)*(-sin(PI/4)) = -sin(PI/4) = -0.707
//   z' = 0*sin(-PI/4) + (-1)*cos(-PI/4) = -cos(PI/4) = -0.707
// So (0, -0.707, -0.707) in segment local before group
const boxRightFaceN = new THREE.Vector3(0, 0, -1); // box -Z face (toward kept side for right cut)
boxRightFaceN.applyEuler(new THREE.Euler(-Math.PI/4, 0, 0)); // rotation.x = -PI/4
// Apply seg rotation [0,PI/2,0]:
boxRightFaceN.applyEuler(new THREE.Euler(0, Math.PI/2, 0));
// Apply group [0,0,-PI/2]:
boxRightFaceN.applyEuler(new THREE.Euler(0, 0, -Math.PI/2));
console.log('Vertical RIGHT cut face normal (world, invertCuts=false):', boxRightFaceN.toArray().map(v=>v.toFixed(3)));

// For a proper joint: the MITRE PLANE is the same for both.
// The horizontal cut face normal pointing INTO KEPT = the normal of the mitre plane facing the horizontal rail interior.
// The vertical cut face normal pointing INTO KEPT = the normal of the mitre plane facing the vertical rail interior.
// If these two normals are the SAME, that means both cuts keep the same half-space → they'll OVERLAP.
// If opposite: each keeps a different half-space → they join correctly (gap-free).
const dot = boxLeftFaceN.dot(boxRightFaceN);
console.log('Dot product:', dot.toFixed(3), '(want -1 for a proper mating joint)');

// But wait: thinking about it physically...
// At the corner, the horizontal rail runs to the RIGHT (+X) and the vertical runs UP (+Y).
// The corner is at the intersection point.
// The horizontal is CUT at X=0 (at the corner). It keeps the X>0 side.
// The vertical is CUT at Y=0 (at the corner). It keeps the Y>0 side.
// The mitre plane passes through the corner diagonally.
// The horizontal's cut face faces TOWARD the corner (-X direction + 45° tilt).
// The vertical's cut face faces TOWARD the corner (-Y direction + 45° tilt).
// These two faces DO face toward each other (they form the corner from two sides)!
// So they should be OPPOSITE = dot = -1.
console.log('');
console.log('Physics check: faces should be opposite (dot=-1) for a mating joint.');
console.log('If dot=+1, the cuts produce faces pointing AWAY from each other = gap or overlap.');
console.log('');
console.log('Current result confirms: dot=', dot.toFixed(3));
console.log('The vertical cut produces a face that faces the SAME WAY as the horizontal.');
console.log('This means: they both cut on the SAME side, creating an OVERLAP (not a gap).');
console.log('');
console.log('THE FIX: Invert the vertical right cut = use invertCuts=true for the vertical.');
console.log('');

// Verify with invertCuts=true on vertical right cut:
const boxRightFaceNInv = new THREE.Vector3(0, 0, -1);
boxRightFaceNInv.applyEuler(new THREE.Euler(Math.PI/4, 0, 0)); // rotation.x = (-PI/4)*(-1) = +PI/4
boxRightFaceNInv.applyEuler(new THREE.Euler(0, Math.PI/2, 0));
boxRightFaceNInv.applyEuler(new THREE.Euler(0, 0, -Math.PI/2));
console.log('Vertical RIGHT cut with invertCuts=true:', boxRightFaceNInv.toArray().map(v=>v.toFixed(3)));
console.log('Dot:', boxLeftFaceN.dot(boxRightFaceNInv).toFixed(3));

// And check the left cut (top corner):
console.log('');
console.log('=== TOP CORNER (left cut of vertical) ===');
// Top horizontal rail left cut: invertCuts=true, rotation.x = PI/4*(-1) = -PI/4
// Face normal (+Z face after -PI/4 rotation):
const topBoxFaceN = new THREE.Vector3(0, 0, 1);
topBoxFaceN.applyEuler(new THREE.Euler(-Math.PI/4, 0, 0)); // rotation.x = -PI/4
topBoxFaceN.applyEuler(new THREE.Euler(0, Math.PI/2, 0)); // inner group
console.log('Top rail LEFT cut face normal (world):', topBoxFaceN.toArray().map(v=>v.toFixed(3)));

// Vertical left cut (invertCuts=false, rotation.x=PI/4):
const vertLeftFaceN = new THREE.Vector3(0, 0, 1); // +Z face
vertLeftFaceN.applyEuler(new THREE.Euler(Math.PI/4, 0, 0)); // left cut rotation
vertLeftFaceN.applyEuler(new THREE.Euler(0, Math.PI/2, 0));
vertLeftFaceN.applyEuler(new THREE.Euler(0, 0, -Math.PI/2));
console.log('Vertical LEFT cut (invertCuts=false):', vertLeftFaceN.toArray().map(v=>v.toFixed(3)), 'dot:', topBoxFaceN.dot(vertLeftFaceN).toFixed(3));

// Vertical left cut (invertCuts=true, rotation.x=-PI/4):
const vertLeftFaceNInv = new THREE.Vector3(0, 0, 1);
vertLeftFaceNInv.applyEuler(new THREE.Euler(-Math.PI/4, 0, 0));
vertLeftFaceNInv.applyEuler(new THREE.Euler(0, Math.PI/2, 0));
vertLeftFaceNInv.applyEuler(new THREE.Euler(0, 0, -Math.PI/2));
console.log('Vertical LEFT cut (invertCuts=true):', vertLeftFaceNInv.toArray().map(v=>v.toFixed(3)), 'dot:', topBoxFaceN.dot(vertLeftFaceNInv).toFixed(3));
