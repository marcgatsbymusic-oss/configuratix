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

    const pieces: TrimPiece[] = [];
    const trimOffset = params.selectedWidthMm - params.frameOverlapMm;

    // Left Trim (Vertical)
    pieces.push({
      position: 'LEFT',
      cutLengthMm: params.height + (params.isMitred ? trimOffset * 2 : 0),
      leftCut: params.isMitred ? 'MITRE' : 'STRAIGHT',
      rightCut: params.isMitred ? 'MITRE' : 'STRAIGHT',
    });

    // Right Trim (Vertical)
    pieces.push({
      position: 'RIGHT',
      cutLengthMm: params.height + (params.isMitred ? trimOffset * 2 : 0),
      leftCut: params.isMitred ? 'MITRE' : 'STRAIGHT',
      rightCut: params.isMitred ? 'MITRE' : 'STRAIGHT',
    });

    // Top Trim (Horizontal) - skipped/modified if blind box is present
    if (!params.hasBlindBox) {
      pieces.push({
        position: 'TOP',
        cutLengthMm: params.width + (params.isMitred ? trimOffset * 2 : (params.isMitred ? 0 : -trimOffset * 2)),
        leftCut: params.isMitred ? 'MITRE' : 'BUTT',
        rightCut: params.isMitred ? 'MITRE' : 'BUTT',
      });
    }

    // Bottom Trim (Horizontal)
    pieces.push({
      position: 'BOTTOM',
      cutLengthMm: params.width + (params.isMitred ? trimOffset * 2 : (params.isMitred ? 0 : -trimOffset * 2)),
      leftCut: params.isMitred ? 'MITRE' : 'BUTT',
      rightCut: params.isMitred ? 'MITRE' : 'BUTT',
    });

    return pieces;
  }
}
