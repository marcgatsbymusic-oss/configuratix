/* ============================================================================
 * F252 — parametric tilt&turn + fixed window assembly (IGLO 5)
 * Reference implementation. Proven in F252proofconcept_viewer.html.
 *
 * buildF252(THREE, PROFILES, HANDLE, opts) -> THREE.Group  (units: mm)
 *
 *   THREE     : the three.js module (r128+; uses THREE.ShapeUtils.triangulateShape)
 *   PROFILES  : object of cross-section polygons, see f252_profiles.js
 *   HANDLE    : handle geometry, see f252_handle.js  (pass null to skip the handle)
 *   opts      : { W, H, materials }  (all optional; see PARAMS below)
 *
 * COORDINATE CONVENTION (world):
 *   X = width  (right +),  Y = height (up +),  Z = depth (interior +).
 *   Origin (0,0,0) = exterior face, bottom-left outer corner.
 *   Frame occupies Z 0..70 (EXT face 0, INT face 70). EXT/INT seam at profile x=35.
 *
 * PROFILE LOCAL PLANE (as stored in PROFILES[name] = [[x,y],...]):
 *   local x = depth  (0=EXT .. 70=INT)
 *   local y = reveal (0 = member outer edge, increasing toward the glazing)
 *   Members are lofted between two rings of this profile; the ring "length"
 *   coordinate is a function of reveal, which is what produces the 45° mitres.
 * ========================================================================== */

