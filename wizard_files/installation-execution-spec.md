# Installation Execution — Functional Specification

**Status:** Draft v0.2 — structured from raw working notes
**Scope:** Access and administration, goods-in, per-window installation, evidence capture, completion and downstream visibility
**Delivery vehicle:** A module of the new configurator platform, behind its own access boundary, comprising a web back office and a mobile installer app (§1).
**Relationship to master spec:** Expands §3 (stakeholder/RBAC model), §5.4 (mobile installer app), §5.5 (installation protocol and evidence capture), §5.6 (customer portal) and §5.9 (reporting). Introduces one new area not previously covered: **goods-in / delivery reconciliation** (§2 below).

> **Convention:** `[A]` marks an assumption about Drutex systems, product data or trade practice that must be validated before this document is used for estimation or contracting.

---

## 1. Positioning, access and administration

### 1.1 Position within the configurator

The installation application is delivered **as a module of the new configurator platform, behind its own access boundary**. It is not a standalone product with its own parallel user base, and it is not openly reachable by configurator users.

```
Configurator platform
├── Configurator (existing users: dealers, sales, customers)
└── Installation module  ← separate access boundary
    ├── Back office   (web)
    └── Installer app (mobile)
```

**FR-1.1 — Shared identity, separate authorisation.** Authentication is handled once at platform level (OIDC, as per the master spec). Access to the installation module is granted by explicit role assignment, not by virtue of holding a configurator account. A configurator user with no installation role sees no entry point to the module at all.

**FR-1.2 — Single sign-on.** A user holding both configurator and installation roles moves between the two without re-authenticating.

**FR-1.3 — Data boundary.** The installation module reads order and product data from the configurator side. It does not write back to configurator records. Installation-side data (evidence photos, timings, override decisions, installer identity) is not exposed to configurator users.

`[A]` The configurator's identity provider, its existing role model, and whether it can act as the OIDC issuer for the installation module are unconfirmed. **This is a blocking question** — if the configurator cannot issue tokens for external installer accounts, a federated or secondary identity provider is required and the effort changes materially.

`[A]` Whether installers are employees of the same organisation as configurator users, or external subcontractor firms, determines whether one tenant or multi-tenant organisational scoping is needed. The master spec's RBAC model already assumes organisational scope; that assumption carries forward here.

### 1.2 The two front ends

| | **Back office** | **Installer app** |
|---|---|---|
| Platform | Web (React) | Mobile (Flutter) |
| Connectivity | Online | Offline-first, outbox sync |
| Primary users | Administrators, dispatchers, supervisors, management | Installers, crew leads |
| Purpose | Set up, assign, approve, analyse | Execute and evidence work on site |

Both consume the same backend. Nothing in the installer app is authoritative until it syncs; nothing in the back office is editable in the field.

**FR-1.4 — Back office scope.** User and role administration (§1.4), project and job setup, order/invoice import, opening assignment, QR label generation and printing, job assignment, override approval, discrepancy handling, customer notification configuration, analytics and reporting.

**FR-1.5 — Installer app scope.** Daily plan, delivery receipt and reconciliation, per-window guided workflow, evidence capture, tool and material checklists, trim cut lists, override requests. **Read-mostly on configuration** — installers cannot create users, alter product data, or approve their own overrides.

### 1.3 Actors

| Actor | Front end | Role in this document |
|---|---|---|
| **Administrator** | Back office | Creates users, assigns roles, manages organisational scope. |
| **Dispatcher / operations** | Back office | Imports orders, assigns jobs, handles discrepancies. |
| **Supervisor / technical authority** | Back office (+ mobile) | Sole approver of manual overrides on fixing method. |
| **Management** | Back office | Time and method analytics across jobs. Read-only. |
| **Crew lead** | Installer app | Selects installation method (machine vs. manual), owns the daily plan. |
| **Installer** | Installer app | Executes and evidences every step. |
| **Customer** | Customer portal | Read-only progress view with configurable notifications. |

**Upstream systems (out of scope, integration points only):** Drutex order entry, manufacturing, invoicing, barcode/label generation on the finished product.

### 1.4 User and role administration

**FR-1.6 — User creation.** Administrators create users in the back office: name, contact details, organisation, and one or more roles. Users are invited by email and set their own credentials — administrators never see or set passwords.

**FR-1.7 — Role assignment.** Roles are assigned per user and scoped to an organisation (and, where relevant, to specific projects or crews). Roles are permission sets defined by the system, not free-form.

