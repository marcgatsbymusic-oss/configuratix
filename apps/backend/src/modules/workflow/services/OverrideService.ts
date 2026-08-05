import { PrismaClient, OverrideStatus } from '@prisma/client';

export class OverrideService {
  constructor(private prisma: any) {}
  /**
   * Request a manual override for an installation step.
   * This immediately blocks the workflow from advancing past this step.
   */
  async requestOverride(params: {
    stepInstanceId: string;
    requestedById: string;
    proposedMethod: string;
    reason: string;
    photos: string[];
  }) {
    const request = await this.prisma.overrideRequest.create({
      data: {
        stepInstanceId: params.stepInstanceId,
        requestedById: params.requestedById,
        proposedMethod: params.proposedMethod,
        reason: params.reason,
        photos: params.photos,
        status: OverrideStatus.PENDING,
      }
    });

    // MOCK NOTIFICATION: Notify supervisor
    console.log(`[MOCK NOTIFICATION] Supervisor alerted: New override request ${request.id} by user ${params.requestedById}`);

    return request;
  }

  /**
   * Approves an override request.
   * Enforces FR-1.9 (Separation of Duties) and requires SUPERVISOR role.
   */
  async approveOverride(params: {
    requestId: string;
    supervisorId: string;
    decisionNotes?: string;
  }) {
    const request = await this.prisma.overrideRequest.findUnique({
      where: { id: params.requestId },
      include: { requestedBy: true }
    });

    if (!request) {
      throw new Error("Override request not found");
    }

    if (request.status !== OverrideStatus.PENDING) {
      throw new Error(`Cannot approve a request with status ${request.status}`);
    }

    // FR-1.9: Separation of Duties. 
    // An installer cannot approve an override on their own work, even if they hold a supervisor role.
    if (request.requestedById === params.supervisorId) {
      throw new Error("Separation of duties violation: cannot self-approve override");
    }

    // Verify the approver actually holds the SUPERVISOR role.
    const supervisorRoles = await this.prisma.roleAssignment.findMany({
      where: {
        userId: params.supervisorId,
        roleId: 'SUPERVISOR'
      }
    });

    if (supervisorRoles.length === 0) {
      throw new Error("Unauthorized: Approver does not hold SUPERVISOR role");
    }

    const updated = await this.prisma.overrideRequest.update({
      where: { id: params.requestId },
      data: {
        status: OverrideStatus.APPROVED,
        supervisorId: params.supervisorId,
        decisionNotes: params.decisionNotes,
      }
    });

    // MOCK NOTIFICATION: Notify installer
    console.log(`[MOCK NOTIFICATION] Installer alerted: Override ${request.id} APPROVED by supervisor ${params.supervisorId}`);

    return updated;
  }

  /**
   * Rejects an override request.
   * Also enforces role and separation of duties checks.
   */
  async rejectOverride(params: {
    requestId: string;
    supervisorId: string;
    decisionNotes: string; // Required for rejection
  }) {
    const request = await this.prisma.overrideRequest.findUnique({
      where: { id: params.requestId }
    });

    if (!request) throw new Error("Override request not found");
    
    if (request.requestedById === params.supervisorId) {
      throw new Error("Separation of duties violation: cannot self-reject override");
    }

    const supervisorRoles = await this.prisma.roleAssignment.findMany({
      where: {
        userId: params.supervisorId,
        roleId: 'SUPERVISOR'
      }
    });

    if (supervisorRoles.length === 0) {
      throw new Error("Unauthorized: Approver does not hold SUPERVISOR role");
    }

    const updated = await this.prisma.overrideRequest.update({
      where: { id: params.requestId },
      data: {
        status: OverrideStatus.REJECTED,
        supervisorId: params.supervisorId,
        decisionNotes: params.decisionNotes,
      }
    });

    console.log(`[MOCK NOTIFICATION] Installer alerted: Override ${request.id} REJECTED by supervisor ${params.supervisorId}. Reason: ${params.decisionNotes}`);

    return updated;
  }
}
