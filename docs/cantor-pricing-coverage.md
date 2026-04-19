# Cantor pricing coverage — verification guide

How to verify the new engine against real Cantor data. Two modes:

1. **Single-order inspection** — reprice one AUFNR, show the line-item
   breakdown. Useful for triaging a specific case.
2. **Bulk coverage replay** — reprice every real `AUFPOS` position, report
   match / mismatch / unsupported counts. Useful for tracking overall
   engine progress against Phase C/D.

Both modes read directly from the live Cantor SQL Server (they use
[`pricingServer.ts`](../scripts/cantor/pricingServer.ts) which opens the
committed SQLite mirror). No virtual orders are ever written to Cantor —
the CLAUDE.md read-only rule holds.

## Prerequisites

### 1. Local Cantor DB reachable

The scripts connect to `localhost\CANTOR2019` / `DRUTEX_DEALER` with
trusted Windows authentication via `msnodesqlv8`. If `node
.agents/skills/cantor-access/scripts/queryCantor.mjs "SELECT TOP 1 *
FROM AUFKOPF"` returns rows, you're set.

### 2. Mirror synced

```bash
npm run cantor:sync
```

Mirrors 12 Cantor tables into
[`src/data/cantor/cantor.sqlite`](../src/data/cantor/) (~110 MB,
gitignored) and writes checksums to `sync_meta.json`. Re-run after Drutex
pushes a new pricelist.

Source tables mirrored (see
[`sync_cantor_pricing.mjs`](../scripts/cantor/sync_cantor_pricing.mjs)):

| Table | Filter | Purpose |
|---|---|---|
| `PREISMAT` | `NUMMER = 2301` | Price grids (~1.15M rows at current cycle) |
| `PREISE` | `ZYKLUS = 2301` | Formulas (`FORMEL` column) |
| `PREISSCHEMA` / `PREISSCHEMAD` | — | Schema metadata + column labels |
| `PREISGRUPPE` | — | Pricelist groups (`PVC_I5`, `DOD`, `SZYBY_DOP`, …) |
| `PREISZYK` | — | Currency factor per pricelist |
| `ARTIKEL` | — | Article catalogue |
| `ARTPREISE` | — | Per-article `PREISFELDx` values (panes, spacers) |
| `ARTVARBL` | — | Variant definitions (`ART_<klCode>_<name>` metadata) |
| `AUFPOS` | `ARTTYP = 'E'` | Order positions (needed by coverage + article-var lookup) |
| `AUFARTIK` | `ARTKLCODE IN (1199, 1805)` | Resolved `ART_<klCode>_<name>` values per order |
| `GLASS_PANE` / `GLASS_SPACER` | — | Glass catalogue (pane code → `ARTIKELID`) |

## Single-order inspection — `verify_price.mjs`

```bash
npx tsx scripts/cantor/verify_price.mjs 1500041
```

Output:

```
AUFNR 1500041 / POS 1: F104 IG5 3200×700 W-W
  Cantor breakdown:  base 1049.00 + panes 80.64 = 1129.64 PLN     |  252.81 + 19.44 = 272.25 EUR
  Engine breakdown:  base 1049.00 + panes 80.64 = 1129.64 PLN     |  252.81 + 19.43 = 272.24 EUR
  TOTAL              ✓ EK    ✓ VK    (FAKTOR=0.241)
```

Per position: SCHEMA 41 base, pane sub-total, PLN + dealer-currency
totals. Mismatches surface the exact delta.

Source: [`scripts/cantor/verify_price.mjs`](../scripts/cantor/verify_price.mjs)

## Bulk coverage replay — `coverage_replay.mjs`

```bash
npm run cantor:coverage                  # all priced positions
npm run cantor:coverage -- --verbose     # show every row
npm run cantor:coverage -- --limit=5     # sample
```

Reprices every `AUFPOS` row with `ARTTYP = 'E' AND VKPOSPREIS > 0 AND
VKFAKTORPREISZYK > 0` through the engine and compares against the
`AUFPREIS` breakdown Cantor derived.

