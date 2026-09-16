# DatasheetBench — Masterarbeit Datenblatt-Analyzer

Werkbank, um den bestehenden **Azure-GPT-5-Analyzer** gegen einen **selbst anlernbaren Open-Source-Zweig** zu vergleichen. PDF und JSON tragen dieselbe Materialnummer. Die Felder folgen dem Property-Schema der jeweiligen Baugruppe aus dem Materialsystem.

## Warum die Preview-URL nicht aufgeht

`http://127.0.0.1:47281` ist der Rechner, auf dem der Dev-Server gerade läuft — nicht dein Laptop. Von außen ist diese Adresse nicht erreichbar. Lokal starten (unten) oder das Repo von GitHub klonen.

Zielrepository: [https://github.com/66kgmfsg4m-boop/Masterarbeit](https://github.com/66kgmfsg4m-boop/Masterarbeit)

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [docs/00-ENTSCHEIDUNGEN.md](docs/00-ENTSCHEIDUNGEN.md) | GPT-5 nicht trainieren, kein Azure-Full-Training, LoRA on-prem, kein Colab mit internen PDFs |
| [docs/01-DATENSATZ.md](docs/01-DATENSATZ.md) | PDF+JSON, Gold vs. App, Schemas je Baugruppe, 100 Datensätze, Split |
| [docs/02-VERGLEICH.md](docs/02-VERGLEICH.md) | Extraktoren, Metriken, Feldvergleich |
| [docs/03-TRAINING.md](docs/03-TRAINING.md) | JSONL, LoRA, R&S-Gateway (nur API) |
| [docs/04-BETRIEB.md](docs/04-BETRIEB.md) | Installation, Import, Sicherheit |
| [docs/05-THESIS.md](docs/05-THESIS.md) | Gliederungshilfe für die schriftliche Arbeit |
| [docs/06-ARCHITEKTUR.md](docs/06-ARCHITEKTUR.md) | Ordner, APIs, wo Schemas liegen |

## Lokal starten

Voraussetzung: Node.js 22+.

```bash
git clone https://github.com/66kgmfsg4m-boop/Masterarbeit.git
cd Masterarbeit
npm install
npm run seed
npm run dev
```

Browser: [http://127.0.0.1:47281](http://127.0.0.1:47281)

`npm run seed` legt sieben **öffentliche** Beispielblätter an (u. a. ADPA7005CHIP: Gold-Pdiss 6 W typisch, App-JSON 13.4 W Absolut-Maximum).

## Ablauf für deinen Korpus (~100)

1. Aus der bestehenden App JSON exportieren, PDF daneben, gleicher Dateiname.
2. Unter **Datensatz** beide Dateien importieren.
3. Gegen das Blatt korrigieren, **Als Gold prüfen**.
4. **Split erzeugen** (nach Baugruppe, ca. 65 / 15 / 20). Testset einfrieren.
5. Lokalen Parser laufen lassen, optional Ollama on-prem.
6. **Auswertung** für die Thesistabelle, **Export** für LoRA.

Interne R&S-Datenblätter nicht nach Colab, Hugging Face oder ins öffentliche Git legen. In diesem Repo liegen nur synthetische/öffentliche Demo-PDFs.

## Technik

- Next.js (App Router), TypeScript, Tailwind, shadcn/ui
- PDF-Text: `unpdf`
- Bewertung: `src/lib/evaluate.ts` (Zahlen ±1 %, `"nicht gefunden"` = fehlend)
- LoRA-Skript: `training/lora_finetune.py`
