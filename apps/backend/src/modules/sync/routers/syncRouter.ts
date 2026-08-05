import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { WorkflowEngine } from '../../workflow/services/WorkflowEngine';

// Assume trpc is set up somewhere like this:
// import { publicProcedure, router } from '../../trpc';
// For the scaffold, we'll just implement the core handler logic to be tested.

const outboxItemSchema = z.object({
  id: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  payload: z.any(),
  timestamp: z.string()
});

export type OutboxItem = z.infer<typeof outboxItemSchema>;

export class SyncService {
  private prisma: PrismaClient;
  private workflowEngine: WorkflowEngine;

  constructor(prisma: PrismaClient, workflowEngine: WorkflowEngine) {
    this.prisma = prisma;
    this.workflowEngine = workflowEngine;
  }

  /**
   * Processes a batch of outbox items from the mobile client.
   * Returns a list of rejected item IDs (server authoritative rejection).
   */
  async processSyncBatch(items: OutboxItem[]): Promise<{ rejectedIds: String[] }> {
    const rejectedIds: String[] = [];

    // Sort chronologically (oldest first)
    const sorted = [...items].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const item of sorted) {
      try {
        await this.processItem(item);
      } catch (e) {
        console.error(`[SyncService] Rejected ${item.entityType} ${item.entityId}: ${e}`);
        rejectedIds.push(item.id);
      }
    }

    return { rejectedIds };
  }

  private async processItem(item: OutboxItem) {
    if (item.entityType === 'InstallationItem' && item.operation === 'UPDATE') {
      // Last-Write-Wins property update
      await this.prisma.installationItem.update({
        where: { id: item.entityId },
        data: { barcodeStatus: item.payload.barcodeStatus }
      });
    } 
    else if (item.entityType === 'WorkflowStepInstance' && item.operation === 'UPDATE') {
      // Complex state change: Server authoritative evaluation
      if (item.payload.status === 'COMPLETED') {
        const canComplete = await this.workflowEngine.evaluateProgression(
          item.entityId, 
          'COMPLETED'
        );
        if (!canComplete) {
          throw new Error('Server rejected step completion due to missing evidence or pending overrides.');
        }
        
        await this.prisma.workflowStepInstance.update({
          where: { id: item.entityId },
          data: { status: 'COMPLETED' }
        });
      }
    }
    else if (item.entityType === 'EvidencePhoto' && item.operation === 'CREATE') {
      await this.prisma.evidencePhoto.create({
        data: {
          openingId: item.payload.openingId,
          stepInstanceId: item.payload.stepInstanceId,
          actorId: item.payload.actorId || 'SYSTEM',
          url: item.payload.localPath, // Mocking S3 upload translation
          capturedAt: new Date(item.timestamp)
        }
      });
    }
    else {
      console.warn(`[SyncService] Unhandled entity type: ${item.entityType}`);
    }
  }
}
