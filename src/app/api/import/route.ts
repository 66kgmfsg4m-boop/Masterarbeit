import { NextResponse } from "next/server";
import { emptyExtraction, getSchema } from "@/lib/schemas";
import { pdfToText } from "@/lib/pdf";
import {
  createBlankRecord,
  getRecord,
  recordExists,
  sanitizeId,
  savePdf,
  saveRecord,
} from "@/lib/store";

export const runtime = "nodejs";

function schemaFromJson(json: Record<string, unknown>, fallback?: string): string {
  const candidates = [
    json._PropertySchemaUsed,
    json.ComponentType,
    json.ComponentCategory,
    fallback,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && getSchema(candidate)) return candidate;
  }
  if (typeof json.ComponentType === "string") return json.ComponentType;
  return "RF Amplifier";
}

export async function POST(request: Request) {
  const form = await request.formData();
  const files = form.getAll("files");
  const defaultSchema = String(form.get("schemaId") ?? "");

  const pdfs = new Map<string, { file: File; buffer: Buffer }>();
  const jsons = new Map<string, Record<string, unknown>>();

  for (const entry of files) {
    if (!(entry instanceof File)) continue;
    const id = sanitizeId(entry.name);
    if (entry.name.toLowerCase().endsWith(".pdf")) {
      pdfs.set(id, { file: entry, buffer: Buffer.from(await entry.arrayBuffer()) });
    } else if (entry.name.toLowerCase().endsWith(".json")) {
      try {
        jsons.set(id, JSON.parse(await entry.text()) as Record<string, unknown>);
      } catch {
        return NextResponse.json(
          { error: `JSON ungültig: ${entry.name}` },
          { status: 400 },
        );
      }
    }
  }

  const ids = new Set([...pdfs.keys(), ...jsons.keys()]);
  if (ids.size === 0) {
    return NextResponse.json({ error: "Keine PDF- oder JSON-Dateien" }, { status: 400 });
  }

  const imported = [];
  for (const id of ids) {
    const json = jsons.get(id);
    const pdf = pdfs.get(id);
    const schemaId = json ? schemaFromJson(json, defaultSchema) : defaultSchema || "RF Amplifier";
    const gold = (json as Record<string, string | number | null> | undefined) ?? emptyExtraction(schemaId);
    const existed = await recordExists(id);
    const base = existed
      ? await getRecord(id)
      : createBlankRecord(id, schemaId, gold, json ? gold : null);

    if (json) {
      base.app = json as typeof base.app;
      if (!existed || base.goldStatus !== "reviewed") {
        base.gold = gold;
        base.goldStatus = "draft";
      }
      base.schemaId = schemaId;
    }

    if (pdf) {
      await saveRecord(base);
      await savePdf(id, pdf.buffer, pdf.file.name);
      base.text = await pdfToText(pdf.buffer);
      base.hasPdf = true;
      base.sourcePdfName = pdf.file.name;
    }

    const saved = await saveRecord(base);
    imported.push(saved);
  }

  return NextResponse.json({ imported });
}