**FR-1.8 — Multiple roles.** A user may hold more than one role. Permissions are the union of their roles, with one exception below.

**FR-1.9 — Separation of duties.** An installer cannot approve an override on their own work, regardless of what other roles they hold. This is enforced at the object level, not just by role. It is the one rule that makes the override gate (§6.3) meaningful — without it, the gate is decorative.

**FR-1.10 — Lifecycle.** Users can be suspended and deactivated but not deleted. Evidence records, timings and approvals must remain attributable indefinitely for warranty and audit purposes. `[A]` Reconcile indefinite attribution with GDPR/RODO erasure rights — likely resolved by pseudonymisation of personal data while retaining the actor reference.

**FR-1.11 — Audit log.** All administrative actions — user creation, role change, suspension, override approval — are logged with actor, timestamp and before/after values.

**FR-1.12 — Device binding.** `[A]` Decide whether installer accounts are bound to registered devices. Relevant if installers are subcontractors using personal phones, and relevant to the credential-verification step at FR-5.1.

**Baseline permission matrix** (to be refined during design):

| Capability | Admin | Dispatcher | Supervisor | Mgmt | Crew lead | Installer |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Manage users and roles | ● | | | | | |
| Import orders, create jobs | ● | ● | | | | |
| Assign jobs to crews | ● | ● | | | | |
| Generate/print QR labels | ● | ● | | | | |
| Approve manual overrides | | | ● | | | |
| Resolve discrepancies | ● | ● | ● | | | |
| Declare installation method | | | | | ● | |
| Execute steps, capture evidence | | | | | ● | ● |
| Request override | | | | | ● | ● |
| View analytics | ● | ● | ● | ● | | |
| View own performance data | | | | | ● | ● |

`[A]` Whether installers see their own timing data is a policy decision with real behavioural consequences — visible individual timings tend to change how the tool is used, and not always in the direction intended. Worth deciding deliberately rather than by default.

---

## 2. Order, delivery and goods-in

### 2.1 Data lineage

The chain that must be reconstructable end to end:

```
Order (order no. + line items)
   → accepted → manufacturing
   → Invoice (separate invoice no., same or superset of line items)
   → Physical delivery (order no. on shipment, barcode per window)
   → Installation List (system entity)
```

**Assumptions requiring validation:**

- `[A]` Invoice line items correspond 1:1 with the barcodes physically applied to windows at the factory.
- `[A]` The barcode on the window encodes, or can be resolved to, the item number in the order/invoice.
- `[A]` A machine-readable export (not just PDF) of the order or invoice is obtainable — API, CSV, EDI or structured file. Everything in §2.2 depends on this. If only a PDF exists, an OCR/parse step and a manual-correction UI must be added to scope.
- `[A]` The shipment carries a scannable order number, not merely a printed one.

### 2.2 Creating the Installation List

**FR-2.1 — Import order/invoice.** The user can attach an order or invoice to a project. The system parses it into an **Installation List**: one line per window/door, plus non-joinery items (blind boxes, sills, trims, accessories) held separately.

**FR-2.2 — Item enrichment.** Each joinery line carries: item number, product description, system/profile, dimensions (W×H), opening configuration, glazing spec, colour, handedness, and the parsed schematic image of the window as configured. `[A]` Availability of the schematic image via the Drutex configurator is unconfirmed; if unavailable, fall back to a generated diagram from dimensions + opening config.

**FR-2.3 — Location assignment.** Each item is assigned a building location (room, elevation, opening reference) — either imported from the survey data or assigned manually. This is the key that links a delivered window to a physical opening.

### 2.3 Delivery receipt

**FR-2.4 — Scan to open.** Scanning the shipment's order number opens the corresponding Installation List directly.

**FR-2.5 — Reconciliation checklist.** A guided checklist walks the receiver through every expected item. Each item is confirmed by scanning its barcode, or by manual entry with a reason code. Outcomes per item: `confirmed` / `missing` / `damaged` / `unexpected`.

**FR-2.6 — Unload and identify.** Windows are unloaded from pallets and each barcode scanned. The system resolves the barcode to the Installation List line and confirms the binding.

**FR-2.7 — Discrepancy report.** Any deviation generates a discrepancy record with photos, visible to dispatcher and management, and blocks the affected line from progressing to installation until resolved.

