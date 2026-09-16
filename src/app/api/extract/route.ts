import { NextResponse } from "next/server";
import { extractAzure, extractOllama } from "@/lib/extractors/llm";
import { extractWithFewShot } from "@/lib/extractors/local";
import { pdfToText } from "@/lib/pdf";
import { listRecords, readPdf, readSettings, saveRecord } from "@/lib/store";
import type { PredictorId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    ids?: string[];
    predictor: PredictorId;
  };
  const predictor = body.predictor;
  if (!["local", "azure", "ollama"].includes(predictor)) {
    return NextResponse.json({ error: "Unbekannter Extraktor" }, { status: 400 });
  }

  const settings = await readSettings();
  const all = await listRecords();
  const targets = body.ids?.length ? all.filter((record) => body.ids?.includes(record.id)) : all;
  const errors: { id: string; error: string }[] = [];
  const updated = [];

  for (const record of targets) {
    try {
      let text = record.text;
      if (!text && record.hasPdf) {
        text = await pdfToText(await readPdf(record.id));
        record.text = text;
      }
      if (!text) throw new Error("Kein PDF-Text. Bitte PDF importieren.");

      let extraction;
      if (predictor === "local") {
        extraction = extractWithFewShot(text, record.schemaId, record.partNumber, all);
      } else if (predictor === "azure") {
        extraction = await extractAzure(text, record.schemaId, settings);
      } else {
        extraction = await extractOllama(text, record.schemaId, settings);
      }
      record.predictions = { ...record.predictions, [predictor]: extraction };
      updated.push(await saveRecord(record));
    } catch (error) {
      errors.push({
        id: record.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json({ updated, errors });
}
