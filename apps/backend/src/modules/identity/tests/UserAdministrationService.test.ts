import { describe, it, expect, vi } from 'vitest';
import { UserAdministrationService } from '../services/UserAdministrationService';
import { PrismaClient } from '@prisma/client';

describe('UserAdministrationService', () => {
  it('should set user password and log audit action (FR-1.11)', async () => {
    const mockUserBefore = { id: 'user-1', name: 'John Doe', email: 'john@example.com', password: null };
    const mockUserAfter = { id: 'user-1', name: 'John Doe', email: 'john@example.com', password: 'new-secure-password' };

    const mockPrisma = {
      user: {
        findUniqueOrThrow: vi.fn().mockResolvedValue(mockUserBefore),
        update: vi.fn().mockResolvedValue(mockUserAfter)
      },
      auditLogEntry: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' })
      }
    } as unknown as PrismaClient;

    const service = new UserAdministrationService(mockPrisma);
    const updatedUser = await service.setPassword('actor-1', 'user-1', 'new-secure-password');

    expect(mockPrisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'user-1' }
    });

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { password: 'new-secure-password' }
    });

    expect(mockPrisma.auditLogEntry.create).toHaveBeenCalledWith({
      data: {
        actorId: 'actor-1',
        actionType: 'SET_PASSWORD',
        entityType: 'User',
        entityId: 'user-1',
        beforeValue: JSON.stringify({ ...mockUserBefore, password: null }),
        afterValue: JSON.stringify({ ...mockUserAfter, password: '[REDACTED]' })
      }
    });

    expect(updatedUser.password).toBe('new-secure-password');
  });
});
