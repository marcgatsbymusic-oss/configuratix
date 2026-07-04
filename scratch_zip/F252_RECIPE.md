# F252 — Complete Build Recipe (Google Antigravity)

Build the IGLO 5 window type **F252** (single window: tilt-and-turn sash on top, fixed glazing on the bottom, one horizontal transom) in the Three.js configurator, named **`F252proofconcept`**.

This recipe is the consolidated, *proven* build — every value here was verified in a working viewer. A drop-in reference implementation (`f252_assembly.js`) ships with it; the fastest path is to wire that in, but the whole method is documented below so it can be reproduced or folded into the engine.

---

## 0. Package contents

| File | What it is |
|------|-----------|
| `F252_RECIPE.md` | this document |
| `AGENT_RULES.md` | hard do/don't constraints for the agent |
| `f252_assembly.js` | **reference implementation** — `buildF252(THREE, PROFILES, HANDLE, opts)` → `THREE.Group` |
| `f252_profiles.js` | `const PROFILES = {…}` — extracted cross-section polygons |
| `f252_handle.js` | `const HANDLE = {…}` — pre-assembled/oriented/scaled handle geometry |
| `extract_profiles.py` | regenerates the two data files from the source JSON + GLB |

Source assets (Bob supplies): `zlozenie_02.json`, `zlozenie_30.json`, `zlozenie_07.json` (the three IGLO 5 sections), `testhandle.glb` (handle).

---

## 1. What F252 is

A rectangular window split by one horizontal transom:
- **Top** ≈ 2/3: a tilt-and-turn **sash** (skrzydło 02), handle on the left, hinges opposite.
- **Bottom** ≈ 1/3: **fixed** glazing (złożenie 07).
- One **outer frame** (rama 01) all around, one horizontal **transom** (słupek 01) between the two.

The three section files map to: `zlozenie_02` = top (frame+sash+glazing), `zlozenie_30` = transom, `zlozenie_07` = bottom fixed. The frame profile is identical across `_02` and `_07` (one reusable rama 01).

---

## 2. Coordinate system (world) — mm

| Axis | Meaning | + direction |
|------|---------|-------------|
| X | width | right |
| Y | height | up |
| Z | depth | interior |

Origin `(0,0,0)` = **exterior face, bottom-left outer corner**. Frame occupies Z `0..70` (EXT face 0, INT face 70).

**Profile local plane** (each `PROFILES[name] = [[x,y],…]`): local **x = depth** (0=EXT … 70=INT, EXT/INT seam at x=35); local **y = reveal** (0 = member outer edge, increasing toward the glazing). Members are **lofted between two rings** of the profile; the ring length is a function of reveal — that function is what cuts the mitres.

---

## 3. PARAMS (single source of truth)

```js
W       = 850     // window width  (outer frame)   — parametric
H       = 1300    // window height (outer frame)    — parametric
DEPTH   = 70      // frame depth (from profile data)
TAXIS   = 430     // transom centre-line, mm up from bottom  (≈ fixed pane 1/3)
TFACE   = 84      // transom bar face height in elevation
SM      = 38      // sash outer edge, reveal from FRAME OUTER edge ("37.92")
LAP     = 28      // sash laps frame/transom by this (= frame inner 66 − 38)
TIN     = 44      // transom runs in to the frame INTERIOR inner face → flush inside, no gap
TR_GLZ  = 404     // fixed glazing top edge, up into the transom rebate
tTop    = TAXIS + TFACE/2   // transom top face  (= 472)
tBot    = TAXIS − TFACE/2   // transom bottom face (= 388)
sashBot = tTop − LAP        // sash outer bottom edge, lapped down over the transom (= 444)
```

W, H (and TAXIS) are the dials to change size. Everything else derives from the profile geometry and should stay put unless the profiles change.

---

## 4. Profile extraction (JSON → polygons)

Run `extract_profiles.py` (or replicate it). For each needed layer take `contours[0].threeShape` (an array of `{cmd:"moveTo"|"lineTo", x, y}`) and emit a polygon `[[x,y],…]` (drop consecutive duplicates). Layers used:

- from `zlozenie_02`: `FRM_EXT`, `FRM_INT`, `GSK_FRM_EXT`→`GSK_FRM`, `SSH_EXT`, `SSH_INT`, `GSK_SSH_EXT`, `GSK_SSH_INT` (**raw points**, see below), `BZD_SSH`, `GSK_BZD_SSH`
- from `zlozenie_30`: `POST_EXT`, `POST_INT`, `GSK_POST_EXT[0]`→`GSK_POST_A`, `GSK_POST_EXT[1]`→`GSK_POST_B`, `BZD_POST`, `GSK_BZD_POST`
- from `zlozenie_07`: `BZD_FRM`, `GSK_BZD_FRM`

Three things that will bite if missed:

