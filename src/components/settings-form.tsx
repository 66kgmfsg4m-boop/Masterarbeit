"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Settings } from "@/lib/types";

export function SettingsForm({ initial }: { initial: Settings & { hasAzureKey?: boolean } }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Speichern fehlgeschlagen");
      toast.success("Einstellungen gespeichert (nur lokal auf diesem Rechner)");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }

  function field(key: keyof Settings, label: string, type = "text") {
    return (
      <div className="space-y-1">
        <Label>{label}</Label>
        <Input
          type={type}
          value={form[key]}
          onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {field("azureEndpoint", "Azure OpenAI Endpoint")}
      {field("azureApiKey", "Azure API-Key", "password")}
      {field("azureDeployment", "Deployment-Name (z. B. gpt-5)")}
      {field("azureApiVersion", "API-Version")}
      {field("ollamaUrl", "Ollama URL")}
      {field("ollamaModel", "Ollama-Modell")}
      <Button disabled={busy} onClick={() => void save()}>
        Speichern
      </Button>
    </div>
  );
}
