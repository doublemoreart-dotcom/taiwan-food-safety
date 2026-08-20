# 安全發布與回退

## 發布原則

- 本機單檔版只供本機預覽，不直接提交或部署。
- Git-ready 版只能透過功能分支與 Pull Request 進入 `main`。
- 不直接推送 `main`，不使用強制推送，也不以 `reset --hard` 回退正式站。
- 現有工作區若有未提交內容，請先保留；發布時從最新 `origin/main` 建立乾淨分支或 worktree。

## 建議發布流程

```bash
npm run release:refresh
git switch -c codex/描述本次更新 origin/main
```

完成本機版與 Git-ready 版的同步修改後：

```bash
npm run release:status
npm run release:prepare
git diff --check
git status --short
```

確認差異後提交，再執行最後防線：

```bash
git add <本次更新檔案>
git commit -m "描述本次更新"
npm run release:preflight
```

只有 `release:preflight` 通過後，才推送分支並建立 PR。

四個主要更新指令的用途固定如下：

- `release:refresh`：從遠端取得最新 `origin/main`、更新本機 Git metadata 後顯示狀態；不寫入遠端或產品檔。
- `release:status`：不連網，查看版本、分支、主線差距、未提交項目與 squash 合併狀態。
- `release:prepare`：允許工作區有本次修改，但要求分支包含最新 `origin/main`；只做完整驗證，不建立封裝。
- `release:preflight`：提交後的最後防線；要求工作區乾淨且有未進入主線的提交，再次檢查後建立可追溯候選封裝。

舊的 `npm run update` 是 `release:prepare` 的向後相容別名，只驗證、不封裝。`npm run sync` 與等價的 `npm run package` 則是會同步本機素材並建立或取代 ZIP 與 release manifest 的低階命令；它們不含提交後安全檢查，只能在有意產生封裝時使用。

主流程的封裝採「候選區 → 內容驗證 → 一次取代」，並由提交後的 `release:preflight` 建立。若建立、驗證或取代任一步驟失敗，既有 ZIP、摘要與本機素材會保留或自動還原。

## 各階段的停止方式

### 尚未推送

保留或放棄本機分支即可，`main` 與正式站不會改變。

### 已推送、尚未合併

關閉 PR。不要合併，正式站不會改變。

### 已合併、尚未同步入口站

立即對錯誤的合併提交建立 Revert PR。Revert PR 合併前，不手動啟動入口站同步。

### 已同步正式站

1. 在 `taiwan-food-safety` 對錯誤合併提交建立 Revert PR。
2. 合併 Revert PR，確認原始碼 `main` 已恢復。
3. 手動執行 `dinopeng-com` 的 **Sync project sites** 工作流程，或等待整點後第 17 分鐘的自動同步。
4. 開啟正式網址驗證主要畫面、互動與資產版本。

只回退 `dinopeng-com` 的快照並不完整，因為下一次排程仍會從 `taiwan-food-safety/main` 重新產生網站；必須先回退原始碼，再同步入口站。

## 穩定版本標籤

正式站驗證完成後，可在來源 Repo 建立帶註解的標籤：

```bash
git tag -a food-safety-v0.1.1 -m "Taiwan Food Safety 0.1.1 stable"
git push origin food-safety-v0.1.1
```

標籤用來辨識穩定版本；正式回退仍使用 Revert PR，保留完整歷史。
