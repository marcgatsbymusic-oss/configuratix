# Cantor pricing engine — status & gap register

Snapshot of what the Cantor formula interpreter covers today, and what still
needs work to fully replace the legacy IDW engine. Source of truth: the
`src/utils/cantorFormula/` (DSL interpreter) and `src/utils/cantorPricing/`
(mirror access + schema evaluators + entry point) modules committed in
`ba1276f`.

## Current reality

- **One golden passes end-to-end**: `AUFNR 1500041 / POS 1` — a PVC IGLO5
  F104 white fixed window, 3200×700. Engine returns `1129.64 PLN / 272.24 EUR`
  vs Cantor's `1129.64 / 272.25` (€0.01 rounding).
- **Engine callable from `/debug-pricing`** via the Vite dev middleware that
  exposes `POST /api/price`. The main configurator still uses the legacy IDW
  engine.
- **Mirror sync works** (`npm run cantor:sync`) and produces `cantor.sqlite`
  with checksums. Drift verifier exists (`npm run cantor:verify`) but isn't in
  CI.

## Phase-by-phase scope

| Phase | Scope | Status |
|---|---|---|
| A | Base window SCHEMA 41, PVC + IGLO5 + F104 + white + fixed | ✅ |
| B | Panes (SCHEMA 51 + GLASS_PANE + ARTPREISE + PMATALL k3 column selector) | ✅ |
| C | All openings, all colors, all PVC articles, all PVC systems | ❌ |
| D | Aluminum systems (AL_F100, MB45/70/79/86, etc.) | ❌ |
| E | Delete legacy engine + feature-flag cutover | ❌ |

## Phase C — PVC full coverage

### C.1 Openings (sash hardware behaviour)

Only `F` (fixed) works today. Must also support:
- `DK` — turn-tilt
- `UR` — tilt-only
- `R` — turn
- `U` — tilt (less common)
- Multi-sash combos (`DK,DK`, `F,DK`, …)

Touches:
- `context.ts:macierzOkuFromOpenings()` currently returns the first opening
  code verbatim for single sash or joins with commas. Cantor's actual encoding
  must be verified per golden (e.g. a real `DK` order).
- Per-sash BESCHVAR routes in SCHEMA 37 (beschlag-variant pricing) — not yet
  evaluated at all.
- `BESCHLAGMAXPRIOWERT` / `BESCHLAGMINPRIOWERT` currently hardcoded to 0. For
  non-FIX openings these come from beschlag priority lookups.

Work: extract goldens for each opening class, run through engine, add needed
`fn_*` shims and context variables.

### C.2 Colors

Today only `W-W` (both sides white) works. `fn_CenaDopKolor`, `fn_CenaDopRdzen`,
`fn_CenaDopZgrzew`, `fn_CenaDopUszcz`, `fn_getFarbcodeClass1/2/3` all throw
for non-white.

Color scenarios to support (from observed formula branches):
- Single-sided foil (`DEK-W`, `W-DEK`)
- Two-sided foil (`DEK-DEK`) with same vs different codes
- RAL paint (`RAL-RAL`, `C-C`, `K-K`, `I-I`, `S-S`)
- Lazura wood stain (`LAZ-LAZ`, `LAZ-RAL`, `LAZ-K`, etc.)
- Acrylic RAL (`ARAL-ARAL`)
- Special (`ASPE`, `ADEK`)
- Metallic (`m` suffix on codes, e.g. `9016m`)

Affected formulas:
- SCHEMA 41 rows: `Dopłata za kolor`, `Dopłata za kolor rdzenia`,
  `Dopłata za typ zgrzewu`, `Dopłata za kolor uszczelek`
- SCHEMA 18 (versch) — full color matrix by code combination

Work: build a color classifier (`src/utils/cantorPricing/colors.ts`) that
takes (code, RAL interior, RAL exterior) and produces the class strings Cantor
uses. Ground against goldens from orders with varied colors.

### C.3 Articles (other typologies)

Only F104 is mapped in `fns.ts:einhVarFeldA()`. Real catalogue has many —
seen in the original legacy typology list:

