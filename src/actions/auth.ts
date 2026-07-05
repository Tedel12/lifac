"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function loginAdmin(email: string, password: string) {
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    (await cookies()).set("admin_token", "authorized", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 heures
    });
    return { success: true, role: "ADMIN" };
  }
  return { success: false, error: "Identifiants invalides" };
}

export async function loginAgent(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user && user.role === "VOLUNTEER" && user.password && await bcrypt.compare(password, user.password)) {
    (await cookies()).set("admin_token", "authorized_agent", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });
    return { success: true, role: "VOLUNTEER" };
  }
  return { success: false, error: "Identifiants invalides ou accès non autorisé" };
}

export async function logoutAdmin() {
  (await cookies()).delete("admin_token");
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === "authorized";
}

export async function isUserAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token === "authorized") return { isAuthenticated: true, role: "ADMIN" };
  if (token === "authorized_agent") return { isAuthenticated: true, role: "VOLUNTEER" };
  return { isAuthenticated: false, role: null };
}

