# DatasheetBench

Vergleichswerkbank für eine Masterarbeit: technische Datenblätter auslesen, Gold-Labels an euer Materialschema binden, **Azure GPT-5** gegen einen **lokalen Open-Source-Zweig** messen.

Interne PDFs bleiben auf dem Rechner. Kein Colab, kein öffentliches Git mit Datenblättern.

## Was die App tut

1. PDF und JSON unter **derselben Materialnummer** importieren (`ADPA7005CHIP.pdf` + `ADPA7005CHIP.json`).
2. App-JSON (dein bestehender GPT-5-Export) als Entwurf zeigen, nach Korrektur als **Gold** markieren.
3. Felder je Baugruppe / Property-Schema halten (RF Amplifier, OpAmp, RF Switch — erweiterbar in `src/lib/schemas.ts`).
4. PDF in Text parsen (das ist die Modelleingabe, kein Stammdatenfeld).
5. Vergleichen: App/GPT-5, lokaler Parser, optional Ollama, optional Azure.
6. Feldgenauigkeit (Test-Split), JSONL-Export für LoRA on-premise.

## Lokal starten

```bash
npm install
npm run seed
npm run dev
```

Öffnet [http://127.0.0.1:47281](http://127.0.0.1:47281). `seed` legt sieben öffentliche Beispielblätter an, darunter `ADPA7005CHIP` mit dem Unterschied typische Verlustleistung (Gold 6 W) vs. Absolut-Maximum aus der App (13.4 W).

Optionale Endpunkte in `.env.local` (siehe `.env.example`) oder unter Einstellungen:

- Azure OpenAI nur über den **freigegebenen Firmen-Tenant**
- Ollama lokal, z. B. `qwen2.5:14b`

## Datensatz (ca. 100 Stück)

- Eine ID = Materialnummer = Dateiname ohne Endung
- JSON-Felder wie in deiner App, Schema in `_PropertySchemaUsed` / `ComponentType`
- Fehlend einheitlich `"nicht gefunden"` oder `null`, nicht mischen
- Nach Baugruppe splitten (Button „Split erzeugen“): grob 65 / 15 / 20, Test einfrieren
- Test-20 gegen das PDF prüfen; Train stichprobenartig

Hundert Datensätze reichen für den ersten Vergleich und ein erstes LoRA, wenn nicht zu viele Schemas verdünnt werden.

## LoRA (nur interne GPU)

JSONL unter `/export` herunterladen, dann auf einem GPU-Host ohne Cloud-Upload:

```bash
pip install -r training/requirements.txt
python training/lora_finetune.py \
  --train datasheet-sft-train.jsonl \
  --val datasheet-sft-val.jsonl \
  --base Qwen/Qwen2.5-7B-Instruct \
  --out models/datasheet-lora
```

Das Firmen-LLM-Gateway (nur API-Access) ersetzt das nicht: darüber kannst du inferenzen, nicht trainieren.

## Sicherheit

Echte R&S-Datenblätter nicht nach Colab, Hugging Face oder privates GitHub. Diese App speichert unter `data/records/` lokal. `data/settings.json` ist gitignoriert.
