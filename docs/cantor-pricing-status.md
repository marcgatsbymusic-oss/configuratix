# Cantor pricing engine — status & gap register

Living document. Edit when scope ships or new gaps surface.

Snapshot of what the Cantor formula interpreter covers today, remaining
mismatches against real AUFPOS orders, and the phases left to close the
gap.

## Current reality

- **19/28 real AUFPOS rows reprice to match Cantor exactly** (see coverage
  replay in [`docs/cantor-pricing-coverage.md`](./cantor-pricing-coverage.md)).
  All 12 F104/IG5/W-W configurations match to the cent. F100/F105/F106 now
  reprice automatically via AUFARTIK lookup.
- **Engine runs from `/debug-pricing`** and from the main configurator
  via `POST /api/price` (Vite dev middleware; Supabase Edge Function planned
  for prod).
- **No per-article hardcoded tables** — article variables come from
  `AUFARTIK.ARTIKELVARIABLEN`, pricelist auto-resolves by currency + date.

## Engine layout

### Formula DSL interpreter — `src/utils/cantorFormula/`

| File | Role |
|---|---|
| [`tokenizer.ts`](../src/utils/cantorFormula/tokenizer.ts) | `PREISE.FORMEL` string → `Token[]` |
| [`parser.ts`](../src/utils/cantorFormula/parser.ts) | `Token[]` → `Expr` AST (recursive-descent, precedence: OR → AND → IN → compare → `+`/`-` → `*`/`/` → unary → primary) |
| [`coercion.ts`](../src/utils/cantorFormula/coercion.ts) | Cantor null/string/number coercion rules |
| [`evaluator.ts`](../src/utils/cantorFormula/evaluator.ts) | Tree walker. Resolves `GRPRS` / `AKTZUSCHLAGn` / `PREISFELDn` |
| [`builtins.ts`](../src/utils/cantorFormula/builtins.ts) | DSL primitives: `IIF`, `PMATALL`, `SWITCHA_*`, `FINDINSTR`, `CEILING`, `ROUND`, `IN`, `MAX`, `MIN`, `LEFT`, `RIGHT`, `REPLACE`, `STRING`, `INT`, `FLOOR`, `BETWEEN`. Stubs: `ZMAT`, `ZMATALL`, `GETSYSVAR_*`, `GETARTVARFIELD_S`, `PMAT` |
| [`context.ts`](../src/utils/cantorFormula/context.ts) | `FormulaContext` interface — variable resolver + mutators for `GRPRS` / `AKTZUSCHLAG` / `lastPmatRow` / `preisfeldSource` |
| [`index.ts`](../src/utils/cantorFormula/index.ts) | Public surface |

### Pricing layer — `src/utils/cantorPricing/`

| File | Role |
|---|---|
| [`input.ts`](../src/utils/cantorPricing/input.ts) | `ConfiguratorInput` shape — the contract between UI and engine |
| [`mirror.ts`](../src/utils/cantorPricing/mirror.ts) | SQLite reader. `pmatLookup`, `pmatPrice`, `loadSchema`, `paneArticleId`, `artpreiseFields`, `articleVariablesFor`, `activePreiszyk`, `preiszyk` |
| [`context.ts`](../src/utils/cantorPricing/context.ts) | Builds `FormulaContext` from `ConfiguratorInput` — reads article variables from `AUFARTIK.ARTIKELVARIABLEN` |
| [`fns.ts`](../src/utils/cantorPricing/fns.ts) | `fn_*` user-defined function shims (13 needed for Phase A+B). Data-driven via `articleVariablesFor` |
| [`schema.ts`](../src/utils/cantorPricing/schema.ts) | Schema evaluator — runs all `PREISE` rows for `(SCHEMA, ZYKLUS, PREISART)` in declared order, threading `GRPRS` |
| [`panes.ts`](../src/utils/cantorPricing/panes.ts) | Pane line items via `GLASS_PANE` → `ARTIKELID` → `ARTPREISE` → SCHEMA 51 |
| [`index.ts`](../src/utils/cantorPricing/index.ts) | `priceConfiguration()` entry point + `PriceBreakdown` output |
| [`configuratorAdapter.ts`](../src/utils/cantorPricing/configuratorAdapter.ts) | `ConfiguratorStateLike` → `ConfiguratorInput` (URL-slug to Cantor code translation) |
| [`pricingApi.ts`](../src/utils/cantorPricing/pricingApi.ts) | HTTP contract shared by browser client + server |

