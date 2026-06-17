# Photo Picture Upscaler

一個本地圖片高清化和放大工具。它在瀏覽器裏運行介面，但圖片處理發生在你的電腦本機，不會上傳到雲端。

## 功能

- 拖拽或選擇圖片上傳
- 原圖和結果圖並排預覽
- 支持 Real-ESRGAN 和 Waifu2x 本地引擎
- 支持 2x、3x、4x 放大倍率
- 支持關閉、輕度、中度、強降噪
- 支持保留原格式、PNG、JPG 輸出
- 自動下載 Windows Vulkan 版處理引擎

## 使用

```bash
npm install
npm run dev
```

第一次運行 `npm run dev` 會自動下載處理引擎到 `engines/` 目錄。下載完成後打開：

```text
http://localhost:3000
```

如果只想檢查引擎是否存在：

```bash
npm run engines:check
```

如果想重新安裝引擎：

```bash
npm run engines:install
```

## 本地目錄

- `engines/`：本地超分引擎，不提交到代碼倉庫
- `storage/jobs/`：上傳圖片和輸出結果，不提交到代碼倉庫

## 說明

Real-ESRGAN 更適合通用圖片、照片和 AI 生圖。Waifu2x 更適合插畫、二次元圖片和輕量降噪。
