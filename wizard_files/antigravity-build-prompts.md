# Build Prompts — Installation Execution Platform

Prompts for handing `installation-execution-spec.md` to an agentic development environment (Antigravity, Claude Code, Cursor, or similar).

> **Note on tooling:** these are written to be tool-agnostic. Antigravity's plan-first workflow and browser-based verification are used where relevant, but nothing here depends on a specific product's UI. My knowledge of Antigravity's current feature set may be out of date — check its docs for the exact agent-context file name and location, and adjust Prompt 0 accordingly.

---

## How to use these

1. **Put the spec in the repo** at `docs/spec/installation-execution-spec.md`. Every prompt references it. Do not paste the spec into the chat each time — reference the file.
2. **Run Prompt 0 first.** It creates the agent context file that constrains every subsequent task. Skipping it is the single biggest cause of drift.
3. **One prompt per task, in order.** Prompts 1–5 are strictly sequential. Later ones have noted dependencies.
4. **Ask for a plan before code** on anything substantial. Every prompt below starts with a planning instruction — keep it.
5. **Review between tasks.** Agentic tools compound errors. A wrong data model in task 3 is expensive by task 11.
6. **Never let the agent invent a technical value.** See the guardrail appendix at the end. This is the most important thing on this page.

---

## Prompt 0 — Agent context file

```
Read docs/spec/installation-execution-spec.md in full.

Create an agent context file at the repository root (AGENTS.md, or whatever
this environment's convention is) that every future agent session will read
before doing anything. It must contain:

1. One-paragraph description of the system: a window installation execution
   platform delivered as a module of an existing configurator platform,
   comprising a React web back office and a Flutter mobile installer app
   over a modular-monolith backend.

2. The technology constraints, stated as non-negotiable:
   - Backend: modular monolith, PostgreSQL with PostGIS
   - Web: React
   - Mobile: Flutter, offline-first with an outbox sync pattern
   - Auth: OIDC, federated from the configurator platform
   Do not introduce microservices, a different database, or a different
   mobile framework.

3. A "DO NOT INVENT" section listing the technical values that must never be
   hardcoded from the model's own knowledge, because they are safety-relevant
   and unresolved. Extract these from section 11 of the spec. At minimum:
   levelling tolerances, fixing hole count and spacing rules, screw
   specifications, tightening sequences, trim profile geometry, and the
   machine-only size/weight threshold. State that these must be loaded from
   configuration, that placeholder values must be marked with a
   PLACEHOLDER_UNVERIFIED constant, and that the system must log loudly when
   a placeholder is used.

4. Coding conventions: module boundaries, testing expectations, error
   handling, and the rule that domain logic lives in the backend, never
   duplicated in the mobile or web clients.

5. A pointer to the spec file as the source of truth for all requirements,
   with the instruction that any conflict between agent assumption and spec
   is resolved in favour of the spec, and any gap is raised as a question
   rather than filled in silently.

Do not write any application code in this task.
```

---

## Prompt 1 — Repository scaffold

```
Read AGENTS.md and docs/spec/installation-execution-spec.md.

Produce an implementation plan first, then execute it.

Set up the repository skeleton:
- A monorepo containing: backend (modular monolith), web (React back office),
  mobile (Flutter installer app), and a shared package for API types.
- Docker Compose for local development: PostgreSQL with the PostGIS
  extension enabled, plus the backend.
- Database migration tooling, wired up and runnable.
- Linting, formatting, and a test runner for each package.
- A single command that brings the whole stack up locally.
- README covering setup.

Define the backend module boundaries now, as empty modules with clear
interfaces, following the domain areas in the spec: identity, orders,
openings, workflow, evidence, calculators, notifications, analytics.

No business logic in this task. I want a working skeleton I can run.
```

---

## Prompt 2 — Identity, roles and access

