# Installation Execution — Functional Specification

**Status:** Draft v0.6 — structured from raw working notes
**Scope:** Access and administration, goods-in, per-item installation across product types, evidence capture, completion and downstream visibility
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

## 3. Pre-preparation and the job pack

Work done before anyone reaches site. A responsible person — dispatcher, crew lead or back-office — assembles a physical **project folder** per job, containing everything the crew will need in printed form. The folder travels with the job.

### 3.1 Opening labels (wall QR codes)

**FR-3.1 — Label generation.** The system generates one QR label per opening, printable A4 (`[A]` confirm whether one label per sheet or multiple-up; A4 was specified but may be wasteful).

**FR-3.2 — Label content.**
- QR code (resolves to the opening, not the window — the opening is the fixed physical reference)
- Product description and item number
- Parsed schematic image of the window system
- Dimensions
- Room / location reference

**FR-3.3 — Placement.** Labels are affixed to the wall adjacent to the opening before installation begins.

**Design note:** binding the QR to the *opening* rather than the *window* is deliberate. If a window is swapped, damaged or re-ordered, the opening identity and its accumulated evidence survive.

### 3.2 The job pack

**FR-3.4 — Pack generation.** A single action generates the printable pack for a job. Contents, each individually selectable:

| Item | Notes |
|---|---|
| Wall QR labels | One per opening (FR-3.1) |
| Item cards | Image, dimensions, weight, crew size, mechanical-aid flag (FR-5.38) |
| Fixing diagrams | Hole positions and setting block positions per item, where determined |
| **Trim cut templates** | 1:1 overlays for blind-box notches and any non-rectangular cut (FR-7.14) |
| Installation checklist | Printed fallback for the workflow |
| Job summary | Openings, items, sequence, access notes |

**FR-3.5 — Pack versioning.** Every printed sheet carries the job reference, a generation timestamp and a version. Printed material goes stale — an item swapped after printing produces a folder that disagrees with the app, and on site the paper usually wins the argument. The app must be able to detect that the pack in use is outdated, and reprinting a superseded sheet must be one action, not a regeneration of the whole pack.

**FR-3.6 — Print fidelity for templates.** Templates are dimensionally meaningful and must print at true scale. Every template sheet carries a **printed calibration scale** (a marked 100 mm rule) that the user checks with a tape before cutting against it. Printer drivers silently apply "fit to page" scaling, and a template 3% undersize produces a notch that is visibly wrong and cannot be undone.

**FR-3.7 — Pack assembly checklist.** The preparer confirms what went into the folder. The pack contents are recorded against the job, so a crew arriving without a template knows whether it was never printed or has been mislaid.

`[A]` Confirm who owns pre-preparation in the current process — dispatcher, warehouse or crew lead. It determines where this sits in the back office and who is accountable when the folder is incomplete.

---

## 4. Installer session and daily planning

**FR-4.1 — Session start.** On login the installer is greeted by name and presented with the windows assigned to them.

**FR-4.2 — Daily plan recommendation.** The installer may request a recommended plan for the day. Inputs: available working hours (entered by the installer), window types remaining, historical duration data for comparable window types and methods. Output: an ordered set of windows expected to fit the available time.

**FR-4.3 — Plan is advisory.** The installer may accept, reorder or ignore the plan. Deviations are recorded (they are useful signal for §11).

**Dependency:** FR-4.2 is meaningless until sufficient historical duration data exists. Ship in a later phase; until then, fall back to dispatcher-assigned ordering.

---

## 5. Per-item installation workflow

> **FR numbering:** identifiers are stable and referenced externally. They do not follow subsection order — requirements added after v0.2 append to the end of the sequence.

### 5.0 Product types, installation profiles and the card deck

#### 5.0.1 Product taxonomy

The system does not install "windows". It installs **items**, each of a declared product type, and each type carries a different workflow, tool set, handling rule and completion criteria.

| Type | Distinguishing installation characteristics |
|---|---|
| **Window** | Baseline workflow (§5.1–§5.10). Casement, tilt-turn, fixed. |
| **Sliding door** | High mass, long spans. Machine handling frequently mandatory. Track and threshold levelling is the critical tolerance, not frame plumb. Frame often delivered in parts and assembled in the opening. |
| **Door (entrance)** | Threshold detailing and drainage, security fixing requirements, lock/strike alignment, hinge adjustment. Weathertightness at the sill is the failure point. |
| **Roller blind** | Two distinct cases: **built-in box**, which must be installed *before or with* the window and is not retrofittable, and **surface-mounted**, which follows the window. Electrical work where motorised: cable routing, connection, end-stop programming, remote pairing. |
| **Venetian blind (external)** | Guide rails or tension wires fixed to the reveal, tilt mechanism alignment, motor and limit programming. Alignment tolerance is tighter than the window's — a blind that binds in its guides is a callback. |
| **Venetian blind (internal)** | Light fixing, low risk, often a finishing operation rather than an installation in its own right. |

The taxonomy must be extensible. Fixed glazing, sills, insect screens, shutters and garage doors are foreseeable additions — do not hardcode the list.

**FR-5.32 — Product type is a first-class attribute.** Every InstallationItem carries a product type, resolved at import from the order line. `[A]` Confirm the order/invoice data distinguishes these types reliably, or define the mapping rules.

