# Gemini Schema (The Law)

## Maintenance Log
*(For long-term stability and system changes)*
- 2026-04-10: Defined blueprint schemas after extracting `PRODUKTSYSTEME` and `PREISE` from Cantor SQL.

## JSON Data Schema
*(Draft state - Awaiting Confirmation before Coding Phase 2 begins)*

### Input Payload (Expected Raw from Cantor DB via Msnodesqlv8)
The Node.js tools will run SELECT queries and retrieve flat JavaScript objects shaped like:
```json
{
  "systems": [
    {
      "SCHLUESSEL": "I5S",
      "BEZEICHNUNG": "IGLO 5",
      "TYPKLASSE": "S11",
      "PREISGRUPPE": "P_IG5"
    }
  ],
  "formulas": [
    {
      "KEY1": "DRUTEX",
      "BEZEICHNUNG": "Kolor - dopłata",
      "FORMEL": "GRPRS * PMATALL(...)"
    }
  ],
  "articles": [
    {
      "ARTNR": "B100",
      "BEZEICHNUNG": "Profil Pośredni",
      "WERT": 9999
    }
  ]
}
```

### Processed Output Payload (Target Shape for Supabase / App)
This is the structured, transformed JSON payload that will be synced to Supabase (via Vercel/Github integration) to fuel the UI:
```json
{
  "product_systems": [
    {
      "cantor_key": "I5S",
      "name": "IGLO 5",
      "type_class": "S11",
      "pricing_group": "P_IG5",
      "base_price": 0,
      "dimensional_constraints": {
        "min_width": 210,
        "max_width": 1576,
        "min_height": 210,
        "max_height": 3078
      },
      "pricing_rules": [
        {
          "description": "Kolor - dopłata",
          "rule_type": "PERCENTAGE_SURCHARGE",
          "formula_string": "GRPRS * PMATALL(...)",
          "modifier": 0.15 
        }
      ],
      "articles": [
        {
          "article_code": "B100",
          "name": "Profil Pośredni",
          "price_value": 9999
        }
      ]
    }
  ]
}
```

*(Note: Coding Phase 2 and 3 only begins once this payload shape is actively confirmed as final for insertion mapping)*

## Configurator Sorting Mechanics
*(For UI sorting implementations)*
- **Supported Parameters:** Energy Efficiency (uwValue), Sound Insulation (parsed dB value), Profile Depth (mm), and Dynamic Estimated Price (via IDW Matrix Interpolation).
- **Direction Toggle:** Bidirectional (Ascending/Descending) state parameter enabled across all profile rendering modules.

## Agent Operational Rules
*(Strict rules the AI must follow during code editing)*
- **CRITICAL:** Never edit or apply patches to a file without explicitly reading its live contents using the `view_file` tool first. Do not rely on your memory of the file state to prevent accidentally reverting recent user changes.
- **MANUAL CATALOG PROTECTION:** The glass names, handles, and option mappings hardcoded in `src/data/productDetails.ts` and translations (`src/locales/en.json` and `es.json`) have been carefully synchronized with the official Drutex website catalog. If you write any scraping scripts or API sync routines in the future, **DO NOT overwrite these existing catalogs** unless explicitly asked to do so. Treat the manual mappings in these files as the definitive Source of Truth.
- **LOCALIZATION STANDARD:** When generating new product pages or copying content from drutex.eu, all user-facing text (descriptions, taglines, standard equipment lists, hardware/accessory names) MUST be stored as translation keys in the JSON files within `src/locales/` (e.g., `productData.[productName].description`) and rendered using `i18next`'s `t()` function. Do NOT hardcode English or Spanish paragraphs directly into `.ts` or `.tsx` files. Always ensure translations are propagated to all available language JSONs.
- **GASKET SELECTABILITY FOR F100 & F104:** For profiles F100 and F104, the gasket (seal) colors must be selectable from the "8) ---Seals---" configuration step/menu, and the default gasket color for these profiles must be Black (`czarny`).
- **SLE201 HANDLE STANDARDS:** The SLE201 Viewer MUST use the `/sliding_door_handle_IGLS.glb` model for the handle. When the door is closed, the handle must point straight down. When opening, it must turn 180 degrees clockwise. Do not revert or overwrite these settings.
- **F1XXX SASH ROTATION POINT:** The rotation point (pivotZ) for the F1XXX sash must be set exactly at 82mm from the 0 depth origin (i.e. `pivotZ = -82.0 * scale`).
- **DYNAMIC HANDLE HEIGHT (CONSTANT GEAR):** Handle height (`handleY`) must be dynamically calculated from the true 3D sash height (`H / scale`) using a constant gear bucket logic (e.g. 170mm for 380-550mm, 260mm for 550-800mm, 410mm for 800-1200mm, 560mm for 1200-1600mm, 710mm for 1600-1800mm). Balcony doors/doors (classified by typology prefixes like `D`, `DS`, `FS`, `F15`, `F27`, etc.) and sashes over 1800mm get a fixed 1050mm ergonomic height.
- **TILT SCISSOR LIMITATION RULE:** Due to the physical limitation of the top scissor hardware, the window tilt angle must be calculated dynamically using `Math.asin(150 / height)` so that the top of the sash opens a maximum of exactly 150mm, regardless of the overall window height.

