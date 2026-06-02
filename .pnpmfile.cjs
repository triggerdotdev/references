// Local-dev linking, opt-in via the TRIGGER_LINK_DIR env var (see `pnpm run link`).
//
// When set, the @trigger.dev/* packages and the trigger.dev CLI resolve to a
// sibling monorepo build instead of the published versions in package.json.
// Inert by default, so the committed manifests/lockfile always describe published
// mode - nothing to clean up, and `pnpm run unlink` is just a plain install.
//
// NOTE: trigger dev bundles from each package's built dist/, so build the monorepo
// packages (or run their watcher) before linking.

const path = require("node:path");

// package name -> path within the monorepo checkout
const LINKED_PACKAGES = {
  "trigger.dev": "packages/cli-v3",
  "@trigger.dev/sdk": "packages/trigger-sdk",
  "@trigger.dev/build": "packages/build",
};

function relinkDeps(deps, monorepoRoot) {
  if (!deps) return;
  for (const [name, subpath] of Object.entries(LINKED_PACKAGES)) {
    if (deps[name]) {
      deps[name] = `link:${path.resolve(monorepoRoot, subpath)}`;
    }
  }
}

function readPackage(pkg) {
  const linkDir = process.env.TRIGGER_LINK_DIR;
  if (!linkDir) return pkg;

  // process.cwd() is the workspace root during install
  const monorepoRoot = path.resolve(process.cwd(), linkDir);
  relinkDeps(pkg.dependencies, monorepoRoot);
  relinkDeps(pkg.devDependencies, monorepoRoot);
  return pkg;
}

module.exports = { hooks: { readPackage } };
