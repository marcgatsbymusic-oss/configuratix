import { PrismaClient, UserStatus } from '@prisma/client';

export class UserAdministrationService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Log an administrative action with before/after state
   */
  public async logAuditAction(
    actorId: string,
    actionType: string,
    entityType: string,
    entityId: string,
    beforeValue: any,
    afterValue: any
  ) {
    await this.prisma.auditLogEntry.create({
      data: {
        actorId,
        actionType,
        entityType,
        entityId,
        beforeValue: beforeValue ? JSON.stringify(beforeValue) : null,
        afterValue: afterValue ? JSON.stringify(afterValue) : null,
      },
    });
  }

  /**
   * FR-1.6 - User creation (administrator only, assumed checked upstream)
   */
  public async createUser(actorId: string, email: string, name: string) {
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        status: UserStatus.ACTIVE,
      },
    });

    await this.logAuditAction(actorId, 'CREATE_USER', 'User', user.id, null, user);
    return user;
  }

  /**
   * FR-1.7 - Role assignment
   */
  public async assignRole(
    actorId: string,
    userId: string,
    roleName: string, // Admin, Dispatcher etc.
    organisationId: string,
    projectId?: string,
    crewId?: string
  ) {
    const role = await this.prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    
    const assignment = await this.prisma.roleAssignment.create({
      data: {
        userId,
        roleId: role.id,
        organisationId,
        projectId,
        crewId
      }
    });

    await this.logAuditAction(actorId, 'ASSIGN_ROLE', 'RoleAssignment', assignment.id, null, assignment);
    return assignment;
  }

  /**
   * FR-1.10 - Lifecycle (suspend)
   */
  public async suspendUser(actorId: string, userId: string) {
    const before = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const after = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED }
    });

    await this.logAuditAction(actorId, 'SUSPEND_USER', 'User', userId, before, after);
    return after;
  }

  /**
   * FR-1.10 - Lifecycle (deactivate)
   */
  public async deactivateUser(actorId: string, userId: string) {
    const before = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const after = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.DEACTIVATED }
    });

    await this.logAuditAction(actorId, 'DEACTIVATE_USER', 'User', userId, before, after);
    return after;
  }

  /**
   * FR-1.11 - Set user password
   */
  public async setPassword(actorId: string, userId: string, password: string) {
    const before = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const after = await this.prisma.user.update({
      where: { id: userId },
      data: { password }
    });

    // Redact password value in audit log for security
    const beforeRedacted = { ...before, password: before.password ? '[REDACTED]' : null };
    const afterRedacted = { ...after, password: '[REDACTED]' };
    await this.logAuditAction(actorId, 'SET_PASSWORD', 'User', userId, beforeRedacted, afterRedacted);
    return after;
  }
}
