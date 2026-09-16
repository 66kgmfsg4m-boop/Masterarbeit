import { getSchema, METADATA_KEYS } from "../schemas";
import type { Extraction, Settings } from "../types";

function schemaPrompt(schemaId: string): string {
  const schema = getSchema(schemaId);
  const fields =
    schema?.fields
      .map((field) => `- ${field.key}: ${field.label}${field.unitHint ? ` (${field.unitHint})` : ""}`)
      .join("\n") ?? "";
  return `Du extrahierst technische Datenblatt-Felder für das Property-Schema "${schemaId}".
Antworte ausschließlich mit einem JSON-Objekt.
Fülle nur diese Felder:
${fields}
Fehlende Werte als "nicht gefunden". Keine zusätzlichen Keys außer den genannten. Keine Halluzinationen.`;
}

export async function extractAzure(
  text: string,
  schemaId: string,
  settings: Settings,
): Promise<Extraction> {
  if (!settings.azureEndpoint || !settings.azureApiKey || !settings.azureDeployment) {
    throw new Error("Azure OpenAI ist nicht konfiguriert.");
  }

  const endpoint = settings.azureEndpoint.replace(/\/$/, "");
  const url = `${endpoint}/openai/deployments/${settings.azureDeployment}/chat/completions?api-version=${encodeURIComponent(settings.azureApiVersion)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": settings.azureApiKey,
    },
    body: JSON.stringify({
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: schemaPrompt(schemaId) },
        {
          role: "user",
          content: `DATASHEET:\n${text.slice(0, 24000)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Azure-Fehler ${response.status}: ${body.slice(0, 400)}`);
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Azure lieferte keine Antwort.");
  return JSON.parse(content) as Extraction;
}

export async function extractOllama(
  text: string,
  schemaId: string,
  settings: Settings,
): Promise<Extraction> {
  const url = `${settings.ollamaUrl.replace(/\/$/, "")}/api/chat`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: settings.ollamaModel,
      stream: false,
      format: "json",
      options: { temperature: 0 },
      messages: [
        { role: "system", content: schemaPrompt(schemaId) },
        { role: "user", content: `DATASHEET:\n${text.slice(0, 24000)}` },
      ],
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama-Fehler ${response.status}: ${body.slice(0, 400)}`);
  }
  const json = (await response.json()) as { message?: { content?: string } };
  if (!json.message?.content) throw new Error("Ollama lieferte keine Antwort.");
  return JSON.parse(json.message.content) as Extraction;
}

export function stripMeta(extraction: Extraction): Extraction {
  const next: Extraction = {};
  for (const [key, value] of Object.entries(extraction)) {
    if (METADATA_KEYS.has(key)) continue;
    next[key] = value;
  }
  return next;
}
