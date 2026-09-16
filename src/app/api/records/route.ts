import { NextResponse } from "next/server";
import { assignSplits, listRecords } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const records = await listRecords();
  return NextResponse.json({ records });
}

export async function POST() {
  const records = await assignSplits();
  return NextResponse.json({ records });
}
