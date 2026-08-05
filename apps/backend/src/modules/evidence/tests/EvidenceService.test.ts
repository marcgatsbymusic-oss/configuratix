import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvidenceService } from '../services/EvidenceService';
import { LocalDiskStorageAdapter } from '../services/StorageAdapter';

// 1. Hoist the mock to the top level
vi.mock('@prisma/client', () => {
  const mPrismaClient = class {
    evidencePhoto = {
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'photo-1', ...args.data })),
      findMany: vi.fn().mockResolvedValue([
        { id: 'photo-1', capturedAt: new Date('2024-01-01T10:00:00Z'), stepInstance: { createdAt: new Date('2024-01-01T09:00:00Z') } }
      ])
    };
    measurementRecord = {
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'meas-1', ...args.data })),
      findMany: vi.fn().mockResolvedValue([])
    };
  };
  return { PrismaClient: mPrismaClient };
});

// Mock the storage adapter
class MockStorageAdapter extends LocalDiskStorageAdapter {
  constructor() {
    super('/tmp/mock');
  }
  async save(buffer: Buffer, filename: string): Promise<string> {
    return `/mock/uploads/${filename}`;
  }
}

describe('EvidenceService', () => {
  let service: EvidenceService;
  
  // Use a common set of IDs for mock references
  const openingId = 'opening-123';
  const stepInstanceId = 'step-123';
  const actorId = 'actor-123';

  beforeEach(() => {
    service = new EvidenceService(new MockStorageAdapter());
  });

  it('should attach a photo and return an immutable record', async () => {
    const buffer = Buffer.from('mock-image-data');
    const result = await service.attachPhoto({
      openingId,
      stepInstanceId,
      actorId,
      buffer,
      filename: 'test.jpg',
      geotagLat: 50.0,
      geotagLng: 19.0,
      capturedAt: new Date()
    });

    expect(result).toHaveProperty('id');
    expect(result.url).toBe('/mock/uploads/test.jpg');
    expect(result.geotagLat).toBe(50.0);
    // Notice there's no update/delete method on EvidenceService, enforcing immutability natively
  });

  it('should record a measurement and evaluate tolerance correctly', async () => {
    // We expect a console warning due to PLACEHOLDER_UNVERIFIED
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Assuming X axis tolerance is 2.0 (placeholder)
    const resultPass = await service.recordMeasurement({
      openingId,
      stepInstanceId,
      actorId,
      axis: 'X',
      readingValue: 1.5, // Pass
      capturedAt: new Date()
    });

    expect(resultPass.passed).toBe(true);
    expect(resultPass.toleranceUsed).toBe(2.0);

    const resultFail = await service.recordMeasurement({
      openingId,
      stepInstanceId,
      actorId,
      axis: 'X',
      readingValue: 2.5, // Fail
      capturedAt: new Date()
    });

    expect(resultFail.passed).toBe(false);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('PLACEHOLDER_UNVERIFIED'));
    consoleSpy.mockRestore();
  });
});
