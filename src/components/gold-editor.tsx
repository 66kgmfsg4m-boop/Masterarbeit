"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSchema, isMissingValue } from "@/lib/schemas";
import type { DatasheetRecord, Extraction } from "@/lib/types";

export function GoldEditor({ record }: { record: DatasheetRecord }) {
  const router = useRouter();
  const schema = getSchema(record.schemaId);
  const [gold, setGold] = useState<Extraction>(record.gold);
  const [notes, setNotes] = useState(record.notes);
  const [status, setStatus] = useState(record.goldStatus);
  const [busy, setBusy] = useState(false);

  const diffs = useMemo(() => {
    if (!record.app) return [];
    return (schema?.fields ?? [])
      .map((field) => {
        const g = String(gold[field.key] ?? "");
        const a = String(record.app?.[field.key] ?? "");
        const changed = String(g) !== String(a);
        return changed ? field.key : null;
      })
      .filter(Boolean) as string[];
  }, [gold, record.app, schema]);

  async function save(nextStatus = status) {
    setBusy(true);
    try {
      const response = await fetch(`/api/records/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gold, notes, goldStatus: nextStatus }),
      });
      if (!response.ok) throw new Error("Speichern fehlgeschlagen");
      setStatus(nextStatus);
      toast.success(nextStatus === "reviewed" ? "Als geprüft markiert" : "Gespeichert");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={status === "reviewed" ? "default" : "secondary"}>
          {status === "reviewed" ? "geprüft" : "Entwurf (App-JSON)"}
        </Badge>
        {diffs.length > 0 ? (
          <span className="text-sm text-amber-800">
            {diffs.length} Feld(er) weichen vom App-Export ab
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Identisch mit App-JSON</span>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(schema?.fields ?? []).map((field) => {
          const appVal = record.app?.[field.key];
          const differs = record.app && String(gold[field.key] ?? "") !== String(appVal ?? "");
          return (
            <div key={field.key} className="space-y-1">
              <Label className="flex items-center justify-between gap-2">
                <span>
                  {field.label}{" "}
                  <span className="font-mono text-[11px] text-muted-foreground">{field.key}</span>
                </span>
                {differs ? <span className="text-[11px] text-amber-700">korrigiert</span> : null}
              </Label>
              <Input
                value={gold[field.key] == null ? "" : String(gold[field.key])}
                onChange={(event) =>
                  setGold((current) => ({ ...current, [field.key]: event.target.value }))
                }
              />
              {differs && !isMissingValue(appVal) ? (
                <p className="text-[11px] text-muted-foreground">App: {String(appVal)}</p>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="space-y-1">
        <Label>Notiz zur Prüfung</Label>
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={() => void save("draft")} variant="outline">
          Entwurf speichern
        </Button>
        <Button disabled={busy} onClick={() => void save("reviewed")}>
          Als Gold prüfen
        </Button>
      </div>
    </div>
  );
}
