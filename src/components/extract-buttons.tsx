"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { PredictorId } from "@/lib/types";

export function ExtractButtons({ ids }: { ids?: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<PredictorId | null>(null);

  async function run(predictor: PredictorId) {
    setBusy(predictor);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictor, ids }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Lauf fehlgeschlagen");
      const n = json.updated?.length ?? 0;
      const e = json.errors?.length ?? 0;
      if (e > 0) {
        toast.error(`${n} ok, ${e} Fehler: ${json.errors[0].id} — ${json.errors[0].error}`);
      } else {
        toast.success(`${n} Datensätze mit ${predictor} extrahiert`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button disabled={!!busy} onClick={() => void run("local")}>
        {busy === "local" ? "läuft…" : "Lokaler Parser"}
      </Button>
      <Button variant="outline" disabled={!!busy} onClick={() => void run("ollama")}>
        {busy === "ollama" ? "läuft…" : "Ollama (on-prem)"}
      </Button>
      <Button variant="outline" disabled={!!busy} onClick={() => void run("azure")}>
        {busy === "azure" ? "läuft…" : "Azure GPT erneut"}
      </Button>
    </div>
  );
}