**FR-2.8 — Staging.** Windows are moved to their assigned positions. Optional confirmation step: scan window barcode + wall QR to confirm correct placement before work begins.

---

## 3. Opening labelling (wall QR codes)

**FR-3.1 — Label generation.** The system generates one QR label per opening, printable A4 (`[A]` confirm whether one label per sheet or multiple-up; A4 was specified but may be wasteful).

**FR-3.2 — Label content.**
- QR code (resolves to the opening, not the window — the opening is the fixed physical reference)
- Product description and item number
- Parsed schematic image of the window system
- Dimensions
- Room / location reference

**FR-3.3 — Placement.** Labels are affixed to the wall adjacent to the opening before installation begins.

**Design note:** binding the QR to the *opening* rather than the *window* is deliberate. If a window is swapped, damaged or re-ordered, the opening identity and its accumulated evidence survive.

---

## 4. Installer session and daily planning

**FR-4.1 — Session start.** On login the installer is greeted by name and presented with the windows assigned to them.

**FR-4.2 — Daily plan recommendation.** The installer may request a recommended plan for the day. Inputs: available working hours (entered by the installer), window types remaining, historical duration data for comparable window types and methods. Output: an ordered set of windows expected to fit the available time.

**FR-4.3 — Plan is advisory.** The installer may accept, reorder or ignore the plan. Deviations are recorded (they are useful signal for §11).

**Dependency:** FR-4.2 is meaningless until sufficient historical duration data exists. Ship in a later phase; until then, fall back to dispatcher-assigned ordering.

---

## 5. Per-window installation workflow

### 5.0 Entry and authentication

**FR-5.1** — Installer scans the wall QR. Credentials are verified. The system opens the installation workflow for that opening and displays: what is to be installed, method recommendations, and the tool checklist.

**FR-5.2** — The system verifies that the window scanned/staged for this opening is the correct one. A mismatch is a hard block.

### 5.1 Site assessment

**FR-5.3 — Location photo.** Installer photographs the empty opening, or the existing window to be removed.

**FR-5.4 — Photo analysis and recommendation.** The photo is analysed and the system recommends the installation approach for this window and opening.

> **Scoping caution.** This is the highest-risk feature in the document. Automated analysis of a construction photo to determine fixing method touches structural safety and liability. Recommended treatment:
> - Phase 1: rules-based recommendation from *known structured data* (wall construction from the technical survey, window size and weight, product system, installation type per RAL/PN-EN practice). The photo is captured as evidence only.
> - Phase 2: image analysis as a *supporting hint* that pre-fills a form the installer confirms.
> - Never: an unconfirmed machine recommendation that the installer executes without a human decision. The manual-override gate (§6.3) exists precisely because technically wrong decisions must be preventable.

### 5.2 Removal of existing window (conditional)

**FR-5.5** — Timed step. Recommended tools presented. Start/stop timing recorded.
**FR-5.6** — Completion photo of the cleared opening.

### 5.3 Frame placement and provisional securing

**FR-5.7** — Frame positioned in the opening.
**FR-5.8** — Frame secured against falling using blocking wedges or inflatable cushions before hands are released. This is a **safety-critical confirmation**, not a passive step.
**FR-5.9** — Record whether sashes and/or glazing were removed prior to placement (affects weight, method and subsequent re-fit steps).
**FR-5.10** — Evidence photo: frame in position, securing visible.

### 5.4 Levelling

**FR-5.11** — Installer levels the frame horizontally and vertically across all planes until plumb and square.
**FR-5.12** — Evidence photo per axis (three axes minimum).
**FR-5.13** — Preferred method: high-precision digital inclinometer. Reading photographed and attached to the record.
**FR-5.14** — `[A]` Define acceptance tolerances per axis, per window size band, referencing the applicable standard. Without numeric tolerances the levelling evidence is unauditable. **This must be resolved before build.**
**FR-5.15** — Confirmation that fastening materials adequate to hold the achieved position have been applied.

### 5.5 Mechanical fixing (conditional — screw-fixed installations)

**FR-5.16 — Hole count and position calculation.** The system calculates the number and position of fixing holes on the vertical frame members: minimum two for small windows, minimum three for larger. `[A]` Define the size threshold and the spacing rule (typically driven by distance from corners and maximum spacing between fixings per the applicable standard — this rule must come from Drutex technical documentation or the standard, not be invented).

