"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCHEMAS } from "@/lib/schemas";

export function ImportDropzone() {
  const router = useRouter();
  const [schemaId, setSchemaId] = useState<string>("auto");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function upload(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setBusy(true);
    try {
      const form = new FormData();
      for (const file of files) form.append("files", file);
      if (schemaId !== "auto") form.append("schemaId", schemaId);
      const response = await fetch("/api/import", { method: "POST", body: form });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Import fehlgeschlagen");
      toast.success(`${json.imported.length} Datensatz/Datensätze übernommen`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <Label>Schema-Fallback</Label>
          <Select value={schemaId} onValueChange={(value) => setSchemaId(value ?? "auto")}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Aus JSON lesen</SelectItem>
              {SCHEMAS.map((schema) => (
                <SelectItem key={schema.id} value={schema.id}>
                  {schema.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground sm:pb-2">
          Dateien gleich benennen: <code>ADPA7005CHIP.pdf</code> +{" "}
          <code>ADPA7005CHIP.json</code>
        </p>
      </div>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          void upload(event.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition ${
          drag ? "border-primary bg-white" : "border-border bg-white/70"
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.json,application/pdf,application/json"
          className="hidden"
          onChange={(event) => {
            if (event.target.files) void upload(event.target.files);
          }}
        />
        <p className="font-medium">PDF und JSON hierher ziehen</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Interne Datenblätter bleiben auf diesem Rechner. Kein Upload in Colab oder
          eine Public Cloud.
        </p>
        <Button className="mt-4" type="button" disabled={busy} variant="outline">
          {busy ? "Importiere…" : "Dateien wählen"}
        </Button>
      </label>
    </div>
  );
}
