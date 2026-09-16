# Hinweise für die schriftliche Arbeit

Keine fertigen Kapiteltexte — nur die methodische Klammer, die diese Werkbank umsetzt.

## Sinnvoller Aufbau (technisch)

1. **Problem:** Datenblätter → strukturierte Felder im Materialsystem, Felder abhängig von der Baugruppe.
2. **Stand:** bestehender Azure-GPT-5-Analyzer (Zero-/Few-Shot, Schema bekannt).
3. **Fragestellung:** Wie gut ist das gegen ein kontrollierbares Open-Source-Verfahren, das sich mit eigenen Labels anlernen lässt?
4. **Nicht-Ziele:** kein Pretraining von Grund auf, kein Fine-Tune von GPT-5 in Azure als Hauptexperiment.
5. **Daten:** PDF+JSON, Gold nach Korrektur, Split nach Dokument, ca. 100 als erste Stufe.
6. **Modelle:** GPT-5 unverändert; Parser-Baseline; optional Qwen via Ollama; optional LoRA.
7. **Metrik:** Feldgenauigkeit inkl. Missing/Extra, plus Fehlerklassen (typ vs. max, Frequenzfenster).
8. **Grenzen:** Gateway ohne Trainingszugriff, Geheimhaltung, Schema-Schiefe im Korpus.

## Was du zitieren / belegen kannst

- Unterschied App vs. Gold am Beispiel Pdiss (Maximum vs. typisch) — zeigt, warum ungeprüfte GPT-Ausgaben schlechte Trainingslabels sind.
- Variable Schemas: Evaluation muss schema-bedingt sein.
- Open-Source-Training = LoRA auf interner GPU, nicht API-Gateway.

## Was du nicht behaupten solltest

- Dass 100 gemischte Baugruppen ein „allgemeines Datenblatt-LLM“ beweisen.
- Dass das R&S-Gateway „on-prem trainierbar“ sei, nur weil Hosting intern ist.
- Testgenauigkeit, wenn das Testset nachträglich an die Modelle angepasst wurde.
