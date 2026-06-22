export type LanguageId = "zh-TW" | "zh-CN" | "en" | "ja";

export type TranslationKey =
  | "appTitle"
  | "appDescription"
  | "workspaceLabel"
  | "eyebrow"
  | "heading"
  | "accentColorLabel"
  | "themeBlue"
  | "themeViolet"
  | "themeRose"
  | "themeAmber"
  | "themeGreen"
  | "engineHealthLabel"
  | "defaultInputSummary"
  | "fileTypeError"
  | "submitError"
  | "pollingError"
  | "dropTitle"
  | "engineLabel"
  | "scaleLabel"
  | "denoiseLabel"
  | "outputFormatLabel"
  | "realesrganEngine"
  | "waifu2xEngine"
  | "denoiseOff"
  | "denoiseLow"
  | "denoiseMedium"
  | "denoiseHigh"
  | "outputPreserve"
  | "engineMissing"
  | "aiEngineWarning"
  | "startButton"
  | "resetTitle"
  | "originalPane"
  | "resultPane"
  | "originalEmpty"
  | "resultEmpty"
  | "downloadLink"
  | "progressSucceeded"
  | "progressFailed"
  | "progressQueued"
  | "progressRunning";

export type Translation = Record<TranslationKey, string>;

export const languageOptions: Array<{ value: LanguageId; label: string }> = [
  { value: "zh-TW", label: "繁體中文" },
  { value: "zh-CN", label: "简体中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" }
];

