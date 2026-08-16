"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDashboardStats() {
  const globalStats = await prisma.globalStats.findFirst();
  const moduleDistributions = await prisma.moduleDistribution.findMany();
  return { globalStats, moduleDistributions };
}

// Recalcule les KPI globaux à partir de données réelles en base (activités, écoles,
// dons, missionnaires) — remplace la saisie manuelle par des chiffres vérifiables.
export async function recomputeGlobalStats() {
  const crusadeTypes = ["CRUSADE", "YOUTH_CRUSADE", "POP_UP_CRUSADE", "NIGHT_OF_HOPE"] as const;

  const [activitiesCompleted, schoolsVisited, marketOutreach, totalCrusades, approvedAgg, totalVolunteers] =
    await Promise.all([
      prisma.activity.count({ where: { status: "COMPLETED" } }),
      prisma.school.count({ where: { status: "EXECUTEE" } }),
      prisma.activity.count({ where: { type: "MARKET_OUTREACH", status: "COMPLETED" } }),
      prisma.activity.count({ where: { type: { in: [...crusadeTypes] }, status: "COMPLETED" } }),
      prisma.donation.aggregate({ _sum: { amount: true }, where: { status: "APPROVED" } }),
      prisma.user.count({ where: { role: "VOLUNTEER", isActive: true } }),
    ]);

  return updateGlobalStats({
    totalSoulsWon: activitiesCompleted,
    schoolsVisited,
    marketOutreach,
    totalCrusades,
    totalDonations: approvedAgg._sum.amount ?? BigInt(0),
    totalVolunteers,
  });
}

export async function updateGlobalStats(data: {
  totalSoulsWon: number;
  schoolsVisited: number;
  marketOutreach: number;
  totalCrusades: number;
  totalDonations: number | bigint;
  totalVolunteers: number;
}) {
  const normalized = { ...data, totalDonations: BigInt(data.totalDonations) };
  let stats = await prisma.globalStats.findFirst();
  if (stats) {
    stats = await prisma.globalStats.update({
      where: { id: stats.id },
      data: normalized,
    });
  } else {
    stats = await prisma.globalStats.create({
      data: normalized,
    });
  }
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/activities");
  return stats;
}

const ACTIVITY_TYPE_SHORT_LABELS: Record<string, string> = {
  CRUSADE: "Croisades",
  YOUTH_CRUSADE: "Youth Crusade",
  POP_UP_CRUSADE: "Pop-Up Crusade",
  MARKET_OUTREACH: "Marchés",
  ONE_ON_ONE: "One-to-one",
  NIGHT_OF_HOPE: "Nuit de l'Espoir",
  HUMANITARIAN: "Humanitaire",
  TRAINING: "Formation",
  OTHER: "Autre",
};

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  CRUSADE: "#EF4444",
  YOUTH_CRUSADE: "#A855F7",
  POP_UP_CRUSADE: "#22C55E",
  MARKET_OUTREACH: "#1E293B",
  ONE_ON_ONE: "#EAB308",
  NIGHT_OF_HOPE: "#6366F1",
  HUMANITARIAN: "#F97316",
  TRAINING: "#0EA5E9",
  OTHER: "#94A3B8",
};

