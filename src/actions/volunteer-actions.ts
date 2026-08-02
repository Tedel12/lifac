"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getCurrentAgentId } from "@/actions/auth";

async function requireAgentId(): Promise<string> {
  const id = await getCurrentAgentId();
  if (!id) throw new Error("Non authentifié");
  return id;
}

export async function getMyOverview() {
  const agentId = await requireAgentId();
  const now = new Date();

  const [schoolsCount, upcomingActivitiesCount, aggregates] = await Promise.all([
    prisma.school.count({ where: { agentId } }),
    prisma.activity.count({ where: { assignedToId: agentId, date: { gte: now } } }),
    prisma.activity.aggregate({
      where: { assignedToId: agentId },
      _sum: { decisionsForChrist: true, newContacts: true, actualParticipants: true },
    }),
  ]);

  return {
    schoolsCount,
    upcomingActivitiesCount,
    totalDecisions: aggregates._sum.decisionsForChrist ?? 0,
    totalNewContacts: aggregates._sum.newContacts ?? 0,
    totalParticipants: aggregates._sum.actualParticipants ?? 0,
  };
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

// 3 graphiques du dashboard missionnaire : activités par mois, décisions pour Christ par
// mois, répartition de ses activités par type — tous scopés sur le missionnaire connecté.
export async function getMyChartData() {
  const agentId = await requireAgentId();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [recentActivities, typeGroups] = await Promise.all([
    prisma.activity.findMany({
      where: { assignedToId: agentId, date: { gte: sixMonthsAgo } },
      select: { date: true, decisionsForChrist: true },
    }),
    prisma.activity.groupBy({
      by: ["type"],
      where: { assignedToId: agentId },
      _count: { _all: true },
    }),
  ]);

  const buildMonthBuckets = () => {
    const buckets: { key: string; label: string; activities: number; decisions: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      buckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
        activities: 0,
        decisions: 0,
      });
    }
    return buckets;
  };

  const monthlyActivity = buildMonthBuckets();
  const bucketByKey = new Map(monthlyActivity.map((b) => [b.key, b]));
  for (const act of recentActivities) {
    const key = `${act.date.getFullYear()}-${String(act.date.getMonth() + 1).padStart(2, "0")}`;
    const bucket = bucketByKey.get(key);
    if (bucket) {
      bucket.activities += 1;
      bucket.decisions += act.decisionsForChrist ?? 0;
    }
  }

  const activitiesByType = typeGroups
    .map((g) => ({ label: ACTIVITY_TYPE_SHORT_LABELS[g.type] ?? g.type, count: g._count._all }))
    .sort((a, b) => b.count - a.count);

  return { monthlyActivity, activitiesByType };
}

export async function getMySchools() {
  const agentId = await requireAgentId();
  return prisma.school.findMany({ where: { agentId }, orderBy: { name: "asc" } });
}

export async function getMyActivities(params?: { upcoming?: boolean }) {
  const agentId = await requireAgentId();
  const now = new Date();
  return prisma.activity.findMany({
    where: {
      assignedToId: agentId,
      ...(params?.upcoming === true ? { date: { gte: now } } : {}),
      ...(params?.upcoming === false ? { date: { lt: now } } : {}),
    },
    orderBy: { date: params?.upcoming === false ? "desc" : "asc" },
  });
}

export async function updateMyActivityOutcome(
  activityId: string,
  data: {
    actualParticipants?: number;
    decisionsForChrist?: number;
    biblesDistributed?: number;
    newContacts?: number;
    notes?: string;
  }
) {
  const agentId = await requireAgentId();
  const activity = await prisma.activity.findUnique({ where: { id: activityId }, select: { assignedToId: true } });
  if (!activity || activity.assignedToId !== agentId) {
    throw new Error("Cette activité ne vous est pas assignée");
  }
  await prisma.activity.update({ where: { id: activityId }, data });
  revalidatePath("/volunteer/reports");
  revalidatePath("/volunteer/dashboard");
}

export async function getPrayerWall() {
  return prisma.prayerRequest.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      intercessions: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { intercessorName: true, createdAt: true },
      },
    },
  });
}

// Enregistre une intercession ("j'ai prié") du missionnaire connecté sur une demande de prière
export async function markPrayed(prayerRequestId: string) {
  const agentId = await requireAgentId();
  const agent = await prisma.user.findUnique({ where: { id: agentId }, select: { name: true } });

  await prisma.$transaction([
    prisma.prayerIntercession.create({
      data: {
        prayerRequestId,
        intercessorId: agentId,
        intercessorName: agent?.name ?? "Missionnaire",
      },
    }),
    prisma.prayerRequest.update({
      where: { id: prayerRequestId },
      data: { prayerCount: { increment: 1 } },
    }),
  ]);

  revalidatePath("/volunteer/prayer");
}

export async function getMyProfile() {
  const agentId = await requireAgentId();
  return prisma.user.findUnique({
    where: { id: agentId },
    select: { id: true, name: true, email: true, phone: true, city: true },
  });
}

export async function updateMyProfile(data: { name: string; phone?: string; password?: string }) {
  const agentId = await requireAgentId();
  const updateData: any = { name: data.name, phone: data.phone || null };
  if (data.password && data.password.trim()) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }
  await prisma.user.update({ where: { id: agentId }, data: updateData });
  revalidatePath("/volunteer/profile");
}

// -----------------------------------
// NOTIFICATIONS PERSONNELLES DU MISSIONNAIRE
// -----------------------------------

export async function getMyNotifications() {
  const agentId = await requireAgentId();
  return prisma.notification.findMany({
    where: { targetUserId: agentId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function markMyNotificationAsRead(id: string) {
  const agentId = await requireAgentId();
  await prisma.notification.updateMany({ where: { id, targetUserId: agentId }, data: { isRead: true } });
  revalidatePath("/volunteer/dashboard");
}

export async function markAllMyNotificationsAsRead() {
  const agentId = await requireAgentId();
  await prisma.notification.updateMany({ where: { targetUserId: agentId, isRead: false }, data: { isRead: true } });
  revalidatePath("/volunteer/dashboard");
}

export async function deleteMyNotification(id: string) {
  const agentId = await requireAgentId();
  await prisma.notification.deleteMany({ where: { id, targetUserId: agentId } });
  revalidatePath("/volunteer/dashboard");
}
