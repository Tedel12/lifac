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

  const activities = await prisma.activity.findMany({
    where: {
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { date: "desc" },
  });

  const rows = [
    [
      "Code",
      "Titre",
      "Type",
      "Statut",
      "Date",
      "Commune",
      "Responsable",
      "Participants estimés",
      "Participants réels",
      "Décisions pour Christ",
    ],
    ...activities.map((a) => [
      a.code,
      a.title,
      a.type,
      a.status,
      a.date.toISOString().slice(0, 10),
      a.commune ?? "",
      a.responsibleName ?? "",
      String(a.estimatedParticipants ?? ""),
      String(a.actualParticipants ?? ""),
      String(a.decisionsForChrist ?? ""),
    ]),
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="activites-lifac.csv"`,
    },
  });
}
