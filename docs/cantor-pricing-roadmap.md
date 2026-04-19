# Cantor pricing engine — incremental roadmap

Multi-stage plan to close every gap identified in
[`cantor-pricing-status.md`](./cantor-pricing-status.md). Each stage ships
independently, is verifiable through
[`cantor-pricing-coverage.md`](./cantor-pricing-coverage.md), and preserves
the guardrail: **100 % of prices come from Cantor source data — no code
tables, no magic numbers, no per-article workarounds**.

Stages progress low-risk → high-risk. Current: Stage 0 complete (Phase A +
B), coverage at 19 / 28 match (67.9 %).

## Guiding rules — apply at every stage

1. **No per-article tables in code.** Anything you'd write as `{ F104:
   …, F105: … }` must come from a mirrored Cantor table instead. Enforce
   by reviewing diffs — if the PR adds an object literal keyed by article
   / profile / color, it's probably a workaround.
2. **No magic numbers.** Factors, thresholds, tax rates come from
   `PREISMAT`, `PREISZYK`, `PREISSCHEMAD` or equivalent. The only
   numeric literals allowed are (a) DSL token values copied from
   `PREISE.FORMEL`, (b) tolerances in tests.
3. **No silent fallbacks.** If a variable / fn / primitive isn't
   resolvable, throw with a clear message naming the missing data source.
   Better a loud unsupported-path than a wrong price.
4. **Every stage ships a coverage delta.** Before merging, run
   `npm run cantor:coverage` and record the before/after match %.
5. **Each new capability ships with a golden.** Create a real order in
   Cantor for the newly-supported configuration, extract via
   `npm run cantor:golden -- <AUFNR>`, rebuild the fixture, add a test.

## Stage 1 — close the three existing mismatches

**Unblocks**: IGECL profile + F100/1500×1500 overshoot. Target coverage:
22 / 28 (78.6 %). Smallest stage, closest to done, best place to shake out
the investigation workflow.

### 1.1 — IGECL profile alias

Mismatches: `1500005/2`, `1500005/3`
(see [status.md §Remaining coverage mismatches → IGECL profile](./cantor-pricing-status.md#todo-igecl-profile--2-cases))

- [ ] Dump `AUFARTIK.ARTIKELVARIABLEN` for a real IGECL position; identify
      which `ART_1805_*` variable holds the matrix key that `PREISMAT`
      actually uses (likely `ART_1805_SysProfAkus` → `IGE`).
- [ ] Update [`src/utils/cantorPricing/fns.ts`](../src/utils/cantorPricing/fns.ts)
      `fn_SystemCeny`: when `ART_1805_Serie` has no matching
      `KLASSE2` rows in `PREISMAT`, fall through to `ART_1805_SysProfAkus`.
      Implement the check as a query against the mirror — not a
      hardcoded `IGECL → IGE` map.
- [ ] Add a golden for AUFNR 1500005 pos 2 (F100 IGECL 1000×1000 W-W).
- [ ] Coverage expectation: 1500005/2 and /3 both flip to ✓.

### 1.2 — F100 1500×1500 overshoot

Mismatch: `1500025/1` (engine +€116.91)
(see [status.md §F100 1500×1500 oversized surcharge](./cantor-pricing-status.md#todo-f100-1500x1500-oversized-surcharge--1-case))

- [ ] Run `verify_price.mjs 1500025` — prints engine per-line breakdown.
- [ ] Query `AUFPREIS WHERE AUFNR = 1500025` — Cantor's per-line breakdown.
- [ ] Diff the two, identify the one formula contributing ~€116.91 /
      ~484 PLN that Cantor omits.
- [ ] If it's an article-variant gate (`ART_1199_WzmSkrzO` etc.) whose
      value our context mis-reads: verify the value comes from
      `AUFARTIK` not a hardcoded default. Fix the context builder if
      needed.
- [ ] Add a golden for 1500025, add an assertion to
      [`tests/pricing/base_window.test.ts`](../tests/pricing/base_window.test.ts).

## Stage 2 — multi-sash support

**Unblocks**: F2xx/F3xx/F4xx, PP2xx, CV2xx. Target coverage: 26 / 28
(92.9 %).

Blocker is in
[`src/utils/cantorPricing/context.ts`](../src/utils/cantorPricing/context.ts)
(search `multi-sash`): currently throws when `sashCount > 1` because
`FELDB` / `FELDH` need mullion offsets we don't read yet.

### 2.1 — mirror profile geometry

- [ ] Extend
      [`scripts/cantor/sync_cantor_pricing.mjs`](../scripts/cantor/sync_cantor_pricing.mjs)
      to include `PROFILING`, `PROFILINGDEDUCTION`, `PROFILINGSEGMENT`,
      `PROFILINGSEGMENTDEDUCTION`, and a mapping from article profile
      numbers (e.g. `50001`, `50011`, `50021`) to `PROFILINGID`. The
      mapping lives in `PROFILING.CODE` or `ARTIKEL` (verify via
      `queryCantor`).
- [ ] Add a mirror helper `mirror.profileGeometry(profileArticleNr): {
      deduction_frame_side, deduction_mullion, rabbet_glass }`. No
      hardcoded numbers — read every value from the mirror.

### 2.2 — derive FELDB / FELDH / UMFANG for multi-sash

- [ ] In [`src/utils/cantorPricing/context.ts`](../src/utils/cantorPricing/context.ts),
      replace the `sashCount > 1` throw with:
      `FELDB = (BRB - totalMullionWidth) / sashCount`
      where `totalMullionWidth` and the per-sash edge deductions come
      from `mirror.profileGeometry`.
- [ ] `UMFANG` stays `2 * (BRB + BRH)` (verified from AUFPOS).
- [ ] `GLASB = FELDB - 2 * rabbet_glass` per sash.

### 2.3 — per-sash opening classes

Today `macierzOkuFromOpenings` in the adapter is simplistic. For
multi-sash:

- [ ] Read the Cantor opening-combination code from `AUFARTIK`
      `ART_1199_MacierzOku` for each golden multi-sash order, then
      verify the engine produces the same code from `openings[]`.
- [ ] Where Cantor's code differs from a naive join, that mapping lives
      in a mirrored Cantor table (likely `ARTKLEST` with
      `ESCODE=31` or similar). Mirror it; don't hardcode.

### 2.4 — goldens

- [ ] Extract goldens for F2xx (2-sash DK), F401 (4-sash), PP202
      (tilt-slide), F350 (3-sash).
- [ ] Add a test suite
      `tests/pricing/multi_sash.test.ts` with per-article assertions.

### 2.5 — definition of done

- [ ] `npm run cantor:coverage` shows F2xx/F3xx/F4xx/PP rows as ✓
      except for color/aluminum gaps handled in Stages 3/5.

## Stage 3 — non-white colors

**Unblocks**: RAL, foil (DEK), wood stain (LAZ), metallic, acrylic
(ARAL), two-tone combinations. Multiplies the supported configuration
space by ~50×.

Blocker: `fn_CenaDopKolor` / `fn_CenaDopRdzen` / `fn_CenaDopZgrzew` /
`fn_CenaDopUszcz` / `fn_getFarbcodeClass1/2/3` in
[`src/utils/cantorPricing/fns.ts`](../src/utils/cantorPricing/fns.ts) throw
for `color.code !== 'W-W'`.

### 3.1 — mirror color taxonomy

- [ ] Identify Cantor's color tables — likely `FARBEN`, `FARBGRUPPE`,
      `FARBGRUPPEN_FARBCODES` or similar. Use `queryCantor` to list
      `INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%FARB%'`.