export const translations = {
  en: {
    appTitle: "Photo Picture Upscaler",
    appDescription: "Local image upscaling and denoising tool",
    workspaceLabel: "Image upscaling tool",
    eyebrow: "Local upscaling",
    heading: "Image Upscaling & Denoising",
    accentColorLabel: "Accent color",
    themeBlue: "Blue",
    themeViolet: "Violet",
    themeRose: "Rose",
    themeAmber: "Amber",
    themeGreen: "Green",
    engineHealthLabel: "Engine status",
    defaultInputSummary: "PNG, JPG and WebP supported. Single file must be under 80MB.",
    fileTypeError: "PNG, JPG and WebP images are supported.",
    submitError: "Failed to create job.",
    pollingError: "Failed to read job status.",
    dropTitle: "Drop an image here or click to choose",
    engineLabel: "Processing engine",
    scaleLabel: "Scale",
    denoiseLabel: "Denoise",
    outputFormatLabel: "Output format",
    realesrganEngine: "Real-ESRGAN",
    waifu2xEngine: "Waifu2x",
    denoiseOff: "Off",
    denoiseLow: "Low",
    denoiseMedium: "Medium",
    denoiseHigh: "High",
    outputPreserve: "Preserve original",
    engineMissing: "The selected engine is not installed. Restart the development server to download it automatically, or run npm run engines:install.",
    aiEngineWarning: "AI engines may redraw details, especially text, tables and posters.",
    startButton: "Start processing",
    resetTitle: "Choose another image",
    originalPane: "Original",
    resultPane: "Result",
    originalEmpty: "Choose an image to preview the original.",
    resultEmpty: "The upscaled result will appear after processing.",
    downloadLink: "Download upscaled image",
    progressSucceeded: "Processing complete",
    progressFailed: "Processing failed",
    progressQueued: "Job queued",
    progressRunning: "Upscaling in progress"
  },
  "zh-CN": {
    appTitle: "Photo Picture Upscaler",
    appDescription: "Local image upscaling and denoising tool",
    workspaceLabel: "图片高清化工具",
    eyebrow: "本地高清化",
    heading: "图片放大与降噪",
    accentColorLabel: "主色调",
    themeBlue: "蓝色",
    themeViolet: "紫色",
    themeRose: "玫瑰",
    themeAmber: "金色",
    themeGreen: "绿色",
    engineHealthLabel: "引擎安装状态",
    defaultInputSummary: "支持 PNG、JPG、WebP，单张不超过 80MB。",
    fileTypeError: "目前支持 PNG、JPG 和 WebP 图片。",
    submitError: "创建任务失败。",
    pollingError: "任务状态读取失败。",
    dropTitle: "拖入图片或点击选择",
    engineLabel: "处理引擎",
    scaleLabel: "放大倍率",
    denoiseLabel: "降噪",
    outputFormatLabel: "输出格式",
    realesrganEngine: "Real-ESRGAN",
    waifu2xEngine: "Waifu2x",
    denoiseOff: "关闭",
    denoiseLow: "轻度",
    denoiseMedium: "中度",
    denoiseHigh: "强",
    outputPreserve: "保留原格式",
    engineMissing: "当前引擎未安装。重新运行开发服务会自动下载，或运行 npm run engines:install。",
    aiEngineWarning: "AI 引擎可能重绘细节，尤其是文字、表格和海报。",
    startButton: "开始处理",
    resetTitle: "重新选择",
    originalPane: "原图",
    resultPane: "结果",
    originalEmpty: "选择图片后会显示原图预览",
    resultEmpty: "处理完成后会显示高清结果",
    downloadLink: "下载高清图片",
    progressSucceeded: "处理完成",
    progressFailed: "处理失败",
    progressQueued: "任务排队中",
    progressRunning: "正在高清化"
  },
  "zh-TW": {
    appTitle: "Photo Picture Upscaler",
    appDescription: "Local image upscaling and denoising tool",
    workspaceLabel: "圖片高清化工具",
    eyebrow: "本地高清化",
    heading: "圖片放大與降噪",
    accentColorLabel: "主色調",
    themeBlue: "藍色",
    themeViolet: "紫色",
    themeRose: "玫瑰",
    themeAmber: "金色",
    themeGreen: "綠色",
    engineHealthLabel: "引擎安裝狀態",
    defaultInputSummary: "支援 PNG、JPG、WebP，單張不超過 80MB。",
    fileTypeError: "目前支援 PNG、JPG 和 WebP 圖片。",
    submitError: "建立任務失敗。",
    pollingError: "任務狀態讀取失敗。",
    dropTitle: "拖入圖片或點選選擇",
    engineLabel: "處理引擎",
    scaleLabel: "放大倍率",
    denoiseLabel: "降噪",
    outputFormatLabel: "輸出格式",
    realesrganEngine: "Real-ESRGAN",
    waifu2xEngine: "Waifu2x",
    denoiseOff: "關閉",
    denoiseLow: "輕度",
    denoiseMedium: "中度",
    denoiseHigh: "強",
    outputPreserve: "保留原格式",
    engineMissing: "目前引擎未安裝。重新執行開發服務會自動下載，或執行 npm run engines:install。",
    aiEngineWarning: "AI 引擎可能重繪細節，尤其是文字、表格和海報。",
    startButton: "開始處理",
    resetTitle: "重新選擇",
    originalPane: "原圖",
    resultPane: "結果",
    originalEmpty: "選擇圖片後會顯示原圖預覽",
    resultEmpty: "處理完成後會顯示高清結果",
    downloadLink: "下載高清圖片",
    progressSucceeded: "處理完成",
    progressFailed: "處理失敗",
    progressQueued: "任務排隊中",
    progressRunning: "正在高清化"
  },
  ja: {
    appTitle: "Photo Picture Upscaler",
    appDescription: "Local image upscaling and denoising tool",
    workspaceLabel: "画像高解像度ツール",
    eyebrow: "ローカル高解像度化",
    heading: "画像の拡大とノイズ低減",
    accentColorLabel: "アクセントカラー",
    themeBlue: "青",
    themeViolet: "紫",
    themeRose: "ローズ",
    themeAmber: "アンバー",
    themeGreen: "緑",
    engineHealthLabel: "エンジン状態",
    defaultInputSummary: "PNG、JPG、WebP に対応。1ファイル80MB以下。",
    fileTypeError: "PNG、JPG、WebP 画像に対応しています。",
    submitError: "ジョブの作成に失敗しました。",
    pollingError: "ジョブ状態の取得に失敗しました。",
    dropTitle: "画像をドロップするかクリックして選択",
    engineLabel: "処理エンジン",
    scaleLabel: "拡大倍率",
    denoiseLabel: "ノイズ低減",
    outputFormatLabel: "出力形式",
    realesrganEngine: "Real-ESRGAN",
    waifu2xEngine: "Waifu2x",
    denoiseOff: "オフ",
    denoiseLow: "低",
    denoiseMedium: "中",
    denoiseHigh: "高",
    outputPreserve: "元の形式を維持",
    engineMissing: "選択中のエンジンがインストールされていません。開発サーバーを再起動すると自動でダウンロードされます。または npm run engines:install を実行してください。",
    aiEngineWarning: "AI エンジンは細部を描き直す場合があります。特に文字、表、ポスターではご注意ください。",
    startButton: "処理を開始",
    resetTitle: "別の画像を選択",
    originalPane: "元画像",
    resultPane: "結果",
    originalEmpty: "画像を選択すると元画像のプレビューが表示されます。",
    resultEmpty: "処理が完了すると高解像度の結果が表示されます。",
    downloadLink: "高解像度の画像をダウンロード",
    progressSucceeded: "処理完了",
    progressFailed: "処理に失敗しました",
    progressQueued: "ジョブ待機中",
    progressRunning: "高解像度化中"
  }
} as const satisfies Record<LanguageId, Translation>;

export function resolveLanguageId(language: string | undefined): LanguageId {
  const normalized = language?.replace("_", "-").toLowerCase() ?? "";

  if (normalized.startsWith("zh-tw") || normalized.startsWith("zh-hk") || normalized.startsWith("zh-mo") || normalized.startsWith("zh-hant")) {
    return "zh-TW";
  }

  if (normalized.startsWith("zh-cn") || normalized.startsWith("zh-sg") || normalized.startsWith("zh-hans")) {
    return "zh-CN";
  }

  if (normalized.startsWith("ja")) {
    return "ja";
  }

  return "en";
}

export function getStoredLanguage(): LanguageId | null {
  if (typeof localStorage === "undefined") return null;

  const stored = localStorage.getItem("photo-picture-language");
  return isLanguageId(stored) ? stored : null;
}

export function setStoredLanguage(language: LanguageId) {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem("photo-picture-language", language);
}

export function resolveStoredOrBrowserLanguage(): LanguageId {
  return getStoredLanguage() ?? resolveLanguageId(typeof navigator === "undefined" ? undefined : navigator.language);
}

export function t(language: LanguageId, key: TranslationKey) {
  return translations[language][key];
}

function isLanguageId(value: string | null): value is LanguageId {
  return value === "zh-TW" || value === "zh-CN" || value === "en" || value === "ja";
}
