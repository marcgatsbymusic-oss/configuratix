import { TrimConfig, isTrimConfigVerified } from '../config/TrimConfig';

export interface TrimCalculationParams {
  width: number;
  height: number;
  jointGap: number;
  selectedWidthMm: number;
  isMitred: boolean;
  hasBlindBox: boolean;
  frameOverlapMm: number;
}

export interface TrimPiece {
  position: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';
  cutLengthMm: number;
  leftCut: 'STRAIGHT' | 'MITRE' | 'BUTT';
  rightCut: 'STRAIGHT' | 'MITRE' | 'BUTT';
}

export class TrimCalculatorService {
  public calculateTrimPieces(params: TrimCalculationParams): TrimPiece[] {
    if (!isTrimConfigVerified()) {
      console.error("[SAFETY BLOCK] Attempted to calculate trims with unverified datum/formula.");
      throw new Error("Cannot calculate trim lengths: Datum and formulas are marked as PLACEHOLDER_UNVERIFIED.");
    }

    if (!TrimConfig.stockedWidthsMm.includes(params.selectedWidthMm)) {
      throw new Error(`Selected width ${params.selectedWidthMm} is not in stocked range: ${TrimConfig.stockedWidthsMm.join(',')}`);
    }

    if (params.selectedWidthMm < params.jointGap) {
      throw new Error(`Warning: Selected trim width (${params.selectedWidthMm}mm) is insufficient to cover the joint gap (${params.jointGap}mm).`);
    }

    // Normally we would use the verified formula here.
    // For now, if we get past the verified block, we just return empty array or dummy (which is impossible since it throws)
    return [];
  }
}
