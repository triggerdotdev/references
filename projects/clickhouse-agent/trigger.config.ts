import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // Paste your project ref into .env (TRIGGER_PROJECT_REF=proj_...)
  project: process.env.TRIGGER_PROJECT_REF!,
  dirs: ["./src/trigger"],
  maxDuration: 3600,
  runtime: "node-22",
});
