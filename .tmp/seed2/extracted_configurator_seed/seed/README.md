# Window Configurator — seed repo

Geometry comes from CAD as DATA. An assembly engine composes windows from that
data using a frozen contract. New profiles are onboarded by running the
extractor — not by writing new geometry code.

## What's here
- `data/profiles/` — 56 IGLO 5 components, extracted + auto-classified.
- `data/recipes/zlozenie_recipes.json` — 44 measured junction recipes.
- `contracts/profile.schema.json` — the profile data contract.
- `contracts/assemblyRules.json` — the frozen assembly contract.
- `pipeline/extract.py` — DXF → profiles + recipes.
- `engine/` — assembly engine (to build: sweep / mitre / seat / place).
- `AGENTS.md` — rules the coding agent must follow. Read first.

## Pipeline
DXF  →  pipeline/extract.py  →  data/profiles + data/recipes
                                        │
        contracts/* (frozen) ───────────┤
                                        ▼
                                   engine/  →  parametric window  →  Three.js

## For the agent (Antigravity / any agentic IDE)
Point the agent at this repo. Its scope is: run/extend the extractor, generate
and validate profile data, add per-family meta and window specs. It must NOT
touch `engine/` logic or `contracts/assemblyRules.json` without an explicit,
file-named instruction. See AGENTS.md.

## Next build targets
1. `engine/assemble.js` — consume a window spec + profiles + recipes, emit an
   ExtrudeGeometry-ready cross-section per junction.
2. Per-family `meta.json` for non-derivable semantics (weatherline, system depth).
3. Resolve the 4 REGION blocks (explode in CAD or build from atomic + offsets).
