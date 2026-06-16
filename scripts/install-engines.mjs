import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { Extract } from "unzipper";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const enginesDir = path.join(rootDir, "engines");
const archivesDir = path.join(enginesDir, "_archives");
const args = new Set(process.argv.slice(2));

const engines = [
  {
    name: "Real-ESRGAN",
    dir: path.join(enginesDir, "realesrgan-ncnn-vulkan"),
    exe: path.join(enginesDir, "realesrgan-ncnn-vulkan", "realesrgan-ncnn-vulkan.exe"),
    archive: path.join(archivesDir, "realesrgan-ncnn-vulkan-windows.zip"),
    url: "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip"
  },
  {
    name: "Waifu2x",
    dir: path.join(enginesDir, "waifu2x-ncnn-vulkan"),
    exe: path.join(enginesDir, "waifu2x-ncnn-vulkan", "waifu2x-ncnn-vulkan.exe"),
    archive: path.join(archivesDir, "waifu2x-ncnn-vulkan-windows.zip"),
    url: "https://github.com/nihui/waifu2x-ncnn-vulkan/releases/download/20220728/waifu2x-ncnn-vulkan-20220728-windows.zip"
  }
];

await main();

async function main() {
  if (args.has("--check")) {
    for (const engine of engines) {
      console.log(`${engine.name}: ${existsSync(engine.exe) ? "installed" : "missing"}`);
    }
    return;
  }

  await mkdir(enginesDir, { recursive: true });
  await mkdir(archivesDir, { recursive: true });

  for (const engine of engines) {
    if (existsSync(engine.exe)) {
      console.log(`${engine.name}: installed`);
      continue;
    }

    if (args.has("--if-missing")) {
      console.log(`${engine.name}: missing, downloading...`);
    }

    await installEngine(engine);
  }
}

async function installEngine(engine) {
  await rm(engine.dir, { recursive: true, force: true });
  await mkdir(engine.dir, { recursive: true });
  await download(engine.url, engine.archive);
  await pipeline(createReadStream(engine.archive), Extract({ path: engine.dir }));
  await flattenIfNested(engine.dir);

  if (!existsSync(engine.exe)) {
    throw new Error(`${engine.name} executable was not found after install: ${engine.exe}`);
  }

  console.log(`${engine.name}: ready`);
}

async function download(url, target) {
  const response = await fetch(url, {
    headers: { "User-Agent": "photo-picture-upscaler" }
  });

  if (!response.ok || !response.body) {
    throw new Error(`Download failed: ${url} (${response.status})`);
  }

  await mkdir(path.dirname(target), { recursive: true });
  await pipeline(response.body, createWriteStream(target));
}

async function flattenIfNested(engineDir) {
  const { readdir, rename } = await import("node:fs/promises");
  const entries = await readdir(engineDir, { withFileTypes: true });
  const nested = entries.find((entry) => entry.isDirectory() && entry.name.includes("ncnn-vulkan"));

  if (!nested) return;

  const nestedDir = path.join(engineDir, nested.name);
  const nestedEntries = await readdir(nestedDir);

  for (const entry of nestedEntries) {
    await rename(path.join(nestedDir, entry), path.join(engineDir, entry));
  }

  await rm(nestedDir, { recursive: true, force: true });
}