### Scripts — `scripts/cantor/`

| File | npm alias | Purpose |
|---|---|---|
| [`sync_cantor_pricing.mjs`](../scripts/cantor/sync_cantor_pricing.mjs) | `cantor:sync` | Mirror Cantor tables to `src/data/cantor/cantor.sqlite` + checksums |
| [`verify_cantor_sync.mjs`](../scripts/cantor/verify_cantor_sync.mjs) | `cantor:verify` | Re-checksum live tables + run engine tests |
| [`build_pricing_goldens.mjs`](../scripts/cantor/build_pricing_goldens.mjs) | `cantor:golden` | Extract goldens from real AUFNR rows into `tests/pricing/goldens/` |
| [`build_test_fixture.mjs`](../scripts/cantor/build_test_fixture.mjs) | `cantor:fixture` | Tiny 1 MB SQLite subset committed to `tests/pricing/fixtures/` so tests run without the full mirror |
| [`coverage_replay.mjs`](../scripts/cantor/coverage_replay.mjs) | `cantor:coverage` | Reprice every real `AUFPOS` row, compare to `AUFPREIS` |
| [`verify_price.mjs`](../scripts/cantor/verify_price.mjs) | — | Single-order inspection — base / panes breakdown |
| [`pricingServer.ts`](../scripts/cantor/pricingServer.ts) | — | `POST /api/price` handler. Same shape Vite middleware + future Supabase Edge Function use |
| [`debug_pane.mjs`](../scripts/cantor/debug_pane.mjs) | — | Diagnostic for pane evaluation |

### Tests — `tests/pricing/`

| File | Coverage |
|---|---|
| [`base_window.test.ts`](../tests/pricing/base_window.test.ts) | AUFNR 1500041 / pos 1 — base SCHEMA 41 + pane sub-total + total EK + total VK via PREISZYK |
| [`goldens/auf_1500041_1.json`](../tests/pricing/goldens/auf_1500041_1.json) | Extracted from live Cantor; regenerated via `cantor:golden` |
| [`fixtures/cantor.fixture.sqlite`](../tests/pricing/fixtures/cantor.fixture.sqlite) | Committed 1 MB subset: only the rows touched by goldens |

## Phase-by-phase scope

| Phase | Scope | Status |
|---|---|---|
| A | Base window SCHEMA 41, PVC + IGLO5 + F104 + white + fixed | ✅ |
| B | Panes (SCHEMA 51 + `GLASS_PANE` + `ARTPREISE` + `PMATALL` k3 column selector) | ✅ |
| C | All openings, colors, PVC articles, PVC systems | ❌ |
| D | Aluminum systems | ❌ |
| E | Delete legacy IDW engine + feature-flag cutover | ❌ |

## Hardcodes audit

### Removed (commit `3b9507a`)

- **Per-article field table in `fns.ts:einhVarFeldA`** — replaced by
  `mirror.articleVariablesFor(artnr, profilsatz)` reading
  `AUFARTIK.ARTIKELVARIABLEN`.
- **Per-article context values** (`ART_1199_MacierzOku`, `ART_1805_MatArt`,
  `ART_x801_*`, etc.) — merged from every `AUFARTIK` row paired with the
  matching `AUFPOS` position.
