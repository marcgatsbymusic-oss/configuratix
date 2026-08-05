import { PrismaClient } from '@prisma/client';
import { ComplianceConfig, isComplianceConfigVerified } from '../config/ComplianceConfig';

export class ExtractionSubFlowService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Check if hazardous material warning needs to be displayed based on building age.
   */
  public evaluateHazardousMaterialRisk(buildingYearBuilt: number): { block: boolean, promptText?: string } {
    if (!isComplianceConfigVerified()) {
      // Per FR-5.50 guardrails, we block execution until compliance provides the exact years and texts
      throw new Error("Cannot evaluate hazardous material risk: Legal compliance configuration is marked as PLACEHOLDER_UNVERIFIED.");
    }
    
    const threshold = ComplianceConfig.hazardousMaterialBuildingAgeThresholdYear as unknown as number;
    
    if (buildingYearBuilt <= threshold) {
      return { 
        block: true, 
        promptText: ComplianceConfig.hazardousMaterialPromptText as unknown as string 
      };
    }
    
    return { block: false };
  }

  /**
   * Records the state of the existing unit before extraction (FR-5.44)
   */
  public async declareExistingUnit(openingId: string, material: string, condition: string, disposalMethod: string) {
    return await this.prisma.existingUnitRecord.create({
      data: {
        openingId,
        material,
        condition,
        disposalMethod
      }
    });
  }

  /**
   * Explicit proceed/stop confirmation before destructive work (FR-5.45)
   */
  public async recordDestructiveWorkConsent(stepInstanceId: string, consentGiven: boolean) {
    if (!consentGiven) {
      throw new Error("Destructive work aborted by user.");
    }
    
    // Update step instance checklist state
    const instance = await this.prisma.workflowStepInstance.findUnique({ where: { id: stepInstanceId }});
    if (instance) {
      const checklist = (instance.checklistState as Record<string, boolean>) || {};
      checklist['destructive_work_consent'] = true;
      await this.prisma.workflowStepInstance.update({
        where: { id: stepInstanceId },
        data: { checklistState: checklist }
      });
    }
  }
}