**FR-5.33 — Installation Profile per type.** Each product type maps to an Installation Profile defining: the workflow step graph, mandatory evidence, tool and consumable set, handling rules, applicable tolerances, competency requirements, and completion criteria. Profiles are configuration, expressed against the step engine of §6.1 — not separate code paths.

#### 5.0.2 Multiple items per opening

**This changes the data model.** The specification to date assumed one window per opening. A single opening may carry a window, a built-in roller blind box, and an external venetian blind — three items, three workflows, with ordering dependencies between them.

**FR-5.34 — Openings hold an ordered set of items.** The Opening owns the wall QR identity and the accumulated evidence; items are installed against it.

**FR-5.35 — Inter-item sequencing.** The profile declares dependencies: a built-in blind box precedes the window; a surface-mounted blind follows it; guide rails may require the window in place to align against. The system enforces the order and blocks out-of-sequence starts.

**FR-5.36 — Opening completion is derived.** An opening is complete when all its items are complete, not when the window is.

#### 5.0.3 Competency gating

Motorised blinds involve electrical work. Some jurisdictions and some clients require this to be performed or certified by a qualified person.

**FR-5.37 — Competency requirements per profile.** A profile may require a competency the installer must hold. An installer without it cannot start those steps, and the dispatch engine must not assign them.

This is the first real consumer of the capability-check interface stubbed in §12 of the master spec. The hook exists; this is what it is for. `[A]` Confirm the certification requirements that actually apply for low-voltage blind motor connection in the operating jurisdictions before defining the competency list.

#### 5.0.4 The installer's card deck

**FR-5.38 — Assigned items appear as a card deck** in the installer's profile, synced for offline use. One card per item, carrying:

- Product image or configured schematic
- Product type
- Dimensions
- **Weight**
- **Recommended crew size for safe handling into position**
- **Mandatory mechanical aid flag** — where manual handling is not permitted at all
- Location (room, elevation, opening reference)
- Current status

**FR-5.39 — Handling rule is derived, never entered.** Crew size and the mechanical-aid flag are computed from weight, dimensions and product type by a configurable rule. An installer cannot lower the requirement; raising it is always permitted.

`[A]` The handling thresholds must derive from applicable manual-handling regulation and the lifting equipment's rated capacity — not from convention or from the model's prior. This is the same unresolved value as FR-6.13 and they must resolve together.

`[A]` Confirm that per-item weight is available in the Drutex order or product data. If it is not, it must be computed from glazing specification, profile system and dimensions, and that calculation needs validating. **The entire handling rule depends on this.**

### 5.1 Entry and authentication

**FR-5.1** — Installer scans the wall QR. Credentials are verified. The system opens the installation workflow for that opening and displays: what is to be installed, method recommendations, and the tool checklist.

**FR-5.2** — The system verifies that the window scanned/staged for this opening is the correct one. A mismatch is a hard block.

**FR-5.40 — Start button.** From the card deck, the installer presses **Start**. The system offers two entry routes:

- **Scan QR code on wall** — resolves the opening directly (FR-5.1).
- **Start manually** — the installer selects the item from the deck, filtered to this site and to items not yet complete.

**FR-5.41 — Entry method is recorded.** A QR scan is a *verified* binding between installer, item and physical opening. A manual selection is an *asserted* one. Both are permitted — labels fall off, get painted over, or arrive dusty and unreadable — but the distinction is recorded on the item and surfaced in the evidence record and in management reporting. If manual entry becomes the norm rather than the exception, that is a signal worth seeing.

**FR-5.42 — Time tracking starts on selection.** The item-level timer begins the moment the item is selected, before any step. Step-level timers run within it. The two must reconcile: item duration is not simply the sum of step durations, and the difference (setup, movement, waiting) is itself useful data.

**FR-5.43 — Handling confirmation.** Before physical work begins, the card's crew size and mechanical-aid requirement (FR-5.38, FR-5.39) are presented for confirmation. Where mechanical aid is mandatory, the installer confirms which equipment is in use. This is a blocking confirmation, not a banner.

### 5.2 Site assessment

**FR-5.3 — Location photo.** Installer photographs the empty opening, or the existing window to be removed.

**FR-5.44 — Current situation declaration.** The installer selects the existing condition from a defined list. Options at minimum:

- Empty opening, new build
- Empty opening, previous unit already removed
- Existing window in place
- Existing window with blinds in place
- Existing door in place
- Existing unit in place, other

The selection drives everything downstream: whether the extraction sub-flow (§5.3) is required, which tools are presented, and which hazards apply.

**FR-5.45 — Extraction confirmation.** Where the declared situation implies removal, the system asks explicitly: *extraction of the existing unit is required — proceed?* Yes routes into §5.3. No returns the installer to the deck with the item left open and a reason recorded. This is a deliberate stop: it is the last point before destructive work, and the cheapest place to catch a wrong opening.

**FR-5.4 — Photo analysis and recommendation.** The photo is analysed and the system recommends the installation approach for this window and opening.

> **Scoping caution.** This is the highest-risk feature in the document. Automated analysis of a construction photo to determine fixing method touches structural safety and liability. Recommended treatment:
> - Phase 1: rules-based recommendation from *known structured data* (wall construction from the technical survey, window size and weight, product system, installation type per RAL/PN-EN practice). The photo is captured as evidence only.
> - Phase 2: image analysis as a *supporting hint* that pre-fills a form the installer confirms.
> - Never: an unconfirmed machine recommendation that the installer executes without a human decision. The manual-override gate (§6.3) exists precisely because technically wrong decisions must be preventable.