- Single-sash: F104 (fixed), F2xx (1-sash DK/UR/R variants)
- Dual-sash: F2xx with two sash openings
- Three+ sash: higher numbers, F3xx F4xx
- Doors: D1xx
- HS sliding: H3xx
- PSK tilt-slide: P3xx
- Passivhaus variants, ALU covers, etc.

Each article has its own `EinhVarFeldA(ARTIKEL, 31)` (ETyp) and `..., 41)`
(matrix family) values. Source of truth is ARTVARBL — which we already mirror
but don't yet evaluate (ARTVARBL rows hold ZUWFORMEL formulas themselves,
meaning we need to evaluate article-variant formulas to resolve context
variables).

Work:
- Mirror tables for EINHVARBL / BESCHVARBL (article variants / beschlag
  variants) with their ZUWFORMEL strings.
- Extend the evaluator to resolve article-variant fields by running those
  formulas (same DSL).
- Remove the hardcoded F104 table from `fns.ts:einhVarFeldA()`.

### C.4 PVC systems beyond IGLO5

Today `fn_SystemCeny()` maps IGLO5/IGL to "IG5" and passes others through.
PREISMAT has KLASSE2 values covering many systems:

- IG5, IG5 DW, IG5 DS (existing + warm edge + doors)
- IGE / IGE DW / IGEAC / IGEDGE / IGEDGE DW / IGEDGE SL / IGEDGEOLD
- IGL (IGLO light)
- IGPR (IGLO Premier)
- IG HS (IGLO Hebeschiebe — sliding)
- I7NL / I7NL DW (I7 neue Linie)
- N76A / N76M (N76 systems)

Most of SCHEMA 41 for these is covered once fn_SystemCeny is extended and the
profile-satz-specific branches pass.

### C.5 Profile / hardware / threshold surcharges

SCHEMA 41 rows currently evaluating to 0 because our context values are
defaults:

- `Dopłata za profil ramy` — frame profile surcharge when non-standard
  (e.g. 70004 bronze, 16031501 heritage). Requires PROFILSATZ routing.
- `Dopłata za próg` — threshold surcharge (for doors/patio with SCHWELLE=1)
- `Dopłata za słupek ruchomy` — movable mullion
- `Dopłata za przewiązkę` — coupling profile (GT)
- `Dopłata za wzmocnienie pełne w ościeżnicy` — full reinforcement for
  specific frame profiles (50001/50021/50009) + RC2 security
- `Dopłata za suwankę na profilu pośrednim` — PSK specific
- `Dopłata za kształt nietypowy` — shape surcharge (KATALOGNR > 0)
- `Dopłata za ilość kwater w ALU` — multi-panel ALU surcharge

Each needs fn_* shim or context variable upgrades.

### C.6 Glazing beyond FL4/T4

Currently `input.glazing.panes` is assumed to be `[FL4, T4]`. Full support
needs:
- Pane catalog via GLASS_PANE (already mirrored, 214 rows).
- Spacer selection (GLASS_SPACER).
- Gas fill (GLASS_GAS).
- Glass structure ("2-24", "3-32", …) resolving to pane composition and
  glass BoM (GLASS_BOM, ORDER_GLASS_BOM).
- SCHEMA 45 (FELDFUEL / glazing structure pricing).
- `Dopłata za wypełnienie w MB60` in SCHEMA 51.

### C.7 Formula DSL gaps

Primitives stubbed but not yet exercised:
- `ZMAT`, `ZMATALL` — index/variant matrix lookups
- `GETSYSVAR_S`, `GETSYSVAR_D` — system-variable lookups (likely a small
  config table)
- `GETARTVARFIELD_S` — article-variant field accessor
- `PMAT` — variant of PMATALL

Symbolic `k3` in PMATALL (e.g. `"PelneRama"` for WZMOCNIENIE) currently falls
back to PREIS. Real resolution needs PREISSCHEMAD label-to-PREISFELDNR mapping
(a small lookup — dozens of entries).

### C.8 ARTVARBL formula evaluation

ARTVARBL rows define how `ART_<klCode>_<fieldName>` variables resolve. They're
themselves formulas (ZUWFORMEL) in the same DSL. Current context builder
hardcodes the values for F104. Proper resolution runs the ZUWFORMEL against a
per-article context.

