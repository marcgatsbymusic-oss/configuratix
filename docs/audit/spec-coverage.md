# Spec Coverage & Implementation Audit

**Date:** 2026-08-13  
**Status:** Completed  
**Audit Target:** Installation Execution Module  
**Compliance Standard:** docs/spec/installation-execution-spec.md & docs/antigravity-build-prompts.md  

---

## 1. Build Prompts Execution Status (Prompts 0–15)

The table below outlines which of the developer prompts from `antigravity-build-prompts.md` have actually been executed in the repository, versus those that are partially complete or remain mock stubs.

| Prompt | Title | Status | Findings / Evidence |
| :--- | :--- | :--- | :--- |
| **Prompt 0** | Agent Context File | **PARTIAL** | `AGENTS.md` exists in both root and `.agents/`. However, the root `AGENTS.md` ONLY deals with CAD parsing (IGLO 5 geometry and assembly rules) and completely lacks the "Installation Execution Platform" context. Only `.agents/AGENTS.md` contains the system details. |
| **Prompt 1** | Repository Scaffold | **IMPLEMENTED** | Workspace structure with `apps/backend/`, `apps/back-office/`, `apps/mobile/` is present. Database migrations configured (Prisma). Backend module boundaries are laid out. |
| **Prompt 2** | Identity, Roles & Access | **PARTIAL** | Models are present in `schema.prisma`. Permission matrix logic exists. However, authentication is completely mocked in the backend (accepts arbitrary header credentials without signature verification). |
| **Prompt 3** | Back Office Shell | **PARTIAL** | React shell exists with gated routes, but OIDC integration is entirely absent (mock fallback on `localStorage`). |
| **Prompt 4** | Order Import & Installation List | **IMPLEMENTED** | Import pipeline exists with `CsvOrderParserAdapter` and `PdfOrderParserAdapter` stub throwing a "not implemented" error. Manual correction dropdowns are implemented in `Orders.tsx`. |
| **Prompt 5** | QR Labels & Delivery Rec. | **PARTIAL** | **Part B (Delivery Reconciliation)** is fully implemented. **Part A (Labels & Job Pack)** is barely started: `LabelsPrint.tsx` prints raw QR codes but lacks job pack summaries, item cards, checklists, versioning, and the 100mm calibration rule. |
| **Prompt 6** | Workflow Step Engine | **IMPLEMENTED** | Step definition and instance state engine exist with preconditions and checklist checks in `WorkflowEngine.ts`. |
| **Prompt 7** | Evidence Capture | **PARTIAL** | Geo-tagging, immutability, and tolerance pass/fail checks are in `EvidenceService.ts`. However, deferred/late upload detection, the `EvidenceGap` worklist, and the `PhotoRequest` mechanism are unimplemented. |
| **Prompt 8** | Override Gate | **PARTIAL** | Backend logic is written in `OverrideService.ts` but contains a **critical database bug** (queries role names against UUIDs). Gating UI is only an empty inline component stub in `App.tsx`. |
| **Prompt 8b** | Product Types & Profiles | **PARTIAL** | ProductType and HandlingRules exist in the DB and config. However, inter-item sequencing and competency checks are not fully integrated or enforced. |
| **Prompt 9** | Installation Step Content | **PARTIAL** | ONLY the Casement Window step definitions are seeded. Remaining variants (sliding doors, entrance doors, built-in/surface blinds, venetian blinds) are missing from `StepSeederService.ts`. |
| **Prompt 10** | Installer App Shell & Sync | **NOT STARTED** | Flutter code in `apps/mobile` is completely mock-only. Outbox sync is an in-memory array list (`_queue`) with static prints; no database persistence or actual API calls. |
| **Prompt 11** | Installer App Execution Flow | **NOT STARTED** | All screens in the Flutter mobile application are static layouts with hardcoded mock variables. No real step progression or backend sync. |
| **Prompt 12** | Trim Calc & Batch Cut Lists | **PARTIAL** | `TrimCalculatorService.ts` exists but length formulas and stock optimization are stubbed, returning empty arrays (`[]`). |
| **Prompt 12b** | Progress, Forecasting & Tasks | **PARTIAL** | Forecasting engine with confidence intervals is implemented. Ad-hoc tasks exist but are not wired to endpoints. Progress weighting is stubbed. |
| **Prompt 13** | Customer Portal | **NOT STARTED** | No files, route definitions, or controllers exist for the customer portal. |
| **Prompt 14** | Management Analytics | **NOT STARTED** | Only an inline empty component text in `App.tsx` exists. |
| **Prompt 15** | Verification Pass | **IN PROGRESS** | This audit report. |

