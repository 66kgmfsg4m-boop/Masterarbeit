import { NextResponse } from "next/server";
import { toJsonl } from "@/lib/sft";
import { listRecords } from "@/lib/store";
import type { Split } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const split = searchParams.get("split") as Split | "all" | null;
  const reviewedOnly = searchParams.get("reviewed") !== "0";
  let records = await listRecords();
  if (reviewedOnly) records = records.filter((record) => record.goldStatus === "reviewed");
  if (split && split !== "all") {
    records = records.filter((record) => record.split === split);
  }
  const jsonl = toJsonl(records);
  return new NextResponse(jsonl, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Content-Disposition": `attachment; filename="datasheet-sft-${split ?? "all"}.jsonl"`,
    },
  });
}