```
Read AGENTS.md and section 1 of docs/spec/installation-execution-spec.md.

Plan first, then implement the identity and access module.

Build:
- User, Organisation, Role and RoleAssignment entities per spec section 10.
- OIDC integration structured so the issuer is configurable. Assume for now
  that the configurator platform is the issuer, but isolate this behind an
  interface so a secondary or federated provider can be substituted without
  touching call sites. Blocking question 0 in section 11 is unresolved and
  this code must survive either answer.
- The permission model from FR-1.7: system-defined permission sets, scoped
  to organisation and optionally to project or crew.
- The baseline permission matrix at the end of section 1, expressed as data
  rather than as conditionals scattered through the codebase.
- FR-1.9 separation of duties, enforced at the object level: a user cannot
  approve an override on work they performed, regardless of the roles they
  hold. Write tests that prove this holds when a single user has both
  installer and supervisor roles.
- FR-1.10 lifecycle: suspend and deactivate, never hard delete.
- FR-1.11 audit log with actor, timestamp, and before/after values.

Authorisation must be enforced server-side. Client-side role checks are for
UI affordances only and are never the security boundary.
```

---

## Prompt 3 — Back office shell

```
Read AGENTS.md and sections 1.2 and 1.4 of docs/spec/installation-execution-spec.md.

Plan first, then build the React back office shell:
- Login via OIDC, session handling, token refresh.
- Role-gated navigation: a user with no installation role sees no entry
  point to this module at all (FR-1.1).
- User administration screens: create user, assign roles scoped to
  organisation, suspend, deactivate. Administrators never see or set
  passwords — users are invited by email and set their own (FR-1.6).
- Audit log viewer with filtering by actor, action type and date range.
- An empty, routed shell for the other back office areas listed in FR-1.4.

Use the browser to verify the role gating actually works: log in as each
role in the permission matrix and confirm the navigation and route guards
match the matrix. Report any mismatch rather than adjusting the matrix.
```

---

## Prompt 4 — Order import and the Installation List

```
Read AGENTS.md and section 2 of docs/spec/installation-execution-spec.md.

Plan first, then implement.

Build the orders module:
- Order, Invoice, InstallationList, InstallationItem and Opening entities.
- An import pipeline that parses an order or invoice into an Installation
  List, separating joinery lines from non-joinery items (FR-2.1).
- Item enrichment fields per FR-2.2.
- Opening assignment: each joinery item is bound to a building location
  (room, elevation, opening reference) per FR-2.3.

Critical design constraint: the source format for order and invoice data is
unconfirmed (assumptions in section 2.1). Build the parser behind an
interface with a pluggable adapter. Provide one adapter for structured CSV
and one stub adapter for PDF that raises a clear "not implemented" error.
Do not build OCR. Do not assume an API exists.

Also build the manual-correction UI for imported lines, since any parsed
source will need it.

The binding between factory barcode and order line item is an unvalidated
assumption. Model it as a resolvable mapping that can be corrected manually,
not as a guaranteed identity.
```

---

## Prompt 5 — QR labels and delivery reconciliation

```
Read AGENTS.md and sections 2.3 and 3 of docs/spec/installation-execution-spec.md.

Plan first, then implement.

Part A — opening labels:
- Generate one QR label per Opening. The QR resolves to the OPENING, not to
  the window. Read the design note at the end of section 3 and preserve that
  distinction in the data model.
- Printable A4 output containing the fields listed in FR-3.2.
- Where a configurator schematic image is unavailable, generate a fallback
  diagram from dimensions and opening configuration.

Part B — delivery reconciliation:
- Scan shipment order number to open the matching Installation List (FR-2.4).
- Guided reconciliation checklist, item by item, confirmed by barcode scan
  or manual entry with a reason code. Outcomes: confirmed, missing, damaged,
  unexpected (FR-2.5).
- Barcode-to-item resolution and binding (FR-2.6).
- Discrepancy records with photos, visible to dispatcher and management,
  blocking affected lines from progressing to installation (FR-2.7).

Build the backend and back office side here. The mobile side comes later and
must reuse the same endpoints.
```

---

## Prompt 6 — Workflow step engine

