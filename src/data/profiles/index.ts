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
  IG5_F2XX1: {
    id: 'IG5_F2XX1',
    system: 'IGLO_5',
    type: 'F2XX1',
    name: 'Iglo 5 - Double Sash Fixed Mullion',
    description: 'Double sash window with fixed mullion for Iglo 5 system.',
    fileName: 'IGLO5/IG5_F2XX1.json'
  },
  IG5_F2MPX: {
    id: 'IG5_F2MPX',
    system: 'IGLO_5',
    type: 'F2MPX',
    name: 'Iglo 5 - Double Sash Movable Post',
    description: 'Double sash window with movable post. Left sash opens only; right sash tilts and opens.',
    fileName: 'IGLO5/IG5_F2MPX.json'
  },
  SLE201: {
    id: 'SLE201',
    system: 'IGLO_EDGE',
    type: 'SLE201',
    name: 'Iglo Edge Slide - SLE201',
    description: 'Sliding door top and bottom movable door profile.',
    fileName: 'IgloEdge/SLE201.json'
  },
  IGE_F104: {
    id: 'IGE_F104',
    system: 'IGLO_EDGE',
    type: 'F104',
    name: 'Iglo Edge - F104 Frame & Sash',
    description: 'Standard window profile for Iglo Edge system.',
    fileName: 'IgloEdge/IGE_F104.json'
  },
  IGE_MOVABLE_POST_LEFT_OPENING: {
    id: 'IGE_MOVABLE_POST_LEFT_OPENING',
    system: 'IGLO_EDGE',
    type: 'IGE_MOVABLE_POST_LEFT_OPENING',
    name: 'Iglo Edge - Movable Post Left Opening V8',
    description: 'Movable post left opening window profile for Iglo Edge system (V8).',
    fileName: 'IgloEdge/IGE_MOVABLE_POST_LEFT_OPENING.json'
  },
  IGE_F202_R_FIXV2: {
    id: 'IGE_F202_R_FIXV2',
    system: 'IGLO_EDGE',
    type: 'IGE_F202_R_FIXV2',
    name: 'Iglo Edge F202 R Fix V2 — Double Sash Movable Post (Active Left)',
    description: 'Double sash window with V8 movable post. Left sash opens & tilts (clockwise handle). Right sash turn only. Sequence locked: right opens after left.',
    fileName: 'IgloEdge/IGE_MOVABLE_POST_LEFT_OPENING.json'
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
    const parts = filePath.split('/');
    if (parts.length === 2) {
      const [dir, file] = parts;
      let module;
      if (dir === 'IGLO5') {
        module = await import(`./IGLO5/${file}.json`);
      } else if (dir === 'IgloEdge') {
        module = await import(`./IgloEdge/${file}.json`);
      } else {
        throw new Error(`Unknown profile directory: ${dir}`);
      }
      return module.default || module;
    }
    throw new Error(`Invalid file path structure: ${metadata.fileName}`);
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
