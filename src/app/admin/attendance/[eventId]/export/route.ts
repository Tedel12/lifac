import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { isUserAuthenticated } from "@/actions/auth";

interface ReportRow {
    fullName: string;
    phone: string;
    participantNumber: string;
    country: string;
    present: number;
    totalSessions: number;
    rate: number;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
    const { isAuthenticated, role } = await isUserAuthenticated();
    if (!isAuthenticated || role !== "ADMIN") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { eventId } = await params;
    const format = req.nextUrl.searchParams.get("format") === "pdf" ? "pdf" : "csv";

    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { title: true } });
    if (!event) {
        return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    const totalSessions = await prisma.attendanceSession.count({ where: { eventId } });

    const registrations = await prisma.eventRegistration.findMany({
        where: { eventId },
        select: {
            fullName: true,
            phone: true,
            participantNumber: true,
            formData: true,
            _count: { select: { attendances: true } },
        },
        orderBy: { fullName: "asc" },
    });

    const rows: ReportRow[] = registrations.map((r) => {
        const present = r._count.attendances;
        return {
            fullName: r.fullName,
            phone: r.phone,
            participantNumber: r.participantNumber ?? "",
            country: extractCountry(r.formData) ?? "",
            present,
            totalSessions,
            rate: totalSessions > 0 ? Math.round((present / totalSessions) * 1000) / 10 : 0,
        };
    });

    if (format === "pdf") {
        const pdfBytes = await buildReportPdf(event.title, rows);
        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="rapport-presence-${eventId}.pdf"`,
            },
        });
    }

    const csv = buildReportCsv(rows);
    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="rapport-presence-${eventId}.csv"`,
        },
    });
}

function extractCountry(formData: unknown): string | null {
    if (formData && typeof formData === "object" && "pays" in (formData as Record<string, unknown>)) {
        const value = (formData as Record<string, unknown>).pays;
        return typeof value === "string" ? value : null;
    }
    return null;
}

function buildReportCsv(rows: ReportRow[]): string {
    const header = ["Participant", "Téléphone", "N° Participant", "Pays", "Présences", "Total sessions", "Taux (%)"];
    const escape = (v: string | number) => {
        const s = String(v);
        return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(";")];
    for (const r of rows) {
        lines.push(
            [r.fullName, r.phone, r.participantNumber, r.country, r.present, r.totalSessions, r.rate]
                .map(escape)
                .join(";")
        );
    }
    // BOM UTF-8 : sans ça Excel affiche les accents en charabia
    return "\uFEFF" + lines.join("\n");
}

async function buildReportPdf(eventTitle: string, rows: ReportRow[]) {
    const PAGE_WIDTH = 595; // A4 portrait, points
    const PAGE_HEIGHT = 842;
    const MARGIN = 40;
    const ROW_HEIGHT = 18;
    const COLS = [
        { label: "Participant", width: 150 },
        { label: "Téléphone", width: 75 },
        { label: "N° Participant", width: 95 },
        { label: "Pays", width: 70 },
        { label: "Prés.", width: 45 },
        { label: "Total", width: 45 },
        { label: "Taux", width: 45 },
    ];

    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;

    const drawTableHeader = () => {
        page.drawText(`Rapport de présence — ${eventTitle}`, {
            x: MARGIN,
            y,
            size: 13,
            font: fontBold,
            color: rgb(0.82, 0.15, 0.15),
        });
        y -= 24;

        let x = MARGIN;
        for (const col of COLS) {
            page.drawText(col.label, { x, y, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
            x += col.width;
        }
        y -= 6;
        page.drawLine({
            start: { x: MARGIN, y },
            end: { x: PAGE_WIDTH - MARGIN, y },
            thickness: 0.5,
            color: rgb(0.75, 0.75, 0.75),
        });
        y -= ROW_HEIGHT;
    };

    drawTableHeader();

    for (const r of rows) {
        if (y < MARGIN + ROW_HEIGHT) {
            page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
            y = PAGE_HEIGHT - MARGIN;
            drawTableHeader();
        }

        const values = [
            truncate(r.fullName, 26),
            r.phone,
            r.participantNumber,
            truncate(r.country, 12),
            String(r.present),
            String(r.totalSessions),
            `${r.rate}%`,
        ];

        let x = MARGIN;
        values.forEach((v, i) => {
            page.drawText(v, { x, y, size: 8, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
            x += COLS[i].width;
        });
        y -= ROW_HEIGHT;
    }

    return pdfDoc.save();
}

function truncate(s: string, max: number): string {
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
}