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
