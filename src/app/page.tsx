"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ImagePlus,
  Loader2,
  Palette,
  RefreshCcw,
  Sparkles,
  UploadCloud
} from "lucide-react";
import clsx from "clsx";
import type {
  DenoiseLevel,
  EngineId,
  JobSettings,
  OutputFormat,
  PublicJob,
  ScaleFactor
} from "@/lib/types";

interface EngineStatus {
  id: EngineId;
  label: string;
  installed: boolean;
  executable: string;
  homepage: string;
}

type ThemeId = "blue" | "violet" | "rose" | "amber" | "green";

const themeOptions: Array<{ value: ThemeId; label: string }> = [
  { value: "blue", label: "蓝色" },
  { value: "violet", label: "紫色" },
  { value: "rose", label: "玫瑰" },
  { value: "amber", label: "金色" },
  { value: "green", label: "绿色" }
];

const engineLabels: Record<EngineId, string> = {
  faithful: "保真高清",
  realesrgan: "Real-ESRGAN",
  waifu2x: "Waifu2x"
};

const denoiseOptions: Array<{ value: DenoiseLevel; label: string }> = [
  { value: "off", label: "关闭" },
  { value: "low", label: "轻度" },
  { value: "medium", label: "中度" },
  { value: "high", label: "强" }
];

