import { isMissingValue, schemaFieldKeys } from "./schemas";
import type {
  Extraction,
  FieldComparison,
  MetricsSummary,
  PredictorId,
  RecordScore,
} from "./types";

const MISSING_TOKEN = "nicht gefunden";

export function normalizeValue(value: unknown): string | null {
  if (isMissingValue(value)) return null;
  return String(value).replace(/\s+/g, " ").trim();
}

function parseQuantity(value: string): { amount: number; unit: string } | null {
  const match = value
    .replace(",", ".")
    .match(
      /^([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*([a-zµuΩ°/%]+(?:\/[a-zµu]+)?)?$/i,
    );
  if (!match) return null;
  return {
    amount: Number(match[1]),
    unit: (match[2] ?? "").toLowerCase().replace("µ", "u"),
  };
}

function unitsCompatible(a: string, b: string): boolean {
  if (!a || !b) return true;
  const aliases: Record<string, string> = {
    ua: "a",
    ma: "a",
    na: "a",
    pa: "a",
    uv: "v",
    mv: "v",
    kv: "v",
    uw: "w",
    mw: "w",
    khz: "hz",
    mhz: "hz",
    ghz: "hz",
    thz: "hz",
    dbm: "dbm",
    db: "db",
  };
  const strip = (unit: string) => aliases[unit] ?? unit;
  return strip(a) === strip(b) || a === b;
}

export function valuesMatch(gold: string | null, predicted: string | null): boolean {
  if (gold === null && predicted === null) return true;
  if (gold === null || predicted === null) return false;

  const left = gold.toLowerCase();
  const right = predicted.toLowerCase();
  if (left === right) return true;

  const goldQty = parseQuantity(gold);
  const predQty = parseQuantity(predicted);
  if (goldQty && predQty && unitsCompatible(goldQty.unit, predQty.unit)) {
    const scale = Math.max(Math.abs(goldQty.amount), Math.abs(predQty.amount), 1);
    return Math.abs(goldQty.amount - predQty.amount) <= 0.01 * scale + 1e-9;
  }

  return left.replace(/[^\p{L}\p{N}]+/gu, "") === right.replace(/[^\p{L}\p{N}]+/gu, "");
}

export function compareField(goldRaw: unknown, predictedRaw: unknown): FieldComparison["verdict"] {
  const gold = normalizeValue(goldRaw);
  const predicted = normalizeValue(predictedRaw);
  if (gold === null && predicted === null) return "both_empty";
  if (gold === null) return "extra";
  if (predicted === null) return "missing";
  return valuesMatch(gold, predicted) ? "correct" : "wrong";
}

export function scoreRecord(
  id: string,
  schemaId: string,
  predictor: PredictorId,
  gold: Extraction,
  predicted: Extraction | null | undefined,
): RecordScore {
  const keys = schemaFieldKeys(schemaId);
  const fields: FieldComparison[] = keys.map((key) => {
    const verdict = compareField(gold[key], predicted?.[key]);
    return {
      key,
      gold: normalizeValue(gold[key]),
      predicted: normalizeValue(predicted?.[key]),
      verdict,
    };
  });

  const counted = fields.filter((field) => field.verdict !== "both_empty");
  const correct = counted.filter((field) => field.verdict === "correct").length;
  const wrong = counted.filter((field) => field.verdict === "wrong").length;
  const missing = counted.filter((field) => field.verdict === "missing").length;
  const extra = counted.filter((field) => field.verdict === "extra").length;

  return {
    id,
    schemaId,
    predictor,
    fields,
    correct,
    wrong,
    missing,
    extra,
    scored: counted.length,
    accuracy: counted.length === 0 ? 0 : correct / counted.length,
  };
}

export function summarize(scores: RecordScore[], predictor: PredictorId): MetricsSummary {
  const subset = scores.filter((score) => score.predictor === predictor);
  const correct = subset.reduce((sum, score) => sum + score.correct, 0);
  const wrong = subset.reduce((sum, score) => sum + score.wrong, 0);
  const missing = subset.reduce((sum, score) => sum + score.missing, 0);
  const extra = subset.reduce((sum, score) => sum + score.extra, 0);
  const scored = subset.reduce((sum, score) => sum + score.scored, 0);

  const bySchema: MetricsSummary["bySchema"] = {};
  for (const score of subset) {
    const current = bySchema[score.schemaId] ?? { records: 0, accuracy: 0, scored: 0 };
    current.records += 1;
    current.scored += score.scored;
    current.accuracy += score.correct;
    bySchema[score.schemaId] = current;
  }
  for (const schemaId of Object.keys(bySchema)) {
    const row = bySchema[schemaId];
    row.accuracy = row.scored === 0 ? 0 : row.accuracy / row.scored;
  }

  const byField: MetricsSummary["byField"] = {};
  for (const score of subset) {
    for (const field of score.fields) {
      if (field.verdict === "both_empty") continue;
      const current = byField[field.key] ?? { correct: 0, scored: 0, accuracy: 0 };
      current.scored += 1;
      if (field.verdict === "correct") current.correct += 1;
      byField[field.key] = current;
    }
  }
  for (const key of Object.keys(byField)) {
    const row = byField[key];
    row.accuracy = row.scored === 0 ? 0 : row.correct / row.scored;
  }

  return {
    predictor,
    records: subset.length,
    correct,
    wrong,
    missing,
    extra,
    scored,
    accuracy: scored === 0 ? 0 : correct / scored,
    bySchema,
    byField,
  };
}

export function displayMissing(value: string | null): string {
  return value ?? MISSING_TOKEN;
}
