import { NextResponse } from "next/server";
import { SCHEMAS } from "@/lib/schemas";

export async function GET() {
  return NextResponse.json({ schemas: SCHEMAS });
}
