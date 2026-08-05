import { describe, it, expect, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { withAuditLog } from '../AuditInterceptor';

// Minimal mock to simulate Prisma extension behavior for testing the logic
const mPrisma = {
  auditLogEntry: { create: vi.fn() },
  $extends: vi.fn((ext) => {
    // Stub the extended client
    return {
      installationItem: {
        update: async (args: any) => {
          const result = { id: args.where?.id || 'MOCK_ID' };
          if (ext.query?.installationItem?.update) {
            return ext.query.installationItem.update({ args, query: async () => result });
          }
          return result;
        }
      }
    };
  })
};

vi.mock('@prisma/client', () => {
  return { 
    PrismaClient: class { constructor() { return mPrisma; } } 
  };
});

describe('Audit Interceptor', () => {
  it('Should automatically write an AuditLogEntry when InstallationItem is updated', async () => {
    const rawPrisma = new PrismaClient();
    const auditedPrisma = withAuditLog(rawPrisma, 'USER_123');

    // Perform an update through the audited client
    await (auditedPrisma as any).installationItem.update({
      where: { id: 'ITEM_1' },
      data: { barcodeStatus: 'DAMAGED' }
    });

    expect(mPrisma.auditLogEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          actionType: 'UPDATE',
          entityType: 'InstallationItem',
          entityId: 'ITEM_1',
          afterValue: { barcodeStatus: 'DAMAGED' },
          actorId: 'USER_123'
        }
      })
    );
  });
});
