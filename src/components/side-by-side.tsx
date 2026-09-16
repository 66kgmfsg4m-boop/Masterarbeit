"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DatasheetRecord, PredictorId } from "@/lib/types";
import { scoreRecord } from "@/lib/evaluate";
import { getSchema } from "@/lib/schemas";

const LABELS: Record<PredictorId, string> = {
  app: "App / GPT-5",
  local: "Lokaler Parser",
  azure: "Azure (neu)",
  ollama: "Ollama",
};

export function SideBySide({ record }: { record: DatasheetRecord }) {
  const schema = getSchema(record.schemaId);
  const available: PredictorId[] = ["app", "local", "azure", "ollama"].filter((id) => {
    if (id === "app") return Boolean(record.app);
    return Boolean(record.predictions[id as PredictorId]);
  }) as PredictorId[];
  const [left, setLeft] = useState<PredictorId>(available[0] ?? "app");
  const [right, setRight] = useState<PredictorId>(
    available.find((id) => id !== (available[0] ?? "app")) ?? "local",
  );

  const leftExt = left === "app" ? record.app : record.predictions[left];
  const rightExt = right === "app" ? record.app : record.predictions[right];
  const leftScore = leftExt ? scoreRecord(record.id, record.schemaId, left, record.gold, leftExt) : null;
  const rightScore = rightExt
    ? scoreRecord(record.id, record.schemaId, right, record.gold, rightExt)
    : null;

  const rows = useMemo(() => schema?.fields ?? [], [schema]);

  function cell(verdict?: string) {
    if (verdict === "correct") return "bg-emerald-50 text-emerald-900";
    if (verdict === "wrong") return "bg-red-50 text-red-900";
    if (verdict === "missing") return "bg-amber-50 text-amber-950";
    if (verdict === "extra") return "bg-sky-50 text-sky-950";
    return "";
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Gegen Gold</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Select value={left} onValueChange={(value) => setLeft((value as PredictorId) ?? left)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["app", "local", "azure", "ollama"] as PredictorId[]).map((id) => (
                <SelectItem key={id} value={id}>
                  {LABELS[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={right} onValueChange={(value) => setRight((value as PredictorId) ?? right)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["app", "local", "azure", "ollama"] as PredictorId[]).map((id) => (
                <SelectItem key={id} value={id}>
                  {LABELS[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-3 text-sm">
          {leftScore ? (
            <Badge variant="outline">
              {LABELS[left]}: {(leftScore.accuracy * 100).toFixed(0)} %
            </Badge>
          ) : (
            <span className="text-muted-foreground">{LABELS[left]} noch nicht gelaufen</span>
          )}
          {rightScore ? (
            <Badge variant="outline">
              {LABELS[right]}: {(rightScore.accuracy * 100).toFixed(0)} %
            </Badge>
          ) : (
            <span className="text-muted-foreground">{LABELS[right]} noch nicht gelaufen</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feld</TableHead>
                <TableHead>Gold</TableHead>
                <TableHead>{LABELS[left]}</TableHead>
                <TableHead>{LABELS[right]}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((field) => {
                const l = leftScore?.fields.find((row) => row.key === field.key);
                const r = rightScore?.fields.find((row) => row.key === field.key);
                return (
                  <TableRow key={field.key}>
                    <TableCell className="font-mono text-xs">{field.key}</TableCell>
                    <TableCell className="text-sm">{String(record.gold[field.key] ?? "—")}</TableCell>
                    <TableCell className={`text-sm ${cell(l?.verdict)}`}>
                      {l?.predicted ?? "—"}
                    </TableCell>
                    <TableCell className={`text-sm ${cell(r?.verdict)}`}>
                      {r?.predicted ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
