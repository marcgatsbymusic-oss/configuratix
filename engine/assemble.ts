import fs from 'fs';
import path from 'path';

export interface Point {
  x: number;
  y: number;
}

export interface Loop {
  closed: boolean;
  pts: Point[];
}

export interface ProfileData {
  name: string;
  component: string;
  has_region: boolean;
  polyline_loops: number;
  bbox: [number, number, number, number] | null;
  loops: Loop[];
}

export interface RecipeItem {
  ref: string;
  component: string | null;
  offset: [number, number];
  rot: number;
}

export interface AssembledComponent {
  refName: string;
  componentType: string;
  profileName: string;
  offset2D: [number, number];
  rotation2D: number;
  transformedLoops: Loop[];
  bbox: [number, number, number, number] | null;
}

export interface WindowSpecification {
  windowType: 'single_fixed' | 'single_sash' | 'double_fixed_mullion' | 'double_movable_mullion';
  width: number;
  height: number;
  profileMapping: Record<string, string>; // Maps symbolic name (e.g. "rama 01") to physical file name or block name (e.g. "frame__50001_rama_66mm.json")
  profilesDir: string;
  recipesFile: string;
}

// Rotates and translates a 2D point
export function transformPoint(pt: Point, offset: [number, number], rotDeg: number): Point {
  const rad = (rotDeg * Math.PI) / 180.0;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // Apply rotation
  const rx = pt.x * cos - pt.y * sin;
  const ry = pt.x * sin + pt.y * cos;
  // Apply translation
  return {
    x: Number((rx + offset[0]).toFixed(3)),
    y: Number((ry + offset[1]).toFixed(3)),
  };
}

// Transforms a loop of points
export function transformLoop(loop: Loop, offset: [number, number], rotDeg: number): Loop {
  return {
    closed: loop.closed,
    pts: loop.pts.map(p => transformPoint(p, offset, rotDeg)),
  };
}

// Compute bounding box of a list of loops
export function computeBoundingBox(loops: Loop[]): [number, number, number, number] | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  let hasPoints = false;
  for (const loop of loops) {
    for (const pt of loop.pts) {
      hasPoints = true;
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
  }

  if (!hasPoints) return null;
  return [
    Number(minX.toFixed(2)),
    Number(minY.toFixed(2)),
    Number(maxX.toFixed(2)),
    Number(maxY.toFixed(2)),
  ];
}

// Main assemble function
export function assembleWindow(spec: WindowSpecification): AssembledComponent[] {
  // Load recipes
  if (!fs.existsSync(spec.recipesFile)) {
    throw new Error(`Recipes file not found: ${spec.recipesFile}`);
  }
  const recipes: Record<string, RecipeItem[]> = JSON.parse(fs.readFileSync(spec.recipesFile, 'utf-8'));

  // Match window specification to the corresponding zlozenie recipe(s)
  // We determine the best fitting złożenie key(s)
  // For a single window, we locate the appropriate frame and sash złożenie recipe.
  // E.g., single_sash uses złożenie recipe that combines frame and sash.
  // We will scan all recipes and find the ones that match our spec's required components.
  // E.g., for single_sash: a recipe that matches frame + sash.
  // Let's resolve the recipe key directly or support a flexible matching algorithm.
  
  // We will map specification types to standard default recipes if not specified, 
  // or allow mapping them. Let's design a mapping:
  let targetRecipeKeys: string[] = [];
  if (spec.windowType === 'single_sash') {
    // Standard frame + sash recipe, e.g. "złożenie 01"
    targetRecipeKeys = ['złożenie 01'];
  } else if (spec.windowType === 'single_fixed') {
    // Frame + spacer + glass + glazing bead recipe, e.g. "złożenie 07"
    targetRecipeKeys = ['złożenie 07'];
  } else if (spec.windowType === 'double_fixed_mullion') {
    // E.g. mullion + sash + sash, or mullion + fixed + fixed
    targetRecipeKeys = ['złożenie 26'];
  } else {
    // Default fallback or manual selection
    targetRecipeKeys = ['złożenie 01'];
  }

  const assembled: AssembledComponent[] = [];

  for (const recipeKey of targetRecipeKeys) {
    const items = recipes[recipeKey];
    if (!items) {
      throw new Error(`Recipe key not found: ${recipeKey}`);
    }

    for (const item of items) {
      // Find the physical profile mapping
      const mappedProfileFile = spec.profileMapping[item.ref] || spec.profileMapping[item.ref.toLowerCase()];
      if (!mappedProfileFile) {
        throw new Error(`No profile mapping provided for symbolic name: "${item.ref}"`);
      }

      const profilePath = path.join(spec.profilesDir, mappedProfileFile);
      if (!fs.existsSync(profilePath)) {
        throw new Error(`Profile file not found at: ${profilePath}`);
      }

      const profileData: ProfileData = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

      // Transform loops
      const transformedLoops = (profileData.loops || []).map(loop => {
        // Adapt points structure if it is array of array [x, y]
        const pts: Point[] = loop.pts.map(p => {
          if (Array.isArray(p)) {
            return { x: p[0], y: p[1] };
          }
          return p as Point;
        });
        return transformLoop({ closed: loop.closed, pts }, item.offset, item.rot);
      });

      // Compute bounding box
      const bbox = computeBoundingBox(transformedLoops);

      assembled.push({
        refName: item.ref,
        componentType: item.component || profileData.component,
        profileName: profileData.name,
        offset2D: item.offset,
        rotation2D: item.rot,
        transformedLoops,
        bbox,
      });
    }
  }

  return assembled;
}

// Pure browser-safe version of the assembler that does not use fs or path
export function assembleJunctionsPure(
  recipeItems: RecipeItem[],
  profileDataMap: Record<string, ProfileData>
): AssembledComponent[] {
  const assembled: AssembledComponent[] = [];

  for (const item of recipeItems) {
    const profileData = profileDataMap[item.ref] || profileDataMap[item.ref.toLowerCase()];
    if (!profileData) {
      throw new Error(`Profile data not found for ref: "${item.ref}"`);
    }

    const transformedLoops = (profileData.loops || []).map(loop => {
      const pts: Point[] = loop.pts.map(p => {
        if (Array.isArray(p)) {
          return { x: p[0], y: p[1] };
        }
        return p as Point;
      });
      return transformLoop({ closed: loop.closed, pts }, item.offset, item.rot);
    });

    const bbox = computeBoundingBox(transformedLoops);

    assembled.push({
      refName: item.ref,
      componentType: item.component || profileData.component,
      profileName: profileData.name,
      offset2D: item.offset,
      rotation2D: item.rot,
      transformedLoops,
      bbox,
    });
  }

  return assembled;
}

