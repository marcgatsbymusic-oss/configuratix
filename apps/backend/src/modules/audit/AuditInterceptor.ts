import { PrismaClient } from '@prisma/client';

/**
 * Wraps a PrismaClient to automatically log mutations on audited models.
 * Implements FR-7.1 and FR-7.2.
 */
export function withAuditLog(prisma: PrismaClient, actorId: string) {
  // Using Prisma Client Extensions (mockable logic)
  return prisma.$extends({
    query: {
      installationItem: {
        async update({ args, query }) {
          const result = await query(args);
          
          await prisma.auditLogEntry.create({
            data: {
              actionType: 'UPDATE',
              entityType: 'InstallationItem',
              entityId: result.id,
              afterValue: args.data as any,
              actorId: actorId
            }
          });
          
          return result;
        }
      },
      workflowStepInstance: {
        async update({ args, query }) {
          const result = await query(args);
          
          await prisma.auditLogEntry.create({
            data: {
              actionType: 'UPDATE',
              entityType: 'WorkflowStepInstance',
              entityId: result.id,
              afterValue: args.data as any,
              actorId: actorId
            }
          });
          
          return result;
        }
      },
      overrideRequest: {
        async create({ args, query }) {
          const result = await query(args);
          
          await prisma.auditLogEntry.create({
            data: {
              actionType: 'CREATE',
              entityType: 'OverrideRequest',
              entityId: result.id,
              afterValue: args.data as any,
              actorId: actorId
            }
          });
          
          return result;
        },
        async update({ args, query }) {
          const result = await query(args);
          
          await prisma.auditLogEntry.create({
            data: {
              actionType: 'UPDATE',
              entityType: 'OverrideRequest',
              entityId: result.id,
              afterValue: args.data as any,
              actorId: actorId
            }
          });
          
          return result;
        }
      }
    }
  });
}