Source:
[`scripts/cantor/coverage_replay.mjs`](../scripts/cantor/coverage_replay.mjs).

### What it compares against

Each position's **AUFPREIS breakdown** (base `ARTIKEL` row + `PANE` delta
rows where `SORTKEY2` starts with `1;`), not `AUFPOS.VKPOSPREIS`:

- `AUFPREIS` is what Cantor's formulas produced (pre-discount).
- `AUFPOS.VKPOSPREIS` is post-line-discount — a dealer's sales policy, not
  a formula output.

The engine targets formula output, so comparing against `AUFPREIS` is the
apples-to-apples measure.

### Output categories

```
=== Coverage summary (28 priced positions) ===
  ✓  match         19  (67.9%)
  ✗  mismatch       3  (10.7%)
  —  unsupported    6  (21.4%)
```

- **✓ match** — engine total within €0.05 of the Cantor breakdown sum.
- **✗ mismatch** — engine returned a number but it's wrong. These are real
  bugs to fix. Investigate with `verify_price.mjs <AUFNR>` to see the
  per-formula breakdown.
- **— unsupported** — engine threw explicitly. These are Phase C/D
  boundaries (multi-sash, non-white colors, new articles without
  AUFARTIK history). The error message names the exact missing piece.

### Non-zero exit on mismatch

Exit code `0` only when zero mismatches. Exit code `1` when there's a real
engine bug. Exit code `2` on crash. Useful as a guard in a local
pre-commit hook.

### How input is reconstructed

For each `AUFPOS` row the script reads from the live DB:

| Cantor field | Engine input |
|---|---|
| `ARTNR` | `input.article` |
| `PROFILSATZNAME` | `input.profilsatz` |
| `EINHBREITE` / `EINHHOEHE` | `input.width_mm` / `input.height_mm` |
| `PROFILFARBE` | `input.color.code` |
| `RA_PROFILNR` / `FL_PROFILNR` | `input.frameProfile` / `input.sashProfile` |
| `FELDANZAHL` | `input.sashCount` |
| `AUFPREIS.FELDFUEL.SORTKEY1` | `input.glazing.code` (actual glazing — not a hardcoded `2-24`) |
| `AUFPREIS.PANE[SORTKEY2 LIKE '1;%']` | `input.glazing.panes` (only panes that are real upgrades) |
| `AUFKOPF.VKFAKTORPREISZYK` | applied manually in the harness for historical accuracy |

This design choice matters: if we passed hardcoded defaults, the engine
output wouldn't match any order that differed from the default — and
we'd incorrectly flag that as an engine bug.

## Fixture-based tests — `base_window.test.ts`

Vitest suite anchored on AUFNR 1500041 pos 1. Backed by
[`tests/pricing/fixtures/cantor.fixture.sqlite`](../tests/pricing/fixtures/)
(~1 MB committed subset).

```bash
npm test
```

```
✓ SCHEMA 41 base EK matches Cantor          (1049 PLN)
✓ Pane sub-total matches Cantor             (80.64 PLN)
✓ Total EK matches AUFPOS.EKPOSPREIS        (1129.64 PLN)
✓ Total VK matches AUFPOS.VKPOSPREIS        (272.24 ≈ 272.25 EUR)
```

Source:
[`tests/pricing/base_window.test.ts`](../tests/pricing/base_window.test.ts).
Golden:
[`tests/pricing/goldens/auf_1500041_1.json`](../tests/pricing/goldens/auf_1500041_1.json).

Regenerate the golden when Cantor changes:

```bash
npm run cantor:golden -- 1500041    # extract from live Cantor
npm run cantor:fixture              # rebuild the 1 MB subset
npm test                            # verify
```

## Adding a new golden

To broaden coverage, create a representative order in Cantor, then:

