# Betrieb

## Installation

```bash
git clone https://github.com/66kgmfsg4m-boop/Masterarbeit.git
cd Masterarbeit
npm install
npm run seed          # optionale öffentliche Demos
npm run dev           # http://127.0.0.1:47281
```

Produktion lokal: `npm run build && npm run start` (gleicher Port 47281).

Node 22 wird in dieser Umgebung verwendet. Python nur für LoRA (`training/`).

## Wo Daten liegen

| Pfad | Inhalt | Git? |
|---|---|---|
| `data/records/<ID>/` | PDF, `record.json` (Gold, App, Text, Predictions) | nur Demo-Beispiele |
| `data/settings.json` | Azure/Ollama-Keys | nein |
| `data/exports/` | manuell abgelegte JSONL | nein |
| `.env.local` | alternative Keys, siehe `.env.example` | nein |

## Import

UI **Datensatz**: PDF und JSON gleichzeitig ablegen, gleicher Dateiname. Fallback-Schema, falls das JSON kein `ComponentType` trägt.

Oder API:

```bash
curl -F "files=@ADPA7005CHIP.pdf" -F "files=@ADPA7005CHIP.json" \
  http://127.0.0.1:47281/api/import
```

## Endpunkte (optional)

Einstellungen in der UI oder `.env.local`:

- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`
- `OLLAMA_URL` (Standard `http://127.0.0.1:11434`), `OLLAMA_MODEL`

Azure nur über den bereits freigegebenen Firmenweg. Ollama nur lokal / R&S-Netz.

## Sicherheit

- Interne Datenblätter nicht nach Google Colab, Kaggle, RunPod-Public, Hugging Face Inference.
- Dieses GitHub-Repo nicht mit echten R&S-PDFs füttern, wenn das Repo öffentlich ist oder VS-NfD greift.
- Klassifikation am Gateway (bis VS-NfD) gilt für den **internen** Inferenzweg, nicht für Public Cloud.

## Tests ohne Browser

```bash
npm run check:eval    # Normierung / Feldvergleich
npm run lint
npm run build
```

## Vercel / Publish

Die UI ist theoretisch deploybar, **Speicher ist lokal** (`data/records`). Für die Thesis on-prem bzw. Laptop nutzen. Interne PDFs nicht auf Vercel laden.
