import { PrismaClient } from '@prisma/client';

export class HandoverReportService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generates the structured JSON payload for a completed InstallationList.
   * This highlights discrepancies, overrides, and out-of-tolerance measurements.
   * FR-7.3
   */
  async generateHandoverReport(listId: string) {
    const installationList = await this.prisma.installationList.findUnique({
      where: { id: listId },
      include: {
        order: true,
        items: {
          include: {
            opening: {
              include: {
                workflowInstances: {
                  include: {
                    definition: true,
                    evidencePhotos: true,
                    measurements: true,
                    overrideRequests: true
                  }
                },
                evidencePhotos: true,
                measurements: true
              }
            },
            discrepancy: true
          }
        }
      }
    });

    if (!installationList) {
      throw new Error(`InstallationList ${listId} not found.`);
    }

    const report: any = {
      orderId: installationList.orderId,
      status: installationList.status,
      generatedAt: new Date().toISOString(),
      openings: [],
      complianceHighlights: {
        overrides: [],
        outOfToleranceMeasurements: [],
        discrepancies: []
      }
    };

    const processedOpenings = new Set<string>();

    for (const item of installationList.items) {
      if (item.discrepancy) {
        report.complianceHighlights.discrepancies.push({
          itemId: item.id,
          type: item.discrepancy.type,
          resolved: item.discrepancy.resolved
        });
      }

      if (item.opening && !processedOpenings.has(item.opening.id)) {
        processedOpenings.add(item.opening.id);
        
        const openingData: any = {
          reference: item.opening.reference,
          room: item.opening.room,
          steps: []
        };

        for (const step of item.opening.workflowInstances) {
          openingData.steps.push({
            name: step.definition.name,
            status: step.status,
            completedAt: step.completedAt
          });

          // Check for out-of-tolerance measurements
          for (const measurement of step.measurements) {
            if (!measurement.passed) {
              report.complianceHighlights.outOfToleranceMeasurements.push({
                openingReference: item.opening.reference,
                step: step.definition.name,
                axis: measurement.axis,
                reading: measurement.readingValue,
                toleranceUsed: measurement.toleranceUsed
              });
            }
          }

          // Check for overrides
          for (const override of step.overrideRequests) {
            report.complianceHighlights.overrides.push({
              openingReference: item.opening.reference,
              step: step.definition.name,
              status: override.status,
              reason: override.reason,
              approvedBy: override.supervisorId
            });
          }
        }

        report.openings.push(openingData);
      }
    }

    return report;
  }
}
