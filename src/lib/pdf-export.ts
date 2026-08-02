import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 841.89; // A4 paysage (points)
const PAGE_HEIGHT = 595.28;
const MARGIN = 36;
const ROW_HEIGHT = 20;
const BAND_HEIGHT = 64;
const HEADER_ROW_HEIGHT = 24;
const FOOTER_HEIGHT = 28;

const LIFAC_NAVY = rgb(0.067, 0.094, 0.184); // #11172F approx
const LIFAC_RED = rgb(0.831, 0.106, 0.106); // #D41B1B approx
const ZEBRA = rgb(0.965, 0.968, 0.976);
const TEXT_DARK = rgb(0.13, 0.15, 0.2);
const TEXT_MUTED = rgb(0.55, 0.56, 0.6);

// Génère un PDF tabulaire avec en-tête de marque LiFAC, en-têtes de colonnes colorés,
// lignes zébrées et pied de page avec numérotation.
export async function generateSimplePdfTable(
  title: string,
  headers: string[],
  rows: string[][]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const usableWidth = PAGE_WIDTH - MARGIN * 2;
  const colWidth = usableWidth / headers.length;
  const generatedOn = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  const pages: { page: ReturnType<typeof doc.addPage> }[] = [];

  const truncate = (text: string, maxChars: number) =>
    text.length > maxChars ? text.slice(0, maxChars - 1) + "…" : text;

  const newPage = () => {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push({ page });

    // Bandeau de marque
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - BAND_HEIGHT, width: PAGE_WIDTH, height: BAND_HEIGHT, color: LIFAC_NAVY });
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - BAND_HEIGHT - 3, width: PAGE_WIDTH, height: 3, color: LIFAC_RED });
    page.drawText("LiFAC", { x: MARGIN, y: PAGE_HEIGHT - 28, size: 16, font: boldFont, color: rgb(1, 1, 1) });
    page.drawText(title, { x: MARGIN, y: PAGE_HEIGHT - 46, size: 11, font, color: rgb(0.85, 0.86, 0.92) });
    const dateLabel = `Généré le ${generatedOn}`;
    const dateWidth = font.widthOfTextAtSize(dateLabel, 9);
    page.drawText(dateLabel, { x: PAGE_WIDTH - MARGIN - dateWidth, y: PAGE_HEIGHT - 34, size: 9, font, color: rgb(0.85, 0.86, 0.92) });

    let y = PAGE_HEIGHT - BAND_HEIGHT - 28;

    // En-tête de colonnes
    page.drawRectangle({ x: MARGIN, y: y - HEADER_ROW_HEIGHT + 6, width: usableWidth, height: HEADER_ROW_HEIGHT, color: LIFAC_RED });
    headers.forEach((h, i) => {
      page.drawText(truncate(h, 26), {
        x: MARGIN + i * colWidth + 6,
        y: y - 9,
        size: 9,
        font: boldFont,
        color: rgb(1, 1, 1),
      });
    });
    y -= HEADER_ROW_HEIGHT + 4;

    return { page, y };
  };

  let { page, y } = newPage();

  rows.forEach((row, rowIndex) => {
    if (y < MARGIN + FOOTER_HEIGHT + ROW_HEIGHT) {
      ({ page, y } = newPage());
    }
    if (rowIndex % 2 === 0) {
      page.drawRectangle({ x: MARGIN, y: y - 5, width: usableWidth, height: ROW_HEIGHT, color: ZEBRA });
    }
    row.forEach((cell, i) => {
      page.drawText(truncate((cell ?? "").toString(), 34), {
        x: MARGIN + i * colWidth + 6,
        y,
        size: 8.5,
        font,
        color: TEXT_DARK,
      });
    });
    y -= ROW_HEIGHT;
  });

  if (rows.length === 0) {
    page.drawText("Aucune donnée pour cette période.", { x: MARGIN + 6, y, size: 9, font, color: TEXT_MUTED });
  }

  // Pied de page sur chaque page générée
  pages.forEach(({ page: p }, i) => {
    p.drawLine({
      start: { x: MARGIN, y: MARGIN + 10 },
      end: { x: PAGE_WIDTH - MARGIN, y: MARGIN + 10 },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.87),
    });
    p.drawText("LiFAC — Light For All Center", { x: MARGIN, y: MARGIN - 4, size: 8, font, color: TEXT_MUTED });
    const pageLabel = `Page ${i + 1} / ${pages.length}`;
    const pageLabelWidth = font.widthOfTextAtSize(pageLabel, 8);
    p.drawText(pageLabel, { x: PAGE_WIDTH - MARGIN - pageLabelWidth, y: MARGIN - 4, size: 8, font, color: TEXT_MUTED });
  });

  return doc.save();
}
