export type EngineId = "faithful" | "realesrgan" | "waifu2x";
export type ScaleFactor = 2 | 3 | 4;
export type DenoiseLevel = "off" | "low" | "medium" | "high";
export type OutputFormat = "preserve" | "png" | "jpg";

export type JobStatus = "queued" | "running" | "succeeded" | "failed";

export interface JobSettings {
  engine: EngineId;
  scale: ScaleFactor;
  denoise: DenoiseLevel;
  outputFormat: OutputFormat;
}

export interface PublicJob {
  id: string;
  status: JobStatus;
  progress: number;
  settings: JobSettings;
  inputName: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
  outputUrl?: string;
}
