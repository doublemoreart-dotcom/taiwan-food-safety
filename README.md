# 台灣食安管理流程與權責分工

繁體中文互動網站，用來理解食品業者、地方政府、中央食藥署、跨部會與司法體系在台灣食安治理中的流程與責任。

正式網址：<https://dinopeng.com/taiwan-food-safety/>

目前同步版本：`0.1.1`。版本號由 `package.json` 管理，更新流程會與本機單檔版的 `app-version` 交叉檢查。

部署使用 `/taiwan-food-safety/` 子路徑；`next.config.ts` 的 `basePath`、頁面 canonical 與社群分享網址均已對應此路徑。

## 版本界線

這是未來建立 Git 儲存庫與部署使用的原始碼版本，和本機單檔版分開維護：

- Git-ready 版入口由 `app/page.tsx`、`app/globals.css` 等專案檔案組成。
- 本專案不引用 `outputs/taiwan-food-safety-local/index.html`。
- 請只在本目錄執行 `git init`、提交與推送。
- 請勿把本機單檔版、外層 `outputs/` 或 `work/` 目錄複製進本專案。
- 本機版與 Git-ready 版不是建置前後關係；內容與功能變更仍須同步修改，但驗證、共用素材同步與封裝已整合為單一更新指令。

## 建議更新流程

Git-ready 專案是更新作業的控制入口。完成兩個版本的內容或樣式調整後，在本目錄執行：

```bash
npm run release:status
```

這個唯讀指令會顯示目前分支、相對主線的超前／落後狀態、未提交項目、兩版版本號與建議下一步。

確認位於最新 `origin/main` 建立的 `codex/` 分支後，執行：

```bash
npm run release:prepare
```

這個指令會先檢查 Repo、分支與主線基礎，再依序：

1. 執行程式規範檢查。
2. 建置並測試 Git-ready 版。
3. 檢查本機 `index.html` 的結構、必要入口與互動程式語法。
4. 將 Git-ready 版的 favicon 與社群縮圖同步至本機版。
5. 在隔離的候選區建立並驗證本機版、Git-ready 版 ZIP，並排除 `node_modules/`、`out/`、`.next/` 等依賴與建置產物；驗證失敗時保留既有正式檔。
6. 候選檔全部通過後，一次取代本機素材、兩個 ZIP 與 `taiwan-food-safety-release.json`。
7. 更新摘要記錄來源分支、提交、`origin/main`、工作區狀態、檔案大小與 SHA-256，方便追查與回退。

網站分析使用 Google Analytics 代碼 `G-JMBSNGKG9J`；Git-ready 與本機單檔版皆使用相同代碼。

若只想檢查兩個版本、不產生 ZIP：

```bash
npm run check
```

若正式建置已經通過，只想重新檢查本機版、同步素材並更新 ZIP，可執行：

```bash
npm run sync
```

`npm run release:prepare` 或 `npm run sync` 成功後才會取代正式 ZIP。更新完成後，仍建議直接開啟本機版 `index.html`，確認排版與互動是否符合預期。

完成修改並提交後、推送分支之前，執行：

```bash
npm run release:preflight
```

此指令會再次執行完整檢查，並確認目前位於正確的 Git-ready Repo、使用 `codex/` 分支、工作區乾淨、分支包含最新 `origin/main`，且本機版與 Git-ready 版版本一致。完整發布與回退方式請見 [`RELEASE-SAFETY.md`](./RELEASE-SAFETY.md)。

## 本機開發

需求：Node.js 22.13.0 以上。

```bash
npm install
npm run dev
```

開發伺服器啟動後，依終端機顯示的本機網址開啟網站。

## 驗證正式建置

```bash
npm run build
```

## GitHub Pages 部署

`main` 分支更新後，`.github/workflows/deploy-pages.yml` 會執行靜態輸出並部署至 GitHub Pages。

```bash
npm run build:pages
```

靜態輸出位於 `out/`，正式路徑為：

<https://dinopeng.com/taiwan-food-safety/>

Repository 的 **Settings → Pages → Build and deployment → Source** 須設定為 **GitHub Actions**。主網域已由帳號層級的 GitHub Pages 管理，本專案不另放 `CNAME`，避免覆蓋主站網域設定。

## 建立新的 Git 儲存庫

請先確認目前所在位置是解壓後的 Git-ready 專案根目錄，而不是外層工作資料夾或本機單檔版目錄。

```bash
git init -b main
git add .
git commit -m "Initial site"
```

之後再依 GitHub、GitLab 或其他平台提供的指示加入遠端儲存庫並推送。

## 專案位置

- `app/page.tsx`：網站內容與互動
- `app/globals.css`：完整視覺與響應式樣式
- `app/layout.tsx`：頁面標題與語系
- `scripts/update-release.mjs`：更新前檢查、共用素材同步、原子 ZIP 封裝與更新摘要
- `.openai/hosting.json`：Sites 部署能力設定；目前不綁定既有網站

本專案不包含 `node_modules`、建置輸出或既有 Git 紀錄，可安全作為新的儲存庫起點。
