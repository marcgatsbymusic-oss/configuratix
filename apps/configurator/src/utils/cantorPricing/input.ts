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

  // Structural metadata
  windowUnit?: string;
  model?: string;

  // Dimensions in millimetres (LOCHBREITE/LOCHHOEHE = outer rough opening)
  width_mm: number;
  height_mm: number;

  // Sashes
  sashCount: number;             // F104 = 1
  openings: ('F' | 'DK' | 'UR' | 'R' | 'U')[];   // per-sash opening behaviour
  sashes?: { beschvar: string }[];

  // Color
  color: {
    code: 'W-W' | string;        // bicolor code observed in AUFPOS.PROFILFARBE
    type?: string;               // color scheme type mapping (e.g. W-W)
    interiorRal?: string;
    exteriorRal?: string;
    overwriteCoreColor?: boolean;
    coreColor?: string;
  };

  // Frame profile
  frameProfile: string;          // AKTARTNRRA, e.g. "50001"
  sashProfile: string;           // AKTARTNRFL, e.g. "50011"
  mullionProfile?: string;       // AKTARTNRST/K, e.g. "50021"

  // Infills (Glazing per sash/field)
  infills: {
    code: string;                // e.g. "2-24" (2 panes, 24mm cavity)
    panes: (string | undefined)[]; // e.g. ["FL4", "T4", "ADB6H"]
    spacer: string;              // e.g. "S"
    zatepienie?: boolean;
    width_mm?: number;           // Explicit sash width
    height_mm?: number;          // Explicit sash height
  }[];

  accessories?: { code: string, quantity: number }[];

  // Hardware / specific customizations
  hardware?: {
    safetyClass?: string;  // e.g., '4ZA'
    handleType?: string;   // e.g., 'KwadratK'
    handleColor?: string;  // e.g., 'bialy'
    coverColor?: string;   // e.g., 'bialy'
  };

  // Threshold / hardware
  schwelle: 0 | 1;               // 1 if door threshold present (0 for windows)

  // Advanced / Decorative Options
  options?: {
    // Grilles / Muntins
    grilleType?: string;      // e.g., 'SPR08', 'SPRN27'
    grilleFields?: number;    // e.g., 4

    // Seals
    sealColor?: string;       // e.g., '120884' (Black)

    // Profiles
    beadStyle?: 'Z' | 'P'; // 'Z' = Rounded, 'P' = Rectangular
    weldType?: 'standard' | 'v-perfect';
    frameReinforcement?: 'standard' | 'full';

    // Dowel Holes
    dowelHoles?: string;      // e.g., 'O_14-16'
  };

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
