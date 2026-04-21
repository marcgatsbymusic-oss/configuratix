/**
 * Utility for mapping Cantor typologies (F-codes) to sensible default sash opening codes.
 * 
 * Opening codes:
 * o1 = Fix / Festverglasung
 * o2 = Dreh-Kipp Links (DKL) - Handle Right, Hinges Left
 * o3 = Dreh-Kipp Rechts (DKR) - Handle Left, Hinges Right
 * o4 = Dreh Links (DL) - Turn Left
 * o5 = Dreh Rechts (DR) - Turn Right
 * o6 = Kipp (K) - Tilt
 */

export function getDefaultSashOpenings(id: string, sashes: number): string[] {
  const code = (id || '').toUpperCase();
  
  // -- 1-chamber typologies --
  if (code.startsWith('F10')) {
    if (code.includes('F100')) return ['o3'];   // DKR (Handle L, Hinge R)
    if (code.includes('F101')) return ['o2'];   // DKL
    if (code.includes('F102')) return ['o5'];   // Turn Right
    if (code.includes('F103')) return ['o4'];   // Turn Left
    if (code.includes('F104')) return ['o1'];   // Fix
    if (code.includes('F105') || code.includes('F106')) return ['o6']; // Tilt
  }
  
  if (code.startsWith('F1')) return Array(sashes).fill('o3');

  // -- 2-chamber typologies --
  if (code.startsWith('F2')) {
    // Movable post (stulp) -> primary sash DK, secondary sash Turn
    if (['F202', 'F203', 'F270', 'F271'].some(p => code.includes(p))) {
      return ['o4', 'o3']; 
    }
    // Stable post -> standard DKL, DKR
    return Array.from({ length: sashes }, (_, i) => i === 0 ? 'o2' : 'o3');
  }

  // -- 3-chamber typologies --
  if (code.startsWith('F3')) {
    // Middle fixed usually
    return Array.from({ length: sashes }, (_, i) => {
      if (i === 0) return 'o2';
      if (i === 1) return 'o1';
      return 'o3';
    });
  }

  // -- 4-chamber typologies --
  if (code.startsWith('F4')) {
    // Standard 4-sash is usually [Fix, DKL, DKR, Fix] or similar
    return Array.from({ length: sashes }, (_, i) => {
      if (i === 1) return 'o2';
      if (i === 2) return 'o3';
      return 'o1';
    });
  }

  // Doors & default
  return Array(sashes).fill('o1');
}
