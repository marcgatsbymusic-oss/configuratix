# Cantor Glazing & Pricing Architecture

This document outlines how glazing packages (glass and panels) map to the product lines (`PRODTYP`) in the Cantor ERP system and details the exact mathematical formulas used to price them.

## 1. Profile to Glazing Relationship
In Cantor, the linkage between a window profile (e.g., `IG5` - Iglo 5) and the allowed glazing packages is not defined by a simple mapping table. Instead, it is governed by **Glazing Bead (Glasleiste) capacities** and **Base Glass Definitions**.

### A. The "Base Glass" Concept
Every profile system has a hardcoded default glass package that is considered the "Base" (`Cena Szyby Bazowej`). 
*   **Standard Profiles (e.g., Iglo 5 / 1100):** Default to a standard 2-pane 24mm package (`2-24`).
*   **Premium Profiles (e.g., Iglo Energy / 1300):** Default to a 3-pane 48mm package (`3-48`).

### B. Physical Thickness Limits (Einbaustärke)
A profile cannot accept just any glass. The total thickness (e.g., `2-24` = 24mm, `3-48` = 48mm) must fit within the frame rebate. 
*   If a user selects `IG5` (Iglo 5), the system will reject `3-48` because the maximum glazing thickness for the Iglo 5 sash is 40mm.
*   If the user selects an ALU profile (e.g., MB-86N), it can accept up to 68mm packages (e.g., `4-68`).

---

## 2. The Pricing Mechanism
The database calculates glass prices using parametric formulas in the `PREISE` table. Rather than a flat fee, glass is calculated per square meter, with dynamic minimums and pane-level surcharges.

### A. The Area Calculation & Minimum Billable Surface
All glass pricing formulas start by calculating the square meter area of the exact sash light (hole):
`MAX(ROUND(B/1000 * H/1000, 2), 0.5)`
*   `B` = Width in mm.
*   `H` = Height in mm.
*   **The 0.5 Rule:** The system applies a hard minimum of **0.5 m²**. If a small bathroom window is 0.3 m², the customer is still charged for 0.5 m² of glass.

### B. The Base Price Formula
The base price for the default glass is calculated as:
`Area * fn_CenaSzybyBazowej(PROFILSATZ)`
*(This pulls the base €/m² rate for the specific profile system).*

### C. The Surcharge Formula (`fn_CenaSzyby`)
If the customer deviates from the base glass (e.g., upgrades to tinted, safety, or triple glazing), the system uses the `fn_CenaSzyby()` function to loop over the individual panes (`SzybaZ` = exterior, `SzybaS` = middle, `SzybaW` = interior):

```sql
IIF(ART_1200_IloscSzyb = 2,
  /* For 2-pane windows: evaluate outer and inner panes */
  ((fn_CenaSzyby(ART_1200_SzybaZ,74,11) + fn_CenaSzyby(ART_1200_SzybaW,74,11)) * 0.5),
  /* For 3-pane windows: evaluate all three panes */
  ((fn_CenaSzyby(ART_1200_SzybaZ,74,11) + fn_CenaSzyby(ART_1200_SzybaS,74,11) + fn_CenaSzyby(ART_1200_SzybaW,74,11)) * 0.5)
)
```

### D. Panel / Non-Glass Fillings
If the customer selects a solid panel (e.g., `PCW24`, `ALU22`), a two-step formula triggers:
1.  **Rezygnacja (Resignation):** A negative formula subtracts the base glass price.
    `IIF(PREISFELD11<0, MAX(ROUND(B/1000 * H/1000,2), 0.5) * PREISFELD11, 0)`
2.  **Panel Surcharge:** A massive `SWITCH` statement checks the window's color (`W-W`, `DEK-DEK`) and applies the appropriate price multiplier for that specific panel material.

---

## 3. Key Glazing Categories (from `cantor-glazing-options.md`)

Based on the extracted `CUSTOM_SZYBY` data, the configurator must categorize the available `ARTNR` codes logically for the UI:

| Category | Typical Thickness | Examples | Use Case |
| :--- | :--- | :--- | :--- |
| **Standard 2-Pane** | 18mm - 40mm | `2-24`, `2-26` | Budget PVC lines (Iglo 5) |
| **Standard 3-Pane** | 30mm - 50mm | `3-36`, `3-48` | Premium PVC / Standard ALU |
| **Thick / 4-Pane** | 58mm - 68mm | `4-58`, `4-68` | Passive House / Deep ALU frames |
| **Safety / Laminated**| Varies | `VSG`, `33.1`, `44.4` | Anti-burglary / Fall protection |
| **Acoustic** | Varies | `SR9` (44.2 SR) | High noise-reduction requirements |
| **Fire Resistant** | Varies | `PEI30`, `GEI60` | Commercial / Fire codes |
| **Solid Panels** | 22mm - 48mm | `ALU22`, `PCW24` | Doors / Opaque lower sections |

### Dimensional Limitations (`CUSTOM_SZYBY_OGRANICZENIA`)
In addition to profile limitations, Cantor enforces safety limitations on the glass itself:
*   4mm non-tempered glass (`GR_SZYBY: 4`, `ESG: 0`) cannot exceed **3.5 m²** or **1850mm** on the short side.
*   If tempered (`ESG: 1`), 4mm glass can stretch to **4.5 m²**.
*   6mm and 8mm glass allow for massive panoramic panes (up to 4.5m x 2.8m).
*   If the user draws a window exceeding these dimensions, the configurator must automatically force an upgrade to a thicker or tempered (`ESG`) pane to match the Cantor logic.
