export interface ProfileMetadata {
  id: string;
  system: string;
  type: string;
  name: string;
  description: string;
  fileName: string;
}

export const ProfileRegistry: Record<string, ProfileMetadata> = {
  IG5_F100: {
    id: 'IG5_F100',
    system: 'IGLO_5',
    type: 'F100',
    name: 'Iglo 5 - Standard Frame',
    description: 'Standard window profile for Iglo 5 system.',
    fileName: 'IGLO5/IG5_F100.json'
  },
  IG5_F103: {
    id: 'IG5_F103',
    system: 'IGLO_5',
    type: 'F103',
    name: 'Iglo 5 - Renovation Frame',
    description: 'Renovation window profile for Iglo 5 system.',
    fileName: 'IGLO5/IG5_F103.json'
  },
  IG5_F104: {
    id: 'IG5_F104',
    system: 'IGLO_5',
    type: 'F104',
    name: 'Iglo 5 - Monoblock Frame',
    description: 'Monoblock window profile for Iglo 5 system.',
    fileName: 'IGLO5/IG5_F104.json'
  },
  IG5_F200: {
    id: 'IG5_F200',
    system: 'IGLO_5',
    type: 'F200',
    name: 'Iglo 5 - Outward Opening',
    description: 'Outward opening profile for Iglo 5 system.',
    fileName: 'IGLO5/IG5_F200.json'
  },
  IG5_F100T: {
    id: 'IG5_F100T',
    system: 'IGLO_5',
    type: 'F100T',
    name: 'Iglo 5 - Tilt & Turn',
    description: 'Tilt and turn window profile for Iglo 5 system.',
    fileName: 'IGLO5/IG5_F100T.json'
  },
  IG5_F101B: {
    id: 'IG5_F101B',
    system: 'IGLO_5',
    type: 'F101B',
    name: 'Iglo 5 - F101B',
    description: 'F101B window profile for Iglo 5 system.',
    fileName: 'IGLO5/IG5_F101B.json'
  },
  IG5_F101C: {
    id: 'IG5_F101C',
    system: 'IGLO_5',
    type: 'F101C',
    name: 'Iglo 5 - F101C',
    description: 'F101C window profile for Iglo 5 system.',
    fileName: 'IGLO5/IG5_F101C.json'
  },
  SLE201: {
    id: 'SLE201',
    system: 'IGLO_EDGE',
    type: 'SLE201',
    name: 'Iglo Edge Slide - SLE201',
    description: 'Sliding door top and bottom movable door profile.',
    fileName: 'IgloEdge/SLE201.json'
  }
};

/**
 * Dynamically loads a profile's geometric data from the library.
 * This ensures the heavy JSON files are chunked separately and only loaded when needed.
 * 
 * @param profileId - The ID of the profile from the registry (e.g., 'IG5_F100T')
 * @returns The parsed geometric JSON data
 */
export const loadProfileGeometry = async (profileId: keyof typeof ProfileRegistry) => {
  const metadata = ProfileRegistry[profileId];
  if (!metadata) {
    throw new Error(`Profile ID ${String(profileId)} not found in ProfileRegistry.`);
  }

  try {
    // Dynamic import to allow bundlers (Vite/Webpack) to code-split these files
    // Vite requires the file extension to be explicitly in the string template
    const filePath = metadata.fileName.replace('.json', '');
    const module = await import(`./${filePath}.json`);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load geometry for ${String(profileId)}:`, error);
    throw error;
  }
};

/**
 * Helper to get profiles for a specific system
 */
export const getProfilesBySystem = (system: string) => {
  return Object.values(ProfileRegistry).filter(profile => profile.system === system);
};