### 5.3 Removal of existing unit (conditional)

**FR-5.5** — Timed step. Recommended tools presented. Start/stop timing recorded.
**FR-5.6** — Completion photo of the cleared opening.

**FR-5.46 — Existing unit material declaration.** The installer declares the material of the unit being removed: **PVC, aluminium, timber, steel, composite, other**. Material determines the tool set, the cutting method, the PPE, and the hazards that apply. This is not a cosmetic field.

**FR-5.47 — Material-driven tool list.** The system presents the expected tools for the declared material, as a checklist. Baseline:

| | Common | Material-specific |
|---|---|---|
| **All** | Pry/crow bar, hammer, chisel, screwdrivers, utility knife, sash-removal tool, glazing bead tool, suction pads, dust sheets, waste containment | |
| **PVC** | | Reciprocating (sabre) saw, general-purpose blade |
| **Aluminium** | | Reciprocating saw with metal blade, or angle grinder; metal-cutting discs |
| **Timber** | | Reciprocating saw with wood/nail blade, wrecking bar, wood chisels |
| **Steel** | | Angle grinder, metal-cutting discs — expect a longer, hotter job |

**FR-5.48 — Glazing removal before extraction.** Where practical, glass is removed before the frame is cut out. This reduces weight, reduces the crew size needed, and removes the largest injury risk from the operation. Prompt for it as a checklist item with an explicit decline option.

**FR-5.49 — Safety advisory and PPE confirmation.** Before extraction begins, required PPE is presented: **safety glasses, cut-resistant gloves, hearing protection**, plus a dust mask where masonry is disturbed and a face shield where grinding is involved.

> **Design note.** A safety advisory that is only a screen to dismiss becomes noise within a week, and installers will tap through it without reading. If this is to mean anything, tie it to something: require the PPE items to be ticked alongside the tool checklist, or require a photo of the crew equipped at the start of the first extraction of the day. A banner nobody reads is worse than no banner, because it creates a record implying a warning was given.

**FR-5.50 — Hazardous material check.** Where the building predates a configurable date threshold, the installer is prompted to confirm no hazardous material has been identified in or around the unit before cutting begins — painted timber and the sealants, renders and packing around older openings are the usual concerns. If anything is suspected, extraction is **blocked** and escalated through the override gate (§6.3).

> `[A]` This requirement is deliberately non-specific. The applicable rules on surveying for and disturbing hazardous materials vary by jurisdiction and by building age, and they carry legal weight. **Get a compliance answer before implementing this** — do not let it be designed from general knowledge. The system's job is to present the check and record the answer, not to determine what the law requires.

**FR-5.51 — Extraction timing.** The extraction runs as its own timed step within the item timer, from tool checklist confirmation to cleared-opening photo. Extraction duration by material and unit type is one of the more useful figures the system will produce — it is the number that makes replacement jobs estimable.

**FR-5.52 — Waste handling.** The removed unit is recorded as a disposal item: material, approximate size, destination. `[A]` Confirm the waste stream obligations that apply; glazing, PVC and treated timber are frequently handled separately.

#### Post-extraction branch

**FR-5.53 — Extraction complete, choose next.** On confirming extraction, the system asks what happens next:

- **Install the new unit** — named explicitly (*"Install: Living room tilt-turn, 1200 × 1400"*), so the installer is confirming a specific item, not a generic action
- **Other tasks first** — one or more interim tasks before installation begins

**FR-5.54 — Ad-hoc task capture.** Interim tasks are captured from a curated list with a free-text fallback. Typical entries: clear debris, remove old unit to the skip, protect the room, make good the reveal, wait on another trade.

> **Design note.** Free text destroys analytics. If every installer types their own wording, "putting old window away" arrives as forty distinct strings and cannot be aggregated or compared. Seed a curated list from the tasks installers actually perform, keep "other" available with free text, and review the free-text entries periodically to promote recurring ones onto the list. The list should grow from observed reality, not be guessed in advance.

**FR-5.55 — Ad-hoc tasks are timed.** Each runs as a timed step within the item timer, with the same start/stop discipline as any other step. This is the only way the gap between item duration and the sum of installation steps becomes explainable.

**FR-5.56 — Return to flow.** On finishing an interim task, the installer either adds another or proceeds to installation. The system re-presents the same choice rather than assuming.

### 5.4 Preparation, handling and frame placement

#### Preparation

**FR-5.57 — Crew and handling declaration.** The installer confirms how the unit will be moved into place: number of people, or mechanical aid with the equipment identified. The card's recommendation (FR-5.38, FR-5.39) is pre-selected. Where mechanical aid is mandatory, the manual options are unavailable — not merely discouraged.

**FR-5.58 — Tool and material selection.** A suggested list is presented for the item's installation profile. Baseline for a screw- or chemically-fixed window:

*Positioning and support:* distance/setting blocks for the corners, plastic wedges, inflatable cushions
*Measurement:* spirit level, digital inclinometer
*Fixing:* wall screws, anchor plates, or bi-component injection system with applicator gun
*Sealing:* water sprayer, low-expansion insulating foam, foam gun, sealing tapes per the installation type
*General:* cutting knife, cleaning materials, protection sheeting