- **`pricelistKurzbez: 'EUR23011'`** in `DEFAULT_DEALER` — replaced by
  `mirror.activePreiszyk(currency, date)` selecting the newest
  `PREISZYK` row with `GUELTIGFUERVK=1 AND GUELTIGKEIT <= date`.

### Legitimate app/Cantor namespace translations (kept)

These need to exist somewhere — Cantor has no canonical source for URL
slugs or UI sash codes. They live in
[`configuratorAdapter.ts`](../src/utils/cantorPricing/configuratorAdapter.ts)
and [`fns.ts`](../src/utils/cantorPricing/fns.ts):

- `PROFILE_TO_PROFILSATZ` — URL slug (`iglo5`) → Cantor code (`IG5`)
- `WINDOWTYPE_TO_ARTNR` — UI typology (`F100`) → Cantor article (`F104`)
- `OPENING_CODE_MAP` — UI sash code (`o1`) → Cantor opening class (`F`)
- `EINH_FIELD_TO_VAR` — Cantor's internal UDF convention
  (fieldId `31` → `ART_1805_ETyp`, `41` → `ART_1805_MatrixName`). Verified
  against observed `AUFARTIK` rows for every article.

## Remaining coverage mismatches (TODO)

Each line below is a real failure from
`npm run cantor:coverage` against the live DB. Next steps are listed per
cluster. Goldens live in [`tests/pricing/goldens/`](../tests/pricing/goldens/);
extract fresh ones with `cantor:golden <AUFNR>`.

### TODO: IGECL profile — 2 cases

```
Δ -224.30   1500005/2  F100  IGECL  1000×1000  W-W    engine 47.14   cantor 271.44
Δ -272.64   1500005/3  F100  IGECL  1500×1500  W-W    engine 19.29   cantor 291.93
```

**Likely cause**: `IGECL` is the **classic IGE** profile. `fn_SystemCeny()`
returns `ART_1805_Serie = "IGECL"` which doesn't exist as a `KLASSE2` in
`PREISMAT[PVC_F100][F]`. The engine's PMATALL returns 0 (largest-row fallback
at 0 PREIS), so base = 0 and only panes contribute.

**Fix path**:
1. Check whether Cantor aliases `IGECL` to an existing KLASSE2 internally
   (likely `IGE` — the classic IGE pricing re-used for IGECL profile).
2. Extract the alias from `AUFARTIK` (maybe `ART_1805_SysProfAkus = "IGE"`).
3. Pass that alias through `fn_SystemCeny` instead of `ART_1805_Serie`.

### TODO: F100 1500×1500 oversized surcharge — 1 case

```
Δ +116.91   1500025/1  F100  IG5  1500×1500  W-W    engine 351.67   cantor 234.76
```

**Likely cause**: Engine is **adding** a surcharge Cantor doesn't charge.
Looking at the GABARYT surcharge formula in SCHEMA 51:

```
PMATALL("ALL_DOD","SZYBY","GABARYT",
  IIF(area>7,"3", IIF(area>5,"2", IIF(area>4,"1", "4"))),1,1) * (GRPRS+AKTZUSCHLAG1)
```

For 1500×1500 = 2.25 m² → k3="4" → `PREIS4 = 0` → contribution 0. So it's
not GABARYT. Likely the F100 article has a different SCHEMA 41 surcharge
that fires on size (wind-load reinforcement?) that we evaluate when we
shouldn't. Needs formula-by-formula comparison against the Cantor breakdown
for 1500025.

**Fix path**: dump engine's per-line SCHEMA 41 breakdown for 1500025 via
`verify_price.mjs 1500025 --verbose` and diff against the AUFPREIS rows.
The extra amount will point at one formula that's misfiring.

### TODO: Multi-sash articles — 4 cases

```
—   1500005/1  F100  IG5CL  1000×1000  DEK-W    (multi-sash 2 — FELDB/FELDH)
—   1500008/1  PP202 IG5 PP PSK  2000×2400  W-W (multi-sash 2)
—   1500008/2  F401  IG5  3000×1570  W-W      (multi-sash 4)
—   1500008/4  F350  IG5  1260×1500  W-W      (multi-sash 3)
```

