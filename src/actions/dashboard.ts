"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDashboardStats() {
  const globalStats = await prisma.globalStats.findFirst();
  const moduleDistributions = await prisma.moduleDistribution.findMany();
  return { globalStats, moduleDistributions };
}

export async function updateGlobalStats(data: {
  totalSoulsWon: number;
  schoolsVisited: number;
  marketOutreach: number;
  totalCrusades: number;
  totalDonations: number;
  totalVolunteers: number;
}) {
  let stats = await prisma.globalStats.findFirst();
  if (stats) {
    stats = await prisma.globalStats.update({
      where: { id: stats.id },
      data,
    });
  } else {
    stats = await prisma.globalStats.create({
      data,
    });
  }
  revalidatePath("/admin/dashboard");
  return stats;
}

export async function updateModuleDistribution(distributions: {
  category: string;
  value: number;
  color: string;
}[]) {
  // Clear existing distributions and insert new ones
  await prisma.moduleDistribution.deleteMany();
  await prisma.moduleDistribution.createMany({
    data: distributions,
  });
  revalidatePath("/admin/dashboard");
}

// KPIs + graphiques avancés (décisions pour Christ, convertis, églises partenaires,
// agents actifs, évolution mensuelle, répartition géographique, taux d'efficacité)
export async function getExtendedDashboardMetrics() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [aggAllTime, partnerChurchesCount, activeAgentsCount, recentActivities] = await Promise.all([
    prisma.activity.aggregate({
      _sum: { decisionsForChrist: true, newContacts: true },
    }),
    prisma.partnerChurch.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "VOLUNTEER", isActive: true } }),
    prisma.activity.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: {
        date: true,
        commune: true,
        decisionsForChrist: true,
        actualParticipants: true,
        estimatedParticipants: true,
      },
    }),
  ]);

  // Évolution mensuelle (6 derniers mois) : nb d'activités + décisions pour Christ
  const monthBuckets: { key: string; label: string; activities: number; decisions: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthBuckets.push({
      key,
      label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      activities: 0,
      decisions: 0,
    });
  }
  const bucketByKey = new Map(monthBuckets.map((b) => [b.key, b]));
  for (const act of recentActivities) {
    const d = new Date(act.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = bucketByKey.get(key);
    if (bucket) {
      bucket.activities += 1;
      bucket.decisions += act.decisionsForChrist ?? 0;
    }
  }

  // Répartition géographique (par commune, top 6, sur les 6 derniers mois)
  const communeCounts = new Map<string, number>();
  for (const act of recentActivities) {
    const commune = act.commune?.trim() || "Non renseignée";
    communeCounts.set(commune, (communeCounts.get(commune) ?? 0) + 1);
  }
  const geoDistribution = Array.from(communeCounts.entries())
    .map(([commune, count]) => ({ commune, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Taux d'efficacité : décisions pour Christ / participants touchés (6 derniers mois)
  let totalReached = 0;
  let totalDecisions = 0;
  for (const act of recentActivities) {
    totalReached += act.actualParticipants ?? act.estimatedParticipants ?? 0;
    totalDecisions += act.decisionsForChrist ?? 0;
  }
  const efficiencyRate = totalReached > 0 ? Math.round((totalDecisions / totalReached) * 100) : 0;

  return {
    decisionsForChrist: aggAllTime._sum.decisionsForChrist ?? 0,
    newContacts: aggAllTime._sum.newContacts ?? 0,
    partnerChurchesCount,
    activeAgentsCount,
    monthlyEvolution: monthBuckets,
    geoDistribution,
    efficiencyRate,
  };
}
