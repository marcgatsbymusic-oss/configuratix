import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

export class OrderRouter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // query: getAssignedInstallationList
  async getAssignedInstallationList(crewId: string, dateStr: string) {
    // Scaffold: We'd normally filter by crew assignments for the day.
    return this.prisma.installationList.findMany({
      where: {
        status: { in: ['READY', 'IN_PROGRESS'] }
      },
      include: {
        items: {
          include: { opening: true }
        },
        order: true
      }
    });
  }
}
