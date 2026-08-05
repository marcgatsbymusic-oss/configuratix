import { PrismaClient } from '@prisma/client';

export interface ForecastRange {
  minMinutes: number;
  maxMinutes: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class ForecastingEngine {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generates a statistical range forecast (FR-6.17).
   * Confident single-number forecasts are an anti-pattern.
   * Recalibrates after every completed item.
   */
  public generateForecast(
    totalItems: number,
    completedItems: number,
    historicalAverageMin: number = 45
  ): ForecastRange {
    const remaining = totalItems - completedItems;
    if (remaining <= 0) return { minMinutes: 0, maxMinutes: 0, confidence: 'HIGH' };

    // As we complete more items, our confidence grows and the range narrows.
    let variancePercent = 0.5; // Start with ±50%
    let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    if (completedItems > 0) {
      // Recalibrate (mock logic: narrow variance by 10% per completed item)
      variancePercent = Math.max(0.1, 0.5 - (completedItems * 0.1));
      
      if (variancePercent <= 0.2) {
        confidence = 'HIGH';
      } else if (variancePercent <= 0.4) {
        confidence = 'MEDIUM';
      }
    }

    const estimatedBase = remaining * historicalAverageMin;
    const minMinutes = Math.floor(estimatedBase * (1 - variancePercent));
    const maxMinutes = Math.ceil(estimatedBase * (1 + variancePercent));

    return { minMinutes, maxMinutes, confidence };
  }

  public async saveInstallerEstimate(listId: string, installerEstimate: number, systemForecast: ForecastRange) {
    return await this.prisma.estimate.create({
      data: {
        listId,
        installerEstimate,
        systemForecast: systemForecast as any
      }
    });
  }
}
