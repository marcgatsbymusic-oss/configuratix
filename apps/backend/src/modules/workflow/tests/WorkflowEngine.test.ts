import { describe, it, expect } from 'vitest';
import { WorkflowEngine } from '../services/WorkflowEngine';
import { WorkflowStepStatus } from '@prisma/client';
import { InstallationContext } from '../models/InstallationContext';

describe('WorkflowEngine', () => {
  const engine = new WorkflowEngine();

  describe('evaluateConditionality', () => {
    it('should include steps with no rules', () => {
      const context: InstallationContext = { openingId: '1' };
      const res = engine.evaluateConditionality({}, context);
      expect(res.isIncluded).toBe(true);
    });

    it('should include steps when context exactly matches rules', () => {
      const context: InstallationContext = { openingId: '1', installationType: 'machine', material: 'PVC' };
      const rules = { installationType: 'machine' };
      const res = engine.evaluateConditionality(rules, context);
      expect(res.isIncluded).toBe(true);
    });

    it('should exclude steps when context mismatches rules', () => {
      const context: InstallationContext = { openingId: '1', installationType: 'manual' };
      const rules = { installationType: 'machine' };
      const res = engine.evaluateConditionality(rules, context);
      expect(res.isIncluded).toBe(false);
      expect(res.reason).toContain('mismatched attribute: installationType');
    });

    it('should exclude steps when context is missing the required attribute', () => {
      const context: InstallationContext = { openingId: '1' };
      const rules = { requiresSpecialCure: true };
      const res = engine.evaluateConditionality(rules, context);
      expect(res.isIncluded).toBe(false);
    });
  });

  describe('canStartStep', () => {
    it('should allow starting if no preconditions', () => {
      const res = engine.canStartStep({ id: 'step2', preconditions: {} }, []);
      expect(res.canStart).toBe(true);
    });

    it('should block starting if dependent step is missing or not completed', () => {
      const instances = [
        { definitionId: 'step1', status: WorkflowStepStatus.IN_PROGRESS, timerEndsAt: null }
      ];
      const res = engine.canStartStep({ id: 'step2', preconditions: { dependsOn: ['step1'] } }, instances);
      expect(res.canStart).toBe(false);
      expect(res.reason).toContain('not yet completed');
    });

    it('should allow starting if dependent step is completed and has no active timer', () => {
      const instances = [
        { definitionId: 'step1', status: WorkflowStepStatus.COMPLETED, timerEndsAt: null }
      ];
      const res = engine.canStartStep({ id: 'step2', preconditions: { dependsOn: ['step1'] } }, instances);
      expect(res.canStart).toBe(true);
    });

    it('should block starting if dependent step has an active blocking timer', () => {
      const futureTime = new Date();
      futureTime.setMinutes(futureTime.getMinutes() + 10); // 10 mins in future

      const instances = [
        { definitionId: 'step1', status: WorkflowStepStatus.COMPLETED, timerEndsAt: futureTime }
      ];
      const res = engine.canStartStep({ id: 'step2', preconditions: { dependsOn: ['step1'] } }, instances);
      expect(res.canStart).toBe(false);
      expect(res.reason).toContain('Waiting for blocking timer');
    });

    it('should allow starting if dependent step blocking timer has elapsed', () => {
      const pastTime = new Date();
      pastTime.setMinutes(pastTime.getMinutes() - 10); // 10 mins in past

      const instances = [
        { definitionId: 'step1', status: WorkflowStepStatus.COMPLETED, timerEndsAt: pastTime }
      ];
      const res = engine.canStartStep({ id: 'step2', preconditions: { dependsOn: ['step1'] } }, instances);
      expect(res.canStart).toBe(true);
    });
  });

  describe('canCompleteStep', () => {
    const definition = {
      checklistItems: ['Clean frame', 'Apply foam'],
      evidenceRequirements: ['FOAM_PHOTO']
    };

    it('should block completion if checklist is incomplete', () => {
      const instance = {
        checklistState: { 'Clean frame': true, 'Apply foam': false },
        evidence: [{ tag: 'FOAM_PHOTO', url: 'http://example.com/photo.jpg' }]
      };
      const res = engine.canCompleteStep(definition, instance);
      expect(res.canComplete).toBe(false);
      expect(res.reason).toContain('Incomplete checklist item: Apply foam');
    });

    it('should block completion if evidence is missing', () => {
      const instance = {
        checklistState: { 'Clean frame': true, 'Apply foam': true },
        evidence: []
      };
      const res = engine.canCompleteStep(definition, instance);
      expect(res.canComplete).toBe(false);
      expect(res.reason).toContain('Missing evidence for requirement: FOAM_PHOTO');
    });

    it('should block completion if evidence is present but empty URL', () => {
      const instance = {
        checklistState: { 'Clean frame': true, 'Apply foam': true },
        evidence: [{ tag: 'FOAM_PHOTO', url: '' }]
      };
      const res = engine.canCompleteStep(definition, instance);
      expect(res.canComplete).toBe(false);
      expect(res.reason).toContain('Missing evidence for requirement: FOAM_PHOTO');
    });

    it('should allow completion if all checklist items and evidence are met', () => {
      const instance = {
        checklistState: { 'Clean frame': true, 'Apply foam': true },
        evidence: [{ tag: 'FOAM_PHOTO', url: 'http://example.com/photo.jpg' }]
      };
      const res = engine.canCompleteStep(definition, instance);
      expect(res.canComplete).toBe(true);
    });
  });
});