**FR-5.17 — Drilling diagram.** Displays heights at which to drill and the offset from the frame edge, so the installer can measure the exact position. Presented as a dimensioned diagram.

**FR-5.18 — Frame drilling (if holes not pre-drilled).** 6 mm steel bit through the frame. Step is timed and confirmed.

**FR-5.19 — Substrate drilling.** Hammer drill (Hilti) with 6 mm concrete bit into brick or concrete.

**FR-5.20 — Fixing.** Concrete/frame screws (`[A]` confirm 7 mm — diameter, type and length should be derived from the fixing schedule, not hardcoded). Driven with a torque-limited driver, slowly, to avoid shearing the head and to avoid distorting the frame out of its levelled geometry.

**FR-5.21 — Tightening sequence.** The system prescribes the order of fixing — alternating opposite corners (e.g. bottom-right → top-left → bottom-left → top-right) to avoid inducing distortion. `[A]` Confirm the correct sequence with Drutex technical staff; the example in the notes is illustrative only.

**FR-5.22 — Post-fixing re-check.** Re-verify level after fixing. Distortion introduced during fixing is the failure mode this whole sub-flow exists to prevent.

### 5.6 Sealing / foaming (conditional)

**FR-5.23** — Fill the perimeter joint between frame and reveal where the installation type requires it.
**FR-5.24** — Three-layer sealing principle applies; the layer sequence and materials must be driven by the installation type recorded in §5.1, not left to the installer.
**FR-5.25** — Cure timer: 30–40 minutes minimum before load is applied. The system starts the timer, blocks dependent steps until elapsed, and — importantly — **suggests work on another opening during the wait**. This is where the batch-optimisation logic in §7 earns its value.

### 5.7 Sash re-fit and adjustment

**FR-5.26** — Sashes re-hung.
**FR-5.27** — Operation check: opens and closes correctly, even reveal gaps, correct compression.
**FR-5.28** — If adjustment needed: guidance on hardware adjustment points, adjusted with 4 mm Allen key. Displayed as a diagram or reference photo from a previous installation.
**FR-5.29** — Evidence photo of the completed, closing window.

### 5.8 Finishing operations (conditional, installer-selected)

On completing the frame and sashes, the installer declares whether further operations are required for this opening:

- Internal and/or external joint covers / trims (§7)
- Electric blind wiring, connection, remote pairing and calibration
- Sills, cills, closures
- Other special finishes

Each selected operation becomes a timed, evidenced step.

### 5.9 Completion

**FR-5.30** — Installer finalises the opening. All mandatory steps and evidence must be present or the finalisation is blocked with an explicit list of what is missing.
**FR-5.31** — Opening status set to `installed`. Progress percentages update for installer, customer and management views.

---

## 6. Cross-cutting mechanics

### 6.1 Step engine

Every step in §5 shares a common structure, and this should be built once as a configurable engine rather than as bespoke screens:

| Property | Description |
|---|---|
| Step definition | ID, name, sequence, conditionality rules |
| Timing | Explicit start / stop, producing a duration |
| Checklist | Item-by-item confirmations that must all be ticked |
| Evidence requirements | Required photo types, minimum count |
| Tools/materials | Expected items for this step |
| Preconditions | What must be complete before this step is available |
| Completion | Marks the step done, engine recommends the next |

The workflow is recommended step by step; the installer works through checklists item by item. Steps are conditional on the installation type, window characteristics and choices made earlier — the sequence is a directed graph, not a fixed list.

### 6.2 Evidence capture

**FR-6.1** — Every significant process is photographed. At minimum: cleared opening, frame secured, level readings per axis, inclinometer readings, fixings, sealed joint, completed window.
**FR-6.2** — All photos are geotagged and timestamped, tied to the opening, the step, and the installer.
**FR-6.3** — Photos are immutable once attached; corrections are additive.
**FR-6.4** — The complete evidence set is retrievable later to demonstrate that work followed established procedure and applicable norms.
**FR-6.5** — Offline-first: capture must work without connectivity, syncing via the outbox pattern. Photo volume per job is significant — define compression, resolution and retention policy. `[A]` Estimate photos per opening (likely 12–20) to size storage and sync.

### 6.3 Manual override gate

**FR-6.6** — Where a window requires an anchor or fixing method not covered by the system's recommendations, the installer may request a manual override.
**FR-6.7** — The override must be authorised by a supervisor. Until authorisation is granted, **the process is blocked and cannot advance.**
**FR-6.8** — The request captures: the proposed method, reason, photos, and the supervisor's decision and identity.