```
Read AGENTS.md and section 6.1 of docs/spec/installation-execution-spec.md.

This is the architectural core of the system. Plan carefully, present the
plan, and wait for my approval before writing code.

Build a configurable workflow engine, not a set of hardcoded screens:
- WorkflowStepDefinition: id, name, sequence, conditionality rules, checklist
  items, evidence requirements, expected tools and materials, preconditions.
- WorkflowStepInstance: per-opening execution state, start/stop timing,
  checklist state, attached evidence, completion.
- The step sequence is a directed graph evaluated against installation type,
  window characteristics and earlier choices — not a fixed list. Steps are
  conditionally included or excluded.
- Precondition evaluation: a step is unavailable until its dependencies are
  satisfied. Completion is blocked until required checklist items and
  evidence are present.
- Timer support including blocking timers, where a dependent step cannot
  start until a duration has elapsed (the foam cure at FR-5.25).

Do not seed any step content in this task. The engine and the step
definitions are separate concerns and I want that boundary to be real.

Include tests covering: conditional inclusion, blocked completion on missing
evidence, and blocking timer behaviour.
```

---

## Prompt 7 — Evidence capture

```
Read AGENTS.md and section 6.2 of docs/spec/installation-execution-spec.md.

Plan first, then implement the evidence module:
- EvidencePhoto and MeasurementRecord entities per section 10.
- Every photo carries geotag, timestamp, opening, step and actor (FR-6.2).
- Photos are immutable once attached; corrections are additive, never
  destructive (FR-6.3).
- Retrieval of the complete evidence set for an opening, ordered by step and
  time, suitable for demonstrating procedural compliance (FR-6.4).
- Storage abstraction with configurable backend, plus a compression and
  resolution policy defined in configuration.

Estimate expected photo volume per opening from the evidence requirements in
section 5, and document the resulting storage and sync bandwidth implication
in the module README. Section 11 flags this as an open sizing question — give
me the number so it can be answered.

MeasurementRecord must store level/plumb readings per axis with a tolerance
pass/fail result. The tolerance values themselves are UNRESOLVED — load them
from configuration, use PLACEHOLDER_UNVERIFIED markers, and make the system
log a warning whenever a placeholder tolerance is applied to a real
measurement.
```

---

## Prompt 8 — Override gate

```
Read AGENTS.md and section 6.3 of docs/spec/installation-execution-spec.md,
plus FR-1.9.

Plan first, then implement the manual override gate:
- OverrideRequest entity: proposed method, reason, photos, supervisor
  decision and identity.
- Requesting an override BLOCKS the workflow. The installer cannot advance
  until a supervisor authorises it. This is a hard block, not a warning.
- Approval is available to supervisors only, and never to the user who
  performed the work, even if they hold a supervisor role. Reuse the
  separation-of-duties enforcement from the identity module.
- Supervisor notification on request, installer notification on decision.
- Back office approval UI showing the request context and photos.

Write tests that attempt to bypass the gate: self-approval, role escalation,
and advancing the workflow while a request is pending. All must fail.
```

---

## Prompt 9 — Installation step content

```
Read AGENTS.md and section 5 of docs/spec/installation-execution-spec.md in
full.

Plan first, then seed the workflow step definitions for the per-window
installation process, using the engine from Prompt 6. Do not modify the
engine — if a step cannot be expressed with the current engine, stop and
tell me what is missing.

Cover the phases in section 5: entry and authentication, site assessment,
removal of existing window, frame placement and provisional securing,
levelling, mechanical fixing, sealing, sash re-fit and adjustment, finishing
operations, completion.

For each step, define: conditionality rules, checklist items, required
evidence photos, expected tools and materials from section 6.4, and
preconditions.

Two constraints:

1. FR-5.4 photo analysis is explicitly OUT OF SCOPE for now. Read the
   scoping caution in section 5.1. Implement phase 1 only: a rules-based
   recommendation derived from structured survey and product data, with the
   photo captured as evidence. No image analysis, no machine recommendation
   that an installer could execute without a human decision.

2. Section 5.5 mechanical fixing depends on values that DO NOT EXIST YET —
   hole count and spacing rules, screw specification, tightening sequence.
   Do not use the example values in the spec text; they are illustrative and
   explicitly flagged as requiring confirmation from Drutex technical
   documentation. Build the calculation as a rules engine reading from a
   configuration file, ship it with clearly marked placeholder values, and
   make it refuse to present a fixing diagram to an installer while the
   configuration is still flagged as unverified.
```

