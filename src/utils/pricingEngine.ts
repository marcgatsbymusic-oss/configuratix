/**
 * Drutex Configurator Pricing Engine
 *
 * Uses Inverse Distance Weighting (IDW) interpolation across real Cantor price
 * anchor points to estimate frame prices at any width/height combination.
 *
 * Total price formula:
 *   frame_price  = IDW interpolation from Cantor price matrix anchors
 *   glazing_cost = glazingRate (€/m²) × glass_area (m²)
 *   color_cost   = frame_price × colorSurchargeRate
 *   addon_cost   = sum of selected addon prices
 *   ---
 *   TOTAL        = frame_price + glazing_cost + color_cost + addon_cost
 *
 * To update pricing: run node scripts/extractAllPricing.mjs && node scripts/buildCantorPricing.mjs
 *
 * --- Namespace note ---
 * There are TWO different Cantor ID systems that must NOT be confused:
 *
 *   1. Typology IDs (window unit codes) — F100, F101, F102, F200, F300, D100 …
 *      These come from PRODUKTTYPEN and describe the visual layout (sashes, fixed lights, etc.)
 *
 *   2. Opening class IDs (what the price matrix is keyed on) — DK, UR, F100, PSK, DOOR, HS
 *      These come from PREISMAT.KLASSE1 and describe the opening BEHAVIOUR.
 *
 *   The only overlap is `F100` which is coincidentally both a typology AND the fixed-pane class.
 *   All other typology codes must be RESOLVED to an opening class before hitting the matrix.
 *   Use resolveOpeningClass() for this translation.
 */

import { GLAZING_RATES, COLOR_SURCHARGE, type PriceAnchor } from '../data/cantorPricingData';
import { CONFIG_SCHEMA } from '../components/SlateConfigurator/types';
import cantorMatrices from '../data/cantorPricingMatrices.json';

// Full Cantor price matrix (extracted from PREISMAT via extractAllPricing.mjs)
const FULL_MATRIX = cantorMatrices as Record<string, Record<string, Array<{w: number, h: number, price: number}>>>;

const IDW_POWER = 2; // Shepard's method: distance^2 weighting — industry standard

// ---------------------------------------------------------------------------
// Opening class resolver
//
// Translates sash opening selections (o1–o6) into the Cantor PREISMAT opening
// class used to index the price matrix. The "most complex" opening wins.
//
// Priority order (most complex → simplest):
//   DK  = Dreh-Kipp / Dreh  (o2, o3, o4, o5)
//   UR  = Kipp only          (o6)
//   F100 = Fixed pane        (o1 / default)
// ---------------------------------------------------------------------------
const SASH_TO_CLASS: Record<string, string> = {
  o1: 'F100', // Festverglasung — fixed pane
  o2: 'DK',   // Dreh-Kipp links
  o3: 'DK',   // Dreh-Kipp rechts
  o4: 'DK',   // Dreh links
  o5: 'DK',   // Dreh rechts
  o6: 'UR',   // Kipp
};

const CLASS_PRIORITY: Record<string, number> = {
  DK:   3,
  UR:   2,
  F100: 1,
};

/**
 * Resolves the Cantor opening class from the user's sash opening selections.
 *
 * @param sashOpenings - Array of sash opening IDs (e.g. ['o2', 'o1'])
 * @returns Cantor opening class string: 'DK' | 'UR' | 'F100'
 */
export function resolveOpeningClass(sashOpenings: string[]): string {
  if (!sashOpenings || sashOpenings.length === 0) return 'DK';

  let bestClass = 'F100';
  let bestPriority = 0;

  for (const openingId of sashOpenings) {
    const cls = SASH_TO_CLASS[openingId] ?? 'F100';
    const priority = CLASS_PRIORITY[cls] ?? 0;
    if (priority > bestPriority) {
      bestPriority = priority;
      bestClass = cls;
    }
  }

  return bestClass;
}

// ---------------------------------------------------------------------------
// Core: Inverse Distance Weighted interpolation
// ---------------------------------------------------------------------------
function idwInterpolate(anchors: PriceAnchor[], w: number, h: number): number {
  // Check for exact match first (returns Cantor exact price)
  const exact = anchors.find(a => a.w === w && a.h === h);
  if (exact) return exact.price;

  // IDW: weighted average where closer anchors have much more influence
  let weightedSum = 0;
  let totalWeight = 0;

  for (const anchor of anchors) {
    // Euclidean distance in mm-space
    const dist = Math.sqrt((anchor.w - w) ** 2 + (anchor.h - h) ** 2);

    // Protect against division by zero (shouldn't happen after exact check above)
    if (dist < 0.001) return anchor.price;

    const weight = 1 / (dist ** IDW_POWER);
    weightedSum += weight * anchor.price;
    totalWeight += weight;
  }

  return weightedSum / totalWeight;
}

