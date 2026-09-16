import { METADATA_KEYS } from "./schemas";
import type { DatasheetRecord } from "./types";

export function toSftRow(record: DatasheetRecord): object {
  const gold: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record.gold)) {
    if (METADATA_KEYS.has(key)) continue;
    gold[key] = value;
  }

  const schemaNote = `SCHEMA: ${record.schemaId}
Fülle nur die Felder dieses Property-Schemas. Fehlende Werte: "nicht gefunden".`;

  return {
    messages: [
      {
        role: "system",
        content:
          "Du bist ein Extraktor für technische Datenblätter. Antworte nur mit JSON gemäß dem vorgegebenen Schema. Erfinde keine Werte.",
      },
      {
        role: "user",
        content: `${schemaNote}\n\nDATASHEET (${record.partNumber}):\n${record.text || "[PDF-Text fehlt — vor dem Export parsen]"}`,
      },
      {
        role: "assistant",
        content: JSON.stringify(gold, null, 2),
      },
    ],
    meta: {
      id: record.id,
      schemaId: record.schemaId,
      split: record.split,
      goldStatus: record.goldStatus,
    },
  };
}

export function toJsonl(records: DatasheetRecord[]): string {
  return records.map((record) => JSON.stringify(toSftRow(record))).join("\n") + "\n";
}