- [ ] Mirror the tables that map `(colorCode, RAL interior, RAL
      exterior) → class_1` (the strings `Dek_gr_I`, `Kla_gr_I`, etc.
      referenced in SCHEMA 18 and SCHEMA 41 color branches).

### 3.2 — implement color classifier

- [ ] Add `src/utils/cantorPricing/colors.ts` exposing
      `classify(color, interior, exterior): { class1, class2, class3 }`
      that reads the mirrored color-taxonomy tables. No hardcoded tables
      for the class lookups.
- [ ] Wire the classifier into
      [`fns.ts`](../src/utils/cantorPricing/fns.ts):
      - `fn_getFarbcodeClass1/2/3` → `classify(...).classN`
      - `fn_CenaDopKolor/Rdzen/Zgrzew/Uszcz` → read the corresponding
        surcharge factor from the mirror (probably `PREISMAT` or
        `PREISGRUPPE`-linked table). Confirm source before implementing.

### 3.3 — SCHEMA 18 (versch) color matrix

SCHEMA 18 has multi-branch formulas for every color combination (seen in
`src/data/cantor/_research/all_schema_formulas.json`). Evaluate it the
same way Phase A+B evaluate SCHEMA 41/51 — no per-branch hardcoding.

- [ ] Route color-surcharge line items through `evaluateSchema(18, ...)`.
- [ ] Confirm via AUFPREIS: a colored-order's breakdown has SCHEMA 18
      rows.

