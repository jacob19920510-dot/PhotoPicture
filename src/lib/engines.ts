import { existsSync } from "node:fs";
import path from "node:path";
import type { DenoiseLevel, EngineId, JobSettings } from "./types";

const rootDir = process.cwd();
const enginesDir = path.join(rootDir, "engines");

export interface EngineConfig {
  id: Exclude<EngineId, "faithful">;
  label: string;
  executable: string;
  homepage: string;
}

export const engineConfigs: Record<Exclude<EngineId, "faithful">, EngineConfig> = {
  realesrgan: {
    id: "realesrgan",
    label: "Real-ESRGAN",
    executable: path.join(
      enginesDir,
      "realesrgan-ncnn-vulkan",
      "realesrgan-ncnn-vulkan.exe"
    ),
    homepage: "https://github.com/xinntao/Real-ESRGAN"
  },
  waifu2x: {
    id: "waifu2x",
    label: "Waifu2x",
    executable: path.join(
      enginesDir,
      "waifu2x-ncnn-vulkan",
      "waifu2x-ncnn-vulkan.exe"
    ),
    homepage: "https://github.com/nihui/waifu2x-ncnn-vulkan"
  }
};

export function getEngineStatus() {
  return [
    {
      id: "faithful" as const,
      label: "保真高清",
      installed: true,
      executable: "built-in",
      homepage: ""
    },
    ...Object.values(engineConfigs).map((engine) => ({
      id: engine.id,
      label: engine.label,
      installed: existsSync(engine.executable),
      executable: engine.executable,
      homepage: engine.homepage
    }))
  ];
}

export function getEngineCommand(settings: JobSettings, inputPath: string, outputPath: string) {
  if (settings.engine === "faithful") {
    throw new Error("The faithful engine is built in and does not use an external command.");
  }

  const engine = engineConfigs[settings.engine];

  if (!existsSync(engine.executable)) {
    throw new Error(
      `${engine.label} engine is not installed. Run npm run engines:install, or restart the dev server and wait for automatic install.`
    );
  }

  if (settings.engine === "realesrgan") {
    // The x4plus models only produce valid output at their native 4x scale in
    // this ncnn build. jobs.ts resizes that output to the user's selected scale.
    const modelScale =
      settings.realesrganModel === "realesr-animevideov3" ? settings.scale : 4;

    return {
      executable: engine.executable,
      args: [
        "-i",
        inputPath,
        "-o",
        outputPath,
        "-n",
        settings.realesrganModel,
        "-s",
        String(modelScale),
        "-t",
        "256",
        "-f",
        outputPath.toLowerCase().endsWith(".jpg") ? "jpg" : "png"
      ]
    };
  }

  const requestedScale = settings.scale === 3 ? 4 : settings.scale;
  return {
    executable: engine.executable,
    args: [
      "-i",
      inputPath,
      "-o",
      outputPath,
      "-n",
      String(toWaifuNoise(settings.denoise)),
      "-s",
      String(requestedScale),
      "-f",
      outputPath.toLowerCase().endsWith(".jpg") ? "jpg" : "png"
    ]
  };
}

function toWaifuNoise(level: DenoiseLevel) {
  switch (level) {
    case "off":
      return -1;
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
  }
}