**Status**: `context.ts` throws explicitly for `sashCount > 1`.

**Fix path**: compute `FELDB`/`FELDH` as `BRB / sashCount - mullion_offset`.
The mullion offset depends on profile geometry —
`PROFILINGDEDUCTION` holds these per `PROFILINGID`. Need the mapping from
profile article numbers (50021 = mullion, 50011 = sash) to `PROFILINGID`.

Affects articles: `F100` dual-sash, `F2xx`, `F3xx`, `F4xx`, `PP2xx`
(tilt-slide), `CV2xx` (cover).

### TODO: Aluminum — 1 case

```
—   1500014/1  CV203  CVP  5000×2500  ARAL-ARAL  (multi-sash + ALU)
```

**Status**: multi-sash throws first (same blocker as above); additionally
`fn_CenaDopKolor` throws on `ARAL-ARAL`; `fn_SystemCenyAlu` is stubbed.

**Fix path**: Phase D.

### TODO: Non-white colors — 1 case (direct)

```
—   1500022/1  F100  MB86N  1000×1200  ARAL-ARAL    (ALU color)
```

**Status**: `fn_CenaDopKolor` / `fn_getFarbcodeClass1/2/3` throw for
non-`W-W` colors.

**Fix path**: Phase C. Implement color classifier — map `(interiorRal,
exteriorRal)` to Cantor's class strings (`Dek_gr_I`, `Kla_gr_I`, etc.) and
implement the color surcharge formulas in SCHEMA 18 + SCHEMA 41 color rows.

## Phase C (detailed scope)

### C.1 Openings — beyond fixed

- `DK` / `UR` / `R` / `U` / `DKI` / `KI`
- Per-sash `BESCHVAR` routing through SCHEMA 37
- `BESCHLAGMAXPRIOWERT` / `MINPRIOWERT` from the beschlag priority table
  (currently hardcoded to 0; drives the non-standard-hardware formula
  branch).

### C.2 Colors — full matrix

See the "non-white" TODO above. Cantor's color taxonomy:

- Plain white (`W-W`) — ✅
- Single-sided foil (`DEK-W`, `W-DEK`)
- Two-sided foil (`DEK-DEK`) same vs different codes
- RAL paint (`RAL-RAL`, `C-C`, `K-K`, `I-I`, `S-S`)
- Lazura wood stain (`LAZ-LAZ`, `LAZ-RAL`, `LAZ-K`, …)
- Acrylic RAL (`ARAL-ARAL`)
- Metallic (`m`-suffix codes like `9016m`)
- Special (`ASPE`, `ADEK`)

### C.3 Articles beyond F100 family

Today any article whose `(ARTNR, PROFILSATZNAME)` pair appears in `AUFPOS`
at least once can be priced — `articleVariablesFor` handles the variable
resolution automatically. Articles **never** priced in Cantor will throw
with the explicit error in
[`context.ts`](../src/utils/cantorPricing/context.ts). To enable them:
create a single representative order in Cantor, re-run `cantor:sync`.

### C.4 Profile / hardware / threshold surcharges

SCHEMA 41 sub-formulas currently evaluating to 0 (context defaults match the
non-surcharge branch):

- `Dopłata za profil ramy` — non-standard frame profile
- `Dopłata za próg` — threshold surcharge (`SCHWELLE=1`, door/patio)
- `Dopłata za przewiązkę` — coupling (`GT`)
- `Dopłata za słupek ruchomy` — movable mullion (`ST`)
- `Dopłata za wzmocnienie pełne` — full reinforcement (frame 50001 + RC2)
- `Dopłata za suwankę` — PSK-specific
- `Dopłata za kształt nietypowy` — non-rectangular (`KATALOGNR > 0`)
- `Dopłata za ilość kwater` — multi-panel ALU

