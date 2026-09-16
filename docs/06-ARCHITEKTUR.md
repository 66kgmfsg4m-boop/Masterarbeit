# Architektur der Werkbank

```text
src/app/                 UI (Deutsch)
  datensatz/             Import, Liste, Gold-Editor
  vergleich/             Scores je Blatt
  auswertung/            Test-Split, Felder
  export/                JSONL-Links
  einstellungen/         Azure / Ollama
src/app/api/             Node-Routen, Dateisystem unter data/
src/lib/schemas.ts       Property-Schemas der Baugruppen
src/lib/evaluate.ts      Feldvergleich
src/lib/extractors/      local (Parser), llm (Azure, Ollama)
src/lib/store.ts         data/records/<id>/
training/lora_finetune.py
scripts/seed.ts          öffentliche Demos
docs/                    diese Dokumentation
```

## Record-JSON (verkürzt)

```json
{
  "id": "ADPA7005CHIP",
  "partNumber": "ADPA7005CHIP",
  "schemaId": "RF Amplifier",
  "split": "test",
  "goldStatus": "reviewed",
  "gold": { "PdissW": "6 W" },
  "app": { "PdissW": "13.4 W" },
  "predictions": { "local": { } },
  "text": "--- Seite 1 ---\n...",
  "hasPdf": true
}
```

## Wichtige APIs

| Methode | Pfad | Zweck |
|---|---|---|
| POST | `/api/import` | PDF/JSON-Multipart |
| PATCH | `/api/records/:id` | Gold, Status, Split |
| POST | `/api/records` | Splits neu würfeln |
| POST | `/api/extract` | `{ predictor: "local"\|"ollama"\|"azure", ids? }` |
| GET | `/api/evaluate?split=test` | Scores |
| GET | `/api/export?split=train` | JSONL |
| PUT | `/api/settings` | Keys lokal |

Neues Materialsystem-Feld: in `SCHEMAS` in `src/lib/schemas.ts` den `key` ergänzen (wie in der App), Aliase für den Parser pflegen, UI und Export folgen automatisch.