Purpose: prevent the installer from making decisions that are technically wrong. This gate is also the escape valve that makes strict step enforcement tolerable in the field — without it, installers work around the app.

### 6.4 Tools and materials

**FR-6.9** — Installers can maintain a tool inventory ("add tools").
**FR-6.10** — Each step presents its required tools and consumables as a checklist.
**FR-6.11** — Materials are added to the job for consumption tracking.

**Base catalogue** (extensible):

*Installation:* expanding foam, frame screws, wall plugs/anchors, wedges, inflatable cushions, spirit levels, digital inclinometer, cordless drill/driver, hammer drill (Hilti), drill bits (6 mm steel, 6 mm concrete), sash-removal tool, glazing bead tool, suction pads.

*Electric blinds:* cable cutters, cable connectors, electrical test equipment, insulating tape, screwdrivers.

### 6.5 Equipment and method selection

**FR-6.12** — At the start of an installation, the method is declared: **large installation machine / small installation machine / manual (one worker) / manual (two workers)**.
**FR-6.13** — For windows above a defined size or weight threshold, manual installation is **not permitted** — machine only. `[A]` Define the threshold; it should follow manual-handling regulations and the machine's rated capacity, not preference.
**FR-6.14** — Record whether automatic levelling equipment was used. Auto-levelling can level and fix a window into position in seconds and is expected to be a major productivity lever — capturing its use/non-use is what makes that measurable.

---

## 7. Joint cover (trim) calculation and batch cutting

This is a distinct sub-system and deserves separate treatment from the step engine.

### 7.1 Per-window calculation

**FR-7.1 — Configuration questions.** For each opening:
1. Does the window have a blind box above it?
2. If so, do the vertical trims run full height, or stop at the underside of the blind box?
3. What cut type at each junction — **straight/butt cut** (one piece overlapping the other) or **mitre cut** (45°)?

**FR-7.2 — Piece calculation.** Produce the required pieces (three where there is no head trim, four otherwise), each with exact length and the cut type at each end. Lengths differ between straight and mitre configurations — the calculation must account for this, not just return the opening dimensions.

**FR-7.3 — Visual guidance.** Show the cut types with illustrations so the installer selects the right one.

**FR-7.4 — Piece list.** Generate the list of trims for the window: an image of each piece, its exact length, and the cut specification at each end.

`[A]` Trim profile dimensions, and whether trim length is measured to the frame face or the wall face, must come from Drutex product data. The cut-length maths is profile-dependent.

### 7.2 Batch optimisation across the job

**FR-7.5** — Rather than cutting per window, the system aggregates trim requirements across all windows in the job (or a selected subset) into a single cut list.
**FR-7.6** — The installer selects the cut type, and the list is grouped by identical length and cut type — e.g. *5 × 1200 mm straight cut, 5 × 1400 mm straight cut*.
**FR-7.7** — Items are struck off the list as they are cut; the list depletes visually as work progresses.
**FR-7.8** — Rationale: eliminates back-and-forth between tasks and tool changes. The same batching principle should be applied to any repeated operation, and pairs naturally with foam cure waits (FR-5.25).

**Extension worth considering:** cutting-stock optimisation — which pieces to cut from which stock length to minimise offcut waste. Not in the notes, but it is the obvious next step once the cut list exists, and it saves material rather than just time.

---

## 8. Customer portal

**FR-8.1 — Visual progress board.** The customer sees their windows as a set of cards: image of the window, product name, and installation location.
**FR-8.2 — Status colour.** Installed windows turn green.
**FR-8.3 — Progress bar.** Overall completion percentage across the order.
**FR-8.4 — Reduced detail.** The customer view is a simplified projection of the installer view. Internal timings, method choices, override requests and installer identity are **not** exposed.

**FR-8.5 — Notification preferences.** The customer chooses their trigger:
- After every individual window
- After a defined set of windows
- After a room is completed
- At selected stages only
- Not at all

`[A]` GDPR/RODO: define retention and access rules for site photographs of the customer's property. Determine which evidence photos, if any, the customer may view — several are technical records, not customer-facing content.

---

## 9. Management analytics

