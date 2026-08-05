import { PrismaClient } from '@prisma/client';

export class OpeningAssignmentService {
  constructor(private prisma: PrismaClient) {}

  async createOpening(room: string, elevation: string, reference: string, projectId?: string) {
    return await this.prisma.opening.create({
      data: { room, elevation, reference, projectId }
    });
  }

  async assignItemToOpening(itemId: string, openingId: string) {
    const item = await this.prisma.installationItem.findUnique({ where: { id: itemId } });
    if (!item || item.type !== 'JOINERY') {
      throw new Error('Only JOINERY items can be assigned to an Opening.');
    }
    
    return await this.prisma.installationItem.update({
      where: { id: itemId },
      data: { openingId }
    });
  }
}
