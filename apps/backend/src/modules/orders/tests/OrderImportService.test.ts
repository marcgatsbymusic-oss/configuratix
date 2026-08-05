import { describe, it, expect, vi } from 'vitest';
import { OrderImportService } from '../services/OrderImportService';
import { IOrderParserAdapter, ParsedOrder } from '../interfaces/IOrderParserAdapter';

describe('OrderImportService', () => {
  it('should correctly classify joinery and non-joinery items (FR-2.1)', async () => {
    // Mock the Prisma client
    const mockPrisma = {
      order: { create: vi.fn().mockResolvedValue({ id: 'order-1' }) },
      installationList: { 
        create: vi.fn().mockResolvedValue({ id: 'list-1' }),
        findUnique: vi.fn().mockResolvedValue({ id: 'list-1', items: [] })
      },
      installationItem: { create: vi.fn().mockResolvedValue({ id: 'item-1' }) },
    } as any;

    // Mock the parser adapter
    const mockAdapter: IOrderParserAdapter = {
      parse: vi.fn().mockResolvedValue({
        orderNumber: 'TEST-001',
        items: [
          { category: 'WINDOW', description: 'Window 1' },
          { category: 'DOOR', description: 'Door 1' },
          { category: 'ACCESSORY', description: 'Handle' },
          { category: 'SERVICE', description: 'Delivery' }
        ]
      } as ParsedOrder)
    };

    const service = new OrderImportService(mockPrisma, mockAdapter);
    await service.importOrder(Buffer.from('fake data'));

    expect(mockPrisma.installationItem.create).toHaveBeenCalledTimes(4);

    // Verify JOINERY classification
    expect(mockPrisma.installationItem.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ category: 'WINDOW', type: 'JOINERY' })
    }));
    expect(mockPrisma.installationItem.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ category: 'DOOR', type: 'JOINERY' })
    }));

    // Verify NON_JOINERY classification
    expect(mockPrisma.installationItem.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ category: 'ACCESSORY', type: 'NON_JOINERY' })
    }));
    expect(mockPrisma.installationItem.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ category: 'SERVICE', type: 'NON_JOINERY' })
    }));
  });
});
