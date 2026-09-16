import { mkdir, readdir, readFile, rm, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { SCHEMAS } from "./schemas";
import type { DatasheetRecord, Settings, Split } from "./types";

const ROOT = path.join(process.cwd(), "data");
export const RECORDS_DIR = path.join(ROOT, "records");
const SETTINGS_PATH = path.join(ROOT, "settings.json");

const DEFAULT_SETTINGS: Settings = {
  azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT ?? "",
  azureApiKey: process.env.AZURE_OPENAI_API_KEY ?? "",
  azureDeployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? "",
  azureApiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21",
  ollamaUrl: process.env.OLLAMA_URL ?? "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "qwen2.5:14b",
};

export function sanitizeId(value: string): string {
  const cleaned = value.replace(/\.(pdf|json)$/i, "").trim();
  const id = cleaned.replace(/[^A-Za-z0-9._-]+/g, "_");
  if (!id) throw new Error("Leere Materialnummer");
  return id;
}

async function ensureDirs() {
  await mkdir(RECORDS_DIR, { recursive: true });
}

function recordDir(id: string) {
  return path.join(RECORDS_DIR, id);
}

function metaPath(id: string) {
  return path.join(recordDir(id), "record.json");
}

export function pdfPath(id: string) {
  return path.join(recordDir(id), "datasheet.pdf");
}

export async function readSettings(): Promise<Settings> {
  await ensureDirs();
  try {
    const raw = await readFile(SETTINGS_PATH, "utf8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function writeSettings(settings: Settings): Promise<Settings> {
  await ensureDirs();
  await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}

export async function listRecords(): Promise<DatasheetRecord[]> {
  await ensureDirs();
  const ids = await readdir(RECORDS_DIR);
  const records: DatasheetRecord[] = [];
  for (const id of ids) {
    try {
      records.push(await getRecord(id));
    } catch {
      // skip incomplete folders
    }
  }
  return records.sort((a, b) => a.partNumber.localeCompare(b.partNumber));
}

export async function getRecord(id: string): Promise<DatasheetRecord> {
  const raw = await readFile(metaPath(id), "utf8");
  const record = JSON.parse(raw) as DatasheetRecord;
  try {
    await access(pdfPath(id));
    record.hasPdf = true;
  } catch {
    record.hasPdf = false;
  }
  return record;
}

export async function saveRecord(record: DatasheetRecord): Promise<DatasheetRecord> {
  await mkdir(recordDir(record.id), { recursive: true });
  const next: DatasheetRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(metaPath(record.id), JSON.stringify(next, null, 2), "utf8");
  return next;
}

export async function deleteRecord(id: string): Promise<void> {
  await rm(recordDir(id), { recursive: true, force: true });
}

export async function savePdf(id: string, buffer: Buffer, filename: string): Promise<void> {
  await mkdir(recordDir(id), { recursive: true });
  await writeFile(pdfPath(id), buffer);
  const record = await getRecord(id);
  record.hasPdf = true;
  record.sourcePdfName = filename;
  await saveRecord(record);
}

export async function readPdf(id: string): Promise<Buffer> {
  return readFile(pdfPath(id));
}

export async function recordExists(id: string): Promise<boolean> {
  try {
    await access(metaPath(id));
    return true;
  } catch {
    return false;
  }
}

export function knownSchema(schemaId: string): boolean {
  return SCHEMAS.some((schema) => schema.id === schemaId);
}

export async function assignSplits(seed = 42): Promise<DatasheetRecord[]> {
  const records = await listRecords();
  const bySchema = new Map<string, DatasheetRecord[]>();
  for (const record of records) {
    const list = bySchema.get(record.schemaId) ?? [];
    list.push(record);
    bySchema.set(record.schemaId, list);
  }

  let rng = seed;
  const nextRand = () => {
    rng = (rng * 1664525 + 1013904223) % 2 ** 32;
    return rng / 2 ** 32;
  };

  const updated: DatasheetRecord[] = [];
  for (const group of bySchema.values()) {
    const shuffled = [...group].sort(() => nextRand() - 0.5);
    const n = shuffled.length;
    const nTest = n >= 5 ? Math.max(1, Math.round(n * 0.2)) : n >= 3 ? 1 : 0;
    const nVal = n >= 5 ? Math.max(1, Math.round(n * 0.15)) : 0;
    shuffled.forEach((record, index) => {
      let split: Split | null = "train";
      if (index < nTest) split = "test";
      else if (index < nTest + nVal) split = "val";
      record.split = split;
      updated.push(record);
    });
  }

  for (const record of updated) {
    await saveRecord(record);
  }
  return listRecords();
}

export function createBlankRecord(
  id: string,
  schemaId: string,
  gold: DatasheetRecord["gold"],
  app: DatasheetRecord["app"] = null,
): DatasheetRecord {
  const now = new Date().toISOString();
  return {
    id,
    partNumber: id,
    schemaId,
    split: null,
    goldStatus: "draft",
    gold,
    app,
    predictions: {},
    text: "",
    hasPdf: false,
    sourcePdfName: null,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}
