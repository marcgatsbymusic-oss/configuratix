import { PROVINCE_CTE_BASE } from '../data/spanishGeodata';

// Winter CTE scales from alpha (warmest) -> A -> B -> C -> D -> E (coldest)
const WINTER_ZONES = ['alpha', 'A', 'B', 'C', 'D', 'E'];

/**
 * Calculates the precise CTE Climatic Zone for any Spanish municipality 
 * based on the rigorous Appendix B heuristics of the DB-HE document.
 * As altitude strictly correlates with thermal loss, every +100m or +200m delta 
 * bumps the thermal severity rating one tier higher.
 */
export function calculateCTEZone(province: string, altitude: number): { winter: string, summer: string, combined: string } {
  // Graceful fallback if province not strictly mapped
  const base = PROVINCE_CTE_BASE[province as keyof typeof PROVINCE_CTE_BASE] || { zone: "C2", h0: 0 };
  
  const baseWinter = base.zone.substring(0, base.zone.length === 6 ? 5 : 1); // 'A', 'B', etc or 'alpha'
  const baseSummer = parseInt(base.zone.substring(base.zone.length === 6 ? 5 : 1)); // '3', '4', etc
  
  if (baseWinter === 'alpha') {
    return { winter: 'alpha', summer: baseSummer.toString(), combined: `alpha${baseSummer}` };
  }

  // Calculate altitude delta (in meters)
  const deltaH = altitude - base.h0;
  
  let currentWinterIndex = WINTER_ZONES.indexOf(baseWinter);
  
  // DB-HE heuristic: +200m rough approximation usually constitutes a +1 step drop in thermal zone harshness
  if (deltaH > 200) {
     const jumps = Math.floor(deltaH / 200);
     currentWinterIndex = Math.min(WINTER_ZONES.length - 1, currentWinterIndex + jumps);
  } else if (deltaH < -200) {
     // Descending below Reference raises temps
     const drops = Math.floor(Math.abs(deltaH) / 200);
     currentWinterIndex = Math.max(0, currentWinterIndex - drops);
  }

  const computedWinter = WINTER_ZONES[currentWinterIndex];
  
  // Summer zones (1-4, 4 is hottest) drop roughly 1 tier every +300m
  let computedSummer = baseSummer;
  if (deltaH > 300) {
     const jumps = Math.floor(deltaH / 300);
     computedSummer = Math.max(1, baseSummer - jumps);
  } else if (deltaH < -300) {
     const drops = Math.floor(Math.abs(deltaH) / 300);
     computedSummer = Math.min(4, baseSummer + drops);
  }

  return {
    winter: computedWinter,
    summer: computedSummer.toString(),
    combined: `${computedWinter}${computedSummer}`
  };
}
