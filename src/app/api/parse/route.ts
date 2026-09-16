import { NextResponse } from "next/server";
import { pdfToText } from "@/lib/pdf";
import { getRecord, readPdf, saveRecord } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { id } = (await request.json()) as { id: string };
  const record = await getRecord(id);
  if (!record.hasPdf) {
    return NextResponse.json({ error: "Kein PDF vorhanden" }, { status: 400 });
  }
  const text = await pdfToText(await readPdf(id));
  const saved = await saveRecord({ ...record, text });
  return NextResponse.json({ record: saved });
}
