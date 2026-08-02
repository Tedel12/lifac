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
  const department = req.nextUrl.searchParams.get("department");
  const format = req.nextUrl.searchParams.get("format") ?? "csv";

  const schools = await prisma.school.findMany({
    where: {
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(agentId ? { agentId } : {}),
      ...(commune ? { commune: { contains: commune, mode: "insensitive" } } : {}),
      ...(department ? { department: { contains: department, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { agent: { select: { name: true } } },
  });

  const headers = ["Code", "Nom", "Commune", "Département", "Responsable", "Téléphone", "Missionnaire", "Statut", "Effectif estimé"];
  const dataRows = schools.map((s) => [
    s.code,
    s.name,
    s.commune,
    s.department,
    s.responsibleName,
    s.phone,
    s.agent?.name ?? "",
    s.status,
    String(s.estimatedStudents ?? ""),
  ]);

  if (format === "pdf") {
    const pdfBytes = await generateSimplePdfTable("Écoles — LiFAC", headers, dataRows);
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ecoles-lifac.pdf"`,
      },
    });
  }

  return new NextResponse(toCsv([headers, ...dataRows]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ecoles-lifac.csv"`,
    },
  });
}
