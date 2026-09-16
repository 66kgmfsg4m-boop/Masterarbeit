import Link from "next/link";
import { ExtractButtons } from "@/components/extract-buttons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scoreRecord } from "@/lib/evaluate";
import { listRecords } from "@/lib/store";
import type { PredictorId } from "@/lib/types";

export const dynamic = "force-dynamic";

const PREDICTORS: PredictorId[] = ["app", "local", "azure", "ollama"];
const LABELS: Record<PredictorId, string> = {
  app: "App / GPT-5",
  local: "Lokal",
  azure: "Azure",
  ollama: "Ollama",
};

export default async function ComparePage() {
  const records = await listRecords();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Vergleich</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Jeder Datensatz gegen Gold. App-JSON ist dein bestehender GPT-5-Lauf. Lokal ist der
          Open-Source-Start ohne GPU. Ollama und Azure nur, wenn intern erlaubt.
        </p>
      </div>
      <ExtractButtons />
      <div className="grid gap-3">
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">Kein Datensatz vorhanden.</p>
        ) : (
          records.map((record) => (
            <Card key={record.id}>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                <CardTitle className="font-mono text-base">
                  <Link className="hover:underline" href={`/datensatz/${record.id}`}>
                    {record.partNumber}
                  </Link>
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{record.schemaId}</Badge>
                  <Badge variant="secondary">{record.split ?? "kein Split"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 text-sm">
                {PREDICTORS.map((predictor) => {
                  const predicted = predictor === "app" ? record.app : record.predictions[predictor];
                  if (!predicted) {
                    return (
                      <span key={predictor} className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
                        {LABELS[predictor]}: —
                      </span>
                    );
                  }
                  const score = scoreRecord(
                    record.id,
                    record.schemaId,
                    predictor,
                    record.gold,
                    predicted,
                  );
                  return (
                    <span key={predictor} className="rounded-md bg-white px-2 py-1 ring-1 ring-border">
                      {LABELS[predictor]}: {(score.accuracy * 100).toFixed(0)} %
                    </span>
                  );
                })}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
