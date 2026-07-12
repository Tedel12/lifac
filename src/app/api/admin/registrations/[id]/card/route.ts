import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { isUserAuthenticated } from "@/actions/auth";

// Format badge standard (≈ CR80, 3.375 x 2.125 pouces, en points PDF à 72dpi)
const CARD_WIDTH = 243;
const CARD_HEIGHT = 153;

const COLOR_RED = rgb(0.82, 0.15, 0.15); // proche de lifac-red-600
const COLOR_DARK = rgb(0.07, 0.03, 0.04);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_GRAY = rgb(0.62, 0.62, 0.62);

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { isAuthenticated, role } = await isUserAuthenticated();
    if (!isAuthenticated || role !== "ADMIN") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    const registration = await prisma.eventRegistration.findUnique({
        where: { id },
        include: { event: { select: { title: true } } },
    });

    if (!registration) {
        return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
    }

    if (!registration.participantNumber || !registration.qrToken) {
        return NextResponse.json(
            { error: "Cette inscription n'a pas de numéro de participant / QR Code" },
            { status: 400 }
        );
    }

    try {
        const pdfBytes = await buildParticipantCardPdf(registration);
        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="carte-${registration.participantNumber}.pdf"`,
            },
        });
    } catch (e) {
        console.error("[GET /api/admin/registrations/[id]/card] Erreur :", e);
        return NextResponse.json({ error: "Erreur lors de la génération de la carte" }, { status: 500 });
    }
}

async function buildParticipantCardPdf(
    registration: Awaited<ReturnType<typeof prisma.eventRegistration.findUnique>> & {
        event: { title: string };
    }
) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([CARD_WIDTH, CARD_HEIGHT]);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Fond + bandeau d'en-tête
    page.drawRectangle({ x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT, color: COLOR_DARK });
    page.drawRectangle({ x: 0, y: CARD_HEIGHT - 26, width: CARD_WIDTH, height: 26, color: COLOR_RED });

    page.drawText("LiFAC", {
        x: 10,
        y: CARD_HEIGHT - 18,
        size: 13,
        font: fontBold,
        color: COLOR_WHITE,
    });

    drawTruncatedText(page, registration.event.title.toUpperCase(), {
        x: 62,
        y: CARD_HEIGHT - 17,
        size: 8,
        font: fontBold,
        color: COLOR_WHITE,
        maxWidth: CARD_WIDTH - 72,
    });

    // Photo (ou placeholder si non fournie)
    const photoSize = 62;
    const photoX = 12;
    const photoY = CARD_HEIGHT - 26 - photoSize - 10;

    const photoEmbedded = await tryDrawPhoto(pdfDoc, page, registration.photoUrl, {
        x: photoX,
        y: photoY,
        size: photoSize,
    });

    if (!photoEmbedded) {
        page.drawRectangle({
            x: photoX,
            y: photoY,
            width: photoSize,
            height: photoSize,
            color: rgb(0.18, 0.18, 0.18),
            borderColor: COLOR_GRAY,
            borderWidth: 0.5,
        });
        page.drawText("PHOTO", {
            x: photoX + 12,
            y: photoY + photoSize / 2 - 3,
            size: 7,
            font: fontRegular,
            color: COLOR_GRAY,
        });
    }

    // Nom, numéro de participant, pays
    const infoX = photoX + photoSize + 10;
    drawTruncatedText(page, registration.fullName.toUpperCase(), {
        x: infoX,
        y: photoY + photoSize - 12,
        size: 10,
        font: fontBold,
        color: COLOR_WHITE,
        maxWidth: CARD_WIDTH - infoX - 8,
    });

    page.drawText(`N° ${registration.participantNumber}`, {
        x: infoX,
        y: photoY + photoSize - 28,
        size: 8,
        font: fontRegular,
        color: COLOR_GRAY,
    });

    const country = extractCountry(registration.formData);
    if (country) {
        page.drawText(country.toUpperCase(), {
            x: infoX,
            y: photoY + photoSize - 42,
            size: 8,
            font: fontRegular,
            color: COLOR_WHITE,
        });
    }

    // QR Code, en bas à droite
    const qrPngBuffer = await QRCode.toBuffer(registration.qrToken as string, {
        type: "png",
        margin: 0,
        width: 240,
    });
    const qrImage = await pdfDoc.embedPng(qrPngBuffer);
    const qrSize = 46;
    page.drawImage(qrImage, {
        x: CARD_WIDTH - qrSize - 10,
        y: 10,
        width: qrSize,
        height: qrSize,
    });

    return pdfDoc.save();
}

// Tronque un texte trop long en ajoutant "…" pour ne jamais déborder de la carte.
function drawTruncatedText(
    page: PDFPage,
    text: string,
    opts: { x: number; y: number; size: number; font: PDFFont; color: ReturnType<typeof rgb>; maxWidth: number }
) {
    let display = text;
    while (display.length > 3 && opts.font.widthOfTextAtSize(display, opts.size) > opts.maxWidth) {
        display = display.slice(0, -1);
    }
    if (display !== text) display = display.slice(0, -1) + "…";
    page.drawText(display, { x: opts.x, y: opts.y, size: opts.size, font: opts.font, color: opts.color });
}

// Tente de télécharger et d'intégrer la photo du participant (Cloudinary). Retourne false
// si aucune photo n'est disponible ou si le téléchargement/l'intégration échoue.
async function tryDrawPhoto(
    pdfDoc: PDFDocument,
    page: PDFPage,
    photoUrl: string | null,
    box: { x: number; y: number; size: number }
): Promise<boolean> {
    if (!photoUrl) return false;

    try {
        const res = await fetch(photoUrl);
        if (!res.ok) return false;
        const buffer = Buffer.from(await res.arrayBuffer());
        const contentType = res.headers.get("content-type") || "";

        const image = contentType.includes("png")
            ? await pdfDoc.embedPng(buffer)
            : await pdfDoc.embedJpg(buffer);

        page.drawImage(image, { x: box.x, y: box.y, width: box.size, height: box.size });
        return true;
    } catch (e) {
        console.error("[tryDrawPhoto] Impossible de charger la photo :", e);
        return false;
    }
}

// Le pays est saisi dans le formulaire dynamique (champ "pays"), pas dans une colonne dédiée.
function extractCountry(formData: unknown): string | null {
    if (formData && typeof formData === "object" && "pays" in (formData as Record<string, unknown>)) {
        const value = (formData as Record<string, unknown>).pays;
        return typeof value === "string" ? value : null;
    }
    return null;
}