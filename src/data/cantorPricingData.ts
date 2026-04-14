/**
 * Cantor Pricing Anchor Tables
 * 
 * These are real price points extracted from the Cantor ERP system.
 * Source: DRUTEX_DEALER local SQL Server, manually verified.
 * 
 * Structure: profile → openingType → array of { w_mm, h_mm, price_eur }
 * 
 * To add more anchor points: run scripts/extractCantorPricing.mjs
 * Each new anchor improves interpolation accuracy for that region.
 * 
 * IMPORTANT: All prices are FRAME ONLY — glazing is added separately.
 * Last updated: 2026-04-14
 */

export interface PriceAnchor {
  w: number;   // width in mm
  h: number;   // height in mm
  price: number; // frame price in EUR (no glazing)
}

export interface GlazingRate {
  id: string;
  ratePerM2: number; // EUR per m² of glass area
  description?: string;
}

export interface ProfilePricingData {
  [openingType: string]: PriceAnchor[];
}

export interface CantorPricingMap {
  [profileId: string]: ProfilePricingData;
}

// ---------------------------------------------------------------------------
// FRAME PRICING ANCHORS (Cantor verified)
// ---------------------------------------------------------------------------
export const CANTOR_PRICING: CantorPricingMap = {
  iglo5: {
    F100: [
      { w: 600,  h: 600,  price: 141.43 },
      { w: 800,  h: 800,  price: 157.24 },
      { w: 1000, h: 1000, price: 214.77 },
      { w: 1500, h: 1500, price: 310.96 },
      { w: 1500, h: 2000, price: 391.43 },
      { w: 1600, h: 2000, price: 417.93 },
      // TODO: Add more anchor points via extractCantorPricing.mjs
    ],
    // Other opening types (DKL, DKR, etc.) — fill in as you pull from Cantor
    // DKL: [ ... ]
  }
  // Other profiles added here as data is extracted from Cantor:
  // igloenergy: { F100: [ ... ] }
};

// ---------------------------------------------------------------------------
// GLAZING PACKAGE RATES (EUR per m² of glass area, added on top of frame price)
// Source: Estimated from SPRBAUM / FF_GLAS — update from Cantor when exact values confirmed
// ---------------------------------------------------------------------------
export const GLAZING_RATES: GlazingRate[] = [
  // Standard Double-glazed packages (2-pane)
  { id: '2-18', ratePerM2: 35.00, description: 'Double-glazed 18mm' },
  { id: '2-20', ratePerM2: 37.00, description: 'Double-glazed 20mm' },
  { id: '2-22', ratePerM2: 39.00, description: 'Double-glazed 22mm' },
  { id: '2-24', ratePerM2: 42.00, description: 'Double-glazed 24mm' },
  { id: '2-26', ratePerM2: 44.00, description: 'Double-glazed 26mm' },
  { id: '2-28', ratePerM2: 46.00, description: 'Double-glazed 28mm' },
  { id: '2-30', ratePerM2: 48.00, description: 'Double-glazed 30mm' },
  { id: '2-32', ratePerM2: 50.00, description: 'Double-glazed 32mm' },
  { id: '2-34', ratePerM2: 52.00, description: 'Double-glazed 34mm' },
  { id: '2-36', ratePerM2: 54.00, description: 'Double-glazed 36mm' },
  { id: '2-40', ratePerM2: 58.00, description: 'Double-glazed 40mm' },

  // Standard Triple-glazed packages (3-pane)
  { id: '3-24', ratePerM2: 65.00, description: 'Triple-glazed 24mm' },
  { id: '3-28', ratePerM2: 70.00, description: 'Triple-glazed 28mm' },
  { id: '3-32', ratePerM2: 74.00, description: 'Triple-glazed 32mm' },
  { id: '3-34', ratePerM2: 77.00, description: 'Triple-glazed 34mm' },
  { id: '3-36', ratePerM2: 80.00, description: 'Triple-glazed 36mm' },
  { id: '3-40', ratePerM2: 88.00, description: 'Triple-glazed 40mm' },

  // Acoustic glazing packages
  { id: 'T4/18/FL8',  ratePerM2: 95.00,  description: 'Ug=1.1 Fixed pane' },
  { id: 'FL6/16/T4',  ratePerM2: 110.00, description: '6/16/4 Ug=1.1 Rw=40db' },
  { id: 'B1/16/T4',   ratePerM2: 120.00, description: '33.1/16/4 Ug=1.1 Rw=40db' },
  { id: 'B1/16/TB1',  ratePerM2: 130.00, description: '33.1/16/33.1 Ug=1.1 Rw=40db' },
  { id: 'TB1/18/FL8', ratePerM2: 140.00, description: '33.1th/18/8 Ug=1.1 Rw=41db' },
  { id: 'A4/16/T4',   ratePerM2: 150.00, description: '44.4/16/4 Ug=1.1 Rw=41db' },
  { id: 'A4/16/TB1',  ratePerM2: 165.00, description: '44.4/16/33.1 Ug=1.1 Rw=43db' },
  { id: 'T8/20/SR9',  ratePerM2: 195.00, description: '8th/20/44.2SR Ug=1.1 Rw=46db' },

  // Fixed Panel
  { id: '3-40BlackLine', ratePerM2: 105.00, description: 'BLACK LINE ESG 40mm' },
];

// ---------------------------------------------------------------------------
// COLOR SURCHARGE RATES (applied as % of frame price)
// ---------------------------------------------------------------------------
export const COLOR_SURCHARGE = {
  standard_white: 0.00,    // RAL 9016 — no surcharge
  standard_color: 0.12,   // Standard RAL colors — +12%
  metallic: 0.18,          // Metallic / effect colors — +18%
  wood_foil: 0.22,         // Wood-grain foil finish — +22%
  two_tone: 0.25,          // Different interior/exterior — +25%
} as const;
