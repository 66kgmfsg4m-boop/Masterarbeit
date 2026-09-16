export type Split = "train" | "val" | "test";
export type GoldStatus = "draft" | "reviewed";
export type PredictorId = "app" | "local" | "azure" | "ollama";

export type FieldKind = "string" | "quantity";

export type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  aliases: string[];
  unitHint?: string;
};

export type PropertySchema = {
  id: string;
  label: string;
  description: string;
  fields: FieldDef[];
};

export type Extraction = Record<string, string | number | null>;

export type RecordPredictions = Partial<Record<PredictorId, Extraction>>;

export type DatasheetRecord = {
  id: string;
  partNumber: string;
  schemaId: string;
  split: Split | null;
  goldStatus: GoldStatus;
  gold: Extraction;
  app: Extraction | null;
  predictions: RecordPredictions;
  text: string;
  hasPdf: boolean;
  sourcePdfName: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Settings = {
  azureEndpoint: string;
  azureApiKey: string;
  azureDeployment: string;
  azureApiVersion: string;
  ollamaUrl: string;
  ollamaModel: string;
};

export type FieldVerdict = "correct" | "wrong" | "missing" | "extra" | "both_empty";

export type FieldComparison = {
  key: string;
  gold: string | null;
  predicted: string | null;
  verdict: FieldVerdict;
};

export type RecordScore = {
  id: string;
  schemaId: string;
  predictor: PredictorId;
  fields: FieldComparison[];
  correct: number;
  wrong: number;
  missing: number;
  extra: number;
  scored: number;
  accuracy: number;
};

export type MetricsSummary = {
  predictor: PredictorId;
  records: number;
  correct: number;
  wrong: number;
  missing: number;
  extra: number;
  scored: number;
  accuracy: number;
  bySchema: Record<string, { records: number; accuracy: number; scored: number }>;
  byField: Record<string, { correct: number; scored: number; accuracy: number }>;
};