```bash
npm run cantor:golden -- <AUFNR>    # writes tests/pricing/goldens/auf_<n>_<pos>.json
npm run cantor:fixture              # regenerate fixture to include it
# Optionally add a new it() block in tests/pricing/*.test.ts
npm test
```

The fixture extractor
([`build_test_fixture.mjs`](../scripts/cantor/build_test_fixture.mjs))
automatically keeps the minimal PREISMAT/AUFPOS/AUFARTIK rows each golden
touches — fixture stays small.

## Drift detection — `verify_cantor_sync.mjs`

```bash
npm run cantor:verify
```

Two checks:

1. **Data drift** — re-checksums each mirrored table against the live
   Cantor DB and compares with `sync_meta.json`. Reports added/removed
   rows. Exits non-zero on drift.
2. **Engine drift** — runs the vitest pricing suite.

Run after any pricelist rollover in Cantor. Both checks passing means
the engine still matches the source of truth.

Source:
[`scripts/cantor/verify_cantor_sync.mjs`](../scripts/cantor/verify_cantor_sync.mjs).

## Data flow diagram

```
Cantor SQL Server (localhost\CANTOR2019 / DRUTEX_DEALER)
                   │
                   │ cantor:sync
                   ▼
    src/data/cantor/cantor.sqlite (110 MB, gitignored)
                   │
      ┌────────────┼────────────┐
      │                         │
      │ cantor:fixture          │ (runtime)
      ▼                         ▼
 tests/pricing/fixtures/    mirror.ts (better-sqlite3)
 cantor.fixture.sqlite            │
 (1 MB, committed)                ▼
      │                  priceConfiguration()
      │                         │
      │                         │ POST /api/price
      │                         ▼
      │                  pricingServer.ts (Node)
      │                         │
      │                         ├──→ Vite middleware (dev)
      │                         └──→ Supabase Edge Function (prod — planned)
      ▼
 tests/pricing/*.test.ts  ←─── npm test
                          ←─── cantor:verify
                          ←─── cantor:coverage

```

## Quick reference — npm scripts

| Script | Purpose |
|---|---|
| `npm test` | Run vitest suite against the fixture |
| `npm run cantor:sync` | Refresh SQLite mirror from live Cantor |
| `npm run cantor:fixture` | Rebuild the committed test fixture |
| `npm run cantor:golden -- <AUFNR>` | Extract a golden from a real order |
| `npm run cantor:coverage` | Reprice every real AUFPOS, summarise |
| `npm run cantor:verify` | Data-drift + engine-drift combined check |

## Troubleshooting

### `cantor.sqlite missing` when running tests

Tests prefer the committed fixture. If both are missing, regenerate one:

```bash
npm run cantor:sync       # full mirror
npm run cantor:fixture    # or just the 1 MB subset
```

### Engine throws `articleVariablesFor: not in scope`

Means an (article, profilsatz) combination hasn't been ordered before in
Cantor, so there's no `AUFARTIK` row to read ART_* variables from.

Fix: create a one-line test order in Cantor with that article + profile,
then `npm run cantor:sync`.

### Coverage mismatch I don't understand

```bash
npx tsx scripts/cantor/verify_price.mjs <AUFNR>
```

Shows base + pane sub-totals side by side. For deeper diff, query AUFPREIS
directly:

```bash
node .agents/skills/cantor-access/scripts/queryCantor.mjs \
  "SELECT * FROM AUFPREIS WHERE AUFNR = <n> AND PREIS > 0"
```

Compare against the engine's per-line SCHEMA 41 breakdown
(`result.baseLine.lines` from `priceConfiguration`).

### `VKFAKTORPREISZYK = 1` row showing up as a huge delta

Those orders are priced in PLN (no EUR conversion). The coverage harness
already filters them out (`h.VKFAKTORPREISZYK > 0` is always true; but
`= 1` is a legacy PLN marker). If you see one, it's likely a new order
accidentally created without a pricelist selected — fix in Cantor.
