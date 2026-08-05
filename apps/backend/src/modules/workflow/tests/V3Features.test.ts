import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HandlingRuleService } from '../services/HandlingRuleService';
import { CompetencyGate } from '../services/CompetencyGate';
import { ExtractionSubFlowService } from '../services/ExtractionSubFlowService';
import { TrimCalculatorService } from '../services/TrimCalculatorService';
import { ForecastingEngine } from '../services/ForecastingEngine';

const mockPrisma = vi.hoisted(() => ({
  installationProfile: { findUnique: vi.fn() },
  competencyGrant: { findMany: vi.fn() },
}));

describe('V3 Feature Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HandlingRuleService (Prompt 8b)', () => {
    it('throws error when PLACEHOLDER_UNVERIFIED is used in config', () => {
      const service = new HandlingRuleService();
      // Since our config hardcodes PLACEHOLDER_UNVERIFIED by default, this MUST throw.
      expect(() => service.evaluateHandling(50, 1000, 2000)).toThrowError(/PLACEHOLDER_UNVERIFIED/);
    });
  });

  describe('CompetencyGate (Prompt 8b)', () => {
    it('authorizes if no competencies are required', async () => {
      const gate = new CompetencyGate(mockPrisma as any);
      mockPrisma.installationProfile.findUnique.mockResolvedValue({ requiredCompetencies: [] });
      const result = await gate.checkCompetencies('u1', 'p1');
      expect(result.authorized).toBe(true);
    });

    it('denies if required competencies are missing', async () => {
      const gate = new CompetencyGate(mockPrisma as any);
      mockPrisma.installationProfile.findUnique.mockResolvedValue({
        requiredCompetencies: [{ id: 'c1', code: 'CERT_1', name: 'Cert 1' }]
      });
      mockPrisma.competencyGrant.findMany.mockResolvedValue([]);
      
      const result = await gate.checkCompetencies('u1', 'p1');
      expect(result.authorized).toBe(false);
      expect(result.missingCompetencies).toContain('Cert 1');
    });
  });

  describe('ExtractionSubFlowService (Prompt 9)', () => {
    it('throws error on evaluateHazardousMaterialRisk due to unverified compliance config', () => {
      const service = new ExtractionSubFlowService(mockPrisma as any);
      expect(() => service.evaluateHazardousMaterialRisk(1970)).toThrowError(/PLACEHOLDER_UNVERIFIED/);
    });
  });

  describe('TrimCalculatorService (Prompt 12)', () => {
    it('throws error when PLACEHOLDER_UNVERIFIED is present in formulas/datum', () => {
      const service = new TrimCalculatorService();
      expect(() => service.calculateTrimPieces({
        width: 1000, height: 1000, jointGap: 10, selectedWidthMm: 40, isMitred: true, hasBlindBox: false, frameOverlapMm: 5
      })).toThrowError(/PLACEHOLDER_UNVERIFIED/);
    });
  });

  describe('ForecastingEngine (Prompt 12b)', () => {
    it('generates a range forecast (never a point estimate) and narrows variance on completion', () => {
      const engine = new ForecastingEngine(mockPrisma as any);
      
      // Start of job: 0/10 completed
      const initialForecast = engine.generateForecast(10, 0, 45);
      expect(initialForecast.minMinutes).toBeLessThan(initialForecast.maxMinutes);
      expect(initialForecast.confidence).toBe('LOW');

      // Mid job: 6/10 completed (variance narrows, confidence increases)
      const midForecast = engine.generateForecast(10, 6, 45);
      expect(midForecast.confidence).toBe('HIGH');
      
      // Check variance narrowing
      const initialVariance = initialForecast.maxMinutes - initialForecast.minMinutes;
      const midVariance = midForecast.maxMinutes - midForecast.minMinutes;
      
      // We expect the variance size (range) to be significantly smaller later in the job
      // Note: we are also multiplying by a smaller remaining base (4 items vs 10 items),
      // which also naturally shrinks the absolute range.
      expect(midVariance).toBeLessThan(initialVariance);
    });
  });
});
