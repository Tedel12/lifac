import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUserAuthenticated } from "@/actions/auth";
import { generateSimplePdfTable } from "@/lib/pdf-export";

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
  const agentId = req.nextUrl.searchParams.get("agentId");
  const commune = req.nextUrl.searchParams.get("commune");
  const format = req.nextUrl.searchParams.get("format") ?? "csv";

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
      ...(agentId ? { assignedToId: agentId } : {}),
      ...(commune ? { commune: { contains: commune, mode: "insensitive" } } : {}),
    },
    orderBy: { date: "desc" },
    include: { assignedTo: { select: { name: true } } },
  });

  const headers = [
    "Code",
    "Titre",
    "Type",
    "Statut",
    "Date",
    "Commune",
    "Missionnaire",
    "Participants estimés",
    "Participants réels",
    "Décisions pour Christ",
  ];
  const dataRows = activities.map((a) => [
    a.code,
    a.title,
    a.type,
    a.status,
    a.date.toISOString().slice(0, 10),
    a.commune ?? "",
    a.assignedTo?.name ?? a.responsibleName ?? "",
    String(a.estimatedParticipants ?? ""),
    String(a.actualParticipants ?? ""),
    String(a.decisionsForChrist ?? ""),
  ]);

  if (format === "pdf") {
    const pdfBytes = await generateSimplePdfTable("Activités de terrain — LiFAC", headers, dataRows);
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="activites-lifac.pdf"`,
      },
    });
  }

  return new NextResponse(toCsv([headers, ...dataRows]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="activites-lifac.csv"`,
    },
  });
}