---

## Prompt 10 — Installer app shell and offline sync

```
Read AGENTS.md and sections 1.2, 4 and 6.5 of
docs/spec/installation-execution-spec.md.

Plan first, then build the Flutter installer app shell:
- OIDC login, session handling, credential verification.
- Offline-first local store mirroring the domain entities the app needs.
- Outbox sync pattern: all mutations queue locally and sync when connectivity
  returns. Conflict handling policy documented and implemented.
- Photo capture queued through the same outbox, with compression applied
  before queueing.
- Sync status visible to the installer at all times — they need to know what
  has and has not reached the server.
- Session start greeting by name and the assigned window list (FR-4.1).
- Method declaration screen: large machine, small machine, manual one worker,
  manual two workers, plus whether auto-levelling equipment was used
  (FR-6.12, FR-6.14).

The machine-only size threshold at FR-6.13 is UNRESOLVED. Implement the rule,
load the threshold from configuration, mark it as a placeholder.

Do not implement the daily plan recommendation (FR-4.2) — it depends on
historical data that does not exist yet.
```

---

## Prompt 11 — Installer app execution flow

```
Read AGENTS.md and sections 2.3, 5 and 6 of
docs/spec/installation-execution-spec.md.

Depends on Prompts 5, 6, 7, 9 and 10.

Plan first, then build the installer-facing execution flow:
- Delivery receipt and reconciliation on mobile, reusing the endpoints from
  Prompt 5.
- Barcode and QR scanning, with manual entry fallback (a scanner that fails
  on a dusty label in poor light must not stop work).
- Wall QR scan to open an opening's workflow, with credential verification
  (FR-5.1) and the hard block on window/opening mismatch (FR-5.2).
- Step-by-step guided execution driven by the workflow engine: checklists,
  timers, evidence capture prompts, tool lists, next-step recommendation.
- Override request flow.
- Opening finalisation with an explicit list of what is missing when blocked
  (FR-5.30).

Design for the actual environment: gloved hands, bright sun or poor light,
dusty screens, no signal. Large touch targets, high contrast, minimal typing.
Every screen must be usable one-handed.
```

---

## Prompt 12 — Trim calculation and batch cut lists

```
Read AGENTS.md and section 7 of docs/spec/installation-execution-spec.md.

Plan first, then implement the joint cover module:
- Per-opening configuration questions from FR-7.1: blind box present, trims
  full height or to blind box underside, cut type at each junction (straight
  or mitre).
- Piece calculation producing three or four pieces with exact lengths and the
  cut specification at each end. Lengths differ between straight and mitre
  configurations — the calculation must account for profile geometry, not
  just return opening dimensions.
- Visual guidance illustrating each cut type.
- Per-opening piece list with an image of each piece, length, and cut
  specification per end.
- Batch aggregation across all openings in a job, grouped by identical length
  and cut type, with items struck off as cut and the list depleting visually
  (FR-7.5 to FR-7.7).

Trim profile geometry and the measurement datum are UNRESOLVED (blocking
question 6). Structure the calculation to read profile data from a product
configuration table. Ship with a placeholder profile, clearly marked.

Then, as a separate follow-up: add cutting-stock optimisation across
available stock lengths to minimise offcut waste. Keep it behind a feature
flag so the simple grouped list remains the default until the optimisation
is validated against real cuts.
```

---

## Prompt 13 — Customer portal

