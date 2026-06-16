import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";
import { getEngineCommand } from "./engines";
import type { JobSettings, PublicJob } from "./types";

interface JobRecord extends PublicJob {
  inputPath: string;
  outputPath: string;
  workDir: string;
  mimeType: string;
  originalWidth?: number;
  originalHeight?: number;
}

interface JobStore {
  jobs: Map<string, JobRecord>;
}

const globalForJobs = globalThis as typeof globalThis & {
  __photoPictureJobs?: JobStore;
};

const store = globalForJobs.__photoPictureJobs ?? {
  jobs: new Map<string, JobRecord>()
};

globalForJobs.__photoPictureJobs = store;

const storageRoot = path.join(process.cwd(), "storage", "jobs");
const maxInputBytes = 80 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function createJob(file: File, settings: JobSettings) {
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("Only PNG, JPG, and WebP images are supported.");
  }

  if (file.size > maxInputBytes) {
    throw new Error("The image is too large. The current limit is 80MB.");
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const sourceExt = extensionFromMime(file.type);
  const outputExt = resolveOutputExt(settings.outputFormat, sourceExt);
  const workDir = path.join(storageRoot, id);
  const inputPath = path.join(workDir, `input.${sourceExt}`);
  const outputPath = path.join(workDir, `output.${outputExt}`);

  await mkdir(workDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(inputPath, buffer);

  const metadata = await sharp(buffer).metadata();

  const job: JobRecord = {
    id,
    status: "queued",
    progress: 0,
    settings,
    inputName: file.name,
    createdAt,
    updatedAt: createdAt,
    inputPath,
    outputPath,
    workDir,
    mimeType: file.type,
    originalWidth: metadata.width,
    originalHeight: metadata.height
  };

  store.jobs.set(id, job);
  void runJob(id);

  return toPublicJob(job);
}

export function getJob(id: string) {
  const job = store.jobs.get(id);
  return job ? toPublicJob(job) : null;
}

export async function getJobOutput(id: string) {
  const job = store.jobs.get(id);

  if (!job || job.status !== "succeeded") {
    return null;
  }

  const buffer = await readFile(job.outputPath);
  return {
    buffer,
    fileName: buildOutputName(job),
    contentType: contentTypeForPath(job.outputPath)
  };
}

async function runJob(id: string) {
  const job = store.jobs.get(id);
  if (!job) return;

  try {
    patchJob(job, { status: "running", progress: 12 });

    if (job.settings.engine === "faithful") {
      await runFaithfulJob(job);
      patchJob(job, { status: "succeeded", progress: 100 });
      return;
    }

    const command = getEngineCommand(job.settings, job.inputPath, job.outputPath);

    await execute(command.executable, command.args, job.workDir, (progress) => {
      patchJob(job, { progress });
    });

    patchJob(job, { progress: 92 });
    await normalizeOutput(job);
    await stat(job.outputPath);
    patchJob(job, { status: "succeeded", progress: 100 });
  } catch (error) {
    patchJob(job, {
      status: "failed",
      progress: 100,
      error: error instanceof Error ? error.message : "Processing failed. Please try again."
    });
  }
}

async function runFaithfulJob(job: JobRecord) {
  if (!job.originalWidth || !job.originalHeight) {
    throw new Error("Could not read image size.");
  }

  patchJob(job, { progress: 28 });

  const targetWidth = job.originalWidth * job.settings.scale;
  const targetHeight = job.originalHeight * job.settings.scale;
  let pipeline = sharp(job.inputPath, { animated: false })
    .rotate()
    .resize(targetWidth, targetHeight, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false
    });

  if (job.settings.denoise === "high") {
    pipeline = pipeline.blur(0.3);
  }

  patchJob(job, { progress: 62 });

  pipeline = pipeline.sharpen({
    sigma: job.settings.scale >= 3 ? 0.9 : 0.75,
    m1: 0.6,
    m2: 1.8
  });

  if (job.outputPath.endsWith(".jpg")) {
    pipeline = pipeline.flatten({ background: "#ffffff" }).jpeg({ quality: 94, mozjpeg: true });
  } else {
    pipeline = pipeline.png({ compressionLevel: 8, adaptiveFiltering: true });
  }

  await pipeline.toFile(job.outputPath);
  await stat(job.outputPath);
  patchJob(job, { progress: 94 });
}

function execute(
  executable: string,
  args: string[],
  cwd: string,
  onProgress: (progress: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(executable, args, { cwd, windowsHide: true });
    let stderr = "";
    let lastProgress = 18;
    const timer = setInterval(() => {
      lastProgress = Math.min(lastProgress + 7, 88);
      onProgress(lastProgress);
    }, 900);

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearInterval(timer);
      reject(error);
    });

    child.on("close", (code) => {
      clearInterval(timer);
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `The local engine exited with code ${code}`));
    });
  });
}

async function normalizeOutput(job: JobRecord) {
  if (!job.originalWidth || !job.originalHeight) return;

  const targetWidth = job.originalWidth * job.settings.scale;
  const targetHeight = job.originalHeight * job.settings.scale;
  const image = sharp(job.outputPath);
  const metadata = await image.metadata();

  if (metadata.width === targetWidth && metadata.height === targetHeight) {
    return;
  }

  const normalized = await image.resize(targetWidth, targetHeight, { fit: "fill" }).toBuffer();
  await writeFile(job.outputPath, normalized);
}

function patchJob(job: JobRecord, patch: Partial<JobRecord>) {
  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
}

function toPublicJob(job: JobRecord): PublicJob {
  return {
    id: job.id,
    status: job.status,
    progress: job.progress,
    settings: job.settings,
    inputName: job.inputName,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    error: job.error,
    outputUrl: job.status === "succeeded" ? `/api/jobs/${job.id}/output` : undefined
  };
}

function extensionFromMime(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  return "png";
}

function resolveOutputExt(format: JobSettings["outputFormat"], sourceExt: string) {
  if (format === "preserve") {
    return sourceExt === "webp" ? "png" : sourceExt;
  }

  return format;
}

function contentTypeForPath(filePath: string) {
  if (filePath.endsWith(".jpg")) return "image/jpeg";
  return "image/png";
}

function buildOutputName(job: JobRecord) {
  const parsed = path.parse(job.inputName);
  return `${parsed.name || "upscaled"}-${job.settings.engine}-${job.settings.scale}x${path.extname(
    job.outputPath
  )}`;
}
