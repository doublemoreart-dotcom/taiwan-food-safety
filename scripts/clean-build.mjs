import { realpathSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = realpathSync(resolve(scriptDirectory, ".."));

for (const directory of ["dist", ".vinext", ".next", "out"]) {
  const target = join(projectDirectory, directory);
  if (!target.startsWith(`${projectDirectory}/`)) {
    throw new Error(`拒絕清理專案外路徑：${target}`);
  }
  rmSync(target, { recursive: true, force: true });
}

console.log("✓ 已移除舊建置輸出，後續測試只使用本次產物");
