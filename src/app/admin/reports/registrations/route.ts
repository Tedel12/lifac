import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUserAuthenticated } from "@/actions/auth";

function toCsv(rows: string[][]): string {
  const escape = (v: string) => (/[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return "﻿" + rows.map((r) => r.map(escape).join(";")).join("\n");
}

export async function GET(req: NextRequest) {
  const { isAuthenticated, role } = await isUserAuthenticated();
  if (!isAuthenticated || role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  const registrations = await prisma.eventRegistration.findMany({
    where: {
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { event: { select: { title: true } } },
  });

  const rows = [
    ["Participant", "Téléphone", "Email", "Événement", "Ville", "N° Participant", "Statut", "Date d'inscription"],
    ...registrations.map((r) => [
      r.fullName,
      r.phone,
      r.email ?? "",
      r.event.title,
      r.city ?? "",
      r.participantNumber ?? "",
      r.status,
      r.createdAt.toISOString().slice(0, 10),
    ]),
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscriptions-lifac.csv"`,
    },
  });
}
