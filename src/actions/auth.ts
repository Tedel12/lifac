"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24, // 24 heures
};

export async function loginAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (
    user &&
    user.role === Role.ADMIN &&
    user.isActive &&
    user.password &&
    (await bcrypt.compare(password, user.password))
  ) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", "authorized", ADMIN_COOKIE_OPTIONS);
    cookieStore.set("admin_display_name", user.name || user.email, ADMIN_COOKIE_OPTIONS);
    cookieStore.set("admin_id", user.id, ADMIN_COOKIE_OPTIONS);
    return { success: true, role: "ADMIN" };
  }

  // Super-admin de secours défini par variables d'environnement (compte seedé historique)
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", "authorized", ADMIN_COOKIE_OPTIONS);
    cookieStore.set("admin_display_name", "Administrateur", ADMIN_COOKIE_OPTIONS);
    cookieStore.set("admin_id", "env-admin", ADMIN_COOKIE_OPTIONS);
    return { success: true, role: "ADMIN" };
  }

  return { success: false, error: "Identifiants invalides" };
}

export async function loginAgent(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.role === "VOLUNTEER" && user.isActive && user.password && await bcrypt.compare(password, user.password)) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", "authorized_agent", ADMIN_COOKIE_OPTIONS);
    cookieStore.set("agent_id", user.id, ADMIN_COOKIE_OPTIONS);
    cookieStore.set("agent_display_name", user.name || user.email, ADMIN_COOKIE_OPTIONS);
    return { success: true, role: "VOLUNTEER" };
  }
  return { success: false, error: "Identifiants invalides ou accès non autorisé" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  cookieStore.delete("admin_display_name");
  cookieStore.delete("admin_id");
  cookieStore.delete("agent_id");
  cookieStore.delete("agent_display_name");
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === "authorized";
}

export async function isUserAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token === "authorized") {
    return {
      isAuthenticated: true,
      role: "ADMIN",
      name: cookieStore.get("admin_display_name")?.value || "Administrateur",
    };
  }
  if (token === "authorized_agent") return { isAuthenticated: true, role: "VOLUNTEER", name: null };
  return { isAuthenticated: false, role: null, name: null };
}

export async function getCurrentAdminName() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== "authorized") return null;
  return cookieStore.get("admin_display_name")?.value || "Administrateur";
}

export async function getCurrentAdminId() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== "authorized") return null;
  return cookieStore.get("admin_id")?.value || null;
}

export async function getCurrentAgentName() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== "authorized_agent") return null;
  return cookieStore.get("agent_display_name")?.value || "Missionnaire";
}

export async function getCurrentAgentId() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== "authorized_agent") return null;
  return cookieStore.get("agent_id")?.value || null;
}
