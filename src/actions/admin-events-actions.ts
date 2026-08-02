"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EventStatus, EventType } from "@prisma/client";
import { logAudit } from "@/lib/audit-log";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "evenement";
  let slug = base;
  let i = 1;
  while (
    await prisma.event.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}

export async function getEvents(params?: {
  search?: string;
  status?: EventStatus | "ALL";
  type?: EventType | "ALL";
}) {
  const where: any = {};
  if (params?.search && params.search.trim() !== "") {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { location: { contains: params.search, mode: "insensitive" } },
      { city: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params?.status && params.status !== "ALL") where.status = params.status;
  if (params?.type && params.type !== "ALL") where.type = params.type;

  return prisma.event.findMany({
    where,
    orderBy: { startDate: "desc" },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({ where: { id } });
}

export async function createEvent(data: any) {
  const slug = await generateUniqueSlug(data.title);
  const created = await prisma.event.create({
    data: {
      title: data.title,
      slug,
      shortDescription: data.shortDescription || data.title.slice(0, 280),
      description: data.description || "",
      type: data.type,
      status: data.status,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      location: data.location,
      address: data.address || null,
      city: data.city || null,
      country: data.country || "Bénin",
      maxAttendees: data.maxAttendees ? Number(data.maxAttendees) : null,
      requiresRegistration: !!data.requiresRegistration,
      coverImageUrl: data.coverImageUrl || null,
      isFeatured: !!data.isFeatured,
    },
  });
  await logAudit("EVENT_CREATE", "Event", created.id, undefined, { title: data.title });
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function updateEvent(id: string, data: any) {
  const updateData: any = {
    title: data.title,
    shortDescription: data.shortDescription,
    description: data.description,
    type: data.type,
    status: data.status,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate ? new Date(data.endDate) : null,
    location: data.location,
    address: data.address || null,
    city: data.city || null,
    country: data.country || "Bénin",
    maxAttendees: data.maxAttendees ? Number(data.maxAttendees) : null,
    requiresRegistration: !!data.requiresRegistration,
    coverImageUrl: data.coverImageUrl || null,
    isFeatured: !!data.isFeatured,
  };

  await prisma.event.update({ where: { id }, data: updateData });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath(`/events/${data.slug}`);
}

export async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } });
  await logAudit("EVENT_DELETE", "Event", id);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}
