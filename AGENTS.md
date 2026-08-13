# AGENTS.md — Window Configurator (IGLO 5 / multi-system)

You are working on a parametric window configurator. Cross-section geometry is
extracted from CAD into **data**; an **assembly engine** composes windows from
that data. Your job is to maintain the pipeline and generate/validate DATA —
**not** to reinvent geometry or assembly logic.

## The one rule that matters
Profiles are DATA. The assembly engine is FROZEN CODE governed by a CONTRACT.
Junction geometry (rebate offsets, glazing-pocket positions, mitre planes) is
READ from the extracted recipes — never hand-derived, never invented per profile.
If you find yourself writing new mitre/rebate/mullion math, STOP: that logic
already exists in `engine/` and the numbers already exist in `data/recipes/`.

## Directory map
- `data/profiles/*.json` — normalized cross-sections, one per component,
  auto-classified (frame, sash, mullion_fixed, mullion_movable, glazing_bead,
  glass, gasket, subsill, threshold). Shape defined by `contracts/profile.schema.json`.
- `data/recipes/zlozenie_recipes.json` — measured assembly recipes: which
  components combine and at what offset/rotation. THIS is the junction geometry.
- `contracts/profile.schema.json` — the data contract for a profile. All
  generated/edited profile JSON MUST validate against it.
- `contracts/assemblyRules.json` — the frozen contract the engine obeys
  (component roles, junction definitions, mitre policy). Treat as read-only
  unless explicitly told to change a rule.
- `pipeline/extract.py` — DXF → normalized profile JSON + recipes. Deterministic.
- `engine/` — the assembly engine (sweep, mitre, seat, place). WRITTEN ONCE.

## You MAY
- Run/extend `pipeline/extract.py` to onboard a new profile family (PVC, wood, alu).
- Generate or repair `data/profiles/*.json` and validate against the schema.
- Add a per-family `meta.json` for the few semantics names can't convey
  (which gasket seat is the weatherline, system depth, glazing range).
- Add new window SPECS (declarative) and wire UI.

## You MUST NOT
- Hardcode any offset, rebate, or mitre value. Read it from data.
- Re-implement junction math that already lives in `engine/`.
- Edit `contracts/assemblyRules.json` or `engine/` logic without an explicit
  instruction that names the file. Changing the contract is a human decision.
- "Clean up" or restructure extracted data to make geometry look right —
  if geometry is wrong, fix the extractor, not the data.

## Onboarding a new profile (the loop that replaces weeks of work)
1. `python pipeline/extract.py <family>.dxf` → profiles + recipes.
2. Validate every emitted profile against `contracts/profile.schema.json`.
3. Author `<family>/meta.json` for non-derivable semantics only.
4. Run the engine on the recipes; render cross-sections; eyeball.
5. Profile is done. No engine changes. No new junction math.

## Known data caveat (IGLO 5)
A few source blocks store bodies as ACIS REGION (e.g. `rama 66mm`, two composed
sash wrappers, `próg GU`) and yield 0 polyline loops. Either explode them to
polylines in CAD, or build those junctions from the clean atomic `50xxx` blocks
plus the recipe offsets. Do NOT fabricate geometry to fill the gap.

## DXF Parsing Edge Cases (Gaskets, Extrusions, and Nested Lines)
- **Extrusion Vectors (Z=-1)**: dxf-parser and similar JS libraries often ignore negative extrusion vectors (0, 0, -1) on LWPOLYLINEs. This causes coordinates to be mistakenly read as positive when they should be mirrored (OCS X-axis inversion). Always detect extrusion.z < 0 in Python extraction, explicitly invert X coordinates, negate bulges if applicable, and reset extrusion to (0, 0, 1) to bake the transform natively before JSON export.
- **Internal Gasket/Spacer Cavities**: Gasket layers (e.g. GSK_FRM_EXT, GSK_BZD) and spacer blocks (SPACER) must be processed with the solid-block area-filtering logic to retain ONLY the largest outermost contour. This drops internal webs and transparent cavities to produce a single solid extrusion.
- **Embedded Spacer Geometries**: The metallic spacer mostek podszybowy or 640301SEITE blocks are sometimes completely empty in the DXF file. The actual physical spacer geometry is often drawn as an LWPOLYLINE inside the szyba 24mm (glass pane) block itself. Do not assume the spacer is a separate block; iterate through the glass block to extract it.

## Blind/Mosquito Net Guidelines
- **Rail Length Constraint**: The side blind rails (guides) must always be exactly as long as the window itself. Always adjust the length (drop) to the window to ensure rails do not protrude below the bottom frame.

# Installation Execution Platform

1. System Description: A window installation execution platform delivered as a module of an existing configurator platform, comprising a React web back office and a Flutter mobile installer app over a modular-monolith backend.

2. Technology Constraints (NON-NEGOTIABLE):
   - Backend: modular monolith, PostgreSQL with PostGIS
   - Web: React
   - Mobile: Flutter, offline-first with an outbox sync pattern
   - Auth: OIDC, federated from the configurator platform
   Do not introduce microservices, a different database, or a different mobile framework.

3. DO NOT INVENT: Technical values that must never be hardcoded from the model's own knowledge:
   - Levelling tolerances
   - Fixing hole count and spacing rules
   - Screw specifications
   - Tightening sequences
   - Trim profile geometry
   - Machine-only size/weight threshold
   - Three-layer sealing sequence
   These MUST be loaded from configuration. Placeholder values MUST be marked with a PLACEHOLDER_UNVERIFIED constant. The system MUST log loudly when a placeholder is used.

4. Coding Conventions:
   - Clear module boundaries with clean interfaces.
   - Domain logic lives in the backend, NEVER duplicated in mobile or web clients.
   - Write comprehensive tests.
   - Robust error handling.

5. Source of Truth: docs/spec/installation-execution-spec.md is the source of truth for all requirements. Any conflict between agent assumption and spec is resolved in favour of the spec. Any gap must be raised as a question rather than filled in silently.

6. PRICING EXCLUSION CONSTRAINT: Do not include or expose any pricing, cost, currency (EUR, PLN, USD, etc.), or commercial information under 'Technical Specifications' or any installer-facing interfaces on the installation execution side. Filter out all price totals, itemized values, and conversion statements from structural details during data extraction.
