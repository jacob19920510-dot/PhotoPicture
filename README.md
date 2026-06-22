# Photo Picture Upscaler

一个在本机处理图片放大与降噪的工具。界面在浏览器中运行，图片处理只在本机完成，不会上传到云端。

## 功能

- 支持拖拽或选择 PNG、JPG、WebP 图片。
- 原图与结果图并排预览。
- 支持 2×、3×、4×目标放大倍率。
- 自动下载并使用 Windows Vulkan 版 Real-ESRGAN 与 Waifu2x 本地引擎。
- 支持保留原格式、PNG 或 JPG 输出。

应用仅提供 Real-ESRGAN 与 Waifu2x 两种处理引擎。

### Real-ESRGAN

Real-ESRGAN 可选择以下模型：

- 通用照片：`realesrgan-x4plus`
- 二次元插画：`realesrgan-x4plus-anime`
- 动画或视频帧：`realesr-animevideov3`

Real-ESRGAN 支持 2×、3×、4×目标倍率。当前 ncnn 版本没有独立的降噪参数，因此选择 Real-ESRGAN 时界面不会显示降噪选项。

### Waifu2x

Waifu2x 支持关闭、轻度、中度和强四档降噪，并支持图片放大。

## 输出格式说明

选择“保留原格式”时，PNG 和 JPG 会保留对应格式；WebP 目前会输出为 PNG。

## 使用

```bash
npm install
npm run dev
```

首次运行 `npm run dev` 会自动下载推理引擎到 `engines/` 目录。下载完成后访问：

```text
http://localhost:3000
```

检查引擎是否已安装：

```bash
npm run engines:check
```

重新安装引擎：

```bash
npm run engines:install
```

## 本地目录

- `engines/`：本地推理引擎，不提交到代码仓库。
- `storage/jobs/`：上传图片和输出结果，不提交到代码仓库。
