# AGENT_RULES — F252 build (read before writing code)

Your job is to **wire and place** the proven build, not to reinvent geometry. Everything needed is in `F252_RECIPE.md`, `f252_assembly.js`, and the two data files.

## DO
1. Prefer wiring in `f252_assembly.js` as-is: `buildF252(THREE, PROFILES, HANDLE, { W, H })` returns a `THREE.Group`. Feed it `PROFILES` (from `f252_profiles.js`) and `HANDLE` (from `f252_handle.js`).
2. Consume `PROFILES[name]` polygons and `HANDLE.v/.f` verbatim. They are already correct.
3. Keep the reveal-based mitre method and the exact PARAMS values (SM 38, LAP 28, TIN 44, TR_GLZ 404, sashBot = tTop − LAP, transom worldY offset 365).
4. Use `THREE.DoubleSide` on every material and generate proper end caps — this prevents "missing faces".
5. Run the §9 validation asserts **before** extruding/rendering. A regression must throw, not render as a flat slab.
6. Name the result `F252proofconcept`.

## DO NOT
1. Do **not** "repair", re-close, or point-cloud-align the `FRM_EXT`/`SSH_EXT`/`POST_*` loops — their `verified:false` is a false alarm (collinear seam at x=35).
2. Do **not** regenerate any profile from raw DXF, elevation silhouettes, or bounding rectangles. If a structural profile has `< 8` points, throw.
3. Do **not** size glass/beads/spacers to their own cross-section bbox — glass panes are stretched to the openings; beads/spacers are swept/placed per the recipe.
4. Do **not** pull the handle `Base`/`Handle` sub-parts out with raw vertices — load the GLB with transforms baked (`force='mesh'`) or just use the supplied `f252_handle.js`.
5. Do **not** use CSG for mitres. The lofted sheared-ring method is the whole point.
6. Do **not** invent dimensions. Everything lives in PARAMS; if something is missing, throw rather than guess.
7. Do **not** add the hinge (deferred).

## If something looks wrong
- Sash too small / glass overflowing sash → you inset from the daylight hole instead of the frame outer edge, or sized glass to its bbox. Re-read §6.
- Gap between transom and frame on the inside → transom not run in to `TIN` (frame interior inner face).
- Gap between sash and transom → sash bottom not lapped to `sashBot`.
- Flat slabs / missing faces → single-sided material, or missing end caps, or you "repaired" a seam loop.
