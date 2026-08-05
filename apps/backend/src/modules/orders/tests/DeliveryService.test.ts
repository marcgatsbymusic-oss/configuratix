import { describe, it, expect, vi } from 'vitest';
import { DeliveryService } from '../services/DeliveryService';
import { PrismaClient } from '@prisma/client';

describe('DeliveryService', () => {
  it('should scan shipment order number to open the matching Installation List (FR-2.4)', async () => {
    const mockPrisma = {
      installationList: {
        findFirst: vi.fn().mockResolvedValue({ id: 'list-1', order: { orderNumber: 'SHIP-001' } })
      }
    } as unknown as PrismaClient;

    const service = new DeliveryService(mockPrisma);
    const list = await service.getInstallationListByShipment('SHIP-001');

    expect(mockPrisma.installationList.findFirst).toHaveBeenCalledWith({
      where: { order: { orderNumber: 'SHIP-001' } },
      include: { items: true, order: true }
    });
    expect(list.id).toBe('list-1');
  });

  it('should throw an error if no installation list is found', async () => {
    const mockPrisma = {
      installationList: { findFirst: vi.fn().mockResolvedValue(null) }
    } as unknown as PrismaClient;

    const service = new DeliveryService(mockPrisma);
    await expect(service.getInstallationListByShipment('UNKNOWN')).rejects.toThrow('No installation list found for shipment: UNKNOWN');
  });

  it('should record discrepancy and block item (FR-2.7)', async () => {
    const mockPrisma = {
      discrepancy: { create: vi.fn().mockResolvedValue({ id: 'disc-1' }) },
      installationItem: { update: vi.fn().mockResolvedValue({ id: 'item-1', barcodeStatus: 'DISCREPANCY' }) }
    } as unknown as PrismaClient;

    const service = new DeliveryService(mockPrisma);
    await service.logDiscrepancy('item-1', 'DAMAGED', 'Scratched glass', null, 'user-1');

    expect(mockPrisma.discrepancy.create).toHaveBeenCalledWith({
      data: {
        itemId: 'item-1',
        type: 'DAMAGED',
        reason: 'Scratched glass',
        photoUrl: null,
        reportedBy: 'user-1'
      }
    });

    expect(mockPrisma.installationItem.update).toHaveBeenCalledWith({
      where: { id: 'item-1' },
      data: { barcodeStatus: 'DISCREPANCY' }
    });
  });
});
