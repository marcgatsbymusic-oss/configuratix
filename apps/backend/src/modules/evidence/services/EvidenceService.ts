import { PrismaClient } from '@prisma/client';
import { IStorageAdapter } from './StorageAdapter';
import { EvidenceConfig } from '../config';

const prisma = new PrismaClient();

export class EvidenceService {
  constructor(private storageAdapter: IStorageAdapter) {}

  /**
   * Attaches a photo to a specific step instance of an opening.
   * Evidence photos are additive only, they cannot be updated or deleted.
   */
  async attachPhoto(params: {
    openingId: string;
    stepInstanceId: string;
    actorId: string;
    buffer: Buffer;
    filename: string;
    geotagLat?: number;
    geotagLng?: number;
    capturedAt: Date;
  }) {
    // 1. Save to storage
    const url = await this.storageAdapter.save(params.buffer, params.filename);

    // 2. Persist record (Additive only)
    const record = await prisma.evidencePhoto.create({
      data: {
        openingId: params.openingId,
        stepInstanceId: params.stepInstanceId,
        actorId: params.actorId,
        url,
        geotagLat: params.geotagLat,
        geotagLng: params.geotagLng,
        capturedAt: params.capturedAt,
      }
    });

    return record;
  }

  /**
   * Records a level/plumb measurement, evaluating it against configured tolerances.
   */
  async recordMeasurement(params: {
    openingId: string;
    stepInstanceId: string;
    actorId: string;
    axis: 'X' | 'Y' | 'Z';
    readingValue: number; // Deviation in mm/m, for example
    capturedAt: Date;
  }) {
    // Determine tolerance based on axis
    let tolerance = 0;
    if (params.axis === 'X') tolerance = EvidenceConfig.levellingTolerances.X_AXIS_MAX_DEVIATION_MM;
    if (params.axis === 'Y') tolerance = EvidenceConfig.levellingTolerances.Y_AXIS_MAX_DEVIATION_MM;
    if (params.axis === 'Z') tolerance = EvidenceConfig.levellingTolerances.Z_AXIS_MAX_DEVIATION_MM;

    if (EvidenceConfig.levellingTolerances.PLACEHOLDER_UNVERIFIED) {
      console.warn(`[WARNING] Using PLACEHOLDER_UNVERIFIED levelling tolerance for axis ${params.axis}. Value: ${tolerance}mm. This must not be used in production.`);
    }

    const passed = Math.abs(params.readingValue) <= tolerance;

    const record = await prisma.measurementRecord.create({
      data: {
        openingId: params.openingId,
        stepInstanceId: params.stepInstanceId,
        actorId: params.actorId,
        axis: params.axis,
        readingValue: params.readingValue,
        toleranceUsed: tolerance,
        passed,
        capturedAt: params.capturedAt
      }
    });

    return record;
  }

  /**
   * Retrieves the complete evidence set for an opening, ordered by step sequence and time.
   */
  async getOpeningEvidence(openingId: string) {
    const photos = await prisma.evidencePhoto.findMany({
      where: { openingId },
      include: {
        stepInstance: {
          select: {
            createdAt: true,
            // Assuming sequence might be in definition, but instance creation time is a proxy
          }
        },
        actor: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: [
        { stepInstance: { createdAt: 'asc' } },
        { capturedAt: 'asc' }
      ]
    });

    const measurements = await prisma.measurementRecord.findMany({
      where: { openingId },
      include: {
        stepInstance: {
          select: {
            createdAt: true
          }
        },
        actor: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: [
        { stepInstance: { createdAt: 'asc' } },
        { capturedAt: 'asc' }
      ]
    });

    return {
      photos,
      measurements
    };
  }
}
