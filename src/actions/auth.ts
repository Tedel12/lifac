"use server";

import { cookies } from "next/headers";

export async function loginAdmin(email: string, password: string) {
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    // Création d'une session simple via cookie (pour simplifier, on stocke un jeton)
    (await cookies()).set("admin_token", "authorized", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 heures
    });
    return { success: true };
  }
  return { success: false, error: "Identifiants invalides" };
}

export async function logoutAdmin() {
  (await cookies()).delete("admin_token");
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === "authorized";
}
