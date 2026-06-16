import { NextResponse } from "next/server";
import { getJobOutput } from "@/lib/jobs";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const output = await getJobOutput(id);

  if (!output) {
    return NextResponse.json({ error: "结果还没有生成。" }, { status: 404 });
  }

  return new NextResponse(output.buffer, {
    headers: {
      "Content-Type": output.contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(output.fileName)}"`
    }
  });
}
