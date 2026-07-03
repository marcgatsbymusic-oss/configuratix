# IGLO5 Cross-Section Assembly Rules — Agent Instructions

You are generating Three.js `ExtrudeGeometry` (or equivalent) from pre-parsed IGLO5 window
cross-section JSON. The geometry has already been extracted and validated from DXF —
**do not re-parse DXF or re-derive transforms yourself.** Read the files in this handoff
and follow the rules below exactly. If something is ambiguous, stop and ask rather than
guessing — a wrong guess here produces a window that looks plausible but is dimensionally
or chromatically wrong, which is worse than an explicit gap.

## Files in this handoff

| File | Purpose |
|---|---|
| `IGLO5_F1XXX_FIX_HORIZONTAL_FINAL.json` | Flattened, world-space 2D contours for every part layer in this cross section. Units: mm. |
| `assemblyRules.json` | The parsing/transform rules that produced the geometry file. Reference only — read for context, do not re-implement. |
| `materials.json` | Layer → material/color mapping. This is your source of truth for what color each layer renders. |
| `profile_metadata.json` | This specific profile's identity, anchor points, known issues, and open questions. |

## Hard rules

1. **One material variable, `exteriorColor`.** Every `*_EXT*` layer uses it. Every `*_INT*`
   layer is white (`#FFFFFF`) unless `materials.json` defines an `interiorColor` override.
   Never hardcode a color directly in geometry-generation code — read it from
   `materials.json.colorVariables`.

2. **Glass uses `MeshPhysicalMaterial` with transmission**, not a flat colored mesh. Use the
   `transmission`, `ior`, and `thickness` values from `materials.json` directly as
   constructor params.

3. **Do not invert, mirror, or re-flip any contour.** All mirroring from nested INSERT
   blocks has already been resolved into world-space coordinates in the geometry JSON.
   If a shape looks mirrored in your render, the bug is in your extrusion/placement code,
   not the source data — check your own transform before touching the JSON.

4. **`POST_EXT_HORIZONTAL` / `POST_INT_HORIZONTAL` are now split**, same pattern as the
   sash. Use `exteriorColor` / white the same way. The old unsplit `POST_HORIZONTAL` key
   is deprecated and should not appear in current geometry files -- if you see it, you're
   reading a stale file.

5. **Respect `extrusionAxis`** in `profile_metadata.json`. This file's geometry extrudes
   along Y (window width), not Z. Mixing this up with the vertical profile's extrusion
   axis is the single most common assembly bug in this pipeline — check it explicitly
   before wiring up `ExtrudeGeometry`'s path.

6. **Closed contours must actually close.** Every contour in the geometry JSON marked
   `"closed": true` has already had its implicit closing vertex appended. If you write
   any code that re-reads or re-flattens DXF in the future, you must replicate this — see
   `assemblyRules.json -> nestedInsertFlattening.closedPolylineRule`.

7. **Check `profile_metadata.json -> openQuestions` before treating any flagged geometry
   as final.** Currently: the spacer bar position is unverified, and the post has no
   EXT/INT split yet.

## What "done" looks like

A correctly assembled bottom-fix horizontal slice should show, left to right (EXT → INT):
exterior face of post/sash → gasket → exterior glass leaf → spacer → interior glass leaf →
gasket → interior face of post/sash, with the glazing bead and its gasket sitting on the
INT side, clipped over the sash lip. If your render doesn't match this layout, stop and
re-check anchor points before adjusting colors or materials.
