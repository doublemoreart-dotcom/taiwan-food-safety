import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = realpathSync(resolve(scriptDirectory, ".."));
const workspaceDirectory = resolve(projectDirectory, "..");
const expectedRemote = "github.com/doublemoreart-dotcom/taiwan-food-safety";
const mode = process.argv[2] ?? "--publish";
const supportedModes = new Set(["--prepare", "--publish"]);

if (!supportedModes.has(mode)) {
  console.error(`✗ 不支援的發布檢查模式：${mode}`);
  process.exit(1);
}

const git = (...args) =>
  execFileSync("git", args, {
    cwd: projectDirectory,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

const fail = (message) => {
  console.error(`✗ 發布前檢查未通過：${message}`);
  process.exit(1);
};

const repositoryRoot = realpathSync(git("rev-parse", "--show-toplevel"));
if (repositoryRoot !== projectDirectory) {
  fail(`請從 Git-ready 專案執行，目前 Git 根目錄是 ${repositoryRoot}`);
}

const remote = git("remote", "get-url", "origin")
  .replace(/^git@github\.com:/, "https://github.com/")
  .replace(/\.git$/, "");
if (!remote.includes(expectedRemote)) {
  fail(`origin 指向非預期儲存庫：${remote}`);
}

const branch = git("branch", "--show-current");
if (!branch || branch === "main" || branch === "master") {
  fail("不可直接從 main／master 發布，請先建立 codex/ 開頭的發布分支");
}
if (!branch.startsWith("codex/")) {
  fail(`分支名稱必須以 codex/ 開頭，目前是 ${branch}`);
}

const gitDirectory = resolve(projectDirectory, git("rev-parse", "--git-dir"));
for (const marker of ["MERGE_HEAD", "CHERRY_PICK_HEAD", "REVERT_HEAD", "rebase-merge", "rebase-apply"]) {
  if (existsSync(join(gitDirectory, marker))) {
    fail(`偵測到尚未完成的 Git 操作：${marker}`);
  }
}

const status = git("status", "--porcelain");
if (mode === "--publish" && status) {
  fail("工作區仍有未提交內容；請先確認差異並提交，再執行發布前檢查");
}

try {
  git("rev-parse", "--verify", "origin/main");
} catch {
  fail("找不到 origin/main；請先執行 git fetch origin main");
}

try {
  git("merge-base", "--is-ancestor", "origin/main", "HEAD");
} catch {
  fail("目前分支不是建立在最新的 origin/main 上；請先更新或重建乾淨分支");
}

const uniqueCommits = git("cherry", "origin/main", "HEAD")
  .split(/\r?\n/)
  .filter((line) => line.startsWith("+ "));
if (mode === "--publish" && uniqueCommits.length === 0) {
  fail("目前分支沒有尚未進入主線的提交；若先前 PR 已合併，請從最新 origin/main 建立新分支");
}

const localHtmlPath = join(workspaceDirectory, "taiwan-food-safety-local", "index.html");
if (!existsSync(localHtmlPath)) {
  fail(`找不到本機版：${localHtmlPath}`);
}

const projectPackage = JSON.parse(readFileSync(join(projectDirectory, "package.json"), "utf8"));
const localHtml = readFileSync(localHtmlPath, "utf8");
const localVersion = localHtml.match(/<meta\s+name="app-version"\s+content="([^"]+)"/i)?.[1];
if (localVersion !== projectPackage.version) {
  fail(`版本不同步：本機版 ${localVersion ?? "未標示"}，Git-ready 版 ${projectPackage.version}`);
}

const head = git("rev-parse", "--short", "HEAD");
const base = git("rev-parse", "--short", "origin/main");
console.log(`✓ ${mode === "--prepare" ? "更新準備" : "發布前"}安全檢查通過`);
console.log(`  分支：${branch}`);
console.log(`  發布候選：${head}`);
console.log(`  主線基準：${base}`);
console.log(`  版本：${projectPackage.version}`);
if (mode === "--prepare") {
  console.log("  本階段只驗證內容，不建立 ZIP；提交後由 release:preflight 建立可追溯候選封裝");
} else {
  console.log(`  待發布提交：${uniqueCommits.length} 筆`);
}
