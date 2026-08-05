import { PrismaClient } from '@prisma/client';

export class AdHocTaskService {
  constructor(private prisma: PrismaClient) {}

  public async recordAdHocTask(itemId: string, description: string, durationMinutes: number) {
    // Record free-text or curated interim task (FR-5.53 to FR-5.56)
    return await this.prisma.adHocTask.create({
      data: {
        itemId,
        description,
        durationMinutes
      }
    });
  }

  public async getCuratedTasks() {
    // Seeded curated list minimally.
    // Meant to grow from observed free-text entries.
    return [
      "Site clearing",
      "Substrate repair",
      "Client walkaround"
    ];
  }
}
