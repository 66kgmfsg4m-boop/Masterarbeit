import { NextResponse } from "next/server";
import { deleteRecord, getRecord, saveRecord } from "@/lib/store";
import type { DatasheetRecord } from "@/lib/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const record = await getRecord(id);
    return NextResponse.json({ record });
  } catch {
    return NextResponse.json({ error: "Datensatz nicht gefunden" }, { status: 404 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const existing = await getRecord(id);
  const patch = (await request.json()) as Partial<DatasheetRecord>;
  const record = await saveRecord({
    ...existing,
    ...patch,
    id: existing.id,
    partNumber: patch.partNumber ?? existing.partNumber,
  });
  return NextResponse.json({ record });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  await deleteRecord(id);
  return NextResponse.json({ ok: true });
}