// ---------------------------------------------------------------------------
// Frame Price (profile skeleton without glazing)
//
// IMPORTANT: Do NOT fall back across profiles. Each profile's matrix reflects
// its own Cantor pricing group. Cross-profile fallback would produce identical
// prices for profiles with different price levels (e.g. iglolight vs iglo5).
// Within a profile, we fall back to simpler opening classes if needed:
//   DK requested → try DK, then F100, then UR
//   UR requested → try UR, then F100
//   F100 requested → try F100, then DK
// ---------------------------------------------------------------------------
const OPENING_CLASS_FALLBACK: Record<string, string[]> = {
  DK:   ['DK',   'UR',   'F100'],
  UR:   ['UR',   'F100', 'DK'],
  F100: ['F100', 'DK',   'UR'],
  PSK:  ['PSK',  'DK',   'F100'],
  HS:   ['HS',   'PSK',  'F100'],
  DOOR: ['DOOR', 'DK',   'F100'],
};

export function estimateFramePrice(
  profileId: string,
  openingClass: string,
  width_mm: number,
  height_mm: number
): number {
  const profileMatrix = FULL_MATRIX[profileId];

  if (profileMatrix) {
    // Try opening class in priority order — stay within this profile's data only
    const fallbackOrder = OPENING_CLASS_FALLBACK[openingClass] ?? [openingClass, 'DK', 'F100', 'UR'];
    for (const cls of fallbackOrder) {
      const anchors = profileMatrix[cls];
      if (anchors && anchors.length >= 5) {
        // Filter out sentinel prices (Cantor uses 9999 / 1000 as placeholders for unavailable sizes)
        const clean = anchors.filter(a => a.price < 5000);
        if (clean.length >= 5) {
          return idwInterpolate(clean, width_mm, height_mm);
        }
      }
    }
  }

  // Last resort: regression formula derived from IGLO 5 Cantor data
  // (covers profiles not yet extracted from Cantor)
  const area = (width_mm * height_mm) / 1e6;
  const basePerSqm = CONFIG_SCHEMA.categories['Windows']?.basePricePerSqm ?? 150;
  return Math.max(105.41 + 95.82 * area, basePerSqm * area);
}

// ---------------------------------------------------------------------------
// Glazing Cost
// ---------------------------------------------------------------------------
export function estimateGlazingCost(glazingId: string, width_mm: number, height_mm: number): number {
  const area = (width_mm * height_mm) / 1e6;
  const rateEntry = GLAZING_RATES.find(r => r.id === glazingId);

  if (!rateEntry) {
    // Unknown package — use a reasonable default (triple 36mm rate)
    return 80 * area;
  }

  return rateEntry.ratePerM2 * area;
}

// ---------------------------------------------------------------------------
// Color Surcharge
// ---------------------------------------------------------------------------
export function estimateColorSurcharge(
  framePrice: number,
  interiorColor: string,
  exteriorColor: string
): number {
  const WHITE_CODES = ['0001', '9016', 'white', '-', ''];

  const intIsWhite = WHITE_CODES.includes(interiorColor?.toLowerCase() ?? '');
  const extIsWhite = WHITE_CODES.includes(exteriorColor?.toLowerCase() ?? '');

  if (intIsWhite && extIsWhite) return 0;

  // Two-tone: different colors interior vs exterior
  if (!intIsWhite && !extIsWhite && interiorColor !== exteriorColor) {
    return framePrice * COLOR_SURCHARGE.two_tone;
  }

  // Check if metallic / effect color (rough detection by code prefix/suffix)
  const activeColor = !intIsWhite ? interiorColor : exteriorColor;
  const isMetallic = /^c2[01]\d$|metallic|effect/i.test(activeColor);
  const isWoodFoil = /wood|oak|teak|dab|walnut/i.test(activeColor);

  if (isWoodFoil) return framePrice * COLOR_SURCHARGE.wood_foil;
  if (isMetallic) return framePrice * COLOR_SURCHARGE.metallic;

  return framePrice * COLOR_SURCHARGE.standard_color;
}

// ---------------------------------------------------------------------------
// Main: Full price calculation
// ---------------------------------------------------------------------------
export interface PricingBreakdown {
  frame: number;
  glazing: number;
  color: number;
  addons: number;
  subtotal: number;
  vat: number;
  total: number;
}

export function calculatePrice(
  profileId: string,
  openingClass: string,   // MUST be a Cantor opening class: DK | UR | F100 | PSK | HS | DOOR
  width_mm: number,
  height_mm: number,
  glazingId: string,
  interiorColor: string,
  exteriorColor: string,
  addonPrices: number[]
): PricingBreakdown {
  const frame = estimateFramePrice(profileId, openingClass, width_mm, height_mm);
  const glazing = estimateGlazingCost(glazingId, width_mm, height_mm);
  const color = estimateColorSurcharge(frame, interiorColor, exteriorColor);
  const addons = addonPrices.reduce((sum, p) => sum + p, 0);

  const subtotal = frame + glazing + color + addons;
  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  return {
    frame: Math.round(frame * 100) / 100,
    glazing: Math.round(glazing * 100) / 100,
    color: Math.round(color * 100) / 100,
    addons: Math.round(addons * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}
