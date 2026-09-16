import { NextResponse } from "next/server";
import { pdfPath, recordExists } from "@/lib/store";
import { readFile } from "node:fs/promises";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!(await recordExists(id))) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }
  try {
    const buffer = await readFile(pdfPath(id));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${id}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Kein PDF" }, { status: 404 });
  }
}
