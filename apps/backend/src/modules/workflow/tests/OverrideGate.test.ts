import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OverrideService } from '../services/OverrideService';
import { WorkflowEngine } from '../services/WorkflowEngine';
import { OverrideStatus } from '@prisma/client';

// Mocking dependencies
const mockPrisma = vi.hoisted(() => ({
  overrideRequest: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  roleAssignment: {
    findMany: vi.fn(),
  }
}));

vi.mock('@prisma/client', () => {
  const mPrismaClient = class {
    overrideRequest = mockPrisma.overrideRequest;
    roleAssignment = mockPrisma.roleAssignment;
  };
  return {
    PrismaClient: mPrismaClient,
    OverrideStatus: {
      PENDING: 'PENDING',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED'
    },
    RoleEnum: {
      SUPERVISOR: 'SUPERVISOR',
      INSTALLER: 'INSTALLER'
    }
  };
});

describe('Override Gate', () => {
  let overrideService: OverrideService;
  let workflowEngine: WorkflowEngine;

  beforeEach(() => {
    overrideService = new OverrideService(mockPrisma);
    workflowEngine = new WorkflowEngine(mockPrisma);
    vi.clearAllMocks();
  });

  it('FR-1.9: Should fail self-approval attempt', async () => {
    // Setup: Request exists, requested by user 'installer-1'
    mockPrisma.overrideRequest.findUnique.mockResolvedValue({
      id: 'req-1',
      status: OverrideStatus.PENDING,
      requestedById: 'installer-1',
    });

    // Action: Same user tries to approve
    await expect(overrideService.approveOverride({
      requestId: 'req-1',
      supervisorId: 'installer-1',
    })).rejects.toThrow(/Separation of duties violation/);
  });

  it('Role Escalation: Should fail approval if user does not hold SUPERVISOR role', async () => {
    mockPrisma.overrideRequest.findUnique.mockResolvedValue({
      id: 'req-1',
      status: OverrideStatus.PENDING,
      requestedById: 'installer-1',
    });

    // Mock role assignments to return empty (no SUPERVISOR role) for 'other-user'
    mockPrisma.roleAssignment.findMany.mockResolvedValue([]);

    await expect(overrideService.approveOverride({
      requestId: 'req-1',
      supervisorId: 'other-user',
    })).rejects.toThrow(/Approver does not hold SUPERVISOR role/);
  });

  it('Should successfully approve if supervisor is a different user with the right role', async () => {
    mockPrisma.overrideRequest.findUnique.mockResolvedValue({
      id: 'req-1',
      status: OverrideStatus.PENDING,
      requestedById: 'installer-1',
    });

    mockPrisma.roleAssignment.findMany.mockResolvedValue([
      { roleId: 'SUPERVISOR' }
    ]);

    mockPrisma.overrideRequest.update.mockResolvedValue({
      id: 'req-1',
      status: OverrideStatus.APPROVED
    });

    const result = await overrideService.approveOverride({
      requestId: 'req-1',
      supervisorId: 'supervisor-1',
    });

    expect(result.status).toBe(OverrideStatus.APPROVED);
    expect(mockPrisma.overrideRequest.update).toHaveBeenCalledWith({
      where: { id: 'req-1' },
      data: expect.objectContaining({ status: OverrideStatus.APPROVED, supervisorId: 'supervisor-1' })
    });
  });

  it('Workflow Block: Should prevent step completion if an override is PENDING', () => {
    const definition = { checklistItems: [], evidenceRequirements: [] };
    const instance = {
      checklistState: {},
      evidence: [],
      overrideRequests: [
        { status: OverrideStatus.APPROVED },
        { status: OverrideStatus.PENDING } // The blocker
      ]
    };

    const result = workflowEngine.canCompleteStep(definition, instance);

    expect(result.canComplete).toBe(false);
    expect(result.reason).toContain('PENDING');
  });

  it('Workflow Block: Should allow step completion if overrides are resolved', () => {
    const definition = { checklistItems: [], evidenceRequirements: [] };
    const instance = {
      checklistState: {},
      evidence: [],
      overrideRequests: [
        { status: OverrideStatus.APPROVED },
        { status: OverrideStatus.REJECTED }
      ]
    };

    const result = workflowEngine.canCompleteStep(definition, instance);

    expect(result.canComplete).toBe(true);
  });
});