### C.5 Glazing beyond FL4/T4

- Full pane catalog via `GLASS_PANE` (214 rows mirrored) — code plumbing
  already supports arbitrary pane codes; goldens exist only for FL4/T4.
- Spacer selection (`GLASS_SPACER`)
- Gas fill (`GLASS_GAS`)
- Glazing structure (2-24 / 3-32 / …) resolving to pane BoM
  (`GLASS_BOM`, `ORDER_GLASS_BOM`)
- SCHEMA 45 (`FELDFUEL` — glazing structure pricing)

### C.6 Formula primitives still stubbed

In [`builtins.ts`](../src/utils/cantorFormula/builtins.ts):

- `ZMAT`, `ZMATALL` — index/variant matrix lookups
- `GETSYSVAR_S`, `GETSYSVAR_D` — system-variable lookups
- `GETARTVARFIELD_S` — article-variant field accessor
- `PMAT` — PMATALL variant

None have fired in Phase A/B. When a Phase C formula needs them they'll
throw `not implemented` at the call site.

### C.7 Symbolic `k3` in PMATALL

`mirror.ts:pmatPrice` currently falls back to the default `PREIS` column
for non-numeric `k3` (e.g. `"PelneRama"`). Cantor's actual behavior: `k3`
is a column label resolved via `PREISSCHEMAD.BEZEICHNUNG1 →
PREISFELDNR`. Needs a lookup implementation for Phase C formulas that use
label-style `k3` (e.g. `fn_CenaDopKolor` color surcharge formulas).

## Phase D — aluminum

PREISMAT has ~580k rows under `AL_F100` / `AL_F100A` / `AL_F100D` and
variants (MB45/70/79/86). The `MATERIALART=3` path in SCHEMA 41 uses
`fn_SystemCenyAlu` (currently echoes input profilsatz) plus optional
matrix-name suffixes (`_MAX` for reinforced, `_HI` for high-insulation).
Additional shims needed: `fn_CenaAluDWU`, `fn_CenaBaz37ALUFIX`.

## Phase E — legacy cutover

When Phase C is green on every configuration we sell, delete:

- `src/utils/pricingEngine.ts` (legacy IDW)
- `src/data/cantorPricingMatrices.json` (sampled anchors)
- The `0.241008` constant
- The regression fallback `105.41 + 95.82 * area`
- `cantorPricingData.ts` — fold salvageable constants into engine context
  builder

## Four orthogonal items (from earlier rollout)

| # | Item | Status |
|---|---|---|
| 1 | Main configurator on new engine | ✅ `useConfigurator.ts` calls `fetchPrice`. Legacy imports removed. |
| 2 | Geometry (BRB/BRH) | ✅ Verified `BRB=EINHBREITE` across 10 real PVC orders; multi-sash `FELDB` guarded |
| 3 | Prod runtime (Supabase Edge Function) | ⏸ Deferred. Contract ready (`pricingApi.ts` — swap `VITE_PRICING_API_URL`). Needs mirror port to Supabase Postgres. |
| 4 | CI | ⏸ Deferred per user request. Fixture (1 MB) makes tests deterministic locally. |

## Known issues / oddities

- `cantor.sqlite` is gitignored (~110 MB). Regenerate via `npm run
  cantor:sync`. The fixture (1 MB) is committed and sufficient for tests.
- Historical orders with `VKFAKTORPREISZYK = 1` (PLN-stored) are filtered
  out by the coverage harness; they'd compare engine-EUR against
  Cantor-PLN and drown real signal.
- Mismatches on orders with `VKFAKTORPREISZYK = 0.241` where cantor
  stored `VKPOSPREIS` less than the engine's output often have a
  line-level discount in `AUFPREIS` — the coverage harness compares
  against the `AUFPREIS` sum (pre-discount), not `VKPOSPREIS`.
