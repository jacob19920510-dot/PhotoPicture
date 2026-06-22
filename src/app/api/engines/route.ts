import { NextResponse } from "next/server";
import { getEngineStatus } from "@/lib/engines";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ engines: getEngineStatus() });
}
