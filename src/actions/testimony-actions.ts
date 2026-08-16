"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { testimonySchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit-log";
import { sendStaffNotificationEmail } from "@/lib/email";

export type SubmitTestimonyResult =
  | { success: true; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

// -----------------------------------
// PUBLIC
// -----------------------------------

export async function getApprovedTestimonies() {
  return prisma.testimony.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      authorName: true,
      authorRole: true,
      authorAvatar: true,
      content: true,
      createdAt: true,
      likeCount: true,
      comments: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, authorName: true, content: true, createdAt: true },
      },
    },
  });
}

export async function likeTestimony(id: string) {
  const updated = await prisma.testimony.update({
    where: { id },
    data: { likeCount: { increment: 1 } },
    select: { likeCount: true },
  });
  revalidatePath("/testimonials");
  return updated.likeCount;
}

export async function submitTestimonyComment(input: {
  testimonyId: string;
  authorName: string;
  content: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const authorName = input.authorName?.trim();
  const content = input.content?.trim();

  if (!authorName || authorName.length < 2) {
    return { success: false, error: "Veuillez indiquer votre nom." };
  }
  if (!content || content.length < 3) {
    return { success: false, error: "Votre commentaire est trop court." };
  }
  if (content.length > 1000) {
    return { success: false, error: "Votre commentaire est trop long (1000 caractères maximum)." };
  }

  try {
    await prisma.testimonyComment.create({
      data: { testimonyId: input.testimonyId, authorName, content, isApproved: false },
    });
    await prisma.notification.create({
      data: {
        title: "Nouveau commentaire à valider",
        message: `${authorName} a commenté un témoignage.`,
        type: "info",
      },
    });
  } catch (e) {
    console.error("[submitTestimonyComment] Erreur :", e);
    return { success: false, error: "Erreur lors de l'envoi. Veuillez réessayer." };
  }

  return { success: true, message: "Merci ! Votre commentaire sera visible après validation." };
}

export async function submitTestimony(input: {
  authorName: string;
  authorRole?: string;
  content: string;
}): Promise<SubmitTestimonyResult> {
  const parsed = testimonySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    await prisma.testimony.create({
      data: {
        authorName: data.authorName,
        authorRole: data.authorRole || null,
        content: data.content,
        isApproved: false,
        isFeatured: false,
      },
    });
  } catch (e) {
    console.error("[submitTestimony] Erreur :", e);
    return { success: false, error: "Erreur lors de l'enregistrement. Veuillez réessayer." };
  }

  await sendStaffNotificationEmail({
    subject: `Nouveau témoignage à valider — ${data.authorName}`,
    html: `
      <h2>Nouveau témoignage soumis</h2>
      <p><strong>Auteur :</strong> ${data.authorName}</p>
      <p><strong>Rôle / fonction :</strong> ${data.authorRole || "—"}</p>
      <p><strong>Témoignage :</strong><br/>${data.content}</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">
        Ce témoignage n'est pas encore visible publiquement. Validez-le depuis /admin/testimonials.
      </p>
    `,
  });

  await prisma.notification.create({
    data: {
      title: "Nouveau témoignage à valider",
      message: `${data.authorName} a soumis un témoignage.`,
      type: "info",
    },
  });

  return {
    success: true,
    message: "Merci ! Votre témoignage sera visible après validation par notre équipe.",
  };
}

// -----------------------------------
// ADMIN
// -----------------------------------

export async function getAllTestimoniesAdmin() {
  return prisma.testimony.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function approveTestimony(id: string) {
  await prisma.testimony.update({ where: { id }, data: { isApproved: true } });
  await logAudit("TESTIMONY_APPROVE", "Testimony", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
}

export async function rejectTestimony(id: string) {
  await prisma.testimony.update({ where: { id }, data: { isApproved: false } });
  await logAudit("TESTIMONY_REJECT", "Testimony", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
}

export async function deleteTestimony(id: string) {
  await prisma.testimony.delete({ where: { id } });
  await logAudit("TESTIMONY_DELETE", "Testimony", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
}

export async function toggleTestimonyFeatured(id: string, isFeatured: boolean) {
  await prisma.testimony.update({ where: { id }, data: { isFeatured } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
}

// --- Modération des commentaires ---

export async function getPendingComments() {
  return prisma.testimonyComment.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: "desc" },
    include: { testimony: { select: { id: true, authorName: true } } },
  });
}

export async function approveComment(id: string) {
  await prisma.testimonyComment.update({ where: { id }, data: { isApproved: true } });
  await logAudit("COMMENT_APPROVE", "TestimonyComment", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
}

export async function deleteComment(id: string) {
  await prisma.testimonyComment.delete({ where: { id } });
  await logAudit("COMMENT_DELETE", "TestimonyComment", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
}