The installer selects what will be used. Selections are recorded against the item.

**FR-5.59 — Learned tool recommendations.** Subsequent installations of comparable items pre-select the tools this installer (or this crew) actually used, ranked by frequency. The list adapts to how the team works.

> **Constraint that must not be lost.** Learning may reorder and pre-select. It must never *remove* an item the installation profile marks as mandatory, and it must never quietly drop PPE or a safety-critical component because it was skipped last time. Convenience learning that erodes a required list is how a checklist stops being a control. Mandatory items are always shown, always unticked, and always require explicit confirmation.

**FR-5.60 — Empty opening photo.** A photograph of the prepared opening before the unit goes in.

**FR-5.61 — Substrate condition assessment.** The installer confirms the opening is sound, or flags that it requires making good. Where flagged:

- The defect is recorded with photos and a description
- The installer indicates whether **they** will remedy it or **another party** will
- If self-remedied, it becomes a timed task and installation continues once complete
- If assigned elsewhere, the item is **parked**, not failed, with a blocking dependency and a notification to the dispatcher

> **Commercial note, and it matters more than it looks.** Discovering damaged reveals after the old unit is out is the single most common source of scope change on a replacement job. It is unbudgeted work, discovered on site, by someone with no authority to price it. FR-5.61 should therefore generate not just a defect record but a **variation record** visible to the back office, with photos attached, at the moment of discovery. Capturing it here is the difference between a priced variation and an argument three weeks later. `[A]` Confirm how variations are currently priced and approved — this hooks into a commercial process that exists outside this system.

#### Placement

**FR-5.7** — Frame positioned in the opening, using the declared handling method.
**FR-5.62 — Setting blocks placed** at the corners and at any additional load-bearing points required by the profile. `[A]` Block positions are not arbitrary — they depend on unit type, sash configuration and opening direction, and getting them wrong transfers load into the frame rather than the structure. The placement rule must come from Drutex technical documentation. Present it as a diagram, as with the fixing positions.
**FR-5.8** — Frame secured against falling using inflatable cushions and plastic wedges before hands are released. This is a **safety-critical confirmation**, not a passive step.
**FR-5.9** — Record whether sashes and/or glazing were removed prior to placement (affects weight, method and subsequent re-fit steps).
**FR-5.10** — Evidence photo: frame in position, blocks, wedges and cushions visible.

### 5.5 Levelling

**FR-5.11** — Installer levels the frame horizontally and vertically across all planes until plumb and square.
**FR-5.12** — Evidence photo per axis (three axes minimum).
**FR-5.13** — Preferred method: high-precision digital inclinometer. Reading photographed and attached to the record.
**FR-5.14** — `[A]` Define acceptance tolerances per axis, per window size band, referencing the applicable standard. Without numeric tolerances the levelling evidence is unauditable. **This must be resolved before build.**
**FR-5.15** — Confirmation that fastening materials adequate to hold the achieved position have been applied.

**FR-5.63 — Levelling occurs twice, and both are recorded.** Once after provisional securing on cushions and wedges, and again after the unit is permanently fixed. The **second** reading is the one that matters — it proves the geometry survived the fixing operation. A system that captures only the first reading documents an intention, not an outcome.

**FR-5.64 — Adjustment loop.** Where the second reading falls outside tolerance, the installer is returned to adjustment rather than allowed to proceed. Each iteration is recorded; repeated iterations on the same item are a signal worth surfacing to management.

### 5.6 Fixing (conditional — method depends on installation profile)

**FR-5.65 — Fixing method is declared by the profile, not chosen ad hoc.** At least three approaches are in use and they are not interchangeable:

| Method | Notes |
|---|---|
| **Mechanical — frame screws** | FR-5.16 to FR-5.22 below |
| **Mechanical — anchor plates** | Fixed to the frame before placement, screwed to the substrate. Different hole schedule, different sequence, no drilling through the frame |
| **Chemical — bi-component injection** | Injected into the perimeter cavity at defined points to bond and secure the frame |

Anything outside the declared method routes through the override gate (§6.3).

`[A]` The selection rule — which method applies for which unit, substrate and installation type — is unresolved and must come from Drutex technical documentation. It is not a matter of installer preference.

This sub-flow runs **after** the unit is in position, provisionally secured on cushions and wedges, and levelled (§5.4, §5.5). It is the operation that converts a supported frame into a fixed one, and it is where a correctly levelled window most often goes out of true.

#### Sash access

**FR-5.82 — Sash opening for access.** Fixing points on the vertical frame members are reached by opening or removing the sashes.

**FR-5.83 — Displacement warning and check.** Before the sash is opened, the system displays an explicit caution: **opening a sash redistributes the load on a frame that is currently held only by wedges and cushions, and can rack it out of level.**

The check is not advisory:

1. Level reading recorded immediately **before** the sash is opened
2. Sash opened
3. Level reading recorded immediately **after**, with evidence photo
4. Deviation beyond tolerance returns the installer to re-levelling and re-supporting before any drilling begins

This is one of the few places where a warning genuinely earns a blocking check rather than a banner — the displacement is invisible by eye, and every subsequent operation locks it in permanently.