function buildF252(THREE, PROFILES, HANDLE, opts) {
  opts = opts || {};

  // ---- PARAMS (single source of truth) -----------------------------------
  const W        = opts.W || 850;      // window width  (outer frame, mm)
  const H        = opts.H || 1300;     // window height (outer frame, mm)
  const DEPTH    = 70;                 // frame depth (from profile data)
  const TAXIS    = opts.TAXIS || 430;  // transom horizontal centre-line, mm from bottom
  const TFACE    = 84;                 // transom bar face height in elevation
  const SM       = 38;                 // sash outer reveal from frame outer edge (= "37.92")
  const LAP      = 28;                 // sash laps frame/transom by this (frame inner 66 - 38)
  const TIN      = 44;                 // transom runs in to frame INTERIOR inner face (flush, no gap)
  const TR_GLZ   = 404;                // fixed glazing top edge, up into the transom rebate
  const tTop     = TAXIS + TFACE / 2;  // transom top face
  const tBot     = TAXIS - TFACE / 2;  // transom bottom face
  const sashBot  = tTop - LAP;         // sash outer bottom edge (lapped down over the transom)

  // materials (override via opts.materials)
  const S = THREE.DoubleSide;
  const M = Object.assign({
    frame:    new THREE.MeshStandardMaterial({ color: 0xeef0f3, roughness: .60, metalness: .03, side: S }),
    sash:     new THREE.MeshStandardMaterial({ color: 0xdde1e6, roughness: .58, metalness: .03, side: S }),
    gasket:   new THREE.MeshStandardMaterial({ color: 0x141414, roughness: .85, side: S }),
    spacer:   new THREE.MeshStandardMaterial({ color: 0x8b96a1, roughness: .50, metalness: .45, side: S }),
    glass:    new THREE.MeshPhysicalMaterial({ color: 0x9ec5e0, roughness: .06, metalness: 0, transparent: true, opacity: .32, transmission: .55, side: S }),
    hardware: new THREE.MeshStandardMaterial({ color: 0xd9dde2, roughness: .32, metalness: .65, side: S }),
  }, opts.materials || {});

  const root = new THREE.Group();
  const parts = [];   // {mesh, role} — handy for explode/pick/animation later

  // ---- primitives --------------------------------------------------------
  // triangulate a 2D profile (with a fan fallback if the polygon is degenerate)
  function triangulate(poly) {
    const v2 = poly.map(p => new THREE.Vector2(p[0], p[1]));
    try { const f = THREE.ShapeUtils.triangulateShape(v2, []); if (f && f.length) return f; } catch (e) {}
    const f = []; for (let i = 1; i < poly.length - 1; i++) f.push([0, i, i + 1]); return f;
  }

  // Loft a profile between two rings whose length = zStart(rev)..zEnd(rev).
  // xa/ya/za are the world images of the profile's (depth, reveal, length) axes.
  // Making the end length a function of reveal is what cuts the 45° mitre.
  const Z = [0,0,1], Xp = [1,0,0], Xn = [-1,0,0], Yp = [0,1,0], Yn = [0,-1,0];
  function buildMember(name, zStart, zEnd, xa, ya, za, pos, matKey) {
    const poly = PROFILES[name]; if (!poly) throw new Error('[F252] missing profile ' + name);
    const n = poly.length;
    const faces = triangulate(poly);
    const Mx = new THREE.Matrix4().makeBasis(
      new THREE.Vector3(xa[0], xa[1], xa[2]),
      new THREE.Vector3(ya[0], ya[1], ya[2]),
      new THREE.Vector3(za[0], za[1], za[2]));
    Mx.setPosition(new THREE.Vector3(pos[0], pos[1], pos[2]));
    const positions = [], tmp = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const dx = poly[i][0], rev = poly[i][1];
      tmp.set(dx, rev, zStart(rev)).applyMatrix4(Mx); positions.push(tmp.x, tmp.y, tmp.z); // 2i   start ring
      tmp.set(dx, rev, zEnd(rev)).applyMatrix4(Mx);   positions.push(tmp.x, tmp.y, tmp.z); // 2i+1 end ring
    }
    const idx = [], Sd = i => 2*i, Ed = i => 2*i + 1;
    for (const f of faces) {                       // caps (start reversed, end forward)
      idx.push(Sd(f[0]), Sd(f[2]), Sd(f[1]));
      idx.push(Ed(f[0]), Ed(f[1]), Ed(f[2]));
    }
    for (let i = 0; i < n; i++) {                  // side walls
      const j = (i + 1) % n;
      idx.push(Sd(i), Ed(i), Ed(j)); idx.push(Sd(i), Ed(j), Sd(j));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, M[matKey]); root.add(mesh);
    parts.push({ mesh, role: matKey });
    return mesh;
  }

  // Full mitred rectangular ring: profile outer reveal (=R) follows rect (x0,y0,x1,y1), 45° at 4 corners.
  function mitreRing(name, x0, y0, x1, y1, R, mk) {
    const D = r => r - R;
    buildMember(name, r => y0 + D(r), r => y1 - D(r), Z, Xp, Yp, [x0 - R, 0, 0], mk); // left
    buildMember(name, r => y0 + D(r), r => y1 - D(r), Z, Xn, Yp, [x1 + R, 0, 0], mk); // right
    buildMember(name, r => x0 + D(r), r => x1 - D(r), Z, Yp, Xp, [0, y0 - R, 0], mk); // bottom
    buildMember(name, r => x0 + D(r), r => x1 - D(r), Z, Yn, Xp, [0, y1 + R, 0], mk); // top
  }
  // U-ring: bottom (mitred) + left/right straight up to yTop (glazing that meets a transom on top).
  function uRing(name, x0, y0, x1, R, yTop, mk) {
    const D = r => r - R;
    buildMember(name, r => x0 + D(r), r => x1 - D(r), Z, Yp, Xp, [0, y0 - R, 0], mk); // bottom
    buildMember(name, r => y0 + D(r), r => yTop,      Z, Xp, Yp, [x0 - R, 0, 0], mk); // left
    buildMember(name, r => y0 + D(r), r => yTop,      Z, Xn, Yp, [x1 + R, 0, 0], mk); // right
  }
  // glass / spacer as boxes
  function box(w, h, d, cx, cy, cz, mk) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M[mk]);
    g.position.set(cx, cy, cz); root.add(g); parts.push({ mesh: g, role: mk }); return g;
  }
  function ring(x0, x1, y0, y1, z0, z1, wd, mk) {
    const cz = (z0 + z1) / 2, d = z1 - z0;
    box(wd, y1 - y0, d, x0 + wd/2, (y0 + y1)/2, cz, mk);
    box(wd, y1 - y0, d, x1 - wd/2, (y0 + y1)/2, cz, mk);
    box(x1 - x0, wd, d, (x0 + x1)/2, y0 + wd/2, cz, mk);
    box(x1 - x0, wd, d, (x0 + x1)/2, y1 - wd/2, cz, mk);
  }

  // ---- ASSEMBLY ----------------------------------------------------------
  // FRAME — 4 mitred sides (revOuter = 0). Same profile all round (rama 01).
  [['FRM_EXT','frame'],['FRM_INT','frame'],['GSK_FRM','gasket']].forEach(([lp, mk]) => {
    buildMember(lp, r => r, r => H - r, Z, Xp, Yp, [0, 0, 0], mk); // left
    buildMember(lp, r => r, r => H - r, Z, Xn, Yp, [W, 0, 0], mk); // right
    buildMember(lp, r => r, r => W - r, Z, Yp, Xp, [0, 0, 0], mk); // bottom
    buildMember(lp, r => r, r => W - r, Z, Yn, Xp, [0, H, 0], mk); // top
  });
  // SASH — 4 mitred sides (revOuter = 38). Overlaps frame; bottom laps down over the transom.
  [['SSH_EXT','sash'],['SSH_INT','sash'],['GSK_SSH_EXT','gasket'],['GSK_SSH_INT','gasket']].forEach(([lp, mk]) => {
    buildMember(lp, r => sashBot + (r - SM), r => H - r, Z, Xp, Yp, [0, 0, 0], mk); // left
    buildMember(lp, r => sashBot + (r - SM), r => H - r, Z, Xn, Yp, [W, 0, 0], mk);                    // right
    buildMember(lp, r => r, r => W - r, Z, Yn, Xp, [0, H, 0], mk);                                     // top
    buildMember(lp, r => r, r => W - r, Z, Yp, Xp, [0, sashBot - SM, 0], mk);                          // bottom
  });
  // TRANSOM — słupek 01, butts the frame INTERIOR inner face (TIN) so it is flush inside, no gap.
  [['POST_EXT','frame'],['POST_INT','frame'],['GSK_POST_A','gasket'],['GSK_POST_B','gasket']].forEach(([lp, mk]) => {
    buildMember(lp, r => TIN, r => W - TIN, Z, Yp, Xp, [0, 365, 0], mk); // reveal centre 65 -> worldY offset 365
  });

  // SASH GLAZING BEAD + BEAD GASKET (mitred rings)
  mitreRing('BZD_SSH',     90,  sashBot + 52, W - 90,  H - 90,  90,  'sash');
  mitreRing('GSK_BZD_SSH', 106, sashBot + 68, W - 106, H - 106, 106, 'gasket');
  // FIXED GLAZING BEAD (U on 3 frame sides) + transom bead caps the top
  uRing('BZD_FRM',     40, 40, W - 40, 40, TR_GLZ,     'frame');
  uRing('GSK_BZD_FRM', 56, 56, W - 56, 56, TR_GLZ - 6, 'gasket');
  buildMember('BZD_POST',     r => TIN, r => W - TIN, Z, Yp, Xp, [0, 365, 0], 'frame');  // transom fixed-side bead
  buildMember('GSK_BZD_POST', r => TIN, r => W - TIN, Z, Yp, Xp, [0, 365, 0], 'gasket'); // transom fixed-side bead gasket

  // GLASS + SPACER  (glass/spacer are boxes; the GLS/SPACER layers give thickness/depth only)
  // TOP (sash-held): daylight inset 100 from perimeter; bottom lapped to sashBot; IGU depth 38..62; spacer depth 42..58
  box(W - 200, (H - 100) - (sashBot + 62), 24, W/2, (sashBot + 62 + H - 100)/2, 50, 'glass');
  ring(100, W - 100, sashBot + 62, H - 100, 42, 58, 14, 'spacer');
  // BOTTOM (fixed): glass edge reveal 50, top up into transom (TR_GLZ); IGU depth 19..43; spacer depth 23..39
  box(W - 100, TR_GLZ - 50, 24, W/2, (50 + TR_GLZ)/2, 31, 'glass');
  ring(50, W - 50, 50, TR_GLZ, 23, 39, 14, 'spacer');

  // HANDLE — pre-assembled + reoriented + scaled mesh (see f252_handle.js / extract_profiles.py).
  // Mounts on the LEFT sash stile, spindle at sash mid-height, base plate on the sash INT face (Z=89).
  if (HANDLE) {
    const sashMidY = (sashBot + (H - SM)) / 2;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(HANDLE.v, 3));
    g.setIndex(HANDLE.f); g.computeVertexNormals();
    const h = new THREE.Mesh(g, M.hardware);
    h.position.set(68 - HANDLE.baseCenX, sashMidY - HANDLE.baseCenY, 89 - HANDLE.baseBackZ);
    root.add(h); parts.push({ mesh: h, role: 'hardware' });
  }

  root.userData = { parts, PARAMS: { W, H, DEPTH, TAXIS, TFACE, SM, LAP, TIN, TR_GLZ, tTop, tBot, sashBot } };
  return root;
}

// UMD-ish export
if (typeof module !== 'undefined' && module.exports) module.exports = { buildF252 };
