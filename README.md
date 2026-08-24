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
- 本機版與 Git-ready 版不是建置前後關係；內容與功能變更仍須同步修改，但驗證、共用素材同步與封裝已整合為同一套安全更新流程。

## 建議更新流程

Git-ready 專案是更新作業的控制入口。完成兩個版本的內容或樣式調整後，在本目錄執行：

```bash
npm run release:refresh
```

這會從遠端取得最新 `origin/main` 並更新本機 Git metadata，再顯示目前分支、相對主線的超前／落後狀態、尚未進入主線的提交、未提交項目、兩版版本號與建議下一步。此步驟不寫入遠端或產品檔；若舊分支已經透過 squash merge 進入主線，也會要求從最新主線另開分支，避免重複發布。

確認位於最新 `origin/main` 建立的 `codex/` 分支後，執行：

```bash
npm run release:prepare
```

這個指令會先檢查 Repo、分支與主線基礎，再執行規範檢查、清除舊建置輸出、正式建置、Git-ready 測試與本機版驗證。這一階段不建立 ZIP，避免提交前的封裝摘要記錄到舊 commit 或 dirty 工作區，也避免舊 `dist` 掩蓋本次建置失敗。

確認差異後只提交本次修改：

```bash
git diff --check
git status --short
git add <本次更新檔案>
git commit -m "描述本次更新"
```

提交完成後執行：

```bash
npm run release:preflight
```

此指令要求工作區乾淨、分支包含最新主線且確實有尚未進入主線的提交，接著再次完成所有檢查，最後才：

1. 執行程式規範檢查。
2. 建置並測試 Git-ready 版。
3. 檢查本機 `index.html` 的結構、必要入口與互動程式語法。
4. 將 Git-ready 版的 favicon 與社群縮圖同步至本機版。
5. 在隔離的候選區建立並驗證本機版、Git-ready 版 ZIP，並排除 `node_modules/`、`out/`、`.next/` 等依賴與建置產物；驗證失敗時保留既有正式檔。
6. 候選檔全部通過後，一次取代本機素材、兩個 ZIP 與 `taiwan-food-safety-release.json`。
7. 更新摘要記錄已提交的來源分支、commit、`origin/main`、乾淨工作區狀態、檔案大小與 SHA-256，方便追查與回退。

網站分析使用 Google Analytics 代碼 `G-JMBSNGKG9J`；Git-ready 與本機單檔版皆使用相同代碼。

若只想檢查兩個版本、不產生 ZIP：

```bash
npm run check
```

若正式建置已經通過，只想重新檢查本機版、同步素材並更新 ZIP，可執行：

```bash
npm run sync
```

`npm run sync` 與等價的 `npm run package` 是低階封裝命令：兩者都會同步本機素材，並建立或取代兩個 ZIP 與 release manifest。它們不會執行 `release:preflight` 的乾淨工作區與提交檢查，只能在確定要產生封裝時明確執行。

舊的 `npm run update` 保留為向後相容入口，目前等同 `npm run release:prepare`，只驗證、不封裝。只有 `npm run release:preflight`，或有意執行上述低階命令成功後，才會取代候選封裝。更新完成後，仍建議直接開啟本機版 `index.html`，確認排版與互動是否符合預期。

`release:preflight` 全部通過後，才推送功能分支並建立 PR；禁止直接推送或合併 `main`。完整發布與回退方式請見 [`RELEASE-SAFETY.md`](./RELEASE-SAFETY.md)。

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

## 專案位置

- `app/page.tsx`：網站內容與互動
- `app/globals.css`：完整視覺與響應式樣式
- `app/layout.tsx`：頁面標題與語系
- `scripts/update-release.mjs`：更新前檢查、共用素材同步、原子 ZIP 封裝與更新摘要
- `.openai/hosting.json`：Sites 部署能力設定；目前不綁定既有網站

候選 ZIP 會排除 `node_modules`、建置輸出與 `.git`；實際 Git-ready 工作目錄則保留既有 Git 歷史，並只能透過功能分支與 PR 更新。