#### Pre-drilled hole confirmation

**FR-5.84 — Explicit branch.** The installer confirms whether the unit arrived with fixing holes pre-drilled. The workflow diverges:

| | Path |
|---|---|
| **Holes present** | Skip to substrate drilling (FR-5.87) |
| **Holes absent** | Frame drilling first (FR-5.16 to FR-5.18), then converge |

`[A]` Whether pre-drilled fixing holes are supplied depends on the product and the order configuration. If this is knowable from the order data, pre-fill the answer and let the installer correct it rather than asking cold — one fewer decision on site is one fewer chance to get it wrong.

**FR-5.16 — Hole count and position calculation.** The system calculates the number and position of fixing holes on the vertical frame members: minimum two for small windows, minimum three for larger. `[A]` Define the size threshold and the spacing rule (typically driven by distance from corners and maximum spacing between fixings per the applicable standard — this rule must come from Drutex technical documentation or the standard, not be invented).

**FR-5.17 — Drilling diagram.** Displays heights at which to drill and the offset from the frame edge, so the installer can measure the exact position. Presented as a dimensioned diagram.

**FR-5.18 — Frame drilling (if holes not pre-drilled).** 6 mm steel bit through the frame. Step is timed and confirmed.

#### Substrate drilling and fixing

**FR-5.87 — Substrate drilling.** Drilled through the frame hole into the masonry behind — concrete, brick or mortar joint — using a hammer drill and a masonry bit.

> **Unresolved conflict, flagged rather than silently reconciled.** The working notes give **6 mm** through the frame and **6.5 mm** into the substrate. Earlier notes gave 6 mm for both. These may both be right for different screw products, or one may be a slip. The pilot diameter for a concrete screw is a property of that specific screw and is stated in its technical data — it is not a general-purpose number, and getting it wrong costs pull-out strength or a sheared head. Externalise both diameters as configuration attached to the fixing product, and do not let either be hardcoded.

**FR-5.88 — Substrate type matters.** The profile records what is being drilled into. Fixing into a mortar joint, a solid brick, a hollow block or concrete are not equivalent — pull-out strength differs substantially, and hammer action must be off for hollow or perforated units, which will otherwise shatter internally and leave a hole that grips nothing. `[A]` Confirm the permitted substrates and the minimum embedment per fixing product, and whether any substrate requires a resin anchor instead.

**FR-5.19 — Drill bit.** Hammer drill (Hilti or equivalent) with masonry bit at the diameter specified by the fixing product (see FR-5.87).

**FR-5.20 — Fixing.** Concrete/frame screws (`[A]` confirm 7 mm — diameter, type and length should be derived from the fixing schedule, not hardcoded). Driven with a torque-limited driver, slowly, to avoid shearing the head and to avoid distorting the frame out of its levelled geometry.

**FR-5.21 — Tightening sequence.** The system prescribes the order of fixing — alternating opposite corners (e.g. bottom-right → top-left → bottom-left → top-right) to avoid inducing distortion. `[A]` Confirm the correct sequence with Drutex technical staff; the example in the notes is illustrative only.

**FR-5.89 — Light final tightening.** Screws are driven slowly and tightened only lightly — enough to hold, not enough to draw the frame toward the wall. **Over-tightening bends the frame**, and a bent frame will not close correctly no matter how well it was levelled. The system states this at the step, and the post-fixing checks below are what enforce it.

**FR-5.90 — Per-fixing evidence.** A photograph of each completed fixing point, plus an overall shot of the fixed frame with sashes open.

**FR-5.22 — Post-fixing re-check.** Re-verify level after fixing. Distortion introduced during fixing is the failure mode this whole sub-flow exists to prevent.

**FR-5.91 — Sash operation check before proceeding.** Sashes re-fitted or closed and operated before the workflow leaves this stage. A frame distorted by over-tightening shows up here first — binding, uneven reveal gaps, or a sash that will not latch. Catching it now means backing off a screw; catching it after foaming means cutting the window back out. Full sash adjustment remains at §5.8, but the go/no-go check belongs here.

#### Chemical fixing — bi-component injection

**FR-5.66 — Injection point calculation and diagram.** The system displays where to inject and how many points. The working assumption from site practice is four points, but `[A]` the count and positions must derive from unit size, weight and the product manufacturer's data — a large sliding door is not a small casement. Present as a dimensioned diagram, as with the drilling positions.

**FR-5.67 — Injection step.** Timed, with the product identified (batch or product code where available). Evidence photo of each injection point.

**FR-5.68 — Chemical cure timer.** The frame must remain supported on cushions and wedges until the compound has developed strength. `[A]` The cure time is a product property and must be read from the manufacturer's data sheet, not assumed. Support cannot be removed and levels cannot be re-checked until it has elapsed — this is a blocking timer.

**FR-5.69 — Post-cure verification.** Levels re-measured and photographed after cure (FR-5.63).

### 5.7 Sealing / foaming (conditional)

**FR-5.23** — Fill the perimeter joint between frame and reveal where the installation type requires it.
**FR-5.24** — Three-layer sealing principle applies; the layer sequence and materials must be driven by the installation type recorded in §5.2, not left to the installer.

