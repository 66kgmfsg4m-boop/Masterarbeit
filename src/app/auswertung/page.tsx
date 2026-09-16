import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { scoreRecord, summarize } from "@/lib/evaluate";
import { listRecords } from "@/lib/store";
import type { PredictorId } from "@/lib/types";

export const dynamic = "force-dynamic";

const PREDICTORS: PredictorId[] = ["app", "local", "azure", "ollama"];
const LABELS: Record<PredictorId, string> = {
  app: "App / GPT-5",
  local: "Lokaler Parser",
  azure: "Azure (neu)",
  ollama: "Ollama",
};

export default async function MetricsPage() {
  const records = await listRecords();
  const testRecords = records.filter((record) => record.split === "test");
  const pool = testRecords.length ? testRecords : records;
  const using = testRecords.length ? "nur Test-Split" : "alle Datensätze (noch kein Test-Split)";

  const scores = pool.flatMap((record) =>
    PREDICTORS.flatMap((predictor) => {
      const predicted = predictor === "app" ? record.app : record.predictions[predictor];
      if (!predicted) return [];
      return [scoreRecord(record.id, record.schemaId, predictor, record.gold, predicted)];
    }),
  );
  const summaries = PREDICTORS.map((predictor) => summarize(scores, predictor)).filter(
    (row) => row.records > 0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Auswertung</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Feldgenauigkeit gegen Gold. Zahlen mit 1 % Relativtoleranz, fehlend = „nicht gefunden“.
          Aktuell: {using}. Für die Thesis den Test-Split nach dem Labeln einfrieren.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {summaries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Predictions. Unter Vergleich starten.</p>
        ) : (
          summaries.map((row) => (
            <Card key={row.predictor}>
              <CardHeader>
                <CardTitle className="text-base">{LABELS[row.predictor]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-heading text-3xl font-semibold">
                  {(row.accuracy * 100).toFixed(1)} %
                </p>
                <p className="text-muted-foreground">
                  {row.records} Dokumente · {row.correct} korrekt · {row.wrong} falsch ·{" "}
                  {row.missing} fehlend · {row.extra} extra
                </p>
                <div className="pt-2">
                  {Object.entries(row.bySchema).map(([schema, stats]) => (
                    <p key={schema}>
                      {schema}: {(stats.accuracy * 100).toFixed(0)} % ({stats.records} Blätter)
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {summaries.map((row) => {
        const fields = Object.entries(row.byField).sort((a, b) => a[1].accuracy - b[1].accuracy);
        if (!fields.length) return null;
        return (
          <Card key={`${row.predictor}-fields`}>
            <CardHeader>
              <CardTitle className="text-base">Schwächste Felder — {LABELS[row.predictor]}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feld</TableHead>
                    <TableHead>Genauigkeit</TableHead>
                    <TableHead>n</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.slice(0, 12).map(([key, stats]) => (
                    <TableRow key={key}>
                      <TableCell className="font-mono text-xs">{key}</TableCell>
                      <TableCell>{(stats.accuracy * 100).toFixed(0)} %</TableCell>
                      <TableCell>{stats.scored}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
