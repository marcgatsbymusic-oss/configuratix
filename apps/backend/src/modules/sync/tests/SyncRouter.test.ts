import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { SyncService, OutboxItem } from '../routers/syncRouter';
import { WorkflowEngine } from '../../workflow/services/WorkflowEngine';

// 1) Hoist the mock factory so it runs before any imports
vi.mock('@prisma/client', () => {
  const mPrisma = {
    installationItem: { update: vi.fn() },
    workflowStepInstance: { update: vi.fn() },
    evidencePhoto: { create: vi.fn() }
  };
  return { 
    PrismaClient: class { constructor() { return mPrisma; } } 
  };
});

vi.mock('../../workflow/services/WorkflowEngine', () => {
  return {
    WorkflowEngine: class {
      evaluateProgression = vi.fn();
    }
  };
});

describe('SyncService Outbox Processor', () => {
  let prisma: any;
  let workflowEngine: any;
  let syncService: SyncService;

  beforeEach(() => {
    prisma = new PrismaClient();
    workflowEngine = new WorkflowEngine(prisma);
    syncService = new SyncService(prisma, workflowEngine);
    vi.clearAllMocks();
  });

  it('Should accept valid chronological syncs (Last-Write-Wins property updates)', async () => {
    const queue: OutboxItem[] = [
      {
        id: '1',
        entityType: 'InstallationItem',
        entityId: 'ITEM_1',
        operation: 'UPDATE',
        payload: { barcodeStatus: 'CONFIRMED' },
        timestamp: new Date('2026-08-05T10:00:00Z').toISOString()
      }
    ];

    const { rejectedIds } = await syncService.processSyncBatch(queue);
    
    expect(rejectedIds.length).toBe(0);
    expect(prisma.installationItem.update).toHaveBeenCalledWith({
      where: { id: 'ITEM_1' },
      data: { barcodeStatus: 'CONFIRMED' }
    });
  });

  it('Should explicitly REJECT invalid complex state transitions pushed from an offline client', async () => {
    // Simulate server rejecting the completion (e.g. because evidence was missing or override pending)
    workflowEngine.evaluateProgression.mockResolvedValue(false);

    const queue: OutboxItem[] = [
      {
        id: '2',
        entityType: 'WorkflowStepInstance',
        entityId: 'STEP_1',
        operation: 'UPDATE',
        payload: { status: 'COMPLETED' },
        timestamp: new Date().toISOString()
      }
    ];

    const { rejectedIds } = await syncService.processSyncBatch(queue);
    
    expect(workflowEngine.evaluateProgression).toHaveBeenCalledWith('STEP_1', 'COMPLETED');
    expect(prisma.workflowStepInstance.update).not.toHaveBeenCalled();
    expect(rejectedIds).toContain('2');
  });

  it('Should ACCEPT valid complex state transitions when server approves', async () => {
    // Simulate server accepting the completion
    workflowEngine.evaluateProgression.mockResolvedValue(true);

    const queue: OutboxItem[] = [
      {
        id: '3',
        entityType: 'WorkflowStepInstance',
        entityId: 'STEP_1',
        operation: 'UPDATE',
        payload: { status: 'COMPLETED' },
        timestamp: new Date().toISOString()
      }
    ];

    const { rejectedIds } = await syncService.processSyncBatch(queue);
    
    expect(workflowEngine.evaluateProgression).toHaveBeenCalledWith('STEP_1', 'COMPLETED');
    expect(prisma.workflowStepInstance.update).toHaveBeenCalled();
    expect(rejectedIds.length).toBe(0);
  });
});
