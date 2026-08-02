"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { logAudit } from "@/lib/audit-log";

export async function getAgents() {
  return await prisma.user.findMany({
    where: {
      role: Role.VOLUNTEER,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
    }
  });
}

export async function createAgent(data: any) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("Un compte existe déjà avec cet email.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const created = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      phone: data.phone,
      password: hashedPassword,
      role: Role.VOLUNTEER,
    },
  });
  await logAudit("AGENT_CREATE", "User", created.id, undefined, { name: data.name, email: data.email });
  revalidatePath("/admin/agents");
}

export async function deleteAgent(id: string) {
  const existing = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true } });
  await prisma.user.delete({ where: { id } });
  await logAudit("AGENT_DELETE", "User", id, existing ?? undefined, undefined);
  revalidatePath("/admin/agents");
}

export async function updateAgent(id: string, data: any) {
  await prisma.user.update({ where: { id }, data });
  await logAudit("AGENT_UPDATE", "User", id, undefined, data);
  revalidatePath("/admin/agents");
}

export async function getPendingApplications() {
  return prisma.volunteer.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { id: true, name: true, email: true, phone: true, city: true } } },
    orderBy: { joinedAt: "desc" },
  });
}

export async function approveVolunteerApplication(volunteerId: string, password: string) {
  const volunteer = await prisma.volunteer.findUnique({ where: { id: volunteerId } });
  if (!volunteer) throw new Error("Candidature introuvable");

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: volunteer.userId }, data: { password: hashedPassword, isActive: true } }),
    prisma.volunteer.update({ where: { id: volunteerId }, data: { status: "APPROVED", approvedAt: new Date() } }),
  ]);
  await logAudit("VOLUNTEER_APPLICATION_APPROVE", "Volunteer", volunteerId);
  revalidatePath("/admin/agents");
}

export async function rejectVolunteerApplication(volunteerId: string) {
  await prisma.volunteer.update({ where: { id: volunteerId }, data: { status: "REJECTED" } });
  await logAudit("VOLUNTEER_APPLICATION_REJECT", "Volunteer", volunteerId);
  revalidatePath("/admin/agents");
}
