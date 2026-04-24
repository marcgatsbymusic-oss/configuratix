# Partner Portal Backend Implementation Plan

## Goal Description

Develop a B2B Partner Portal backend and dashboard that allows retail partners (e.g., hardware stores, pharmacies) to act as lead generators for window sales. Partners display physical marketing materials (posters, leaflets) equipped with dynamic QR codes. 

When a customer scans a QR code, they are directed to a co-branded landing page, and the store earns commissions based on a multi-tier structure (Tier 1: Poster Scan, Tier 2: In-Store Scan, Tier 3: Staff-Assisted). The portal will provide partners with real-time visibility into anonymized lead pipelines, commission earnings, marketing material performance, and WhatsApp-integrated notifications.

## Proposed Architecture & Stack

Given the real-time requirements (WebSockets, live commission calculators) and data isolation needs (independent stores, chains):

*   **Frontend UI:** React (Vite or Next.js) using modern UI components (TailwindCSS) for the 9 distinct portal modules.
*   **Database & Auth:** Supabase (PostgreSQL). Provides robust Row-Level Security (RLS) to ensure store owners only see their own anonymized leads, plus out-of-the-box WebSocket support for real-time notifications.
*   **API & Backend Functions:** Serverless Edge Functions (via Supabase or Vercel) to handle secure QR code generation, WhatsApp webhook events, and commission tier calculations.
*   **Messaging:** Twilio or Meta WhatsApp Business API for the interactive opt-in notification framework.

## Proposed Modules (MVP Scope)

Based on the document, the portal consists of 9 modules. I propose dividing the development into phases, starting with the core operational modules:

### Phase 1: Core Operations
*   **Dashboard:** KPI strips, recent activity feed, and staff QR quick-launch.
*   **Leads & Pipeline:** Table displaying anonymized customers (e.g., `WIN-2025-XXXX`), status tracking (Initiated -> Completed), and estimated budget.
*   **Store Profile & Settings:** Basic co-branding setup (Store Logo), MFA, and location tracking.

### Phase 2: Financials & Marketing
*   **Commission Centre:** Live commission calculator, multi-tier earning breakdown, and payout history.
*   **Marketing Materials:** QR code generator, asset tracker (e.g., "Poster printed on [Date]"), and 1-click reordering.

### Phase 3: Engagement & Analytics
*   **Analytics:** Heat maps (time-of-day scans), tier uplift, and funnel metrics.
*   **WhatsApp Integration:** Opt-in notification system for completed sales, tier upgrades, and weekly digests.

## Finalized Architectural Decisions

1. **Project Repository:** Will be built within the existing Vite repository under a new `/partner` route namespace.
2. **Database Provider:** Supabase (PostgreSQL) will be used for partner authentication, lead storage, and commission tracking.
3. **MVP Focus:** Phase 1 (Dashboard, Leads, Store Profile) is the immediate priority.
4. **WhatsApp BSP:** WhatsApp interactions will be mocked during the initial development phase.
5. **QR Code Engine:** QR codes will be generated natively within the backend/frontend without relying on external services (e.g., using `qrcode.react` or similar library).
