# Photo Picture Upscaler

一个本地图片高清化和放大工具。它在浏览器里运行界面，但图片处理发生在你的电脑本机，不会上传到云端。

## 功能

- 拖拽或选择图片上传
- 原图和结果图并排预览
- 支持 Real-ESRGAN 和 Waifu2x 本地引擎
- 支持 2x、3x、4x 放大倍率
- 支持关闭、轻度、中度、强降噪
- 支持保留原格式、PNG、JPG 输出
- 自动下载 Windows Vulkan 版处理引擎

## 使用

```bash
npm install
npm run dev
```

第一次运行 `npm run dev` 会自动下载处理引擎到 `engines/` 目录。下载完成后打开：

```text
http://localhost:3000
```

如果只想检查引擎是否存在：

```bash
npm run engines:check
```

如果想重新安装引擎：

```bash
npm run engines:install
```

## 本地目录

- `engines/`：本地超分引擎，不提交到代码仓库
- `storage/jobs/`：上传图片和输出结果，不提交到代码仓库

## 说明

Real-ESRGAN 更适合通用图片、照片和 AI 生图。Waifu2x 更适合插画、二次元图片和轻量降噪。