**FR-5.70 — Surface preparation.** Substrate surfaces are wetted with a water spray before foam application. Confirmed as a checklist item. `[A]` Whether this is required, optional or product-dependent should be confirmed against the foam manufacturer's instructions rather than treated as universal.

**FR-5.71 — Foam application.** Low-expansion insulating foam applied to the full perimeter. Timed step, product recorded.

**FR-5.72 — Two-sided documentation.** Evidence photographs are required from **both the interior and the exterior**. A perimeter seal photographed from one side only documents half the work, and the exterior side is where weathertightness is won or lost.

> This introduces **photo perspective** as a required attribute on evidence records — interior, exterior, detail — not merely a caption. Steps declare which perspectives they require, and completion is blocked until each is present.

**FR-5.25 / FR-5.73 — Two distinct cure timers, not one.** The earlier note in these requirements gave 30–40 minutes; site practice for full cure before trimming is 1–2 hours. These are different things and the system must model both:

| Timer | Gate |
|---|---|
| **Initial set** (≈30–40 min) | Before support is removed or load applied |
| **Full cure** (≈1–2 h) | Before foam is trimmed and finishing begins |

Both are blocking. `[A]` **Both figures must come from the foam manufacturer's technical data**, and both vary with temperature, humidity and bead thickness. Externalise them as configuration with the product, and consider capturing ambient conditions where accuracy matters. Do not hardcode either number.

During any cure wait the system **suggests work on another opening** — this is where the batch logic of §7 earns its value, and where the deferred-trims branch (FR-5.79) pays off.

**FR-5.74 — Post-cure photograph** of the cured foam before trimming.

**FR-5.75 — Foam trimming.** Timed step. Excess foam cut back flush.

**FR-5.76 — Post-trim inspection and photograph.** Trimming exposes the true condition of the junction between frame and reveal. The installer confirms whether making good is required.

**FR-5.77 — Making-good record.** Where required, this follows the same path as FR-5.61: defect record with photos, self-remedied or assigned to another party, timed if self-remedied, parked with a dispatcher notification if not, and raised as a variation where it is out of scope.

**FR-5.78 — Sealing step confirmation.** Explicit confirmation that the sealing stage is complete, with all required perspectives captured, before the workflow advances.

### 5.8 Sash re-fit and adjustment

**FR-5.26** — Sashes re-hung.
**FR-5.27** — Operation check: opens and closes correctly, even reveal gaps, correct compression.
**FR-5.28** — If adjustment needed: guidance on hardware adjustment points, adjusted with 4 mm Allen key. Displayed as a diagram or reference photo from a previous installation.
**FR-5.29** — Evidence photo of the completed, closing window.

### 5.9 Finishing operations (conditional, installer-selected)

On completing the frame and sashes, the installer declares whether further operations are required for this opening:

- Internal and/or external joint covers / trims (§7)
- Electric blind wiring, connection, remote pairing and calibration
- Sills, cills, closures
- Other special finishes

Each selected operation becomes a timed, evidenced step.

**FR-5.79 — Now or later.** For each available finishing operation the installer chooses **proceed now** or **defer**. Deferral is a first-class outcome, not an abandonment: the operation stays open against the item, the item shows as *installed, finishing outstanding*, and the work appears on the job's outstanding list.

Deferring trims is usually the *correct* choice, not a shortcut — it is precisely what makes the batch cut list of §7 worth having. The system should say so rather than nag.

**FR-5.80 — Continue menu.** On deferring, the installer is returned to a menu offering:

- **Scan wall QR** for the next opening
- **Select from list** — the card deck, filtered to incomplete items
- **View outstanding work** across the job
- **End session**

The next item then runs the same workflow from FR-5.40.

### 5.10 Completion

**FR-5.30** — Installer finalises the opening. All mandatory steps and evidence must be present or the finalisation is blocked with an explicit list of what is missing.
**FR-5.31** — Opening status set to `installed`. Progress percentages update for installer, customer and management views.

**FR-5.81 — Item vs. opening completion.** An item is complete when its own steps and any accepted finishing operations are done. The **opening** is complete only when every item on it is complete (FR-5.36) and no deferred operations remain outstanding. Two distinct states, reported separately — conflating them is how "finished" jobs acquire a snag list nobody expected.

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

### 6.6 Progress, estimation and forecasting

**FR-6.15 — Item progress.** Percentage completion of the item currently in hand, derived from completed steps weighted by expected duration — not by step count. Ten seconds of confirmation and ninety minutes of extraction are not equal halves.

**FR-6.16 — Job progress.** Percentage completion across the whole installation, by item count and by weighted effort. Both figures shown; they diverge, and the divergence is informative.

**FR-6.17 — Forecast from observed data.** Remaining time is projected from completed items on this job, adjusted for product type and installation profile.

> **Statistical caution, and this one is worth heeding.** Forecasting the job from the first window will overestimate the total, often badly. The first unit of a job carries setup, unfamiliarity with the site, tool retrieval, and the slowest extraction — it is the least representative data point available. A forecast presented confidently from n=1 will be wrong, and installers who are burned by it once will ignore the forecast thereafter.
>
> Recommended treatment: show the forecast with an explicit confidence indicator that starts low and rises as items complete; present a range rather than a single figure; and recalibrate after every item. Better still, seed the estimate from historical data for comparable product types across all jobs and let the current job's observations pull it, rather than starting from nothing each time.