**FR-9.1 — Process timings.** Full visibility of the installation process and duration by window type, method, installer and crew.
**FR-9.2 — Step-level analysis.** Drill into any individual step across all installations.
**FR-9.3 — Comparative ratios.** Compare step durations against each other and across jobs to surface where improvement is available.
**FR-9.4 — Tool and method analysis.** Which tools were used, and where automation (auto-levelling, installation machines) would raise productivity or safety.
**FR-9.5 — Method impact.** Compare like-for-like windows installed by machine vs. manual, and with vs. without auto-levelling, to quantify the return on equipment investment.

**Prerequisite:** none of this is meaningful until a baseline exists. Discovery-phase measurement of current durations must precede any target-setting.

---

## 10. Data model additions

New or extended entities implied by this document:

| Entity | Notes |
|---|---|
| `User` | Platform identity; may hold configurator and/or installation roles |
| `Organisation` | Scoping boundary — own crews vs. subcontractor firms |
| `Role` / `RoleAssignment` | System-defined permission set, scoped to organisation and optionally project |
| `AuditLogEntry` | Administrative and approval actions, with before/after values |
| `Order` / `Invoice` | Header + line items, imported |
| `InstallationList` | Working set derived from order/invoice |
| `InstallationItem` | Joinery line: item no., barcode, spec, dimensions, schematic, assigned opening |
| `Opening` | Physical location; owns the wall QR identity and all evidence |
| `DeliveryReceipt` | Goods-in event |
| `Discrepancy` | Missing / damaged / unexpected item |
| `WorkflowStepDefinition` | Configurable step template |
| `WorkflowStepInstance` | Per-opening execution: timings, checklist state, evidence |
| `EvidencePhoto` | Image + geotag + timestamp + step + actor |
| `MeasurementRecord` | Level/plumb readings per axis, tolerance pass/fail |
| `OverrideRequest` | Proposed method, reason, approver, decision |
| `ToolInventory` / `MaterialConsumption` | Per installer / per job |
| `MethodDeclaration` | Machine class, crew size, auto-levelling used |
| `TrimSpecification` / `TrimCutList` | Per opening and aggregated per job |
| `CustomerNotificationPreference` | Trigger configuration |

Existing entities (project, installer, crew, customer) are extended rather than replaced.

---

## 11. Open questions to resolve before estimation

**Blocking (design cannot be finalised without these):**

0. Can the configurator platform act as the OIDC issuer for installation-module users, including external installers? — determines whether identity is a configuration exercise or a federation project.
1. Is a machine-readable order/invoice export available from Drutex? — determines whether §2.2 is an integration or an OCR project.
2. Do factory barcodes map to order/invoice line items? — the entire goods-in flow rests on this.
3. Are configurator schematic images accessible? — otherwise diagrams must be generated.
4. **Levelling tolerances per axis and window size** — required for FR-5.14 to be enforceable.
5. **Fixing schedule**: hole count/spacing rule, screw specification, tightening sequence — must come from Drutex or the standard, not from the app team.
6. Trim profile geometry and measurement datum — required for FR-7.2.

**Non-blocking but scope-affecting:**

7. Scope and liability posture of photo-based recommendation (§5.1). Recommend deferring to a later phase.
8. Photo volume, resolution, retention and storage cost.
9. Machine-only size/weight threshold and its regulatory basis.
10. Customer visibility of technical evidence photos under GDPR/RODO.
11. Label format — one A4 sheet per opening, or multiple-up.

---

## 12. Suggested phasing

| Phase | Contents |
|---|---|
| **0 — Access and administration** | Module access boundary within the configurator, SSO, back office shell, user creation and role assignment, audit log |
| **1 — Foundation** | Order/invoice import, Installation List, opening assignment, QR label generation, delivery scan and reconciliation checklist, barcode binding |
| **2 — Guided execution** | Step engine, per-window workflow, timing, checklists, evidence capture, offline sync, override gate |
| **3 — Technical calculators** | Fixing hole calculation and diagrams, tightening sequence, trim calculation, batch cut lists |
| **4 — Visibility** | Customer portal and notifications, installer progress panel |
| **5 — Intelligence** | Management analytics, daily plan recommendation, method comparison, photo-assisted recommendation |

Phase 0 is a prerequisite for everything and is the phase most exposed to the configurator's existing identity architecture — resolve blocking question 0 before committing to an estimate for it. Phases 1–2 deliver the auditable installation record, which is the core value. Phase 3 delivers the largest per-installation time saving. Phase 5 depends on data accumulated in 1–4 and cannot be built first.
