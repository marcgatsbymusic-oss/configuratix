import { PrismaClient } from '@prisma/client';

export class CompetencyGate {
  constructor(private prisma: PrismaClient) {}

  /**
   * Evaluates if a user has the required competencies to perform a given installation profile.
   * Enforces Prompt 8b restrictions.
   */
  async checkCompetencies(userId: string, profileId: string): Promise<{ authorized: boolean; missingCompetencies: string[] }> {
    const profile = await this.prisma.installationProfile.findUnique({
      where: { id: profileId },
      include: { requiredCompetencies: true }
    });

    if (!profile || profile.requiredCompetencies.length === 0) {
      return { authorized: true, missingCompetencies: [] };
    }

    const grants = await this.prisma.competencyGrant.findMany({
      where: {
        userId,
        competencyId: { in: profile.requiredCompetencies.map(c => c.id) },
        OR: [
          { validUntil: null },
          { validUntil: { gt: new Date() } }
        ]
      },
      include: { competency: true }
    });

    const grantedCodes = new Set(grants.map(g => g.competency.code));
    
    const missing = profile.requiredCompetencies
      .filter(req => !grantedCodes.has(req.code))
      .map(req => req.name);

    return {
      authorized: missing.length === 0,
      missingCompetencies: missing
    };
  }
}
