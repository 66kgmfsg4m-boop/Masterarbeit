import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { SAMPLES } from "../src/lib/samples";
import { extractWithFewShot } from "../src/lib/extractors/local";
import { pdfToText } from "../src/lib/pdf";
import { assignSplits, createBlankRecord, listRecords, savePdf, saveRecord } from "../src/lib/store";

async function buildPdf(title: string, lines: string[]): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  page.drawRectangle({
    x: 0,
    y: 740,
    width: 612,
    height: 52,
    color: rgb(0.07, 0.22, 0.28),
  });
  page.drawText("DATASHEET", {
    x: 48,
    y: 760,
    size: 11,
    font: bold,
    color: rgb(0.72, 0.89, 0.84),
  });
  page.drawText(title.slice(0, 78), {
    x: 48,
    y: 700,
    size: 14,
    font: bold,
    color: rgb(0.1, 0.12, 0.14),
  });
  let y = 668;
  for (const line of lines) {
    page.drawText(line.slice(0, 96), {
      x: 48,
      y,
      size: 10,
      font,
      color: rgb(0.15, 0.16, 0.18),
    });
    y -= 16;
  }
  return Buffer.from(await doc.save());
}

async function main() {
  for (const sample of SAMPLES) {
    const record = createBlankRecord(sample.id, sample.schemaId, sample.gold, sample.app);
    record.goldStatus = "reviewed";
    record.notes = sample.notes;
    record.sourcePdfName = `${sample.id}.pdf`;
    const pdf = await buildPdf(sample.pdfTitle, sample.pdfLines);
    await saveRecord(record);
    await savePdf(sample.id, pdf, `${sample.id}.pdf`);
    const stored = await saveRecord({
      ...record,
      text: await pdfToText(pdf),
      hasPdf: true,
    });
    console.log("seeded", stored.id, stored.schemaId);
  }
  const all = await assignSplits();
  for (const record of all) {
    if (!record.text) continue;
    record.predictions.local = extractWithFewShot(
      record.text,
      record.schemaId,
      record.partNumber,
      all,
    );
    await saveRecord(record);
  }
  const listed = await listRecords();
  console.log("split + local extract", listed.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
