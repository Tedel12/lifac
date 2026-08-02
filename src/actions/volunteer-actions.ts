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
