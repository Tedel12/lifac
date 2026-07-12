"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isUserAuthenticated } from "@/actions/auth";

export interface RegistrationListFilters {
  search?: string;
  eventId?: string;
}

// -----------------------------------
// LISTE DES INSCRIPTIONS (page /admin/registrations)
// -----------------------------------

export async function getEventRegistrations(filters: RegistrationListFilters = {}) {
  const { search, eventId } = filters;

  return prisma.eventRegistration.findMany({
    where: {
      eventId: eventId || undefined,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { participantNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      event: { select: { title: true, slug: true } },
    },
    take: 200,
  });
}

export async function getEventsForFilter() {
  return prisma.event.findMany({
    select: { id: true, title: true, currentAttendees: true, startDate: true, status: true },
    orderBy: { startDate: "desc" },
  });
}

// -----------------------------------
// SESSIONS DE PRÉSENCE (ex: "Jour 1 - Matin")
// -----------------------------------

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const { isAuthenticated, role } = await isUserAuthenticated();
  if (!isAuthenticated || role !== "ADMIN") {
    return { ok: false, error: "Non autorisé" };
  }
  return { ok: true };
}

export async function createAttendanceSession(input: {
  eventId: string;
  label: string;
  dayNumber?: number;
}): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  const label = input.label?.trim();
  if (!label || label.length < 2) {
    return { success: false, error: "Le libellé de la session est requis" };
  }

  const order = await prisma.attendanceSession.count({ where: { eventId: input.eventId } });

  const session = await prisma.attendanceSession.create({
    data: {
      eventId: input.eventId,
      label,
      dayNumber: input.dayNumber ?? null,
      order,
    },
    select: { id: true },
  });

  revalidatePath(`/admin/attendance/${input.eventId}`);
  return { success: true, data: session };
}

export async function getAttendanceSessions(eventId: string) {
  return prisma.attendanceSession.findMany({
    where: { eventId },
    orderBy: { order: "asc" },
  });
}

// -----------------------------------
// SCAN QR CODE — cœur du système de présence
// -----------------------------------

export interface ScanResult {
  success: boolean;
  alreadyScanned?: boolean;
  error?: string;
  participant?: {
    fullName: string;
    participantNumber: string;
    scannedAt: Date;
  };
}

// Enregistre une présence, que ce soit via scan QR ou saisie manuelle.
// Centralise la logique commune (déjà scanné ? gestion de la contrainte unique en cas de
// double scan quasi simultané, ex: deux agents qui scannent la même personne à la même seconde).
async function createAttendanceRecord(params: {
  registration: { id: string; eventId: string; fullName: string; participantNumber: string | null };
  sessionId: string;
  method: "QR" | "MANUAL";
  device?: string;
}): Promise<ScanResult> {
  const { registration, sessionId, method, device } = params;

  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    select: { id: true, eventId: true },
  });
  if (!session) {
    return { success: false, error: "Session de présence introuvable" };
  }
  if (session.eventId !== registration.eventId) {
    return { success: false, error: "Ce participant n'est pas inscrit à cet événement" };
  }

  try {
    const attendance = await prisma.attendance.create({
      data: {
        registrationId: registration.id,
        sessionId,
        status: "PRESENT",
        method,
        device: device || null,
      },
    });

    return {
      success: true,
      alreadyScanned: false,
      participant: {
        fullName: registration.fullName,
        participantNumber: registration.participantNumber ?? "",
        scannedAt: attendance.scannedAt,
      },
    };
  } catch (e) {
    // Déjà enregistré pour cette session (contrainte @@unique([registrationId, sessionId]))
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const existing = await prisma.attendance.findUnique({
        where: { registrationId_sessionId: { registrationId: registration.id, sessionId } },
      });
      return {
        success: true,
        alreadyScanned: true,
        participant: {
          fullName: registration.fullName,
          participantNumber: registration.participantNumber ?? "",
          scannedAt: existing?.scannedAt ?? new Date(),
        },
      };
    }
    console.error("[createAttendanceRecord] Erreur :", e);
    return { success: false, error: "Erreur lors de l'enregistrement de la présence" };
  }
}

// Appelé à chaque scan de QR Code depuis le scanner (caméra du navigateur).
export async function recordScan(input: {
  qrToken: string;
  sessionId: string;
  device?: string;
}): Promise<ScanResult> {
  const { isAuthenticated } = await isUserAuthenticated();
  if (!isAuthenticated) {
    return { success: false, error: "Non autorisé" };
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { qrToken: input.qrToken },
    select: { id: true, eventId: true, fullName: true, participantNumber: true, status: true },
  });

  if (!registration) {
    return { success: false, error: "QR Code invalide ou inconnu" };
  }
  if (registration.status === "CANCELED") {
    return { success: false, error: "Cette inscription a été annulée" };
  }

  return createAttendanceRecord({
    registration,
    sessionId: input.sessionId,
    method: "QR",
    device: input.device,
  });
}

// -----------------------------------
// POINTAGE MANUEL (participant qui a oublié sa carte)
// -----------------------------------

export async function searchRegistrationsForManualAttendance(eventId: string, query: string) {
  const { isAuthenticated } = await isUserAuthenticated();
  if (!isAuthenticated) return [];

  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  return prisma.eventRegistration.findMany({
    where: {
      eventId,
      OR: [
        { fullName: { contains: trimmed, mode: "insensitive" } },
        { phone: { contains: trimmed } },
        { participantNumber: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    select: { id: true, fullName: true, phone: true, participantNumber: true, eventId: true, status: true },
    take: 10,
  });
}

export async function recordManualAttendance(input: {
  registrationId: string;
  sessionId: string;
}): Promise<ScanResult> {
  const { isAuthenticated } = await isUserAuthenticated();
  if (!isAuthenticated) {
    return { success: false, error: "Non autorisé" };
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: input.registrationId },
    select: { id: true, eventId: true, fullName: true, participantNumber: true, status: true },
  });
  if (!registration) {
    return { success: false, error: "Participant introuvable" };
  }
  if (registration.status === "CANCELED") {
    return { success: false, error: "Cette inscription a été annulée" };
  }

  return createAttendanceRecord({
    registration,
    sessionId: input.sessionId,
    method: "MANUAL",
  });
}

// -----------------------------------
// STATISTIQUES & HISTORIQUE
// -----------------------------------

export async function getAttendanceStats(eventId: string) {
  const [totalRegistrations, sessions] = await Promise.all([
    prisma.eventRegistration.count({ where: { eventId } }),
    prisma.attendanceSession.findMany({
      where: { eventId },
      select: {
        id: true,
        label: true,
        _count: { select: { attendances: true } },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  return {
    totalRegistrations,
    sessions: sessions.map((s) => ({
      id: s.id,
      label: s.label,
      present: s._count.attendances,
      absent: Math.max(0, totalRegistrations - s._count.attendances),
      rate: totalRegistrations > 0 ? Math.round((s._count.attendances / totalRegistrations) * 100) : 0,
    })),
  };
}

export async function getRecentAttendances(sessionId: string, take = 15) {
  return prisma.attendance.findMany({
    where: { sessionId },
    orderBy: { scannedAt: "desc" },
    take,
    include: {
      registration: { select: { fullName: true, participantNumber: true } },
    },
  });
}