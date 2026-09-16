import { NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/lib/store";
import type { Settings } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json({
    settings: {
      ...settings,
      azureApiKey: settings.azureApiKey ? "••••••••" : "",
      hasAzureKey: Boolean(settings.azureApiKey),
    },
  });
}

export async function PUT(request: Request) {
  const incoming = (await request.json()) as Partial<Settings> & { azureApiKey?: string };
  const current = await readSettings();
  const azureApiKey =
    !incoming.azureApiKey || incoming.azureApiKey.includes("•")
      ? current.azureApiKey
      : incoming.azureApiKey;
  const settings = await writeSettings({
    azureEndpoint: incoming.azureEndpoint ?? current.azureEndpoint,
    azureApiKey,
    azureDeployment: incoming.azureDeployment ?? current.azureDeployment,
    azureApiVersion: incoming.azureApiVersion ?? current.azureApiVersion,
    ollamaUrl: incoming.ollamaUrl ?? current.ollamaUrl,
    ollamaModel: incoming.ollamaModel ?? current.ollamaModel,
  });
  return NextResponse.json({
    settings: { ...settings, azureApiKey: settings.azureApiKey ? "••••••••" : "" },
  });
}