```
Read AGENTS.md and section 8 of docs/spec/installation-execution-spec.md.

Plan first, then build the customer portal:
- Visual progress board: one card per window with product image, name and
  installation location. Installed windows turn green. Overall progress bar.
- The customer view is a REDUCED PROJECTION. Internal timings, method
  choices, override requests and installer identity are never exposed. Build
  this as an explicit projection layer with its own DTOs, not as a filtered
  view of the internal model — filtering leaks.
- Notification preferences per FR-8.5: every window, defined set, room
  complete, selected stages, or none.
- Notification delivery for the selected triggers.

Which evidence photos, if any, a customer may view is an unresolved GDPR/RODO
question. Default to none, and make the exposure rule configurable rather
than assuming.
```

---

## Prompt 14 — Management analytics

```
Read AGENTS.md and section 9 of docs/spec/installation-execution-spec.md.

Depends on real data existing. Plan first, then implement:
- Process timings by window type, method, installer and crew (FR-9.1).
- Step-level drill-down across installations (FR-9.2).
- Comparative ratios between steps and across jobs (FR-9.3).
- Tool and method usage analysis (FR-9.4).
- Like-for-like comparison of machine vs. manual, and with vs. without
  auto-levelling (FR-9.5).

Access is governed by the permission matrix in section 1. Whether installers
can see their own timing data is a configurable policy, defaulting to
visible-to-self-only, never installer-vs-installer comparison.

Do not present targets or benchmarks. Section 9 notes that no baseline exists
yet — the system reports observed data, and does not imply what good looks
like until a discovery phase has established that.
```

---

## Prompt 15 — Verification pass

```
Read AGENTS.md and docs/spec/installation-execution-spec.md in full.

Do not write features. Audit the implementation against the spec and produce
a report at docs/audit/spec-coverage.md containing:

1. Every FR- requirement in the spec, with implementation status:
   implemented, partial, not started, or deliberately deferred.
2. Every place in the codebase where a PLACEHOLDER_UNVERIFIED value is used,
   with the file location and what the value governs. This list is the
   handover document for the Drutex technical validation session.
3. Any place where a technical value was hardcoded WITHOUT a placeholder
   marker — these are defects and must be listed separately and prominently.
4. Any divergence between the implementation and the spec, with the reason.
5. Test coverage of the safety-critical paths: separation of duties, the
   override gate, evidence immutability, and completion blocking.

Be adversarial. Assume something has drifted.
```

---

## Guardrail appendix — do not let the agent invent these

Agentic tools are confidently wrong about domain constants. Every one of these will be plausibly hallucinated if the prompt does not forbid it, and each is safety-relevant:

| Value | Where it appears | Why it matters |
|---|---|---|
| Levelling tolerances per axis | FR-5.14, Prompt 7 | Without real numbers, the evidence record is unauditable |
| Fixing hole count and spacing | FR-5.16, Prompt 9 | Structural. Must come from the standard or Drutex documentation |
| Screw diameter, type, length | FR-5.20, Prompt 9 | The "7 mm" in the notes is unconfirmed |
| Tightening sequence | FR-5.21, Prompt 9 | The diagonal example is illustrative only |
| Trim profile geometry and datum | FR-7.2, Prompt 12 | Wrong datum means every cut is wrong |
| Machine-only size threshold | FR-6.13, Prompt 10 | Manual-handling regulation, not preference |
| Three-layer sealing sequence | FR-5.24, Prompt 9 | Must derive from installation type per RAL/PN-EN |

The pattern that works: **implement the rule, externalise the value, mark the placeholder, log loudly on use, and block the user-facing output while the configuration is unverified.** An app that confidently prescribes an invented fixing pattern is worse than one that prescribes nothing.

## Sequencing summary

```
0 → 1 → 2 → 3 → 4 → 5
              ↓
              6 (engine) → 7 (evidence) → 8 (override) → 9 (step content)
                                                             ↓
                                        10 (mobile shell) → 11 (mobile flow)
                                                             ↓
                                          12 (trims) → 13 (customer) → 14 (analytics)
                                                             ↓
                                                        15 (audit)
```

Run Prompt 15 again after any significant batch of work, not just at the end.
