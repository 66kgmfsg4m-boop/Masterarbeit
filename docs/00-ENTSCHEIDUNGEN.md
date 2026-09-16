# Entscheidungen für den Modellvergleich

Stand der Empfehlung für die Masterarbeit: Datasheet-Analyzer mit bestehendem Azure-GPT-5-Zweig und einem selbst anlernbaren Open-Source-Zweig.

## Was verglichen wird

| Zweig | Rolle | Training? |
|---|---|---|
| Azure GPT-5 (bestehende App) | Kommerzielle Baseline / Lehrer | **Nein.** Modell so lassen, wie es in Produktion extrahiert. |
| Open-Source-LLM (z. B. Qwen2.5-7B/14B) plus LoRA | Eigener, kontrollierbarer Gegenentwurf | Ja, **LoRA/QLoRA** auf Gold-JSON, on-premise. |
| Lokaler Parser in dieser Werkbank | Schwache, interpretierbare Baseline ohne GPU | Kein LLM-Training; Regeln + Einheiten aus dem PDF-Text. |
| Optional: R&S-Gateway (Qwen-VL, DeepSeek, …) | Zweite untrainierte Inferenz-Baseline | **Nein.** Die Seite „API ACCESS“ ist nur ein Gateway. |

Alle Zweige müssen dasselbe JSON-Schema, denselben Testsplit und dieselbe Feldmetrik nutzen.

## Azure selbst trainieren?

In der Regel **nein**.

- GPT-5 ist in Azure typischerweise nicht das Fine-Tune-Produkt; Fine-Tuning gibt es eher für GPT-4o / 4.1 / Mini.
- Das eigentliche Token-Training kann für Thesis-Größe noch im Bereich von Dutzenden bis wenigen Hundert Euro liegen.
- Teuer und unpraktisch wird oft das **Hosting** eines fine-getunten Endpoints (Stundenpreis, wenn der Endpoint durchläuft).
- Methodisch schwach: GPT-4o nachtrainieren und gegen GPT-5 zu stellen ist „OpenAI gegen OpenAI“, nicht „Cloud gegen selbst angelerntes Modell“.

Von Grund auf ein Foundation-Modell auf Azure-ML-GPUs zu trainieren ist für eine Masterarbeit unrealistisch (Datenmenge, Kosten, schlechteres Ergebnis als jedes fertige 7B-Modell).

## On-premise weiter trainieren oder neu aufsetzen?

**Weiter trainieren (Adapter), nicht von Null.**

- **Von Null** (Pretraining): ungeeignet.
- **Volles Fine-Tuning aller Gewichte:** meist unnötig, GPU-hungrig.
- **LoRA/QLoRA:** Basismodell bleibt stehen, kleine Adapter auf den Datenblatt-JSONs. 7B QLoRA oft schon auf einer 16–24-GB-GPU.

Das R&S-Gateway (`plm-ai-gateway…`, „API ACCESS“) liefert **Inferenz**, keine Gewichte und keine Trainingsjobs. MiniMax, DeepSeek-Flash-DSpark, Qwen3-Coder-Next usw. kannst du darüber aufrufen, aber nicht anlernen. `Qwen2.5-Coder-7B` ist für Datenblätter ohnehin das falsche Modell und stand auf Retire.

Open-Weight-Training geht nur, wenn IT/ML-Ops **Gewichtedateien plus GPU-Job** gibt — getrennt vom Gateway.

## Colab?

- **Öffentliche** Hersteller-PDFs: ja, zum Üben der Tools.
- **Interne / VS-NfD-relevante Datenblätter: nein.** Colab läuft auf Google-Servern.

Open Source heißt: Code und Gewichte sind offen. Der **Ort der PDFs** muss intern bleiben.

## Praktische Reihenfolge

1. Schema aus der bestehenden App einfrieren (Felder je Baugruppe).
2. ~100 PDF+JSON-Paare, Gold prüfen, Split nach Dokument.
3. Erst GPT-5 vs. untrainiertes Open Source / lokaler Parser messen.
4. Wenn der Abstand groß ist und eine interne GPU da ist: LoRA auf dem Train-Split.
5. Blind auf dem eingefrorenen Testset berichten.
