import { HandlingConfig, isHandlingConfigVerified } from '../config/HandlingConfig';

export interface HandlingRecommendation {
  crewSize: number;
  requiresMechanicalAid: boolean;
  warnings: string[];
}

export class HandlingRuleService {
  public evaluateHandling(
    weightKg: number | null,
    widthMm: number | null,
    heightMm: number | null
  ): HandlingRecommendation {
    if (!isHandlingConfigVerified()) {
      console.error("[SAFETY BLOCK] Attempted to evaluate handling rules with unverified thresholds.");
      throw new Error("Cannot evaluate handling requirements: Compliance thresholds (weight/size) are marked as PLACEHOLDER_UNVERIFIED.");
    }

    // Casts are safe because we verified they aren't placeholders
    const max1Person = HandlingConfig.maxWeight1Person as unknown as number;
    const max2People = HandlingConfig.maxWeight2People as unknown as number;
    const mechAidThreshKg = HandlingConfig.mechanicalAidThresholdKg as unknown as number;
    const mechAidThreshWidth = HandlingConfig.mechanicalAidThresholdWidthMm as unknown as number;
    const mechAidThreshHeight = HandlingConfig.mechanicalAidThresholdHeightMm as unknown as number;

    const result: HandlingRecommendation = {
      crewSize: 1,
      requiresMechanicalAid: false,
      warnings: []
    };

    if (weightKg !== null) {
      if (weightKg > max2People || weightKg > mechAidThreshKg) {
        result.crewSize = 2; // Usually 2+ with mechanical aid
        result.requiresMechanicalAid = true;
        result.warnings.push("Weight exceeds manual handling limits. Mechanical aid mandatory.");
      } else if (weightKg > max1Person) {
        result.crewSize = 2;
      }
    } else {
      result.warnings.push("Item weight is unknown. Assume maximum caution.");
      result.crewSize = 2;
    }

    if (widthMm !== null && widthMm > mechAidThreshWidth) {
      result.requiresMechanicalAid = true;
      result.warnings.push(`Width exceeds ${mechAidThreshWidth}mm. Mechanical aid mandatory.`);
    }

    if (heightMm !== null && heightMm > mechAidThreshHeight) {
      result.requiresMechanicalAid = true;
      result.warnings.push(`Height exceeds ${mechAidThreshHeight}mm. Mechanical aid mandatory.`);
    }

    return result;
  }
}