// Répartition réelle des activités par type (remplace la saisie manuelle précédente,
// qui affichait des pourcentages fictifs jamais reliés à la table Activity).
export async function computeModuleDistribution() {
  const grouped = await prisma.activity.groupBy({
    by: ["type"],
    _count: { _all: true },
  });

  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);
  if (total === 0) return [];

  return grouped
    .map((g) => ({
      category: ACTIVITY_TYPE_SHORT_LABELS[g.type] ?? g.type,
      value: Math.round((g._count._all / total) * 100),
      color: ACTIVITY_TYPE_COLORS[g.type] ?? "#94A3B8",
    }))
    .sort((a, b) => b.value - a.value);
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

  const [aggAllTime, partnerChurchesCount, activeAgentsCount, eventAttendanceCount, schoolDecisionsAgg, recentActivities] = await Promise.all([
    prisma.activity.aggregate({
      _sum: { decisionsForChrist: true, newContacts: true, actualParticipants: true },
    }),
    prisma.partnerChurch.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "VOLUNTEER", isActive: true } }),
    prisma.attendance.count({ where: { status: "PRESENT" } }),
    // Décisions pour Christ enregistrées lors d'activités menées dans les écoles
    prisma.activity.aggregate({
      where: { schoolId: { not: null } },
      _sum: { decisionsForChrist: true },
    }),
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
    // "Attendance total" (module 2 du cahier des charges) : participants comptés sur les
    // activités de terrain + présences scannées/pointées aux événements enregistrés.
    attendanceTotal: (aggAllTime._sum.actualParticipants ?? 0) + eventAttendanceCount,
    schoolDecisions: schoolDecisionsAgg._sum.decisionsForChrist ?? 0,
    monthlyEvolution: monthBuckets,
    geoDistribution,
    efficiencyRate,
  };
}

const ACTIVITY_STATUS_SHORT_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PLANNED: "Planifiée",
  CONFIRMED: "Confirmée",
  ONGOING: "En cours",
  COMPLETED: "Terminée",
  POSTPONED: "Reportée",
  CANCELED: "Annulée",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  MTN_MOBILE_MONEY: "MTN Mobile Money",
  MOOV_MOBILE_MONEY: "Moov Mobile Money",
  CELTIIS_CASH: "Celtiis Cash",
  SBIN: "SBIN",
  CARD: "Carte bancaire",
};

// 4 graphiques complémentaires du dashboard admin, tous calculés depuis des données réelles :
// évolution des dons, activités par statut, inscriptions aux événements, dons par méthode.
export async function getSecondaryDashboardCharts() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [donationsRecent, activityStatusGroups, registrationsRecent, paymentMethodGroups] = await Promise.all([
    prisma.donation.findMany({
      where: { status: "APPROVED", approvedAt: { gte: sixMonthsAgo } },
      select: { amount: true, approvedAt: true },
    }),
    prisma.activity.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.eventRegistration.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.donation.groupBy({
      by: ["paymentMethod"],
      where: { status: "APPROVED", paymentMethod: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const buildMonthBuckets = () => {
    const buckets: { key: string; label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      buckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
        value: 0,
      });
    }
    return buckets;
  };

  // Évolution mensuelle des dons approuvés (montant en XOF)
  const donationsEvolution = buildMonthBuckets();
  const donationsBucketByKey = new Map(donationsEvolution.map((b) => [b.key, b]));
  for (const d of donationsRecent) {
    if (!d.approvedAt) continue;
    const key = `${d.approvedAt.getFullYear()}-${String(d.approvedAt.getMonth() + 1).padStart(2, "0")}`;
    const bucket = donationsBucketByKey.get(key);
    if (bucket) bucket.value += Number(d.amount) / 100;
  }

  // Évolution mensuelle des inscriptions aux événements
  const registrationsEvolution = buildMonthBuckets();
  const registrationsBucketByKey = new Map(registrationsEvolution.map((b) => [b.key, b]));
  for (const r of registrationsRecent) {
    const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const bucket = registrationsBucketByKey.get(key);
    if (bucket) bucket.value += 1;
  }

  // Activités par statut
  const activitiesByStatus = activityStatusGroups
    .map((g) => ({ label: ACTIVITY_STATUS_SHORT_LABELS[g.status] ?? g.status, count: g._count._all }))
    .sort((a, b) => b.count - a.count);

  // Dons par méthode de paiement
  const donationsByMethod = paymentMethodGroups
    .filter((g) => g.paymentMethod)
    .map((g) => ({ label: PAYMENT_METHOD_LABELS[g.paymentMethod as string] ?? (g.paymentMethod as string), count: g._count._all }))
    .sort((a, b) => b.count - a.count);

  return {
    donationsEvolution,
    registrationsEvolution,
    activitiesByStatus,
    donationsByMethod,
  };
}
