# Findings

## Research, Discoveries, Constraints
*(Store all technical and project discoveries here)*

### Cantor Database Analysis (Local SQL Server)
1. **PRODUKTSYSTEME Table**  
   - Key Columns: `SCHLUESSEL` (e.g. "I5S"), `BEZEICHNUNG` (e.g. "IGLO 5"), `TYPKLASSE` (e.g. "S11"), `PREISGRUPPE` (Pricing Group)
   - Function: Defines the main window profile systems (e.g., IGLO 5, IGLO LIGHT).

2. **PROFILING Table**
   - Key Columns: `ID`, `SYSTEM_ID`, `PROFILTYP`, `GRUPPE`, `NAME`, `FORMEL` (contains logic for pricing modifiers).
   - Function: Details specific profiling components and rules for each system.

3. **PREISE Table**
   - Key Columns: `BEZEICHNUNG` (Price type/description), `KEY1`, `KEY2`, `FORMEL` (e.g., `GRPRS * PMATALL(...) / 100`).
   - Function: Contains the dynamic pricing formulas (like color surcharges).

4. **ARTIKEL & ARTPREISE Tables**
   - Key Columns: `ARTIKELID`, `ARTNR`, `BEZEICHNUNG`, `PRODUKTTYP`, `PREISSCHEMAID`, `WERT`.
   - Function: Holds dimensional constraints (`MINBREITE`, `MAXBREITE`) and flat baseline prices.

### Constraints & Rules
- Supabase mapping will involve structured JSON that can be consumed by specific RPC or inserted into `price_matrices` and `window_options` type tables.
- Pricing heavily relies on parsing `FORMEL` (formula strings). The target payload will need to break down these formulas into standardized percentage/fixed multipliers for the React configurator.
