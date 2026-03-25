import { CONFIG_SCHEMA, WINDOW_TYPES, COLOR_LOCALE, GLASS_LOCALE } from '../components/SlateConfigurator/types';
import type { ConfiguratorState } from '../components/SlateConfigurator/types';

// Helper function to synthesize a readable English data payload out of the raw Redux identifiers
export function generateBlueprintPayload(state: ConfiguratorState, pricing: any) {
  // Resolve localized strings mapped against raw IDs
  const materialName = state.material;
  const profileName = CONFIG_SCHEMA.materials[state.material]?.profiles.find(p => p.id === state.profile)?.name || state.profile;
  const windowTypeName = WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || state.windowTypeId;
  const colorName = COLOR_LOCALE.colors[state.color]?.name || state.color;
  const glazingName = GLASS_LOCALE[state.glazing] || state.glazing;
  const glazingModifier = CONFIG_SCHEMA.glazing.find(g => g.id === state.glazing)?.priceMod || 1.0;
  
  const mappedAddons = state.addons.map(addonId => {
    const addonData = CONFIG_SCHEMA.addons.find(a => a.id === addonId);
    return addonData ? addonData.name : addonId;
  });

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      configuratorVersion: "2.0",
      projectScope: "Drutex Slate",
    },
    structural: {
      material: materialName,
      profileSystem: profileName,
      architecture: windowTypeName,
      dimensions: {
        widthInMm: state.dimensions.width,
        heightInMm: state.dimensions.height,
        areaInSqM: ((state.dimensions.width * state.dimensions.height) / 1000000).toFixed(2)
      },
      sashConfigurations: state.sashOpenings.map((openingId: string, idx: number) => ({
        sashIndex: idx + 1,
        openingType: openingId
      }))
    },
    finishing: {
      surfaceColor: colorName,
      surfaceGroup: state.colorGroup,
      glazingPackage: glazingName
    },
    addons: mappedAddons,
    financials: {
      currency: "USD",
      baseFramework: pricing.base,
      hardwareAssembly: pricing.hardware,
      glazingMultiplier: glazingModifier,
      accessories: pricing.addons,
      totalSystem: pricing.total
    }
  };
}

// Triggers a browser download of the generated JSON configuration
export function downloadBlueprint(payload: object, filename = 'window-blueprint.json') {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