### 3.4 — symbolic k3 in PMATALL

(see [status.md §Symbolic `k3` in PMATALL](./cantor-pricing-status.md#c7-symbolic-k3-in-pmatall))

Color formulas use `PMATALL(..., "PelneRama", ...)`. Today
`mirror.pmatPrice` falls back to default `PREIS`; correct behaviour is
to resolve `"PelneRama"` against `PREISSCHEMAD.BEZEICHNUNG1` →
`PREISFELDNR` → `PREISx` column.

- [ ] Extend [`mirror.ts`](../src/utils/cantorPricing/mirror.ts)
      `pmatPrice` with a cached lookup into `PREISSCHEMAD`.
- [ ] Remove the fallback-to-`PREIS` path so unresolved labels throw.

### 3.5 — goldens

- [ ] Extract a golden per color bucket: `DEK-W`, `RAL-RAL` same, `RAL-RAL`
      different, `LAZ-LAZ`, `ARAL-ARAL`, metallic `9016m`.
- [ ] Add `tests/pricing/colors.test.ts` asserting per-color breakdowns.

## Stage 4 — full PVC catalog

**Unblocks**: all remaining PVC configurations — any article + any
profile system that appears in Cantor.

Already 90 % there after Stages 1–3:

- Article variables come from `AUFARTIK` (no code table).
- Profile systems come from `ART_1805_Serie` / `SysProfAkus` (no code
  map).

Remaining work: the per-article surcharge formulas (see
[status.md §C.4 Profile / hardware / threshold surcharges](./cantor-pricing-status.md#c4-profile--hardware--threshold-surcharges)).

### 4.1 — profile-surcharge formulas

- [ ] For each SCHEMA 41 sub-formula currently evaluating to 0 when it
      shouldn't, trace the inputs and confirm the context has the right
      values (frame article, threshold, movable mullion, etc.) from
      `AUFARTIK`.
- [ ] Add goldens for each surcharge-bearing configuration (door with
      threshold, non-standard frame profile, coupling, reinforcement…).
- [ ] Any `fn_*` that triggers for these — implement data-driven.

### 4.2 — glazing structure & SCHEMA 45

- [ ] Mirror `GLASS_BOM`, `GLASS_GAS`, `GLASS_BOM_EXCH_GROUPS`.
- [ ] Evaluate SCHEMA 45 (FELDFUEL glazing structure pricing).
- [ ] Golden coverage for "2-24", "3-32", "3-44", and BS24 (the Cantor
      order 1500031 exposed).

### 4.3 — other formula primitives

(see [status.md §C.6 Formula primitives still stubbed](./cantor-pricing-status.md#c6-formula-primitives-still-stubbed))

Implement as needed when a Phase C formula calls them. No speculative
implementation — throw until a real golden forces the path.

- [ ] `ZMAT`, `ZMATALL`
- [ ] `GETSYSVAR_S/D`
- [ ] `GETARTVARFIELD_S`
- [ ] `PMAT`

### 4.4 — goldens

- [ ] Coverage target: ≥ 95 % match on PVC-only rows in
      `cantor:coverage`. Remaining ALU cases handled in Stage 5.

## Stage 5 — aluminum (Phase D)

**Unblocks**: all MB systems (MB45/70/79/86), AL cover (CV20x).

Blocker: `fn_SystemCenyAlu` stubbed; `MATERIALART=3` path in SCHEMA 41
uses suffixes (`_MAX`, `_HI`) we don't compose.

### 5.1 — mirror ALU matrices fully

Current sync filter `NUMMER = 2301` already covers `AL_F100` et al. —
confirm by inspecting `PREISMATRIX LIKE 'AL_%'` row counts after sync.
No new tables needed.

### 5.2 — implement SystemCenyAlu + matrix suffix composition

- [ ] `fn_SystemCenyAlu` reads from `AUFARTIK.ART_1805_Serie` (or a
      Cantor-specific ALU system map — verify).
- [ ] Matrix suffix `_MAX` / `_HI` composition: follow the SCHEMA 41
      formula verbatim (source:
      `src/data/cantor/_research/all_schema_formulas.json` SCHEMA 41
      row "Cena bazowa jednostki"). No conditional tables in code.
- [ ] Additional `fn_*` needed:
      - `fn_CenaAluDWU`
      - `fn_CenaBaz37ALUFIX`
      Both data-driven (each probably resolves to a PMATALL call against
      a mirrored matrix).

### 5.3 — goldens

- [ ] Real order for each MB system at two sizes + one color (ideally
      ARAL to exercise the ALU color path shared with Stage 3).
- [ ] `tests/pricing/aluminum.test.ts`.

### 5.4 — definition of done

- [ ] `npm run cantor:coverage` at 100 % match or within documented
      Phase-E-deferred cases.

## Stage 6 — legacy engine cutover (Phase E)

Only after Stage 5 is green.

### 6.1 — delete legacy code

- [ ] Remove `src/utils/pricingEngine.ts`.
- [ ] Remove `src/data/cantorPricingMatrices.json`.
- [ ] Remove the `0.241008` magic multiplier and the
      regression fallback `105.41 + 95.82 * area`.
- [ ] Remove `src/data/cantorPricingData.ts` (constants fold into engine
      context builder if still relevant).
- [ ] Delete the `profileGlazing.ts` fallback map if no longer
      referenced.

### 6.2 — remove feature flag

- [ ] [`useConfigurator.ts`](../src/components/SlateConfigurator/useConfigurator.ts)
      already calls the new engine; delete any remaining vestigial IDW
      references. Verify by grep for `calculatePrice`, `resolveOpeningClass`,
      `VK_MULTIPLIER`, `IDW_POWER`.

### 6.3 — minimise hardcoded app/Cantor translations

Four legit translations currently live in code (see
[status.md §Legitimate app/Cantor namespace translations](./cantor-pricing-status.md#legitimate-appcantor-namespace-translations-kept)).
For Stage 6 consider:

- [ ] Move `PROFILE_TO_PROFILSATZ`, `WINDOWTYPE_TO_ARTNR`,
      `OPENING_CODE_MAP`, `EINH_FIELD_TO_VAR` out of
      [`configuratorAdapter.ts`](../src/utils/cantorPricing/configuratorAdapter.ts)
      and [`fns.ts`](../src/utils/cantorPricing/fns.ts) into
      `src/data/configurator_mappings.json`. Same data, no longer in
      code. Lets a non-engineer edit them and lets the sync script
      validate them against Cantor tables.
- [ ] Optional: generate `configurator_mappings.json` from Cantor during
      `cantor:sync` using `AUFARTIK.ARTIKELVARIABLEN` patterns so even
      these translations are data-driven. Only if it can be done
      without hand-written rules — otherwise keep as a reviewable
      config file.

## Stage 7 — production runtime (Supabase)

Deferred from the original rollout (gap 3 in
[status.md §Four orthogonal items](./cantor-pricing-status.md#four-orthogonal-items-from-earlier-rollout)).

### 7.1 — port mirror to Supabase Postgres

- [ ] Add a Supabase variant of
      [`sync_cantor_pricing.mjs`](../scripts/cantor/sync_cantor_pricing.mjs)
      that upserts each table into Supabase (same column names, same
      indexes — just different backend).
- [ ] Abstract
      [`mirror.ts`](../src/utils/cantorPricing/mirror.ts) behind an
      interface; implement a Supabase-backed variant that issues the
      same queries (`pmatLookup`, `loadSchema`, `artpreiseFields`,
      `articleVariablesFor`, `activePreiszyk`). The better-sqlite3
      implementation stays for dev / tests / fixture.

### 7.2 — deploy Edge Function

- [ ] `supabase/functions/price/index.ts` — wraps
      [`pricingServer.ts`](../scripts/cantor/pricingServer.ts)
      `handlePriceRequest`, uses the Supabase-backed mirror.
- [ ] Update `VITE_PRICING_API_URL` in production `.env` to the
      deployed function URL. The browser client
      ([`pricingApi.ts`](../src/utils/cantorPricing/pricingApi.ts))
      already reads this.

### 7.3 — verification in prod

- [ ] Re-run `cantor:coverage` against the Supabase-backed mirror.
      Should produce identical results (engine is the same code; only
      the data backend changes).
- [ ] Smoke test `/debug-pricing` in prod against a known AUFNR.

## Stage 8 — continuous verification

Runs continuously once Stage 7 is live.

### 8.1 — scheduled sync + verify

- [ ] Cron (or Supabase scheduled function) runs `cantor:sync` nightly
      from the local Cantor DB into Supabase.
- [ ] `cantor:verify` runs after each sync; on drift (new mismatches)
      alert via e-mail/Slack.

### 8.2 — one-shot regression guard

- [ ] On every configuration saved through the main configurator, log
      the (input, engine output) pair. Diff against the corresponding
      Cantor AUFPOS/AUFPREIS once the order is saved there. Gap > €0.05
      triggers an alert with the diff attached.

## Stage-by-stage checklist (copy into issues / project board)

```
Stage 1 — Fix existing mismatches
  [ ] 1.1 IGECL alias (1500005/2, /3)
  [ ] 1.2 F100 1500×1500 overshoot (1500025/1)
  [ ] Coverage: 22 / 28

Stage 2 — Multi-sash
  [ ] 2.1 Mirror profile geometry tables
  [ ] 2.2 Derive FELDB/FELDH/GLASB from geometry
  [ ] 2.3 Per-sash opening class resolution
  [ ] 2.4 Goldens: F2xx, F3xx, F4xx, PP, CV
  [ ] 2.5 Coverage: 26 / 28 (except Stage 3 / 5 cases)

Stage 3 — Colors
  [ ] 3.1 Mirror color taxonomy
  [ ] 3.2 colors.ts classifier + fn_ wiring
  [ ] 3.3 SCHEMA 18 evaluation
  [ ] 3.4 Symbolic k3 resolution via PREISSCHEMAD
  [ ] 3.5 Goldens per color bucket
  [ ] Coverage target: all PVC colored orders ✓

Stage 4 — Full PVC catalog
  [ ] 4.1 Profile-surcharge formulas
  [ ] 4.2 SCHEMA 45 glazing structure
  [ ] 4.3 Residual DSL primitives (ZMAT / PMAT / GETSYSVAR_*)
  [ ] 4.4 Goldens; coverage: ≥ 95 % on PVC

Stage 5 — Aluminum
  [ ] 5.1 Confirm AL_* matrices mirrored
  [ ] 5.2 fn_SystemCenyAlu + matrix suffix composition
  [ ] 5.3 Goldens per MB system
  [ ] 5.4 Coverage: 100 % match

Stage 6 — Legacy cutover
  [ ] 6.1 Delete pricingEngine.ts + IDW constants
  [ ] 6.2 Remove feature flag
  [ ] 6.3 Move app-to-Cantor translations to config (optional)

Stage 7 — Production runtime
  [ ] 7.1 Supabase-backed mirror variant
  [ ] 7.2 Supabase Edge Function deployment
  [ ] 7.3 Prod verification

Stage 8 — Continuous verification
  [ ] 8.1 Scheduled sync + verify
  [ ] 8.2 Runtime regression guard
```

## Cross-cutting invariants

Check at the end of every stage:

- [ ] No new object literals keyed by article / profile / color / pane /
      spacer in the TS source. If a reviewer spots one, it's a
      workaround — move the data to a mirrored Cantor table.
- [ ] No numeric constants outside test tolerances or DSL literal values
      copied from `PREISE.FORMEL`.
- [ ] Every new `fn_` shim either reads from the mirror or throws with
      "not yet implemented for <specific path>".
- [ ] `npm run cantor:coverage` match % is non-decreasing.
- [ ] `npm test` passes.
- [ ] `docs/cantor-pricing-status.md` updated — remove closed TODOs,
      move the % to the new baseline.

## Reference map

Files each stage will touch most:

| Area | Paths |
|---|---|
| Mirror schema + sync | [`scripts/cantor/sync_cantor_pricing.mjs`](../scripts/cantor/sync_cantor_pricing.mjs), [`src/utils/cantorPricing/mirror.ts`](../src/utils/cantorPricing/mirror.ts) |
| DSL primitives | [`src/utils/cantorFormula/builtins.ts`](../src/utils/cantorFormula/builtins.ts), [`src/utils/cantorFormula/evaluator.ts`](../src/utils/cantorFormula/evaluator.ts) |
| fn_* shims | [`src/utils/cantorPricing/fns.ts`](../src/utils/cantorPricing/fns.ts) |
| Context / variable resolution | [`src/utils/cantorPricing/context.ts`](../src/utils/cantorPricing/context.ts), [`src/utils/cantorFormula/context.ts`](../src/utils/cantorFormula/context.ts) |
| Input / adapter | [`src/utils/cantorPricing/input.ts`](../src/utils/cantorPricing/input.ts), [`src/utils/cantorPricing/configuratorAdapter.ts`](../src/utils/cantorPricing/configuratorAdapter.ts) |
| Schemas / panes / entry point | [`src/utils/cantorPricing/schema.ts`](../src/utils/cantorPricing/schema.ts), [`src/utils/cantorPricing/panes.ts`](../src/utils/cantorPricing/panes.ts), [`src/utils/cantorPricing/index.ts`](../src/utils/cantorPricing/index.ts) |
| Config / UI wiring | [`src/components/SlateConfigurator/useConfigurator.ts`](../src/components/SlateConfigurator/useConfigurator.ts), [`src/pages/DebugPricing.tsx`](../src/pages/DebugPricing.tsx) |
| Server handler | [`scripts/cantor/pricingServer.ts`](../scripts/cantor/pricingServer.ts), [`vite.config.ts`](../vite.config.ts) |
| Tests + goldens + fixture | [`tests/pricing/base_window.test.ts`](../tests/pricing/base_window.test.ts), [`tests/pricing/goldens/`](../tests/pricing/goldens/), [`tests/pricing/fixtures/cantor.fixture.sqlite`](../tests/pricing/fixtures/cantor.fixture.sqlite) |
| Verification scripts | [`scripts/cantor/verify_price.mjs`](../scripts/cantor/verify_price.mjs), [`scripts/cantor/verify_cantor_sync.mjs`](../scripts/cantor/verify_cantor_sync.mjs), [`scripts/cantor/coverage_replay.mjs`](../scripts/cantor/coverage_replay.mjs), [`scripts/cantor/build_pricing_goldens.mjs`](../scripts/cantor/build_pricing_goldens.mjs), [`scripts/cantor/build_test_fixture.mjs`](../scripts/cantor/build_test_fixture.mjs) |
| Research corpus (don't edit) | [`src/data/cantor/_research/all_schema_formulas.json`](../src/data/cantor/_research/all_schema_formulas.json) |
| Status docs | [`docs/cantor-pricing-status.md`](./cantor-pricing-status.md), [`docs/cantor-pricing-coverage.md`](./cantor-pricing-coverage.md), [`docs/cantor-pricing-roadmap.md`](./cantor-pricing-roadmap.md) (this file) |
