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
import iglo5Data from '../data/iglo5_data.json';

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
  o1: 'F',    // Festverglasung — fixed pane
  o2: 'UR',   // Dreh-Kipp (Uchylno-Rozwierne)
  o3: 'UR',   // Dreh-Kipp 
  o4: 'R',    // Dreh (Rozwierne)
  o5: 'R',    // Dreh
  o6: 'U',    // Kipp (Uchylne)
};

const CLASS_PRIORITY: Record<string, number> = {
  F:    1,
  U:    2,
  R:    3,
  UR:   4,
  HS:   5,
  PSK:  6,
};

/**
 * Resolves the Cantor opening class from the user's sash opening selections.
 *
 * @param sashOpenings - Array of sash opening IDs (e.g. ['o2', 'o1'])
 * @returns Cantor opening class string: 'DK' | 'UR' | 'F100'
 */
export function resolveOpeningClass(sashOpenings: string[]): string {
  if (!sashOpenings || sashOpenings.length === 0) return 'F';

  let bestClass = 'F';
  let bestPriority = 0;

  for (const openingId of sashOpenings) {
    const cls = SASH_TO_CLASS[openingId] ?? 'F';
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
  UR:   ['UR',   'R',  'U', 'F'],
  R:    ['R',    'UR', 'U', 'F'],
  U:    ['U',    'UR', 'R', 'F'],
  F:    ['F',    'U',  'UR'],
  PSK:  ['PSK',  'UR', 'F'],
  HS:   ['HS',   'PSK', 'F'],
  DOOR: ['DOOR', 'UR', 'F'],
};

export function estimateFramePrice(
  profileId: string,
  openingClass: string,
  width_mm: number,
  height_mm: number
): number {
  // Map frontend Product IDs to Cantor Matrix keys
  const matrixKeyMap: Record<string, string> = {
    'p5': 'iglo5',
  };
  
  const mappedProfileId = matrixKeyMap[profileId] || profileId;
  const profileMatrix = FULL_MATRIX[mappedProfileId];

  if (profileMatrix) {
    // Try opening class in priority order — stay within this profile's data only
    const fallbackOrder = OPENING_CLASS_FALLBACK[openingClass] ?? [openingClass, 'UR', 'F', 'U'];
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
// Native Cantor GRPRS (Grundpreis) Lookup (Phase 2)
// Designed to map strictly to Cantor's "Einzel" formula using Supabase schema
// ---------------------------------------------------------------------------
export function calculateGrundpreis(
  systemKey: string,
  material: string,
  openingId: string, 
  width: number, 
  height: number,
  matrixData: any[] // Dynamic array from cantor_formula_matrices
): number {
    // 1. Resolve Cantor matrix coordinates identically to the 'Einzel' SQL block
    const matrixName = material === 'PVC' ? 'PVC_F100' : 'AL_F100';
    const class1 = openingId; // maps to Cantor's hardware variant 'DK', 'F', etc.
    let class2 = systemKey; // maps to 'IG5', 'ALU'
    if (systemKey === 'iglo5' || systemKey === 'I5S' || systemKey === 'p5') class2 = 'IG5';

    // 2. Filter Supabase matrices
    const activeGrid = matrixData.filter(row => 
        row.matrix_name === matrixName &&
        row.class_1 === class1 &&
        row.class_2 === class2
    );

    if (!activeGrid || activeGrid.length === 0) {
        return estimateFramePrice(systemKey, openingId, width, height); // Fallback to Phase 1 JSON
    }

    // 3. IDW Bounds interpolation logic (Width / Height)
    const exactMatch = activeGrid.find(row => row.width === width && row.height === height);
    if (exactMatch && exactMatch.prices && exactMatch.prices.length > 0) {
       // Typically PREIS1 (index 0) contains the frame base price
       return exactMatch.prices[0];
    } else {
       // Remap Supabase format to idwInterpolate PriceAnchor format
       const anchors = activeGrid.map(row => ({
          w: row.width,
          h: row.height,
          price: row.prices[0] || 0
       })).filter(a => a.price > 0 && a.price < 5000); // Filter sentinels
       
       if (anchors.length > 0) {
           return idwInterpolate(anchors, width, height); 
       }
       return estimateFramePrice(systemKey, openingId, width, height); // Fallback
    }
}

// ---------------------------------------------------------------------------
// Native Cantor Surcharge Lookup (Phase 2)
// Designed to map strictly to Cantor's "DOD" percentage surcharge formulas
// Translates: GRPRS * PMATALL(MAT, 'KOLOR', SYS, W, 1, COL) / 100
// ---------------------------------------------------------------------------
export function calculateCantorSurcharge(
  grprs: number, 
  typeClass: string, 
  systemKey: string, 
  colorMode: string, 
  matrixData: any[] // Dynamic array from cantor_formula_matrices
): number {
    if (!grprs || grprs <= 0) return 0; // Surcharges require a valid GRPRS

    // 1. Resolve Matrix Name (e.g., "S11_DOD")
    // Note: Fallbacks to AL_DOD or PVC_DOD can be mapped here if typeClass is missing
    const matrixName = typeClass ? `${typeClass}_DOD` : 'PVC_DOD';

    // 2. Filter Supabase matrices for 'KOLOR' Class
    let surchargeClass2 = systemKey;
    if (systemKey === 'iglo5' || systemKey === 'I5S') surchargeClass2 = 'IG5';

    const matrixRow = matrixData.find(row => 
        row.matrix_name === matrixName &&
        row.class_1 === 'KOLOR' &&
        row.class_2 === surchargeClass2
    );

    if (!matrixRow || !matrixRow.prices || matrixRow.prices.length === 0) {
        return 0; // Fallback to 0 if the color matrix logic isn't strictly defined for this profile
    }

    // 3. Resolve the Column Index mechanically based on UI State (ES1100 emulation)
    let arrayColumnIndex = 0; 
    
    // Check against standard Cantor color configuration mappings
    const mode = colorMode?.toLowerCase() || '';
    
    if (!mode || mode === 'white' || mode === 'standard' || mode === 'biały' || mode === 'white / white') {
        return 0; // Standard white windows carry no Cantor DOD percentage surcharge 
    }

    if (mode.includes('one side') || mode.includes('foil inside') || mode.includes('foil outside') || mode.includes('1-seitig')) {
        arrayColumnIndex = 0; // Single side foil (PREIS1)
    } else if (mode.includes('two-tone') || mode.includes('both sides') || mode.includes('2-seitig')) {
        arrayColumnIndex = 1; // Double foil (PREIS2)
    } else if (mode.includes('special') || mode.includes('custom')) {
        arrayColumnIndex = 2; // Special color group (PREIS3)
    }

    // Capture the Percentage Modifier (e.g., 15 for 15%)
    const percentageSurcharge = matrixRow.prices[arrayColumnIndex] || 0;

    // 4. Final Math execution perfectly matching Cantor percentage multiplication
    const finalSurcharge = (grprs * percentageSurcharge) / 100;
    
    return finalSurcharge;
}

// ---------------------------------------------------------------------------
// Glazing Cost
// ---------------------------------------------------------------------------
export function estimateGlazingCost(glazingId: string, width_mm: number, height_mm: number): number {
  // Cantor Phase 1 Alignment: Extracted frame completely empty.
  return 0;
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
  base_ek: number;
  base_vk: number;
}

export function calculatePrice(
  profileId: string,
  openingClass: string,   // MUST be a Cantor opening class: DK | UR | F100 | PSK | HS | DOOR
  width_mm: number,
  height_mm: number,
  glazingId: string,
  interiorColor: string,
  exteriorColor: string,
  addonPrices: number[],
  cantorSystem?: any,
  cantorRules?: any[],
  cantorMatrices?: any[]
): PricingBreakdown {

  // NATIVE CANTOR ENGINE (Phase 2 Linkage)
  let frame = 0;
  let color = 0;
  
  if (cantorMatrices && cantorMatrices.length > 0) {
      // 1. Calculate Native GRPRS
      const cKey = cantorSystem?.cantor_key || (profileId === 'iglo5' ? 'I5S' : profileId);
      const isPVC = cantorSystem?.type_class === 'S11' || profileId.includes('iglo') || profileId.includes('pvc');
      
      frame = calculateGrundpreis(
          cKey, 
          isPVC ? 'PVC' : 'ALU', 
          openingClass, 
          width_mm, 
          height_mm, 
          cantorMatrices
      );

      // 2. Determine Native Color Mode UI State Translation 
      // Emulating Cantor's ES1100 logic based on the user's hex selections
      let colorMode = 'Standard';
      if (interiorColor !== exteriorColor) colorMode = 'Two-Tone Foil';
      else if (interiorColor && interiorColor !== 'c197' && interiorColor.toLowerCase() !== 'white' && interiorColor !== 'W-W') colorMode = 'Foil Inside';
      // ... Note: Detailed color matching logic can be expanded here based on actual foil codes

      // 3. Calculate Native PMATALL Percentage Surcharge
      const tClass = cantorSystem?.type_class || (isPVC ? 'S11' : 'AL');
      color = calculateCantorSurcharge(
          frame,
          tClass,
          cKey,
          colorMode,
          cantorMatrices
      );
  } else {
      // PHASE 1 FALLBACK ENGINE (Local Data / No Internet)
      frame = estimateFramePrice(profileId, openingClass, width_mm, height_mm);
      color = estimateColorSurcharge(frame, interiorColor, exteriorColor);
  }

  // 4. Calculate Generic Pricing Rules (Decoupled from hardcoded UI logic)
  const glazing = estimateGlazingCost(glazingId, width_mm, height_mm);
  
  // Natively imported Cantor rules (fallback to local config if Supabase unavailable)
  const activeRules = (cantorRules && cantorRules.length > 0) 
      ? cantorRules 
      : iglo5Data.product_systems[0].pricing_rules;

  let dynamicRulesSurcharge = 0;
  
  for (const rule of activeRules || []) {
      if (rule.rule_type === 'LINEAR_WIDTH_SURCHARGE') {
          // Typically Transport Strip (TS)
          dynamicRulesSurcharge += (width_mm / 1000) * (rule.modifier || 0);
      }
      else if (rule.rule_type === 'AREA_SURCHARGE') {
          // Typically Oversized Glass Penalty (PANE)
          const areaSqm = (width_mm / 1000) * (height_mm / 1000);
          if (areaSqm > (rule.threshold || 0)) {
              dynamicRulesSurcharge += (areaSqm - (rule.threshold || 0)) * (rule.modifier || 0);
          }
      }
  }

  const addons = addonPrices.reduce((sum, p) => sum + p, 0);

  // Note: Transport Strips and rules are bundled into Frame cost naturally
  const functionalFramePrice = frame + dynamicRulesSurcharge;

  const subtotal = functionalFramePrice + glazing + color + addons;
  const vat = subtotal * 0.21;
  const total = subtotal + vat;
  
  // Scaffold Cantor Discount / Rabatt Logic (Base EK / VK)
  // Hardcoded VK ratio mapping to UI (112.31 / 466.00)
  const VK_MULTIPLIER = 0.241008; 
  const ek_price = functionalFramePrice;
  const vk_price = ek_price * VK_MULTIPLIER;

  return {
    frame: Math.round(functionalFramePrice * 100) / 100,
    glazing: Math.round(glazing * 100) / 100,
    color: Math.round(color * 100) / 100,
    addons: Math.round(addons * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100,
    base_ek: Math.round(ek_price * 100) / 100,
    base_vk: Math.round(vk_price * 100) / 100
  };
}
