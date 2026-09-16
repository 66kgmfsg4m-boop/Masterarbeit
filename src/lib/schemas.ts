import type { PropertySchema } from "./types";

export const METADATA_KEYS = new Set([
  "_PropertySchemaUsed",
  "_RequestedCategory",
]);

export const SCHEMAS: PropertySchema[] = [
  {
    id: "RF Amplifier",
    label: "RF Amplifier",
    description:
      "Leistungsverstärker und rauscharme RF-Verstärker. Felder folgen dem Materialsystem.",
    fields: [
      { key: "ComponentType", label: "Bauteiltyp", kind: "string", aliases: ["component type", "type"] },
      { key: "PartNumber", label: "Material-/Teilenummer", kind: "string", aliases: ["part number", "order number", "model"] },
      { key: "Manufacturer", label: "Hersteller", kind: "string", aliases: ["manufacturer", "vendor"] },
      { key: "Description", label: "Beschreibung", kind: "string", aliases: ["description", "features"] },
      { key: "Function", label: "Funktion", kind: "string", aliases: ["function", "application"] },
      { key: "PackageType", label: "Gehäuse", kind: "string", aliases: ["package", "package type", "die"] },
      { key: "FMinHz", label: "f min", kind: "quantity", aliases: ["frequency range", "fmin", "operating frequency"], unitHint: "Hz" },
      { key: "FMaxHz", label: "f max", kind: "quantity", aliases: ["frequency range", "fmax"], unitHint: "Hz" },
      { key: "NumberOfPin", label: "Pinzahl", kind: "quantity", aliases: ["pins", "number of pins", "pad"] },
      { key: "Pitch", label: "Pitch", kind: "quantity", aliases: ["pitch", "ball pitch"] },
      { key: "GainTypDb", label: "Gain typ.", kind: "quantity", aliases: ["gain", "small signal gain"], unitHint: "dB" },
      { key: "VsSpecifV", label: "Versorgung", kind: "quantity", aliases: ["supply voltage", "vdd", "vs"], unitHint: "V" },
      { key: "Op1DbDbm", label: "P1dB", kind: "quantity", aliases: ["p1db", "output p1db", "1 db compression"], unitHint: "dBm" },
      { key: "IsupplyMaxA", label: "I supply", kind: "quantity", aliases: ["supply current", "idq", "idd"], unitHint: "A" },
      { key: "Oip3TypDbm", label: "OIP3 typ.", kind: "quantity", aliases: ["oip3", "output ip3", "ip3"], unitHint: "dBm" },
      { key: "PdissW", label: "P diss", kind: "quantity", aliases: ["power dissipation", "pdiss"], unitHint: "W" },
      { key: "NfTypDb", label: "NF typ.", kind: "quantity", aliases: ["noise figure", "nf"], unitHint: "dB" },
      { key: "SpecifiedHz", label: "Spezifiziert bei", kind: "quantity", aliases: ["specified at", "typical at"], unitHint: "Hz" },
      { key: "RfinMaxDbm", label: "RFIN max", kind: "quantity", aliases: ["rf input", "rfin", "absolute maximum"], unitHint: "dBm" },
      { key: "ManufacturerInfo", label: "Hersteller (Info)", kind: "string", aliases: ["manufacturer"] },
      { key: "ComponentCategory", label: "Kategorie", kind: "string", aliases: ["category"] },
    ],
  },
  {
    id: "Operational Amplifier",
    label: "Operational Amplifier",
    description: "Operationsverstärker und Instrumentationsverstärker.",
    fields: [
      { key: "ComponentType", label: "Bauteiltyp", kind: "string", aliases: ["component type"] },
      { key: "PartNumber", label: "Material-/Teilenummer", kind: "string", aliases: ["part number"] },
      { key: "Manufacturer", label: "Hersteller", kind: "string", aliases: ["manufacturer"] },
      { key: "Description", label: "Beschreibung", kind: "string", aliases: ["description"] },
      { key: "PackageType", label: "Gehäuse", kind: "string", aliases: ["package"] },
      { key: "NumberOfPin", label: "Pinzahl", kind: "quantity", aliases: ["pins"] },
      { key: "VsMinV", label: "Vs min", kind: "quantity", aliases: ["supply voltage", "vs"], unitHint: "V" },
      { key: "VsMaxV", label: "Vs max", kind: "quantity", aliases: ["supply voltage", "vs"], unitHint: "V" },
      { key: "IqTypA", label: "Ruhestrom", kind: "quantity", aliases: ["quiescent current", "isupply"], unitHint: "A" },
      { key: "GbwHz", label: "GBW", kind: "quantity", aliases: ["gain bandwidth", "gbw", "unity gain"], unitHint: "Hz" },
      { key: "SlewRateVus", label: "Slew Rate", kind: "quantity", aliases: ["slew rate"], unitHint: "V/µs" },
      { key: "VosTypV", label: "Offset typ.", kind: "quantity", aliases: ["offset voltage", "vos"], unitHint: "V" },
      { key: "IbTypA", label: "Bias Current", kind: "quantity", aliases: ["input bias", "ib"], unitHint: "A" },
      { key: "RailToRail", label: "Rail-to-Rail", kind: "string", aliases: ["rail-to-rail"] },
      { key: "ComponentCategory", label: "Kategorie", kind: "string", aliases: ["category"] },
    ],
  },
  {
    id: "RF Switch",
    label: "RF Switch",
    description: "HF-Schalter (SPDT, SP4T, …).",
    fields: [
      { key: "ComponentType", label: "Bauteiltyp", kind: "string", aliases: ["component type"] },
      { key: "PartNumber", label: "Material-/Teilenummer", kind: "string", aliases: ["part number"] },
      { key: "Manufacturer", label: "Hersteller", kind: "string", aliases: ["manufacturer"] },
      { key: "Description", label: "Beschreibung", kind: "string", aliases: ["description"] },
      { key: "PackageType", label: "Gehäuse", kind: "string", aliases: ["package"] },
      { key: "FMinHz", label: "f min", kind: "quantity", aliases: ["frequency range"], unitHint: "Hz" },
      { key: "FMaxHz", label: "f max", kind: "quantity", aliases: ["frequency range"], unitHint: "Hz" },
      { key: "IlTypDb", label: "Insertion Loss typ.", kind: "quantity", aliases: ["insertion loss"], unitHint: "dB" },
      { key: "IsolationTypDb", label: "Isolation typ.", kind: "quantity", aliases: ["isolation"], unitHint: "dB" },
      { key: "P1dBDbm", label: "P1dB", kind: "quantity", aliases: ["p1db", "input p1db"], unitHint: "dBm" },
      { key: "Ip3Dbm", label: "IP3", kind: "quantity", aliases: ["iip3", "ip3"], unitHint: "dBm" },
      { key: "SwitchingNs", label: "Schaltzeit", kind: "quantity", aliases: ["switching time", "on time"], unitHint: "ns" },
      { key: "Configuration", label: "Konfiguration", kind: "string", aliases: ["configuration", "spdt", "sp4t"] },
      { key: "ComponentCategory", label: "Kategorie", kind: "string", aliases: ["category"] },
    ],
  },
];

export function getSchema(id: string): PropertySchema | undefined {
  return SCHEMAS.find((schema) => schema.id === id);
}

export function schemaIds(): string[] {
  return SCHEMAS.map((schema) => schema.id);
}

export function schemaFieldKeys(schemaId: string): string[] {
  return getSchema(schemaId)?.fields.map((field) => field.key) ?? [];
}

export function isMissingValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  const text = String(value).trim().toLowerCase();
  return (
    text === "" ||
    text === "null" ||
    text === "n/a" ||
    text === "na" ||
    text === "nicht gefunden" ||
    text === "not found" ||
    text === "-"
  );
}

export function emptyExtraction(schemaId: string): Record<string, string | null> {
  const extraction: Record<string, string | null> = {};
  for (const key of schemaFieldKeys(schemaId)) {
    extraction[key] = null;
  }
  extraction.ComponentType = schemaId;
  extraction._PropertySchemaUsed = schemaId;
  return extraction;
}
