import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listRecords } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const records = await listRecords();
  const reviewed = records.filter((record) => record.goldStatus === "reviewed").length;
  const train = records.filter((record) => record.split === "train").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Export / LoRA</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          JSONL im Chat-Format für Unsloth, LLaMA-Factory oder Hugging Face PEFT. Nur intern
          speichern. Training nicht in Colab, wenn echte Firmen-PDFs im Text stehen.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stand</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6">
          <p>
            {reviewed} geprüfte Gold-JSONs, davon {train} im Train-Split. Für ein erstes LoRA
            reichen 50–100, wenn nicht zu viele Baugruppen gemischt sind.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="underline" href="/api/export?split=train">
              Train JSONL
            </a>
            <a className="underline" href="/api/export?split=val">
              Val JSONL
            </a>
            <a className="underline" href="/api/export?split=test">
              Test JSONL
            </a>
            <a className="underline" href="/api/export?split=all">
              Alle geprüften
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">On-premise Training</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6">
          <p>
            Skript liegt unter <code>training/lora_finetune.py</code>. Beispiel, sobald eine interne
            GPU da ist:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">{`python training/lora_finetune.py \\
  --train data/exports/datasheet-sft-train.jsonl \\
  --val data/exports/datasheet-sft-val.jsonl \\
  --base Qwen/Qwen2.5-7B-Instruct \\
  --out models/datasheet-lora`}</pre>
          <p>
            Das R&S-Gateway (API Access) trainiert nicht mit. Entweder interne Gewichte + GPU oder
            nur der Vergleich ohne Fine-Tune (lokaler Parser + Ollama-Inferenz).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
