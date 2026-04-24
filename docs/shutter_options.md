# Cantor Shutter Integration Plan

This document details the configuration fields, dependencies, and UI rendering logic for the new Shutter configuration module in the web configurator.

## Proposed Changes to the Configurator

We will implement a massive expansion of the Shutter options within the `/debug-pricing` page. The following sections will be structured as interactive UI blocks with exact state mapping.

### 1. ---Shutter options---
- **Roller blind Type**: Standard dropdown to select system type (e.g., RNV, RA).
- **Window screen**: Dropdown for screen options (Mosquito net).
- **Window screen location**: Dependency dropdown (only shows if Window Screen is selected).

### 2. ---Pancerz (Curtain)---
- **Curtain type**: Dropdown with lookup table (e.g., ALU37, ALU42, ALU55) and dynamic image preview.
- **Fins perforation**: Dropdown with lookup table.
- **Curtain color**: Dropdown mapped to PVC color palettes.
- **Bottom slat colour**: Dropdown mapped to PVC color palettes.
- **Window screen bottom slat colour**: Dropdown mapped to PVC color palettes.

### 3. ---Service - Field I---
- **Drive Type**: Dropdown mapping Type: 01 through Type: 09 with automatic image extraction/rendering for the selected drive.
- **Control side**: Dropdown (Left / Right / Default).

### 4. ---Service---
- **Door checks Type I**: Dropdown with lookup tables.
- **Impose 60mm arbour**: Checkbox boolean field.

### 5. ---Box---
- **Box Type**: Dropdown with lookup tables and image previews.
- **Outer box colour**: Dropdown reusing existing PVC colors with image swatches.
- **otherr box colour**: Dropdown reusing existing PVC colors with image swatches.
- **Plaster carrier**: Dropdown with lookup tables and image previews.
- **Flush-mounted slat (in)**: Checkbox.
  - *Dependency*: Opens **Flush-mounted slat colour (in)** dropdown if checked.
- **Flush-mounted slat (out)**: Checkbox.
  - *Dependency*: Opens **Flush-mounted slat colour (out)** dropdown if checked.
- **Review**: Dropdown lookup table.
- **Side cover cap colour**: Dropdown options with check dependency.

### 6. ---Guide rails---
- **Guide rails colour**: Dropdown reusing existing PVC colors.
- **Guide rails cutting**: Dropdown lookup.
- **Extreme left guide rail**: Dropdown lookup.
- **Extreme right guide rail**: Dropdown lookup.
- **Guide rails Types**: Dropdown restricted to (PVC, ALU).

### 7. ---Other---
- **Guide rail gasketing**: Checkbox boolean field.
- **Soundproof mat + gasket**: Checkbox boolean field.

---

## Pricing Options & Mechanisms Extracted

Based on our Cantor SQL database analysis, shutter pricing relies heavily on area (Width × Height) combined with flat surcharges from PMATALL matrices:

- **Base Price (`Cena bazowa rolety`)**: Calculated based on the Roller Blind Type (`ES1000`), utilizing height thresholds (`ROLLLADENFELD_HOEHE`) and the exact matrix table mapped to the selected system.
- **Curtain Type Surcharge (`Dopłata za typ pancerza`)**: Computed using `PMATALL("ROL_DOD","TYP_PANCERZA","",ES1200,1,1)` multiplied by the exact area (`ES1011/1000 * ES1021/1000`) of the shutter fields.
- **Curtain Color Surcharge**: Standard curtains assume default colors. Upgrading to specific colors (e.g., `ES1400` = `R52`) triggers a surcharge via `PMATALL("ROL_DOD","KOLOR_PAN")` multiplying the base price.