---

## 2. Specification Functional Requirements (FR) Status

Assessment of every `FR-` requirement defined in the functional specification:

### 1. Positioning, Access and Administration
* **FR-1.1 — Shared identity, separate authorisation**: **PARTIAL** (Role gating exists, but identity verification is simulated).
* **FR-1.2 — Single sign-on**: **NOT STARTED**.
* **FR-1.3 — Data boundary**: **IMPLEMENTED** (Independent schemas enforce isolation).
* **FR-1.4 — Back office scope**: **PARTIAL** (Core workflows implemented; Overrides, Notifications, and Analytics are stubs).
* **FR-1.5 — Installer app scope**: **NOT STARTED / STUBBED** (Mobile client is static UI only).
* **FR-1.6 — User creation**: **PARTIAL** (DB creation works, but email invitation and self-set passwords do not exist).
* **FR-1.7 — Role assignment**: **IMPLEMENTED** (Prisma tables match).
* **FR-1.8 — Multiple roles**: **IMPLEMENTED** (Evaluated as a union of permissions).
* **FR-1.9 — Separation of duties**: **IMPLEMENTED** (Enforced programmatically in `AuthorizationService.ts` and `OverrideService.ts`).
* **FR-1.10 — Lifecycle**: **IMPLEMENTED** (Users are suspended/deactivated via status flag, never deleted).
* **FR-1.11 — Audit log**: **IMPLEMENTED** (`Prisma` mutation interceptor logs admin changes).
* **FR-1.12 — Device binding**: **NOT STARTED**.

### 2. Order, Delivery and Goods-in
* **FR-2.1 — Import order/invoice**: **IMPLEMENTED** (Parses CSV into list).
* **FR-2.2 — Item enrichment**: **IMPLEMENTED** (Imports dimensions, colors, schematic mapping).
* **FR-2.3 — Location assignment**: **IMPLEMENTED** (Gated on back office Orders page).
* **FR-2.4 — Scan to open**: **IMPLEMENTED** (Endpoint fetches list by shipment number).
* **FR-2.5 — Reconciliation checklist**: **IMPLEMENTED** (In `DeliveryReconciliation.tsx`).
* **FR-2.6 — Unload and identify**: **IMPLEMENTED** (Barcode matching and resolution).
* **FR-2.7 — Discrepancy report**: **IMPLEMENTED** (Saves discrepancies and blocks item status from progress).
* **FR-2.8 — Staging**: **NOT STARTED**.

### 3. Pre-preparation and the Job Pack
* **FR-3.1 — Label generation**: **IMPLEMENTED** (`LabelsPrint.tsx` renders PDF layout).
* **FR-3.2 — Label content**: **PARTIAL** (Lacks schematicUrl rendering and version stamps).
* **FR-3.3 — Placement**: **N/A** (Physical process step).
* **FR-3.4 — Pack generation**: **NOT STARTED** (No checklists, templates, or cards included).
* **FR-3.5 — Pack versioning**: **NOT STARTED**.
* **FR-3.6 — Print fidelity for templates**: **NOT STARTED** (No 100mm calibration scale on printouts).
* **FR-3.7 — Pack assembly checklist**: **NOT STARTED**.

### 4. Installer Session and Daily Planning
* **FR-4.1 — Session start**: **PARTIAL** (Mock login screens only).
* **FR-4.2 — Daily plan recommendation**: **NOT STARTED** (Deferred).
* **FR-4.3 — Plan is advisory**: **NOT STARTED**.

