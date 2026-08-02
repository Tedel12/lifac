import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 841.89; // A4 paysage (points)
const PAGE_HEIGHT = 595.28;
const MARGIN = 36;
const ROW_HEIGHT = 18;
const HEADER_HEIGHT = 22;

// Génère un PDF tabulaire simple (paysage) à partir d'en-têtes et de lignes de texte.
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

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const drawHeader = () => {
    page.drawText(title, { x: MARGIN, y, size: 14, font: boldFont, color: rgb(0.11, 0.16, 0.32) });
    y -= 22;
    page.drawText(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, {
      x: MARGIN,
      y,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= 20;
    headers.forEach((h, i) => {
      page.drawText(h.slice(0, 30), {
        x: MARGIN + i * colWidth,
        y,
        size: 8,
        font: boldFont,
        color: rgb(0.83, 0.11, 0.11),
      });
    });
    y -= HEADER_HEIGHT;
    page.drawLine({
      start: { x: MARGIN, y: y + 12 },
      end: { x: PAGE_WIDTH - MARGIN, y: y + 12 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
  };

  drawHeader();

  for (const row of rows) {
    if (y < MARGIN + ROW_HEIGHT) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
      drawHeader();
    }
    row.forEach((cell, i) => {
      page.drawText((cell ?? "").toString().slice(0, 40), {
        x: MARGIN + i * colWidth,
        y,
        size: 8,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
    });
    y -= ROW_HEIGHT;
  }

  return doc.save();
}
