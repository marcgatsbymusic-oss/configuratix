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
