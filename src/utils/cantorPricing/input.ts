// Configurator input shape consumed by the Cantor pricing engine.
//
// This is the contract between the UI (where the user picks a window) and
// the pricing layer. Keep this surface tight — every field translates to a
// concrete Cantor variable in the formula evaluation context.

export interface ConfiguratorInput {
  // Window class
  article: 'F104' | string;     // Cantor ARTNR — F104 is single-sash window
  profilsatz: string;            // e.g. "IG5", "IGE", "IG5 DW"
  materialart: 1 | 2 | 3;       // 1=wood, 2=PVC, 3=ALU
  beschvar: string;              // Beschlag variant, e.g. "FIX", "DK", "DK-FIX"

  // Dimensions in millimetres (LOCHBREITE/LOCHHOEHE = outer rough opening)
  width_mm: number;
  height_mm: number;

  // Sashes
  sashCount: number;             // F104 = 1
  openings: ('F' | 'DK' | 'UR' | 'R' | 'U')[];   // per-sash opening behaviour

  // Color
  color: {
    code: 'W-W' | string;        // bicolor code observed in AUFPOS.PROFILFARBE
    interiorRal?: string;
    exteriorRal?: string;
  };

  // Frame profile
  frameProfile: string;          // AKTARTNRRA, e.g. "50001"
  sashProfile: string;           // AKTARTNRFL, e.g. "50011"

  // Glazing
  glazing: {
    code: string;                // e.g. "2-24" (2 panes, 24mm cavity)
    panes: string[];             // e.g. ["FL4", "T4"]
    spacer: string;              // e.g. "S16"
  };

  // Threshold / hardware
  schwelle: 0 | 1;               // 1 if door threshold present (0 for windows)

  // Pricing context. Either `pricelistKurzbez` or `currency` must be set:
  //   - explicit KURZBEZ locks to one historical pricelist (useful for
  //     reproducing past orders against a specific factor)
  //   - `currency` lets the engine auto-select the active PREISZYK row for
  //     (currency, today) so pricelist rollovers don't require code changes
  dealer: {
    kundenNr: number;
    pricelistKurzbez?: string;
    currency?: string;
    land: string;
  };
}
