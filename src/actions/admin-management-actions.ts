"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { getCurrentAdminId } from "@/actions/auth";
import { logAudit } from "@/lib/audit-log";

export async function getAdmins() {
  return prisma.user.findMany({
    where: { role: Role.ADMIN, isActive: true },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAdmin(data: { name: string; email: string; password: string }) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });

  if (existing) {
    // Compte admin précédemment désactivé (soft-delete) avec le même email : on le réactive
    // plutôt que d'échouer sur la contrainte unique — évite un email "coincé" pour toujours.
    if (existing.role === Role.ADMIN && !existing.isActive) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { name: data.name, password: hashedPassword, isActive: true },
      });
      await logAudit("ADMIN_REACTIVATE", "User", existing.id, undefined, { name: data.name, email: data.email });
      revalidatePath("/admin/admins");
      return;
    }
    throw new Error("Un compte existe déjà avec cet email.");
  }

  const created = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  await logAudit("ADMIN_CREATE", "User", created.id, undefined, { name: data.name, email: data.email });
  revalidatePath("/admin/admins");
}

export async function deleteAdmin(id: string) {
  const currentAdminId = await getCurrentAdminId();
  if (currentAdminId && currentAdminId === id) {
    throw new Error("Vous ne pouvez pas désactiver votre propre compte");
  }
  await prisma.user.update({ where: { id }, data: { isActive: false } });
  await logAudit("ADMIN_DEACTIVATE", "User", id);
  revalidatePath("/admin/admins");
}

export async function getCurrentAdminProfile() {
  const id = await getCurrentAdminId();
  if (!id || id === "env-admin") return null;
  return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
}

export async function updateAdminProfile(data: { name: string; password?: string }) {
  const id = await getCurrentAdminId();
  if (!id || id === "env-admin") {
    throw new Error(
      "Ce compte super-admin (variables d'environnement) ne peut pas être modifié ici. Créez un compte administrateur classique depuis /admin/admins."
    );
  }
  const updateData: any = { name: data.name };
  if (data.password && data.password.trim()) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }
  await prisma.user.update({ where: { id }, data: updateData });
  revalidatePath("/admin/settings");
}
