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


