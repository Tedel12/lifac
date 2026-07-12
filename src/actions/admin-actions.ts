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

// ... (existing imports and code)
export async function searchAdmin(query: string) {
  const events = await prisma.event.findMany({
    where: {
      title: { contains: query, mode: "insensitive" },
    },
    take: 5,
  });
  return { events };
}

// -----------------------------------
// GESTION DES DONS ET AFFECTATIONS
// -----------------------------------

export async function getAvailableDonations() {
  return await prisma.donation.findMany({
    where: {
      schoolId: null,
      status: "APPROVED" // Seulement les dons approuvés
    },
    orderBy: { createdAt: "desc" },
    select: {
        id: true,
        amount: true,
        currency: true,
        donorName: true,
        createdAt: true
    }
  });
}

export async function assignDonationsToSchool(schoolId: string, donationIds: string[]) {
  console.log(`[assignDonationsToSchool] Assigning ${donationIds.length} donations to school ${schoolId}`);
  try {
    const result = await prisma.donation.updateMany({
      where: {
        id: { in: donationIds }
      },
      data: {
        schoolId: schoolId
      }
    });
    console.log(`[assignDonationsToSchool] Update result:`, result);
    revalidatePath("/admin/schools");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'affectation des dons:", error);
    return { success: false, error: "Erreur lors de l'affectation." };
  }
}

export async function getSchoolDonationsHistory(schoolId: string) {
    console.log(`[getSchoolDonationsHistory] Fetching for schoolId: ${schoolId}`);
    const history = await prisma.donation.findMany({
        where: {
            schoolId: schoolId
        },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            amount: true,
            currency: true,
            donorName: true,
            createdAt: true
        }
    });
    console.log(`[getSchoolDonationsHistory] Found ${history.length} donations.`);
    return history;
}
