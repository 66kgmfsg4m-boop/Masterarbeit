import { getSchema, isMissingValue } from "../schemas";
import type { DatasheetRecord, Extraction } from "../types";

const FREQUENCY_RANGE =
  /(?:frequency(?:\s+range)?|betrieb[sf]?frequenz|f\s*min.*?f\s*max)[^\d]{0,40}(\d+(?:[.,]\d+)?)\s*(khz|mhz|ghz|hz|thz)[^\d]{0,24}(\d+(?:[.,]\d+)?)\s*(khz|mhz|ghz|hz|thz)/i;

function cleanLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function linesOf(text: string): string[] {
  return text.split(/\n+/).map(cleanLine).filter(Boolean);
}

function nearestNumber(haystack: string, unitHint?: string): string | null {
  const unit = unitHint ? unitHint.replace("/", "\\/") : "[A-Za-zµ/%°]+";
  const regex = new RegExp(
    `([+-]?\\d+(?:[.,]\\d+)?)\\s*(${unit}|nA|uA|µA|mA|A|nV|uV|µV|mV|V|kV|uW|mW|W|Hz|kHz|MHz|GHz|THz|dB|dBm|ns|ps|V/µs|V/us)?`,
    "i",
  );
  const match = haystack.match(regex);
  if (!match) return null;
  const amount = match[1].replace(",", ".");
  const foundUnit = match[2];
  return foundUnit ? `${amount} ${foundUnit}` : amount;
}

function findByAliases(text: string, aliases: string[], unitHint?: string): string | null {
  const lines = linesOf(text);
  const lowered = aliases.map((alias) => alias.toLowerCase());
  for (const line of lines) {
    const hay = line.toLowerCase();
    if (lowered.some((alias) => hay.includes(alias))) {
      const value = nearestNumber(line, unitHint);
      if (value) return value;
      const colon = line.split(/[:]/);
      if (colon.length > 1 && colon[1].trim().length > 1) {
        return colon.slice(1).join(":").trim();
      }
    }
  }
  return null;
}

function extractFrequencyRange(text: string): { min: string; max: string } | null {
  const match = text.replace(/\s+/g, " ").match(FREQUENCY_RANGE);
  if (!match) return null;
  return {
    min: `${match[1].replace(",", ".")} ${match[2]}`,
    max: `${match[3].replace(",", ".")} ${match[4]}`,
  };
}

export function extractLocal(text: string, schemaId: string, partNumber?: string): Extraction {
  const schema = getSchema(schemaId);
  const extraction: Extraction = {};
  if (!schema) return extraction;

  const freq = extractFrequencyRange(text);
  const supplyRange = text
    .replace(/\s+/g, " ")
    .match(/supply voltage[^\d]{0,24}([+-]?\d+(?:[.,]\d+)?)\s*V[^\d]{0,18}([+-]?\d+(?:[.,]\d+)?)\s*V/i);

  for (const field of schema.fields) {
    if (field.key === "PartNumber" && partNumber) {
      extraction[field.key] = partNumber;
      continue;
    }
    if (field.key === "ComponentType") {
      extraction[field.key] = schemaId;
      continue;
    }
    if (field.key === "FMinHz" && freq) {
      extraction[field.key] = freq.min;
      continue;
    }
    if (field.key === "FMaxHz" && freq) {
      extraction[field.key] = freq.max;
      continue;
    }
    if (field.key === "VsMinV" && supplyRange) {
      extraction[field.key] = `${supplyRange[1].replace(",", ".")} V`;
      continue;
    }
    if (field.key === "VsMaxV" && supplyRange) {
      extraction[field.key] = `${supplyRange[2].replace(",", ".")} V`;
      continue;
    }
    if (field.key === "ComponentCategory") {
      extraction[field.key] = schemaId;
      continue;
    }

    const found = findByAliases(text, field.aliases, field.unitHint);
    extraction[field.key] = found ?? "nicht gefunden";
  }

  extraction._PropertySchemaUsed = schemaId;
  return extraction;
}

export function extractWithFewShot(
  text: string,
  schemaId: string,
  partNumber: string,
  examples: DatasheetRecord[],
): Extraction {
  const base = extractLocal(text, schemaId, partNumber);
  const sameSchema = examples.filter(
    (example) => example.schemaId === schemaId && example.goldStatus === "reviewed",
  );
  if (sameSchema.length === 0) return base;

  for (const [key, value] of Object.entries(base)) {
    if (!isMissingValue(value)) continue;
    const donor = sameSchema.find((example) => !isMissingValue(example.gold[key]) && key === "Manufacturer");
    if (donor && /analog devices|infineon|qorvo|nxp|ti|texas instruments/i.test(text)) {
      const maker = text.match(/analog devices|infineon|qorvo|nxp|texas instruments|analog devices/i);
      if (maker) base[key] = maker[0];
    }
  }
  return base;
}
