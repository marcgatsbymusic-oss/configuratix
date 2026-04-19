# Cantor pricing engine — incremental roadmap

Multi-stage plan to close every gap identified in
[`cantor-pricing-status.md`](./cantor-pricing-status.md). Each stage ships
independently, is verifiable through
[`cantor-pricing-coverage.md`](./cantor-pricing-coverage.md), and preserves
the guardrail: **100 % of prices come from Cantor source data — no code
tables, no magic numbers, no per-article workarounds**.

Stages progress low-risk → high-risk. Current: Stage 0 complete (Phase A +
B), coverage at 19 / 28 match (67.9 %).

## Progress

Tick top-level stages when every sub-task in the stage is ticked. Update the
coverage baseline in this line on each merge.

**Baseline coverage**: 19 / 28 match (67.9 %), 3 mismatch, 6 unsupported.

- [x] Stage 0 — Phase A + B (base window + panes for F104/IG5/W-W)
- [x] Stage 1 — Close three existing mismatches → 22 / 28
- [ ] Stage 2 — Multi-sash → 26 / 28
- [ ] Stage 3 — Non-white colors → all PVC colored ✓
- [ ] Stage 4 — Full PVC catalog (surcharges, glazing structure) → ≥ 95 % PVC
- [ ] Stage 5 — Aluminum → 100 % match
- [ ] Stage 6 — Legacy engine cutover
- [ ] Stage 7 — Supabase Edge Function for production
- [ ] Stage 8 — Continuous verification

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

- [x] **1.1.a** Dump `AUFARTIK.ARTIKELVARIABLEN` for a real IGECL position; identify
      which `ART_1805_*` variable holds the matrix key that `PREISMAT`
      actually uses (likely `ART_1805_SysProfAkus` → `IGE`).
- [x] **1.1.b** Update [`src/utils/cantorPricing/fns.ts`](../src/utils/cantorPricing/fns.ts)
      `fn_SystemCeny`: when `ART_1805_Serie` has no matching
      `KLASSE2` rows in `PREISMAT`, fall through to `ART_1805_SysProfAkus`.
      Implement the check as a query against the mirror — not a
      hardcoded `IGECL → IGE` map.
- [x] **1.1.c** Add a golden for AUFNR 1500005 pos 2 (F100 IGECL 1000×1000 W-W) via
      `npm run cantor:golden -- 1500005`.
- [x] **1.1.d** Run `npm run cantor:coverage` — 1500005/2 and /3 both flip to ✓.

### 1.2 — F100 1500×1500 overshoot

