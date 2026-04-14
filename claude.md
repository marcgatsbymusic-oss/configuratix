# Project Constitution (Claude)

## Project Map & State Tracking

### 1. Data Schemas
*(See `gemini.md` for strict JSON Input/Output definitions)*
- **Source**: Cantor SQL Server (Read-only access)
- **Target**: Supabase / JSON payload for application

### 2. Behavioral Rules
- **READ ONLY:** NEVER EVER write to the Cantor SQL Server database. All connections and queries must be strictly limited to `SELECT` operations.
- **DETERMINISM:** Do not guess at business logic. If a relationship between window profiles and pricing is unclear, halt and update the Architecture SOP logically.
- **DEPLOYMENT:** Final logic should be pushed via GitHub and deployed on Vercel.

### 3. Architectural Invariants
- 3-Layer Architecture (SOPs -> Navigation -> Tools)
- Payload data structure is Law
