"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import {
  signSession,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/session";

export type LoginActionResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

export async function loginAction(
  _prev: LoginActionResult | null,
  formData: FormData
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: "Email ou mot de passe invalide" };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      password: true,
      isActive: true,
    },
  });

  if (!user || !user.password || !user.isActive) {
    return { success: false, error: "Identifiants incorrects" };
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return { success: false, error: "Identifiants incorrects" };
  }

  const token = signSession({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  await setSessionCookie(token);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const redirectTo =
    user.role === "ADMIN" || user.role === "EDITOR" ? "/admin" : "/";
  return { success: true, redirectTo };
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
