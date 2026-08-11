import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, "..");
const workspaceDirectory = resolve(projectDirectory, "..");
const localDirectory = join(workspaceDirectory, "taiwan-food-safety-local");
const localHtmlPath = join(localDirectory, "index.html");
const mode = process.argv[2] ?? "--package";
const supportedModes = new Set(["--check", "--package"]);

if (!supportedModes.has(mode)) {
  throw new Error(`不支援的更新模式：${mode}`);
}

const parseVersion = (value) => value.split(".").map(Number);
const [nodeMajor, nodeMinor] = parseVersion(process.versions.node);
if (nodeMajor < 22 || (nodeMajor === 22 && nodeMinor < 13)) {
  throw new Error(`Node.js 版本過舊：${process.versions.node}，需要 22.13.0 以上`);
}

const requiredPaths = [
  localHtmlPath,
  join(localDirectory, "README.md"),
  join(projectDirectory, "app", "page.tsx"),
  join(projectDirectory, "app", "globals.css"),
  join(projectDirectory, "app", "layout.tsx"),
  join(projectDirectory, "app", "favicon.ico"),
  join(projectDirectory, "app", "opengraph-image.png"),
  join(projectDirectory, "package.json"),
  join(projectDirectory, "package-lock.json"),
];

for (const path of requiredPaths) {
  if (!existsSync(path)) throw new Error(`缺少更新流程所需檔案：${path}`);
}

const localHtml = readFileSync(localHtmlPath, "utf8");
const sourcePage = readFileSync(join(projectDirectory, "app", "page.tsx"), "utf8");
const projectPackage = JSON.parse(readFileSync(join(projectDirectory, "package.json"), "utf8"));
const requiredLocalMarkers = [
  "台灣食安治理｜回到首頁",
  "smoothScrollToHash",
  'id="roles"',
  'id="events"',
  'id="incident"',
  'id="chain"',
  'id="check"',
  'rel="icon"',
  'property="og:image"',
  'name="app-version"',
  "G-JMBSNGKG9J",
  'class="hero-copy"',
  'class="hero-title-row"',
  'class="hero-links"',
  'class="primary-link"',
  "直接查看應變流程",
];

for (const marker of requiredLocalMarkers) {
  if (!localHtml.includes(marker)) throw new Error(`本機版缺少必要標記：${marker}`);
}

const sharedHomepageCopy = [
  "台灣食安管理流程與權責分工",
  "先釐清權責，再用重大事件帶入應變、日常監管與處置門檻；最後檢查制度斷點、補齊事實並判讀責任。",
  "先看治理全貌",
  "直接查看應變流程",
];

for (const copy of sharedHomepageCopy) {
  if (!localHtml.includes(copy) || !sourcePage.includes(copy)) {
    throw new Error(`首頁共用文案不同步：${copy}`);
  }
}

const localVersion = localHtml.match(/<meta\s+name="app-version"\s+content="([^"]+)"/i)?.[1];
if (localVersion !== projectPackage.version) {
  throw new Error(`版本不同步：本機版 ${localVersion ?? "未標示"}，Git-ready 版 ${projectPackage.version}`);
}

for (const script of localHtml.match(/<script>([\s\S]*?)<\/script>/g) ?? []) {
  new Function(script.replace(/^<script>|<\/script>$/g, ""));
}

console.log("✓ 更新前檢查通過（版本界線、必要檔案與本機互動語法）");

if (mode === "--check") {
  process.exit(0);
}

const commandExists = (command) => {
  const result = spawnSync(command, ["-v"], { encoding: "utf8" });
  return !result.error && result.status === 0;
};

for (const command of ["zip", "unzip"]) {
  if (!commandExists(command)) throw new Error(`缺少封裝工具：${command}`);
}

