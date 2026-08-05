import { WorkflowStepStatus } from '@prisma/client';
import { InstallationContext } from '../models/InstallationContext';

export interface RuleEvaluationResult {
  isIncluded: boolean;
  reason?: string;
}

export class WorkflowEngine {
  constructor(private prisma?: any) {}
  
  /**
   * Evaluates if a step should be included based on the context.
   * Format: `conditionalityRules` is a set of key-value pairs that must all match the context.
   * Empty rules mean always included.
   */
  public evaluateConditionality(
    rules: Record<string, any> | null,
    context: InstallationContext
  ): RuleEvaluationResult {
    if (!rules || Object.keys(rules).length === 0) {
      return { isIncluded: true };
    }

    for (const [key, expectedValue] of Object.entries(rules)) {
      if (context[key] !== expectedValue) {
        return { isIncluded: false, reason: `Context missing or mismatched attribute: ${key}` };
      }
    }

    return { isIncluded: true };
  }

  /**
   * Determines if a step can be started, evaluating preconditions (dependencies)
   * and any blocking timers from its predecessors.
   */
  public canStartStep(
    stepDefinition: { id: string; preconditions: any },
    allInstances: Array<{ definitionId: string; status: WorkflowStepStatus; timerEndsAt: Date | null }>
  ): { canStart: boolean; reason?: string } {
    
    const preconditions = stepDefinition.preconditions as { dependsOn?: string[] } | null;
    
    if (!preconditions || !preconditions.dependsOn || preconditions.dependsOn.length === 0) {
      return { canStart: true };
    }

    for (const parentId of preconditions.dependsOn) {
      const parentInstance = allInstances.find(i => i.definitionId === parentId);
      
      if (!parentInstance) {
        // Parent step doesn't even exist (might have been excluded by conditionality rules).
        // For a robust DAG, if a required parent is excluded, this step should probably be excluded too,
        // but for now, we just say it can't start if the parent isn't completed.
        return { canStart: false, reason: `Dependency ${parentId} is not present or completed.` };
      }

      if (parentInstance.status !== WorkflowStepStatus.COMPLETED) {
        return { canStart: false, reason: `Dependency ${parentId} is not yet completed.` };
      }

      if (parentInstance.timerEndsAt && parentInstance.timerEndsAt > new Date()) {
        return { canStart: false, reason: `Waiting for blocking timer from dependency ${parentId}.` };
      }
    }

    return { canStart: true };
  }

  /**
   * Determines if a step can be marked as COMPLETED.
   * Requires all checklist items to be explicitly checked (true).
   * Requires all evidence requirements to be met (at least one valid photo per requirement).
   */
  public canCompleteStep(
    definition: { checklistItems: any; evidenceRequirements: any; mandatoryChecklistItems?: any },
    instance: { checklistState: any; evidence: any; overrideRequests?: any }
  ): { canComplete: boolean; reason?: string } {
    
    // Validate Checklist
    const requiredChecklist = (definition.checklistItems as string[]) || [];
    const actualChecklist = (instance.checklistState as Record<string, boolean>) || {};

    for (const item of requiredChecklist) {
      if (actualChecklist[item] !== true) {
        return { canComplete: false, reason: `Incomplete checklist item: ${item}` };
      }
    }

    // Validate Mandatory PPE / Safety items that must survive non-selection (FR-5.49)
    const mandatoryChecklist = (definition.mandatoryChecklistItems as string[]) || [];
    for (const item of mandatoryChecklist) {
      if (actualChecklist[item] !== true) {
        return { canComplete: false, reason: `MANDATORY safety/PPE item missed: ${item}. This cannot be skipped.` };
      }
    }

    // Validate Evidence
    // evidenceRequirements could be an array of required tags, e.g., ["FOAM_SEAL_PHOTO", "SCREW_SPACING_PHOTO"]
    // instance.evidence could be an array of objects: { tag: "FOAM_SEAL_PHOTO", url: "..." }
    const requiredEvidence = (definition.evidenceRequirements as string[]) || [];
    const actualEvidence = (instance.evidence as Array<{ tag: string; url: string }>) || [];

    for (const req of requiredEvidence) {
      const hasEvidence = actualEvidence.some(e => e.tag === req && !!e.url);
      if (!hasEvidence) {
        return { canComplete: false, reason: `Missing evidence for requirement: ${req}` };
      }
    }

    // Validate Overrides
    // If there is any PENDING override request on this instance, it is a hard block.
    const overrideRequests = (instance.overrideRequests as Array<{ status: string }>) || [];
    const hasPendingOverride = overrideRequests.some(r => r.status === 'PENDING');
    if (hasPendingOverride) {
      return { canComplete: false, reason: 'A manual override request is currently PENDING approval.' };
    }

    return { canComplete: true };
  }

  /**
   * Helper for the sync router to evaluate progression offline.
   */
  public async evaluateProgression(stepInstanceId: string, status: string): Promise<boolean> {
    if (!this.prisma) return true;
    if (status !== 'COMPLETED') return true;
    const instance = await this.prisma.workflowStepInstance.findUnique({
      where: { id: stepInstanceId },
      include: { definition: true, overrideRequests: true }
    });
    if (!instance) return false;
    const res = this.canCompleteStep(instance.definition, instance);
    return res.canComplete;
  }
}