1. **`verified:false` on `FRM_EXT`/`SSH_EXT`/`POST_*` is a FALSE alarm.** These are half-profiles split at the EXT/INT seam (x=35); their two open endpoints are collinear (same x), so `THREE.Shape`/our loft auto-closes them along the seam plane — correct. Do **not** "repair" them.
2. **`GSK_SSH_INT` ships raw** — no `threeShape`, `pointCount:null`, 32 raw points (bulge = 0 here, so a straight polygon). Use `contours[0].points` directly. Its reveal is ~39–50 (the sash-to-frame interior seal).
3. **Glass/spacer are boxes, not swept profiles.** The `GLS_*`/`SPACER_*` layers are edge cross-sections; use them for thickness/depth only and size the panes to the openings (§6).

---

## 5. Build primitives (from `f252_assembly.js`)

- `triangulate(poly)` → `THREE.ShapeUtils.triangulateShape` with a fan fallback.
- `buildMember(name, zStart(rev), zEnd(rev), xa, ya, za, pos, matKey)` — the core. Lofts the profile between a **start ring** at length `zStart(rev)` and an **end ring** at `zEnd(rev)`, mapping profile (depth,reveal,length) → world via basis `xa,ya,za` + `pos`. Because the end length depends on reveal, the ends come out as **45° mitres** with no CSG.
- `mitreRing(name, x0,y0,x1,y1, R, mk)` — full 4-corner mitred ring; profile outer reveal `R` follows rect `(x0,y0,x1,y1)`.
- `uRing(name, x0,y0,x1, R, yTop, mk)` — bottom (mitred) + left/right straight up to `yTop` (glazing that meets a transom on top).
- `box(...)`, `ring(...)` — glass panes and spacer frames.

Axis image constants: `Z=[0,0,1] Xp=[1,0,0] Xn=[-1,0,0] Yp=[0,1,0] Yn=[0,-1,0]`.

**The mitre idea in one line:** a frame member at reveal `r` is cut back in length by `r`, so the outer corner is a point and neighbours meet on the diagonal.

---

## 6. Member catalogue & assembly

**FRAME** — `FRM_EXT`+`FRM_INT`+`GSK_FRM`, 4 mitred sides, `revOuter = 0`:
```
left  buildMember(lp, r=>r, r=>H-r, Z,Xp,Yp,[0,0,0])
right buildMember(lp, r=>r, r=>H-r, Z,Xn,Yp,[W,0,0])
bot   buildMember(lp, r=>r, r=>W-r, Z,Yp,Xp,[0,0,0])
top   buildMember(lp, r=>r, r=>W-r, Z,Yn,Xp,[0,H,0])
```

**SASH** — `SSH_EXT`+`SSH_INT`+`GSK_SSH_EXT`+`GSK_SSH_INT`, 4 mitred sides, `revOuter = SM(38)`. Overlaps the frame; **bottom laps down over the transom** (uses `sashBot`):
```
left  buildMember(lp, r=>sashBot+(r-SM), r=>H-r, Z,Xp,Yp,[0,0,0])
right buildMember(lp, r=>sashBot+(r-SM), r=>H-r, Z,Xn,Yp,[W,0,0])
top   buildMember(lp, r=>r,             r=>W-r, Z,Yn,Xp,[0,H,0])
bot   buildMember(lp, r=>r,             r=>W-r, Z,Yp,Xp,[0,sashBot-SM,0])
```
Both perimeter gaskets are mandatory. `GSK_SSH_INT` (interior seal) sits at reveal ~39–50.

**TRANSOM** — `POST_EXT`+`POST_INT`+`GSK_POST_A`+`GSK_POST_B`, one horizontal run, butts the frame **interior** inner face for a flush-inside joint (`TIN`). Reveal centre 65 → worldY offset 365:
```
buildMember(lp, r=>TIN, r=>W-TIN, Z,Yp,Xp,[0,365,0])
```

**SASH GLAZING** — bead + bead gasket, mitred rings:
```
mitreRing('BZD_SSH',     90,  sashBot+52, W-90,  H-90,  90,  'sash')
mitreRing('GSK_BZD_SSH', 106, sashBot+68, W-106, H-106, 106, 'gasket')
```

**FIXED GLAZING** — bead is a **U** (frame on 3 sides); the transom's own bead caps the top:
```
uRing('BZD_FRM',     40, 40, W-40, 40, TR_GLZ,   'frame')
uRing('GSK_BZD_FRM', 56, 56, W-56, 56, TR_GLZ-6, 'gasket')
buildMember('BZD_POST',     r=>TIN, r=>W-TIN, Z,Yp,Xp,[0,365,0], 'frame')   // transom fixed-side bead
buildMember('GSK_BZD_POST', r=>TIN, r=>W-TIN, Z,Yp,Xp,[0,365,0], 'gasket')  // + its gasket
```

**GLASS + SPACER** (boxes; IGU depths differ top vs bottom):
```
// TOP  (sash) IGU depth 38..62, spacer depth 42..58
box(W-200, (H-100)-(sashBot+62), 24, W/2, (sashBot+62 + H-100)/2, 50, 'glass')
ring(100, W-100, sashBot+62, H-100, 42, 58, 14, 'spacer')
// BOTTOM (fixed) glass edge reveal 50, top into transom; IGU depth 19..43, spacer depth 23..39
box(W-100, TR_GLZ-50, 24, W/2, (50+TR_GLZ)/2, 31, 'glass')
ring(50, W-50, 50, TR_GLZ, 23, 39, 14, 'spacer')
```

