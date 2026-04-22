# Window Options & Pricing Mechanisms

This document analyzes how various configuration options (safety classes, grilles, seals, profiles, and dowels) are priced within the Cantor ERP system based on the `PREISE` table formulas.

---

## 1. Fitting Safety Class & Security Options

Safety classes (e.g., standard, 4ZA, RC1, RC2) trigger multiple cascading surcharges, affecting not only the hardware but also the required steel reinforcements and glazing methods.

### A. Hardware Surcharges (`Dopłata za okucie RC1 i RC2`)
The system evaluates the requested execution (`AUSFUEHRUNG` = `RC1` or `RC2`) and the sash type (`ANSCHLAG` - e.g., Tilt-Turn vs Turn-only). It pulls a flat rate from the pricing matrix using `PMATALL`:
*   `PMATALL(fn_RodzMaterialu()+"_DOD", "RC", "x810", "RC1_UR", 1, 1)` -> Applies the RC1 surcharge for a Tilt-Turn sash.

### B. Structural Reinforcement (`Dopłata za wzmocnienie RC2 w ościeżnicy / skrzydle`)
Security classes often require thicker, closed steel reinforcements inside the frame and sash. This is priced linearly based on the perimeter:
*   Formula: `PMATALL("PVC_DOD","WZMOCNIENIE","","RC2Rama",1,1) * ((BRB*2 + BRH*2) / 1000)`
*   *Calculation:* (Frame Width * 2 + Frame Height * 2) in meters * Price per meter of RC2 steel.

### C. Anti-Burglary Catch Kit (`Komplet zabezpieczenia antywyważeniowego`)
Driven by configuration variable `ES1902`. If "J" (Yes), a flat fee is added for the mushroom-cam catch kit.

---

## 2. Grilles / Muntins (Szprosy)

Grilles are priced based on the number of "fields" (panes created by the grid) rather than linear meters.

### A. Internal vs Stick-on Muntins
*   **Internal (`Dopłata za szprosy międzyszybowe`):** Triggered by `ARTNRSP` codes (e.g., `SPR08`, `SPR18`).
*   **Stick-on (`Dopłata za szprosy naklejane`):** Triggered when `ARTNRSP` starts with `SPRN`.

### B. Standard Rectangular Fields
The formula multiplies the number of fields by a matrix price, factoring in whether the grille is single-colored or bi-colored (different color inside vs outside):
*   Formula: `fn_IloscPolSzprosow() * PMATALL("ALL_DOD","SPR","",ARTNRSP, [ColorClass], 1)`
*   *Calculation:* Total Fields * Price per Field (based on width and color).

### C. Diagonal/Arched Fields (`SKOS_LUK`)
If the window has diagonal or arched mullions (`ES2905="J"`), a significantly higher surcharge is applied per field (`ES2915`) using the `"SKOS_LUK"` matrix column.

---

## 3. Seals & Gaskets (`Uszczelki`)

The gasket color (Black, Grey) and type are captured in variable `ES1201`.
*   **Pricing Formula:** `PMATALL("AL_DOD","USZCZ",fn_SystemCeny(),"120884",1,1) * (GESLAENGE_FL/1000)`
*   *Calculation:* Base price per linear meter * Total Sash Perimeter length (`GESLAENGE_FL` in meters).

---

## 4. Glazing / Infill (Dynamic Multi-Sash Arrays)

The system supports independent glazing packages and individual panes per structural field (sash).

### A. Backend Payload (`infills` array)
Instead of a single global `glazing` object, the configurator accepts an `infills` array. For a standard 1-sash window (`F100`), the array contains one object. For a 2-sash window (`F200`), it contains two objects, each defining:
* `code`: The package code (e.g. `2-24.`)
* `panes`: An array of individual pane articles (Outside, Middle, Inside)
* `width_mm` / `height_mm`: Optional overrides for the specific field's dimension.

### B. Pricing Engine Integration (`index.ts` & `context.ts`)
During the `evaluateSchema` execution for field-level pricing (`SCHEMA 45` and `SCHEMA 51`):
1. The engine iterates over `sashCount`.
2. It fetches the corresponding `infills[f]`.
3. It maps `infills[f]` variables (`ARTNRFUELLUNG`, `SCHEIBE_1`, etc.) dynamically into the pricing context for that specific loop.
4. If `width_mm` or `height_mm` is provided, it calculates `GLASB`/`GLASH`/`BRB` specifically for that field, bypassing the default `totalWidth / sashCount`.

---

## 5. Profile Options

### A. Frame Reinforcement (`Wzmocnienie pełne`)
If a user upgrades to a closed/full steel reinforcement (`ART_x801_Wzm_Ram="2"`), Cantor charges by the frame perimeter.
*   **Formula:** `PMATALL("PVC_DOD","WZMOCNIENIE","","PelneRama",1,1) * ((BRB*2+BRH*2)/1000)`
*   **Price:** ~13 EUR per linear meter of the frame perimeter.

### B. Glazing Bead Style (`Listwa przyszybowa`)
If the user selects a non-standard rectangular glazing bead (`ART_1199_GL_Stil="P"`), the system may apply a percentage surcharge to the base group price (`GRPRS/100`), though this is often zeroed out for standard systems like Iglo 5.

### C. Thresholds (`Dopłata za próg / ciepły próg`)
Warm thresholds (e.g., aluminum/thermal breaks for doors) are priced per linear meter based on the width of the element.
*   Formula: `PMATALL(PROFILSATZ_TYPKLASSE+"_DOD", "PRG_NAS", ... ) * (BRB/1000)`
*   *Calculation:* Price per meter * Window/Door Width in meters.

### D. Welding Type (`Dopłata za typ zgrzewu`)
Modern invisible welds (like V-Perfect) are calculated as a global multiplier against the base price of the window.
*   Formula: `(GRPRS + AKTZUSCHLAG1) * fn_CenaDopZgrzew()`
*   *Calculation:* (Base Price + Base Surcharges) * V-Perfect Multiplier (e.g., 5% increase).

---

## 5. Dowel Holes / Installation Prep (`Dyblowanie`)

If the factory pre-drills installation holes (e.g., `ES1291` = `O_14-16` or `ADJUFIX_14/18`), a flat fee or per-hole fee is applied via the `DYBLE` matrix.
*   Formula: `PMATALL("PVC_DOD","DYBLE","",ES1291,1,1)`
*   Specific customer groups (e.g., `KUNDENNR` matrix) get percentage discounts (`1-fn_PRICE_GROUPS`) on these drilling fees.