const runZip = (cwd, archive, exclusions = []) => {
  const temporaryArchive = archive.replace(/\.zip$/i, ".tmp.zip");
  rmSync(temporaryArchive, { force: true });
  const result = spawnSync("zip", ["-q", "-r", "-X", temporaryArchive, ".", ...exclusions.flatMap((pattern) => ["-x", pattern])], {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    rmSync(temporaryArchive, { force: true });
    throw new Error(result.stderr || `無法建立 ${archive}`);
  }
  renameSync(temporaryArchive, archive);
};

const listZip = (archive) => {
  const result = spawnSync("unzip", ["-Z1", archive], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || `無法驗證 ${archive}`);
  return result.stdout.split(/\r?\n/).filter(Boolean);
};

const verifyZip = (archive, expectedFiles, forbiddenPrefixes = []) => {
  const entries = listZip(archive);
  for (const expected of expectedFiles) {
    if (!entries.includes(expected)) throw new Error(`${archive} 缺少封裝檔案：${expected}`);
  }
  for (const prefix of forbiddenPrefixes) {
    if (entries.some((entry) => entry.startsWith(prefix))) {
      throw new Error(`${archive} 不應包含：${prefix}`);
    }
  }
};

const commonExclusions = [".DS_Store", "*/.DS_Store", "*.log"];
const localArchive = join(workspaceDirectory, "taiwan-food-safety-local.zip");
const gitArchive = join(workspaceDirectory, "taiwan-food-safety-git-ready.zip");
const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const manifestPath = join(workspaceDirectory, "taiwan-food-safety-release.json");
const gitValue = (...args) => {
  const result = spawnSync("git", args, { cwd: projectDirectory, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
};

const replaceAsTransaction = (replacements) => {
  const backups = [];
  const installed = [];

  try {
    for (const { target } of replacements) {
      if (!existsSync(target)) continue;
      const backup = `${target}.previous`;
      rmSync(backup, { force: true, recursive: true });
      renameSync(target, backup);
      backups.push({ target, backup });
    }

    for (const { candidate, target } of replacements) {
      renameSync(candidate, target);
      installed.push(target);
    }

    for (const { backup } of backups) rmSync(backup, { force: true, recursive: true });
  } catch (error) {
    for (const target of installed.reverse()) rmSync(target, { force: true, recursive: true });
    for (const { target, backup } of backups.reverse()) {
      if (existsSync(backup)) renameSync(backup, target);
    }
    throw error;
  }
};

const stagingDirectory = mkdtempSync(join(workspaceDirectory, ".tfs-release-"));

try {
  const stagedLocalDirectory = join(stagingDirectory, "local");
  mkdirSync(stagedLocalDirectory);

  const stagedFavicon = join(stagedLocalDirectory, "favicon.ico");
  const stagedSocialPreview = join(stagedLocalDirectory, "social-preview.png");
  copyFileSync(localHtmlPath, join(stagedLocalDirectory, "index.html"));
  copyFileSync(join(localDirectory, "README.md"), join(stagedLocalDirectory, "README.md"));
  copyFileSync(join(projectDirectory, "app", "favicon.ico"), stagedFavicon);
  copyFileSync(join(projectDirectory, "app", "opengraph-image.png"), stagedSocialPreview);

  const stagedLocalArchive = join(stagingDirectory, "taiwan-food-safety-local.zip");
  const stagedGitArchive = join(stagingDirectory, "taiwan-food-safety-git-ready.zip");
  runZip(stagedLocalDirectory, stagedLocalArchive, commonExclusions);
  runZip(projectDirectory, stagedGitArchive, [
    ...commonExclusions,
    "node_modules/*",
    ".vinext/*",
    ".next/*",
    ".wrangler/*",
    "out/*",
    "dist/*",
    "coverage/*",
    ".git/*",
  ]);

  verifyZip(stagedLocalArchive, ["index.html", "README.md", "favicon.ico", "social-preview.png"]);
  verifyZip(stagedGitArchive, ["package.json", "package-lock.json", "app/page.tsx", "app/globals.css"], [
    "node_modules/",
    ".vinext/",
    ".next/",
    "out/",
    ".git/",
  ]);

  const stagedManifest = join(stagingDirectory, "taiwan-food-safety-release.json");
  const workingTree = gitValue("status", "--porcelain");
  const manifest = {
    generatedAt: new Date().toISOString(),
    project: projectPackage.name,
    version: projectPackage.version,
    node: process.versions.node,
    source: {
      branch: gitValue("branch", "--show-current"),
      commit: gitValue("rev-parse", "HEAD"),
      originMain: gitValue("rev-parse", "origin/main"),
      workingTree: workingTree ? "dirty" : "clean",
    },
    artifacts: [
      {
        file: "taiwan-food-safety-local.zip",
        bytes: statSync(stagedLocalArchive).size,
        sha256: sha256(stagedLocalArchive),
      },
      {
        file: "taiwan-food-safety-git-ready.zip",
        bytes: statSync(stagedGitArchive).size,
        sha256: sha256(stagedGitArchive),
      },
    ],
  };
  writeFileSync(stagedManifest, `${JSON.stringify(manifest, null, 2)}\n`);
  JSON.parse(readFileSync(stagedManifest, "utf8"));

  replaceAsTransaction([
    { candidate: stagedFavicon, target: join(localDirectory, "favicon.ico") },
    { candidate: stagedSocialPreview, target: join(localDirectory, "social-preview.png") },
    { candidate: stagedLocalArchive, target: localArchive },
    { candidate: stagedGitArchive, target: gitArchive },
    { candidate: stagedManifest, target: manifestPath },
  ]);
} finally {
  rmSync(stagingDirectory, { recursive: true, force: true });
}

console.log("✓ favicon 與社群縮圖已同步");
console.log("✓ 所有候選檔驗證通過後，已一次取代本機素材、ZIP 與更新摘要");
console.log(`✓ 更新摘要已建立：${manifestPath}`);