**FR-6.18 — Installer's own estimate.** The installer may enter their own estimate for the job, at the start or at any point. It is stored alongside the system forecast.

**FR-6.19 — Estimate comparison.** System forecast, installer estimate and actual outcome are compared on completion. This is genuinely valuable data: experienced installers are often better than the model early on, when the model has nothing to work with, and knowing where each is reliable is what makes the forecast trustworthy later. Surface the comparison to management, and to the installer for their own jobs.

`[A]` Decide whether installer estimates are visible to management as individual performance data or only in aggregate. Estimates that become a performance measure stop being honest estimates.

---

## 7. Joint cover (trim) calculation and batch cutting

This is a distinct sub-system and deserves separate treatment from the step engine.

### 7.0 When trims are calculated

**FR-7.9 — Prompt on item completion.** When an item's installation is finalised, the system asks whether to prepare the joint covers now. The options are:

- **Calculate and cut now** — for this item alone
- **Calculate now, cut later** — sizes are computed and added to the job's batch cut list (§7.2)
- **Defer entirely** — falls through to FR-5.79

The middle option is usually the right one and should be the default: calculating is cheap and worth doing while the window is in front of you, but cutting one window's trims at a time wastes the batching advantage.

**FR-7.10 — Individual calculation on demand.** The calculator is also reachable directly, outside any workflow, for a single opening or an arbitrary set. Installers will want to check a size without starting a step.

### 7.1 Per-window calculation

**FR-7.1 — Configuration questions.** For each opening:
1. Does the window have a blind box above it?
2. If so, do the vertical trims run full height, or stop at the underside of the blind box?
3. What cut type at each junction — **straight/butt cut** (one piece overlapping the other) or **mitre cut** (45°)?

**FR-7.11 — Profile width selection.** The installer selects the trim width from the stocked range: **20, 30, 40, 50, 60, 70, 80, 100 mm**. The list is configuration, not code — widths change with supplier.

The system should show the resulting **wall coverage** for the selected width (width minus frame overlap), because that is the number that determines whether the trim actually hides the joint. Where the recorded joint gap is known from the survey, flag a width that will not cover it.

**FR-7.12 — Frame overlap.** The installer sets how far the trim sits onto the frame face, in millimetres. **Default 5 mm**, editable per job and per opening. The value is remembered as a job-level preference after first entry — it rarely varies within a job.

**FR-7.13 — Length calculation.** With frame outer dimensions `W × H`, frame overlap `o` and trim width `t`:

| | Inner edge of trim rectangle | Outer edge |
|---|---|---|
| Horizontal | `W − 2o` | `W − 2o + 2t` |
| Vertical | `H − 2o` | `H − 2o + 2t` |

- **Mitre (45°):** every piece is cut to the **outer** dimension on its long edge, tapering to the inner dimension on the short edge. Four pieces, two cuts each.
- **Butt, horizontals running through:** bottom and top pieces cut to the **outer** horizontal dimension; verticals cut to the **inner** vertical dimension and sit between them.
- **Butt, verticals running through:** the reverse — verticals to the outer vertical dimension, horizontals to the inner horizontal.

> `[A]` **This arithmetic is a starting point, not a validated rule.** It assumes the trim is a flat profile whose stated width is its visible face and whose length is measured on the outer edge. Real trim profiles frequently have a return leg, a groove, or a co-extruded seal that shifts the datum. Blocking question 6 covers this — the formula must be reconciled against the actual profile section before anyone cuts to it. Ship it configurable per profile, not hardcoded.

**FR-7.14 — Blind box variant.** Where a blind box is present and the trims run full height:

- **No top piece.** Three pieces only: bottom, left, right.
- Verticals are measured over the **full height of window plus blind box**, not to the underside of the box.
- Each vertical requires a **notch cut around the blind box**, done by hand.
- The system offers a **printed 1:1 template** for the notch, overlaid on the trim to mark the cut. Subject to the print fidelity rule at FR-3.6.
- The template is added to the job pack (§3.2) when generated during pre-preparation.

`[A]` The notch geometry depends on the blind box's projection and profile, which must come from product data. If box dimensions are not reliably available, the template cannot be generated and this reverts to manual measurement on site — worth knowing before it is promised.

**FR-7.2 — Piece calculation.** Produce the required pieces (three where there is no head trim, four otherwise), each with exact length and the cut type at each end. Lengths differ between straight and mitre configurations — the calculation must account for this, not just return the opening dimensions.

**FR-7.3 — Visual guidance.** Show the cut types with illustrations so the installer selects the right one.