export default function Home() {
  const [theme, setTheme] = useState<ThemeId>("blue");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<JobSettings>({
    engine: "faithful",
    scale: 2,
    denoise: "medium",
    outputFormat: "preserve"
  });
  const [job, setJob] = useState<PublicJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [engines, setEngines] = useState<EngineStatus[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedEngine = engines.find((engine) => engine.id === settings.engine);
  const canSubmit = Boolean(file) && job?.status !== "queued" && job?.status !== "running";
  const isBusy = job?.status === "queued" || job?.status === "running";
  const resultUrl = job?.outputUrl ? `${job.outputUrl}?v=${job.updatedAt}` : null;

  useEffect(() => {
    const storedTheme = localStorage.getItem("photo-picture-theme");
    if (isThemeId(storedTheme)) setTheme(storedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("photo-picture-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch("/api/engines")
      .then((response) => response.json())
      .then((data) => setEngines(data.engines ?? []))
      .catch(() => setEngines([]));
  }, []);

  useEffect(() => {
    if (!job || job.status === "succeeded" || job.status === "failed") return;

    const timer = setInterval(async () => {
      const response = await fetch(`/api/jobs/${job.id}`);
      const data = await response.json();

      if (response.ok) {
        setJob(data.job);
      } else {
        setError(data.error ?? "任务状态读取失败。");
        setJob(null);
      }
    }, 900);

    return () => clearInterval(timer);
  }, [job]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const inputSummary = useMemo(() => {
    if (!file) return "支持 PNG、JPG、WebP，单张不超过 80MB。";
    return `${file.name} · ${formatBytes(file.size)}`;
  }, [file]);

  function pickFile(nextFile: File | null) {
    setError(null);
    setJob(null);

    if (!nextFile) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(nextFile.type)) {
      setError("目前支持 PNG、JPG 和 WebP 图片。");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  async function submit() {
    if (!file) return;

    setError(null);
    setJob(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("engine", settings.engine);
    formData.set("scale", String(settings.scale));
    formData.set("denoise", settings.denoise);
    formData.set("outputFormat", settings.outputFormat);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "创建任务失败。");
      }

      setJob(data.job);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "创建任务失败。");
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    pickFile(event.dataTransfer.files.item(0));
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    pickFile(event.target.files?.item(0) ?? null);
  }

  return (
    <main className="shell" data-theme={theme}>
      <section className="workspace" aria-label="图片高清化工具">
        <header className="topbar">
          <div>
            <div className="eyebrow">
              <Sparkles size={16} />
              本地高清化
            </div>
            <h1>图片放大与降噪</h1>
          </div>
          <div className="topbar-tools">
            <div className="theme-switcher" aria-label="主色调">
              <Palette size={16} />
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={clsx("theme-dot", option.value, theme === option.value && "active")}
                  aria-label={`切换为${option.label}主色调`}
                  title={option.label}
                  onClick={() => setTheme(option.value)}
                />
              ))}
            </div>
            <div className="engine-health" aria-label="引擎安装状态">
              {engines.map((engine) => (
                <span
                  key={engine.id}
                  className={clsx("health-pill", engine.installed ? "ok" : "missing")}
                  title={engine.executable}
                >
                  {engine.installed ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  {engine.label}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="main-grid">
          <aside className="control-panel">
            <button
              className={clsx("drop-zone", isDragging && "dragging")}
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <UploadCloud size={32} />
              <span>拖入图片或点击选择</span>
              <small>{inputSummary}</small>
            </button>
            <input
              ref={inputRef}
              className="visually-hidden"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleInput}
            />

            <div className="field">
              <label>处理引擎</label>
              <div className="segmented three">
                {(["faithful", "realesrgan", "waifu2x"] as EngineId[]).map((engine) => (
                  <button
                    key={engine}
                    type="button"
                    className={settings.engine === engine ? "active" : undefined}
                    onClick={() => setSettings((current) => ({ ...current, engine }))}
                  >
                    {engineLabels[engine]}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>放大倍率</label>
              <div className="segmented three">
                {([2, 3, 4] as ScaleFactor[]).map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    className={settings.scale === scale ? "active" : undefined}
                    onClick={() => setSettings((current) => ({ ...current, scale }))}
                  >
                    {scale}x
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>降噪</label>
              <div className="segmented four">
                {denoiseOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={settings.denoise === option.value ? "active" : undefined}
                    onClick={() =>
                      setSettings((current) => ({ ...current, denoise: option.value }))
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>输出格式</label>
              <select
                value={settings.outputFormat}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    outputFormat: event.target.value as OutputFormat
                  }))
                }
              >
                <option value="preserve">保留原格式</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </div>

            {selectedEngine && !selectedEngine.installed ? (
              <div className="notice warning">
                <AlertCircle size={18} />
                <span>当前引擎未安装。重新运行开发服务会自动下载，或运行 npm run engines:install。</span>
              </div>
            ) : null}

            {settings.engine !== "faithful" ? (
              <div className="notice warning">
                <AlertCircle size={18} />
                <span>AI 引擎可能重绘细节。带文字、表格、海报时建议用保真高清。</span>
              </div>
            ) : null}

            {error ? (
              <div className="notice error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            {job ? <ProgressPanel job={job} /> : null}

            <div className="actions">
              <button className="primary-action" type="button" disabled={!canSubmit} onClick={submit}>
                {isBusy ? <Loader2 className="spin" size={19} /> : <ImagePlus size={19} />}
                开始处理
              </button>
              <button
                className="icon-action"
                type="button"
                title="重新选择"
                onClick={() => {
                  setFile(null);
                  setJob(null);
                  setError(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
              >
                <RefreshCcw size={19} />
              </button>
            </div>
          </aside>

          <section className="preview-grid">
            <ImagePane title="原图" src={previewUrl} empty="选择图片后会显示原图预览" />
            <ImagePane title="结果" src={resultUrl} empty="处理完成后会显示高清结果" />
          </section>
        </div>

        {resultUrl ? (
          <a className="download-bar" href={resultUrl}>
            <Download size={18} />
            下载高清图片
          </a>
        ) : null}
      </section>
    </main>
  );
}

function ImagePane({ title, src, empty }: { title: string; src: string | null; empty: string }) {
  return (
    <article className="image-pane">
      <header>{title}</header>
      <div className="image-stage">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} />
        ) : (
          <span>{empty}</span>
        )}
      </div>
    </article>
  );
}

function ProgressPanel({ job }: { job: PublicJob }) {
  const label =
    job.status === "succeeded"
      ? "处理完成"
      : job.status === "failed"
        ? job.error ?? "处理失败"
        : job.status === "queued"
          ? "任务排队中"
          : "正在高清化";

  return (
    <div className={clsx("progress-panel", job.status)}>
      <div className="progress-header">
        <span>{label}</span>
        <strong>{job.progress}%</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${job.progress}%` }} />
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function isThemeId(value: string | null): value is ThemeId {
  return value === "blue" || value === "violet" || value === "rose" || value === "amber" || value === "green";
}