### 5. Per-item Installation Workflow
* **FR-5.32 — Product type is a first-class attribute**: **IMPLEMENTED** (DB model exists, but CSV parser imports it as generic text).
* **FR-5.33 — Installation Profile per type**: **IMPLEMENTED** (Configuration stubs exist).
* **FR-5.34 — Openings hold an ordered set of items**: **IMPLEMENTED** (DB model).
* **FR-5.35 — Inter-item sequencing**: **NOT STARTED**.
* **FR-5.36 — Opening completion is derived**: **NOT STARTED**.
* **FR-5.37 — Competency requirements per profile**: **PARTIAL** (Service exists but is unused).
* **FR-5.38 — Assigned items appear as card deck**: **PARTIAL** (Flutter UI layout only).
* **FR-5.39 — Handling rule is derived**: **IMPLEMENTED** (`HandlingRuleService.ts` throws blocks on placeholders).
* **FR-5.1 — Scan QR to open workflow**: **PARTIAL** (Mock screens only).
* **FR-5.2 — Barcode mismatch block**: **NOT STARTED**.
* **FR-5.92 — Scan shows status, not just entry**: **NOT STARTED**.
* **FR-5.40 — Entry selection**: **PARTIAL** (Mock screens only).
* **FR-5.41 — Entry method is recorded**: **IMPLEMENTED** (Fields exist in DB).
* **FR-5.42 — Active vs. elapsed time tracking**: **NOT STARTED**.
* **FR-5.43 — Handling confirmation**: **NOT STARTED**.
* **FR-5.3 — Location photo**: **PARTIAL** (Simulated).
* **FR-5.44 — Current situation declaration**: **NOT STARTED**.
* **FR-5.45 — Extraction confirmation**: **NOT STARTED**.
* **FR-5.4 — Photo analysis**: **NOT STARTED** (Deferred).
* **FR-5.5 / 5.6 — Removal & cleared opening photo**: **PARTIAL** (Simulated).
* **FR-5.46 / 5.47 — Material declaration & tool checklist**: **NOT STARTED**.
* **FR-5.48 — Glazing removal prompt**: **NOT STARTED**.
* **FR-5.49 — Safety advisory and PPE confirmation**: **IMPLEMENTED** (`WorkflowEngine.ts` enforces safety checklist items).
* **FR-5.50 — Hazardous material check**: **NOT STARTED**.
* **FR-5.51 — Extraction timing**: **NOT STARTED**.
* **FR-5.52 — Waste handling**: **NOT STARTED**.
* **FR-5.53 to 5.56 — Post-extraction branch & ad-hoc tasks**: **IMPLEMENTED** (Backend service exists but not exposed).
* **FR-5.57 to 5.59 — Prep and tool selection**: **NOT STARTED**.
* **FR-5.60 / 5.61 — Empty photo & substrate assessment**: **NOT STARTED**.
* **FR-5.62 — Setting blocks**: **NOT STARTED**.
* **FR-5.7 to 5.10 — Frame placement**: **PARTIAL** (Simulated).
* **FR-5.11 to 5.15 — Plumb levelling and axis measurements**: **PARTIAL** (Backend models exist, not integrated in client).
* **FR-5.63 / 5.64 — Two-stage levelling and adjustment loop**: **NOT STARTED**.
* **FR-5.65 — Fixing method declared by profile**: **IMPLEMENTED** (In config).
* **FR-5.82 / 5.83 — Sash access warning**: **NOT STARTED**.
* **FR-5.84 — Pre-drilled hole branch**: **NOT STARTED**.
* **FR-5.16 to 5.22 — Frame drilling, fixing sequence, checks**: **PARTIAL** (Backend stubs only).
* **FR-5.66 to 5.69 — Chemical injection points & timers**: **NOT STARTED**.
* **FR-5.23 / 5.24 — Sealing layers**: **NOT STARTED**.
* **FR-5.70 / 5.71 — Foam application**: **NOT STARTED**.
* **FR-5.72 — Two-sided evidence**: **IMPLEMENTED** (Perspective column).
* **FR-5.73 — Two distinct cure timers**: **IMPLEMENTED** (Supported in step engine).
* **FR-5.74 to 5.78 — Trimming & inspections**: **NOT STARTED**.

### 7. Trim Calculation
* **FR-7.1 to 7.14 — Joint cover trims**: **PARTIAL** (`TrimCalculatorService.ts` exists but formulas return `[]` stubs).

### 8. Customer Portal
* **FR-8.1 to 8.5 — Visual board, status, progress, preferences**: **NOT STARTED**.

### 9. Management Analytics
* **FR-9.1 to 9.5 — Process timings, methods comparison**: **NOT STARTED** (Empty stub in `App.tsx`).

