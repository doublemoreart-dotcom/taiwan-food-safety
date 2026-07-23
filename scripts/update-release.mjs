import {
  copyFileSync,
  existsSync,
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
];

for (const marker of requiredLocalMarkers) {
  if (!localHtml.includes(marker)) throw new Error(`本機版缺少必要標記：${marker}`);
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

copyFileSync(join(projectDirectory, "app", "favicon.ico"), join(localDirectory, "favicon.ico"));
copyFileSync(join(projectDirectory, "app", "opengraph-image.png"), join(localDirectory, "social-preview.png"));

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

runZip(localDirectory, localArchive, commonExclusions);
runZip(projectDirectory, gitArchive, [
  ...commonExclusions,
  "node_modules/*",
  ".vinext/*",
  ".next/*",
  ".wrangler/*",
  "dist/*",
  "coverage/*",
  ".git/*",
]);

verifyZip(localArchive, ["index.html", "README.md", "favicon.ico", "social-preview.png"]);
verifyZip(gitArchive, ["package.json", "package-lock.json", "app/page.tsx", "app/globals.css"], [
  "node_modules/",
  ".vinext/",
  ".next/",
  ".git/",
]);

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const projectPackage = JSON.parse(readFileSync(join(projectDirectory, "package.json"), "utf8"));
const generatedAt = new Date().toISOString();
const manifestPath = join(workspaceDirectory, "taiwan-food-safety-release.json");
const manifest = {
  generatedAt,
  project: projectPackage.name,
  version: projectPackage.version,
  node: process.versions.node,
  artifacts: [
    {
      file: "taiwan-food-safety-local.zip",
      bytes: statSync(localArchive).size,
      sha256: sha256(localArchive),
    },
    {
      file: "taiwan-food-safety-git-ready.zip",
      bytes: statSync(gitArchive).size,
      sha256: sha256(gitArchive),
    },
  ],
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log("✓ favicon 與社群縮圖已同步");
console.log("✓ 本機版與 Git-ready ZIP 已原子更新並驗證");
console.log(`✓ 更新摘要已建立：${manifestPath}`);
