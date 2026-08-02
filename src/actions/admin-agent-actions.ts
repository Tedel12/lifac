"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

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
  await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      phone: data.phone,
      password: hashedPassword,
      role: Role.VOLUNTEER,
    },
  });
  revalidatePath("/admin/agents");
}

export async function deleteAgent(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/agents");
}

export async function updateAgent(id: string, data: any) {
  await prisma.user.update({ where: { id }, data });
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
  revalidatePath("/admin/agents");
}

export async function rejectVolunteerApplication(volunteerId: string) {
  await prisma.volunteer.update({ where: { id: volunteerId }, data: { status: "REJECTED" } });
  revalidatePath("/admin/agents");
}
