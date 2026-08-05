import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { HandoverReportService } from '../services/HandoverReportService';

// Mock Prisma
const mockFindUnique = vi.fn();
vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      installationList = { findUnique: mockFindUnique };
    }
  };
});

describe('HandoverReportService', () => {
  let service: HandoverReportService;

  beforeEach(() => {
    const prisma = new PrismaClient();
    service = new HandoverReportService(prisma);
    vi.clearAllMocks();
  });

  it('Should generate a handover report and explicitly highlight overrides and missed tolerances', async () => {
    // Scaffold a mock installation list with an override and a failed measurement
    mockFindUnique.mockResolvedValue({
      id: 'LIST_123',
      orderId: 'ORDER_001',
      status: 'COMPLETED',
      items: [
        {
          id: 'ITEM_1',
          opening: {
            id: 'OPENING_1',
            reference: 'W-01',
            room: 'Living Room',
            workflowInstances: [
              {
                definition: { name: 'LEVELLING' },
                status: 'COMPLETED',
                measurements: [
                  { axis: 'X', readingValue: 4, toleranceUsed: 2, passed: false } // FAILED TOLERANCE
                ],
                overrideRequests: []
              },
              {
                definition: { name: 'MECHANICAL_FIXING' },
                status: 'COMPLETED',
                measurements: [],
                overrideRequests: [
                  { status: 'APPROVED', reason: 'Substrate crumbled', supervisorId: 'SUP_99' } // OVERRIDE
                ]
              }
            ]
          }
        }
      ]
    });

    const report = await service.generateHandoverReport('LIST_123');

    // Basic structure
    expect(report.orderId).toBe('ORDER_001');
    expect(report.openings.length).toBe(1);
    expect(report.openings[0].reference).toBe('W-01');

    // Compliance highlights
    expect(report.complianceHighlights.outOfToleranceMeasurements.length).toBe(1);
    expect(report.complianceHighlights.outOfToleranceMeasurements[0].reading).toBe(4);
    
    expect(report.complianceHighlights.overrides.length).toBe(1);
    expect(report.complianceHighlights.overrides[0].reason).toBe('Substrate crumbled');
  });
});
