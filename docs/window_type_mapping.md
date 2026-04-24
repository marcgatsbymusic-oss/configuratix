# Window Opening / Type Mapping

This document tracks the effort to map the physical window typology images to the fields in the configurator, specifically for "1) Product Number (Window opening/type)".

## Goal
Establish a 1:1 mapping between the Cantor database's window type designations (TYP / F-numbers) and the high-resolution images provided in the external assets directory, so that the UI can accurately render the selected window opening type.

## Source Images Directory
Location: `C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\Window & Balcony Types\Windows\High Res images`

## Available Images

### 1-Sash Windows (F100 Series)
- `F100.jpg`
- `F101.jpg`
- `F102.jpg`
- `F103.jpg`
- `F104.jpg`
- `F105.jpg`
- `F106.jpg`

### 2-Sash Windows (F200 Series)
- `F200.jpg`
- `F201.jpg`
- `F202.jpg`
- `F203.jpg`
- `F204.jpg`
- `F205.jpg`
- `F206.jpg`
- `F207.jpg`
- `F208.jpg`
- `F250.jpg`
- `F251.jpg`
- `F252.jpg`
- `F253.jpg`
- `F254.jpg`
- `F255.jpg`

### 3-Sash Windows (F300 Series)
- `F300.jpg`
- `F301.jpg`
- `F302.jpg`
- `F303.jpg`
- `F304.png`
- `F354.jpg`
- `F355.jpg`

### Miscellaneous
- `high res images for svgs.zip`

## To-Do / Action Items

- [ ] **Image Analysis:** Review each image to determine its exact opening configuration (e.g., F100 = Fixed, F101 = Turn, F102 = Tilt & Turn, F200 = Double sash Tilt & Turn / Turn, etc.).
- [ ] **Cantor DB Verification:** Query the Cantor database (likely the `TYP` column or related typology definitions) to confirm what F-number corresponds to what internal ID or behavior.
- [ ] **Metadata Mapping:** Create a JSON or TypeScript structure mapping each F-code to its UI metadata (sash count, valid openings per sash, dimensions).
- [x] **Asset Migration:** Define a script or strategy to move/convert these images into the Vite project's `/public` or `src/assets` folder with standardized naming.
- [x] **UI Integration:** Update the configurator step "1) Product Number (Window opening/type)" to consume this new mapping and dynamically display the correct images as options.

## UI Implementation Notes (2026-04-24)

1. **High-Res Priority Loading:**
   The `DebugPricing.tsx` component was refactored to prioritize loading `.jpg` and `.png` image formats over the default vector `.svg` files. This ensures the user instantly sees high-fidelity product renders (e.g. `F100.jpg`) instead of simple wireframe outlines. The fallback chain behaves as follows: `.jpg` -> `.png` -> `.svg`.

2. **SVG Visibility Bug Fix:**
   A critical visual bug occurred because Cantor's source `.svg` files (e.g., `F100.svg` to `F453.svg`) render shapes using white strokes on a transparent canvas. Previously, these were rendered on a `bg-white` container, making them completely invisible. The image container background has been updated to `bg-black`, restoring full visibility to the fallback vector wireframes.

3. **Dynamic Hover Zoom:**
   A `group-hover:scale-[2.5]` transition effect was added to all typography/opening thumbnails. Users can now comfortably examine the detailed window configurations simply by hovering over them in the UI dropdown or the main selected option container.
