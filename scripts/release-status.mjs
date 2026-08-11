import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = realpathSync(resolve(scriptDirectory, ".."));
const workspaceDirectory = resolve(projectDirectory, "..");

const git = (...args) => {
  try {
    return execFileSync("git", args, {
      cwd: projectDirectory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
};

const branch = git("branch", "--show-current") || "（未偵測）";
const head = git("rev-parse", "--short", "HEAD") || "（無提交）";
const base = git("rev-parse", "--short", "origin/main") || "（尚未取得）";
const [ahead = "?", behind = "?"] = (git("rev-list", "--left-right", "--count", "HEAD...origin/main") || "? ?").split(/\s+/);
const changes = git("status", "--porcelain").split(/\r?\n/).filter(Boolean);

const projectPackage = JSON.parse(readFileSync(join(projectDirectory, "package.json"), "utf8"));
const localHtmlPath = join(workspaceDirectory, "taiwan-food-safety-local", "index.html");
const localHtml = existsSync(localHtmlPath) ? readFileSync(localHtmlPath, "utf8") : "";
const localVersion = localHtml.match(/<meta\s+name="app-version"\s+content="([^"]+)"/i)?.[1] ?? "（未標示）";
const versionMatches = localVersion === projectPackage.version;

console.log("台灣食安網站更新狀態");
console.log(`  分支：${branch}`);
console.log(`  目前提交：${head}`);
console.log(`  origin/main：${base}`);
console.log(`  相對主線：超前 ${ahead}、落後 ${behind}`);
console.log(`  未提交項目：${changes.length}`);
console.log(`  版本：本機 ${localVersion}／Git-ready ${projectPackage.version} ${versionMatches ? "✓" : "✗"}`);

let nextStep = "先取得最新主線：git fetch origin main";
if (base !== "（尚未取得）") {
  if (branch === "main" || branch === "master") {
    nextStep = "從 origin/main 建立 codex/ 開頭的新分支，再開始修改";
  } else if (behind !== "0") {
    nextStep = "目前分支落後主線；請從最新 origin/main 建立乾淨分支並移入本次修改";
  } else if (!versionMatches) {
    nextStep = "先同步本機版與 Git-ready 版版本號";
  } else if (changes.length > 0) {
    nextStep = "完成修改後執行 npm run release:prepare，確認差異並提交";
  } else {
    nextStep = "工作區已乾淨；執行 npm run release:preflight 後才可推送";
  }
}

console.log(`  下一步：${nextStep}`);
