# Cantor Handle Codes & Pricing Options

This document outlines the standard and premium handle configurations extracted from the Cantor ERP system for Drutex IGLO 5 series, including their pricing surcharges, system codes, and presentation logic.

## Selectable Handle Codes

The following are the exact `ES1532` (Handle Type) codes passed to the pricing engine and their corresponding descriptions:

| Code | Description | Tier |
| :--- | :--- | :--- |
| `-` | No holes for spindle and mounting screws | Tier 0 |
| `ALU_A` | Aluminum handle I5 / IL (FKS model 1006) | Tier 0 |
| `ALU_AK` | Aluminum handle I5 / IL with key (FKS model 1006A) | Tier 2 |
| `ALU_AP` | Aluminum handle I5 with a button (FKS model 1006D) | Tier 2 |
| `Atlanta` | Hoppe handle Secustic Atlanta | Tier 1 |
| `Kwadrat` | Aluminium handle Square | Tier 0 |
| `KwadratK` | Aluminium handle Square with key | Tier 2 |
| `Mistral` | Aluminium handle Mistral | Tier 1 |
| `MistralK` | Aluminium handle Mistral with key | Tier 2 |
| `AtlantaK` | Hoppe handle Secustic Atlanta with key | Tier 3 |
| `AtlantaP` | Hoppe handle Secustic Atlanta with button | Tier 3 |
| `Toulon` | Hoppe handle Secustic Toulon | Tier 1 |
| `ToulonSF` | Hoppe handle Secuforte Toulon | Tier 3 |
| `Hamburg` | Hoppe handle Secustic Hamburg | Tier 1 |
| `HamburgSF` | Hoppe handle Secuforte Hamburg | Tier 3 |
| `Tokyo` | Hoppe Tokyo handle + KISI (child safety lock) | Tier 4 |
| `ALU_B` | Aluminium handle IE | Tier 0 |
| `ALU_BK` | Aluminum handle IE with key - (FKS model 1007A) | Tier 2 |
| `Dublin` | Aluminum handle DUBLIN | Tier 1 |
| `DublinK` | Aluminum handle DUBLIN with key | Tier 3 |
| `DublinP` | Aluminum handle DUBLIN with button | Tier 3 |
| `ALUR` | Flat window handle (roller shutter) | Tier 4 |
| `ATESTK` | Window handle with key - ATEST | Tier 4 |
| `ALUW` | Aluminum pull handle "conductor" | Tier 4 |
| `MA_1010` | MA 1010 stainless steel window handle | Tier 4 |

## Pricing Mechanism

In the Cantor ERP system, handles are evaluated against the `PREISMAT` matrix using the `PMATALL` function:
`PMATALL(PROFILSATZ_TYPKLASSE+"_DOD", "KLAM/POCH", "", "STD", 1, [Color_Multiplier])`

Since these opaque database hashes map strictly to pricing groups, we enforce explicit tiered pricing mechanisms within `CantorPricing/index.ts` applied per sash:

1. **Tier 0 (Standard - €0.00)**: `ALU_A`, `ALU_B`, `Kwadrat`, `-`
2. **Tier 1 (Premium Standard - €5.00)**: `Atlanta`, `Toulon`, `Hamburg`, `Mistral`, `Dublin`
3. **Tier 2 (Keyed Standard - €15.00)**: `ALU_AK`, `ALU_BK`, `KwadratK`, `MistralK`
4. **Tier 3 (Premium Keyed / Button - €20.00)**: `AtlantaK`, `AtlantaP`, `ToulonSF`, `HamburgSF`, `DublinK`, `DublinP`
5. **Tier 4 (Specialty - €30.00)**: `MA_1010`, `Tokyo`, `ALUR`, `ATESTK`, `ALUW`

## Visual Presentation

83 presentation images have been synced directly from the Drutex Web Server into `/public/assets/handles/`. 
To guarantee high-quality presentation logic in the UI configurator, the image fallback chain enforces **White as the primary baseline** (`white`, `ral9016`, or `ral9001`) whenever the user has not overridden the interior handle color.

### Fallback Chain Architecture
When rendering the handle preview `<img />`, the UI sequentially attempts to load:
1. Exact match (`[HandleCode]_[UserSelectedColor].webp`)
2. `[HandleCode]_white.webp`
3. `[HandleCode]_ral9016.webp` (Pure White)
4. `[HandleCode]_ral9001.webp` (Cream White)
5. `[HandleCode]_f1.webp` (Silver)
6. `[HandleCode]_silver.webp`
7. `[HandleCode]_f4.webp` (Bronze)
8. `[HandleCode]_default.webp`
