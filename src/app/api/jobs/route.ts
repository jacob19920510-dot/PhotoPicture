import { NextResponse } from "next/server";
import { createJob } from "@/lib/jobs";
import type { DenoiseLevel, EngineId, OutputFormat, ScaleFactor } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please choose an image." }, { status: 400 });
    }

    const settings = {
      engine: parseEngine(formData.get("engine")),
      scale: parseScale(formData.get("scale")),
      denoise: parseDenoise(formData.get("denoise")),
      outputFormat: parseOutputFormat(formData.get("outputFormat"))
    };

    const job = await createJob(file, settings);
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create the job." },
      { status: 400 }
    );
  }
}

function parseEngine(value: FormDataEntryValue | null): EngineId {
  if (value === "faithful") return "faithful";
  return value === "waifu2x" ? "waifu2x" : "realesrgan";
}

function parseScale(value: FormDataEntryValue | null): ScaleFactor {
  const numeric = Number(value);
  return numeric === 3 || numeric === 4 ? numeric : 2;
}

function parseDenoise(value: FormDataEntryValue | null): DenoiseLevel {
  if (value === "off" || value === "low" || value === "high") return value;
  return "medium";
}

function parseOutputFormat(value: FormDataEntryValue | null): OutputFormat {
  if (value === "png" || value === "jpg") return value;
  return "preserve";
}
