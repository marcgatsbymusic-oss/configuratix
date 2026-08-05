import type { GlazingPackage } from '../components/SlateConfigurator/types';

export const PROFILE_GLAZING_MAP: Record<string, GlazingPackage[]> = {
  iglo5: [
    // --- Group 1: Glazing Packages ---
    { id: '2-18', name: 'Double-glazed 18mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-20', name: 'Double-glazed 20mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-22', name: 'Double-glazed 22mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-24', name: 'Double-glazed 24mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-26', name: 'Double-glazed 26mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-28', name: 'Double-glazed 28mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-30', name: 'Double-glazed 30mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-32', name: 'Double-glazed 32mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-34', name: 'Double-glazed 34mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-36', name: 'Double-glazed 36mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-40', name: 'Double-glazed 40mm', priceMod: 1.0, group: 'Glazing Packages' },

    { id: '3-24', name: 'Triple-glazed 24mm', priceMod: 1.15, group: 'Glazing Packages' },
    { id: '3-28', name: 'Triple-glazed 28mm', priceMod: 1.15, group: 'Glazing Packages' },
    { id: '3-32', name: 'Triple-glazed 32mm', priceMod: 1.15, group: 'Glazing Packages' },
    { id: '3-34', name: 'Triple-glazed 34mm', priceMod: 1.15, group: 'Glazing Packages' },
    { id: '3-36', name: 'Triple-glazed 36mm', priceMod: 1.15, group: 'Glazing Packages' },
    { id: '3-40', name: 'Triple-glazed 40mm', priceMod: 1.15, group: 'Glazing Packages' },

    // --- Group 2: Acoustic Glazing Packages ---
    { id: 'T4/18/FL8', name: 'Ug=1.1', description2: 'Fixed pane package', priceMod: 1.25, group: 'Acoustic Glazing Packages' },
    { id: 'FL6/16/T4', name: '6/16/4 th Ug=1.1, Rw=40db', description2: 'Non-modifiable glazing package', priceMod: 1.30, group: 'Acoustic Glazing Packages' },
    { id: 'B1/16/T4', name: '33.1/16/4 th Ug=1.1, Rw=40db', description2: 'Non-modifiable glazing package', priceMod: 1.35, group: 'Acoustic Glazing Packages' },
    { id: 'B1/16/TB1', name: '33.1/16/33.1 th Ug=1.1, Rw=40db', description2: 'Non-modifiable glazing package', priceMod: 1.40, group: 'Acoustic Glazing Packages' },
    { id: 'TB1/18/FL8', name: '33.1 th/18/8 Ug=1.1, Rw=41db', description2: 'Non-modifiable glazing package', priceMod: 1.45, group: 'Acoustic Glazing Packages' },
    { id: 'A4/16/T4', name: '44.4/16/4 th Ug=1.1, Rw=41db', description2: 'Non-modifiable glazing package', priceMod: 1.50, group: 'Acoustic Glazing Packages' },
    { id: 'A4/16/TB1', name: '44.4/16/33.1 th Ug=1.1, Rw=43db', description2: 'Non-modifiable glazing package', priceMod: 1.55, group: 'Acoustic Glazing Packages' },
    { id: 'T8/20/SR9', name: '8 th/20/44.2 SR th Ug=1.1, Rw=46db', description2: 'Non-modifiable glazing package', priceMod: 1.65, group: 'Acoustic Glazing Packages' },

    // --- Group 3: Fixed Panel ---
    { id: '3-40BlackLine', name: 'BLACK LINE/14/T4 ESG/14/BLACK LINE (40mm)', priceMod: 1.10, group: 'Fixed Panel' }
  ]
};
