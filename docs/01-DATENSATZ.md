# Datensatz

## Paarung

Eine Materialnummer, zwei Dateien, gleicher Stamm:

```text
ADPA7005CHIP.pdf
ADPA7005CHIP.json
```

Das reicht als Kern. Zusätzlich muss die **Baugruppe / das Property-Schema** bekannt sein (`_PropertySchemaUsed` oder `ComponentType`), weil die Felder je Typ anders sind.

Der PDF-**Text** ist kein Stammdatenfeld. Er ist die Modelleingabe (was Qwen/Parser lesen), erzeugt aus der PDF. Die Werkbank cached ihn unter `data/records/<ID>/record.json` → `text`.

## App-JSON ist nicht automatisch Gold

Die bestehende App (GPT-5) liefert den **Vorschlag**. Gold wird erst nach Prüfung gegen das Blatt.

Beispiel ADPA7005CHIP (Analog Devices, öffentliches Blatt):

| Feld | App-JSON | Gold in der Demo | Grund |
|---|---|---|---|
| Gain, P1dB, OIP3, Band | 17 dB / 30.5 dBm / 41 dBm / 20–44 GHz | gleich | passt zu den Headline-Specs |
| `PdissW` | 13.4 W | 6 W | 13.4 W ist Absolut-Maximum bei 85 °C; 6 W ≈ 5 V × 1.2 A typisch |
| `Pitch` | `"nicht gefunden"` | `"nicht gefunden"` | einheitlicher Missing-Marker |

Ohne diese Unterscheidung trainiert ihr das lokale Modell auf GPT-5-Fehler.

## JSON-Form (wie in der App)

```json
{
  "ComponentType": "RF Amplifier",
  "PartNumber": "ADPA7005CHIP",
  "Manufacturer": "Analog Devices",
  "FMinHz": "20 GHz",
  "FMaxHz": "44 GHz",
  "GainTypDb": "17 dB",
  "PdissW": "6 W",
  "_PropertySchemaUsed": "RF Amplifier",
  "_RequestedCategory": "RF Power Amplifier"
}
```

Regeln:

- Fehlend immer gleich: `"nicht gefunden"` **oder** `null`, nicht beides.
- `_PropertySchemaUsed` und `_RequestedCategory` sind **Eingabe/Metadaten**, keine aus dem Blatt gelesenen Messwerte.
- `Manufacturer` / `ManufacturerInfo` nicht doppelt pflegen, wenn das Materialsystem nur eines braucht.
- Einheiten so lassen, wie das Materialsystem sie erwartet (`"20 GHz"` bleibt erlaubt, auch wenn der Key `FMinHz` heißt) — aber innerhalb eines Feldes konsistent.

## Variable Felder je Baugruppe

Das ist gewollt. Die App weiß bereits, welche Parameter pro Baugruppe relevant sind. In der Werkbank stehen die Schemas in `src/lib/schemas.ts`:

- RF Amplifier
- Operational Amplifier
- RF Switch

Weitere Baugruppen dort ergänzen (gleiche `FieldDef`-Form: `key`, `label`, `kind`, `aliases`). Prompt und Auswertung nutzen immer nur die Felder **dieses** Schemas.

Auswertung nicht über alle Keys aller Typen mitteln, sondern **pro Feld und pro Schema**.

## Zielgröße 100

Hundert Paare reichen für:

- die Pipeline,
- GPT-5 vs. Parser/untrainiertes OS-Modell,
- ein erstes LoRA (unteres Ende).

Sie reichen nicht für die Behauptung „Open Source ist auf allen Baugruppen so gut wie GPT-5“, wenn 15 Typen à 6 Blätter vorkommen. Besser: wenige häufige Schemas, 15–30 Blätter pro Schema.

Qualität: alle 100 grob auf leere Pflichtfelder und unsinnige Einheiten prüfen; die Testmenge (ca. 20) wirklich gegen das PDF.

## Split

Nach **Dokument**, nie nach einzelnem Feld oder nach Seite.

In der UI: Button **Split erzeugen** (seed 42, je Schema gemischt, grob 20 % Test / 15 % Val / Rest Train). Test danach nicht nachträglich „schönrechnen“.

`splits` stehen in jeder `record.json`.

## Ablage intern (nicht Git)

```text
data/records/<Materialnummer>/
  datasheet.pdf
  record.json      # gold, app, text, split, predictions
```

`data/settings.json` (Azure/Ollama-Keys) ist gitignoriert. Interne PDFs nicht committen; die Demo-PDFs im Repo sind synthetisch/öffentlich.