---

## 7. Handle

The handle is delivered pre-baked in `f252_handle.js` (regenerate via `extract_profiles.py`). Key steps that matter if reprocessing the GLB:

- Load with **all scene-graph transforms baked** (`trimesh.load(..., force='mesh')`). Do **not** pull `Base`/`Handle` sub-parts out with raw vertices — that drops the model's internal positioning and both mis-aligns the lever and distorts the proportions.
- **Reorient** so it stands up: world X = local X (width), world Y = local Z (up), world Z = −local Y (lever grip protrudes into the room). Rosette ends up on top, lever hanging down (closed position).
- **Scale** so overall height = **141 mm** (per the handle spec drawing: 28.5 × 141, ~61 reach). This gives ≈ 29 × 141 × 55 mm — width and height on the money.
- Store `baseCenX`, `baseCenY`, `baseBackZ` (base plate mounting reference).

**Placement** — left sash stile, spindle at sash mid-height, base plate seated on the sash INT face:
```
sashMidY = (sashBot + (H-SM)) / 2
handle.position.set(68 - HANDLE.baseCenX, sashMidY - HANDLE.baseCenY, 89 - HANDLE.baseBackZ)
```

*(The tilt-and-turn corner hinge is deferred — not part of this build.)*

---

## 8. Materials

Frame `#eef0f3`, sash `#dde1e6` (both roughness ~.6, metalness ~.03), gasket `#141414` (roughness .85), spacer `#8b96a1` (metalness .45), glass `MeshPhysicalMaterial` `#9ec5e0` opacity .32 transmission .55, handle/hardware `#d9dde2` (metalness .65). **All double-sided** (`THREE.DoubleSide`) — this, plus proper end caps, is what keeps profiles from showing missing faces.

---

## 9. Validation (run before render — fail loud)

- Every structural profile (`FRM/SSH/POST_*`) must have `pointCount ≥ 8` (49–113 expected). `< 8` = an elevation silhouette slipped in → **throw** ("flat-slab bug").
- For an unverified structural loop, its endpoints must be **collinear** (same x, the seam) — otherwise it's genuinely broken → throw.
- `GSK_SSH_INT` must be present (raw points) — a missing interior sash gasket is a defect.
- No opening dimension may be ≤ 0 (e.g. `(H-100)-(sashBot+62) > 0`).
- Expected mesh count with the handle: **59** (12 frame + 16 sash + 4 transom + 4 sash bead/gasket + 3+3 fixed bead/gasket U + 2 transom bead/gasket + 2 glass + 8 spacer + 1 handle). Without handle: 58.

---

## 10. Acceptance checklist (`F252proofconcept`)

1. Outer frame, 4 sides, clean 45° mitres, U-001 gasket mitred with it.
2. One horizontal transom, **flush on the inside** with the frame (no gap), gaskets to the jambs.
3. Tilt-turn sash in the top opening, **overlapping** the frame (no gap), 4 mitred corners, bottom **lapping down over the transom**.
4. Both sash perimeter gaskets present (`GSK_SSH_EXT` + real `GSK_SSH_INT`).
5. Glazing fills both openings; each has glass + spacer + bead + bead gasket. **Fixed bead is a U; the transom bead caps the top.**
6. Spacers at the correct IGU depths (top 42–58, bottom 23–39).
7. Every bead carries its `GSK_BZD` (sash, fixed frame, transom).
8. No profile renders as a flat slab; no missing faces.
9. Handle on the left stile, spindle at mid-height, base seated on the sash face, lever hanging into the room, ~141 mm.
10. No thrown asserts.

Name the assembled group / export **`F252proofconcept`**.

---

## Appendix — reveal / depth reference (mm, from the sections)

| element | reveal (from perimeter) | depth (EXT→INT) | notes |
|---|---|---|---|
| Frame FRM | 0 … 66 | 0 … 70 | seam at x=35; INT half only to reveal 46 |
| Frame gasket | 56 … 66 | — | GSK_FRM |
| Sash SSH | 38 … 116 | 19 … 89 | overlaps frame 38→66; shifted +19 in depth |
| Sash gasket EXT | 106 … 116 | 30 … 38 | |
| Sash gasket INT | 39 … 50 | 69 … 77 | raw pts; interior seal |
| Sash bead BZD_SSH | 90 … 116 | 66 … 88 | interior side |
| Sash spacer | 100 … 114 | 42 … 58 | IGU 38..62 |
| Transom POST | 23 … 107 | 0 … 70 | INT flush (max depth 70) |
| Fixed bead BZD_FRM | 40 … 66 | 47 … 69 | held in frame rebate |
| Fixed spacer | 50 … 64 | 23 … 39 | IGU 19..43 |
| Transom fixed bead BZD_POST | 23 … 49 | 47 … 69 | caps fixed glazing top |

Handle spec drawing: rosette 28.5 × 62.3 mm, overall height 141 mm, reach 61.5 mm, plate depth 11.2 mm, 7 mm spindle.
