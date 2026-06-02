// `pnpm run link` - point reference projects at a local trigger.dev monorepo.
//
// The monorepo can live anywhere, so we resolve its path once, persist it to a
// gitignored file (.trigger-monorepo-path), and reuse it on subsequent links.
// The actual rewriting happens in .pnpmfile.cjs, gated on TRIGGER_LINK_DIR which
// we set here - so a plain `pnpm install` (i.e. `pnpm run unlink`) never links.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { stdin, stdout, exit, env } from "node:process";
import { createInterface } from "node:readline/promises";

const CONFIG_FILE = ".trigger-monorepo-path";
const DEFAULT_PATH = "../trigger.dev";

const isMonorepo = (dir) => existsSync(join(dir, "packages", "cli-v3", "package.json"));

async function resolveMonorepoPath() {
  // 1. Previously saved and still valid
  if (existsSync(CONFIG_FILE)) {
    const saved = readFileSync(CONFIG_FILE, "utf8").trim();
    if (saved && isMonorepo(saved)) return saved;
    if (saved) console.log(`Saved monorepo path is no longer valid: ${saved}\n`);
  }

  // 2. Non-interactive (e.g. CI): fall back to the default without prompting
  if (!stdin.isTTY) {
    const abs = resolve(DEFAULT_PATH);
    if (isMonorepo(abs)) return abs;
    console.error(
      `No saved monorepo path and ${abs} is not a trigger.dev monorepo.\n` +
        `Set one with: echo /path/to/trigger.dev > ${CONFIG_FILE}`
    );
    exit(1);
  }

  // 3. Prompt, validate, persist
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    while (true) {
      const input = (await rl.question(`Path to your trigger.dev monorepo [${DEFAULT_PATH}]: `)).trim();
      const abs = resolve(input || DEFAULT_PATH);
      if (isMonorepo(abs)) {
        writeFileSync(CONFIG_FILE, abs + "\n");
        console.log(`\nSaved to ${CONFIG_FILE} (gitignored). Delete it to change.\n`);
        return abs;
      }
      console.log(`  ✗ ${abs} has no packages/cli-v3 - not a trigger.dev monorepo. Try again.\n`);
    }
  } finally {
    rl.close();
  }
}

const monorepoPath = await resolveMonorepoPath();
console.log(`Linking @trigger.dev/* -> ${monorepoPath}\n`);

const result = spawnSync("pnpm", ["install"], {
  stdio: "inherit",
  env: { ...env, TRIGGER_LINK_DIR: monorepoPath },
});
exit(result.status ?? 0);
