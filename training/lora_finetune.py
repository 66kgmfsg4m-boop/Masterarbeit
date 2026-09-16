"""QLoRA fine-tune for datasheet JSON extraction.

Run on an internal GPU host. Do not upload company datasheets to Colab.

Example:
  python training/lora_finetune.py \\
    --train path/to/datasheet-sft-train.jsonl \\
    --val path/to/datasheet-sft-val.jsonl \\
    --base Qwen/Qwen2.5-7B-Instruct \\
    --out models/datasheet-lora
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def read_jsonl(path: Path) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--train", required=True)
    parser.add_argument("--val", default="")
    parser.add_argument("--base", default="Qwen/Qwen2.5-7B-Instruct")
    parser.add_argument("--out", default="models/datasheet-lora")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--lr", type=float, default=2e-4)
    args = parser.parse_args()

    train_rows = read_jsonl(Path(args.train))
    val_rows = read_jsonl(Path(args.val)) if args.val else []
    if len(train_rows) < 10:
        raise SystemExit(f"Zu wenig Trainingszeilen: {len(train_rows)}")

    try:
        from datasets import Dataset
        from peft import LoraConfig, get_peft_model
        from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
        from trl import SFTTrainer
    except ImportError as exc:
        raise SystemExit(
            "Installiere training/requirements.txt auf dem GPU-Rechner.\n"
            f"Originalfehler: {exc}"
        ) from exc

    def to_text(row: dict) -> dict:
        messages = row["messages"]
        text = ""
        for message in messages:
            text += f"<|{message['role']}|>\n{message['content']}\n"
        return {"text": text}

    train_ds = Dataset.from_list(train_rows).map(to_text)
    eval_ds = Dataset.from_list(val_rows).map(to_text) if val_rows else None

    tokenizer = AutoTokenizer.from_pretrained(args.base, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        args.base,
        device_map="auto",
        trust_remote_code=True,
    )
    model = get_peft_model(
        model,
        LoraConfig(
            r=16,
            lora_alpha=32,
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM",
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
        ),
    )

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        dataset_text_field="text",
        max_seq_length=4096,
        args=TrainingArguments(
            output_dir=args.out,
            num_train_epochs=args.epochs,
            per_device_train_batch_size=1,
            gradient_accumulation_steps=8,
            learning_rate=args.lr,
            logging_steps=10,
            save_strategy="epoch",
            fp16=True,
            report_to=[],
        ),
    )
    trainer.train()
    trainer.save_model(args.out)
    tokenizer.save_pretrained(args.out)
    print(f"Adapter gespeichert unter {args.out}")


if __name__ == "__main__":
    main()
