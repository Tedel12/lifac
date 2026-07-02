"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  return await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(id: string) {
  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  revalidatePath("/admin/dashboard");
}

export async function deleteNotification(id: string) {
  await prisma.notification.delete({
    where: { id },
  });
  revalidatePath("/admin/dashboard");
}

export async function deleteAllNotifications() {
  await prisma.notification.deleteMany();
  revalidatePath("/admin/dashboard");
}

export async function markAllNotificationsAsRead() {
  await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/admin/dashboard");
}

// Pour la recherche (ex: recherche d'événements)
export async function searchAdmin(query: string) {
  const events = await prisma.event.findMany({
    where: {
      title: { contains: query, mode: "insensitive" },
    },
    take: 5,
  });
  return { events };
}