Mismatch: `1500025/1` (engine +€116.91)
(see [status.md §F100 1500×1500 oversized surcharge](./cantor-pricing-status.md#todo-f100-1500x1500-oversized-surcharge--1-case))

- [x] **1.2.a** Run `npx tsx scripts/cantor/verify_price.mjs 1500025` — print engine
      per-line breakdown.
- [x] **1.2.b** Query `AUFPREIS WHERE AUFNR = 1500025` via
      `node .agents/skills/cantor-access/scripts/queryCantor.mjs` for
      Cantor's per-line breakdown.
- [x] **1.2.c** Diff the two, identify the one formula contributing ~€116.91 /
      ~484 PLN that Cantor omits.
- [x] **1.2.d** If an article-variant gate (`ART_1199_WzmSkrzO` etc.) is misread,
      verify the value comes from `AUFARTIK` not a hardcoded default. Fix the
      context builder if needed.
- [x] **1.2.e** Add a golden for 1500025; add an assertion to
      [`tests/pricing/base_window.test.ts`](../tests/pricing/base_window.test.ts).
- [x] **1.2.f** `npm run cantor:coverage` — 1500025/1 flips to ✓.

## Stage 2 — multi-sash support

**Unblocks**: F2xx/F3xx/F4xx, PP2xx, CV2xx. Target coverage: 26 / 28
(92.9 %).

Blocker is in
[`src/utils/cantorPricing/context.ts`](../src/utils/cantorPricing/context.ts)
(search `multi-sash`): currently throws when `sashCount > 1` because
`FELDB` / `FELDH` need mullion offsets we don't read yet.

### 2.1 — mirror profile geometry

- [ ] **2.1.a** Extend
      [`scripts/cantor/sync_cantor_pricing.mjs`](../scripts/cantor/sync_cantor_pricing.mjs)
      to include `PROFILING`, `PROFILINGDEDUCTION`, `PROFILINGSEGMENT`,
      `PROFILINGSEGMENTDEDUCTION`.
- [ ] **2.1.b** Discover the mapping from article profile numbers
      (`50001`, `50011`, `50021`) to `PROFILINGID` via `queryCantor`
      (check `PROFILING.CODE` / `ARTIKEL`).
- [ ] **2.1.c** Add `mirror.profileGeometry(profileArticleNr): {
      deduction_frame_side, deduction_mullion, rabbet_glass }` to
      [`mirror.ts`](../src/utils/cantorPricing/mirror.ts). No
      hardcoded numbers — every value read from the mirror.

### 2.2 — derive FELDB / FELDH / UMFANG for multi-sash

- [ ] **2.2.a** In [`src/utils/cantorPricing/context.ts`](../src/utils/cantorPricing/context.ts),
      replace the `sashCount > 1` throw with
      `FELDB = (BRB - totalMullionWidth) / sashCount`, sourcing both
      values from `mirror.profileGeometry`.
- [ ] **2.2.b** Confirm `UMFANG = 2 * (BRB + BRH)` still matches AUFPOS.
- [ ] **2.2.c** Set `GLASB = FELDB - 2 * rabbet_glass` per sash.

### 2.3 — per-sash opening classes

- [ ] **2.3.a** Read the Cantor opening-combination code from `AUFARTIK`
      `ART_1199_MacierzOku` for each golden multi-sash order.
- [ ] **2.3.b** Verify the engine produces the same code from `openings[]`.
- [ ] **2.3.c** Where Cantor's code differs from a naive join, mirror the
      source table (likely `ARTKLEST` with `ESCODE=31`). Don't hardcode.

### 2.4 — goldens

- [ ] **2.4.a** Extract goldens: F2xx (2-sash DK), F401 (4-sash),
      PP202 (tilt-slide), F350 (3-sash).
- [ ] **2.4.b** Add `tests/pricing/multi_sash.test.ts` with
      per-article assertions.

### 2.5 — definition of done

- [ ] **2.5.a** `npm run cantor:coverage` shows F2xx/F3xx/F4xx/PP rows as
      ✓ except for color/aluminum gaps (Stages 3/5).

## Stage 3 — non-white colors

**Unblocks**: RAL, foil (DEK), wood stain (LAZ), metallic, acrylic
(ARAL), two-tone combinations. Multiplies the supported configuration
space by ~50×.

Blocker: `fn_CenaDopKolor` / `fn_CenaDopRdzen` / `fn_CenaDopZgrzew` /
`fn_CenaDopUszcz` / `fn_getFarbcodeClass1/2/3` in
[`src/utils/cantorPricing/fns.ts`](../src/utils/cantorPricing/fns.ts) throw
for `color.code !== 'W-W'`.

### 3.1 — mirror color taxonomy

- [ ] **3.1.a** List color tables:
      `queryCantor "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%FARB%'"`.
- [ ] **3.1.b** Identify tables mapping `(colorCode, interiorRAL, exteriorRAL) → class_1`
      (the strings `Dek_gr_I`, `Kla_gr_I`, etc. referenced in SCHEMA 18/41).
- [ ] **3.1.c** Add them to
      [`sync_cantor_pricing.mjs`](../scripts/cantor/sync_cantor_pricing.mjs).

### 3.2 — implement color classifier

- [ ] **3.2.a** Add `src/utils/cantorPricing/colors.ts` with
      `classify(color, interior, exterior): { class1, class2, class3 }`,
      sourced from the mirror tables.
- [ ] **3.2.b** Wire `fn_getFarbcodeClass1/2/3` in
      [`fns.ts`](../src/utils/cantorPricing/fns.ts) to `classify`.
- [ ] **3.2.c** Wire `fn_CenaDopKolor/Rdzen/Zgrzew/Uszcz` in `fns.ts` to read
      the surcharge factor from the mirror (source: `PREISMAT` /
      `PREISGRUPPE`-linked table; confirm before implementing).

### 3.3 — SCHEMA 18 (versch) color matrix

- [ ] **3.3.a** Route color-surcharge line items through
      `evaluateSchema(18, ...)` in
      [`index.ts`](../src/utils/cantorPricing/index.ts).
- [ ] **3.3.b** Confirm against `AUFPREIS`: a colored order has SCHEMA 18
      rows matching the engine output.

### 3.4 — symbolic k3 in PMATALL

(see [status.md §Symbolic `k3` in PMATALL](./cantor-pricing-status.md#c7-symbolic-k3-in-pmatall))

- [ ] **3.4.a** Extend [`mirror.ts`](../src/utils/cantorPricing/mirror.ts)
      `pmatPrice`: resolve non-numeric `k3` (e.g. `"PelneRama"`) via
      `PREISSCHEMAD.BEZEICHNUNG1 → PREISFELDNR` → `PREISx` column.
- [ ] **3.4.b** Remove the silent fallback-to-`PREIS` path — unresolved
      labels must throw.

### 3.5 — goldens

- [ ] **3.5.a** Extract a golden per color bucket: `DEK-W`, `RAL-RAL` same,
      `RAL-RAL` different, `LAZ-LAZ`, `ARAL-ARAL`, metallic `9016m`.
- [ ] **3.5.b** Add `tests/pricing/colors.test.ts` asserting per-color
      breakdowns.

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

- [ ] **4.1.a** For each SCHEMA 41 sub-formula currently evaluating to 0
      when it shouldn't, trace inputs; confirm context has the right
      values (frame article, threshold, movable mullion…) from
      `AUFARTIK`.
- [ ] **4.1.b** Add goldens for each surcharge-bearing config (door with
      threshold, non-standard frame profile, coupling, reinforcement…).
- [ ] **4.1.c** Implement any new `fn_*` needed — data-driven.

### 4.2 — glazing structure & SCHEMA 45

- [ ] **4.2.a** Mirror `GLASS_BOM`, `GLASS_GAS`, `GLASS_BOM_EXCH_GROUPS`
      via [`sync_cantor_pricing.mjs`](../scripts/cantor/sync_cantor_pricing.mjs).
- [ ] **4.2.b** Evaluate SCHEMA 45 (FELDFUEL glazing structure pricing) in
      [`index.ts`](../src/utils/cantorPricing/index.ts).
- [ ] **4.2.c** Goldens: "2-24", "3-32", "3-44", "BS24"
      (the package the 1500031 order exposed).

### 4.3 — other formula primitives

(see [status.md §C.6 Formula primitives still stubbed](./cantor-pricing-status.md#c6-formula-primitives-still-stubbed))
Implement only when a real golden forces the path — throw until then.

- [ ] **4.3.a** `ZMAT`, `ZMATALL`
- [ ] **4.3.b** `GETSYSVAR_S` / `GETSYSVAR_D`
- [ ] **4.3.c** `GETARTVARFIELD_S`
- [ ] **4.3.d** `PMAT`

### 4.4 — coverage checkpoint

- [ ] **4.4.a** `npm run cantor:coverage` ≥ 95 % match on PVC-only rows.
      ALU remaining to Stage 5.

## Stage 5 — aluminum (Phase D)

**Unblocks**: all MB systems (MB45/70/79/86), AL cover (CV20x).

Blocker: `fn_SystemCenyAlu` stubbed; `MATERIALART=3` path in SCHEMA 41
uses suffixes (`_MAX`, `_HI`) we don't compose.

### 5.1 — mirror ALU matrices fully

- [ ] **5.1.a** Confirm `AL_F100` / `AL_F100A` / `AL_F100D` rows
      mirrored after sync (expect ~580k rows under `PREISMATRIX LIKE
      'AL_%'`). No new tables typically needed.

### 5.2 — SystemCenyAlu + matrix suffix composition

- [ ] **5.2.a** Implement `fn_SystemCenyAlu` in
      [`fns.ts`](../src/utils/cantorPricing/fns.ts) reading from
      `AUFARTIK.ART_1805_Serie` (verify exact variable first).
- [ ] **5.2.b** Implement `_MAX` / `_HI` matrix-suffix composition following
      the SCHEMA 41 formula verbatim (source:
      [`src/data/cantor/_research/all_schema_formulas.json`](../src/data/cantor/_research/all_schema_formulas.json)
      SCHEMA 41 row "Cena bazowa jednostki"). No conditional tables in
      code.
- [ ] **5.2.c** Implement `fn_CenaAluDWU` (data-driven PMATALL).
- [ ] **5.2.d** Implement `fn_CenaBaz37ALUFIX` (data-driven PMATALL).

### 5.3 — goldens

- [ ] **5.3.a** Real order for each MB system at two sizes.
- [ ] **5.3.b** At least one ALU order with `ARAL-ARAL` color (exercises
      the color path shared with Stage 3).
- [ ] **5.3.c** Add `tests/pricing/aluminum.test.ts`.

### 5.4 — definition of done

- [ ] **5.4.a** `npm run cantor:coverage` at 100 % match.

## Stage 6 — legacy engine cutover (Phase E)

Only after Stage 5 is green.

### 6.1 — delete legacy code

- [ ] **6.1.a** Remove `src/utils/pricingEngine.ts`.
- [ ] **6.1.b** Remove `src/data/cantorPricingMatrices.json`.
- [ ] **6.1.c** Remove the `0.241008` magic multiplier and the
      regression fallback `105.41 + 95.82 * area`.
- [ ] **6.1.d** Remove `src/data/cantorPricingData.ts` (fold salvageable
      constants into the engine context builder).
- [ ] **6.1.e** Delete `profileGlazing.ts` if no longer referenced.

### 6.2 — remove feature flag

- [ ] **6.2.a** Grep for `calculatePrice`, `resolveOpeningClass`,
      `VK_MULTIPLIER`, `IDW_POWER` and delete remaining references.
- [ ] **6.2.b** Remove any legacy-IDW fallback path in
      [`useConfigurator.ts`](../src/components/SlateConfigurator/useConfigurator.ts).

### 6.3 — minimise hardcoded app/Cantor translations

Four legit translations currently live in code (see
[status.md §Legitimate app/Cantor namespace translations](./cantor-pricing-status.md#legitimate-appcantor-namespace-translations-kept)).

- [ ] **6.3.a** Move `PROFILE_TO_PROFILSATZ`, `WINDOWTYPE_TO_ARTNR`,
      `OPENING_CODE_MAP`, `EINH_FIELD_TO_VAR` from
      [`configuratorAdapter.ts`](../src/utils/cantorPricing/configuratorAdapter.ts)
      and [`fns.ts`](../src/utils/cantorPricing/fns.ts) into
      `src/data/configurator_mappings.json`.
- [ ] **6.3.b** Optional — generate `configurator_mappings.json` from
      Cantor during `cantor:sync` using `AUFARTIK.ARTIKELVARIABLEN`
      patterns. Only ship if achievable without hand-written rules.

## Stage 7 — production runtime (Supabase)

Deferred from the original rollout (gap 3 in
[status.md §Four orthogonal items](./cantor-pricing-status.md#four-orthogonal-items-from-earlier-rollout)).

### 7.1 — port mirror to Supabase Postgres

- [ ] **7.1.a** Add a Supabase variant of
      [`sync_cantor_pricing.mjs`](../scripts/cantor/sync_cantor_pricing.mjs)
      that upserts each table into Supabase (same schema + indexes).
- [ ] **7.1.b** Abstract
      [`mirror.ts`](../src/utils/cantorPricing/mirror.ts) behind an
      interface.
- [ ] **7.1.c** Implement a Supabase-backed variant with the same
      queries (`pmatLookup`, `loadSchema`, `artpreiseFields`,
      `articleVariablesFor`, `activePreiszyk`). better-sqlite3 impl
      stays for dev / tests / fixture.

### 7.2 — deploy Edge Function

- [ ] **7.2.a** `supabase/functions/price/index.ts` wraps
      [`pricingServer.ts`](../scripts/cantor/pricingServer.ts)
      `handlePriceRequest`, uses the Supabase-backed mirror.
- [ ] **7.2.b** Point `VITE_PRICING_API_URL` in prod `.env` at the
      deployed function URL. Browser client
      ([`pricingApi.ts`](../src/utils/cantorPricing/pricingApi.ts))
      already honours it.

### 7.3 — verification in prod

- [ ] **7.3.a** Re-run `cantor:coverage` against the Supabase-backed
      mirror — should produce identical results.
- [ ] **7.3.b** Smoke test `/debug-pricing` against a known AUFNR.

## Stage 8 — continuous verification

Runs continuously once Stage 7 is live.

### 8.1 — scheduled sync + verify

- [ ] **8.1.a** Cron (or Supabase scheduled function) runs `cantor:sync`
      nightly from local Cantor DB into Supabase.
- [ ] **8.1.b** `cantor:verify` runs after each sync; alert on drift
      (email / Slack) with the new mismatch list.

### 8.2 — runtime regression guard

- [ ] **8.2.a** Log `(input, engine output)` for every configuration saved
      through the main configurator.
- [ ] **8.2.b** Diff against `AUFPOS` / `AUFPREIS` once the order is saved
      to Cantor.
- [ ] **8.2.c** Gap > €0.05 triggers an alert with the diff attached.

## Cross-cutting invariants

Re-tick these at the end of every stage before merging:

- [ ] No new object literals keyed by article / profile / color / pane /
      spacer in TS source. If a reviewer spots one, it's a workaround —
      move the data to a mirrored Cantor table.
- [ ] No numeric constants outside test tolerances or DSL literal values
      copied from `PREISE.FORMEL`.
- [ ] Every new `fn_` shim either reads from the mirror or throws with
      "not yet implemented for <specific path>".
- [ ] `npm run cantor:coverage` match % is non-decreasing vs the
      **Baseline coverage** line at the top of this file.
- [ ] `npm test` passes.
- [ ] [`docs/cantor-pricing-status.md`](./cantor-pricing-status.md) TODO
      entries for shipped work removed.
- [ ] **Baseline coverage** line at the top of this file updated.

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