**FR-7.4 — Piece list.** Generate the list of trims for the window: an image of each piece, its exact length, the cut specification at each end, and its position (bottom, left, right, top). Pieces are labelled by position so they are not mixed up after cutting — a stack of four similar lengths becomes anonymous within minutes.

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
| `InstallationItem` | Line item: product type, item no., barcode, spec, dimensions, **weight**, schematic, assigned opening, entry method used |
| `ProductType` | Extensible taxonomy: window, sliding door, door, roller blind, venetian blind, ... |
| `InstallationProfile` | Per-type workflow graph, tools, evidence, tolerances, competency, handling rules |
| `Opening` | Physical location; owns the wall QR identity and all evidence; holds an **ordered set of items** |
| `ItemSequenceRule` | Inter-item dependencies within an opening (blind box before window, etc.) |
| `HandlingRule` | Weight/size/type → crew size and mandatory mechanical aid |
| `Competency` / `CompetencyGrant` | Qualification required by a profile; consumes the master spec §12 capability hook |
| `ExistingUnitRecord` | Declared material and condition of the unit removed, plus disposal record |
| `AdHocTask` | Interim task from curated list or free text, timed, attached to an item |
| `ToolPreference` | Learned tool/material selections per installer or crew, per profile |
| `SubstrateDefect` | Reveal/wall condition, photos, remedy owner, blocking flag, re-inspection |
| `Variation` | Out-of-scope work discovered on site, with evidence, raised to back office |
| `FixingMethod` | Screw, anchor plate, or chemical injection — declared by profile |
| `ProductApplication` | Consumable applied: product code/batch, quantity, step, cure parameters |
| `CureTimer` | Initial-set and full-cure gates, product-derived, blocking |
| `Estimate` | System forecast, installer estimate, actual, per job |
| `DeliveryReceipt` | Goods-in event |
| `Discrepancy` | Missing / damaged / unexpected item |
| `WorkflowStepDefinition` | Configurable step template |
| `WorkflowStepInstance` | Per-opening execution: timings, checklist state, evidence |
| `EvidencePhoto` | Image + geotag + timestamp + step + actor + **perspective** (interior / exterior / detail) |
| `MeasurementRecord` | Level/plumb readings per axis, tolerance pass/fail |
| `OverrideRequest` | Proposed method, reason, approver, decision |
| `ToolInventory` / `MaterialConsumption` | Per installer / per job |
| `MethodDeclaration` | Machine class, crew size, auto-levelling used |
| `TrimProfile` | Stocked widths, section geometry, measurement datum |
| `TrimSpecification` / `TrimCutList` | Per opening and aggregated per job |
| `CutTemplate` | 1:1 printable overlay, with calibration scale and version |
| `JobPack` | Generated printed set, contents, version, assembly confirmation |
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
7. **Per-item weight** — is it in the order or product data, or must it be computed? The entire handling rule (FR-5.39) depends on it.
8. **Manual-handling thresholds** — crew size and mandatory mechanical aid, per regulation and equipment rating. Resolves together with FR-6.13.
9. **Hazardous material obligations** (FR-5.50) — a compliance question, not a design one. Needs a legal answer before implementation.
10. Does the order/invoice data reliably distinguish product types (FR-5.32), or must mapping rules be written?
11. **Setting block positions** (FR-5.62) — per unit type and sash configuration. Wrong blocking transfers load into the frame.
12. **Fixing method selection rule** (FR-5.65) — which of screw, anchor plate or chemical injection applies, for which unit and substrate.
13. **Bi-component injection**: point count, positions and cure time (FR-5.66, FR-5.68) — from the product data sheet.
14. **Foam cure times**, both initial set and full cure (FR-5.73) — from the product data sheet, with temperature and humidity dependence.
15. **Drill diameters** — frame hole and substrate pilot hole (FR-5.87). The notes give 6 mm and 6.5 mm in one place and 6 mm for both in another. Resolve against the fixing product's technical data.
16. **Permitted substrates, embedment depth and hollow-unit handling** (FR-5.88) — including whether any case requires a resin anchor.
17. Is pre-drilled-hole supply knowable from the order data (FR-5.84)?
18. **Blind box projection and profile geometry** (FR-7.14) — without it the notch template cannot be generated.

**Non-blocking but scope-affecting:**

19. Scope and liability posture of photo-based recommendation (§5.2). Recommend deferring to a later phase.
20. Photo volume, resolution, retention and storage cost.
21. Machine-only size/weight threshold and its regulatory basis.
22. Customer visibility of technical evidence photos under GDPR/RODO.
23. Label format — one A4 sheet per opening, or multiple-up.
24. How variations are priced and approved commercially (FR-5.61) — hooks into a process outside this system.
25. Whether installer estimates are visible individually to management or only in aggregate (FR-6.19).
26. Who owns pre-preparation and job pack assembly in the current process (FR-3.7).

---

## 12. Suggested phasing

| Phase | Contents |
|---|---|
| **0 — Access and administration** | Module access boundary within the configurator, SSO, back office shell, user creation and role assignment, audit log |
| **1 — Foundation** | Order/invoice import, Installation List, opening assignment, QR label generation, job pack assembly, delivery scan and reconciliation checklist, barcode binding |
| **2 — Guided execution** | Step engine, product types and installation profiles, card deck and handling rules, per-item workflow, extraction sub-flow, timing, checklists, evidence capture, offline sync, override gate |
| **3 — Technical calculators** | Fixing hole calculation and diagrams, tightening sequence, trim calculation, batch cut lists |
| **4 — Visibility** | Customer portal and notifications, installer progress panel |
| **5 — Intelligence** | Management analytics, daily plan recommendation, method comparison, photo-assisted recommendation |

Phase 0 is a prerequisite for everything and is the phase most exposed to the configurator's existing identity architecture — resolve blocking question 0 before committing to an estimate for it. Phases 1–2 deliver the auditable installation record, which is the core value. Phase 3 delivers the largest per-installation time saving. Phase 5 depends on data accumulated in 1–4 and cannot be built first.
