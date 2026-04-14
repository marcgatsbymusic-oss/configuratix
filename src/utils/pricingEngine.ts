/**
 * Drutex Configurator Pricing Engine
 *
 * Uses Inverse Distance Weighting (IDW) interpolation across real Cantor price
 * anchor points to estimate frame prices at any width/height combination.
 *
 * Total price formula:
 *   frame_price  = IDW interpolation from CANTOR_PRICING anchors
 *   glazing_cost = glazingRate (€/m²) × glass_area (m²)
 *   color_cost   = frame_price × colorSurchargeRate
 *   addon_cost   = sum of selected addon prices
 *   ---
 *   TOTAL        = frame_price + glazing_cost + color_cost + addon_cost
 *
 * To update pricing: add anchors to cantorPricingData.ts or run
 *   node scripts/extractCantorPricing.mjs
 */

import { CANTOR_PRICING, GLAZING_RATES, COLOR_SURCHARGE, type PriceAnchor } from '../data/cantorPricingData';
import { CONFIG_SCHEMA } from '../components/SlateConfigurator/types';
import cantorMatrices from '../data/cantorPricingMatrices.json';

// Full Cantor price matrix (extracted from PREISMAT via extractAllPricing.mjs)
const FULL_MATRIX = cantorMatrices as Record<string, Record<string, Array<{w: number, h: number, price: number}>>>;

const IDW_POWER = 2; // Shepard's method: distance^2 weighting — industry standard

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
// ---------------------------------------------------------------------------
export function estimateFramePrice(
  profileId: string,
  openingTypeId: string,
  width_mm: number,
  height_mm: number
): number {
  // 1. Try the full real Cantor matrix first (highest quality data)
  const profileMatrix = FULL_MATRIX[profileId];
  if (profileMatrix) {
    // Map frontend opening codes to Cantor opening classes
    // Try the exact opening, then fall back to F100, then DK
    const openingFallbackOrder = [openingTypeId, 'F100', 'DK', 'UR'];
    let anchors: Array<{w: number, h: number, price: number}> | null = null;
    for (const ot of openingFallbackOrder) {
      if (profileMatrix[ot] && profileMatrix[ot].length > 5) {
        anchors = profileMatrix[ot].filter(a => a.price < 5000); // filter sentinel values
        break;
      }
    }
    if (anchors && anchors.length > 0) {
      return idwInterpolate(anchors, width_mm, height_mm);
    }
  }

  // 2. Fall back to manual anchor table (for profiles not yet in full matrix)
  const profileData = CANTOR_PRICING[profileId];
  if (profileData) {
    const openingData = profileData[openingTypeId] ?? profileData['F100'];
    if (openingData && openingData.length > 0) {
      return idwInterpolate(openingData, width_mm, height_mm);
    }
  }

  // 3. Last resort: regression formula derived from IGLO 5 Cantor data
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
  openingTypeId: string,
  width_mm: number,
  height_mm: number,
  glazingId: string,
  interiorColor: string,
  exteriorColor: string,
  addonPrices: number[]
): PricingBreakdown {
  const frame = estimateFramePrice(profileId, openingTypeId, width_mm, height_mm);
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
