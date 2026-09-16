# Training (LoRA, on-premise)

## Was diese Werkbank exportiert

Unter **Export / LoRA** (oder `/api/export?split=train`):

JSONL, eine Zeile pro Datenblatt, Chat-Format:

```json
{
  "messages": [
    { "role": "system", "content": "Du bist ein Extraktor … nur JSON …" },
    { "role": "user", "content": "SCHEMA: RF Amplifier\n\nDATASHEET (ADPA7005CHIP):\n<PDF-Text>" },
    { "role": "assistant", "content": "{ ... Gold ohne _Metafelder ... }" }
  ],
  "meta": { "id": "ADPA7005CHIP", "schemaId": "RF Amplifier", "split": "train" }
}
```

Das Schema steht in der **User**-Nachricht, die Werte in der Assistant-Nachricht. So lernt das Modell die variable Feldliste je Baugruppe.

Nur geprüfte Gold-JSONs (`goldStatus: reviewed`) kommen in den Default-Export.

## GPU-Job

Nicht in Colab, wenn der JSONL-Text aus internen PDFs stammt.

```bash
pip install -r training/requirements.txt
python training/lora_finetune.py \
  --train datasheet-sft-train.jsonl \
  --val datasheet-sft-val.jsonl \
  --base Qwen/Qwen2.5-7B-Instruct \
  --out models/datasheet-lora
```

Defaults: 3 Epochen, LoRA r=16, max. 4096 Tokens. 7B-QLoRA: grob eine 16–24-GB-GPU. 14B bzw. VL-30B deutlich mehr. 72B-VL nachtrainieren ist für die Thesis unnötig.

Basismodell: **Instruct-Qwen für Text** nach PDF-Parse. Coder-Modelle und das Gateway-`Qwen2.5-Coder-7B` (Retire) nicht verwenden. Für Seiten-als-Bild später Qwen-VL, dann wäre die Eingabe ein Screenshot statt `text`.

## R&S on-prem LLMs (SecureDE API Access)

Die Gateway-Tabelle belegt:

- Host / API-Model-Name / Context / Hosting „On-premise (R&S Cloud)“
- **kein** Fine-Tune, kein Gewichtedownload, kein GPU-Trainingsjob

Daraus folgt: über das Gateway **inferenzen** (z. B. Qwen-VL für Tabellen, DeepSeek-V4-Flash als Textmodell), **nicht trainieren**. Eigenes Training nur mit separat freigegebenen Open Weights.

## Wenn keine GPU kommt

Die Thesis bleibt valide mit:

1. GPT-5 (App) vs. lokalem Parser vs. optional Gateway-Inferenz, gleiches Testset.
2. Datensatz, Schema, Fehlertypen (typ/max) dokumentiert.
3. LoRA als Ausblick mit exportiertem JSONL und diesem Skript.