## Phase D — Aluminum

PREISMAT has 580k+ rows under `AL_F100` / `AL_F100A` / `AL_F100D` / variants
(MB45/70/79/86). Chain differs subtly:

- `MATERIALART = 3` (ALU) path in SCHEMA 41 uses `fn_SystemCenyAlu()` (stub
  returns "").
- Reinforcement (`_MAX`), HI option (`_HI`) suffixes extend matrix names.
- `fn_CenaAluDWU`, `fn_CenaBaz37ALUFIX` additional fn_ shims.
- AL profile surcharge matrices (`AL_DOD`).

Goldens needed: real orders for each MB system × each opening class.

## Phase E — Legacy cutover

- Delete: `src/utils/pricingEngine.ts`, `src/data/cantorPricingMatrices.json`,
  IDW code in `useConfigurator.ts`, the `0.241008` magic multiplier, the
  regression fallback `105.41 + 95.82 * area`.
- Keep: the feature flag only while we migrate; remove on cutover.
- Update: `cantorPricingData.ts` — fold any salvageable constants into the
  new engine's context builder; delete the rest.

## Four explicit gaps the user is addressing next

These are tracked separately because they're orthogonal to phase coverage and
affect the engine regardless of product mix:

### Gap 1 — Main configurator still uses legacy IDW engine

`src/components/SlateConfigurator/useConfigurator.ts` (lines 212-324) calls
`calculatePrice()` from the legacy engine. Needs to route through the new
`/api/price` endpoint, same as `/debug-pricing`. Main configurator input state
must be mapped into `ConfiguratorInput`.

### Gap 2 — Geometry simplification

`context.ts` currently sets `BRB == BRH == input.width_mm`. Cantor computes
BRB/BRH as `EINHBREITE ± frame-edge deductions` based on the chosen frame
profile. For 1000×1000 IG5/50001 the deduction rounds to 0, which is why
Phase A happens to match — but non-standard sizes will drift.

Needs: a `computeDimensions(input, profileGeom)` that reads the frame/sash
profile geometry from Cantor (look for `PROFILE` or geometry tables), then
derives BRB/BRH/FELDB/FELDH/UMFANG/GLASB/GLASH accordingly.

### Gap 3 — Browser runtime only works in dev

Production plan (from user): Supabase. The mirror must live in Supabase
Postgres; a Supabase Edge Function exposes the same `POST /api/price` contract
the Vite middleware exposes in dev.

Migration path:
1. Port `scripts/cantor/sync_cantor_pricing.mjs` to additionally upsert into
   Supabase tables (same schema, indexed the same way).
2. Rewrite `CantorMirror` to optionally back onto a `SupabaseClient` instead
   of `better-sqlite3`.
3. Deploy the Edge Function (`supabase/functions/price/index.ts`) that calls
   `priceConfiguration` with the Supabase-backed mirror.
4. `VITE_PRICING_API_URL` env var points the browser at the prod endpoint.

### Gap 4 — Drift verification not in CI

`npm run cantor:verify` runs locally but isn't wired to block merges. Needs:
- GitHub Actions workflow that runs `cantor:verify` on PRs.
- Caveat: CI doesn't have access to the local Cantor SQL Server, so the
  "data drift" mode can only run on a self-hosted runner with DB access. The
  "engine drift" mode (goldens vs engine) can run on any runner against the
  committed `cantor.sqlite`/`sync_meta.json`.

## Known issues / oddities

- `scripts/cantor/debug_pane.mjs` — one-off debug script, kept as a useful
  diagnostic utility. Not covered by tests.
- `cantor.sqlite` is gitignored (110 MB). Regenerate via `npm run cantor:sync`.
- `auf_1500041_1.json` golden is regenerated from live Cantor by
  `npm run cantor:golden -- 1500041`; if Cantor data changes, re-extract.
- `EUR23011` pricelist is hardcoded in the golden and `DebugPricing.tsx`
  defaults. Real dealer would look it up from `KDNR` → active pricelist
  (another small mirror query).