## DXF-to-ThreeJS Cross-Section Parsing Rules
*(Valid for vertical AND horizontal cuts. Supersedes ad-hoc per-session logic.)*

### 1. Coordinate Conventions (IGLO 5)
- **Units:** mm
- **Vertical Cut:**
  - X-Axis: Left (EXT/outdoor) -> Right (INT/indoor), i.e., depth direction.
  - Y-Axis: Bottom -> Top, i.e., height of the window.
- **Horizontal Cut:**
  - X-Axis: Left (EXT/outdoor) -> Right (INT/indoor), same depth direction as vertical cut.
  - Y-Axis: Left -> Right across the window width.
- **Note:** EXT is always the LOWER x value, INT is always the HIGHER x value in both cut orientations. Never infer EXT/INT from glazing position alone; confirm against a known gasket or glass layer bbox first.

### 2. Corner Junctions
- **Criticality:** HIGH (prevents gasket overshoot/overlap).
- **Rule:** L-corners (frame, sash, fixed-light corners) must be 45-degree MITRED so adjacent members share one diagonal seam. T-junctions (transom/mullion meeting jambs) must be SQUARE BUTT joints (through-member runs full, abutting member is cut square and stops flush).
- **Gasket Alignment:** Gaskets must be mitred/butted identically to the profile they sit on and share the exact corner point (use `assemblyOrigin`/`anchorPoints`), forming a clean closed rectangular loop with no overrun.
- **Constraint:** Never mitre a T-junction; never run two members full-length into the same corner volume.

### 3. Degraded Source Contours
- **Criticality:** HIGH (prevents force-closing broken profiles with genuine gaps).
- **Rule:** Some source exports contain genuine geometry gaps (mid-profile holes of several mm). Chaining cannot fix these. Measure the residual gap before force-closing; if it exceeds ~0.5mm, flag the layer as DEGRADED and do NOT treat the force-closed result as valid geometry.
- **Repaired Layers:** IG5_F1XXX_1FRM_1SSH GSK_BZD was fragmented but is now REPAIRED in the SHAPES file (registered GSK_BZD_HORIZONTAL directly onto vertical fragment cloud, chamfer fit 0.28mm).
- **Check Loop Report:** Read `_meta.loopReport[layer].status` in each SHAPES file. Render only layers marked OK. Skip or replace any marked DEGRADED.

### 4. Loop Assembly
- **Criticality:** HIGHEST (prevents floating disconnected strips in 3D).
- **Rule:** DXF layers must be chained end-to-end into closed loops by matching segment endpoints within a 0.05mm tolerance. A single layer can resolve to MULTIPLE closed loops (keep them separate, do not merge).
- **Constraint:** NEVER feed raw per-segment geometry into ExtrudeGeometry. The `*_SHAPES.json` file in this handoff has ALREADY been loop-assembled; build one `THREE.Shape` per loop directly. Do NOT re-chain or re-flatten it.

### 5. Nested Insert Flattening
- **Rule:** ALWAYS recursively walk the full INSERT tree and accumulate a single Matrix44 transform chain (`insert.matrix44()` composed at each level) before extracting geometry. NEVER use a single-level `virtual_entities()` call.
- **Mirrored Geometry:** Negative xscale or yscale on an INSERT indicates mirrored child geometry. Apply the transform matrix directly to entity vertices (`entity.transform(m44)`).
- **Closed Polyline Rule:** For POLYLINE/LWPOLYLINE with the closed flag set true, explicitly append the first vertex to the end of the extracted point list if it is not already coincident with the last vertex.

### 6. Dual-Color Seam Transfer
- **Problem:** Some source DXFs (rail cuts) draw sash, frame, or post as a single merged outline without splitting the EXT/INT boundary.
- **Method:**
  1. Locate the equivalent member's ALREADY-SPLIT EXT/INT contours in a reference cut (e.g., vertical JSON).
  2. Determine the affine transform by matching a small, unambiguous reference feature (e.g., EXT gasket bounding box).
  3. Transform the reference contour's two seam endpoints.
  4. Find the nearest points on the target's single merged closed loop to the transformed seam endpoints.
  5. Split the loop into two open arcs at those two indices. Label whichever arc sits on the same side (lower x = EXT, higher x = INT) as the known EXT gasket.
  - **Validation:** Always render the result and visually confirm the split arc shape matches the reference cut's EXT/INT silhouette before accepting it.

### 7. Layer Naming Convention
- **Suffixes:** Vertical suffix: none (e.g., `FRM_EXT`). Horizontal suffix: `_HORIZONTAL` (e.g., `FRM_EXT_HORIZONTAL`).
- **Known Part Aliases:**
  - `słupek`: POST (mullion/stable divider)
  - `skrzydło`: SSH (sash)
  - `listwa`: BZD (glazing bead)
  - `szyba`: GLS (glass)
  - `złożenie`: top-level assembly insert (non-renderable)
- **Rename on Ingest:** Rename output layer to match the physical part block name from the block tree, rather than trusting the literal generic source layer name alone.

### 8. Per-Family Metadata
- **Rule:** Every profile family gets its own `metadata.json` so families can be swapped without touching assembly code.
- **Constraint:** Material colors, gasket part numbers, and glass makeups must be read from `metadata.json`, never hardcoded in the Three.js assembly code.



