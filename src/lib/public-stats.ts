import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

export interface PublicStats {
  soulsWon: number; // décisions pour Christ cumulées
  crusades: number; // activités de type croisade (toutes variantes)
  schoolsVisited: number;
  marketOutreach: number;
  humanitarian: number;
  missionaries: number;
  peopleReached: number;
  activitiesCount: number;
  partnerChurches: number;
}

const CRUSADE_TYPES: ActivityType[] = [
  ActivityType.CRUSADE,
  ActivityType.YOUTH_CRUSADE,
  ActivityType.POP_UP_CRUSADE,
];

// Source unique de vérité des chiffres publics de LiFAC : toutes les pages
// (accueil, activités, à propos, événements) doivent s'appuyer dessus pour
// éviter d'afficher des totaux divergents d'une page à l'autre.
export async function getPublicStats(): Promise<PublicStats> {
  try {
    const [reachAgg, crusades, schoolsVisited, marketOutreach, humanitarian, missionaries, activitiesCount, partnerChurches] =
      await Promise.all([
        prisma.activity.aggregate({
          _sum: { decisionsForChrist: true, actualParticipants: true, estimatedParticipants: true },
        }),
        prisma.activity.count({ where: { type: { in: CRUSADE_TYPES } } }),
        prisma.school.count(),
        prisma.activity.count({ where: { type: ActivityType.MARKET_OUTREACH } }),
        prisma.activity.count({ where: { type: ActivityType.HUMANITARIAN } }),
        prisma.user.count({ where: { role: "VOLUNTEER", isActive: true } }),
        prisma.activity.count(),
        prisma.partnerChurch.count({ where: { isActive: true } }),
      ]);

    return {
      soulsWon: reachAgg._sum.decisionsForChrist ?? 0,
      crusades,
      schoolsVisited,
      marketOutreach,
      humanitarian,
      missionaries,
      peopleReached: reachAgg._sum.actualParticipants ?? reachAgg._sum.estimatedParticipants ?? 0,
      activitiesCount,
      partnerChurches,
    };
  } catch (e) {
    console.error("[getPublicStats] Erreur :", e);
    return {
      soulsWon: 0,
      crusades: 0,
      schoolsVisited: 0,
      marketOutreach: 0,
      humanitarian: 0,
      missionaries: 0,
      peopleReached: 0,
      activitiesCount: 0,
      partnerChurches: 0,
    };
  }
}
