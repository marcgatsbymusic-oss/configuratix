# Cantor Hardware & Safety Options Mapping

This document details how hardware configurations (such as handles, hinge covers, hardware systems, and safety classes) are structured, mapped, and priced within the Cantor database, to be replicated by the web configurator's pricing engine.

## 1. Hardware System & Standard Settings
Hardware systems dictate the base mechanical components inside the profile. By default, profiles use standard Maco Multi-Matic fittings, but this can be overridden.
- **Variables**: `ART_x801_SystemOkuc` (System Name, e.g., "POWER"), `ART_1199_MacierzOku` (Hardware Matrix lookup).
- **Pricing Impact**: Different hardware systems alter base costs and may trigger structural exceptions. For example, selecting the "POWER" system bypasses certain standard "PelneRama" reinforcement surcharges if the matrix (`UD`) doesn't strictly demand it.

## 2. Fitting Safety Class (Security Hardware)
Safety classes govern the number of anti-burglary strikes and security-grade components.
- **Variable**: `AUSFUEHRUNG`
- **Supported Classes**: "STANDARD", "4ZA", "RC1", "RC2", "PAS24", "MAX".
- **Primary Pricing Mechanism (`PREISGRUPPE = 'DOD'`)**:
  The security surcharge dynamically adapts based on the window's opening function (`ANSCHLAG`), executing a lookup via `PMATALL`:
  - `PMATALL(fn_RodzMaterialu()+"_DOD", "RC", "x810", "[Surcharge_Type]", 1, 1)`
  - **Surcharge Types (`ANSCHLAG` mapping)**:
    - **Tilt & Turn** (Codes 5, 6): Uses `RC1_UR` / `RC2_UR`
    - **Turn-Only** (Codes 1, 2): Uses `RC1_R` / `RC2_R`
    - **Tilt-Only** (Codes 4, 8): Uses `RC1_U` / `RC2_U`
    - **HST Lift-and-Slide**: Uses `RC_HST`

- **Secondary Security Triggers (The RC2 Domino Effect)**:
  Upgrading to `RC2` is not just a hardware change; it mandates structural upgrades. The pricing engine automatically triggers:
  1. **Reinforcement Surges**: Upgraded steel in the frame and sash (`WZMOCNIENIE`), priced per perimeter meter using identifiers `RC2Rama` and `RC2Skrz`. Formula: `((BRB*2 + BRH*2) / 1000)`.
  2. **Glass Glueing**: Triggers a mandatory glazing sealant surcharge using `WklejanieRC2` (from group `SZYBY` / `DOD`).

## 3. Handles (Klamki) & Handle Pricing
Handle pricing relies on matching the handle type to profile-specific accessory matrices.
- **Variables**: `ES1512` (Exterior Handle), `ES1532` (Interior Handle).
- **Pricing Mechanism (`PREISGRUPPE = 'DOD_KLAM'`)**:
  - Cantor uses internal SQL functions (`fn_KlamkiTabela`, `fn_KlamkiKolory`, `fn_KlamkiKomplet`) to evaluate the handle combination.
  - It resolves to a matrix lookup: `PMATALL(PROFILSATZ_TYPKLASSE+"_DOD", "KLAM/POCH", "", "STD", 1, [Color_Multiplier])`.
  - Handles not part of the standard catalog for that profile fall back to an `"NSTD"` (Non-Standard) pricing fallback.

## 4. Hardware Aesthetics: Handle and Hinge Cover Colors
To simplify the user experience, Cantor automatically assigns harmonious hardware colors based on the selected profile veneer/color, unless specifically overridden.
- **Variables**: `ES1514` (Exterior Color), `ES1534` (Interior Color).
- **Mapping Table**: `CUSTOM_OKNA_KOLORY_AKCESORIA_PVC` (and corresponding tables for ALU/Wood).
- **Behavior**:
  - The profile color code (`KOD`) dictates default accessory colors.
  - Example - **Biały (White - KOD 0001)**:
    - Hinge Covers (`OSLONKA_ZAW` / `OSLONKA_ROTO`): "bialy"
    - Standard Handle (`KLAMKA_HOPPE`): "bialy"
    - Drainage Caps (`ODWODNIENIA`): "bialy"
  - Example - **Brąz Czekoladowy (Chocolate Brown - KOD 0002)**:
    - Hinge Covers: "braz" (or "szarobraz" for ROTO)
    - Standard Handle: "F4" (Bronze/Old Gold metallic)
    - Drainage Caps: "braz"
- **Web Implementation**: The UI configurator should auto-select these predefined colors from the accessory matrix when a user changes the profile color, updating the `ES1534` field accordingly.
