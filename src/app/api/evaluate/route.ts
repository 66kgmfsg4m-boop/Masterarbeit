import { NextResponse } from "next/server";
import { scoreRecord, summarize } from "@/lib/evaluate";
import { listRecords } from "@/lib/store";
import type { PredictorId } from "@/lib/types";

export const runtime = "nodejs";

const PREDICTORS: PredictorId[] = ["app", "local", "azure", "ollama"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const split = searchParams.get("split");
  const records = (await listRecords()).filter((record) => {
    if (split && split !== "all" && record.split !== split) return false;
    return true;
  });

  const scores = records.flatMap((record) =>
    PREDICTORS.flatMap((predictor) => {
      const predicted = predictor === "app" ? record.app : record.predictions[predictor];
      if (!predicted) return [];
      return [scoreRecord(record.id, record.schemaId, predictor, record.gold, predicted)];
    }),
  );

  const summaries = PREDICTORS.map((predictor) => summarize(scores, predictor)).filter(
    (row) => row.records > 0,
  );

  return NextResponse.json({
    records: records.map((record) => ({
      id: record.id,
      schemaId: record.schemaId,
      split: record.split,
      goldStatus: record.goldStatus,
    })),
    scores,
    summaries,
  });
}