---

## 3. Hardcoded Technical Values (Should be Placeholders)

The following parameters are hardcoded instead of being loaded from configuration or marked as `PLACEHOLDER_UNVERIFIED`:

1. **[`MechanicalFixingConfig.ts`](file:///c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/apps/backend/src/modules/workflow/config/MechanicalFixingConfig.ts#L21)**:
   * **Line 21**: `cornerOffsetMm: 150` is hardcoded as `150`. Corner offset distance must come from Drutex engineering specifications and must be a placeholder.
2. **[`StepSeederService.ts`](file:///c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/apps/backend/src/modules/workflow/services/StepSeederService.ts#L81)**:
   * **Line 81**: `blockingTimerMinutes: 40` is hardcoded as `40`. Cure times are properties of the expanding foam product and must not be hardcoded in seeds.
3. **[`workflow_step_screen.dart`](file:///c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/apps/mobile/lib/screens/workflow_step_screen.dart#L26)**:
   * **Line 26**: `_timerDurationMins = 0` (comment details hardcoded reference to `40` for sealing step).
4. **[`Orders.tsx`](file:///c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/apps/back-office/src/pages/Orders.tsx#L188)** (and other locations):
   * Hardcoded base API endpoint: `http://localhost:3001` is hardcoded directly inside `fetch` requests across `Orders.tsx` and `UserAdmin.tsx`, which breaks Vercel deployments.

---

## 4. Security Boundary Violations (Client-Side Gating)

These locations use the client to enforce security rules instead of relying on verified backend assertions:

1. **[`Login.tsx`](file:///c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/apps/back-office/src/Login.tsx#L40)**:
   * **Client password validation**: The validation logic checking `password === 'STQ1234!*!'` is written entirely on the client, which bypasses server authentication.
2. **[`UserAdmin.tsx`](file:///c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/apps/back-office/src/pages/UserAdmin.tsx#L67)**:
   * **Client fallback identity storage**: If the backend server is unreachable, user invitation and list updates fallback to writing directly to `localStorage` key `backoffice_users_v3`. During login, the client matches the email against this local storage value to grant access, allowing any user to spoof role elevations locally.
3. **[`main.ts`](file:///c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/apps/backend/src/main.ts#L24-L35)**:
   * **Backend mock authentication boundary**: The authentication middleware `mockRequireAuth` reads the raw role name from the `Authorization: Bearer <role>` header and assumes it as the caller's active roles without decoding JWT signature, verifying OIDC issuers, or comparing it against user permissions stored in the database. A caller can gain full administrative rights simply by supplying the header `Authorization: Bearer ADMIN`.

---

## 5. AGENTS.md Analysis

* **Exists?**: Yes, at the root directory (`AGENTS.md`) and in the `.agents/` folder.
* **Matches Prompt 0?**:
  * **Root `AGENTS.md`**: **NO**. The root file contains specifications for the geometric CAD configurator (cross-sections, assembly engine math, profiles). It completely lacks any description of the **Installation Execution Platform**, the technology constraints, or the "DO NOT INVENT" placeholders.
  * **`.agents/AGENTS.md`**: **YES**. It contains the system description, non-negotiable tech stack (modular monolith, PostGIS, React, Flutter), "DO NOT INVENT" configuration block, coding conventions, and spec file source of truth indicators.
  * **Summary**: Prompt 0 is split inconsistently. A developer agent reading the root `AGENTS.md` will miss all constraints of the installation execution module.

---

## 6. Critical Code Defects

1. **[`OverrideService.ts`](file:///c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/apps/backend/src/modules/workflow/services/OverrideService.ts#L65)** (and **Line 110**):
   ```typescript
   const supervisorRoles = await this.prisma.roleAssignment.findMany({
     where: {
       userId: params.supervisorId,
       roleId: 'SUPERVISOR' // CRITICAL BUG: Queries roleId against Name
     }
   });
   ```
   * **Impact**: `roleId` is a foreign key pointing to `Role.id` (which is a UUID). Querying for the string `'SUPERVISOR'` will always return `[]` (empty list). As a result, **no supervisor is ever authorized to approve or reject overrides in the backend**, causing all requests to fail. It must be refactored to query `role: { name: 'SUPERVISOR' }`.
