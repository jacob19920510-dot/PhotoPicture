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
import { languageOptions, resolveStoredOrBrowserLanguage, setStoredLanguage, translations } from "@/lib/i18n";
import type { LanguageId } from "@/lib/i18n";
import type {
  DenoiseLevel,
  EngineId,
  JobSettings,
  OutputFormat,
  PublicJob,
  RealEsrganModel,
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

const engineOptions: Array<{ value: EngineId; label: keyof (typeof translations)["en"] }> = [
  { value: "realesrgan", label: "realesrganEngine" },
  { value: "waifu2x", label: "waifu2xEngine" }
];

const denoiseOptions: Array<{ value: DenoiseLevel; label: keyof (typeof translations)["en"] }> = [
  { value: "off", label: "denoiseOff" },
  { value: "low", label: "denoiseLow" },
  { value: "medium", label: "denoiseMedium" },
  { value: "high", label: "denoiseHigh" }
];

const realEsrganModelOptions: Array<{ value: RealEsrganModel; label: string }> = [
  { value: "realesrgan-x4plus", label: "通用照片 (realesrgan-x4plus)" },
  { value: "realesrgan-x4plus-anime", label: "二次元插画 (realesrgan-x4plus-anime)" },
  { value: "realesr-animevideov3", label: "动画/视频帧 (realesr-animevideov3)" }
];

export default function Home() {
  const [theme, setTheme] = useState<ThemeId>("blue");
  const [language, setLanguage] = useState<LanguageId>("zh-CN");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<JobSettings>({
    engine: "realesrgan",
    scale: 2,
    denoise: "medium",
    realesrganModel: "realesrgan-x4plus",
    outputFormat: "preserve"
  });
  const [job, setJob] = useState<PublicJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [engines, setEngines] = useState<EngineStatus[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const text = translations[language];
  const themeOptions: Array<{ value: ThemeId; label: string }> = [
    { value: "blue", label: text.themeBlue },
    { value: "violet", label: text.themeViolet },
    { value: "rose", label: text.themeRose },
    { value: "amber", label: text.themeAmber },
    { value: "green", label: text.themeGreen }
  ];

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
    setLanguage(resolveStoredOrBrowserLanguage());
  }, []);

  useEffect(() => {
    setStoredLanguage(language);
    document.documentElement.lang = language === "en" ? "en" : language;
  }, [language]);

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
        setError(data.error ?? text.pollingError);
        setJob(null);
      }
    }, 900);

    return () => clearInterval(timer);
  }, [job, text.pollingError]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const inputSummary = useMemo(() => {
    if (!file) return text.defaultInputSummary;
    return `${file.name} · ${formatBytes(file.size)}`;
  }, [file, text.defaultInputSummary]);

  function pickFile(nextFile: File | null) {
    setError(null);
    setJob(null);

    if (!nextFile) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(nextFile.type)) {
      setError(text.fileTypeError);
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
    formData.set("realesrganModel", settings.realesrganModel);
    formData.set("outputFormat", settings.outputFormat);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? text.submitError);
      }

      setJob(data.job);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : text.submitError);
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
      <section className="workspace" aria-label={text.workspaceLabel}>
        <header className="topbar">
          <div>
            <div className="eyebrow">
              <Sparkles size={16} />
              {text.eyebrow}
            </div>
            <h1>{text.heading}</h1>
          </div>
          <div className="topbar-tools">
            <div className="language-selector">
              <label htmlFor="language-select">Language</label>
              <select
                id="language-select"
                value={language}
                onChange={(event) => setLanguage(event.target.value as LanguageId)}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="theme-switcher" aria-label={text.accentColorLabel}>
              <Palette size={16} />
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={clsx("theme-dot", option.value, theme === option.value && "active")}
                  aria-label={`${text.accentColorLabel}: ${option.label}`}
                  title={option.label}
                  onClick={() => setTheme(option.value)}
                />
              ))}
            </div>
            <div className="engine-health" aria-label={text.engineHealthLabel}>
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
              <span>{text.dropTitle}</span>
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
              <label>{text.engineLabel}</label>
              <div className="segmented two">
                {engineOptions.map((engine) => (
                  <button
                    key={engine.value}
                    type="button"
                    className={settings.engine === engine.value ? "active" : undefined}
                    onClick={() => setSettings((current) => ({ ...current, engine: engine.value }))}
                  >
                    {text[engine.label]}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>{text.scaleLabel}</label>
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

            {settings.engine === "realesrgan" ? (
              <div className="field">
                <label>Real-ESRGAN 模型</label>
                <select
                  value={settings.realesrganModel}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      realesrganModel: event.target.value as RealEsrganModel
                    }))
                  }
                >
                  {realEsrganModelOptions.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="field">
                <label>{text.denoiseLabel}</label>
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
                      {text[option.label]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="field">
              <label>{text.outputFormatLabel}</label>
              <select
                value={settings.outputFormat}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    outputFormat: event.target.value as OutputFormat
                  }))
                }
              >
                <option value="preserve">{text.outputPreserve}</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </div>

            {selectedEngine && !selectedEngine.installed ? (
              <div className="notice warning">
                <AlertCircle size={18} />
                <span>{text.engineMissing}</span>
              </div>
            ) : null}

            <div className="notice warning">
              <AlertCircle size={18} />
              <span>{text.aiEngineWarning}</span>
            </div>

            {error ? (
              <div className="notice error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            {job ? <ProgressPanel job={job} text={text} /> : null}

            <div className="actions">
              <button className="primary-action" type="button" disabled={!canSubmit} onClick={submit}>
                {isBusy ? <Loader2 className="spin" size={19} /> : <ImagePlus size={19} />}
                {text.startButton}
              </button>
              <button
                className="icon-action"
                type="button"
                title={text.resetTitle}
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
            <ImagePane title={text.originalPane} src={previewUrl} empty={text.originalEmpty} />
            <ImagePane title={text.resultPane} src={resultUrl} empty={text.resultEmpty} />
          </section>
        </div>

        {resultUrl ? (
          <a className="download-bar" href={resultUrl}>
            <Download size={18} />
            {text.downloadLink}
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

function ProgressPanel({
  job,
  text
}: {
  job: PublicJob;
  text: (typeof translations)[LanguageId];
}) {
  const label =
    job.status === "succeeded"
      ? text.progressSucceeded
      : job.status === "failed"
        ? job.error ?? text.progressFailed
        : job.status === "queued"
          ? text.progressQueued
          : text.progressRunning;

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
