import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { OverrideService } from '../services/OverrideService';

// Stubbing TRPC router logic for scaffold
export class WorkflowRouter {
  private prisma: PrismaClient;
  private overrideService: OverrideService;

  constructor(prisma: PrismaClient, overrideService: OverrideService) {
    this.prisma = prisma;
    this.overrideService = overrideService;
  }

  // query: getOpeningWorkflow
  async getOpeningWorkflow(openingId: string) {
    return this.prisma.workflowStepInstance.findMany({
      where: { openingId },
      include: {
        definition: true,
        evidencePhotos: true,
        overrideRequests: true
      },
      orderBy: {
        definition: { sequence: 'asc' }
      }
    });
  }

  // query: getPendingOverrides
  async getPendingOverrides(projectId?: string) {
    // In reality, we'd scope by supervisor's assigned projects
    return this.prisma.overrideRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        stepInstance: {
          include: { opening: true }
        },
        requestedBy: true
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  // mutation: resolveOverrideRequest
  async resolveOverrideRequest(input: {
    requestId: string;
    supervisorId: string;
    decision: 'APPROVED' | 'REJECTED';
    notes?: string;
  }) {
    if (input.decision === 'APPROVED') {
      return this.overrideService.approveOverride({
        requestId: input.requestId,
        supervisorId: input.supervisorId,
        decisionNotes: input.notes
      });
    } else {
      return this.overrideService.rejectOverride({
        requestId: input.requestId,
        supervisorId: input.supervisorId,
        decisionNotes: input.notes || 'No notes provided'
      });
    }
  }
}
