# Vergleich und Metriken

## Extraktoren

| ID | Quelle | Wann nutzen |
|---|---|---|
| `app` | JSON aus der bestehenden GPT-5-App | Immer; das ist die Produktions-Baseline. |
| `local` | Schema-bewusster Parser auf PDF-Text (`src/lib/extractors/local.ts`) | Sofort, ohne GPU, als schwache OS-Baseline. |
| `ollama` | lokales/on-prem LLM, z. B. `qwen2.5:14b` | Wenn Ollama intern läuft. |
| `azure` | erneuter Azure-OpenAI-Call mit demselben Schema | Nur über den freigegebenen Tenant; zum Reproduzieren, nicht Pflicht. |

Start in der UI: Übersicht oder Vergleich → **Lokaler Parser**. Ollama/Azure unter Einstellungen konfigurieren.

## Was Gold gegen Prediction bedeutet

Pro Schema-Feld, Implementierung `src/lib/evaluate.ts`:

- beide leer / `"nicht gefunden"` / `null` → nicht gewertet (`both_empty`)
- Gold da, Prediction leer → `missing`
- Gold leer, Prediction da → `extra`
- beide da und (nach Normierung) gleich → `correct`
- beide da und ungleich → `wrong`

Zahlen: Relativtoleranz 1 % (z. B. `1.2 A` = `1.20 A`). Groß/Kleinschreibung und überflüssige Satzzeichen werden ignoriert.

**Genauigkeit** = `correct / (correct + wrong + missing + extra)`.

Die Seite **Auswertung** nimmt bevorzugt den **Test-Split**. Ohne Split fallen alle Datensätze in die Tabelle — für die Thesis den Split vorher erzeugen.

## Bericht in der Arbeit

Empfohlene Tabelle (Testset, eingefroren):

- Genauigkeit gesamt je Zweig
- Genauigkeit je Baugruppe
- schwächste Felder (typ vs. max, Frequenzbezug, fehlender Pitch …)
- optional: Latenz und Kosten pro Blatt (GPT-5 vs. lokal)

Nicht den Train-Split als Güte verkaufen. Nicht nach dem Testen das Gold am Testset anpassen.
